export type UserRole = 'admin' | 'client' | 'agency_admin' | 'client_owner';

export interface ClientUser {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'client';
  assignedBiositeIds: string[];
  permissions: string[];
  status: 'active' | 'pending' | 'blocked';
  mustChangePassword?: boolean;
  temporaryPassword?: string;
  createdAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agencyId?: string;
  phone?: string;
  assignedBiositeIds?: string[];
  permissions?: string[];
  mustChangePassword?: boolean;
  temporaryPassword?: string;
}

export type ButtonStyle = 'rounded' | 'pill' | 'sharp' | 'glass';
export type CoverType = 'gradient' | 'image' | 'video';

export interface ThemeConfig {
  presetId: string;
  presetName: string;
  bgColor: string;
  bgGradient?: string;
  cardBg: string;
  textColor: string;
  textMutedColor: string;
  primaryColor: string;
  primaryTextColor: string;
  accentColor: string;
  buttonStyle: ButtonStyle;
  fontFamily: string;
  glassmorphism: boolean;
}

export interface ContactButton {
  id: string;
  label: string;
  icon: string;
  url: string;
  isWhatsApp: boolean;
  prefilledMessage?: string;
  active: boolean;
  type?: string;
  phone?: string;
  email?: string;
  lucideIcon?: string;
  bgColor?: string;
  textColor?: string;
  displayMode?: 'icon_only' | 'full_button';
  pulseEffect?: boolean;
  isSpecial?: string;
}

export type PixKeyType = 'phone' | 'email' | 'cpf' | 'cnpj' | 'random';

export interface PixConfig {
  enabled: boolean;
  keyType: PixKeyType;
  pixKey: string;
  beneficiaryName: string;
  city: string;
  instantPix?: boolean;
  hasCardBg?: boolean;
  cardTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface WifiConfig {
  enabled: boolean;
  networkName: string;
  password: string;
  hasCardBg?: boolean;
  cardTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface LocationConfig {
  enabled: boolean;
  address: string;
  cityState?: string;
  googleMapsUrl: string;
  wazeUrl?: string;
  buttonText?: string;
  cardBgColor?: string;
  cardTextColor?: string;
  buttonBgColor?: string;
  buttonTextColor?: string;
}

export interface DaySchedule {
  dayOfWeek: number; // 0 = Domingo, 1 = Segunda, ... 6 = Sábado
  dayName: string;
  openTime: string;
  closeTime: string;
  lunchStart?: string;
  lunchEnd?: string;
  closed: boolean;
}

export interface FooterBranding {
  enabled: boolean;
  agencyName: string;
  agencyUrl: string;
  agencyTagline?: string;
}

export interface Service {
  id: string;
  biositeId: string;
  name: string;
  description: string;
  category: string;
  durationMinutes: number;
  price: number; // em reais (ex: 85.00)
  promotionalPrice?: number;
  images: string[];
  orderIndex: number;
  active: boolean;
}

export interface ProfessionalServiceConfig {
  serviceId: string;
  customPrice?: number;
  customDurationMinutes?: number;
  enabled: boolean;
}

export interface ProfessionalDaySchedule {
  dayOfWeek: number; // 0 = Dom, 1 = Seg, 2 = Ter, 3 = Qua, 4 = Qui, 5 = Sex, 6 = Sáb
  dayLabel: string;  // 'Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'
  enabled: boolean;
  startTime?: string;
  endTime?: string;
}

export interface Professional {
  id: string;
  biositeId: string;
  name: string;
  photoUrl?: string;
  color: string; // ex: '#1d4ed8'
  active: boolean;
  services: ProfessionalServiceConfig[];
  workSchedule: ProfessionalDaySchedule[];
  blockedDates: string[]; // ['2026-12-25', ...]
  createdAt: string;
}

export interface CatalogItem {
  id: string;
  type: 'image' | 'video' | 'tour';
  imageUrl: string;
  active: boolean;
  aspectRatio: '16:9' | '1:1' | '4:5' | '9:16';
  fit: 'cover' | 'contain';
  title: string;
  description: string;
  url: string;
  buttonText: string;
  buttonAlign: 'left' | 'center' | 'right';
  mediaType?: 'image' | 'video';
}

export interface CatalogSection {
  id: string;
  title: string;
  itemCount: number;
  active: boolean;
  isExpanded: boolean;
  items?: CatalogItem[];
}

export type AppointmentStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface Appointment {
  id: string;
  biositeId: string;
  serviceId: string;
  serviceName: string;
  customerName: string;
  customerPhone: string;
  appointmentDate: string; // YYYY-MM-DD
  appointmentTime: string; // HH:MM
  durationMinutes: number;
  totalPrice: number;
  status: AppointmentStatus;
  customerNotes?: string;
  createdAt: string;
}

export type AnalyticsEventType = 
  | 'page_view' 
  | 'click_button' 
  | 'service_view' 
  | 'booking_start' 
  | 'booking_complete' 
  | 'pix_copied' 
  | 'wifi_copied' 
  | 'maps_clicked';

export interface AnalyticsEvent {
  id: string;
  biositeId: string;
  eventType: AnalyticsEventType;
  targetId?: string;
  timestamp: string;
}

export interface Biosite {
  id: string;
  agencyId: string;
  clientUserId: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  category: 'manicure' | 'barbearia' | 'estetica' | 'salao' | 'outro';
  avatarUrl: string;
  logoShape?: 'circle' | 'square';
  logoTransparent?: boolean;
  coverType: CoverType;
  coverUrl?: string;
  videoUrl?: string;
  coverGradient?: string;
  instagramHandle: string;
  themeConfig: ThemeConfig;
  contactButtons: ContactButton[];
  pixConfig: PixConfig;
  wifiConfig: WifiConfig;
  locationConfig: LocationConfig;
  address?: any;
  businessHours: DaySchedule[];
  footerBranding: FooterBranding;
  catalogs?: CatalogSection[];
  catalogSettings?: {
    autoplay: boolean;
    interval: number;
  };
  status: 'active' | 'draft' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface AgencySettings {
  name: string;
  url: string;
  tagline: string;
  phone: string;
  logoUrl?: string;
}

export interface CreatorProfile {
  name: string;
  photoUrl: string;
  linkType: 'none' | 'whatsapp' | 'site';
  linkUrl: string;
}

export function isItemVideo(item?: { type?: string; mediaType?: string; imageUrl?: string }): boolean {
  if (!item) return false;
  if (item.mediaType === 'video' || item.type === 'video') return true;
  if (typeof item.imageUrl === 'string') {
    const url = item.imageUrl.toLowerCase();
    if (url.startsWith('data:video/')) return true;
    if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.mov') || url.endsWith('.ogg')) return true;
    if (url.includes('video') && !url.includes('images.unsplash.com')) return true;
  }
  return false;
}

