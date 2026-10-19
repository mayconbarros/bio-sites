import React, { useState } from 'react';
import { Biosite, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { BookingModal } from './BookingModal';
import { CatalogCarousel } from './CatalogCarousel';
import { 
  MessageCircle, 
  Instagram, 
  Phone, 
  Globe, 
  MapPin, 
  Copy, 
  Check, 
  Wifi, 
  QrCode, 
  Clock, 
  ChevronRight, 
  ChevronLeft, 
  ChevronUp,
  ChevronDown,
  Sparkles,
  ExternalLink,
  Navigation,
  Eye,
  EyeOff,
  Mail,
  Send,
  Star,
  Calendar,
  X,
  Zap
} from 'lucide-react';

// Standard BACEN Pix EMV payload generator for dynamic / instant QR code
function generatePixPayload(key: string, name: string, city: string, amount?: number | string): string {
  const cleanKey = (key || '').trim();
  const cleanName = (name || 'Beneficiario').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 25);
  const cleanCity = (city || 'SAO PAULO').normalize('NFD').replace(/[\u0300-\u036f]/g, '').slice(0, 15);
  
  const f = (id: string, val: string) => `${id}${String(val.length).padStart(2, '0')}${val}`;
  
  const gui = f('00', 'br.gov.bcb.pix');
  const keyField = f('01', cleanKey);
  const merchantAccount = f('26', gui + keyField);
  const mcc = f('52', '0000');
  const currency = f('53', '986');
  
  let amountField = '';
  if (amount && Number(amount) > 0) {
    const amtStr = Number(amount).toFixed(2);
    amountField = f('54', amtStr);
  }
  
  const country = f('58', 'BR');
  const nameField = f('59', cleanName);
  const cityField = f('60', cleanCity);
  const additional = f('62', f('05', '***'));
  
  const payloadWithoutCrc = `000201${merchantAccount}${mcc}${currency}${amountField}${country}${nameField}${cityField}${additional}6304`;
  
  let crc = 0xFFFF;
  for (let i = 0; i < payloadWithoutCrc.length; i++) {
    crc ^= payloadWithoutCrc.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xFFFF;
      } else {
        crc = (crc << 1) & 0xFFFF;
      }
    }
  }
  const crcHex = (crc & 0xFFFF).toString(16).toUpperCase().padStart(4, '0');
  return `${payloadWithoutCrc}${crcHex}`;
}

interface BioSiteViewProps {
  biosite: Biosite;
  isMockupFrame?: boolean;
  onMoveButton?: (index: number, direction: 'up' | 'down') => void;
}

export const BioSiteView: React.FC<BioSiteViewProps> = ({ 
  biosite, 
  isMockupFrame = false,
  onMoveButton 
}) => {
  const { services, trackEvent, showToast, creatorProfile } = useApp();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});
  
  // Pix Modal state (1 = Form, 2 = QR Code)
  const [pixModalOpen, setPixModalOpen] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [customerName, setCustomerName] = useState('');
  const [pixAmount, setPixAmount] = useState('50,00');
  const [copiedPixCode, setCopiedPixCode] = useState(false);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    if (!raw) {
      setPixAmount('');
      return;
    }
    const num = parseInt(raw, 10) / 100;
    setPixAmount(num.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  const handleCopyPixCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedPixCode(true);
    trackEvent(biosite.id, 'pix_copied');
    showToast('Código Pix copiado!');
    setTimeout(() => setCopiedPixCode(false), 2500);
  };

  const biositeServices = services.filter(s => s.biositeId === biosite.id && s.active);

  // Categories list
  const categories = ['todos', ...Array.from(new Set(biositeServices.map(s => s.category)))];

  const filteredServices = selectedCategory === 'todos' 
    ? biositeServices 
    : biositeServices.filter(s => s.category === selectedCategory);

  // Check if open now based on schedule
  const getOpenStatus = () => {
    const now = new Date();
    const currentDay = now.getDay();
    const currentSchedule = biosite.businessHours.find(h => h.dayOfWeek === currentDay);

    if (!currentSchedule || currentSchedule.closed) {
      return { isOpen: false, text: 'Fechado hoje' };
    }

    const currentHourMin = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    if (currentHourMin >= currentSchedule.openTime && currentHourMin <= currentSchedule.closeTime) {
      return { isOpen: true, text: `Aberto agora até ${currentSchedule.closeTime}` };
    }
    return { isOpen: false, text: `Fechado (Abre às ${currentSchedule.openTime})` };
  };

  const openStatus = getOpenStatus();

  const handleCopyPix = () => {
    navigator.clipboard.writeText(biosite.pixConfig.pixKey);
    setCopiedPix(true);
    trackEvent(biosite.id, 'pix_copied');
    showToast('Chave Pix copiada com sucesso!');
    setTimeout(() => setCopiedPix(false), 2500);
  };

  const handleCopyWifi = () => {
    navigator.clipboard.writeText(biosite.wifiConfig.password);
    setCopiedWifi(true);
    trackEvent(biosite.id, 'wifi_copied');
    showToast('Senha do Wi-Fi copiada!');
    setTimeout(() => setCopiedWifi(false), 2500);
  };

  const handleOpenBooking = (serviceId?: string) => {
    if (serviceId) {
      setSelectedServiceId(serviceId);
      trackEvent(biosite.id, 'service_view', serviceId);
    } else {
      setSelectedServiceId(null);
    }
    trackEvent(biosite.id, 'booking_start');
    setBookingOpen(true);
  };

  const nextImage = (serviceId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => ({
      ...prev,
      [serviceId]: ((prev[serviceId] || 0) + 1) % max,
    }));
  };

  const prevImage = (serviceId: string, max: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveImageIndex(prev => ({
      ...prev,
      [serviceId]: ((prev[serviceId] || 0) - 1 + max) % max,
    }));
  };

  // Button style class mapper
  const getButtonClass = () => {
    switch (biosite.themeConfig.buttonStyle) {
      case 'pill':
        return 'rounded-full';
      case 'sharp':
        return 'rounded-none';
      case 'glass':
        return 'rounded-2xl backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20';
      case 'rounded':
      default:
        return 'rounded-2xl';
    }
  };

  const isLightBg = !biosite.themeConfig.bgColor || 
    biosite.themeConfig.bgColor.toLowerCase() === '#ffffff' || 
    biosite.themeConfig.bgColor.toLowerCase() === '#fff' || 
    biosite.themeConfig.bgColor.toLowerCase() === '#f8fafc' || 
    biosite.themeConfig.bgColor.toLowerCase() === '#fafafa';

  // Helper to render icon for any button model
  const renderButtonIcon = (btn: any) => {
    const isWpp = btn.isWhatsApp || btn.icon === 'whatsapp' || btn.label?.toLowerCase().includes('whatsapp');
    const isInsta = btn.icon === 'instagram' || btn.label?.toLowerCase().includes('instagram');
    const isPix = btn.type === 'Pix' || btn.id === 'btn-pix' || btn.isSpecial === 'pix' || btn.icon === 'QrCode';
    const isWifi = btn.type === 'WiFi' || btn.id === 'btn-wifi' || btn.isSpecial === 'wifi' || btn.icon === 'Wifi';
    const isBooking = btn.type === 'Agendar' || btn.id === 'btn-booking' || btn.isSpecial === 'booking' || (btn.label && btn.label.toLowerCase().includes('agendar'));

    if (isBooking) return <Calendar className="w-4 h-4" />;
    if (isPix) return <QrCode className="w-4 h-4" />;
    if (isWifi) return <Wifi className="w-4 h-4" />;
    if (isWpp) return <MessageCircle className="w-4 h-4" />;
    if (isInsta) return <Instagram className="w-4 h-4" />;
    if (btn.icon === 'phone' || btn.type === 'Ligar') return <Phone className="w-4 h-4" />;
    if (btn.icon === 'mail' || btn.type === 'Email') return <Mail className="w-4 h-4" />;
    if (btn.icon === 'Calendar' || btn.type === 'Agendar') return <Calendar className="w-4 h-4" />;
    if (btn.icon === 'Star' || btn.type === 'Avaliar no Google') return <Star className="w-4 h-4" />;
    if (btn.icon === 'Send' || btn.type === 'Telegram') return <Send className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  const getButtonHref = (btn: any) => {
    const isSpecial = btn.type === 'Agendar' || btn.type === 'Pix' || btn.type === 'WiFi' || btn.isSpecial;
    if (isSpecial) return '#';
    const isWpp = btn.isWhatsApp || btn.icon === 'whatsapp' || btn.label?.toLowerCase().includes('whatsapp');
    if (isWpp && btn.prefilledMessage) {
      return `${btn.url || 'https://wa.me/5598991506106'}?text=${encodeURIComponent(btn.prefilledMessage)}`;
    }
    return btn.url || '#';
  };

  const getButtonColors = (btn: any) => {
    const isWpp = btn.isWhatsApp || btn.icon === 'whatsapp' || btn.label?.toLowerCase().includes('whatsapp');
    const isInsta = btn.icon === 'instagram' || btn.label?.toLowerCase().includes('instagram');
    const isBooking = btn.type === 'Agendar' || btn.id === 'btn-booking' || btn.isSpecial === 'booking';
    const isPix = btn.type === 'Pix' || btn.id === 'btn-pix' || btn.isSpecial === 'pix';
    const isWifi = btn.type === 'WiFi' || btn.id === 'btn-wifi' || btn.isSpecial === 'wifi';

    if (btn.bgColor && btn.bgColor !== 'padrão') {
      const text = (btn.textColor && btn.textColor !== 'padrão') ? btn.textColor : '#ffffff';
      return { bg: btn.bgColor, text };
    }

    if (isBooking) {
      return {
        bg: biosite.themeConfig.primaryColor,
        text: biosite.themeConfig.primaryTextColor,
      };
    }
    if (isPix) {
      const bg = (biosite.pixConfig?.buttonBgColor && biosite.pixConfig.buttonBgColor !== 'padrão') 
        ? biosite.pixConfig.buttonBgColor 
        : '#e1306c';
      const text = (biosite.pixConfig?.buttonTextColor && biosite.pixConfig.buttonTextColor !== 'padrão') 
        ? biosite.pixConfig.buttonTextColor 
        : '#ffffff';
      return { bg, text };
    }
    if (isWifi) {
      const bg = (biosite.wifiConfig?.buttonBgColor && biosite.wifiConfig.buttonBgColor !== 'padrão') 
        ? biosite.wifiConfig.buttonBgColor 
        : biosite.themeConfig.cardBg;
      const text = (biosite.wifiConfig?.buttonTextColor && biosite.wifiConfig.buttonTextColor !== 'padrão') 
        ? biosite.wifiConfig.buttonTextColor 
        : biosite.themeConfig.textColor;
      return { bg, text };
    }
    if (isWpp) {
      return { bg: '#22c55e', text: '#ffffff' };
    }
    if (isInsta) {
      return { bg: '#e1306c', text: '#ffffff' };
    }
    return {
      bg: biosite.themeConfig.cardBg,
      text: biosite.themeConfig.textColor || '#ffffff',
    };
  };

  const handleButtonClick = (btn: any, e: React.MouseEvent) => {
    trackEvent(biosite.id, 'click_button', btn.id);
    const isBooking = btn.type === 'Agendar' || btn.id === 'btn-booking' || btn.isSpecial === 'booking' || (btn.label && btn.label.toLowerCase().includes('agendar'));
    const isPix = btn.type === 'Pix' || btn.id === 'btn-pix' || btn.isSpecial === 'pix';
    const isWifi = btn.type === 'WiFi' || btn.id === 'btn-wifi' || btn.isSpecial === 'wifi';

    if (isBooking) {
      e.preventDefault();
      handleOpenBooking();
      return;
    }
    if (isPix) {
      e.preventDefault();
      setStep(1);
      setPixModalOpen(true);
      return;
    }
    if (isWifi) {
      e.preventDefault();
      handleCopyWifi();
      return;
    }
  };

  // Unified buttons list: always includes special buttons (booking, pix, wifi) if enabled/configured
  const effectiveButtons = React.useMemo(() => {
    const list = [...(biosite.contactButtons || [])];
    const hasBooking = list.some(b => b.type === 'Agendar' || b.id === 'btn-booking' || (b as any).isSpecial === 'booking' || (b.label && b.label.toLowerCase().includes('agendar')));
    const hasPix = list.some(b => b.type === 'Pix' || b.id === 'btn-pix' || (b as any).isSpecial === 'pix');
    const hasWifi = list.some(b => b.type === 'WiFi' || b.id === 'btn-wifi' || (b as any).isSpecial === 'wifi');

    if (!hasBooking) {
      list.push({
        id: 'btn-booking',
        label: 'Agendar',
        icon: 'Calendar',
        lucideIcon: 'Calendar',
        url: '#agendar',
        isWhatsApp: false,
        active: true,
        type: 'Agendar',
        isSpecial: 'booking',
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: '#ff2a85',
        textColor: '#ffffff',
      });
    }
    if (!hasPix && biosite.pixConfig?.pixKey) {
      list.push({
        id: 'btn-pix',
        label: 'Chave Pix',
        icon: 'QrCode',
        lucideIcon: 'QrCode',
        url: '#pix',
        isWhatsApp: false,
        active: true,
        type: 'Pix',
        isSpecial: 'pix',
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: biosite.pixConfig.buttonBgColor || 'padrão',
        textColor: biosite.pixConfig.buttonTextColor || 'padrão',
      });
    }
    if (!hasWifi && biosite.wifiConfig?.networkName) {
      list.push({
        id: 'btn-wifi',
        label: `Wi-Fi: ${biosite.wifiConfig.networkName}`,
        icon: 'Wifi',
        lucideIcon: 'Wifi',
        url: '#wifi',
        isWhatsApp: false,
        active: true,
        type: 'WiFi',
        isSpecial: 'wifi',
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: biosite.wifiConfig.buttonBgColor || 'padrão',
        textColor: biosite.wifiConfig.buttonTextColor || 'padrão',
      });
    }
    return list;
  }, [biosite.contactButtons, biosite.pixConfig, biosite.wifiConfig]);

  return (
    <div 
      className={`min-h-full w-full transition-colors relative selection:bg-pink-500 selection:text-white ${
        isMockupFrame ? 'p-0 text-sm' : 'max-w-md mx-auto min-h-screen shadow-2xl'
      }`}
      style={{
        background: biosite.themeConfig.bgGradient || biosite.themeConfig.bgColor || '#ffffff',
        color: biosite.themeConfig.textColor || (isLightBg ? '#171717' : '#ffffff'),
        fontFamily: biosite.themeConfig.fontFamily,
      }}
    >
      {/* Top Cover Banner */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-neutral-900">
        {(biosite as any).videoUrl ? (
          <video 
            src={(biosite as any).videoUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover" 
          />
        ) : biosite.coverType === 'image' && biosite.coverUrl ? (
          <img 
            src={biosite.coverUrl} 
            alt="Capa do bio site" 
            className="w-full h-full object-cover transform hover:scale-105 transition duration-700" 
          />
        ) : biosite.coverType === 'video' && biosite.coverUrl ? (
          <video 
            src={biosite.coverUrl} 
            autoPlay 
            loop 
            muted 
            playsInline 
            className="w-full h-full object-cover" 
          />
        ) : (
          <div 
            className="w-full h-full"
            style={{
              background: `linear-gradient(135deg, ${biosite.themeConfig.primaryColor}88, ${biosite.themeConfig.bgColor})`
            }}
          />
        )}
        {/* Subtle dark gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/80" />
      </div>

      {/* Main Container */}
      <div className="px-4 pb-12 -mt-16 relative z-10 space-y-6">
        
        {/* Profile Card & Header */}
        <div className="flex flex-col items-center text-center">
          <div className="relative">
            {(() => {
              const isSquareLogo = (biosite as any).logoShape === 'square';
              const isTransparentLogo = (biosite as any).logoTransparent;
              return (
                <div 
                  className={`w-24 h-24 sm:w-28 sm:h-28 ${isSquareLogo ? 'rounded-2xl' : 'rounded-full'} p-1 ${isTransparentLogo ? 'bg-transparent shadow-none' : 'shadow-2xl'} relative`}
                  style={{
                    background: isTransparentLogo ? 'transparent' : `linear-gradient(135deg, ${biosite.themeConfig.primaryColor}, ${biosite.themeConfig.accentColor})`,
                  }}
                >
                  <img 
                    src={biosite.avatarUrl} 
                    alt={biosite.title}
                    className={`w-full h-full object-cover ${isSquareLogo ? 'rounded-2xl' : 'rounded-full'} ${isTransparentLogo ? 'bg-transparent border-0' : 'bg-neutral-800 border-2 border-black'}`} 
                  />
                </div>
              );
            })()}

            {/* Pulsating Open/Closed Badge */}
            <div 
              className={`absolute bottom-0 right-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1.5 shadow-md border ${
                openStatus.isOpen 
                  ? 'bg-emerald-950/90 text-emerald-300 border-emerald-500/50' 
                  : 'bg-neutral-900/90 text-neutral-400 border-neutral-700'
              }`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${openStatus.isOpen ? 'bg-emerald-400 animate-ping' : 'bg-neutral-500'}`} />
              {openStatus.isOpen ? 'Aberto' : 'Fechado'}
            </div>
          </div>

          <h1 className="mt-3 text-2xl font-extrabold tracking-tight">
            {biosite.title}
          </h1>

          <p 
            className="text-xs font-medium uppercase tracking-wider mt-0.5"
            style={{ color: biosite.themeConfig.textMutedColor }}
          >
            {biosite.subtitle}
          </p>

          {biosite.instagramHandle && (
            <a 
              href={`https://instagram.com/${biosite.instagramHandle.replace('@', '')}`}
              target="_blank"
              rel="noreferrer"
              className="mt-1.5 text-xs font-semibold hover:underline flex items-center gap-1 transition"
              style={{ color: biosite.themeConfig.primaryColor }}
            >
              <Instagram className="w-3.5 h-3.5" />
              {biosite.instagramHandle}
            </a>
          )}

          <p 
            className="mt-2.5 text-xs leading-relaxed max-w-xs"
            style={{ color: biosite.themeConfig.textMutedColor }}
          >
            {biosite.description}
          </p>
        </div>

        {/* Icon Only Buttons Row (only when not in editor reorder mode) */}
        {!onMoveButton && (() => {
          const iconOnlyButtons = effectiveButtons.filter(b => b.active && b.displayMode === 'icon_only');
          if (iconOnlyButtons.length === 0) return null;
          return (
            <div className="flex items-center justify-center gap-3 py-1">
              {iconOnlyButtons.map(btn => {
                const isWpp = btn.isWhatsApp || btn.icon === 'whatsapp';
                const isInsta = btn.icon === 'instagram' || btn.label.toLowerCase().includes('instagram');
                return (
                  <a
                    key={btn.id}
                    href={btn.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => trackEvent(biosite.id, 'click_button', btn.id)}
                    className={`w-11 h-11 rounded-full flex items-center justify-center transition shadow-md hover:scale-110 active:scale-95 ${
                      btn.pulseEffect ? 'animate-pulse' : ''
                    } ${
                      isInsta 
                        ? 'bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white' 
                        : isWpp 
                          ? 'bg-[#25D366] text-white' 
                          : 'bg-white text-neutral-800'
                    }`}
                    style={{
                      backgroundColor: btn.bgColor && btn.bgColor !== 'padrão' ? btn.bgColor : undefined,
                      color: btn.textColor && btn.textColor !== 'padrão' ? btn.textColor : undefined,
                    }}
                    title={btn.label}
                  >
                    {isInsta ? (
                      <Instagram className="w-5 h-5" />
                    ) : isWpp ? (
                      <MessageCircle className="w-5 h-5" />
                    ) : (
                      <Globe className="w-5 h-5" />
                    )}
                  </a>
                );
              })}
            </div>
          );
        })()}

        {/* Unified Action Buttons List (WhatsApp, Instagram, Pix, WiFi, Booking, Custom Links) */}
        <div className="space-y-2.5">
          {effectiveButtons
            .filter(b => b.active && (onMoveButton ? true : b.displayMode !== 'icon_only'))
            .map((btn, index, arr) => {
              const isFirst = index === 0;
              const isLast = index === arr.length - 1;
              const colors = getButtonColors(btn);
              const href = getButtonHref(btn);

              return (
                <div key={btn.id} className="relative group">
                  <a
                    href={href}
                    target={href.startsWith('http') ? '_blank' : undefined}
                    rel={href.startsWith('http') ? 'noreferrer' : undefined}
                    onClick={(e) => handleButtonClick(btn, e)}
                    className={`w-full py-3.5 px-4 flex items-center justify-between transition font-bold text-sm border shadow-sm ${getButtonClass()} ${
                      btn.pulseEffect ? 'animate-pulse' : ''
                    } hover:brightness-105 active:scale-[0.99] cursor-pointer`}
                    style={{
                      backgroundColor: colors.bg,
                      color: colors.text,
                      borderColor: 'rgba(255,255,255,0.15)',
                    }}
                  >
                    <div className="flex items-center gap-2.5">
                      {renderButtonIcon(btn)}
                      <span>{btn.label}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 opacity-80 group-hover:translate-x-1 transition" />
                  </a>

                  {/* Hover Quick Reorder Arrows - Unified for ALL buttons */}
                  {onMoveButton && (
                    <div className="absolute right-2.5 top-1/2 -translate-y-1/2 z-10 flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity bg-neutral-900/90 backdrop-blur-xs p-1 rounded-lg border border-white/20 shadow-lg pointer-events-auto">
                      <button
                        type="button"
                        disabled={isFirst}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!isFirst) onMoveButton(index, 'up');
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center transition ${
                          isFirst 
                            ? 'opacity-25 cursor-not-allowed text-neutral-400' 
                            : 'text-white hover:bg-white/20 cursor-pointer'
                        }`}
                        title={isFirst ? undefined : 'Subir botão'}
                      >
                        <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                      <button
                        type="button"
                        disabled={isLast}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          if (!isLast) onMoveButton(index, 'down');
                        }}
                        className={`w-5 h-5 rounded flex items-center justify-center transition ${
                          isLast 
                            ? 'opacity-25 cursor-not-allowed text-neutral-400' 
                            : 'text-white hover:bg-white/20 cursor-pointer'
                        }`}
                        title={isLast ? undefined : 'Descer botão'}
                      >
                        <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
        </div>

        {/* CUSTOM BIOSITE CATALOGS (Banners / Fotos / Vídeos / Promoções) */}
        {biosite.catalogs && biosite.catalogs.filter(c => c.active && c.items && c.items.length > 0).map(catalog => (
          <div key={catalog.id} className="pt-2">
            {/* Nome do catálogo fora e acima do card branco principal */}
            {catalog.title && (
              <h3 
                className="text-sm font-bold tracking-tight mb-2 text-left"
                style={{ color: isLightBg ? '#171717' : biosite.themeConfig.textColor }}
              >
                {catalog.title}
              </h3>
            )}

            <CatalogCarousel
              catalog={catalog}
              autoplay={biosite.catalogSettings?.autoplay ?? true}
              intervalSeconds={biosite.catalogSettings?.interval ?? 5}
            />
          </div>
        ))}





        {/* LOCATION & GOOGLE MAPS */}
        {biosite.locationConfig?.enabled && biosite.locationConfig?.address && (
          <div className="w-full space-y-3 bg-transparent">
            {/* 1. Título (Solto no fundo) */}
            <div className="flex items-center gap-2 bg-transparent">
              <MapPin className="w-4 h-4 text-neutral-800 shrink-0" />
              <span className="text-sm font-bold text-neutral-900">
                Como chegar
              </span>
            </div>

            {/* 2. Texto do Endereço (Solto no fundo) */}
            <p className="text-xs sm:text-sm text-neutral-700 whitespace-pre-line leading-relaxed font-normal">
              {biosite.locationConfig.address}
            </p>

            {/* 3. O Mapa (Card com bordas arredondadas, borda cinza clara e overflow hidden) */}
            <div className="w-full h-48 rounded-xl border border-neutral-200 overflow-hidden bg-neutral-100 shadow-2xs">
              <iframe
                title="Google Maps"
                src={`https://maps.google.com/maps?q=${encodeURIComponent(biosite.locationConfig.address)}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                className="w-full h-full border-0"
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>

            {/* 4. Botão Final (Solto no fundo) */}
            <a
              href={`https://maps.google.com/maps?q=${encodeURIComponent(biosite.locationConfig.address)}`}
              target="_blank"
              rel="noreferrer"
              onClick={() => trackEvent(biosite.id, 'maps_clicked')}
              className="w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition shadow-xs hover:opacity-90 active:scale-[0.99] cursor-pointer"
              style={{
                backgroundColor: biosite.locationConfig.buttonBgColor || '#10b981',
                color: biosite.locationConfig.buttonTextColor || '#ffffff',
              }}
            >
              <Send className="w-4 h-4" />
              <span>{biosite.locationConfig.buttonText || 'Como chegar'}</span>
            </a>
          </div>
        )}


        {/* RODAPÉ DO MINI-SITE: Assinatura do Criador ("Feito por...") */}
        <div className="mt-8 pb-4 flex items-center justify-center text-center text-xs text-neutral-800 select-none">
          {creatorProfile?.linkType !== 'none' && creatorProfile?.linkUrl ? (
            <a
              href={creatorProfile.linkUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 hover:opacity-80 transition cursor-pointer text-neutral-800"
            >
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0">
                {creatorProfile.photoUrl ? (
                  <img src={creatorProfile.photoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#00e5ff] font-extrabold text-[7px] tracking-tighter font-mono">
                    on
                  </span>
                )}
              </div>
              <span>Feito por&nbsp;<strong>{creatorProfile.name || 'Vision Local'}</strong></span>
            </a>
          ) : (
            <div className="inline-flex items-center gap-1.5 text-neutral-800">
              <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0">
                {creatorProfile?.photoUrl ? (
                  <img src={creatorProfile.photoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-[#00e5ff] font-extrabold text-[7px] tracking-tighter font-mono">
                    on
                  </span>
                )}
              </div>
              <span>Feito por&nbsp;<strong>{creatorProfile?.name || 'Vision Local'}</strong></span>
            </div>
          )}
        </div>

      </div>

      {/* Booking Modal */}
      <BookingModal
        biosite={biosite}
        services={biositeServices}
        preselectedServiceId={selectedServiceId}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />

      {/* Pix Payment Modal (Strict fidelity to reference prints) */}
      {pixModalOpen && (
        <div className={`${isMockupFrame ? 'absolute' : 'fixed'} inset-0 z-50 flex items-center justify-center p-3 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150`}>
          <div className="w-full max-w-[320px] bg-white rounded-2xl p-5 shadow-2xl relative z-50 text-center text-neutral-900 animate-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              type="button"
              onClick={() => {
                setPixModalOpen(false);
                setStep(1);
              }}
              className="absolute top-3.5 right-3.5 p-1 text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Profile Avatar */}
            <div className="w-14 h-14 rounded-full border-2 border-white shadow-md mx-auto overflow-hidden mb-2.5 bg-neutral-100">
              <img 
                src={biosite.avatarUrl || biosite.coverUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2'} 
                alt={biosite.title} 
                className="w-full h-full object-cover" 
              />
            </div>

            {step === 1 ? (
              /* ETAPA 1: FORMULÁRIO DE VALOR (Print 1) */
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Pagar com Pix
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                  Preencha os dados — o Pix cai direto pra {biosite.pixConfig.beneficiaryName || biosite.title}.
                </p>

                <div className="text-left mt-4 space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 block">
                    Seu nome
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: João Silva"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 text-neutral-800 text-xs placeholder:text-neutral-400 focus:outline-none focus:border-[#ff007f] focus:bg-white transition"
                  />
                </div>

                <div className="text-left mt-3 space-y-1">
                  <label className="text-xs font-semibold text-neutral-800 block">
                    Valor (R$)
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="50,00"
                    value={pixAmount}
                    onChange={handleAmountChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 text-neutral-800 text-xs font-semibold placeholder:text-neutral-400 focus:outline-none focus:border-[#ff007f] focus:bg-white transition"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="w-full mt-4 py-3 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-2 shadow-sm transition cursor-pointer"
                  style={{ backgroundColor: biosite.themeConfig.primaryColor || '#ff007f' }}
                >
                  <QrCode className="w-4 h-4" />
                  <span>Gerar Pix</span>
                </button>
              </div>
            ) : (
              /* ETAPA 2: QR CODE E CÓDIGO (Print 2) */
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Escaneie ou copie
                </h3>
                <p className="text-[11px] text-neutral-500 mt-1 leading-snug">
                  Abra o app do seu banco e leia o QR Code ou cole o código.
                </p>

                {/* QR Code */}
                <div className="my-2.5 p-2 rounded-2xl border border-neutral-100 bg-white shadow-2xs inline-block mx-auto">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                      generatePixPayload(
                        biosite.pixConfig.pixKey,
                        biosite.pixConfig.beneficiaryName,
                        biosite.pixConfig.city,
                        parseFloat((pixAmount || '50,00').replace(/\./g, '').replace(',', '.')) || 50
                      )
                    )}`}
                    alt="QR Code Pix"
                    className="w-44 h-44 rounded-lg object-contain mx-auto"
                  />
                </div>

                {/* Caixa cinza clara com o código Pix Copia e Cola */}
                <div className="p-2.5 rounded-xl bg-neutral-100 border border-neutral-200 text-neutral-600 font-mono text-[9px] leading-tight break-all max-h-16 overflow-y-auto select-all text-left">
                  {generatePixPayload(
                    biosite.pixConfig.pixKey,
                    biosite.pixConfig.beneficiaryName,
                    biosite.pixConfig.city,
                    parseFloat((pixAmount || '50,00').replace(/\./g, '').replace(',', '.')) || 50
                  )}
                </div>

                {/* Botões lado a lado */}
                <div className="flex gap-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-neutral-700 font-semibold text-xs flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    ← Voltar
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      handleCopyPixCode(
                        generatePixPayload(
                          biosite.pixConfig.pixKey,
                          biosite.pixConfig.beneficiaryName,
                          biosite.pixConfig.city,
                          parseFloat((pixAmount || '50,00').replace(/\./g, '').replace(',', '.')) || 50
                        )
                      )
                    }
                    className="flex-1 py-2.5 px-3 rounded-xl font-bold text-white text-xs flex items-center justify-center gap-1.5 shadow-sm transition cursor-pointer"
                    style={{ backgroundColor: biosite.themeConfig.primaryColor || '#ff007f' }}
                  >
                    {copiedPixCode ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Copiado!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copiar Pix</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Rodapé discreto */}
                <p className="text-[10px] text-neutral-500 mt-2.5 text-center leading-tight">
                  Após pagar, o valor cai <strong>direto</strong> na conta de {biosite.pixConfig.beneficiaryName || biosite.title}.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
