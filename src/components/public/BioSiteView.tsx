import React, { useState } from 'react';
import { Biosite, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { BookingModal } from './BookingModal';
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
  Sparkles,
  ExternalLink,
  Navigation,
  Eye,
  EyeOff
} from 'lucide-react';

interface BioSiteViewProps {
  biosite: Biosite;
  isMockupFrame?: boolean;
}

export const BioSiteView: React.FC<BioSiteViewProps> = ({ biosite, isMockupFrame = false }) => {
  const { services, trackEvent, showToast } = useApp();

  const [bookingOpen, setBookingOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('todos');
  const [copiedPix, setCopiedPix] = useState(false);
  const [copiedWifi, setCopiedWifi] = useState(false);
  const [showWifiPassword, setShowWifiPassword] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [activeImageIndex, setActiveImageIndex] = useState<Record<string, number>>({});

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

  return (
    <div 
      className={`min-h-full w-full transition-colors relative selection:bg-pink-500 selection:text-white ${
        isMockupFrame ? 'p-0 text-sm' : 'max-w-md mx-auto min-h-screen shadow-2xl'
      }`}
      style={{
        background: biosite.themeConfig.bgGradient || biosite.themeConfig.bgColor,
        color: biosite.themeConfig.textColor,
        fontFamily: biosite.themeConfig.fontFamily,
      }}
    >
      {/* Top Cover Banner */}
      <div className="relative w-full h-44 sm:h-52 overflow-hidden bg-neutral-900">
        {biosite.coverType === 'image' && biosite.coverUrl ? (
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
            <div 
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-full p-1 shadow-2xl relative"
              style={{
                background: `linear-gradient(135deg, ${biosite.themeConfig.primaryColor}, ${biosite.themeConfig.accentColor})`,
              }}
            >
              <img 
                src={biosite.avatarUrl} 
                alt={biosite.title}
                className="w-full h-full object-cover rounded-full bg-neutral-800 border-2 border-black" 
              />
            </div>

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

          {/* Quick Booking Hero CTA Button */}
          <button
            onClick={() => handleOpenBooking()}
            className={`w-full mt-4 py-3.5 px-6 font-bold shadow-xl transition transform active:scale-95 flex items-center justify-center gap-2 text-sm ${getButtonClass()}`}
            style={{
              backgroundColor: biosite.themeConfig.primaryColor,
              color: biosite.themeConfig.primaryTextColor,
              boxShadow: `0 10px 25px -5px ${biosite.themeConfig.primaryColor}55`,
            }}
          >
            <Sparkles className="w-4 h-4 animate-spin-slow" />
            Agendar Horário Online
          </button>
        </div>

        {/* Action Buttons (WhatsApp, Links) */}
        <div className="space-y-2.5">
          {biosite.contactButtons.filter(b => b.active).map(btn => {
            const isWpp = btn.isWhatsApp;
            return (
              <a
                key={btn.id}
                href={
                  isWpp && btn.prefilledMessage 
                    ? `${btn.url}?text=${encodeURIComponent(btn.prefilledMessage)}` 
                    : btn.url
                }
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent(biosite.id, 'click_button', btn.id)}
                className={`w-full py-3 px-4 flex items-center justify-between transition group font-semibold text-sm border ${getButtonClass()} ${
                  isWpp 
                    ? 'bg-emerald-600/90 hover:bg-emerald-500 text-white border-emerald-500/40 shadow-md shadow-emerald-950/20' 
                    : 'hover:brightness-110'
                }`}
                style={{
                  backgroundColor: !isWpp ? biosite.themeConfig.cardBg : undefined,
                  borderColor: !isWpp ? `${biosite.themeConfig.primaryColor}33` : undefined,
                }}
              >
                <div className="flex items-center gap-2.5">
                  {btn.icon === 'whatsapp' && <MessageCircle className="w-4 h-4 text-emerald-300" />}
                  {btn.icon === 'instagram' && <Instagram className="w-4 h-4 text-pink-400" />}
                  {btn.icon === 'phone' && <Phone className="w-4 h-4 text-blue-400" />}
                  {btn.icon === 'globe' && <Globe className="w-4 h-4 text-amber-400" />}
                  {btn.icon === 'map' && <MapPin className="w-4 h-4 text-red-400" />}
                  <span>{btn.label}</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition" />
              </a>
            );
          })}
        </div>

        {/* SERVICES CATALOG & CAROUSEL */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Sparkles className="w-4 h-4" style={{ color: biosite.themeConfig.primaryColor }} />
              Catálogo de Serviços
            </h2>
            <span className="text-[11px] text-neutral-400 font-medium">
              {biositeServices.length} disponíveis
            </span>
          </div>

          {/* Category Filter Pills */}
          {categories.length > 2 && (
            <div className="flex gap-1.5 overflow-x-auto pb-1.5 scrollbar-none text-xs">
              {categories.map(cat => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full capitalize whitespace-nowrap font-medium transition ${
                    selectedCategory === cat
                      ? 'bg-white text-black font-bold shadow'
                      : 'bg-black/30 hover:bg-black/50 text-neutral-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* Services List / Cards */}
          <div className="space-y-3.5">
            {filteredServices.map(service => {
              const currentImgIdx = activeImageIndex[service.id] || 0;
              const hasImages = service.images && service.images.length > 0;
              const currentImage = hasImages ? service.images[currentImgIdx] : null;

              return (
                <div 
                  key={service.id}
                  className={`overflow-hidden border transition group relative ${getButtonClass()}`}
                  style={{
                    backgroundColor: biosite.themeConfig.cardBg,
                    borderColor: `${biosite.themeConfig.primaryColor}25`,
                  }}
                >
                  {/* Photo Carousel Header */}
                  {hasImages && (
                    <div className="relative h-40 w-full overflow-hidden bg-black/40">
                      <img 
                        src={currentImage!} 
                        alt={service.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      
                      {/* Image count pills */}
                      {service.images.length > 1 && (
                        <>
                          <button
                            onClick={(e) => prevImage(service.id, service.images.length, e)}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
                          >
                            <ChevronLeft className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={(e) => nextImage(service.id, service.images.length, e)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-white backdrop-blur-sm transition"
                          >
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
                            {service.images.map((_, i) => (
                              <span 
                                key={i} 
                                className={`w-1.5 h-1.5 rounded-full transition-all ${
                                  i === currentImgIdx ? 'bg-white w-3' : 'bg-white/40'
                                }`} 
                              />
                            ))}
                          </div>
                        </>
                      )}

                      {/* Promo Badge */}
                      {service.promotionalPrice && (
                        <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-red-600/90 backdrop-blur-sm text-white text-[10px] font-bold tracking-wide uppercase shadow">
                          Promoção
                        </div>
                      )}
                    </div>
                  )}

                  {/* Service Details */}
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-bold text-sm text-white group-hover:text-pink-300 transition">
                          {service.name}
                        </h3>
                        <div className="flex items-center gap-2 text-[11px] text-neutral-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-neutral-400" />
                            {service.durationMinutes} min
                          </span>
                          <span>•</span>
                          <span>{service.category}</span>
                        </div>
                      </div>

                      {/* Price Tag */}
                      <div className="text-right">
                        {service.promotionalPrice ? (
                          <>
                            <span className="text-[10px] text-neutral-400 line-through block">
                              R$ {service.price.toFixed(2).replace('.', ',')}
                            </span>
                            <span className="text-sm font-extrabold text-emerald-400">
                              R$ {service.promotionalPrice.toFixed(2).replace('.', ',')}
                            </span>
                          </>
                        ) : (
                          <span className="text-sm font-extrabold text-emerald-400">
                            R$ {service.price.toFixed(2).replace('.', ',')}
                          </span>
                        )}
                      </div>
                    </div>

                    <p className="text-xs leading-relaxed line-clamp-2" style={{ color: biosite.themeConfig.textMutedColor }}>
                      {service.description}
                    </p>

                    {/* Action button inside card */}
                    <button
                      onClick={() => handleOpenBooking(service.id)}
                      className={`w-full py-2 px-3 mt-1 text-xs font-bold transition flex items-center justify-center gap-1.5 shadow ${getButtonClass()}`}
                      style={{
                        backgroundColor: biosite.themeConfig.primaryColor,
                        color: biosite.themeConfig.primaryTextColor,
                      }}
                    >
                      <Clock className="w-3 h-3" />
                      Agendar este Serviço
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* PIX PAYMENT CARD */}
        {biosite.pixConfig.enabled && (
          <div 
            className={`p-4 border transition relative overflow-hidden ${getButtonClass()}`}
            style={{
              backgroundColor: biosite.themeConfig.cardBg,
              borderColor: `${biosite.themeConfig.primaryColor}30`,
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-teal-500/20 text-teal-400 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400">
                    Chave Pix Oficial
                  </h4>
                  <p className="text-[11px] text-neutral-400">
                    {biosite.pixConfig.beneficiaryName}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowQrModal(!showQrModal)}
                className="text-[11px] font-medium text-teal-400 hover:underline flex items-center gap-1"
              >
                {showQrModal ? 'Ocultar QR' : 'Ver QR Code'}
              </button>
            </div>

            {/* Pix Key Display & Copy */}
            <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800 flex items-center justify-between text-xs mt-2">
              <span className="font-mono text-neutral-200 select-all truncate pr-2">
                {biosite.pixConfig.pixKey}
              </span>
              <button
                onClick={handleCopyPix}
                className="px-3 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white font-bold flex items-center gap-1 transition text-xs shrink-0 shadow"
              >
                {copiedPix ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            {/* QR Code Graphic preview */}
            {showQrModal && (
              <div className="mt-3 p-4 rounded-xl bg-white text-black text-center flex flex-col items-center justify-center animate-in zoom-in-95 duration-200">
                <QrCode className="w-28 h-28 text-neutral-900" />
                <span className="text-xs font-bold mt-1 text-neutral-800">
                  {biosite.pixConfig.beneficiaryName}
                </span>
                <span className="text-[10px] text-neutral-500">
                  {biosite.pixConfig.city}
                </span>
              </div>
            )}
          </div>
        )}

        {/* WI-FI CLIENT CARD */}
        {biosite.wifiConfig.enabled && (
          <div 
            className={`p-4 border transition ${getButtonClass()}`}
            style={{
              backgroundColor: biosite.themeConfig.cardBg,
              borderColor: `${biosite.themeConfig.primaryColor}30`,
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center">
                <Wifi className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-blue-400">
                  Wi-Fi para Clientes
                </h4>
                <p className="text-[11px] text-neutral-400">
                  Rede: <strong className="text-white">{biosite.wifiConfig.networkName}</strong>
                </p>
              </div>
            </div>

            <div className="p-2.5 rounded-xl bg-black/40 border border-neutral-800 flex items-center justify-between text-xs mt-2">
              <div className="flex items-center gap-2">
                <span className="text-neutral-400 text-[11px]">Senha:</span>
                <span className="font-mono text-neutral-200">
                  {showWifiPassword ? biosite.wifiConfig.password : '••••••••••••'}
                </span>
                <button
                  type="button"
                  onClick={() => setShowWifiPassword(!showWifiPassword)}
                  className="text-neutral-400 hover:text-white"
                >
                  {showWifiPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              <button
                onClick={handleCopyWifi}
                className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center gap-1 transition text-xs shrink-0 shadow"
              >
                {copiedWifi ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiada!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar Senha
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* LOCATION & GOOGLE MAPS */}
        {biosite.locationConfig.enabled && (
          <div 
            className={`p-4 border transition space-y-3 ${getButtonClass()}`}
            style={{
              backgroundColor: biosite.themeConfig.cardBg,
              borderColor: `${biosite.themeConfig.primaryColor}30`,
            }}
          >
            <div className="flex items-start gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-red-500/20 text-red-400 flex items-center justify-center shrink-0 mt-0.5">
                <MapPin className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-red-400">
                  Onde Estamos
                </h4>
                <p className="text-xs text-white font-medium mt-0.5">
                  {biosite.locationConfig.address}
                </p>
                <p className="text-[11px] text-neutral-400">
                  {biosite.locationConfig.cityState}
                </p>
              </div>
            </div>

            {/* Route buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <a
                href={biosite.locationConfig.googleMapsUrl}
                target="_blank"
                rel="noreferrer"
                onClick={() => trackEvent(biosite.id, 'maps_clicked')}
                className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700"
              >
                <Navigation className="w-3.5 h-3.5 text-blue-400" />
                Google Maps
              </a>
              {biosite.locationConfig.wazeUrl && (
                <a
                  href={biosite.locationConfig.wazeUrl}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => trackEvent(biosite.id, 'maps_clicked')}
                  className="py-2.5 px-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition border border-neutral-700"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  Abrir no Waze
                </a>
              )}
            </div>
          </div>
        )}

        {/* BUSINESS HOURS ACCORDION */}
        <div 
          className={`p-4 border transition ${getButtonClass()}`}
          style={{
            backgroundColor: biosite.themeConfig.cardBg,
            borderColor: `${biosite.themeConfig.primaryColor}20`,
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 text-neutral-300">
              <Clock className="w-3.5 h-3.5 text-amber-400" />
              Horário de Atendimento
            </span>
            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
              openStatus.isOpen ? 'bg-emerald-500/20 text-emerald-300' : 'bg-neutral-800 text-neutral-400'
            }`}>
              {openStatus.text}
            </span>
          </div>

          <div className="space-y-1.5 pt-1 text-xs">
            {biosite.businessHours.map((schedule) => {
              const isToday = new Date().getDay() === schedule.dayOfWeek;
              return (
                <div 
                  key={schedule.dayOfWeek}
                  className={`flex justify-between py-1 px-2 rounded-lg transition ${
                    isToday ? 'bg-white/10 font-bold text-white' : 'text-neutral-400'
                  }`}
                >
                  <span>{schedule.dayName}:</span>
                  <span>
                    {schedule.closed ? 'Fechado' : `${schedule.openTime} às ${schedule.closeTime}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* WHITE-LABEL AGENCY BRANDING FOOTER */}
        {biosite.footerBranding.enabled && (
          <div className="pt-6 pb-2 text-center text-xs space-y-1 opacity-70 hover:opacity-100 transition">
            <p className="text-[11px] text-neutral-400">
              Criado com tecnologia por
            </p>
            <a 
              href={biosite.footerBranding.agencyUrl} 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center gap-1 font-bold text-white hover:underline transition"
              style={{ color: biosite.themeConfig.primaryColor }}
            >
              <Sparkles className="w-3 h-3" />
              {biosite.footerBranding.agencyName}
            </a>
            {biosite.footerBranding.agencyTagline && (
              <p className="text-[10px] text-neutral-500">
                {biosite.footerBranding.agencyTagline}
              </p>
            )}
          </div>
        )}

      </div>

      {/* Booking Modal */}
      <BookingModal
        biosite={biosite}
        services={biositeServices}
        preselectedServiceId={selectedServiceId}
        isOpen={bookingOpen}
        onClose={() => setBookingOpen(false)}
      />
    </div>
  );
};
