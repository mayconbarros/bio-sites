-- ==============================================================================
-- BioSaaS - Esquema SQL para Neon (PostgreSQL)
-- Copie e cole os comandos abaixo no SQL Editor do painel do Neon
-- ==============================================================================

-- 1. Tabela de Clientes (Usuários do Painel do Cliente)
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

-- 2. Tabela de Minisites (Bio Sites)
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

-- Índices para buscas ultrarrápidas por slug e usuário
CREATE INDEX IF NOT EXISTS idx_biosites_slug ON biosites(slug);
CREATE INDEX IF NOT EXISTS idx_biosites_client_user ON biosites(client_user_id);

-- 3. Tabela de Serviços dos Minisites
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
CREATE INDEX IF NOT EXISTS idx_services_biosite_id ON services(biosite_id);

-- 4. Tabela de Profissionais da Equipe
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
CREATE INDEX IF NOT EXISTS idx_professionals_biosite_id ON professionals(biosite_id);

-- 5. Tabela de Agendamentos dos Clientes
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
CREATE INDEX IF NOT EXISTS idx_appointments_biosite_id ON appointments(biosite_id);

-- 6. Tabela de Configurações Globais (Agency Settings, Creator Profile)
CREATE TABLE IF NOT EXISTS app_settings (
  key VARCHAR(100) PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
