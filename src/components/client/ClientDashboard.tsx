import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Biosite, Appointment, AppointmentStatus, Service } from '../../types';
import { BioSiteEditor } from '../agency/BioSiteEditor';
import { BioSiteView } from '../public/BioSiteView';
import { THEME_PRESETS } from '../../data/mockData';
import confetti from 'canvas-confetti';
import { 
  BarChart2, 
  Link as LinkIcon, 
  ClipboardList, 
  DollarSign, 
  Users, 
  LayoutGrid, 
  Palette, 
  Type, 
  MousePointerClick, 
  BookOpen, 
  MapPin, 
  MailCheck, 
  Columns, 
  Clock, 
  UserCheck, 
  PanelLeft, 
  QrCode, 
  ExternalLink, 
  Sparkles, 
  LogOut, 
  Headphones, 
  Smartphone, 
  Monitor, 
  TrendingUp, 
  Copy, 
  Check, 
  Plus, 
  Search, 
  MessageCircle, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  Download,
  Calendar as CalendarIcon,
  Eye,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Circle,
  Square,
  Upload,
  GripVertical,
  Trash2,
  Zap,
  Wifi,
  Star,
  Share2,
  Send,
  Globe,
  Phone,
  Mail,
  FileText,
  Youtube,
  Facebook,
  Linkedin,
  Twitter,
  Scissors,
  Edit3
} from 'lucide-react';

const PRESET_BUTTON_COLORS = [
  { name: 'Preto', hex: '#000000' },
  { name: 'Branco', hex: '#ffffff' },
  { name: 'Grafite', hex: '#1e293b' },
  { name: 'Cinza', hex: '#64748b' },
  { name: 'Pink Neon', hex: '#ff007f' },
  { name: 'Rosa Choque', hex: '#ec4899' },
  { name: 'Roxo', hex: '#8b5cf6' },
  { name: 'Azul Real', hex: '#2563eb' },
  { name: 'Ciano', hex: '#06b6d4' },
  { name: 'WhatsApp Verde', hex: '#25d366' },
  { name: 'Esmeralda', hex: '#10b981' },
  { name: 'Amarelo Ouro', hex: '#f59e0b' },
  { name: 'Laranja', hex: '#f97316' },
  { name: 'Vermelho', hex: '#ef4444' },
];

interface ColorPickerFieldProps {
  label: string;
  value: string;
  onChange: (val: string) => void;
  defaultPreviewColor?: string;
}

const ColorPickerField: React.FC<ColorPickerFieldProps> = ({
  label,
  value,
  onChange,
  defaultPreviewColor = '#000000',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const isDefault = !value || value === 'padrão';
  const displayColor = isDefault ? defaultPreviewColor : value;

  return (
    <div className="relative">
      <span className="text-[11px] text-neutral-600 block mb-1 font-medium">{label}</span>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center gap-2 p-1.5 rounded-xl border border-neutral-300 hover:border-neutral-400 bg-white cursor-pointer transition shadow-2xs group text-left"
      >
        <div 
          className="w-7 h-7 rounded-lg border border-neutral-300 shrink-0 shadow-2xs relative flex items-center justify-center transition group-hover:scale-105"
          style={{ backgroundColor: displayColor }}
        >
          {isDefault && (
            <span className={`text-[9px] font-black uppercase ${displayColor === '#ffffff' ? 'text-black' : 'text-white'}`}>
              P
            </span>
          )}
        </div>
        <span className="text-xs font-mono text-neutral-700 truncate flex-1 pl-1">
          {value || 'padrão'}
        </span>
        <ChevronDown className={`w-3.5 h-3.5 text-neutral-400 transition-transform mr-1 ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setIsOpen(false)} 
          />

          <div className="absolute top-full left-0 mt-1.5 w-64 bg-white border border-neutral-200 rounded-2xl shadow-xl p-3 z-50 animate-in zoom-in-95 duration-150 space-y-3">
            <div className="flex items-center justify-between pb-1.5 border-b border-neutral-100">
              <span className="text-xs font-bold text-neutral-800">Escolha uma cor</span>
              <button 
                type="button" 
                onClick={() => setIsOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-0.5"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                onChange('padrão');
                setIsOpen(false);
              }}
              className={`w-full py-1.5 px-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition cursor-pointer border ${
                isDefault 
                  ? 'border-pink-300 bg-pink-50 text-neutral-900 font-bold' 
                  : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
              }`}
            >
              <div className="flex items-center gap-2">
                <div 
                  className="w-4 h-4 rounded-md border border-neutral-300 shadow-2xs flex items-center justify-center"
                  style={{ backgroundColor: defaultPreviewColor }}
                >
                  <span className={`text-[7px] font-bold ${defaultPreviewColor === '#ffffff' ? 'text-black' : 'text-white'}`}>P</span>
                </div>
                <span>Usar cor padrão</span>
              </div>
              {isDefault && <Check className="w-3.5 h-3.5 text-[#ff2a85]" />}
            </button>

            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Cores rápidas
              </span>
              <div className="grid grid-cols-7 gap-1.5">
                {PRESET_BUTTON_COLORS.map(c => {
                  const isSelected = value.toLowerCase() === c.hex.toLowerCase();
                  return (
                    <button
                      key={c.hex}
                      type="button"
                      title={c.name}
                      onClick={() => {
                        onChange(c.hex);
                        setIsOpen(false);
                      }}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer hover:scale-110 shadow-2xs ${
                        isSelected 
                          ? 'border-neutral-900 ring-2 ring-pink-500/40 scale-105' 
                          : 'border-neutral-300 hover:border-neutral-500'
                      }`}
                      style={{ backgroundColor: c.hex }}
                    >
                      {isSelected && (
                        <Check className={`w-3 h-3 ${c.hex === '#ffffff' ? 'text-black' : 'text-white'}`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100">
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Cor personalizada
              </span>
              <div className="flex items-center gap-2">
                <div className="relative w-8 h-8 rounded-lg border border-neutral-300 overflow-hidden shrink-0 shadow-2xs">
                  <input
                    type="color"
                    value={!isDefault && value.startsWith('#') ? value : (defaultPreviewColor.startsWith('#') ? defaultPreviewColor : '#000000')}
                    onChange={e => onChange(e.target.value)}
                    className="absolute -inset-2 w-12 h-12 cursor-pointer"
                  />
                </div>
                <input
                  type="text"
                  value={value}
                  onChange={e => onChange(e.target.value)}
                  placeholder="#000000"
                  className="w-full px-2.5 py-1.5 text-xs font-mono uppercase rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export const ClientDashboard: React.FC = () => {
  const { 
    activeBiosite, 
    updateBiosite,
    appointments, 
    services, 
    addService,
    updateService,
    deleteService,
    updateAppointmentStatus, 
    addAppointment,
    setCurrentView,
    showToast,
    getBiositeStats 
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<string>('estatisticas');
  const [selectedCategory, setSelectedCategory] = useState<string>('Beleza');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [datePeriod, setDatePeriod] = useState<'hoje' | 'ontem' | '7d' | '15d' | '30d' | 'maximo'>('30d');
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for Catálogo tab (Carrossel & Catálogos)
  const [carouselAutoplay, setCarouselAutoplay] = useState<boolean>(true);
  const [carouselInterval, setCarouselInterval] = useState<number>(4);
  const [catalogsList, setCatalogsList] = useState<Array<{ id: string; title: string; itemCount: number }>>([]);
  const [newCatalogModalOpen, setNewCatalogModalOpen] = useState<boolean>(false);
  const [newCatalogTitle, setNewCatalogTitle] = useState<string>('');

  // Appointments state for the "Agendamentos" tab
  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [manualModalOpen, setManualModalOpen] = useState(false);
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('15:00');
  const [manualNotes, setManualNotes] = useState('');

  // Appearance Form State matching reference screenshot
  const [appearanceForm, setAppearanceForm] = useState({
    logoShape: ((activeBiosite as any)?.logoShape || 'circle') as 'circle' | 'square',
    logoTransparent: (activeBiosite as any)?.logoTransparent || false,
    title: activeBiosite?.title || '',
    subtitle: activeBiosite?.subtitle || '',
    description: activeBiosite?.description || '',
    primaryColor: activeBiosite?.themeConfig?.primaryColor || '#2563EB',
    primaryTextColor: activeBiosite?.themeConfig?.primaryTextColor || '#FFFFFF',
    fontFamily: activeBiosite?.themeConfig?.fontFamily || 'Space Grotesk, sans-serif',
    coverUrl: activeBiosite?.coverUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80',
    videoUrl: (activeBiosite as any)?.videoUrl || '',
    avatarUrl: activeBiosite?.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
  });

  const [fontDropdownOpen, setFontDropdownOpen] = useState(false);

  React.useEffect(() => {
    if (activeBiosite) {
      setAppearanceForm({
        logoShape: ((activeBiosite as any).logoShape || 'circle') as 'circle' | 'square',
        logoTransparent: (activeBiosite as any).logoTransparent || false,
        title: activeBiosite.title || '',
        subtitle: activeBiosite.subtitle || '',
        description: activeBiosite.description || '',
        primaryColor: activeBiosite.themeConfig.primaryColor || '#2563EB',
        primaryTextColor: activeBiosite.themeConfig.primaryTextColor || '#FFFFFF',
        fontFamily: activeBiosite.themeConfig.fontFamily || 'Space Grotesk, sans-serif',
        coverUrl: activeBiosite.coverUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80',
        videoUrl: (activeBiosite as any).videoUrl || '',
        avatarUrl: activeBiosite.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      });
    }
  }, [activeBiosite?.id]);

  const FONT_OPTIONS = [
    { id: 'Space Grotesk, sans-serif', name: 'Padrão (Space Grotesk)' },
    { id: 'Inter, sans-serif', name: 'Inter' },
    { id: 'Poppins, sans-serif', name: 'Poppins' },
    { id: 'Outfit, sans-serif', name: 'Outfit' },
    { id: 'Playfair Display, serif', name: 'Playfair Display' },
    { id: 'Montserrat, sans-serif', name: 'Montserrat' },
  ];

  const handleSaveAppearance = () => {
    if (!activeBiosite) return;

    updateBiosite(activeBiosite.id, {
      title: appearanceForm.title,
      subtitle: appearanceForm.subtitle,
      description: appearanceForm.description,
      avatarUrl: appearanceForm.avatarUrl,
      coverUrl: appearanceForm.coverUrl,
      themeConfig: {
        ...activeBiosite.themeConfig,
        primaryColor: appearanceForm.primaryColor,
        primaryTextColor: appearanceForm.primaryTextColor,
        fontFamily: appearanceForm.fontFamily,
      },
      ...({
        logoShape: appearanceForm.logoShape,
        logoTransparent: appearanceForm.logoTransparent,
        videoUrl: appearanceForm.videoUrl,
      } as any),
    });
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
    showToast('Alterações de aparência salvas com sucesso!', 'success');
  };

  const handleCycleAvatar = () => {
    const avatars = [
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=300&auto=format&fit=crop&q=80',
    ];
    const currentIdx = avatars.indexOf(appearanceForm.avatarUrl);
    const nextAvatar = avatars[(currentIdx + 1) % avatars.length];
    setAppearanceForm(prev => ({ ...prev, avatarUrl: nextAvatar }));
    showToast('Logo alterada!');
  };

  const handleCycleCover = () => {
    const covers = [
      'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1200&auto=format&fit=crop&q=80',
    ];
    const currentIdx = covers.indexOf(appearanceForm.coverUrl);
    const nextCover = covers[(currentIdx + 1) % covers.length];
    setAppearanceForm(prev => ({ ...prev, coverUrl: nextCover, videoUrl: '' }));
    showToast('Imagem de capa alterada!');
  };

  const handleToggleVideo = () => {
    const sampleVideo = 'https://assets.mixkit.co/videos/preview/mixkit-hands-of-a-manicurist-applying-varnish-41133-large.mp4';
    if (appearanceForm.videoUrl) {
      setAppearanceForm(prev => ({ ...prev, videoUrl: '' }));
      showToast('Vídeo de capa removido!');
    } else {
      setAppearanceForm(prev => ({ ...prev, videoUrl: sampleVideo }));
      showToast('Vídeo de capa adicionado!');
    }
  };

  // Button Models matching the reference screenshot (Print 2)
  const BUTTON_MODELS = [
    { id: 'google_review', label: 'Avaliar no Google', icon: 'Star', defaultUrl: 'https://g.page/r/review', type: 'Avaliar no Google' },
    { id: 'whatsapp', label: 'WhatsApp', icon: 'MessageCircle', defaultUrl: 'https://wa.me/5598991506106', type: 'WhatsApp', isWhatsApp: true, defaultPhone: '+55 (98) 99150-6106', defaultMessage: 'Olá, vim do seu Bio Site e gostaria de agendar um horário' },
    { id: 'instagram', label: 'Instagram', icon: 'Instagram', defaultUrl: 'https://www.instagram.com/esmalteria_vip/', type: 'Instagram' },
    { id: 'facebook', label: 'Facebook', icon: 'Facebook', defaultUrl: 'https://facebook.com/', type: 'Facebook' },
    { id: 'tiktok', label: 'TikTok', icon: 'Share2', defaultUrl: 'https://tiktok.com/@', type: 'TikTok' },
    { id: 'youtube', label: 'YouTube', icon: 'Youtube', defaultUrl: 'https://youtube.com/@', type: 'YouTube' },
    { id: 'twitter', label: 'X / Twitter', icon: 'Twitter', defaultUrl: 'https://x.com/', type: 'X / Twitter' },
    { id: 'linkedin', label: 'LinkedIn', icon: 'Linkedin', defaultUrl: 'https://linkedin.com/in/', type: 'LinkedIn' },
    { id: 'threads', label: 'Threads', icon: 'MessageCircle', defaultUrl: 'https://threads.net/@', type: 'Threads' },
    { id: 'telegram', label: 'Telegram', icon: 'Send', defaultUrl: 'https://t.me/', type: 'Telegram' },
    { id: 'pinterest', label: 'Pinterest', icon: 'ImageIcon', defaultUrl: 'https://pinterest.com/', type: 'Pinterest' },
    { id: 'snapchat', label: 'Snapchat', icon: 'MessageCircle', defaultUrl: 'https://snapchat.com/add/', type: 'Snapchat' },
    { id: 'twitch', label: 'Twitch', icon: 'Tv', defaultUrl: 'https://twitch.tv/', type: 'Twitch' },
    { id: 'spotify', label: 'Spotify', icon: 'Music', defaultUrl: 'https://open.spotify.com/', type: 'Spotify' },
    { id: 'agendar', label: 'Agendar', icon: 'Calendar', defaultUrl: '#agendar', type: 'Agendar' },
    { id: 'pix', label: 'Chave Pix', icon: 'QrCode', defaultUrl: '#pix', type: 'Pix' },
    { id: 'wifi', label: 'Wi-Fi', icon: 'Wifi', defaultUrl: '#wifi', type: 'WiFi' },
    { id: 'site', label: 'Site', icon: 'Globe', defaultUrl: 'https://', type: 'Site' },
    { id: 'ligar', label: 'Ligar', icon: 'Phone', defaultUrl: 'tel:+5598991506106', type: 'Ligar', defaultPhone: '+55 (98) 99150-6106' },
    { id: 'email', label: 'Email', icon: 'Mail', defaultUrl: 'mailto:contato@exemplo.com', type: 'Email' },
    { id: 'orcamento', label: 'Pedir orçamento', icon: 'FileText', defaultUrl: 'https://wa.me/5598991506106?text=Quero%20um%20or%C3%A7amento', type: 'Pedir orçamento' },
    { id: 'custom', label: 'Botão personalizado', icon: 'Sparkles', defaultUrl: 'https://', type: 'Botão personalizado' },
  ];

  // Buttons state matching screenshots
  const [buttonsList, setButtonsList] = useState<any[]>(() => {
    const rawButtons = activeBiosite?.contactButtons || [];
    const existing = rawButtons.map(b => ({
      ...b,
      type: b.type || (b.isWhatsApp ? 'WhatsApp' : b.label?.includes('Instagram') ? 'Instagram' : b.label),
      displayMode: 'full_button',
      pulseEffect: b.pulseEffect || false,
      bgColor: b.bgColor || 'padrão',
      textColor: b.textColor || 'padrão',
    }));

    const hasBooking = existing.some(b => b.id === 'btn-booking' || b.type === 'Agendar' || (b as any).isSpecial === 'booking');
    const hasPix = existing.some(b => b.id === 'btn-pix' || b.type === 'Pix' || (b as any).isSpecial === 'pix');
    const hasWifi = existing.some(b => b.id === 'btn-wifi' || b.type === 'WiFi' || (b as any).isSpecial === 'wifi');

    const fullList = [...existing];
    if (!hasBooking) {
      fullList.unshift({
        id: 'btn-booking',
        label: 'Agendar Horário Online',
        icon: 'Sparkles',
        lucideIcon: 'Sparkles',
        url: '#agendar',
        isWhatsApp: false,
        type: 'Agendar',
        isSpecial: 'booking',
        active: true,
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: 'padrão',
        textColor: 'padrão',
      });
    }
    if (!hasPix && activeBiosite?.pixConfig?.pixKey) {
      fullList.push({
        id: 'btn-pix',
        label: 'Chave Pix',
        icon: 'QrCode',
        lucideIcon: 'QrCode',
        url: '#pix',
        isWhatsApp: false,
        type: 'Pix',
        isSpecial: 'pix',
        active: true,
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: activeBiosite.pixConfig.buttonBgColor || 'padrão',
        textColor: activeBiosite.pixConfig.buttonTextColor || 'padrão',
      });
    }
    if (!hasWifi && activeBiosite?.wifiConfig?.networkName) {
      fullList.push({
        id: 'btn-wifi',
        label: `Wi-Fi: ${activeBiosite.wifiConfig.networkName}`,
        icon: 'Wifi',
        lucideIcon: 'Wifi',
        url: '#wifi',
        isWhatsApp: false,
        type: 'WiFi',
        isSpecial: 'wifi',
        active: true,
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: activeBiosite.wifiConfig.buttonBgColor || 'padrão',
        textColor: activeBiosite.wifiConfig.buttonTextColor || 'padrão',
      });
    }
    return fullList;
  });

  const [expandedButtonIds, setExpandedButtonIds] = useState<string[]>([]);
  const [modelSelectorOpen, setModelSelectorOpen] = useState(false);
  const [floatingToast, setFloatingToast] = useState<string | null>(null);
  const [hasUnsavedButtonChanges, setHasUnsavedButtonChanges] = useState(false);

  // Pix form state
  const [pixForm, setPixForm] = useState({
    keyType: activeBiosite?.pixConfig?.keyType || '',
    pixKey: activeBiosite?.pixConfig?.pixKey || '',
    instantPix: (activeBiosite?.pixConfig as any)?.instantPix || false,
    hasCardBg: (activeBiosite?.pixConfig as any)?.hasCardBg || false,
    cardTextColor: activeBiosite?.pixConfig?.cardTextColor || 'padrão',
    buttonBgColor: activeBiosite?.pixConfig?.buttonBgColor || 'padrão',
    buttonTextColor: activeBiosite?.pixConfig?.buttonTextColor || 'padrão',
  });

  // WiFi form state
  const [wifiForm, setWifiForm] = useState({
    networkName: activeBiosite?.wifiConfig?.networkName || '',
    password: activeBiosite?.wifiConfig?.password || '',
    hasCardBg: (activeBiosite?.wifiConfig as any)?.hasCardBg || false,
    cardTextColor: activeBiosite?.wifiConfig?.cardTextColor || 'padrão',
    buttonBgColor: activeBiosite?.wifiConfig?.buttonBgColor || 'padrão',
    buttonTextColor: activeBiosite?.wifiConfig?.buttonTextColor || 'padrão',
  });

  const handleAddModel = (model: typeof BUTTON_MODELS[0]) => {
    const newId = `btn-${Date.now()}`;
    const newBtn = {
      id: newId,
      label: model.label,
      icon: model.icon,
      lucideIcon: model.icon,
      url: model.defaultUrl,
      isWhatsApp: !!(model as any).isWhatsApp,
      phone: (model as any).defaultPhone || (model.id === 'whatsapp' ? '+55 (98) 99150-6106' : ''),
      prefilledMessage: (model as any).defaultMessage || '',
      type: model.type,
      active: true,
      displayMode: 'full_button',
      pulseEffect: false,
      bgColor: 'padrão',
      textColor: 'padrão',
    };
    setButtonsList(prev => [...prev, newBtn]);
    setExpandedButtonIds(prev => [...prev, newId]);
    setModelSelectorOpen(false);
    setFloatingToast('Botão criado — edite os campos e clique em Salvar');
    setHasUnsavedButtonChanges(true);
  };

  const handleToggleExpandButton = (id: string) => {
    setExpandedButtonIds(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const handleExpandAllButtons = () => {
    setExpandedButtonIds(buttonsList.map(b => b.id));
  };

  const handleCollapseAllButtons = () => {
    setExpandedButtonIds([]);
  };

  const handleDeleteButton = (id: string) => {
    setButtonsList(prev => prev.filter(b => b.id !== id));
    setExpandedButtonIds(prev => prev.filter(x => x !== id));
    setHasUnsavedButtonChanges(true);
    showToast('Botão removido');
  };

  const handleUpdateButton = (id: string, patch: any) => {
    setButtonsList(prev => prev.map(b => b.id === id ? { ...b, ...patch } : b));
    setHasUnsavedButtonChanges(true);
  };

  const moveButton = (indexOrId: number | string, direction: 'up' | 'down') => {
    setButtonsList(prev => {
      const index = typeof indexOrId === 'number' 
        ? indexOrId 
        : prev.findIndex(b => b.id === indexOrId);
      if (index < 0 || index >= prev.length) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const nextList = [...prev];
      const [movedItem] = nextList.splice(index, 1);
      nextList.splice(targetIndex, 0, movedItem);
      return nextList;
    });
    setHasUnsavedButtonChanges(true);
  };

  const handleSaveButtons = () => {
    if (!activeBiosite) return;
    updateBiosite(activeBiosite.id, {
      contactButtons: buttonsList,
      pixConfig: {
        ...activeBiosite.pixConfig,
        keyType: (pixForm.keyType || 'cnpj') as any,
        pixKey: pixForm.pixKey,
        instantPix: pixForm.instantPix,
        hasCardBg: pixForm.hasCardBg,
        cardTextColor: pixForm.cardTextColor,
        buttonBgColor: pixForm.buttonBgColor,
        buttonTextColor: pixForm.buttonTextColor,
        enabled: !!pixForm.pixKey,
      },
      wifiConfig: {
        ...activeBiosite.wifiConfig,
        networkName: wifiForm.networkName,
        password: wifiForm.password,
        hasCardBg: wifiForm.hasCardBg,
        cardTextColor: wifiForm.cardTextColor,
        buttonBgColor: wifiForm.buttonBgColor,
        buttonTextColor: wifiForm.buttonTextColor,
        enabled: !!wifiForm.networkName,
      },
    });
    setHasUnsavedButtonChanges(false);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
    showToast('Alterações salvas com sucesso!', 'success');
  };

  const previewBiosite: Biosite | undefined = activeBiosite ? {
    ...activeBiosite,
    title: appearanceForm.title,
    subtitle: appearanceForm.subtitle,
    description: appearanceForm.description,
    avatarUrl: appearanceForm.avatarUrl,
    coverUrl: appearanceForm.coverUrl,
    themeConfig: {
      ...activeBiosite.themeConfig,
      bgColor: '#ffffff',
      bgGradient: '#ffffff',
      cardBg: '#ffffff',
      textColor: '#171717',
      textMutedColor: '#6b7280',
      primaryColor: appearanceForm.primaryColor,
      primaryTextColor: appearanceForm.primaryTextColor,
      fontFamily: appearanceForm.fontFamily,
    },
    contactButtons: buttonsList,
    pixConfig: {
      ...activeBiosite.pixConfig,
      keyType: (pixForm.keyType || 'cnpj') as any,
      pixKey: pixForm.pixKey,
      instantPix: pixForm.instantPix,
      hasCardBg: pixForm.hasCardBg,
      cardTextColor: pixForm.cardTextColor,
      buttonBgColor: pixForm.buttonBgColor,
      buttonTextColor: pixForm.buttonTextColor,
      enabled: !!pixForm.pixKey,
    },
    wifiConfig: {
      ...activeBiosite.wifiConfig,
      networkName: wifiForm.networkName,
      password: wifiForm.password,
      hasCardBg: wifiForm.hasCardBg,
      cardTextColor: wifiForm.cardTextColor,
      buttonBgColor: wifiForm.buttonBgColor,
      buttonTextColor: wifiForm.buttonTextColor,
      enabled: !!wifiForm.networkName,
    },
    ...({
      logoShape: appearanceForm.logoShape,
      logoTransparent: appearanceForm.logoTransparent,
      videoUrl: appearanceForm.videoUrl,
    } as any),
  } : undefined;

  if (!activeBiosite) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
        <p className="text-neutral-500 mb-4">Nenhum mini-site selecionado.</p>
        <button
          onClick={() => setCurrentView('agency')}
          className="px-4 py-2 rounded-xl bg-[#ff2a85] text-white text-xs font-bold"
        >
          Voltar para meus sites
        </button>
      </div>
    );
  }

  const siteAppointments = appointments.filter(a => a.biositeId === activeBiosite.id);
  const siteServices = services.filter(s => s.biositeId === activeBiosite.id);
  const todayStr = new Date().toISOString().split('T')[0];

  const handleCopyLink = () => {
    const fullUrl = `https://www.coonexta.com.br/${activeBiosite.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Link do mini-site copiado!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePublish = () => {
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.2 }
    });
    showToast('Mini-site publicado com sucesso na Coonexta!', 'success');
  };

  const handleSaveManualAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    const chosenService = siteServices.find(s => s.id === manualServiceId) || siteServices[0];
    const price = chosenService?.promotionalPrice || chosenService?.price || 0;

    addAppointment({
      biositeId: activeBiosite.id,
      serviceId: chosenService?.id || 'default-service',
      serviceName: chosenService?.name || 'Serviço Padrão',
      customerName: manualName,
      customerPhone: manualPhone,
      appointmentDate: manualDate,
      appointmentTime: manualTime,
      durationMinutes: chosenService?.durationMinutes || 45,
      totalPrice: price,
      customerNotes: manualNotes,
      status: 'confirmed',
    });

    setManualModalOpen(false);
    setManualName('');
    setManualPhone('');
    setManualNotes('');
    showToast('Agendamento registrado com sucesso!');
  };

  const handleWhatsAppCustomer = (app: Appointment) => {
    const cleanPhone = app.customerPhone.replace(/\D/g, '');
    const dateFormatted = app.appointmentDate.split('-').reverse().join('/');
    const text = encodeURIComponent(
      `Olá ${app.customerName}! Tudo bem? Aqui é do ${activeBiosite.title}. Passando para confirmar seu agendamento de *${app.serviceName}* no dia *${dateFormatted}* às *${app.appointmentTime}*. Posso confirmar seu horário?`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${text}`, '_blank');
  };

  // Templates definition matching screenshot
  const TEMPLATE_CATEGORIES = [
    'Auto',
    'Crianças',
    'Projeto',
    'Página Inicial e reparos',
    'Comida',
    'Animais',
    'Saúde',
    'Beleza',
    'Página pessoal',
    'Marketing',
    'Moda e estilo',
    'Música'
  ];

  const TEMPLATES_DATA = [
    {
      id: 'tpl-salao-estetica',
      category: 'Beleza',
      badge: 'BELEZA',
      title: 'Salão & Estética',
      headline: 'Sua beleza em boas mãos',
      description: 'Salões, barbearias, estética e maquiagem.',
      bgGradient: 'linear-gradient(180deg, #5c162e 0%, #350a18 100%)',
      btnColor: '#f472b6',
      btnTextColor: '#4a044e',
      sampleButtons: ['Agendar horário', 'Trabalhos no Instagram', 'Avaliar no Google'],
      presetId: 'rose-glamour',
    },
    {
      id: 'tpl-barbearia-vintage',
      category: 'Beleza',
      badge: 'BARBEARIA',
      title: 'Barbearia Vintage',
      headline: 'Estilo clássico & corte de precisão',
      description: 'Barbearias tradicionais e cuidados masculinos.',
      bgGradient: 'linear-gradient(180deg, #1c1917 0%, #0c0a09 100%)',
      btnColor: '#d4af37',
      btnTextColor: '#000000',
      sampleButtons: ['Agendar corte', 'Galeria de cortes', 'Como chegar'],
      presetId: 'barber-dark-gold',
    },
    {
      id: 'tpl-clinica-saude',
      category: 'Saúde',
      badge: 'SAÚDE',
      title: 'Clínica & Consultório',
      headline: 'Cuidando de você com excelência',
      description: 'Médicos, psicólogos, dentistas e terapeutas.',
      bgGradient: 'linear-gradient(180deg, #0284c7 0%, #0369a1 100%)',
      btnColor: '#e0f2fe',
      btnTextColor: '#075985',
      sampleButtons: ['Consulta presencial', 'Telemedicina', 'Localização'],
      presetId: 'minimal-clean',
    },
    {
      id: 'tpl-comida-gastronomia',
      category: 'Comida',
      badge: 'GASTRONOMIA',
      title: 'Restaurante & Delivery',
      headline: 'O melhor sabor na sua mesa',
      description: 'Hamburguerias, confeitarias e restaurantes.',
      bgGradient: 'linear-gradient(180deg, #ea580c 0%, #9a3412 100%)',
      btnColor: '#ffedd5',
      btnTextColor: '#7c2d12',
      sampleButtons: ['Ver cardápio', 'Pedir no WhatsApp', 'Endereço e horários'],
      presetId: 'rose-glamour',
    },
    {
      id: 'tpl-auto-mecanica',
      category: 'Auto',
      badge: 'AUTOMOTIVO',
      title: 'Estética Automotiva',
      headline: 'Polimento & Lavagem técnica',
      description: 'Detalhamento, mecânica e oficinas.',
      bgGradient: 'linear-gradient(180deg, #1e293b 0%, #0f172a 100%)',
      btnColor: '#38bdf8',
      btnTextColor: '#0f172a',
      sampleButtons: ['Orçamento rápido', 'Tabela de serviços', 'Instagram'],
      presetId: 'barber-dark-gold',
    },
    {
      id: 'tpl-moda-estilo',
      category: 'Moda e estilo',
      badge: 'MODA & ESTILO',
      title: 'Boutique & Moda',
      headline: 'Tendências exclusivas para você',
      description: 'Lojas de roupas, calçados e acessórios.',
      bgGradient: 'linear-gradient(180deg, #061a14 0%, #04120e 100%)',
      btnColor: '#34d399',
      btnTextColor: '#022c22',
      sampleButtons: ['Coleção nova', 'Comprar pelo WhatsApp', 'Catálogo online'],
      presetId: 'emerald-luxury',
    },
  ];

  const handleApplyTemplate = (tpl: typeof TEMPLATES_DATA[0]) => {
    const matchingPreset = THEME_PRESETS.find(p => p.presetId === tpl.presetId) || THEME_PRESETS[0];
    updateBiosite(activeBiosite.id, {
      themeConfig: matchingPreset,
      subtitle: tpl.headline,
    });
    confetti({ particleCount: 50, spread: 70, origin: { y: 0.3 } });
    showToast(`Template "${tpl.title}" aplicado com sucesso!`, 'success');
  };

  const filteredTemplates = TEMPLATES_DATA.filter(t => t.category === selectedCategory);
  const activeTemplatesList = filteredTemplates.length > 0 ? filteredTemplates : TEMPLATES_DATA.slice(0, 1);

  // Nav sections definition matching exactly the screenshot
  const NAV_SECTIONS = [
    {
      title: 'Análise',
      items: [
        { id: 'estatisticas', label: 'Estatísticas', icon: BarChart2 },
        { id: 'links', label: 'Meus Links', icon: LinkIcon },
        { id: 'cadastros', label: 'Cadastros deste site', icon: ClipboardList },
        { id: 'pix', label: 'Pix recebidos', icon: DollarSign },
        { id: 'agendamentos', label: 'Agendamentos', icon: Users },
      ],
    },
    {
      title: 'Editar site',
      items: [
        { id: 'templates', label: 'Templates', icon: LayoutGrid },
        { id: 'aparencia', label: 'Aparência', icon: Palette },
        { id: 'titulos', label: 'Títulos', icon: Type },
        { id: 'botoes', label: 'Botões', icon: MousePointerClick },
        { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
        { id: 'endereco', label: 'Endereço', icon: MapPin },
        { id: 'leads', label: 'Captura de leads', icon: MailCheck },
        { id: 'layout', label: 'Layout', icon: Columns },
      ],
    },
    {
      title: 'Agenda',
      items: [
        { id: 'servicos', label: 'Serviços', icon: Clock },
        { id: 'profissionais', label: 'Profissionais', icon: UserCheck },
      ],
    },
  ];

  // Dates for the chart X-axis
  const CHART_DATES = [
    '02/07', '03/07', '04/07', '05/07', '07/07', '09/07', '10/07', '11/07',
    '13/07', '15/07', '16/07', '17/07', '19/07', '20/07', '21/07', '22/07',
    '23/07', '24/07', '25/07', '26/07', '27/07', '29/07', '31/07'
  ];

  return (
    <div className="flex-1 bg-white text-neutral-900 min-h-screen flex flex-col font-sans select-none">
      
      {/* 1. TOPMOST BAR matching screenshot: "← Voltar pros meus sites" and right actions */}
      <div className="w-full bg-white border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-600 shrink-0">
        <button 
          onClick={() => setCurrentView('agency')} 
          className="flex items-center gap-1.5 font-medium hover:text-neutral-900 transition cursor-pointer"
        >
          <span>← Voltar pros meus sites</span>
        </button>

        <div className="flex items-center gap-5">
          <button 
            onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20painel%20Coonexta', '_blank')}
            className="flex items-center gap-1.5 hover:text-neutral-900 transition cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-neutral-500" />
            <span>Falar com gerente</span>
          </button>
          <button 
            onClick={() => setCurrentView('agency')} 
            className="flex items-center gap-1.5 hover:text-neutral-900 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5 text-neutral-500" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* 2. SUBHEADER / SITE TITLE BAR matching screenshot */}
      <div className="w-full bg-white border-b border-neutral-200 px-6 py-3 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-2.5">
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="text-neutral-400 hover:text-neutral-800 p-1 rounded-md hover:bg-neutral-100 transition"
            title="Alternar barra lateral"
          >
            <PanelLeft className="w-4 h-4" />
          </button>

          {/* Sound wave icon */}
          <span className="text-neutral-800 font-black text-sm tracking-tighter select-none">)))</span>

          {/* Site name */}
          <span className="font-bold text-neutral-900 text-sm">
            Meu painel · {activeBiosite.title}
          </span>

          {/* PREMIUM badge */}
          <span className="px-1.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-300">
            PREMIUM
          </span>

          {/* URL */}
          <button
            onClick={handleCopyLink}
            className="text-xs text-neutral-500 hover:text-neutral-900 font-mono transition ml-1"
            title="Clique para copiar link"
          >
            www.coonexta.com.br/{activeBiosite.slug}
          </button>
        </div>

        {/* Right Action Buttons matching screenshot */}
        <div className="flex items-center gap-2">
          {/* QR Code Button */}
          <button
            onClick={() => setQrModalOpen(true)}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>QR Code</span>
          </button>

          {/* Abrir Button */}
          <button
            onClick={() => setCurrentView('public')}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Abrir</span>
          </button>

          {/* Publicar Button (Lime neon) */}
          <button
            onClick={handlePublish}
            className="px-4 py-1.5 rounded-lg bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Publicar</span>
          </button>

          {/* Sair Button */}
          <button
            onClick={() => setCurrentView('agency')}
            className="px-2.5 py-1.5 rounded-lg text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* 3. MAIN WORKSPACE: SIDEBAR + CONTENT AREA */}
      <div className="flex-1 flex min-w-0 bg-[#fafafa]">
        
        {/* Left Sidebar inside the Panel matching screenshot */}
        {!sidebarCollapsed && (
          <aside className="w-56 bg-white border-r border-neutral-200 py-4 px-3 flex flex-col justify-between shrink-0 min-h-[calc(100vh-92px)]">
            <div className="space-y-6">
              {NAV_SECTIONS.map((sec, secIdx) => (
                <div key={secIdx}>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider px-3 block mb-1.5">
                    {sec.title}
                  </span>
                  <div className="space-y-0.5">
                    {sec.items.map(item => {
                      const IconComponent = item.icon;
                      const isActive = selectedTab === item.id;
                      return (
                        <button
                          key={item.id}
                          onClick={() => setSelectedTab(item.id)}
                          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                            isActive
                              ? 'bg-neutral-100 text-neutral-900 font-semibold shadow-xs'
                              : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                          }`}
                        >
                          <IconComponent className={`w-4 h-4 shrink-0 ${isActive ? 'text-neutral-900' : 'text-neutral-500'}`} />
                          <span className="truncate">{item.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </aside>
        )}

        {/* Right Main Content */}
        <main className="flex-1 p-6 lg:p-8 min-w-0">
          
          {/* TAB: ESTATÍSTICAS (EXACT REFERENCE SCREENSHOT) */}
          {selectedTab === 'estatisticas' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              
              {/* Header Title & Period Filter */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xl">📊</span>
                    <h1 className="text-xl font-black text-neutral-900 tracking-tight">
                      Estatísticas do seu mini-site
                    </h1>
                  </div>
                  <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                    Ainda sem dados — compartilhe seu link e as métricas aparecerão aqui!
                  </p>
                </div>

                {/* Period Pills Filter */}
                <div className="flex items-center p-1 rounded-xl bg-neutral-200/60 text-xs font-medium">
                  {(['hoje', 'ontem', '7d', '15d', '30d', 'maximo'] as const).map(p => {
                    const labels: Record<string, string> = {
                      hoje: 'Hoje',
                      ontem: 'Ontem',
                      '7d': '7d',
                      '15d': '15d',
                      '30d': '30d',
                      maximo: 'Máximo',
                    };
                    const isSelected = datePeriod === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setDatePeriod(p)}
                        className={`px-3 py-1 rounded-lg text-xs transition cursor-pointer ${
                          isSelected 
                            ? 'bg-white text-neutral-900 font-bold shadow-xs' 
                            : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        {labels[p]}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4 Cards Grid matching screenshot */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                
                {/* 1. Visitas Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 relative overflow-hidden shadow-2xs">
                  {/* Subtle pastel blue top-right gradient blob */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-blue-100/60 blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-1.5 text-neutral-600 text-xs font-medium mb-3">
                    <span className="text-neutral-400 font-mono">@</span>
                    <span>Visitas</span>
                  </div>
                  <div className="text-3xl font-extrabold text-neutral-900">
                    0
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+0% vs período anterior</span>
                  </div>
                </div>

                {/* 2. Cliques em links Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 relative overflow-hidden shadow-2xs">
                  {/* Subtle pastel teal top-right gradient blob */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-emerald-100/60 blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-1.5 text-neutral-600 text-xs font-medium mb-3">
                    <MousePointerClick className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Cliques em links</span>
                  </div>
                  <div className="text-3xl font-extrabold text-neutral-900">
                    0
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-neutral-400 font-medium mt-2">
                    <TrendingUp className="w-3.5 h-3.5" />
                    <span>+0% vs período anterior</span>
                  </div>
                </div>

                {/* 3. Taxa de conversão Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 relative overflow-hidden shadow-2xs">
                  {/* Subtle pastel orange/amber top-right gradient blob */}
                  <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full bg-amber-100/60 blur-xl pointer-events-none" />
                  
                  <div className="flex items-center gap-1.5 text-neutral-600 text-xs font-medium mb-3">
                    <TrendingUp className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Taxa de conversão</span>
                  </div>
                  <div className="text-3xl font-extrabold text-neutral-900">
                    0%
                  </div>
                  <div className="text-[11px] text-neutral-400 font-medium mt-2">
                    cliques / visitas
                  </div>
                </div>

                {/* 4. Dispositivos Card */}
                <div className="rounded-2xl border border-neutral-200 bg-white p-5 relative overflow-hidden shadow-2xs flex flex-col justify-between">
                  <div className="flex items-center gap-1.5 text-neutral-600 text-xs font-medium mb-2">
                    <Smartphone className="w-3.5 h-3.5 text-neutral-500" />
                    <span>Dispositivos</span>
                  </div>
                  
                  <div className="space-y-2 mt-auto">
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Smartphone className="w-3 h-3 text-neutral-400" />
                          <span>Mobile</span>
                        </div>
                        <span className="font-semibold">0%</span>
                      </div>
                      <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-neutral-400 rounded-full" />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px] text-neutral-600">
                        <div className="flex items-center gap-1">
                          <Monitor className="w-3 h-3 text-neutral-400" />
                          <span>Desktop</span>
                        </div>
                        <span className="font-semibold">0%</span>
                      </div>
                      <div className="w-full h-1 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="w-0 h-full bg-neutral-400 rounded-full" />
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* Chart Panel matching screenshot */}
              <div className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-2xs">
                <h3 className="text-sm font-bold text-neutral-800 mb-6">
                  Visitas e cliques ao longo do tempo
                </h3>

                {/* SVG Chart area */}
                <div className="w-full h-64 overflow-x-auto">
                  <div className="min-w-[700px] h-full flex flex-col justify-between">
                    
                    {/* Graph grid lines and zero-line points */}
                    <div className="relative flex-1 border-l border-b border-neutral-300">
                      {/* Horizontal Grid lines (4, 3, 2, 1, 0) */}
                      {[4, 3, 2, 1, 0].map((val, idx) => {
                        const topPercent = (idx / 4) * 100;
                        return (
                          <div 
                            key={val} 
                            className="absolute w-full flex items-center border-b border-neutral-200/70"
                            style={{ top: `${topPercent}%` }}
                          >
                            <span className="absolute -left-6 text-[10px] text-neutral-400 select-none">
                              {val}
                            </span>
                          </div>
                        );
                      })}

                      {/* Vertical Grid Lines corresponding to dates */}
                      <div className="absolute inset-0 flex justify-between pointer-events-none">
                        {CHART_DATES.map((_, i) => (
                          <div key={i} className="h-full border-r border-neutral-200/60" />
                        ))}
                      </div>

                      {/* Flat line at y=0 with circular data markers */}
                      <svg className="absolute inset-0 w-full h-full overflow-visible pointer-events-none">
                        {/* Blue Visitas Line */}
                        <line 
                          x1="0" 
                          y1="100%" 
                          x2="100%" 
                          y2="100%" 
                          stroke="#0284c7" 
                          strokeWidth="1.5" 
                        />
                        {/* Teal Cliques Line */}
                        <line 
                          x1="0" 
                          y1="100%" 
                          x2="100%" 
                          y2="100%" 
                          stroke="#10b981" 
                          strokeWidth="1.5" 
                          strokeDasharray="2,2" 
                        />
                      </svg>
                    </div>

                    {/* X-Axis Date Labels */}
                    <div className="flex justify-between pt-2.5 px-0 text-[10px] text-neutral-500 font-mono select-none">
                      {CHART_DATES.map((date, idx) => (
                        <span key={idx} className="text-center">{date}</span>
                      ))}
                    </div>

                  </div>
                </div>

                {/* Chart Legend matching screenshot */}
                <div className="mt-8 pt-4 border-t border-neutral-100 flex items-center justify-center gap-8 text-xs font-medium text-neutral-600 select-none">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-0.5 bg-[#0284c7] relative flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full border-2 border-[#0284c7] bg-white absolute" />
                    </span>
                    <span>Visitas</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="w-5 h-0.5 bg-[#10b981] relative flex items-center justify-center">
                      <span className="w-2 h-2 rounded-full border-2 border-[#10b981] bg-white absolute" />
                    </span>
                    <span>Cliques</span>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB: AGENDAMENTOS (Existing full appointments functionality preserved) */}
          {selectedTab === 'agendamentos' && (
            <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-neutral-200 shadow-2xs">
                <div>
                  <h2 className="text-lg font-bold text-neutral-900">
                    Agendamentos do mini-site
                  </h2>
                  <p className="text-xs text-neutral-500 mt-1">
                    Gerencie os horários marcados pelos clientes diretamente no seu Bio Site.
                  </p>
                </div>
                <button
                  onClick={() => setManualModalOpen(true)}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
                >
                  <Plus className="w-4 h-4" />
                  Novo Agendamento Manual
                </button>
              </div>

              {/* Filters */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-neutral-200 shadow-2xs">
                <div className="flex items-center p-1 rounded-xl bg-neutral-100 text-xs">
                  <button
                    onClick={() => setDateFilter('today')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${dateFilter === 'today' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'}`}
                  >
                    Hoje
                  </button>
                  <button
                    onClick={() => setDateFilter('upcoming')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${dateFilter === 'upcoming' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'}`}
                  >
                    Próximos
                  </button>
                  <button
                    onClick={() => setDateFilter('all')}
                    className={`px-3 py-1.5 rounded-lg font-bold transition ${dateFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500'}`}
                  >
                    Todos
                  </button>
                </div>

                <div className="relative">
                  <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Buscar cliente ou serviço..."
                    className="pl-9 pr-4 py-2 rounded-xl border border-neutral-200 text-xs w-full sm:w-64 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              {/* Appointments List */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs">
                {siteAppointments.length === 0 ? (
                  <div className="p-12 text-center text-neutral-400 text-xs">
                    Nenhum agendamento registrado ainda. Compartilhe o link do seu Bio Site para receber horários marcados!
                  </div>
                ) : (
                  <div className="divide-y divide-neutral-100">
                    {siteAppointments.map(app => (
                      <div key={app.id} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-neutral-50 transition">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-sm text-neutral-900">{app.customerName}</span>
                            <span className="text-xs text-neutral-400">•</span>
                            <span className="text-xs font-semibold text-neutral-600">{app.serviceName}</span>
                          </div>
                          <div className="text-xs text-neutral-500 mt-1 flex items-center gap-3">
                            <span>📅 {app.appointmentDate.split('-').reverse().join('/')} às {app.appointmentTime}</span>
                            <span>💵 R$ {app.totalPrice.toFixed(2)}</span>
                            <span>📱 {app.customerPhone}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleWhatsAppCustomer(app)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-bold flex items-center gap-1 transition"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            WhatsApp
                          </button>
                          <button
                            onClick={() => updateAppointmentStatus(app.id, app.status === 'confirmed' ? 'completed' : 'confirmed')}
                            className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition"
                          >
                            {app.status === 'confirmed' ? 'Concluir' : 'Confirmar'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: TEMPLATES (EXACT REFERENCE SCREENSHOT) */}
          {selectedTab === 'templates' && (
            <div className="max-w-7xl mx-auto space-y-6">
              
              {/* Header matching screenshot */}
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 border border-pink-200 text-[#ff2a85] flex items-center justify-center shrink-0">
                  <LayoutGrid className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-extrabold text-neutral-900 tracking-tight">
                    Templates prontos
                  </h2>
                  <p className="text-xs text-neutral-500 font-medium">
                    Escolha um modelo pronto e aplique com um clique. Depois é só ajustar as cores, textos e links nas outras abas.
                  </p>
                </div>
              </div>

              {/* Main Content: Left Categories & Cards + Right Live Preview */}
              <div className="flex flex-col xl:flex-row items-start gap-8 relative">
                
                {/* Left Area: Categories List + Template Cards */}
                <div className="flex-1 flex flex-col md:flex-row items-start gap-6 w-full">
                  
                  {/* Category Pills Vertical Scroll List matching screenshot */}
                  <div className="w-full md:w-52 shrink-0 space-y-1 bg-white p-2 rounded-2xl border border-neutral-200/80 shadow-2xs max-h-[560px] overflow-y-auto">
                    {TEMPLATE_CATEGORIES.map(cat => {
                      const isSelected = selectedCategory === cat;
                      return (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat)}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? 'bg-[#ff007f] text-white shadow-xs'
                              : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900'
                          }`}
                        >
                          <span className="truncate">{cat}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Template Cards Grid */}
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full">
                    {activeTemplatesList.map(tpl => (
                      <div 
                        key={tpl.id} 
                        className="rounded-3xl bg-white border border-neutral-200 p-3.5 shadow-2xs hover:shadow-md transition flex flex-col justify-between max-w-[280px]"
                      >
                        {/* Mini Screen Mockup matching screenshot */}
                        <div 
                          className="w-full h-80 rounded-2xl p-4 flex flex-col justify-between text-white relative overflow-hidden shadow-inner select-none"
                          style={{ background: tpl.bgGradient }}
                        >
                          <span className="text-[10px] font-extrabold uppercase tracking-widest text-white/90">
                            {tpl.badge}
                          </span>

                          <div className="text-center my-auto px-2">
                            <h4 className="font-extrabold text-sm text-white leading-snug">
                              {tpl.headline}
                            </h4>
                          </div>

                          <div className="space-y-2 w-full">
                            {tpl.sampleButtons.map((btn, bIdx) => (
                              <div 
                                key={bIdx}
                                className="w-full py-2 px-3 rounded-xl text-[10px] font-bold text-center truncate shadow-2xs select-none"
                                style={{ backgroundColor: tpl.btnColor, color: tpl.btnTextColor }}
                              >
                                {btn}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Card Info Below Mockup */}
                        <div className="mt-3 px-1">
                          <h5 className="font-extrabold text-xs text-neutral-900">
                            {tpl.title}
                          </h5>
                          <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">
                            {tpl.description}
                          </p>

                          <button
                            onClick={() => handleApplyTemplate(tpl)}
                            className="w-full mt-3 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs flex items-center justify-center gap-1.5 shadow-xs transition cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5 stroke-[2.5]" />
                            <span>Ver</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                </div>

                {/* Right Area: PREVIEW AO VIVO with live phone frame */}
                <div className={`w-full transition-all duration-300 shrink-0 space-y-3 mx-auto xl:mx-0 sticky top-6 self-start max-h-[calc(100vh-2rem)] overflow-y-auto ${
                  previewDevice === 'desktop' ? 'xl:w-[440px] 2xl:w-[480px]' : 'xl:w-[320px] 2xl:w-[340px]'
                }`}>
                  
                  {/* Header Row matching screenshot */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-neutral-800 tracking-wider uppercase">
                      PREVIEW AO VIVO
                    </span>

                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-200/60 text-xs">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'mobile'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'desktop'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Card vs Smartphone Frame Mockup */}
                  {previewDevice === 'desktop' ? (
                    /* EXACT DESKTOP PREVIEW MATCHING SCREENSHOT */
                    <div className="w-full rounded-[26px] border-[3px] border-neutral-900 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-200">
                      <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-neutral-900">
                        {activeBiosite.coverUrl ? (
                          <img 
                            src={activeBiosite.coverUrl} 
                            alt={activeBiosite.title}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div 
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${activeBiosite.themeConfig.primaryColor}, ${activeBiosite.themeConfig.bgColor})`
                            }}
                          />
                        )}
                      </div>

                      <div className="relative -mt-10 mx-auto z-10">
                        <div className="w-20 h-20 rounded-full p-0.5 bg-white shadow-md">
                          <img 
                            src={activeBiosite.avatarUrl} 
                            alt={activeBiosite.title}
                            className="w-full h-full object-cover rounded-full border border-neutral-200" 
                          />
                        </div>
                      </div>

                      <div className="p-5 pt-3 text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-base sm:text-lg font-black text-neutral-900">
                          {activeBiosite.title}
                        </h3>

                        <div className="mt-6 mb-2 flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-medium select-none">
                          <div className="w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[9px] shrink-0">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 3v18c-1.2 0-2.4-.6-3.1-1.6L5.4 15H3c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h2.4l3.5-4.4c.7-1 1.9-1.6 3.1-1.6zm4.5 4.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5l-1.4-1.4c1.4-1.4 2.2-3.3 2.2-5.1s-.8-3.7-2.2-5.1l1.4-1.4zm3.5-3.5c2.7 2.7 4.2 6.3 4.2 9.9s-1.5 7.2-4.2 9.9l-1.4-1.4c2.3-2.3 3.6-5.4 3.6-8.5s-1.3-6.2-3.6-8.5l1.4-1.4z" />
                            </svg>
                          </div>
                          <span>Feito por Vision Local</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SMARTPHONE FRAME WITH NOTCH */
                    <div className="w-full rounded-[44px] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-20 pointer-events-none" />
                      <div className="h-[560px] overflow-y-auto bg-white rounded-[36px] overflow-x-hidden">
                        <BioSiteView biosite={previewBiosite || activeBiosite} isMockupFrame={true} onMoveButton={moveButton} />
                      </div>
                    </div>
                  )}

                </div>

              </div>

            </div>
          )}

          {/* TAB: APARÊNCIA (EXACT REFERENCE SCREENSHOTS) */}
          {selectedTab === 'aparencia' && previewBiosite && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col xl:flex-row items-start gap-8">
                
                {/* Left Area: Appearance Form Card matching screenshots */}
                <div className="flex-1 w-full bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
                  
                  {/* 1. Logo */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-2">
                      Logo
                    </label>
                    <div className="flex items-center gap-3.5">
                      <img 
                        src={appearanceForm.avatarUrl} 
                        alt="Logo" 
                        className={`w-14 h-14 ${appearanceForm.logoShape === 'square' ? 'rounded-2xl' : 'rounded-full'} object-cover border border-neutral-200 shadow-2xs bg-neutral-100`}
                      />
                      <button
                        type="button"
                        onClick={handleCycleAvatar}
                        className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5" />
                        <span>Trocar logo</span>
                      </button>
                    </div>
                  </div>

                  {/* 2. Formato da logo matching screenshot */}
                  <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white">
                    <span className="text-[11px] font-bold text-neutral-500 block mb-2.5">
                      Formato da logo
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setAppearanceForm(p => ({ ...p, logoShape: 'square' }))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                          appearanceForm.logoShape === 'square'
                            ? 'border-2 border-[#ff007f] bg-pink-50/40 text-neutral-900 shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-xs border-2 border-neutral-400" />
                        <span>Quadrada</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setAppearanceForm(p => ({ ...p, logoShape: 'circle' }))}
                        className={`py-2.5 px-3 rounded-xl border text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer ${
                          appearanceForm.logoShape === 'circle'
                            ? 'border-2 border-[#ff007f] bg-pink-50/40 text-neutral-900 shadow-2xs'
                            : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                        }`}
                      >
                        <div className="w-3.5 h-3.5 rounded-full border-2 border-neutral-400" />
                        <span>Redonda</span>
                      </button>
                    </div>
                  </div>

                  {/* 3. Logo sem fundo matching screenshot */}
                  <div className="p-3.5 rounded-2xl border border-neutral-200/90 bg-white flex items-center gap-3.5">
                    <button
                      type="button"
                      onClick={() => setAppearanceForm(p => ({ ...p, logoTransparent: !p.logoTransparent }))}
                      className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                        appearanceForm.logoTransparent ? 'bg-[#ff007f]' : 'bg-neutral-200'
                      }`}
                    >
                      <span className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                        appearanceForm.logoTransparent ? 'translate-x-5' : 'translate-x-0.5'
                      }`} />
                    </button>
                    <div>
                      <span className="font-bold text-xs text-neutral-900 block leading-tight">
                        Logo sem fundo
                      </span>
                      <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight font-medium">
                        Ative se sua logo é PNG transparente. Aparece direto sobre o fundo, sem card branco por trás.
                      </p>
                    </div>
                  </div>

                  {/* 4. Imagem de fundo/capa */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-2">
                      Imagem de fundo/capa
                    </label>
                    <button
                      type="button"
                      onClick={handleCycleCover}
                      className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                    >
                      <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Enviar imagem</span>
                    </button>
                  </div>

                  {/* 5. Vídeo de capa (opcional) matching screenshot */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                      Vídeo de capa (opcional) — toca em loop, sem som
                    </label>
                    <p className="text-[11px] text-neutral-500 mb-3 leading-tight font-medium">
                      Se enviar um vídeo, ele substitui a imagem de capa e roda em loop automático (mudo). MP4, WebM ou MOV — até 60s.
                    </p>
                    <div className="flex items-center gap-3">
                      {/* Video Thumbnail with TROCAR label */}
                      <div className="w-20 h-12 rounded-xl border border-neutral-300 bg-neutral-900 relative overflow-hidden flex items-center justify-center shrink-0">
                        <img 
                          src={appearanceForm.coverUrl} 
                          alt="Thumbnail" 
                          className="w-full h-full object-cover opacity-60" 
                        />
                        <span className="absolute text-[8px] font-black uppercase tracking-wider text-white bg-black/70 px-1 py-0.5 rounded">
                          TROCAR
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={handleToggleVideo}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs"
                      >
                        <Upload className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Trocar vídeo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setAppearanceForm(p => ({ ...p, videoUrl: '' }));
                          showToast('Vídeo removido!');
                        }}
                        className="text-xs font-semibold text-neutral-500 hover:text-red-600 px-2 transition cursor-pointer"
                      >
                        Remover
                      </button>
                    </div>
                  </div>

                  {/* 6. Cores (Cor primária e Cor do texto dos botões) */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Cor primária
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg border border-neutral-300 overflow-hidden shrink-0 shadow-2xs">
                          <input 
                            type="color" 
                            value={appearanceForm.primaryColor}
                            onChange={e => setAppearanceForm(p => ({ ...p, primaryColor: e.target.value }))}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={appearanceForm.primaryColor}
                          onChange={e => setAppearanceForm(p => ({ ...p, primaryColor: e.target.value }))}
                          className="px-3 py-2 text-xs font-mono font-medium rounded-xl border border-neutral-300 w-full focus:outline-none focus:ring-2 focus:ring-pink-500/20 uppercase"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Cor do texto dos botões
                      </label>
                      <div className="flex items-center gap-2">
                        <div className="relative w-8 h-8 rounded-lg border border-neutral-300 overflow-hidden shrink-0 shadow-2xs">
                          <input 
                            type="color" 
                            value={appearanceForm.primaryTextColor}
                            onChange={e => setAppearanceForm(p => ({ ...p, primaryTextColor: e.target.value }))}
                            className="absolute -inset-2 w-12 h-12 cursor-pointer"
                          />
                        </div>
                        <input
                          type="text"
                          value={appearanceForm.primaryTextColor}
                          onChange={e => setAppearanceForm(p => ({ ...p, primaryTextColor: e.target.value }))}
                          className="px-3 py-2 text-xs font-mono font-medium rounded-xl border border-neutral-300 w-full focus:outline-none focus:ring-2 focus:ring-pink-500/20 uppercase"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 7. Estilo da letra do mini-site */}
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => setFontDropdownOpen(!fontDropdownOpen)}
                      className="w-full p-3 rounded-xl border border-neutral-300 bg-white hover:border-neutral-400 flex items-center justify-between text-left transition cursor-pointer shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <Type className="w-4 h-4 text-neutral-500" />
                        <div>
                          <span className="text-xs font-bold text-neutral-800 block leading-tight">
                            Estilo da letra do mini-site
                          </span>
                          <span className="text-[11px] text-neutral-500 block leading-tight">
                            {FONT_OPTIONS.find(f => f.id === appearanceForm.fontFamily)?.name || 'Padrão (Space Grotesk)'} - toque para alterar
                          </span>
                        </div>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${fontDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {fontDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-2xl shadow-xl z-30 p-1.5 divide-y divide-neutral-100">
                        {FONT_OPTIONS.map(font => (
                          <button
                            key={font.id}
                            type="button"
                            onClick={() => {
                              setAppearanceForm(p => ({ ...p, fontFamily: font.id }));
                              setFontDropdownOpen(false);
                            }}
                            className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition cursor-pointer flex items-center justify-between ${
                              appearanceForm.fontFamily === font.id
                                ? 'bg-pink-50 text-[#ff007f] font-bold'
                                : 'text-neutral-700 hover:bg-neutral-50'
                            }`}
                          >
                            <span>{font.name}</span>
                            {appearanceForm.fontFamily === font.id && <Check className="w-3.5 h-3.5 text-[#ff007f]" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 8. Nome do negócio */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                      Nome do negócio
                    </label>
                    <input
                      type="text"
                      value={appearanceForm.title}
                      onChange={e => setAppearanceForm(p => ({ ...p, title: e.target.value }))}
                      placeholder="Nome do estabelecimento"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>

                  {/* 9. Headline (título principal) */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                      Headline (título principal)
                    </label>
                    <input
                      type="text"
                      value={appearanceForm.subtitle}
                      onChange={e => setAppearanceForm(p => ({ ...p, subtitle: e.target.value }))}
                      placeholder="Ex: Petshop e banho & tosa"
                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>

                  {/* 10. Descrição curta */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                      Descrição curta
                    </label>
                    <textarea
                      rows={3}
                      value={appearanceForm.description}
                      onChange={e => setAppearanceForm(p => ({ ...p, description: e.target.value }))}
                      placeholder="Escreva uma breve apresentação do negócio..."
                      className="w-full p-3 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                    />
                  </div>

                  {/* 11. Salvar alterações button */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={handleSaveAppearance}
                      className="px-6 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs shadow-xs transition cursor-pointer"
                    >
                      Salvar alterações
                    </button>
                  </div>

                </div>

                {/* Right Area: PREVIEW AO VIVO with live phone/desktop frame */}
                <div className={`w-full transition-all duration-300 shrink-0 space-y-3 mx-auto xl:mx-0 sticky top-6 self-start max-h-[calc(100vh-2rem)] overflow-y-auto ${
                  previewDevice === 'desktop' ? 'xl:w-[440px] 2xl:w-[480px]' : 'xl:w-[320px] 2xl:w-[340px]'
                }`}>
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-neutral-800 tracking-wider uppercase">
                      PREVIEW AO VIVO
                    </span>

                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-200/60 text-xs">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'mobile'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'desktop'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Card vs Smartphone Frame Mockup */}
                  {previewDevice === 'desktop' ? (
                    /* EXACT DESKTOP PREVIEW MATCHING SCREENSHOT */
                    <div className="w-full rounded-[26px] border-[3px] border-neutral-900 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-200">
                      {/* Cover banner image */}
                      <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-neutral-900">
                        {previewBiosite.coverUrl ? (
                          <img 
                            src={previewBiosite.coverUrl} 
                            alt={previewBiosite.title}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div 
                            className="w-full h-full"
                            style={{
                              background: `linear-gradient(135deg, ${previewBiosite.themeConfig.primaryColor}, ${previewBiosite.themeConfig.bgColor})`
                            }}
                          />
                        )}
                      </div>

                      {/* Overlapping Center Avatar matching screenshot */}
                      <div className="relative -mt-10 mx-auto z-10">
                        <div className={`w-20 h-20 ${previewBiosite.logoShape === 'square' ? 'rounded-2xl' : 'rounded-full'} p-0.5 ${previewBiosite.logoTransparent ? 'bg-transparent' : 'bg-white shadow-md'}`}>
                          <img 
                            src={previewBiosite.avatarUrl} 
                            alt={previewBiosite.title}
                            className={`w-full h-full object-cover ${previewBiosite.logoShape === 'square' ? 'rounded-2xl' : 'rounded-full'} ${previewBiosite.logoTransparent ? 'border-0' : 'border border-neutral-200'}`} 
                          />
                        </div>
                      </div>

                      {/* Title & Watermark below avatar */}
                      <div className="p-5 pt-3 text-center flex-1 flex flex-col justify-between">
                        <h3 className="text-base sm:text-lg font-black text-neutral-900">
                          {previewBiosite.title}
                        </h3>

                        {/* Watermark: Feito por Vision Local */}
                        <div className="mt-6 mb-2 flex items-center justify-center gap-1.5 text-xs text-neutral-600 font-medium select-none">
                          <div className="w-4 h-4 rounded-full bg-neutral-900 flex items-center justify-center text-white text-[9px] shrink-0">
                            <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 24 24">
                              <path d="M12 3v18c-1.2 0-2.4-.6-3.1-1.6L5.4 15H3c-1.1 0-2-.9-2-2v-2c0-1.1.9-2 2-2h2.4l3.5-4.4c.7-1 1.9-1.6 3.1-1.6zm4.5 4.5c1.8 1.8 2.8 4.2 2.8 6.5s-1 4.7-2.8 6.5l-1.4-1.4c1.4-1.4 2.2-3.3 2.2-5.1s-.8-3.7-2.2-5.1l1.4-1.4zm3.5-3.5c2.7 2.7 4.2 6.3 4.2 9.9s-1.5 7.2-4.2 9.9l-1.4-1.4c2.3-2.3 3.6-5.4 3.6-8.5s-1.3-6.2-3.6-8.5l1.4-1.4z" />
                            </svg>
                          </div>
                          <span>Feito por Vision Local</span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* SMARTPHONE FRAME WITH NOTCH */
                    <div className="w-full rounded-[44px] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-20 pointer-events-none" />
                      <div className="h-[560px] overflow-y-auto bg-white rounded-[36px] overflow-x-hidden">
                        <BioSiteView biosite={previewBiosite} isMockupFrame={true} onMoveButton={moveButton} />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB: BOTÕES (EXACT REFERENCE SCREENSHOTS) */}
          {selectedTab === 'botoes' && previewBiosite && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col xl:flex-row items-start gap-8">
                
                {/* Left Area: Buttons, Pix, WiFi Form */}
                <div className="flex-1 w-full space-y-5">
                  
                  {/* Floating Success Toast (Print 3) */}
                  {floatingToast && (
                    <div className="bg-[#0b1e16] text-emerald-400 border border-emerald-900/60 px-4 py-2.5 rounded-2xl flex items-center justify-between text-xs font-semibold shadow-lg animate-in slide-in-from-top-2">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span className="text-white">{floatingToast}</span>
                      </div>
                      <button 
                        type="button" 
                        onClick={() => setFloatingToast(null)} 
                        className="text-neutral-400 hover:text-white ml-2 p-1"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}

                  {/* 1. BUTTONS SECTION */}
                  <div>
                    {/* Model Selector Card (Print 2) */}
                    {modelSelectorOpen ? (
                      <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs mb-5 animate-in zoom-in-95 duration-150">
                        <h2 className="text-xs font-extrabold text-neutral-900 mb-3.5">
                          Escolha um modelo:
                        </h2>
                        
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          {BUTTON_MODELS.map(m => (
                            <button
                              key={m.id}
                              type="button"
                              onClick={() => handleAddModel(m)}
                              className="px-3 py-2.5 rounded-xl border border-neutral-200 hover:border-neutral-400 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center text-center transition cursor-pointer shadow-2xs"
                            >
                              {m.label}
                            </button>
                          ))}
                        </div>

                        <div className="mt-5 pt-4 border-t border-neutral-100">
                          <h3 className="text-xs font-bold text-neutral-900">...ou crie um do zero</h3>
                          <p className="text-[11px] text-neutral-500 mt-0.5 mb-3 font-medium">
                            Adiciona um botão em branco — depois edite texto, link e ícone livremente.
                          </p>
                          <button
                            type="button"
                            onClick={() => handleAddModel(BUTTON_MODELS.find(m => m.id === 'custom')!)}
                            className="w-full py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-950 font-black text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-2xs"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Botão personalizado</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setModelSelectorOpen(false)}
                            className="text-xs text-neutral-500 hover:text-neutral-800 font-semibold mx-auto block mt-3 transition cursor-pointer"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Top "+ Adicionar botão" button (Print 1) if no buttons */
                      buttonsList.length === 0 && (
                        <button
                          type="button"
                          onClick={() => setModelSelectorOpen(true)}
                          className="w-full py-3.5 rounded-2xl bg-[#5d3bf6] hover:bg-[#4c2ee0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer mb-5"
                        >
                          <Plus className="w-4 h-4" />
                          <span>Adicionar botão</span>
                        </button>
                      )
                    )}

                    {/* Buttons List / Accordions (Print 3, 4, 5, 6) */}
                    {buttonsList.length > 0 && (
                      <div className="space-y-3">
                        {buttonsList.map(btn => {
                          const isExpanded = expandedButtonIds.includes(btn.id);
                          return (
                            <div 
                              key={btn.id} 
                              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs transition"
                            >
                              {/* Header */}
                              <div className="p-3.5 flex items-center justify-between gap-2.5 bg-white">
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0" />
                                  
                                  {/* Active toggle */}
                                  <button
                                    type="button"
                                    onClick={() => handleUpdateButton(btn.id, { active: !btn.active })}
                                    className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                      btn.active ? 'bg-[#ff2a85]' : 'bg-neutral-300'
                                    }`}
                                  >
                                    <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                      btn.active ? 'translate-x-4' : 'translate-x-0'
                                    }`} />
                                  </button>

                                  <span className="text-xs font-bold text-neutral-800 truncate">
                                    {btn.label} • {btn.type || btn.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExpandButton(btn.id)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteButton(btn.id)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-red-500 transition cursor-pointer"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>

                              {/* Expanded Form Fields */}
                              {isExpanded && (
                                <div className="p-4 sm:p-5 border-t border-neutral-100 space-y-4 bg-white text-neutral-800 animate-in fade-in duration-150">
                                  {btn.isWhatsApp ? (
                                    <>
                                      <div>
                                        <label className="text-xs font-bold text-neutral-800 block mb-1">
                                          Texto do botão
                                        </label>
                                        <input
                                          type="text"
                                          value={btn.label}
                                          onChange={e => handleUpdateButton(btn.id, { label: e.target.value })}
                                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-neutral-800 block mb-1">
                                          Número do WhatsApp (com DDD e país)
                                        </label>
                                        <input
                                          type="text"
                                          value={btn.phone || ''}
                                          onChange={e => handleUpdateButton(btn.id, { 
                                            phone: e.target.value,
                                            url: `https://wa.me/${e.target.value.replace(/\D/g, '')}`
                                          })}
                                          placeholder="+55 (98) 99150-6106"
                                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                        />
                                      </div>

                                      <div>
                                        <label className="text-xs font-bold text-neutral-800 block mb-1">
                                          Mensagem inicial (opcional)
                                        </label>
                                        <input
                                          type="text"
                                          value={btn.prefilledMessage || ''}
                                          onChange={e => handleUpdateButton(btn.id, { prefilledMessage: e.target.value })}
                                          placeholder="Olá, vim do seu Bio Site e gostaria de agendar um horário"
                                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                        />
                                        <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                                          Ao clicar no botão, o WhatsApp já abre com esta frase pronta.
                                        </p>
                                      </div>
                                    </>
                                  ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                                      <div>
                                        <label className="text-xs font-bold text-neutral-800 block mb-1">
                                          Texto do botão
                                        </label>
                                        <input
                                          type="text"
                                          value={btn.label}
                                          onChange={e => handleUpdateButton(btn.id, { label: e.target.value })}
                                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                        />
                                      </div>
                                      <div>
                                        <label className="text-xs font-bold text-neutral-800 block mb-1">
                                          Link/URL
                                        </label>
                                        <input
                                          type="text"
                                          value={btn.url}
                                          onChange={e => handleUpdateButton(btn.id, { url: e.target.value })}
                                          placeholder="https://www.instagram.com/..."
                                          className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono"
                                        />
                                      </div>
                                    </div>
                                  )}

                                  {/* Ícone Lucide */}
                                  <div>
                                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                                      Ícone (nome do Lucide)
                                    </label>
                                    <input
                                      type="text"
                                      value={btn.lucideIcon || btn.icon}
                                      onChange={e => handleUpdateButton(btn.id, { 
                                        lucideIcon: e.target.value,
                                        icon: e.target.value
                                      })}
                                      className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                                    />
                                    <p className="text-[11px] text-neutral-500 mt-1 font-medium">
                                      Digite qualquer nome de <a href="https://lucide.dev/icons" target="_blank" rel="noreferrer" className="underline hover:text-neutral-800">lucide.dev/icons</a> (ex: Heart, ShoppingCart, MapPin).
                                    </p>
                                  </div>

                                  {/* Cores deste botão */}
                                  <div className="rounded-2xl border border-neutral-200 p-3.5 space-y-2.5">
                                    <span className="text-xs font-bold text-neutral-800 block">
                                      Cores deste botão
                                    </span>
                                    <div className="grid grid-cols-2 gap-3">
                                      <ColorPickerField
                                        label="Fundo"
                                        value={btn.bgColor || 'padrão'}
                                        onChange={val => {
                                          handleUpdateButton(btn.id, { bgColor: val });
                                          setHasUnsavedButtonChanges(true);
                                        }}
                                        defaultPreviewColor={btn.isWhatsApp ? '#25d366' : btn.type === 'Instagram' ? '#e1306c' : '#111827'}
                                      />
                                      <ColorPickerField
                                        label="Texto"
                                        value={btn.textColor || 'padrão'}
                                        onChange={val => {
                                          handleUpdateButton(btn.id, { textColor: val });
                                          setHasUnsavedButtonChanges(true);
                                        }}
                                        defaultPreviewColor="#ffffff"
                                      />
                                    </div>
                                  </div>

                                  {/* Como este botão aparece */}
                                  <div>
                                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                                      Como este botão aparece
                                    </label>
                                    <p className="text-[11px] text-neutral-500 mb-2 font-medium">
                                      Escolha entre um ícone circular pequeno (junto com outras redes) ou um botão completo com nome e ícone.
                                    </p>
                                    <div className="grid grid-cols-2 gap-2">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateButton(btn.id, { displayMode: 'icon_only' })}
                                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                                          btn.displayMode === 'icon_only'
                                            ? 'border-pink-300 bg-pink-50 text-neutral-900 font-bold shadow-2xs'
                                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                                        }`}
                                      >
                                        Só o ícone
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateButton(btn.id, { displayMode: 'full_button' })}
                                        className={`py-2 px-3 rounded-xl border text-xs font-semibold transition cursor-pointer text-center ${
                                          btn.displayMode !== 'icon_only'
                                            ? 'border-pink-300 bg-pink-50 text-neutral-900 font-bold shadow-2xs'
                                            : 'border-neutral-200 hover:bg-neutral-50 text-neutral-600'
                                        }`}
                                      >
                                        Botão completo
                                      </button>
                                    </div>
                                  </div>

                                  {/* Efeito pulsar ✨ */}
                                  <div className="pt-2 flex items-center justify-between border-t border-neutral-100">
                                    <div>
                                      <span className="text-xs font-bold text-neutral-800 block">
                                        Efeito pulsar ✨
                                      </span>
                                      <span className="text-[11px] text-neutral-500 block font-medium">
                                        Chama atenção com uma animação suave.
                                      </span>
                                    </div>
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateButton(btn.id, { pulseEffect: !btn.pulseEffect })}
                                      className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                                        btn.pulseEffect ? 'bg-[#ff2a85]' : 'bg-neutral-200'
                                      }`}
                                    >
                                      <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                                        btn.pulseEffect ? 'translate-x-4' : 'translate-x-0'
                                      }`} />
                                    </button>
                                  </div>

                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Expand / Minimize links & Add Button (Print 5 & 6) */}
                        <div className="pt-1">
                          <div className="flex justify-end gap-3 text-xs text-neutral-500 font-medium mb-2.5">
                            <button
                              type="button"
                              onClick={handleExpandAllButtons}
                              className="hover:text-neutral-900 transition cursor-pointer"
                            >
                              Expandir todos
                            </button>
                            <button
                              type="button"
                              onClick={handleCollapseAllButtons}
                              className="hover:text-neutral-900 transition cursor-pointer"
                            >
                              Minimizar todos
                            </button>
                          </div>

                          {!modelSelectorOpen && (
                            <button
                              type="button"
                              onClick={() => setModelSelectorOpen(true)}
                              className="w-full py-3 rounded-2xl bg-[#5d3bf6] hover:bg-[#4c2ee0] text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition cursor-pointer"
                            >
                              <Plus className="w-4 h-4" />
                              <span>Adicionar botão</span>
                            </button>
                          )}
                        </div>

                        {/* Action Bar (Print 3, 5, 6) */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2 border-b border-neutral-200/80">
                          <span className="text-xs text-neutral-500 font-medium">
                            {hasUnsavedButtonChanges 
                              ? 'Você tem alterações não salvas.' 
                              : 'Tudo salvo. Clique em Publicar no topo para publicar.'}
                          </span>
                          <button
                            type="button"
                            onClick={handleSaveButtons}
                            className="px-5 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs shadow-xs transition cursor-pointer self-start sm:self-auto"
                          >
                            Salvar alterações
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 2. PIX SECTION (Print 1, 6, 7, 8, 9) */}
                  <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">
                      Pix
                    </h2>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Tipo de chave
                      </label>
                      <select
                        value={pixForm.keyType}
                        onChange={e => {
                          setPixForm(p => ({ ...p, keyType: e.target.value }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      >
                        <option value="">Selecione</option>
                        <option value="cnpj">CNPJ</option>
                        <option value="cpf">CPF</option>
                        <option value="phone">Celular</option>
                        <option value="email">E-mail</option>
                        <option value="random">Chave Aleatória</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Chave Pix
                      </label>
                      <input
                        type="text"
                        value={pixForm.pixKey}
                        onChange={e => {
                          setPixForm(p => ({ ...p, pixKey: e.target.value }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        placeholder="12.345.678/0001-95"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono"
                      />
                    </div>

                    {/* Receber Pix na hora card */}
                    <div className="rounded-2xl border border-pink-200 bg-pink-50/20 p-4 flex items-center justify-between gap-3">
                      <div className="pr-2">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-neutral-900">
                          <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                          <span>Receber Pix na hora</span>
                        </div>
                        <p className="text-[11px] text-neutral-500 mt-0.5 leading-tight font-medium">
                          Ativa um formulário no seu site pra visitante digitar o valor, gerar QR Code e Copia-e-Cola direto pra pagar na sua conta.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setPixForm(p => ({ ...p, instantPix: !p.instantPix }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                          pixForm.instantPix ? 'bg-[#ff2a85]' : 'bg-neutral-200'
                        }`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                          pixForm.instantPix ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    {/* Cores do cartão Pix */}
                    <div className="rounded-2xl border border-neutral-200 p-4 space-y-3.5">
                      <span className="text-xs font-bold text-neutral-800 block">
                        Cores do cartão Pix
                      </span>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-neutral-800 block">
                            Com fundo no cartão
                          </span>
                          <span className="text-[11px] text-neutral-500 block font-medium">
                            Desligue para deixar transparente (sem card).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setPixForm(p => ({ ...p, hasCardBg: !p.hasCardBg }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            pixForm.hasCardBg ? 'bg-[#ff2a85]' : 'bg-neutral-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            pixForm.hasCardBg ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <ColorPickerField
                        label="Cor do texto do cartão"
                        value={pixForm.cardTextColor}
                        onChange={val => {
                          setPixForm(p => ({ ...p, cardTextColor: val }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        defaultPreviewColor="#111827"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <ColorPickerField
                          label="Fundo do botão"
                          value={pixForm.buttonBgColor}
                          onChange={val => {
                            setPixForm(p => ({ ...p, buttonBgColor: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          defaultPreviewColor="#ff2a85"
                        />
                        <ColorPickerField
                          label="Texto do botão"
                          value={pixForm.buttonTextColor}
                          onChange={val => {
                            setPixForm(p => ({ ...p, buttonTextColor: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          defaultPreviewColor="#ffffff"
                        />
                      </div>
                    </div>
                  </div>

                  {/* 3. WIFI SECTION (Print 10 & 11) */}
                  <div className="bg-white rounded-3xl border border-neutral-200 p-6 shadow-2xs space-y-4">
                    <h2 className="text-sm font-bold text-neutral-900">
                      WiFi
                    </h2>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Nome da rede
                      </label>
                      <input
                        type="text"
                        value={wifiForm.networkName}
                        onChange={e => {
                          setWifiForm(p => ({ ...p, networkName: e.target.value }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        placeholder="Ex: Nome_Do_Wifi"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                      />
                    </div>

                    <div>
                      <label className="text-xs font-bold text-neutral-800 block mb-1.5">
                        Senha
                      </label>
                      <input
                        type="text"
                        value={wifiForm.password}
                        onChange={e => {
                          setWifiForm(p => ({ ...p, password: e.target.value }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        placeholder="Senha do Wi-Fi"
                        className="w-full px-3.5 py-2.5 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 font-mono"
                      />
                    </div>

                    {/* Cores do cartão WiFi */}
                    <div className="rounded-2xl border border-neutral-200 p-4 space-y-3.5">
                      <span className="text-xs font-bold text-neutral-800 block">
                        Cores do cartão WiFi
                      </span>

                      <div className="flex items-center justify-between">
                        <div>
                          <span className="text-xs font-semibold text-neutral-800 block">
                            Com fundo no cartão
                          </span>
                          <span className="text-[11px] text-neutral-500 block font-medium">
                            Desligue para deixar transparente (sem card).
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setWifiForm(p => ({ ...p, hasCardBg: !p.hasCardBg }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          className={`w-9 h-5 rounded-full p-0.5 transition-colors cursor-pointer shrink-0 ${
                            wifiForm.hasCardBg ? 'bg-[#ff2a85]' : 'bg-neutral-200'
                          }`}
                        >
                          <div className={`w-4 h-4 rounded-full bg-white shadow-xs transition-transform ${
                            wifiForm.hasCardBg ? 'translate-x-4' : 'translate-x-0'
                          }`} />
                        </button>
                      </div>

                      <ColorPickerField
                        label="Cor do texto do cartão"
                        value={wifiForm.cardTextColor}
                        onChange={val => {
                          setWifiForm(p => ({ ...p, cardTextColor: val }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        defaultPreviewColor="#111827"
                      />

                      <div className="grid grid-cols-2 gap-3">
                        <ColorPickerField
                          label="Fundo do botão"
                          value={wifiForm.buttonBgColor}
                          onChange={val => {
                            setWifiForm(p => ({ ...p, buttonBgColor: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          defaultPreviewColor="#2563eb"
                        />
                        <ColorPickerField
                          label="Texto do botão"
                          value={wifiForm.buttonTextColor}
                          onChange={val => {
                            setWifiForm(p => ({ ...p, buttonTextColor: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          defaultPreviewColor="#ffffff"
                        />
                      </div>
                    </div>

                    {/* Salvar button */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={handleSaveButtons}
                        className="px-6 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs shadow-xs transition cursor-pointer"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>

                </div>

                {/* Right Area: PREVIEW AO VIVO with live phone/desktop frame */}
                <div className={`w-full transition-all duration-300 shrink-0 space-y-3 mx-auto xl:mx-0 sticky top-6 self-start max-h-[calc(100vh-2rem)] overflow-y-auto ${
                  previewDevice === 'desktop' ? 'xl:w-[440px] 2xl:w-[480px]' : 'xl:w-[320px] 2xl:w-[340px]'
                }`}>
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-neutral-800 tracking-wider uppercase">
                      PREVIEW AO VIVO
                    </span>

                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-200/60 text-xs">
                      <button
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'mobile'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                      <button
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'desktop'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Preview vs Smartphone Frame Mockup */}
                  {previewDevice === 'desktop' ? (
                    <div className="w-full rounded-[26px] border-[3px] border-neutral-900 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-200">
                      <div className="h-[560px] overflow-y-auto">
                        <BioSiteView biosite={previewBiosite} isMockupFrame={false} onMoveButton={moveButton} />
                      </div>
                    </div>
                  ) : (
                    /* SMARTPHONE FRAME WITH NOTCH */
                    <div className="w-full rounded-[44px] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-20 pointer-events-none" />
                      <div className="h-[560px] overflow-y-auto bg-white rounded-[36px] overflow-x-hidden">
                        <BioSiteView biosite={previewBiosite} isMockupFrame={true} onMoveButton={moveButton} />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* TAB: CATÁLOGO */}
          {selectedTab === 'catalogo' && previewBiosite && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col xl:flex-row gap-8 items-start">
                
                {/* Coluna da Esquerda (Conteúdo/Formulários): flex-1 min-w-0 space-y-6 */}
                <div className="flex-1 min-w-0 space-y-6">
                  
                  {/* Card 1 (Carrossel) */}
                  <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-5">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                          Passagem automática
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                          Os itens trocam sozinhos como um carrossel.
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <button
                        type="button"
                        onClick={() => setCarouselAutoplay(!carouselAutoplay)}
                        className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer shrink-0 ${
                          carouselAutoplay ? 'bg-[#ff2a85]' : 'bg-neutral-200'
                        }`}
                      >
                        <span className={`w-5 h-5 rounded-full bg-white shadow-xs absolute top-0.5 transition-transform ${
                          carouselAutoplay ? 'translate-x-5' : 'translate-x-0.5'
                        }`} />
                      </button>
                    </div>

                    {/* Slider: Tempo entre itens [X]s com régua deslizante de 2s a 15s */}
                    <div className="space-y-2 pt-1">
                      <div className="flex items-center justify-between text-xs font-bold text-neutral-800">
                        <span>Tempo entre itens</span>
                        <span className="font-mono text-neutral-700 bg-neutral-100 px-2 py-0.5 rounded-md text-xs">
                          {carouselInterval}s
                        </span>
                      </div>
                      <input
                        type="range"
                        min={2}
                        max={15}
                        step={1}
                        value={carouselInterval}
                        onChange={e => setCarouselInterval(Number(e.target.value))}
                        className="w-full accent-[#ff2a85] cursor-pointer"
                      />
                      <div className="flex justify-between text-[10px] text-neutral-400 font-medium">
                        <span>2s</span>
                        <span>15s</span>
                      </div>
                    </div>

                    {/* Ação: Botão verde-limão/amarelo: Salvar configuração do carrossel */}
                    <div className="pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Configuração do carrossel salva!', 'success');
                        }}
                        className="px-5 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs shadow-xs transition cursor-pointer"
                      >
                        Salvar configuração do carrossel
                      </button>
                    </div>
                  </div>

                  {/* Card 2 (Lista de Catálogos) */}
                  <div className="bg-white rounded-3xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
                    {/* Cabeçalho */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-100">
                      <div>
                        <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                          Seus catálogos
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-medium">
                          Crie quantos quiser (ex: Fotos, Vídeos, Promoções). Arraste para reordenar.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => setNewCatalogModalOpen(true)}
                        className="px-4 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 font-black text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer self-start sm:self-auto shrink-0"
                      >
                        <Plus className="w-4 h-4 stroke-[2.5]" />
                        <span>+ Novo catálogo</span>
                      </button>
                    </div>

                    {/* Estado Vazio ou Lista */}
                    {catalogsList.length === 0 ? (
                      <div className="p-12 text-center rounded-2xl border border-neutral-200/80 bg-neutral-50/40">
                        <p className="text-xs text-neutral-500 font-medium">
                          Nenhum catálogo criado. Clique em 'Novo catálogo' para começar.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {catalogsList.map(cat => (
                          <div 
                            key={cat.id} 
                            className="p-4 rounded-2xl border border-neutral-200 bg-white flex items-center justify-between gap-3 shadow-2xs hover:border-neutral-300 transition"
                          >
                            <div className="flex items-center gap-3">
                              <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0" />
                              <div>
                                <h4 className="text-xs font-bold text-neutral-900">{cat.title}</h4>
                                <span className="text-[11px] text-neutral-500 font-medium">{cat.itemCount} itens</span>
                              </div>
                            </div>
                            <button
                              type="button"
                              onClick={() => setCatalogsList(prev => prev.filter(c => c.id !== cat.id))}
                              className="p-1.5 rounded-lg text-neutral-400 hover:text-red-500 transition cursor-pointer"
                              title="Excluir catálogo"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Coluna da Direita (Preview/Celular): w-[360px] shrink-0 sticky top-6 self-start */}
                <div className="w-[360px] shrink-0 sticky top-6 self-start space-y-3 mx-auto xl:mx-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
                  
                  {/* Header Row */}
                  <div className="flex items-center justify-between px-1">
                    <span className="text-xs font-black text-neutral-800 tracking-wider uppercase">
                      PREVIEW AO VIVO
                    </span>

                    <div className="flex items-center gap-1 p-0.5 rounded-full bg-neutral-200/60 text-xs">
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('mobile')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'mobile'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Smartphone className="w-3 h-3" />
                        <span>Mobile</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setPreviewDevice('desktop')}
                        className={`px-3 py-1 rounded-full text-xs transition cursor-pointer flex items-center gap-1 ${
                          previewDevice === 'desktop'
                            ? 'bg-[#ff007f] text-white font-bold shadow-xs'
                            : 'text-neutral-600 hover:text-neutral-900 font-semibold'
                        }`}
                      >
                        <Monitor className="w-3 h-3" />
                        <span>Desktop</span>
                      </button>
                    </div>
                  </div>

                  {/* Desktop Preview vs Smartphone Frame Mockup */}
                  {previewDevice === 'desktop' ? (
                    <div className="w-full rounded-[26px] border-[3px] border-neutral-900 bg-white shadow-xl overflow-hidden flex flex-col animate-in fade-in duration-200">
                      <div className="h-[560px] overflow-y-auto">
                        <BioSiteView biosite={previewBiosite} isMockupFrame={false} onMoveButton={moveButton} />
                      </div>
                    </div>
                  ) : (
                    /* SMARTPHONE FRAME WITH NOTCH */
                    <div className="w-full rounded-[44px] border-[8px] border-neutral-900 bg-neutral-900 shadow-2xl overflow-hidden relative animate-in fade-in duration-200">
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-4 bg-neutral-900 rounded-b-xl z-20 pointer-events-none" />
                      <div className="h-[560px] overflow-y-auto bg-white rounded-[36px] overflow-x-hidden">
                        <BioSiteView biosite={previewBiosite} isMockupFrame={true} onMoveButton={moveButton} />
                      </div>
                    </div>
                  )}

                </div>

              </div>
            </div>
          )}

          {/* EDITING TABS: Re-uses BioSiteEditor smoothly */}
          {(['titulos', 'endereco', 'leads', 'layout', 'links', 'profissionais', 'pix', 'cadastros'].includes(selectedTab)) && (
            <div className="max-w-6xl mx-auto bg-white rounded-2xl border border-neutral-200 p-6 shadow-2xs animate-in fade-in duration-200">
              <BioSiteEditor 
                biosite={activeBiosite} 
                onBack={() => setSelectedTab('estatisticas')} 
              />
            </div>
          )}

        </main>
      </div>

      {/* QR Code Modal */}
      {qrModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-sm rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100 text-center relative">
            <button
              onClick={() => setQrModalOpen(false)}
              className="absolute top-4 right-4 text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-base font-extrabold text-neutral-900 mb-1">
              QR Code do Mini-site
            </h3>
            <p className="text-xs text-neutral-500 mb-5">
              Escaneie para abrir o mini-site ou baixe para imprimir em cartões ou balcão.
            </p>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 inline-block mx-auto mb-5">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(
                  `https://www.coonexta.com.br/${activeBiosite.slug}`
                )}`}
                alt="QR Code"
                className="w-48 h-48 mx-auto"
              />
            </div>

            <div className="space-y-2">
              <button
                onClick={handleCopyLink}
                className="w-full py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-900 font-bold text-xs flex items-center justify-center gap-2 transition"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
              </button>

              <button
                onClick={() => setQrModalOpen(false)}
                className="w-full py-2 text-xs text-neutral-500 hover:text-neutral-800 font-medium"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Manual Appointment Modal */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl border border-neutral-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-extrabold text-base text-neutral-900">
                Novo Agendamento Manual
              </h3>
              <button
                onClick={() => setManualModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveManualAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Nome do Cliente
                </label>
                <input
                  type="text"
                  required
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  placeholder="Ex: Ana Maria"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  WhatsApp / Telefone
                </label>
                <input
                  type="tel"
                  required
                  value={manualPhone}
                  onChange={e => setManualPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Serviço
                </label>
                <select
                  value={manualServiceId}
                  onChange={e => setManualServiceId(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20 bg-white"
                >
                  {siteServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - R$ {s.price.toFixed(2)} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Data
                  </label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-neutral-700 block mb-1">
                    Horário
                  </label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition"
                >
                  Salvar Agendamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal para Novo Catálogo */}
      {newCatalogModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-extrabold text-neutral-900">
                Novo Catálogo
              </h3>
              <button
                type="button"
                onClick={() => setNewCatalogModalOpen(false)}
                className="text-neutral-400 hover:text-neutral-700 p-1 rounded-full hover:bg-neutral-100 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (!newCatalogTitle.trim()) return;
                setCatalogsList(prev => [
                  ...prev,
                  { id: `cat-${Date.now()}`, title: newCatalogTitle.trim(), itemCount: 0 }
                ]);
                setNewCatalogTitle('');
                setNewCatalogModalOpen(false);
                showToast('Catálogo criado com sucesso!', 'success');
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-neutral-700 block mb-1">
                  Nome do Catálogo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Fotos dos Trabalhos, Promoções, Cursos"
                  value={newCatalogTitle}
                  onChange={e => setNewCatalogTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-neutral-900 text-xs focus:outline-none focus:ring-2 focus:ring-pink-500/20"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewCatalogModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-semibold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-900 text-xs font-black shadow-xs transition"
                >
                  Criar Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
