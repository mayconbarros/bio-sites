import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { put } from '@vercel/blob';

// Load environment variables (.env, .env.local, etc.)
dotenv.config({ override: true });

// -----------------------------------------------------------------------------
// Sanitização de Variáveis de Ambiente para Cloudinary
// Remove prefixos acidentais (ex: CLOUDINARY_URL=cloudinary://...), espaços ou placeholders
// que fazem o SDK do Cloudinary lançar exceções não tratadas durante o boot.
// -----------------------------------------------------------------------------
function sanitizeCloudinaryEnvironment(): { isValid: boolean; url?: string } {
  const raw = process.env.CLOUDINARY_URL;
  if (!raw) {
    const hasKeys = Boolean(
      process.env.CLOUDINARY_CLOUD_NAME && 
      process.env.CLOUDINARY_API_KEY && 
      process.env.CLOUDINARY_API_SECRET
    );
    return { isValid: hasKeys };
  }

  let cleaned = raw.trim();
  // Se o usuário colou a linha inteira incluindo "CLOUDINARY_URL="
  if (cleaned.startsWith('CLOUDINARY_URL=')) {
    cleaned = cleaned.substring('CLOUDINARY_URL='.length).trim();
  }

  // Se o valor for um placeholder como <your_api_key> ou não iniciar com cloudinary://
  const isPlaceholder = cleaned.includes('<your_api_key>') || 
                        cleaned.includes('<your_api_secret>') || 
                        cleaned.includes('<api_key>') || 
                        cleaned.includes('<cloud_name>');

  if (!cleaned.toLowerCase().startsWith('cloudinary://') || isPlaceholder) {
    console.warn('[Cloudinary] AVISO: CLOUDINARY_URL no ambiente contém formato inválido ou placeholders. Desativando provedor Cloudinary até credenciais válidas serem configuradas.');
    delete process.env.CLOUDINARY_URL;
    return { isValid: false };
  }

  process.env.CLOUDINARY_URL = cleaned;
  return { isValid: true, url: cleaned };
}

// Executa sanitização logo após carregar dotenv
const cloudinaryEnvState = sanitizeCloudinaryEnvironment();

let hasCloudinary = cloudinaryEnvState.isValid;
let cloudinaryModule: any = null;

async function getCloudinaryClient() {
  if (cloudinaryModule) return cloudinaryModule;
  if (!hasCloudinary) return null;

  try {
    const mod = await import('cloudinary');
    const client = mod.v2 || (mod as any).default?.v2 || mod;

    if (process.env.CLOUDINARY_URL) {
      client.config({
        cloudinary_url: process.env.CLOUDINARY_URL,
        secure: true,
      });
    } else if (process.env.CLOUDINARY_CLOUD_NAME) {
      client.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
    }

    cloudinaryModule = client;
    console.log('[Cloudinary] Provedor de armazenamento na nuvem Cloudinary ATIVO!');
    return cloudinaryModule;
  } catch (err: any) {
    console.warn('[Cloudinary] Falha ao inicializar SDK do Cloudinary:', err?.message);
    hasCloudinary = false;
    return null;
  }
}

// Inicializa de forma segura em background se configurado
if (hasCloudinary) {
  getCloudinaryClient().catch(() => {});
}

function sanitizeBlobToken(): boolean {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return false;
  if (token.includes('...') || token.includes('<') || token.length < 20) {
    console.warn('[Vercel Blob] AVISO: BLOB_READ_WRITE_TOKEN contém placeholders. Utilizando armazenamento local.');
    return false;
  }
  return true;
}

const hasVercelBlob = sanitizeBlobToken();
if (hasVercelBlob) {
  console.log('[Vercel Blob] Provedor de armazenamento Vercel Blob ATIVO!');
}

if (!hasCloudinary && !hasVercelBlob) {
  console.log('[Storage Nuvem] Armazenamento de mídia operando no diretório local /uploads.');
}

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const isProd = process.env.NODE_ENV === 'production';
// AI Studio requires dev server to bind to port 3000 on host 0.0.0.0
const PORT = 3000;
const DATA_FILE = path.resolve(__dirname, 'src/data/persisted_state.json');
const UPLOADS_DIR = path.resolve(__dirname, 'public/uploads');

// Ensure uploads directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// -----------------------------------------------------------------------------
// Local JSON store helpers (resilient in-memory/disk fallback)
// -----------------------------------------------------------------------------
function readLocalData(): any {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.warn('[Storage Local] Erro ao ler persisted_state.json:', err);
  }
  return {
    biosites: [],
    clients: [],
    services: [],
    professionals: [],
    appointments: [],
    creatorProfile: null,
    agencySettings: null,
  };
}

function writeLocalData(data: any): void {
  try {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    
    // Safety check: do not wipe existing biosites if incoming data has empty biosites
    const existing = readLocalData();
    const merged = { ...existing, ...data };
    if ((!data.biosites || data.biosites.length === 0) && existing.biosites && existing.biosites.length > 0) {
      merged.biosites = existing.biosites;
    }
    fs.writeFileSync(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  } catch (err) {
    console.warn('[Storage Local] Erro ao gravar persisted_state.json:', err);
  }
}

// -----------------------------------------------------------------------------
// Neon PostgreSQL client initialization with Safe Fallback
// -----------------------------------------------------------------------------
const PRIMARY_NEON_DATABASE_URL = 'postgresql://neondb_owner:npg_sX75mqWcQdhr@ep-divine-fire-b4avnxz2-pooler.c-6.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require';

const envDbUrl = process.env.DATABASE_URL;
const isPlaceholderDb = !envDbUrl || 
                        envDbUrl.includes('ep-xyz') || 
                        envDbUrl.includes('<') || 
                        envDbUrl.includes('user:password');

const databaseUrl = (!isPlaceholderDb && envDbUrl) ? envDbUrl : PRIMARY_NEON_DATABASE_URL;

const sql = databaseUrl ? neon(databaseUrl) : null;
let sqlActive = true;

if (databaseUrl) {
  console.log('[Neon] DATABASE_URL detectada! Testando conexão com banco Neon...');
} else {
  console.log('[Neon] DATABASE_URL não configurada. Operando com armazenamento local (persisted_state.json).');
}

async function checkNeonConnection(): Promise<boolean> {
  if (!sql) {
    sqlActive = false;
    return false;
  }
  try {
    await sql`SELECT 1 as ping;`;
    sqlActive = true;
    console.log('[Neon] Conexão com banco Neon validada com sucesso.');
    await initNeonDatabase();
    return true;
  } catch (err: any) {
    console.warn('[Neon] Conexão com Neon indisponível (' + (err?.message || 'erro de autenticação/rede') + '). Operando com fallback local.');
    sqlActive = false;
    return false;
  }
}

// -----------------------------------------------------------------------------
// Database Schema Initialization (Executa CREATE TABLE IF NOT EXISTS automaticamente)
// -----------------------------------------------------------------------------
async function initNeonDatabase() {
  if (!sql || !sqlActive) return;
  try {
    console.log('[Neon] Verificando e criando tabelas se necessário...');
    await sql`
      CREATE TABLE IF NOT EXISTS clients (
        id VARCHAR(255) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50),
        role VARCHAR(50) DEFAULT 'client',
        status VARCHAR(50) DEFAULT 'active',
        assigned_biosite_ids JSONB DEFAULT '[]'::jsonb,
        permissions JSONB DEFAULT '[]'::jsonb,
        must_change_password BOOLEAN DEFAULT false,
        temporary_password VARCHAR(255),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS biosites (
        id VARCHAR(255) PRIMARY KEY,
        agency_id VARCHAR(255) DEFAULT 'agency-1',
        client_user_id VARCHAR(255),
        client_name VARCHAR(255),
        client_email VARCHAR(255),
        client_phone VARCHAR(50),
        slug VARCHAR(255) NOT NULL UNIQUE,
        title VARCHAR(255) NOT NULL,
        subtitle TEXT DEFAULT '',
        description TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT 'manicure',
        avatar_url TEXT DEFAULT '',
        logo_shape VARCHAR(50) DEFAULT 'circle',
        logo_transparent BOOLEAN DEFAULT false,
        cover_type VARCHAR(50) DEFAULT 'image',
        cover_url TEXT DEFAULT '',
        video_url TEXT DEFAULT '',
        cover_gradient TEXT DEFAULT '',
        instagram_handle VARCHAR(100) DEFAULT '',
        theme_config JSONB DEFAULT '{}'::jsonb,
        contact_buttons JSONB DEFAULT '[]'::jsonb,
        pix_config JSONB DEFAULT '{}'::jsonb,
        wifi_config JSONB DEFAULT '{}'::jsonb,
        location_config JSONB DEFAULT '{}'::jsonb,
        business_hours JSONB DEFAULT '[]'::jsonb,
        footer_branding JSONB DEFAULT '{}'::jsonb,
        catalogs JSONB DEFAULT '[]'::jsonb,
        catalog_settings JSONB DEFAULT '{"autoplay": true, "interval": 5}'::jsonb,
        status VARCHAR(50) DEFAULT 'active',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    await sql`CREATE INDEX IF NOT EXISTS idx_biosites_slug ON biosites(slug);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_biosites_client_user ON biosites(client_user_id);`;

    await sql`
      CREATE TABLE IF NOT EXISTS services (
        id VARCHAR(255) PRIMARY KEY,
        biosite_id VARCHAR(255) NOT NULL REFERENCES biosites(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT '',
        category VARCHAR(100) DEFAULT '',
        duration_minutes INT DEFAULT 30,
        price NUMERIC(10, 2) DEFAULT 0.00,
        promotional_price NUMERIC(10, 2),
        images JSONB DEFAULT '[]'::jsonb,
        order_index INT DEFAULT 0,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_services_biosite_id ON services(biosite_id);`;

    await sql`
      CREATE TABLE IF NOT EXISTS professionals (
        id VARCHAR(255) PRIMARY KEY,
        biosite_id VARCHAR(255) NOT NULL REFERENCES biosites(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        photo_url TEXT DEFAULT '',
        color VARCHAR(50) DEFAULT '#1d4ed8',
        active BOOLEAN DEFAULT true,
        services JSONB DEFAULT '[]'::jsonb,
        work_schedule JSONB DEFAULT '[]'::jsonb,
        blocked_dates JSONB DEFAULT '[]'::jsonb,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_professionals_biosite_id ON professionals(biosite_id);`;

    await sql`
      CREATE TABLE IF NOT EXISTS appointments (
        id VARCHAR(255) PRIMARY KEY,
        biosite_id VARCHAR(255) NOT NULL REFERENCES biosites(id) ON DELETE CASCADE,
        service_id VARCHAR(255),
        service_name VARCHAR(255),
        customer_name VARCHAR(255) NOT NULL,
        customer_phone VARCHAR(50) NOT NULL,
        appointment_date VARCHAR(20) NOT NULL,
        appointment_time VARCHAR(20) NOT NULL,
        duration_minutes INT DEFAULT 30,
        total_price NUMERIC(10, 2) DEFAULT 0.00,
        status VARCHAR(50) DEFAULT 'pending',
        customer_notes TEXT DEFAULT '',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;
    await sql`CREATE INDEX IF NOT EXISTS idx_appointments_biosite_id ON appointments(biosite_id);`;

    await sql`
      CREATE TABLE IF NOT EXISTS app_settings (
        key VARCHAR(100) PRIMARY KEY,
        value JSONB NOT NULL,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('[Neon] Tabelas inicializadas com sucesso no banco de dados!');

    // Se a tabela de biosites estiver vazia, semeia com os dados existentes do persisted_state.json
    const countResult = await sql`SELECT COUNT(*)::int as total FROM biosites`;
    if (countResult[0]?.total === 0 && fs.existsSync(DATA_FILE)) {
      console.log('[Neon] Banco vazio detectado. Semeando dados iniciais a partir do persisted_state.json...');
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (data.biosites && Array.isArray(data.biosites)) {
        for (const b of data.biosites) {
          await upsertBiositeToDb(b);
        }
      }
      if (data.services && Array.isArray(data.services)) {
        for (const s of data.services) {
          await upsertServiceToDb(s);
        }
      }
      if (data.creatorProfile) {
        await sql`
          INSERT INTO app_settings (key, value)
          VALUES ('creatorProfile', ${JSON.stringify(data.creatorProfile)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;
      }
      if (data.agencySettings) {
        await sql`
          INSERT INTO app_settings (key, value)
          VALUES ('agencySettings', ${JSON.stringify(data.agencySettings)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
        `;
      }
      console.log('[Neon] Dados iniciais semeados com sucesso!');
    }
  } catch (err) {
    console.error('[Neon] Erro ao inicializar tabelas no Neon:', err);
  }
}

// -----------------------------------------------------------------------------
// Helpers de Mapeamento Linha BD <-> Objeto Front-End
// -----------------------------------------------------------------------------
function parseJsonField<T>(field: any, defaultValue: T): T {
  if (!field) return defaultValue;
  if (typeof field === 'string') {
    try {
      return JSON.parse(field);
    } catch {
      return defaultValue;
    }
  }
  return field as T;
}

function dbRowToClient(row: any) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone || '',
    role: row.role || 'client',
    status: row.status || 'active',
    assignedBiositeIds: parseJsonField<string[]>(row.assigned_biosite_ids, []),
    permissions: parseJsonField<string[]>(row.permissions, []),
    mustChangePassword: Boolean(row.must_change_password),
    temporaryPassword: row.temporary_password || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function dbRowToBiosite(row: any) {
  return {
    id: row.id,
    agencyId: row.agency_id || 'agency-1',
    clientUserId: row.client_user_id || '',
    clientName: row.client_name || '',
    clientEmail: row.client_email || '',
    clientPhone: row.client_phone || '',
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle || '',
    description: row.description || '',
    category: row.category || 'manicure',
    avatarUrl: row.avatar_url || '',
    logoShape: row.logo_shape || 'circle',
    logoTransparent: Boolean(row.logo_transparent),
    coverType: row.cover_type || 'image',
    coverUrl: row.cover_url || '',
    videoUrl: row.video_url || '',
    coverGradient: row.cover_gradient || '',
    instagramHandle: row.instagram_handle || '',
    themeConfig: parseJsonField(row.theme_config, {}),
    contactButtons: parseJsonField(row.contact_buttons, []),
    pixConfig: parseJsonField(row.pix_config, { enabled: false }),
    wifiConfig: parseJsonField(row.wifi_config, { enabled: false }),
    locationConfig: parseJsonField(row.location_config, { enabled: false }),
    businessHours: parseJsonField(row.business_hours, []),
    footerBranding: parseJsonField(row.footer_branding, { enabled: true }),
    catalogs: parseJsonField(row.catalogs, []),
    catalogSettings: parseJsonField(row.catalog_settings, { autoplay: true, interval: 5 }),
    status: row.status || 'active',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
    updatedAt: row.updated_at ? new Date(row.updated_at).toISOString() : new Date().toISOString(),
  };
}

function dbRowToService(row: any) {
  return {
    id: row.id,
    biositeId: row.biosite_id,
    name: row.name,
    description: row.description || '',
    category: row.category || '',
    durationMinutes: Number(row.duration_minutes) || 30,
    price: Number(row.price) || 0,
    promotionalPrice: row.promotional_price !== null && row.promotional_price !== undefined ? Number(row.promotional_price) : undefined,
    images: parseJsonField<string[]>(row.images, []),
    orderIndex: Number(row.order_index) || 0,
    active: row.active ?? true,
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : undefined,
  };
}

function dbRowToProfessional(row: any) {
  return {
    id: row.id,
    biositeId: row.biosite_id,
    name: row.name,
    photoUrl: row.photo_url || '',
    color: row.color || '#1d4ed8',
    active: row.active ?? true,
    services: parseJsonField(row.services, []),
    workSchedule: parseJsonField(row.work_schedule, []),
    blockedDates: parseJsonField(row.blocked_dates, []),
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

function dbRowToAppointment(row: any) {
  return {
    id: row.id,
    biositeId: row.biosite_id,
    serviceId: row.service_id || '',
    serviceName: row.service_name || '',
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    appointmentDate: row.appointment_date,
    appointmentTime: row.appointment_time,
    durationMinutes: Number(row.duration_minutes) || 30,
    totalPrice: Number(row.total_price) || 0,
    status: row.status || 'pending',
    customerNotes: row.customer_notes || '',
    createdAt: row.created_at ? new Date(row.created_at).toISOString() : new Date().toISOString(),
  };
}

// -----------------------------------------------------------------------------
// Funções SQL de Upsert (Inserir ou Atualizar) para Neon
// -----------------------------------------------------------------------------
async function upsertClientToDb(client: any) {
  if (!sql) return;
  const id = client.id || `client-${Date.now()}`;
  const name = client.name || 'Cliente';
  const email = client.email;
  const phone = client.phone || '';
  const role = client.role || 'client';
  const status = client.status || 'active';
  const assigned = JSON.stringify(client.assignedBiositeIds || []);
  const permissions = JSON.stringify(client.permissions || []);
  const mustChange = Boolean(client.mustChangePassword);
  const tempPass = client.temporaryPassword || '';

  await sql`
    INSERT INTO clients (
      id, name, email, phone, role, status,
      assigned_biosite_ids, permissions, must_change_password, temporary_password
    )
    VALUES (
      ${id}, ${name}, ${email}, ${phone}, ${role}, ${status},
      ${assigned}::jsonb, ${permissions}::jsonb, ${mustChange}, ${tempPass}
    )
    ON CONFLICT (id) DO UPDATE SET
      name = EXCLUDED.name,
      email = EXCLUDED.email,
      phone = EXCLUDED.phone,
      role = EXCLUDED.role,
      status = EXCLUDED.status,
      assigned_biosite_ids = EXCLUDED.assigned_biosite_ids,
      permissions = EXCLUDED.permissions,
      must_change_password = EXCLUDED.must_change_password,
      temporary_password = EXCLUDED.temporary_password,
      updated_at = NOW();
  `;
}

async function upsertBiositeToDb(b: any) {
  if (!sql) {
    throw new Error('Conexão Neon (DATABASE_URL) não inicializada.');
  }
  const id = b.id || `bio-${Date.now()}`;
  const agencyId = b.agencyId || 'agency-1';
  const clientUserId = b.clientUserId || null;
  const clientName = b.clientName || '';
  const clientEmail = b.clientEmail || '';
  const clientPhone = b.clientPhone || '';

  // Preserva slug original caso não venha no payload parcial
  let slug = (b.slug || '').toLowerCase().trim();
  if (!slug) {
    try {
      const existingSlugRow = await sql`SELECT slug FROM biosites WHERE id = ${id} LIMIT 1;`;
      if (existingSlugRow.length > 0 && existingSlugRow[0].slug) {
        slug = existingSlugRow[0].slug;
      }
    } catch {}
  }
  if (!slug) {
    slug = `site-${Date.now()}`;
  }

  // Garante unicidade do slug se pertencer a outro ID
  try {
    const existingWithSlug = await sql`SELECT id FROM biosites WHERE LOWER(slug) = LOWER(${slug}) AND id != ${id} LIMIT 1;`;
    if (existingWithSlug.length > 0) {
      slug = `${slug}-${Math.floor(Math.random() * 899 + 100)}`;
    }
  } catch {}

  const title = b.title || 'Meu Bio Site';
  const subtitle = b.subtitle || '';
  const description = b.description || '';
  const category = b.category || 'manicure';
  const avatarUrl = b.avatarUrl || '';
  const logoShape = b.logoShape || 'circle';
  const logoTransparent = Boolean(b.logoTransparent);
  const coverType = b.coverType || 'image';
  const coverUrl = b.coverUrl || '';
  const videoUrl = b.videoUrl || '';
  const coverGradient = b.coverGradient || '';
  const instagramHandle = b.instagramHandle || '';
  const themeConfig = JSON.stringify(b.themeConfig || {});
  const contactButtons = JSON.stringify(b.contactButtons || []);
  const pixConfig = JSON.stringify(b.pixConfig || {});
  const wifiConfig = JSON.stringify(b.wifiConfig || {});
  const locationConfig = JSON.stringify(b.locationConfig || {});
  const businessHours = JSON.stringify(b.businessHours || []);
  const footerBranding = JSON.stringify(b.footerBranding || {});
  const catalogs = JSON.stringify(b.catalogs || []);
  const catalogSettings = JSON.stringify(b.catalogSettings || { autoplay: true, interval: 5 });
  const status = b.status || 'active';

  await sql`
    INSERT INTO biosites (
      id, agency_id, client_user_id, client_name, client_email, client_phone,
      slug, title, subtitle, description, category, avatar_url,
      logo_shape, logo_transparent, cover_type, cover_url, video_url, cover_gradient,
      instagram_handle, theme_config, contact_buttons, pix_config, wifi_config,
      location_config, business_hours, footer_branding, catalogs, catalog_settings,
      status, updated_at
    )
    VALUES (
      ${id}, ${agencyId}, ${clientUserId}, ${clientName}, ${clientEmail}, ${clientPhone},
      ${slug}, ${title}, ${subtitle}, ${description}, ${category}, ${avatarUrl},
      ${logoShape}, ${logoTransparent}, ${coverType}, ${coverUrl}, ${videoUrl}, ${coverGradient},
      ${instagramHandle}, ${themeConfig}::jsonb, ${contactButtons}::jsonb, ${pixConfig}::jsonb, ${wifiConfig}::jsonb,
      ${locationConfig}::jsonb, ${businessHours}::jsonb, ${footerBranding}::jsonb, ${catalogs}::jsonb, ${catalogSettings}::jsonb,
      ${status}, NOW()
    )
    ON CONFLICT (id) DO UPDATE SET
      agency_id = EXCLUDED.agency_id,
      client_user_id = EXCLUDED.client_user_id,
      client_name = EXCLUDED.client_name,
      client_email = EXCLUDED.client_email,
      client_phone = EXCLUDED.client_phone,
      slug = EXCLUDED.slug,
      title = EXCLUDED.title,
      subtitle = EXCLUDED.subtitle,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      avatar_url = EXCLUDED.avatar_url,
      logo_shape = EXCLUDED.logo_shape,
      logo_transparent = EXCLUDED.logo_transparent,
      cover_type = EXCLUDED.cover_type,
      cover_url = EXCLUDED.cover_url,
      video_url = EXCLUDED.video_url,
      cover_gradient = EXCLUDED.cover_gradient,
      instagram_handle = EXCLUDED.instagram_handle,
      theme_config = EXCLUDED.theme_config,
      contact_buttons = EXCLUDED.contact_buttons,
      pix_config = EXCLUDED.pix_config,
      wifi_config = EXCLUDED.wifi_config,
      location_config = EXCLUDED.location_config,
      business_hours = EXCLUDED.business_hours,
      footer_branding = EXCLUDED.footer_branding,
      catalogs = EXCLUDED.catalogs,
      catalog_settings = EXCLUDED.catalog_settings,
      status = EXCLUDED.status,
      updated_at = NOW();
  `;
}

async function upsertServiceToDb(s: any) {
  if (!sql) return;
  const id = s.id || `srv-${Date.now()}`;
  const biositeId = s.biositeId;
  const name = s.name || 'Serviço';
  const description = s.description || '';
  const category = s.category || '';
  const durationMinutes = Number(s.durationMinutes) || 30;
  const price = Number(s.price) || 0;
  const promotionalPrice = s.promotionalPrice !== undefined ? Number(s.promotionalPrice) : null;
  const images = JSON.stringify(s.images || []);
  const orderIndex = Number(s.orderIndex) || 0;
  const active = s.active ?? true;

  await sql`
    INSERT INTO services (
      id, biosite_id, name, description, category,
      duration_minutes, price, promotional_price, images, order_index, active
    )
    VALUES (
      ${id}, ${biositeId}, ${name}, ${description}, ${category},
      ${durationMinutes}, ${price}, ${promotionalPrice}, ${images}::jsonb, ${orderIndex}, ${active}
    )
    ON CONFLICT (id) DO UPDATE SET
      biosite_id = EXCLUDED.biosite_id,
      name = EXCLUDED.name,
      description = EXCLUDED.description,
      category = EXCLUDED.category,
      duration_minutes = EXCLUDED.duration_minutes,
      price = EXCLUDED.price,
      promotional_price = EXCLUDED.promotional_price,
      images = EXCLUDED.images,
      order_index = EXCLUDED.order_index,
      active = EXCLUDED.active,
      updated_at = NOW();
  `;
}

// -----------------------------------------------------------------------------
// Helper para Desativar Cache na Vercel e Navegadores (Cache-Control: no-store)
// -----------------------------------------------------------------------------
function setNoCacheHeaders(res: Response) {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
}

// -----------------------------------------------------------------------------
// Helper para Converter Base64 em URL no Cloudinary (Evita estouro de 413 na Vercel)
// -----------------------------------------------------------------------------
async function uploadBase64ToCloudinary(base64Data: string, filename = 'media'): Promise<string> {
  if (!base64Data || typeof base64Data !== 'string' || !base64Data.startsWith('data:')) {
    return base64Data;
  }
  try {
    let base64Content = base64Data;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    const match = base64Data.match(/^data:([^;]+);base64,(.+)$/);
    if (match) {
      mimeType = match[1];
      base64Content = match[2];
      ext = mimeType.split('/')[1]?.split('+')[0] || 'jpg';
    }

    const buffer = Buffer.from(base64Content, 'base64');
    const blob = new Blob([buffer], { type: mimeType });
    const formData = new FormData();
    formData.append('file', blob, `${filename}.${ext}`);
    formData.append('upload_preset', 'meus_videos');

    const res = await fetch('https://api.cloudinary.com/v1_1/je065pkr/auto/upload', {
      method: 'POST',
      body: formData,
    });

    if (res.ok) {
      const data: any = await res.json();
      if (data?.secure_url) {
        console.log(`[Cloudinary Server] Upload de base64 convertido com sucesso para URL: ${data.secure_url}`);
        return data.secure_url;
      }
    } else {
      console.warn('[Cloudinary Server] Resposta não OK ao converter base64:', res.status);
    }
  } catch (err: any) {
    console.warn('[Cloudinary Server] Falha ao converter base64 para Cloudinary:', err?.message);
  }

  return base64Data;
}

async function sanitizeBiositeMedia(b: any): Promise<any> {
  if (!b) return b;
  const sanitized = { ...b };
  if (sanitized.avatarUrl && typeof sanitized.avatarUrl === 'string' && sanitized.avatarUrl.startsWith('data:')) {
    sanitized.avatarUrl = await uploadBase64ToCloudinary(sanitized.avatarUrl, 'avatar');
  }
  if (sanitized.coverUrl && typeof sanitized.coverUrl === 'string' && sanitized.coverUrl.startsWith('data:')) {
    sanitized.coverUrl = await uploadBase64ToCloudinary(sanitized.coverUrl, 'cover');
  }
  if (sanitized.videoUrl && typeof sanitized.videoUrl === 'string' && sanitized.videoUrl.startsWith('data:')) {
    sanitized.videoUrl = await uploadBase64ToCloudinary(sanitized.videoUrl, 'video');
  }
  if (sanitized.catalogs && Array.isArray(sanitized.catalogs)) {
    sanitized.catalogs = await Promise.all(sanitized.catalogs.map(async (cat: any) => {
      if (cat.items && Array.isArray(cat.items)) {
        const sanitizedItems = await Promise.all(cat.items.map(async (item: any) => {
          if (item.imageUrl && typeof item.imageUrl === 'string' && item.imageUrl.startsWith('data:')) {
            const url = await uploadBase64ToCloudinary(item.imageUrl, 'catalog_item');
            return { ...item, imageUrl: url };
          }
          return item;
        }));
        return { ...cat, items: sanitizedItems };
      }
      return cat;
    }));
  }
  return sanitized;
}

// -----------------------------------------------------------------------------
// Criação do Aplicativo Express
// -----------------------------------------------------------------------------
const app = express();

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Middleware global para desativar cache em todas as rotas de API da Vercel
app.use('/api', (req: Request, res: Response, next) => {
  setNoCacheHeaders(res);
  next();
});

// Middleware de captura de erro de tamanho (Payload Too Large 413)
app.use((err: any, req: Request, res: Response, next: any) => {
  if (err && (err.type === 'entity.too.large' || err.status === 413)) {
    console.warn('[Express] 413 Payload Too Large detectado');
    return res.status(413).json({ 
      success: false, 
      error: 'O arquivo ou imagem enviado excede o limite permitido (Payload Too Large). Por favor utilize imagens menores ou faça upload direto via Cloudinary.' 
    });
  }
  next(err);
});

// Servir diretório estático de uploads
app.use('/uploads', express.static(UPLOADS_DIR));

// -----------------------------------------------------------------------------
// Rota de Upload de Mídias na Nuvem (Cloudinary / Vercel Blob / Fallback Local)
// -----------------------------------------------------------------------------
app.post('/api/upload', async (req: Request, res: Response) => {
  try {
    const { filename, data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Nenhum dado enviado para upload.' });
    }

    // 1. Prioridade: Cloudinary (Recomendado para imagens e mídias de alta escala)
    if (hasCloudinary) {
      try {
        const client = await getCloudinaryClient();
        if (client) {
          console.log('[Cloudinary] Enviando mídia para Cloudinary...');
          const uploadResult = await client.uploader.upload(data, {
            folder: 'biosaas_catalog',
            resource_type: 'auto',
          });

          console.log(`[Cloudinary] Sucesso! URL pública gerada: ${uploadResult.secure_url}`);
          return res.json({
            success: true,
            url: uploadResult.secure_url,
            provider: 'cloudinary',
            bytes: uploadResult.bytes,
          });
        }
      } catch (cloudErr: any) {
        console.warn('[Cloudinary] Falha no upload Cloudinary, tentando fallback:', cloudErr?.message);
      }
    }

    // 2. Segunda opção: Vercel Blob
    if (hasVercelBlob) {
      try {
        console.log('[Vercel Blob] Enviando mídia para Vercel Blob...');
        let base64Content = data;
        let ext = 'jpg';
        let mimeType = 'image/jpeg';

        if (data.startsWith('data:')) {
          const match = data.match(/^data:([^;]+);base64,(.+)$/);
          if (match) {
            mimeType = match[1];
            base64Content = match[2];
            ext = mimeType.split('/')[1] || 'jpg';
          }
        }

        const buffer = Buffer.from(base64Content, 'base64');
        const cleanName = (filename || 'upload').replace(/[^a-zA-Z0-9._-]/g, '');
        const blobPath = `uploads/${Date.now()}-${cleanName}.${ext}`;

        const blob = await put(blobPath, buffer, {
          access: 'public',
          contentType: mimeType,
        });

        console.log(`[Vercel Blob] Sucesso! URL pública gerada: ${blob.url}`);
        return res.json({
          success: true,
          url: blob.url,
          provider: 'vercel_blob',
          size: buffer.length,
        });
      } catch (blobErr: any) {
        console.warn('[Vercel Blob] Falha no upload Vercel Blob, usando fallback local:', blobErr?.message);
      }
    }

    // 3. Fallback seguro para desenvolvimento local (quando sem chaves de nuvem)
    let base64Content = data;
    let ext = 'jpg';

    if (filename && filename.includes('.')) {
      ext = filename.split('.').pop() || 'jpg';
    } else if (data.startsWith('data:image/')) {
      const match = data.match(/^data:image\/([a-zA-Z0-9+]+);base64,/);
      if (match) ext = match[1] === 'jpeg' ? 'jpg' : match[1];
    } else if (data.startsWith('data:video/')) {
      const match = data.match(/^data:video\/([a-zA-Z0-9+]+);base64,/);
      if (match) ext = match[1];
    }

    if (data.includes(';base64,')) {
      base64Content = data.split(';base64,')[1];
    }

    const cleanExt = ext.replace(/[^a-zA-Z0-9]/g, '').slice(0, 5) || 'jpg';
    const uniqueName = `media_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${cleanExt}`;
    const filePath = path.join(UPLOADS_DIR, uniqueName);
    const buffer = Buffer.from(base64Content, 'base64');

    fs.writeFileSync(filePath, buffer);
    const publicUrl = `/uploads/${uniqueName}`;
    console.log(`[Upload Local] Mídia salva em ${publicUrl} (${buffer.length} bytes). Configure CLOUDINARY_URL para nuvem na Vercel.`);

    return res.json({
      success: true,
      url: publicUrl,
      provider: 'local_disk',
      size: buffer.length
    });
  } catch (err: any) {
    console.error('[Upload] Erro geral:', err);
    return res.status(500).json({ error: err?.message || 'Falha ao salvar arquivo' });
  }
});

// -----------------------------------------------------------------------------
// CRUD DE CLIENTES (Neon PostgreSQL)
// -----------------------------------------------------------------------------

// 1. Listar todos os clientes
app.get('/api/clients', async (req: Request, res: Response) => {
  try {
    if (sqlActive && sql) {
      const rows = await sql`SELECT * FROM clients ORDER BY created_at DESC;`;
      return res.json(rows.map(dbRowToClient));
    }
  } catch (err: any) {
    console.warn('[Neon] Erro ao listar clientes no Neon, operando em modo local:', err?.message);
    sqlActive = false;
  }
  const data = readLocalData();
  return res.json(data.clients || []);
});

// 2. Buscar cliente por ID
app.get('/api/clients/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (sqlActive && sql) {
      const rows = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1;`;
      if (rows.length > 0) {
        return res.json(dbRowToClient(rows[0]));
      }
    }
  } catch (err: any) {
    console.warn(`[Neon] Erro ao buscar cliente ${id}:`, err?.message);
    sqlActive = false;
  }
  const data = readLocalData();
  const match = (data.clients || []).find((c: any) => c.id === id);
  if (match) return res.json(match);
  return res.status(404).json({ error: 'Cliente não encontrado' });
});

// 3. Criar novo cliente
app.post('/api/clients', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.name || !data.email) {
      return res.status(400).json({ error: 'Nome e e-mail são obrigatórios.' });
    }

    const client = {
      ...data,
      id: data.id || `client-${Date.now()}`,
      status: data.status || 'active',
      role: data.role || 'client',
      assignedBiositeIds: data.assignedBiositeIds || [],
      permissions: data.permissions || [],
      createdAt: data.createdAt || new Date().toISOString(),
    };

    if (sqlActive && sql) {
      try {
        await upsertClientToDb(client);
        console.log(`[Neon] Cliente ${client.name} inserido no banco com sucesso.`);
      } catch (err: any) {
        console.warn('[Neon] Erro ao salvar cliente no Neon:', err?.message);
        sqlActive = false;
      }
    }

    syncToLocalDisk({ client });
    return res.status(201).json({ success: true, client });
  } catch (err: any) {
    console.error('Erro ao criar cliente:', err);
    return res.status(500).json({ error: err?.message || 'Erro ao criar cliente' });
  }
});

// 4. Atualizar cliente
app.put('/api/clients/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;
    let savedClient: any = null;
    if (sqlActive && sql) {
      try {
        const existing = await sql`SELECT * FROM clients WHERE id = ${id} LIMIT 1;`;
        if (existing.length === 0) {
          savedClient = { ...data, id };
        } else {
          savedClient = { ...dbRowToClient(existing[0]), ...data, id };
        }
        await upsertClientToDb(savedClient);
      } catch (err: any) {
        console.warn(`[Neon] Erro ao atualizar cliente ${id}:`, err?.message);
        sqlActive = false;
      }
    }
    if (!savedClient) {
      const local = readLocalData();
      const existing = (local.clients || []).find((c: any) => c.id === id) || {};
      savedClient = { ...existing, ...data, id };
    }
    syncToLocalDisk({ client: savedClient });
    return res.json({ success: true, client: savedClient });
  } catch (err: any) {
    console.error(`Erro ao atualizar cliente ${id}:`, err);
    return res.status(500).json({ error: err?.message || 'Erro ao atualizar cliente' });
  }
});

// 5. Excluir cliente
app.delete('/api/clients/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (sqlActive && sql) {
      try {
        await sql`DELETE FROM clients WHERE id = ${id};`;
      } catch (err: any) {
        console.warn(`[Neon] Erro ao remover cliente ${id}:`, err?.message);
        sqlActive = false;
      }
    }
    const current = readLocalData();
    current.clients = (current.clients || []).filter((c: any) => c.id !== id);
    writeLocalData(current);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error(`Erro ao excluir cliente ${id}:`, err);
    return res.status(500).json({ error: err?.message || 'Erro ao excluir cliente' });
  }
});

// -----------------------------------------------------------------------------
// CRUD DE MINISITES / BIO SITES
// -----------------------------------------------------------------------------

// GET /api/check-slug?slug=meu-slug(&excludeId=id-opcional)
app.get('/api/check-slug', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const slug = String(req.query.slug || '').trim().toLowerCase();
  const excludeId = req.query.excludeId ? String(req.query.excludeId) : null;

  if (!slug) {
    return res.status(400).json({ error: 'Parâmetro slug é obrigatório.', available: false });
  }

  try {
    if (sql && sqlActive) {
      const rows = excludeId
        ? await sql`SELECT id FROM biosites WHERE LOWER(slug) = LOWER(${slug}) AND id != ${excludeId} LIMIT 1;`
        : await sql`SELECT id FROM biosites WHERE LOWER(slug) = LOWER(${slug}) LIMIT 1;`;

      return res.json({ available: rows.length === 0 });
    }
  } catch (err: any) {
    console.warn('[Neon] Erro ao consultar slug no Neon, usando fallback local:', err?.message);
    sqlActive = false;
  }

  // Fallback seguro caso o banco esteja indisponível ou em modo local
  const data = readLocalData();
  const exists = (data.biosites || []).some((b: any) => 
    b.slug && b.slug.toLowerCase() === slug && (!excludeId || b.id !== excludeId)
  );

  return res.json({ available: !exists });
});

// 1. Listar todos os biosites (sem cache)
app.get('/api/biosites', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    if (sql) {
      const rows = await sql`SELECT * FROM biosites ORDER BY created_at DESC;`;
      if (rows && rows.length > 0) {
        return res.json(rows.map(dbRowToBiosite));
      }
    }
  } catch (err: any) {
    console.warn('[Neon] Erro ao listar biosites no Neon:', err?.message);
  }
  const data = readLocalData();
  return res.json(data.biosites || []);
});

// 2. Buscar biosite por ID ou Slug (sem cache)
app.get('/api/biosites/:idOrSlug', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const { idOrSlug } = req.params;
  try {
    if (sql) {
      const rows = await sql`
        SELECT * FROM biosites 
        WHERE id = ${idOrSlug} OR LOWER(slug) = LOWER(${idOrSlug}) 
        LIMIT 1;
      `;
      if (rows.length > 0) {
        return res.json(dbRowToBiosite(rows[0]));
      }
    }
  } catch (err: any) {
    console.warn(`[Neon] Erro ao buscar biosite ${idOrSlug}:`, err?.message);
  }
  const data = readLocalData();
  const found = (data.biosites || []).find((b: any) => 
    b.id === idOrSlug || (b.slug && b.slug.toLowerCase() === idOrSlug.toLowerCase())
  );
  if (found) return res.json(found);
  return res.status(404).json({ error: 'Bio Site não encontrado' });
});

// 3. Criar novo biosite
app.post('/api/biosites', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    const data = req.body;
    if (!data.title || !data.slug) {
      return res.status(400).json({ error: 'Título e slug são obrigatórios.' });
    }

    let biosite = {
      ...data,
      id: data.id || `bio-${Date.now()}`,
      status: data.status || 'active',
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Sanitiza mídias antes de salvar no Neon
    biosite = await sanitizeBiositeMedia(biosite);

    if (sql) {
      await upsertBiositeToDb(biosite);
      console.log(`[Neon] Bio Site "${biosite.title}" inserido e persistido no Neon com sucesso.`);
    }

    syncToLocalDisk({ biosite });
    return res.status(201).json({ success: true, biosite });
  } catch (err: any) {
    console.error('Erro ao criar biosite:', err);
    return res.status(500).json({ error: err?.message || 'Erro ao criar biosite' });
  }
});

// 4. Atualizar biosite com garantia estrita de persistência no Neon (sem cache)
app.put('/api/biosites/:id', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  const { id } = req.params;

  try {
    const data = req.body;
    if (!data || typeof data !== 'object') {
      return res.status(400).json({ success: false, error: 'Dados inválidos para atualização do biosite.' });
    }

    let savedSite: any = null;

    if (sql) {
      // 1. Busca biosite existente no Neon para mesclagem íntegra
      const existing = await sql`SELECT * FROM biosites WHERE id = ${id} LIMIT 1;`;
      if (existing.length === 0) {
        const local = readLocalData();
        const localMatch = (local.biosites || []).find((b: any) => b.id === id);
        savedSite = { ...(localMatch || {}), ...data, id, updatedAt: new Date().toISOString() };
      } else {
        const current = dbRowToBiosite(existing[0]);
        savedSite = { ...current, ...data, id, updatedAt: new Date().toISOString() };
      }

      // 2. Sanitiza imagens e vídeos (converte base64 para Cloudinary URLs para prevenir estouros de payload na Vercel)
      savedSite = await sanitizeBiositeMedia(savedSite);

      // 3. PERSISTÊNCIA ESTRITA NO BANCO NEON COM AWAIT
      // Qualquer falha aqui é lançada para o bloco catch que devolverá status 500
      await upsertBiositeToDb(savedSite);
      console.log(`[Neon] Bio Site "${savedSite.title || id}" (slug: ${savedSite.slug}) persistido com sucesso no Neon.`);
    } else {
      const local = readLocalData();
      const existing = (local.biosites || []).find((b: any) => b.id === id) || {};
      savedSite = { ...existing, ...data, id, updatedAt: new Date().toISOString() };
    }

    // 4. Sincroniza em cache local apenas após confirmação do Neon
    syncToLocalDisk({ biosite: savedSite });

    // 5. Devolve 200 para o frontend com garantia de persistência
    return res.status(200).json({ success: true, biosite: savedSite });
  } catch (err: any) {
    console.error(`[Neon] ERRO CRÍTICO ao atualizar biosite ${id}:`, err);
    return res.status(500).json({ 
      success: false, 
      error: `Erro ao persistir alterações no banco de dados Neon: ${err?.message || 'Falha de gravação'}` 
    });
  }
});

// 5. Excluir biosite
app.delete('/api/biosites/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (sqlActive && sql) {
      try {
        await sql`DELETE FROM biosites WHERE id = ${id};`;
      } catch (err: any) {
        console.warn(`[Neon] Erro ao excluir biosite ${id}:`, err?.message);
        sqlActive = false;
      }
    }
    const current = readLocalData();
    current.biosites = (current.biosites || []).filter((b: any) => b.id !== id);
    current.services = (current.services || []).filter((s: any) => s.biositeId !== id);
    current.appointments = (current.appointments || []).filter((a: any) => a.biositeId !== id);
    writeLocalData(current);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error(`Erro ao excluir biosite ${id}:`, err);
    return res.status(500).json({ error: err?.message || 'Erro ao excluir biosite' });
  }
});

// -----------------------------------------------------------------------------
// CRUD DE SERVIÇOS
// -----------------------------------------------------------------------------
app.get('/api/services', async (req: Request, res: Response) => {
  const { biositeId } = req.query;
  try {
    if (sqlActive && sql) {
      const rows = biositeId
        ? await sql`SELECT * FROM services WHERE biosite_id = ${String(biositeId)} ORDER BY order_index ASC, created_at ASC;`
        : await sql`SELECT * FROM services ORDER BY order_index ASC, created_at ASC;`;
      return res.json(rows.map(dbRowToService));
    }
  } catch (err: any) {
    console.warn('[Neon] Erro ao listar serviços:', err?.message);
    sqlActive = false;
  }
  const data = readLocalData();
  let list = data.services || [];
  if (biositeId) {
    list = list.filter((s: any) => s.biositeId === biositeId);
  }
  return res.json(list);
});

app.post('/api/services', async (req: Request, res: Response) => {
  try {
    const data = req.body;
    if (!data.biositeId || !data.name) {
      return res.status(400).json({ error: 'biositeId e name são obrigatórios.' });
    }
    const service = {
      ...data,
      id: data.id || `srv-${Date.now()}`,
    };
    if (sqlActive && sql) {
      try {
        await upsertServiceToDb(service);
      } catch (err: any) {
        console.warn('[Neon] Erro ao criar serviço:', err?.message);
        sqlActive = false;
      }
    }
    const local = readLocalData();
    local.services = local.services || [];
    local.services.push(service);
    writeLocalData(local);
    return res.status(201).json({ success: true, service });
  } catch (err: any) {
    console.error('Erro ao criar serviço:', err);
    return res.status(500).json({ error: err?.message || 'Erro ao criar serviço' });
  }
});

app.put('/api/services/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const data = req.body;
    if (sqlActive && sql) {
      try {
        const existing = await sql`SELECT * FROM services WHERE id = ${id} LIMIT 1;`;
        const merged = existing.length > 0 ? { ...dbRowToService(existing[0]), ...data, id } : { ...data, id };
        await upsertServiceToDb(merged);
      } catch (err: any) {
        console.warn(`[Neon] Erro ao atualizar serviço ${id}:`, err?.message);
        sqlActive = false;
      }
    }
    const local = readLocalData();
    const idx = (local.services || []).findIndex((s: any) => s.id === id);
    if (idx >= 0) {
      local.services[idx] = { ...local.services[idx], ...data, id };
    } else {
      local.services = local.services || [];
      local.services.push({ ...data, id });
    }
    writeLocalData(local);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error(`Erro ao atualizar serviço ${id}:`, err);
    return res.status(500).json({ error: err?.message || 'Erro ao atualizar serviço' });
  }
});

app.delete('/api/services/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    if (sqlActive && sql) {
      try {
        await sql`DELETE FROM services WHERE id = ${id};`;
      } catch (err: any) {
        console.warn(`[Neon] Erro ao deletar serviço ${id}:`, err?.message);
        sqlActive = false;
      }
    }
    const local = readLocalData();
    local.services = (local.services || []).filter((s: any) => s.id !== id);
    writeLocalData(local);
    return res.json({ success: true, id });
  } catch (err: any) {
    console.error(`Erro ao deletar serviço ${id}:`, err);
    return res.status(500).json({ error: err?.message || 'Erro ao excluir serviço' });
  }
});

// -----------------------------------------------------------------------------
// ENDPOINTS DE SINCRONIZAÇÃO COMPLETA DE ESTADO (GET /api/state e POST /api/state)
// -----------------------------------------------------------------------------
app.get('/api/state', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    if (sql) {
      const [biositeRows, clientRows, serviceRows, profRows, apptRows, settingsRows] = await Promise.all([
        sql`SELECT * FROM biosites ORDER BY created_at DESC;`,
        sql`SELECT * FROM clients ORDER BY created_at DESC;`,
        sql`SELECT * FROM services ORDER BY order_index ASC, created_at ASC;`,
        sql`SELECT * FROM professionals ORDER BY created_at ASC;`,
        sql`SELECT * FROM appointments ORDER BY appointment_date DESC, appointment_time DESC;`,
        sql`SELECT * FROM app_settings;`,
      ]);

      let creatorProfile = null;
      let agencySettings = null;

      for (const row of settingsRows) {
        if (row.key === 'creatorProfile') creatorProfile = row.value;
        if (row.key === 'agencySettings') agencySettings = row.value;
      }

      if (biositeRows && biositeRows.length > 0) {
        return res.json({
          biosites: biositeRows.map(dbRowToBiosite),
          clients: clientRows.map(dbRowToClient),
          services: serviceRows.map(dbRowToService),
          professionals: profRows.map(dbRowToProfessional),
          appointments: apptRows.map(dbRowToAppointment),
          creatorProfile,
          agencySettings,
        });
      }
    }
  } catch (e: any) {
    console.warn('[Neon] Erro ao ler estado unificado no Neon:', e?.message);
  }

  const local = readLocalData();
  return res.json(local);
});

app.post('/api/state', async (req: Request, res: Response) => {
  setNoCacheHeaders(res);
  try {
    const data = req.body;
    if (!data) return res.json({ success: false });

    if (sql) {
      try {
        if (data.biosites && Array.isArray(data.biosites)) {
          for (const b of data.biosites) {
            const sanitized = await sanitizeBiositeMedia(b);
            await upsertBiositeToDb(sanitized);
          }
        }
        if (data.clients && Array.isArray(data.clients)) {
          for (const c of data.clients) await upsertClientToDb(c);
        }
        if (data.services && Array.isArray(data.services)) {
          for (const s of data.services) await upsertServiceToDb(s);
        }
        if (data.professionals && Array.isArray(data.professionals)) {
          for (const p of data.professionals) {
            const id = p.id || `prof-${Date.now()}`;
            const biositeId = p.biositeId;
            const name = p.name || 'Profissional';
            const photoUrl = p.photoUrl || '';
            const color = p.color || '#1d4ed8';
            const active = p.active ?? true;
            const servicesJson = JSON.stringify(p.services || []);
            const scheduleJson = JSON.stringify(p.workSchedule || []);
            const blockedJson = JSON.stringify(p.blockedDates || []);

            await sql`
              INSERT INTO professionals (id, biosite_id, name, photo_url, color, active, services, work_schedule, blocked_dates)
              VALUES (${id}, ${biositeId}, ${name}, ${photoUrl}, ${color}, ${active}, ${servicesJson}::jsonb, ${scheduleJson}::jsonb, ${blockedJson}::jsonb)
              ON CONFLICT (id) DO UPDATE SET
                name = EXCLUDED.name,
                photo_url = EXCLUDED.photo_url,
                color = EXCLUDED.color,
                active = EXCLUDED.active,
                services = EXCLUDED.services,
                work_schedule = EXCLUDED.work_schedule,
                blocked_dates = EXCLUDED.blocked_dates;
            `;
          }
        }
        if (data.appointments && Array.isArray(data.appointments)) {
          for (const a of data.appointments) {
            const id = a.id || `app-${Date.now()}`;
            const biositeId = a.biositeId;
            const serviceId = a.serviceId || null;
            const serviceName = a.serviceName || '';
            const customerName = a.customerName || 'Cliente';
            const customerPhone = a.customerPhone || '';
            const apptDate = a.appointmentDate;
            const apptTime = a.appointmentTime;
            const duration = Number(a.durationMinutes) || 30;
            const totalPrice = Number(a.totalPrice) || 0;
            const status = a.status || 'pending';
            const notes = a.customerNotes || '';

            await sql`
              INSERT INTO appointments (id, biosite_id, service_id, service_name, customer_name, customer_phone, appointment_date, appointment_time, duration_minutes, total_price, status, customer_notes)
              VALUES (${id}, ${biositeId}, ${serviceId}, ${serviceName}, ${customerName}, ${customerPhone}, ${apptDate}, ${apptTime}, ${duration}, ${totalPrice}, ${status}, ${notes})
              ON CONFLICT (id) DO UPDATE SET
                status = EXCLUDED.status,
                customer_notes = EXCLUDED.customer_notes;
            `;
          }
        }
        if (data.creatorProfile) {
          await sql`
            INSERT INTO app_settings (key, value)
            VALUES ('creatorProfile', ${JSON.stringify(data.creatorProfile)})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
          `;
        }
        if (data.agencySettings) {
          await sql`
            INSERT INTO app_settings (key, value)
            VALUES ('agencySettings', ${JSON.stringify(data.agencySettings)})
            ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value, updated_at = NOW()
          `;
        }
      } catch (err: any) {
        console.warn('[Neon] Erro ao sincronizar estado com Neon, salvando local:', err?.message);
      }
    }

    // Always persist to local disk
    writeLocalData(data);
    return res.json({ success: true, timestamp: Date.now() });
  } catch (e: any) {
    console.error('Erro ao sincronizar estado:', e);
    return res.status(500).json({ error: e?.message || 'Falha ao salvar estado' });
  }
});

// Helper para sincronizar alterações individuais com o arquivo local
function syncToLocalDisk(changes: any) {
  try {
    const current = readLocalData();
    if (changes.biosite) {
      const list = current.biosites || [];
      const index = list.findIndex((b: any) => b.id === changes.biosite.id);
      if (index >= 0) list[index] = { ...list[index], ...changes.biosite };
      else list.unshift(changes.biosite);
      current.biosites = list;
    }
    if (changes.client) {
      const list = current.clients || [];
      const index = list.findIndex((c: any) => c.id === changes.client.id);
      if (index >= 0) list[index] = { ...list[index], ...changes.client };
      else list.unshift(changes.client);
      current.clients = list;
    }
    writeLocalData(current);
  } catch (err) {
    console.warn('[Storage Local] Erro em syncToLocalDisk:', err);
  }
}

// -----------------------------------------------------------------------------
// Endpoint para Inicializar Tabelas Manualmente (se desejado)
// -----------------------------------------------------------------------------
app.post('/api/init-db', async (req: Request, res: Response) => {
  if (!sql) {
    return res.status(400).json({ error: 'DATABASE_URL não configurada no ambiente.' });
  }
  try {
    await checkNeonConnection();
    return res.json({ success: true, message: 'Tabelas do banco criadas e inicializadas com sucesso no Neon!' });
  } catch (err: any) {
    return res.status(500).json({ error: err?.message || 'Erro ao inicializar tabelas' });
  }
});

// -----------------------------------------------------------------------------
// Health Check com Status da Conexão ao Neon e Provedor de Mídia
// -----------------------------------------------------------------------------
app.get('/api/health', async (req: Request, res: Response) => {
  const dbStatus = sqlActive ? 'connected' : (sql ? 'offline_fallback_active' : 'local_storage');
  const mediaProvider = hasCloudinary ? 'cloudinary' : (hasVercelBlob ? 'vercel_blob' : 'local_disk');

  res.json({
    status: 'ok',
    neonDatabase: dbStatus,
    mediaStorage: mediaProvider,
    port: PORT,
    timestamp: new Date().toISOString(),
  });
});

// -----------------------------------------------------------------------------
// Inicialização do Servidor (Vite Dev Server em desenvolvimento ou estáticos em prod)
// -----------------------------------------------------------------------------
async function startServer() {
  if (sql) {
    checkNeonConnection().catch((e) => console.warn('[Neon] Aviso na checagem inicial:', e));
  }

  if (!isProd) {
    // TRUQUE NINJA: Variável dinâmica para esconder o Vite da Vercel
    const viteTool = 'vite';
    const { createServer } = await import(viteTool);

    const vite = await createServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        allowedHosts: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  // Evita tentar abrir a porta 3000 dentro da Vercel (que já cuida disso sozinha)
  if (!process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Server] BioSaaS rodando em http://0.0.0.0:${PORT}`);
    });
  }
}

// Export para uso serverless na Vercel (api/index.ts)
export default app;
export { app, sql };

startServer();