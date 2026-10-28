import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { saveMedia, deleteMedia } from '../../utils/mediaStorage';
import { uploadMediaFile } from '../../utils/uploadMedia';
import { Biosite, Appointment, AppointmentStatus, Service, CatalogItem, CatalogSection, isItemVideo, DaySchedule } from '../../types';
import { BioSiteEditor } from '../agency/BioSiteEditor';
import { BioSiteView } from '../public/BioSiteView';
import { THEME_PRESETS } from '../../data/mockData';
import { CustomToggle } from '../common/CustomToggle';
import { ProfissionaisTab } from './ProfissionaisTab';
import { AcessoClienteTab } from './AcessoClienteTab';
import { LinksManagementPage } from '../links/LinksManagementPage';
import { SlugSettingsField } from './SlugSettingsField';
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
  Save,
  X, 
  Download,
  Calendar as CalendarIcon,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
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
  Edit3,
  Video,
  Lightbulb,
  Navigation,
  CalendarDays,
  Target,
  Key,
  Gift,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

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
  const colorInputRef = React.useRef<HTMLInputElement>(null);
  const isHex = (str?: string) => Boolean(str && /^#([0-9A-F]{3}){1,2}$/i.test(str));
  const hexColor = isHex(value) ? value : (isHex(defaultPreviewColor) ? defaultPreviewColor : '#ff2a85');
  const displayValue = (!value || value === 'padrão') ? hexColor : value;

  const handleOpenPicker = () => {
    if (colorInputRef.current) {
      if ('showPicker' in HTMLInputElement.prototype) {
        try {
          colorInputRef.current.showPicker();
          return;
        } catch {}
      }
      colorInputRef.current.click();
    }
  };

  return (
    <div>
      <span className="text-[11px] text-neutral-600 block mb-1 font-medium">{label}</span>
      <div className="flex items-center gap-2">
        <div 
          onClick={handleOpenPicker}
          className="relative w-8 h-8 rounded-lg border border-neutral-300 overflow-hidden shrink-0 shadow-2xs cursor-pointer hover:scale-105 transition"
          style={{ backgroundColor: hexColor }}
        >
          <input
            ref={colorInputRef}
            type="color"
            value={hexColor}
            onChange={e => onChange(e.target.value)}
            className="absolute -inset-2 w-12 h-12 cursor-pointer opacity-0"
            aria-label={label}
          />
        </div>
        <input
          type="text"
          value={displayValue}
          onChange={e => onChange(e.target.value)}
          placeholder={defaultPreviewColor}
          className="px-3 py-1.5 text-xs font-mono font-medium rounded-xl border border-neutral-300 w-full focus:outline-none focus:ring-2 focus:ring-pink-500/20 uppercase"
        />
        <button
          type="button"
          onClick={handleOpenPicker}
          className="text-xs text-neutral-500 hover:text-neutral-800 font-medium cursor-pointer transition shrink-0 px-1 py-1"
        >
          Alterar
        </button>
      </div>
    </div>
  );
};

const AddressColorPicker: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
}> = ({ label, value, onChange }) => {
  return (
    <div className="space-y-1.5">
      <label className="text-xs font-semibold text-neutral-700 block">
        {label}
      </label>
      <div className="relative flex items-center justify-between px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:border-neutral-300 transition shadow-2xs group cursor-pointer">
        <div className="flex items-center gap-3">
          <div
            className="w-7 h-7 rounded-lg border border-black/10 shadow-inner shrink-0"
            style={{ backgroundColor: value || '#ffffff' }}
          />
          <span className="text-xs font-mono font-medium text-neutral-800 uppercase tracking-wide">
            {value || '#FFFFFF'}
          </span>
        </div>
        <input
          type="color"
          value={value && value.startsWith('#') ? value : '#000000'}
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 opacity-0 w-full h-full cursor-pointer"
          aria-label={label}
        />
      </div>
    </div>
  );
};

export const ClientDashboard: React.FC = () => {
  const { 
    biosites,
    activeBiosite, 
    activeBiositeId,
    setActiveBiositeId,
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
    getBiositeStats,
    clientActiveTab,
    setClientActiveTab,
    logout,
    currentUser,
    switchUserRole,
    changePassword,
    creatorProfile,
    isInitialStateLoaded,
  } = useApp();

  const isClientRole = currentUser?.role === 'client';
  const clientPermissions = currentUser?.permissions || [];
  const mustChangePassword = isClientRole && !!currentUser?.mustChangePassword;

  // Estado para modal obrigatório de troca de senha no 1º login
  const [currentPwInput, setCurrentPwInput] = useState(currentUser?.temporaryPassword || 'SenhaSegura123!');
  const [newPwInput, setNewPwInput] = useState('');
  const [confirmPwInput, setConfirmPwInput] = useState('');
  const [showNewPw, setShowNewPw] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwLoading, setPwLoading] = useState(false);

  useEffect(() => {
    if (currentUser?.temporaryPassword) {
      setCurrentPwInput(currentUser.temporaryPassword);
    }
  }, [currentUser]);

  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);

    if (!currentPwInput.trim()) {
      setPwError('Informe a senha atual.');
      return;
    }
    if (!newPwInput.trim()) {
      setPwError('Informe a nova senha.');
      return;
    }
    if (newPwInput.length < 6) {
      setPwError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (newPwInput !== confirmPwInput) {
      setPwError('A confirmação da nova senha não confere.');
      return;
    }

    setPwLoading(true);
    setTimeout(() => {
      const res = changePassword(currentPwInput, newPwInput);
      setPwLoading(false);
      if (!res.success) {
        setPwError(res.message);
      } else {
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.5 } });
      }
    }, 350);
  };

  const selectedTab = clientActiveTab || 'aparencia';
  const setSelectedTab = setClientActiveTab;
  const [selectedCategory, setSelectedCategory] = useState<string>('Beleza');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [datePeriod, setDatePeriod] = useState<'hoje' | 'ontem' | '7d' | '15d' | '30d' | 'maximo'>('30d');
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // State for Catálogo tab (Carrossel & Catálogos)
  const [carouselAutoplay, setCarouselAutoplay] = useState<boolean>(true);
  const [carouselInterval, setCarouselInterval] = useState<number>(5);
  const [catalogsList, setCatalogsList] = useState<CatalogSection[]>(() => {
    return (activeBiosite?.catalogs && activeBiosite.catalogs.length > 0) ? activeBiosite.catalogs : [];
  });

  React.useEffect(() => {
    if (activeBiosite?.catalogs) {
      setCatalogsList(activeBiosite.catalogs);
    }
    if (activeBiosite?.catalogSettings) {
      setCarouselAutoplay(activeBiosite.catalogSettings.autoplay ?? true);
      setCarouselInterval(activeBiosite.catalogSettings.interval ?? 5);
    }
  }, [activeBiosite?.id, activeBiosite?.catalogs, activeBiosite?.updatedAt]);

  const [isNewCatalogModalOpen, setIsNewCatalogModalOpen] = useState(false);
  const [newCatalogTitle, setNewCatalogTitle] = useState('Nossos serviços');
  const newCatalogInputRef = useRef<HTMLInputElement>(null);

  // Media file input refs for Aparência tab (Upload from computer)
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const coverImageFileInputRef = useRef<HTMLInputElement>(null);
  const coverVideoFileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenNewCatalogModal = () => {
    setNewCatalogTitle('Nossos serviços');
    setIsNewCatalogModalOpen(true);
  };

  useEffect(() => {
    if (isNewCatalogModalOpen) {
      const timer = setTimeout(() => {
        if (newCatalogInputRef.current) {
          newCatalogInputRef.current.focus();
          newCatalogInputRef.current.select();
        }
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isNewCatalogModalOpen]);

  const handleConfirmCreateCatalog = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const finalTitle = newCatalogTitle.trim() || 'Nossos serviços';
    const newCat: CatalogSection = {
      id: `cat-${Date.now()}`,
      title: finalTitle,
      itemCount: 0,
      active: true,
      isExpanded: true,
      items: [],
    };
    setCatalogsList(prev => [...prev, newCat]);
    setIsNewCatalogModalOpen(false);
    setFloatingToast('Catálogo criado');
    setTimeout(() => {
      setFloatingToast(null);
    }, 3500);
  };


  const handleToggleExpandCatalog = (id: string) => {
    setCatalogsList(prev => prev.map(c => c.id === id ? { ...c, isExpanded: !c.isExpanded } : c));
  };

  const handleToggleActiveCatalog = (id: string) => {
    setCatalogsList(prev => prev.map(c => c.id === id ? { ...c, active: !c.active } : c));
  };

  const handleUpdateCatalogTitle = (id: string, newTitle: string) => {
    setCatalogsList(prev => prev.map(c => c.id === id ? { ...c, title: newTitle } : c));
  };

  const handleDeleteCatalog = (id: string) => {
    setCatalogsList(prev => prev.filter(c => c.id !== id));
    showToast('Catálogo excluído');
  };

  const handleFileUpload = (catId: string, type: 'image' | 'video' | 'tour', file: File) => {
    const isVideo = file.type.startsWith('video/') || type === 'video' || /\.(mp4|webm|mov|ogg|m4v|avi)$/i.test(file.name);
    const detectedType: 'image' | 'video' | 'tour' = isVideo ? 'video' : (type === 'tour' ? 'tour' : 'image');
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const commitItem = (fileUrl: string) => {
      const newItem: CatalogItem = {
        id: `item-${Date.now()}`,
        type: detectedType,
        mediaType,
        imageUrl: fileUrl,
        active: true,
        aspectRatio: '16:9',
        fit: 'cover',
        title: '',
        description: '',
        url: '',
        buttonText: '',
        buttonAlign: 'left',
      };

      setCatalogsList(prev => {
        const updated = prev.map(c => {
          if (c.id !== catId) return c;
          const currentItems = c.items || [];
          const updatedItems = [...currentItems, newItem];
          return {
            ...c,
            items: updatedItems,
            itemCount: updatedItems.length,
          };
        });
        if (activeBiosite) {
          updateBiosite(activeBiosite.id, { catalogs: updated });
        }
        return updated;
      });

      setFloatingToast(isVideo ? 'Vídeo adicionado' : type === 'tour' ? 'Tour 360º adicionado' : 'Imagem adicionada');
      setTimeout(() => {
        setFloatingToast(null);
      }, 3500);
    };

    showToast('Enviando mídia diretamente para o Cloudinary...');
    uploadMediaFile(file)
      .then(uploadedUrl => {
        commitItem(uploadedUrl);
        showToast(isVideo ? 'Vídeo enviado com sucesso para o Cloudinary!' : 'Imagem enviada com sucesso para o Cloudinary!', 'success');
      })
      .catch((err: any) => {
        console.error('[Upload Catálogo] Erro:', err);
        showToast(`Erro ao enviar mídia para o Cloudinary: ${err?.message || 'Falha no upload'}`, 'error');
      });
  };

  const handleReplaceItemFile = (catId: string, itemId: string, file: File) => {
    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v|avi)$/i.test(file.name);
    const mediaType: 'image' | 'video' = isVideo ? 'video' : 'image';

    const commitReplace = (fileUrl: string) => {
      const itemType: 'image' | 'video' = isVideo ? 'video' : 'image';
      handleUpdateCatalogItem(catId, itemId, { 
        imageUrl: fileUrl,
        mediaType,
        type: itemType
      });
      setCatalogsList(prev => {
        const updated: CatalogSection[] = prev.map(c => {
          if (c.id !== catId) return c;
          const updatedItems: CatalogItem[] = (c.items || []).map(item => item.id === itemId ? {
            ...item,
            imageUrl: fileUrl,
            mediaType,
            type: itemType
          } : item);
          return {
            ...c,
            items: updatedItems
          };
        });
        if (activeBiosite) {
          updateBiosite(activeBiosite.id, { catalogs: updated });
        }
        return updated;
      });
      setFloatingToast(isVideo ? 'Vídeo atualizado' : 'Imagem atualizada');
      setTimeout(() => {
        setFloatingToast(null);
      }, 3500);
    };

    showToast('Enviando nova mídia diretamente para o Cloudinary...');
    uploadMediaFile(file)
      .then(uploadedUrl => {
        commitReplace(uploadedUrl);
        showToast('Mídia substituída e salva na nuvem!', 'success');
      })
      .catch((err: any) => {
        console.error('[Upload Substituição] Erro:', err);
        showToast(`Erro ao substituir mídia: ${err?.message || 'Falha no upload'}`, 'error');
      });
  };

  const handleAddItemToCatalog = (catId: string, type: 'image' | 'video' | 'tour') => {
    const newItem: CatalogItem = {
      id: `item-${Date.now()}`,
      type,
      imageUrl: 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&auto=format&fit=crop&q=80',
      active: true,
      aspectRatio: '16:9',
      fit: 'cover',
      title: '',
      description: '',
      url: '',
      buttonText: '',
      buttonAlign: 'left',
    };

    setCatalogsList(prev => prev.map(c => {
      if (c.id !== catId) return c;
      const currentItems = c.items || [];
      const updatedItems = [...currentItems, newItem];
      return {
        ...c,
        items: updatedItems,
        itemCount: updatedItems.length,
      };
    }));

    setFloatingToast(type === 'image' ? 'Imagem adicionada' : type === 'video' ? 'Vídeo adicionado' : 'Tour 360º adicionado');
    setTimeout(() => {
      setFloatingToast(null);
    }, 3500);
  };

  const handleUpdateCatalogItem = (catId: string, itemId: string, updates: Partial<CatalogItem>) => {
    setCatalogsList(prev => prev.map(c => {
      if (c.id !== catId) return c;
      const updatedItems = (c.items || []).map(item => item.id === itemId ? { ...item, ...updates } : item);
      return {
        ...c,
        items: updatedItems,
        itemCount: updatedItems.length,
      };
    }));
  };

  const handleDeleteCatalogItem = (catId: string, itemId: string) => {
    setCatalogsList(prev => prev.map(c => {
      if (c.id !== catId) return c;
      const updatedItems = (c.items || []).filter(item => item.id !== itemId);
      return {
        ...c,
        items: updatedItems,
        itemCount: updatedItems.length,
      };
    }));
    showToast('Item excluído');
  };

  const handleSaveCatalog = async () => {
    if (!activeBiosite) return;
    const updatedAddress = addressForm.address ? {
      street: addressForm.address,
      city: '',
      state: '',
      buttonText: addressForm.buttonText,
      cardBgColor: addressForm.cardBgColor,
      cardTextColor: addressForm.cardTextColor,
      buttonBgColor: addressForm.buttonBgColor,
      buttonTextColor: addressForm.buttonTextColor,
    } : undefined;

    const updatedSite = {
      ...activeBiosite,
      catalogs: catalogsList,
      catalogSettings: {
        autoplay: carouselAutoplay,
        interval: carouselInterval,
      },
      address: updatedAddress,
      locationConfig: {
        ...activeBiosite.locationConfig,
        enabled: !!addressForm.address,
        address: addressForm.address,
        buttonText: addressForm.buttonText,
        cardBgColor: addressForm.cardBgColor,
        cardTextColor: addressForm.cardTextColor,
        buttonBgColor: addressForm.buttonBgColor,
        buttonTextColor: addressForm.buttonTextColor,
        googleMapsUrl: addressForm.address ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressForm.address)}` : '',
      }
    };

    try {
      showToast('Salvando catálogo no banco Neon...');
      await updateBiosite(activeBiosite.id, updatedSite);
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.6 }
      });
      showToast('Alterações do catálogo salvas com sucesso para todos os dispositivos!', 'success');
    } catch {
      showToast('Erro ao salvar catálogo no banco de dados', 'error');
    }
  };

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
  const lastLoadedSiteIdRef = React.useRef<string | null>(null);

  React.useEffect(() => {
    if (activeBiosite) {
      const siteKey = `${activeBiosite.id}_${isInitialStateLoaded}`;
      if (lastLoadedSiteIdRef.current !== siteKey) {
        lastLoadedSiteIdRef.current = siteKey;
        setAppearanceForm({
          logoShape: ((activeBiosite as any).logoShape || 'circle') as 'circle' | 'square',
          logoTransparent: (activeBiosite as any).logoTransparent || false,
          title: activeBiosite.title || '',
          subtitle: activeBiosite.subtitle || '',
          description: activeBiosite.description || '',
          primaryColor: activeBiosite.themeConfig?.primaryColor || '#2563EB',
          primaryTextColor: activeBiosite.themeConfig?.primaryTextColor || '#FFFFFF',
          fontFamily: activeBiosite.themeConfig?.fontFamily || 'Space Grotesk, sans-serif',
          coverUrl: activeBiosite.coverUrl || 'https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1200&auto=format&fit=crop&q=80',
          videoUrl: (activeBiosite as any).videoUrl || '',
          avatarUrl: activeBiosite.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
        });
      }
    }
  }, [activeBiosite?.id, isInitialStateLoaded]);

  const FONT_OPTIONS = [
    { id: 'Space Grotesk, sans-serif', name: 'Padrão (Space Grotesk)' },
    { id: 'Inter, sans-serif', name: 'Inter' },
    { id: 'Poppins, sans-serif', name: 'Poppins' },
    { id: 'Outfit, sans-serif', name: 'Outfit' },
    { id: 'Playfair Display, serif', name: 'Playfair Display' },
    { id: 'Montserrat, sans-serif', name: 'Montserrat' },
  ];

  const handleSaveAppearance = async () => {
    if (!activeBiosite) return;

    const updatedSite: Partial<Biosite> = {
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
      logoShape: appearanceForm.logoShape,
      logoTransparent: appearanceForm.logoTransparent,
      videoUrl: appearanceForm.videoUrl,
      contactButtons: buttonsList,
    };

    try {
      showToast('Salvando aparência no banco Neon...');
      await updateBiosite(activeBiosite.id, updatedSite);
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.3 } });
      showToast('Alterações de aparência salvas com sucesso no banco Neon!', 'success');
    } catch {
      showToast('Erro ao salvar aparência no banco de dados', 'error');
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido (PNG, JPG, WebP, etc.).', 'error');
      return;
    }

    try {
      showToast('Enviando logo...');
      const uploadedUrl = await uploadMediaFile(file);
      setAppearanceForm(prev => ({ ...prev, avatarUrl: uploadedUrl }));
      if (activeBiosite) {
        updateBiosite(activeBiosite.id, { avatarUrl: uploadedUrl });
      }
      showToast('Logo atualizada com sucesso!', 'success');
    } catch {
      showToast('Erro ao enviar imagem', 'error');
    }
    e.target.value = '';
  };

  const handleCoverImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Por favor, selecione um arquivo de imagem válido.', 'error');
      return;
    }

    try {
      showToast('Enviando imagem de capa...');
      const uploadedUrl = await uploadMediaFile(file);
      setAppearanceForm(prev => ({ ...prev, coverUrl: uploadedUrl, videoUrl: '' }));
      if (activeBiosite) {
        updateBiosite(activeBiosite.id, { 
          coverUrl: uploadedUrl,
          coverType: 'image',
          ...({ videoUrl: '' } as any)
        });
      }
      showToast('Imagem de capa salva com sucesso!', 'success');
    } catch {
      showToast('Erro ao enviar imagem', 'error');
    }
    e.target.value = '';
  };

  const handleCoverVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVideo = file.type.startsWith('video/') || /\.(mp4|webm|mov|ogg|m4v|avi)$/i.test(file.name);
    if (!isVideo) {
      showToast('Por favor, selecione um arquivo de vídeo válido (MP4, WebM, MOV).', 'error');
      return;
    }

    if (file.size > 100 * 1024 * 1024) {
      showToast('O arquivo de vídeo deve ter no máximo 100MB.', 'error');
      return;
    }

    try {
      showToast('Enviando vídeo de capa...');
      const uploadedUrl = await uploadMediaFile(file);
      setAppearanceForm(prev => ({ ...prev, videoUrl: uploadedUrl }));
      if (activeBiosite) {
        updateBiosite(activeBiosite.id, { 
          videoUrl: uploadedUrl,
          coverType: 'video',
        } as any);
      }
      showToast('Vídeo de capa salvo com sucesso!', 'success');
    } catch (err) {
      console.warn('Erro ao processar vídeo:', err);
      showToast('Erro ao enviar vídeo', 'error');
    }
    e.target.value = '';
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

  // Unified button list resolver: strictly preserves user-defined order for ALL buttons
  const resolveContactButtonsList = (biosite?: Biosite) => {
    if (!biosite) return [];
    const rawButtons = biosite.contactButtons || [];
    const list: any[] = [];

    let hasBooking = false;
    let hasPix = false;
    let hasWifi = false;

    for (const b of rawButtons) {
      const isBooking = b.id === 'btn-booking' || b.id === 'btn-agendar' || b.type === 'Agendar' || (b as any).isSpecial === 'booking' || b.label?.toLowerCase().includes('agendar');
      const isPix = b.id === 'btn-pix' || b.type === 'Pix' || (b as any).isSpecial === 'pix';
      const isWifi = b.id === 'btn-wifi' || b.type === 'WiFi' || (b as any).isSpecial === 'wifi';

      if (isBooking) {
        hasBooking = true;
        list.push({
          ...b,
          type: 'Agendar',
          isSpecial: 'booking',
          url: b.url || '#agendar',
          displayMode: b.displayMode || 'full_button',
          pulseEffect: b.pulseEffect || false,
          bgColor: b.bgColor || 'padrão',
          textColor: b.textColor || 'padrão',
        });
        continue;
      }

      if (isPix) {
        hasPix = true;
        list.push({
          ...b,
          id: 'btn-pix',
          type: 'Pix',
          isSpecial: 'pix',
          url: '#pix',
          displayMode: b.displayMode || 'full_button',
          pulseEffect: b.pulseEffect || false,
          bgColor: b.bgColor || biosite.pixConfig?.buttonBgColor || 'padrão',
          textColor: b.textColor || biosite.pixConfig?.buttonTextColor || 'padrão',
        });
        continue;
      }

      if (isWifi) {
        hasWifi = true;
        list.push({
          ...b,
          id: 'btn-wifi',
          type: 'WiFi',
          isSpecial: 'wifi',
          url: '#wifi',
          displayMode: b.displayMode || 'full_button',
          pulseEffect: b.pulseEffect || false,
          bgColor: b.bgColor || biosite.wifiConfig?.buttonBgColor || 'padrão',
          textColor: b.textColor || biosite.wifiConfig?.buttonTextColor || 'padrão',
        });
        continue;
      }

      list.push({
        ...b,
        type: b.type || (b.isWhatsApp ? 'WhatsApp' : b.label?.includes('Instagram') ? 'Instagram' : b.label),
        displayMode: b.displayMode || 'full_button',
        pulseEffect: b.pulseEffect || false,
        bgColor: b.bgColor || 'padrão',
        textColor: b.textColor || 'padrão',
      });
    }

    if (!hasBooking) {
      list.push({
        id: 'btn-agendar',
        label: 'Agendar',
        icon: 'Calendar',
        lucideIcon: 'Calendar',
        url: '#agendar',
        isWhatsApp: false,
        type: 'Agendar',
        isSpecial: 'booking',
        active: true,
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: '#ff2a85',
        textColor: '#ffffff',
      });
    }

    const hasPixKey = Boolean(biosite.pixConfig?.pixKey && biosite.pixConfig.pixKey.trim() !== '');
    if (hasPixKey && !hasPix) {
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
        bgColor: biosite.pixConfig?.buttonBgColor || 'padrão',
        textColor: biosite.pixConfig?.buttonTextColor || 'padrão',
      });
    }

    const hasWifiName = Boolean(biosite.wifiConfig?.networkName && biosite.wifiConfig.networkName.trim() !== '');
    if (hasWifiName && !hasWifi) {
      list.push({
        id: 'btn-wifi',
        label: 'WIFI',
        icon: 'Wifi',
        lucideIcon: 'Wifi',
        url: '#wifi',
        isWhatsApp: false,
        active: true,
        type: 'WiFi',
        isSpecial: 'wifi',
        displayMode: 'full_button',
        pulseEffect: false,
        bgColor: biosite.wifiConfig?.buttonBgColor || 'padrão',
        textColor: biosite.wifiConfig?.buttonTextColor || 'padrão',
      });
    }

    return list;
  };

  // Buttons state initialized with all buttons preserving exact ordering
  const [buttonsList, setButtonsList] = useState<any[]>(() => {
    return resolveContactButtonsList(activeBiosite);
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

  // Endereço (Location) form state
  const [addressForm, setAddressForm] = useState({
    address: activeBiosite?.locationConfig?.address || '',
    buttonText: activeBiosite?.locationConfig?.buttonText || 'Como chegar',
    cardBgColor: activeBiosite?.locationConfig?.cardBgColor || '#ffffff',
    cardTextColor: activeBiosite?.locationConfig?.cardTextColor || '#171717',
    buttonBgColor: activeBiosite?.locationConfig?.buttonBgColor || '#10b981',
    buttonTextColor: activeBiosite?.locationConfig?.buttonTextColor || '#ffffff',
    enabled: activeBiosite?.locationConfig?.enabled ?? !!activeBiosite?.locationConfig?.address,
  });

  const lastLoadedButtonsSiteIdRef = React.useRef<string | null>(null);

  useEffect(() => {
    if (!activeBiosite) return;
    const siteKey = `${activeBiosite.id}_${isInitialStateLoaded}`;
    if (lastLoadedButtonsSiteIdRef.current !== siteKey) {
      lastLoadedButtonsSiteIdRef.current = siteKey;

      if (activeBiosite.locationConfig) {
        setAddressForm({
          address: activeBiosite.locationConfig.address || '',
          buttonText: activeBiosite.locationConfig.buttonText || 'Como chegar',
          cardBgColor: activeBiosite.locationConfig.cardBgColor || '#ffffff',
          cardTextColor: activeBiosite.locationConfig.cardTextColor || '#171717',
          buttonBgColor: activeBiosite.locationConfig.buttonBgColor || '#10b981',
          buttonTextColor: activeBiosite.locationConfig.buttonTextColor || '#ffffff',
          enabled: activeBiosite.locationConfig.enabled ?? !!activeBiosite.locationConfig.address,
        });
      }

      setButtonsList(resolveContactButtonsList(activeBiosite));

      if (activeBiosite.pixConfig) {
        setPixForm({
          keyType: activeBiosite.pixConfig.keyType || '',
          pixKey: activeBiosite.pixConfig.pixKey || '',
          instantPix: (activeBiosite.pixConfig as any)?.instantPix || false,
          hasCardBg: (activeBiosite.pixConfig as any)?.hasCardBg || false,
          cardTextColor: activeBiosite.pixConfig.cardTextColor || 'padrão',
          buttonBgColor: activeBiosite.pixConfig.buttonBgColor || 'padrão',
          buttonTextColor: activeBiosite.pixConfig.buttonTextColor || 'padrão',
        });
      }

      if (activeBiosite.wifiConfig) {
        setWifiForm({
          networkName: activeBiosite.wifiConfig.networkName || '',
          password: activeBiosite.wifiConfig.password || '',
          hasCardBg: (activeBiosite.wifiConfig as any)?.hasCardBg || false,
          cardTextColor: activeBiosite.wifiConfig.cardTextColor || 'padrão',
          buttonBgColor: activeBiosite.wifiConfig.buttonBgColor || 'padrão',
          buttonTextColor: activeBiosite.wifiConfig.buttonTextColor || 'padrão',
        });
      }
    }
  }, [activeBiosite?.id, isInitialStateLoaded]);

  const handleSaveAddress = async () => {
    if (!activeBiosite) return;
    const trimmed = addressForm.address.trim();
    const mapsUrl = trimmed
      ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
      : '';
    const newLocationConfig = {
      ...activeBiosite.locationConfig,
      address: trimmed,
      buttonText: addressForm.buttonText.trim() || 'Como chegar',
      cardBgColor: addressForm.cardBgColor,
      cardTextColor: addressForm.cardTextColor,
      buttonBgColor: addressForm.buttonBgColor,
      buttonTextColor: addressForm.buttonTextColor,
      googleMapsUrl: mapsUrl,
      enabled: !!trimmed,
    };
    setAddressForm(prev => ({ ...prev, enabled: !!trimmed }));
    try {
      showToast('Salvando endereço no banco Neon...');
      await updateBiosite(activeBiosite.id, { locationConfig: newLocationConfig });
      showToast('Endereço salvo com sucesso no banco de dados!', 'success');
      setFloatingToast('Endereço salvo com sucesso!');
      setTimeout(() => setFloatingToast(null), 3000);
    } catch {
      showToast('Erro ao salvar endereço no banco Neon', 'error');
    }
  };

  const handleTestMaps = () => {
    const trimmed = addressForm.address.trim();
    if (!trimmed) {
      showToast('Digite um endereço antes de testar no Google Maps.', 'error');
      return;
    }
    const url = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleRemoveAddress = () => {
    if (!activeBiosite) return;
    const newLocationConfig = {
      ...activeBiosite.locationConfig,
      address: '',
      enabled: false,
    };
    setAddressForm(prev => ({
      ...prev,
      address: '',
      enabled: false,
    }));
    updateBiosite(activeBiosite.id, { locationConfig: newLocationConfig });
    showToast('Endereço removido!');
    setFloatingToast('Endereço removido');
    setTimeout(() => setFloatingToast(null), 3000);
  };

  // Serviços tab state & handlers
  const [newServiceName, setNewServiceName] = useState('');
  const [newServiceDuration, setNewServiceDuration] = useState('30');
  const [newServicePrice, setNewServicePrice] = useState('');
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [editServiceName, setEditServiceName] = useState('');
  const [editServiceDuration, setEditServiceDuration] = useState('');
  const [editServicePrice, setEditServicePrice] = useState('');

  const handleAddService = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeBiosite) return;
    if (!newServiceName.trim()) {
      showToast('Digite o nome do serviço', 'error');
      return;
    }
    const duration = parseInt(newServiceDuration, 10) || 30;
    const price = parseFloat(newServicePrice.replace(',', '.')) || 0;

    addService({
      biositeId: activeBiosite.id,
      name: newServiceName.trim(),
      description: '',
      category: 'Geral',
      durationMinutes: duration,
      price: price,
      images: [],
      orderIndex: siteServices.length,
      active: true,
    });

    setNewServiceName('');
    setNewServiceDuration('30');
    setNewServicePrice('');
    setFloatingToast('Serviço adicionado com sucesso!');
    setTimeout(() => setFloatingToast(null), 3000);
  };

  const handleStartEditService = (svc: Service) => {
    setEditingServiceId(svc.id);
    setEditServiceName(svc.name);
    setEditServiceDuration(String(svc.durationMinutes));
    setEditServicePrice(String(svc.price));
  };

  const handleSaveEditService = (id: string) => {
    if (!editServiceName.trim()) {
      showToast('Digite o nome do serviço', 'error');
      return;
    }
    const duration = parseInt(editServiceDuration, 10) || 30;
    const price = parseFloat(editServicePrice.replace(',', '.')) || 0;

    updateService(id, {
      name: editServiceName.trim(),
      durationMinutes: duration,
      price: price,
    });

    setEditingServiceId(null);
    setFloatingToast('Serviço atualizado com sucesso!');
    setTimeout(() => setFloatingToast(null), 3000);
  };

  const handleDeleteService = (id: string) => {
    deleteService(id);
    setFloatingToast('Serviço removido com sucesso!');
    setTimeout(() => setFloatingToast(null), 3000);
  };

  // Disponibilidade calendar & slots state (matching the 3 prints)
  const [calYear, setCalYear] = useState(2026);
  const [calMonth, setCalMonth] = useState(7); // 7 = agosto (0-indexed)
  const [selectedDay, setSelectedDay] = useState(3); // 03 de Agosto por padrão
  const ALL_TIME_SLOTS = [
    '06:00', '07:00',
    '08:00', '09:00',
    '10:00', '11:00',
    '12:00', '13:00',
    '14:00', '15:00',
    '16:00', '17:00',
    '18:00', '19:00',
    '20:00', '21:00',
  ];

  const [blockedDays, setBlockedDays] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('biosaas_blocked_days');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      '2026-08-02': true,
      '2026-08-09': true,
      '2026-08-16': true,
      '2026-08-23': true,
      '2026-08-30': true,
    };
  });

  const [dayOpenSlots, setDayOpenSlots] = useState<Record<string, string[]>>(() => {
    try {
      const saved = localStorage.getItem('biosaas_day_slots');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      '2026-08-03': ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'],
      '2026-08-01': [],
    };
  });

  const currentDateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const isCurrentDayBlocked = !!blockedDays[currentDateKey];

  const handleToggleBlockCurrentDay = () => {
    const willBlock = !isCurrentDayBlocked;
    setBlockedDays(prev => {
      const next = { ...prev, [currentDateKey]: willBlock };
      localStorage.setItem('biosaas_blocked_days', JSON.stringify(next));
      return next;
    });
    setFloatingToast(willBlock ? 'Dia bloqueado' : 'Dia desbloqueado');
    setTimeout(() => setFloatingToast(null), 2500);
  };

  const handleToggleSlot = (slot: string) => {
    const currentSlots = isCurrentDayBlocked
      ? []
      : (dayOpenSlots[currentDateKey] ?? ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
    const isActive = currentSlots.includes(slot);
    const updated = isActive ? currentSlots.filter(s => s !== slot) : [...currentSlots, slot];

    if (isCurrentDayBlocked) {
      setBlockedDays(prev => {
        const next = { ...prev, [currentDateKey]: false };
        localStorage.setItem('biosaas_blocked_days', JSON.stringify(next));
        return next;
      });
    }

    setDayOpenSlots(prev => {
      const next = { ...prev, [currentDateKey]: updated };
      localStorage.setItem('biosaas_day_slots', JSON.stringify(next));
      return next;
    });

    setFloatingToast('Horário atualizado');
    setTimeout(() => setFloatingToast(null), 2000);
  };

  const getSelectedDateTitle = () => {
    const d = new Date(calYear, calMonth, selectedDay);
    const dayNames = ['Domingo', 'Segunda-Feira', 'Terça-Feira', 'Quarta-Feira', 'Quinta-Feira', 'Sexta-Feira', 'Sábado'];
    const monthNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const dayName = dayNames[d.getDay()];
    const dayNum = String(selectedDay).padStart(2, '0');
    const monthName = monthNames[calMonth];
    return `${dayName}, ${dayNum} De ${monthName}`;
  };

  const getCalendarDays = () => {
    const firstDayIndex = new Date(calYear, calMonth, 1).getDay();
    const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();
    const days: { day: number; isCurrentMonth: boolean; dateKey: string }[] = [];

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = daysInPrevMonth - i;
      const prevMonthIdx = calMonth === 0 ? 11 : calMonth - 1;
      const prevYear = calMonth === 0 ? calYear - 1 : calYear;
      days.push({
        day: d,
        isCurrentMonth: false,
        dateKey: `${prevYear}-${String(prevMonthIdx + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      });
    }

    for (let i = 1; i <= daysInMonth; i++) {
      days.push({
        day: i,
        isCurrentMonth: true,
        dateKey: `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    const remaining = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remaining; i++) {
      const nextMonthIdx = calMonth === 11 ? 0 : calMonth + 1;
      const nextYear = calMonth === 11 ? calYear + 1 : calYear;
      days.push({
        day: i,
        isCurrentMonth: false,
        dateKey: `${nextYear}-${String(nextMonthIdx + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`
      });
    }

    return days;
  };

  // Pixels state
  const [pixelsForm, setPixelsForm] = useState(() => {
    try {
      const saved = localStorage.getItem(`biosaas_pixels_${activeBiosite?.id}`);
      return saved ? JSON.parse(saved) : { metaPixel: '', ga4: '', gtm: '', tiktok: '' };
    } catch {
      return { metaPixel: '', ga4: '', gtm: '', tiktok: '' };
    }
  });

  const handleSavePixels = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeBiosite) {
      localStorage.setItem(`biosaas_pixels_${activeBiosite.id}`, JSON.stringify(pixelsForm));
    }
    setFloatingToast('Tags e Pixels salvos com sucesso!');
  };

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

  const moveButton = async (indexOrId: number | string, direction: 'up' | 'down') => {
    if (!activeBiosite) return;
    const index = typeof indexOrId === 'number' 
      ? indexOrId 
      : buttonsList.findIndex(b => b.id === indexOrId || (b as any).type === indexOrId || (b.label && b.label.toLowerCase() === String(indexOrId).toLowerCase()));
    if (index < 0 || index >= buttonsList.length) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= buttonsList.length) return;

    const nextList = [...buttonsList];
    const [movedItem] = nextList.splice(index, 1);
    nextList.splice(targetIndex, 0, movedItem);

    // Update local UI immediately
    setButtonsList(nextList);
    setHasUnsavedButtonChanges(false);

    // Persist immediately to Neon database via updateBiosite
    try {
      showToast('Salvando nova ordem dos botões no banco Neon...');
      await updateBiosite(activeBiosite.id, { 
        contactButtons: nextList,
      });
      showToast('Ordem dos botões salva com sucesso no banco!', 'success');
      setFloatingToast('Ordem dos botões salva!');
      setTimeout(() => setFloatingToast(null), 2500);
    } catch (err) {
      console.error('Erro ao salvar ordem dos botões no Neon:', err);
      showToast('Erro ao salvar ordem dos botões no banco Neon', 'error');
    }
  };

  const moveUp = (indexOrId: number | string) => moveButton(indexOrId, 'up');
  const moveDown = (indexOrId: number | string) => moveButton(indexOrId, 'down');

  const handleSaveButtons = async () => {
    if (!activeBiosite) return;
    try {
      showToast('Salvando botões no banco Neon...');
      await updateBiosite(activeBiosite.id, {
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
      showToast('Botões e integrações salvos no banco de dados!', 'success');
    } catch {
      showToast('Erro ao salvar botões no banco Neon', 'error');
    }
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
    locationConfig: {
      ...activeBiosite.locationConfig,
      address: addressForm.address,
      buttonText: addressForm.buttonText || 'Como chegar',
      cardBgColor: addressForm.cardBgColor,
      cardTextColor: addressForm.cardTextColor,
      buttonBgColor: addressForm.buttonBgColor,
      buttonTextColor: addressForm.buttonTextColor,
      googleMapsUrl: addressForm.address.trim()
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressForm.address.trim())}`
        : '',
      enabled: (addressForm.enabled || !!addressForm.address.trim()) && !!addressForm.address.trim(),
    },
    catalogs: catalogsList,
    catalogSettings: {
      autoplay: carouselAutoplay,
      interval: carouselInterval,
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
    const fullUrl = `https://bio.mbwebdigital.com.br/${activeBiosite.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Link do mini-site copiado!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handlePublish = async () => {
    if (!activeBiosite) return;
    try {
      showToast('Salvando e publicando todas as configurações no banco Neon...');
      await updateBiosite(activeBiosite.id, { 
        status: 'active',
        contactButtons: buttonsList,
        title: appearanceForm.title,
        subtitle: appearanceForm.subtitle,
        description: appearanceForm.description,
        avatarUrl: appearanceForm.avatarUrl,
        coverUrl: appearanceForm.coverUrl,
        videoUrl: appearanceForm.videoUrl,
        logoShape: appearanceForm.logoShape,
        logoTransparent: appearanceForm.logoTransparent,
        themeConfig: {
          ...activeBiosite.themeConfig,
          primaryColor: appearanceForm.primaryColor,
          primaryTextColor: appearanceForm.primaryTextColor,
          fontFamily: appearanceForm.fontFamily,
        },
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
        locationConfig: {
          ...activeBiosite.locationConfig,
          address: addressForm.address.trim(),
          buttonText: addressForm.buttonText.trim() || 'Como chegar',
          cardBgColor: addressForm.cardBgColor,
          cardTextColor: addressForm.cardTextColor,
          buttonBgColor: addressForm.buttonBgColor,
          buttonTextColor: addressForm.buttonTextColor,
          googleMapsUrl: addressForm.address.trim()
            ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(addressForm.address.trim())}`
            : '',
          enabled: !!addressForm.address.trim(),
        },
      });
      setHasUnsavedButtonChanges(false);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.2 }
      });
      showToast('Mini-site republicado e salvo no banco de dados Neon!', 'success');
    } catch (err: any) {
      console.error('Erro ao republicar no banco Neon:', err);
      showToast(`Falha ao salvar no banco Neon: ${err?.message || 'Erro na gravação'}`, 'error');
    }
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
        { id: 'links', label: isClientRole ? 'Meu link' : 'Meus links', icon: LinkIcon },
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
        { id: 'titulos', label: 'URL e Acesso', icon: Type },
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
        { id: 'disponibilidade', label: 'Disponibilidade', icon: CalendarDays },
      ],
    },
    {
      title: 'Integrações',
      items: [
        { id: 'pixels', label: 'Pixels & Rastreio', icon: Target },
      ],
    },
    {
      title: 'Configurações',
      items: [
        { id: 'acesso_cliente', label: 'Acesso do cliente', icon: Key },
      ],
    },
    {
      title: 'Parceria',
      items: [
        { id: 'seja_parceiro', label: 'Seja Parceiro', icon: Gift },
      ],
    },
  ];

  // RBAC: Se o usuário for 'client', filtra apenas as seções e abas permitidas
  const displayedSections = React.useMemo(() => {
    if (!isClientRole) {
      return NAV_SECTIONS;
    }
    return NAV_SECTIONS.map(section => {
      // Configurações (Acesso do cliente) e Parceria são restritos aos Admins
      if (section.title === 'Configurações' || section.title === 'Parceria') return null;

      const filteredItems = section.items.filter(item => {
        if (item.id === 'profissionais') {
          return clientPermissions.includes('Serviços') || clientPermissions.includes('Disponibilidade');
        }
        if (item.id === 'links') {
          return clientPermissions.includes('Meus Links') || clientPermissions.includes('Meus links') || clientPermissions.includes('Meu link');
        }
        return clientPermissions.includes(item.label);
      });

      if (filteredItems.length === 0) return null;

      return {
        ...section,
        items: filteredItems,
      };
    }).filter(Boolean) as typeof NAV_SECTIONS;
  }, [isClientRole, clientPermissions]);

  // Garante que o cliente acesse uma aba permitida
  useEffect(() => {
    if (isClientRole && displayedSections.length > 0) {
      const allAllowedItemIds = displayedSections.flatMap(s => s.items.map(i => i.id));
      if (!allAllowedItemIds.includes(selectedTab)) {
        setSelectedTab(allAllowedItemIds[0] || 'estatisticas');
      }
    }
  }, [isClientRole, displayedSections, selectedTab]);

  // Dates for the chart X-axis
  const CHART_DATES = [
    '02/07', '03/07', '04/07', '05/07', '07/07', '09/07', '10/07', '11/07',
    '13/07', '15/07', '16/07', '17/07', '19/07', '20/07', '21/07', '22/07',
    '23/07', '24/07', '25/07', '26/07', '27/07', '29/07', '31/07'
  ];

  return (
    <div className="flex-1 bg-white text-neutral-900 min-h-screen flex flex-col font-sans select-none">
      
      {/* 1. TOPMOST BAR com indicação de Papel RBAC */}
      <div className="w-full bg-white border-b border-neutral-200 px-6 py-2.5 flex items-center justify-between text-xs text-neutral-600 shrink-0">
        <div className="flex items-center gap-3">
          {isClientRole ? (
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="font-bold text-gray-900 text-xs">
                Painel do Cliente • {activeBiosite.title}
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-bold">
                CLIENTE: {currentUser?.name}
              </span>
            </div>
          ) : (
            <button 
              onClick={() => setCurrentView('agency')} 
              className="flex items-center gap-1.5 font-medium hover:text-neutral-900 transition cursor-pointer"
            >
              <span>← Voltar pros meus sites</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3 sm:gap-4">
          {/* Botão de alternância rápida de papel para facilitar a avaliação */}
          {isClientRole ? (
            <button
              type="button"
              onClick={() => switchUserRole('admin')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-bold border border-gray-200 transition cursor-pointer"
              title="Voltar para a visão completa de Administrador"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#ff2a85]" />
              <span className="hidden sm:inline">Voltar p/</span>
              <span>Visão Admin</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => switchUserRole('client')}
              className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#fff7fa] border border-[#fce7f3] text-[#ff2a85] text-xs font-bold hover:bg-[#ffedf4] transition cursor-pointer"
              title="Testar visão do cliente logado"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Testar Visão</span>
              <span>Cliente</span>
            </button>
          )}

          <button 
            onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20com%20meu%20painel%20MB%20Web%20Digital', '_blank')}
            className="hidden md:flex items-center gap-1.5 hover:text-neutral-900 transition cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-neutral-500" />
            <span>Falar com gerente</span>
          </button>
          
          {!isClientRole && (
            <button 
              onClick={() => setCurrentView('agency')} 
              className="flex items-center gap-1.5 hover:text-neutral-900 transition cursor-pointer text-xs"
            >
              <span>Meus sites</span>
            </button>
          )}

          <button 
            onClick={() => logout()} 
            className="flex items-center gap-1.5 hover:text-red-600 transition cursor-pointer text-xs"
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
            bio.mbwebdigital.com.br/{activeBiosite.slug}
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

          {/* Ver Publicado Button */}
          <a
            href={`/${activeBiosite.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => {
              if (activeBiosite) {
                updateBiosite(activeBiosite.id, { contactButtons: buttonsList }).catch(() => {});
              }
              if (e.metaKey || e.ctrlKey || e.button === 1) return;
              try {
                const url = `/${activeBiosite.slug}`;
                setActiveBiositeId(activeBiosite.id);
                const win = window.open(url, '_blank');
                if (!win) {
                  e.preventDefault();
                  window.history.pushState({}, '', url);
                  setCurrentView('public');
                } else {
                  e.preventDefault();
                }
              } catch {
                e.preventDefault();
                setActiveBiositeId(activeBiosite.id);
                window.history.pushState({}, '', `/${activeBiosite.slug}`);
                setCurrentView('public');
              }
            }}
            className="px-3 py-1.5 rounded-lg border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 shadow-2xs transition cursor-pointer"
            title={`Abrir mini-site em tempo real (${activeBiosite.slug})`}
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Ver Publicado</span>
          </a>

          {/* Salvar Tudo Button */}
          <button
            onClick={handlePublish}
            className="px-3.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            title="Salvar todas as alterações (textos, cores, botões) no banco Neon"
          >
            <Save className="w-3.5 h-3.5" />
            <span>Salvar Tudo</span>
          </button>

          {/* Republicar Button (Lime neon matching screenshots) */}
          <button
            onClick={handlePublish}
            className="px-4 py-1.5 rounded-lg bg-[#bef264] hover:bg-[#aee625] text-neutral-900 text-xs font-black flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Republicar</span>
          </button>

          {/* Sair Button */}
          <button
            onClick={() => logout()}
            className="px-2.5 py-1.5 rounded-lg text-neutral-600 hover:text-red-600 hover:bg-red-50 text-xs font-medium flex items-center gap-1 transition cursor-pointer"
            title="Encerrar sessão"
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
          <aside className="w-56 bg-white border-r border-neutral-200 py-4 px-3 flex flex-col justify-between shrink-0 h-[calc(100vh-92px)] overflow-y-auto">
            <div className="space-y-6">
              {displayedSections.map((sec, secIdx) => (
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
        <main className="flex-1 p-6 lg:p-8 min-w-0 relative">
          
          {/* ALERTA CRÍTICO DE SEGURANÇA: Banner no topo para troca de senha provisória */}
          {mustChangePassword && (
            <div className="mb-6 p-4 rounded-2xl bg-[#fff7fa] border-2 border-[#ff2a85] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[#ff2a85] text-white flex items-center justify-center shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5 stroke-[2.2]" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs font-extrabold text-neutral-900">
                      Alerta Crítico de Segurança: Troca de Senha Obrigatória
                    </h4>
                    <span className="text-[10px] bg-[#ff2a85] text-white px-2 py-0.2 rounded-full font-bold uppercase">
                      1º Login
                    </span>
                  </div>
                  <p className="text-xs text-neutral-600 mt-0.5 font-medium">
                    Por questões de segurança, você precisa alterar sua senha provisória agora para ter acesso aos recursos do mini-site.
                  </p>
                </div>
              </div>
              <div className="shrink-0">
                <span className="text-[11px] font-bold text-[#ff2a85] bg-white border border-[#fce7f3] px-3 py-1.5 rounded-xl block">
                  Ação bloqueante ativa
                </span>
              </div>
            </div>
          )}

          {/* MODAL BLOQUEANTE DE ALTERAÇÃO OBRIGATÓRIA DE SENHA */}
          {mustChangePassword && (
            <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 select-none">
              <div className="bg-white rounded-2xl border-2 border-[#ff2a85] max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl relative animate-in zoom-in-95 duration-200">
                
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-[#fff7fa] border border-[#fce7f3] text-[#ff2a85] flex items-center justify-center mx-auto shadow-2xs">
                    <ShieldAlert className="w-6 h-6 stroke-[2.2]" />
                  </div>
                  <h3 className="text-base font-extrabold text-neutral-900 tracking-tight">
                    Alteração de Senha Obrigatória
                  </h3>
                  <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto font-medium">
                    Por questões de segurança, você precisa alterar sua senha provisória agora.
                  </p>
                </div>

                {pwError && (
                  <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                    <span>{pwError}</span>
                  </div>
                )}

                <form onSubmit={handleSaveNewPassword} className="space-y-3.5">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Senha Atual (Provisória)
                    </label>
                    <input
                      type="text"
                      value={currentPwInput}
                      onChange={e => setCurrentPwInput(e.target.value)}
                      placeholder="SenhaSegura123!"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs font-mono font-bold text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Nova Senha (mínimo 6 caracteres)
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPw ? 'text' : 'password'}
                        value={newPwInput}
                        onChange={e => setNewPwInput(e.target.value)}
                        placeholder="Digite sua nova senha"
                        required
                        className="w-full pl-3.5 pr-10 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      >
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-neutral-800 block">
                      Confirmar Nova Senha
                    </label>
                    <input
                      type={showNewPw ? 'text' : 'password'}
                      value={confirmPwInput}
                      onChange={e => setConfirmPwInput(e.target.value)}
                      placeholder="Repita a nova senha"
                      required
                      className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs font-medium text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#ff2a85]/20 focus:border-[#ff2a85]"
                    />
                  </div>

                  {/* Botão Salvar Verde Limão conforme a regra estrita de design */}
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="w-full mt-2 py-3 px-4 rounded-xl bg-[#84cc16] hover:bg-[#65a30d] active:scale-[0.99] text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center justify-center gap-2 disabled:opacity-70"
                  >
                    {pwLoading ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span>Salvando senha...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>Salvar Nova Senha & Liberar Painel</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          )}

          {/* Floating Toast Notification matching Print 2 */}
          {floatingToast && (
            <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-[#0b1e16] text-white border border-emerald-900/60 px-4 py-2 rounded-2xl flex items-center gap-2.5 text-xs font-semibold shadow-xl animate-in slide-in-from-top-2">
              <button 
                type="button" 
                onClick={() => setFloatingToast(null)} 
                className="text-neutral-400 hover:text-white p-0.5 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{floatingToast}</span>
            </div>
          )}
          
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

                        <div className="mt-6 mb-2 flex items-center justify-center text-center text-xs text-neutral-800 select-none gap-1.5">
                          {creatorProfile?.photoUrl ? (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-transparent">
                              <img src={creatorProfile.photoUrl} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0">
                              <span className="text-[#00e5ff] font-extrabold text-[7px] tracking-tighter font-mono">on</span>
                            </div>
                          )}
                          <span>Feito por&nbsp;</span>
                          <a
                            href={creatorProfile?.linkUrl || 'https://mbwebdigital.com.br'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 underline hover:text-gray-700 transition font-semibold"
                          >
                            {creatorProfile?.name || 'MB Web Digital'}
                          </a>
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
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    <div className="flex items-center gap-3.5">
                      <div 
                        onClick={() => logoFileInputRef.current?.click()}
                        className="cursor-pointer group relative"
                        title="Clique para escolher logo do computador"
                      >
                        <img 
                          src={appearanceForm.avatarUrl} 
                          alt="Logo" 
                          className={`w-14 h-14 ${appearanceForm.logoShape === 'square' ? 'rounded-2xl' : 'rounded-full'} object-cover border border-neutral-200 shadow-2xs bg-neutral-100 group-hover:opacity-85 transition`}
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 rounded-[inherit] transition text-white">
                          <Upload className="w-4 h-4" />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => logoFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
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
                    <CustomToggle
                      checked={appearanceForm.logoTransparent}
                      onChange={val => setAppearanceForm(p => ({ ...p, logoTransparent: val }))}
                      title={appearanceForm.logoTransparent ? "Desativar logo sem fundo" : "Ativar logo sem fundo"}
                      ariaLabel="Logo sem fundo"
                    />
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
                    <input
                      type="file"
                      ref={coverImageFileInputRef}
                      accept="image/*"
                      className="hidden"
                      onChange={handleCoverImageUpload}
                    />
                    <div className="flex items-center gap-3">
                      {appearanceForm.coverUrl && (
                        <div 
                          onClick={() => coverImageFileInputRef.current?.click()}
                          className="w-16 h-12 rounded-xl border border-neutral-300 overflow-hidden relative group cursor-pointer shrink-0 shadow-2xs"
                          title="Clique para escolher imagem do computador"
                        >
                          <img 
                            src={appearanceForm.coverUrl} 
                            alt="Capa" 
                            className="w-full h-full object-cover group-hover:scale-105 transition"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center text-white transition">
                            <Upload className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => coverImageFileInputRef.current?.click()}
                        className="px-4 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <ImageIcon className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Enviar imagem</span>
                      </button>
                    </div>
                  </div>

                  {/* 5. Vídeo de capa (opcional) matching screenshot */}
                  <div>
                    <label className="text-xs font-bold text-neutral-800 block mb-1">
                      Vídeo de capa (opcional) — toca em loop, sem som
                    </label>
                    <p className="text-[11px] text-neutral-500 mb-3 leading-tight font-medium">
                      Se enviar um vídeo, ele substitui a imagem de capa e roda em loop automático (mudo). MP4, WebM ou MOV — até 60s.
                    </p>
                    <input
                      type="file"
                      ref={coverVideoFileInputRef}
                      accept="video/mp4,video/webm,video/ogg,video/quicktime,.mp4,.webm,.mov"
                      className="hidden"
                      onChange={handleCoverVideoUpload}
                    />
                    <div className="flex items-center gap-3">
                      {/* Video Thumbnail with TROCAR label */}
                      <div 
                        onClick={() => coverVideoFileInputRef.current?.click()}
                        className="w-20 h-12 rounded-xl border border-neutral-300 bg-neutral-900 relative overflow-hidden flex items-center justify-center shrink-0 cursor-pointer group shadow-2xs"
                        title="Clique para escolher vídeo do computador"
                      >
                        {appearanceForm.videoUrl ? (
                          <video 
                            src={appearanceForm.videoUrl} 
                            className="w-full h-full object-cover" 
                            muted 
                            loop 
                            autoPlay 
                            playsInline 
                          />
                        ) : (
                          <img 
                            src={appearanceForm.coverUrl} 
                            alt="Thumbnail" 
                            className="w-full h-full object-cover opacity-60" 
                          />
                        )}
                        <span className="absolute text-[8px] font-black uppercase tracking-wider text-white bg-black/70 px-1 py-0.5 rounded group-hover:bg-[#ff007f] transition">
                          TROCAR
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => coverVideoFileInputRef.current?.click()}
                        className="px-3.5 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer shadow-2xs active:scale-95"
                      >
                        <Upload className="w-3.5 h-3.5 text-neutral-500" />
                        <span>Trocar vídeo</span>
                      </button>

                      {appearanceForm.videoUrl && (
                        <button
                          type="button"
                          onClick={async () => {
                            setAppearanceForm(p => ({ ...p, videoUrl: '' }));
                            if (activeBiosite) {
                              updateBiosite(activeBiosite.id, { ...({ videoUrl: '', coverType: 'image' } as any) });
                              await deleteMedia(`cover_video_${activeBiosite.id}`);
                            }
                            showToast('Vídeo removido!');
                          }}
                          className="text-xs font-semibold text-neutral-500 hover:text-red-600 px-2 transition cursor-pointer"
                        >
                          Remover
                        </button>
                      )}
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
                      {/* Cover banner image / video */}
                      <div className="relative w-full h-56 sm:h-64 overflow-hidden bg-neutral-900">
                        {(previewBiosite as any).videoUrl ? (
                          <video 
                            src={(previewBiosite as any).videoUrl} 
                            autoPlay 
                            loop 
                            muted 
                            playsInline 
                            className="w-full h-full object-cover" 
                          />
                        ) : previewBiosite.coverUrl ? (
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

                        {/* Rodapé: Feito por MB Web Digital */}
                        <div className="mt-6 mb-2 flex items-center justify-center text-center text-xs text-neutral-800 select-none gap-1.5">
                          {creatorProfile?.photoUrl ? (
                            <div className="w-4 h-4 rounded-full flex items-center justify-center overflow-hidden shrink-0 bg-transparent">
                              <img src={creatorProfile.photoUrl} alt="Logo" className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className="w-4 h-4 rounded-full bg-black flex items-center justify-center overflow-hidden shrink-0">
                              <span className="text-[#00e5ff] font-extrabold text-[7px] tracking-tighter font-mono">on</span>
                            </div>
                          )}
                          <span>Feito por&nbsp;</span>
                          <a
                            href={creatorProfile?.linkUrl || 'https://mbwebdigital.com.br'}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-500 underline hover:text-gray-700 transition font-semibold"
                          >
                            {creatorProfile?.name || 'MB Web Digital'}
                          </a>
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
                        {buttonsList.map((btn, index) => {
                          const isExpanded = expandedButtonIds.includes(btn.id);
                          const isFirst = index === 0;
                          const isLast = index === buttonsList.length - 1;
                          return (
                            <div 
                              key={btn.id} 
                              className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-2xs transition"
                            >
                              {/* Header */}
                              <div className="p-3.5 flex items-center justify-between gap-2.5 bg-white">
                                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                  {/* Reorder Buttons in Editor List */}
                                  <div className="flex items-center gap-0.5 shrink-0 bg-neutral-100 p-0.5 rounded-lg border border-neutral-200">
                                    <button
                                      type="button"
                                      disabled={isFirst}
                                      onClick={() => moveButton(btn.id, 'up')}
                                      className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                        isFirst ? 'opacity-25 cursor-not-allowed text-neutral-400' : 'text-neutral-700 hover:bg-white hover:shadow-xs cursor-pointer'
                                      }`}
                                      title={isFirst ? undefined : "Subir posição"}
                                    >
                                      <ChevronUp className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </button>
                                    <button
                                      type="button"
                                      disabled={isLast}
                                      onClick={() => moveButton(btn.id, 'down')}
                                      className={`w-6 h-6 rounded flex items-center justify-center transition ${
                                        isLast ? 'opacity-25 cursor-not-allowed text-neutral-400' : 'text-neutral-700 hover:bg-white hover:shadow-xs cursor-pointer'
                                      }`}
                                      title={isLast ? undefined : "Descer posição"}
                                    >
                                      <ChevronDown className="w-3.5 h-3.5 stroke-[2.5]" />
                                    </button>
                                  </div>
                                  
                                  {/* Active toggle */}
                                  <CustomToggle
                                    size="sm"
                                    checked={btn.active}
                                    onChange={val => handleUpdateButton(btn.id, { active: val })}
                                    title={btn.active ? "Desativar botão" : "Ativar botão"}
                                    ariaLabel="Ativar ou desativar botão"
                                  />

                                  <span className="text-xs font-bold text-neutral-800 truncate">
                                    {btn.label} • {btn.type || btn.label}
                                  </span>
                                </div>

                                <div className="flex items-center gap-1.5 shrink-0">
                                  <button
                                    type="button"
                                    onClick={() => handleToggleExpandButton(btn.id)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-neutral-700 transition cursor-pointer"
                                    title={isExpanded ? "Recolher detalhes" : "Editar detalhes"}
                                  >
                                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteButton(btn.id)}
                                    className="p-1 rounded-md text-neutral-400 hover:text-red-500 transition cursor-pointer"
                                    title="Remover botão"
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
                                    <CustomToggle
                                      size="sm"
                                      checked={!!btn.pulseEffect}
                                      onChange={val => handleUpdateButton(btn.id, { pulseEffect: val })}
                                      title={btn.pulseEffect ? "Desativar efeito pulsar" : "Ativar efeito pulsar"}
                                      ariaLabel="Efeito pulsar"
                                    />
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
                      <CustomToggle
                        checked={pixForm.instantPix}
                        onChange={val => {
                          setPixForm(p => ({ ...p, instantPix: val }));
                          setHasUnsavedButtonChanges(true);
                        }}
                        title={pixForm.instantPix ? "Desativar Pix na hora" : "Ativar Pix na hora"}
                        ariaLabel="Receber Pix na hora"
                      />
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
                        <CustomToggle
                          checked={pixForm.hasCardBg}
                          onChange={val => {
                            setPixForm(p => ({ ...p, hasCardBg: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          title={pixForm.hasCardBg ? "Desativar fundo no cartão" : "Ativar fundo no cartão"}
                          ariaLabel="Com fundo no cartão Pix"
                        />
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
                        <CustomToggle
                          checked={wifiForm.hasCardBg}
                          onChange={val => {
                            setWifiForm(p => ({ ...p, hasCardBg: val }));
                            setHasUnsavedButtonChanges(true);
                          }}
                          title={wifiForm.hasCardBg ? "Desativar fundo no cartão" : "Ativar fundo no cartão"}
                          ariaLabel="Com fundo no cartão WiFi"
                        />
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
                          defaultPreviewColor="#ff2a85"
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
              <div className="flex flex-col xl:flex-row items-start gap-8">
                
                {/* Coluna da Esquerda (Conteúdo/Formulários): flex-1 w-full space-y-5 */}
                <div className="flex-1 w-full space-y-5">
                  
                  {/* Card 1 (Carrossel) */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 space-y-4 shadow-2xs">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">
                          Passagem automática
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                          Os itens trocam sozinhos como um carrossel.
                        </p>
                      </div>

                      {/* Toggle Switch */}
                      <CustomToggle
                        checked={carouselAutoplay}
                        onChange={setCarouselAutoplay}
                        title={carouselAutoplay ? "Desativar passagem automática" : "Ativar passagem automática"}
                        ariaLabel="Passagem automática do carrossel"
                      />
                    </div>

                    {/* Slider: Tempo entre itens: 5s */}
                    <div className="space-y-1.5 pt-1">
                      <span className="text-xs font-bold text-neutral-900 block">
                        Tempo entre itens: {carouselInterval}s
                      </span>
                      
                      {/* Barra de tempo customizada (track 8px com borda de 1px sólida na área preenchida) */}
                      <div className="relative py-3 w-full flex items-center select-none">
                        {/* Linha da barra completa (fundo cinza escuro/preto de 8px - aumentado em 2px) */}
                        <div className="w-full h-[8px] bg-[#1a1a1a] rounded-full relative overflow-hidden">
                          {/* Trilha preenchida em rosa vibrante com borda de 1px sólida na cor #1a1a1a */}
                          <div
                            className="h-full bg-[#ff2a85] border border-[#1a1a1a] rounded-full transition-all duration-75 box-border"
                            style={{
                              width: `calc(10px + ${((carouselInterval - 2) / (15 - 2))} * (100% - 20px))`
                            }}
                          />
                        </div>

                        {/* Bolinha (Thumb): círculo rosa vibrante com borda preta ao redor */}
                        <div
                          className="absolute top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-[#ff2a85] border-2 border-[#1a1a1a] shadow-xs pointer-events-none transition-all duration-75"
                          style={{
                            left: `calc(${((carouselInterval - 2) / (15 - 2))} * (100% - 20px))`
                          }}
                        />

                        {/* Input Range invisível para acessibilidade e interação nativa suave */}
                        <input
                          type="range"
                          min={2}
                          max={15}
                          step={1}
                          value={carouselInterval}
                          onChange={e => setCarouselInterval(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                          aria-label="Tempo entre itens do carrossel"
                        />
                      </div>

                      <div className="flex justify-between text-[11px] text-neutral-400 font-medium">
                        <span>2s</span>
                        <span>15s</span>
                      </div>
                    </div>

                    {/* Ação: Botão Salvar configuração do carrossel */}
                    <div className="pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          showToast('Configuração do carrossel salva!', 'success');
                        }}
                        className="px-4 py-2 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-950 font-bold text-xs shadow-2xs transition cursor-pointer"
                      >
                        Salvar configuração do carrossel
                      </button>
                    </div>
                  </div>

                  {/* Seção Seus catálogos */}
                  <div className="space-y-3 pt-1">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <h3 className="text-sm font-bold text-neutral-900">
                          Seus catálogos
                        </h3>
                        <p className="text-xs text-neutral-500 mt-0.5 font-normal">
                          Crie quantos quiser (ex: Fotos, Vídeos, Promoções). Arraste para reordenar.
                        </p>
                      </div>

                      <div className="flex items-center gap-2.5 shrink-0">
                        <button
                          type="button"
                          onClick={handleSaveCatalog}
                          className="px-4 py-2 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-950 font-black text-xs shadow-2xs transition cursor-pointer flex items-center gap-1.5 active:scale-95"
                          title="Salvar alterações do catálogo"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Salvar alterações</span>
                        </button>

                        <button
                          type="button"
                          onClick={handleOpenNewCatalogModal}
                          className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white font-bold text-xs shadow-2xs transition cursor-pointer flex items-center gap-1 active:scale-95"
                        >
                          <span>+ Novo catálogo</span>
                        </button>
                      </div>
                    </div>

                    {/* Estado Vazio (Regra 1: se length === 0) */}
                    {catalogsList.length === 0 ? (
                      <div 
                        onClick={handleOpenNewCatalogModal}
                        className="bg-white rounded-2xl border border-neutral-200 py-10 px-6 text-center shadow-2xs cursor-pointer hover:border-neutral-300 transition"
                      >
                        <p className="text-xs text-neutral-500 font-medium">
                          Nenhum catálogo criado. Clique em <span className="underline font-bold text-neutral-800">"Novo catálogo"</span> para começar.
                        </p>
                      </div>
                    ) : (
                      /* Lista de Cards (Regra 1: se length >= 1) */
                      <div className="space-y-3">
                        {catalogsList.map(cat => (
                          <div 
                            key={cat.id} 
                            className="bg-white rounded-2xl border border-neutral-200 p-4 space-y-3 shadow-2xs"
                          >
                            {/* Cabeçalho do Card (Linha horizontal com flexbox/alinhamento ao centro) */}
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                {/* Ícone de arrastar (drag - 6 pontinhos) na esquerda */}
                                <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0" />
                                
                                {/* Ícone de seta para cima/baixo (chevron) para expandir/recolher */}
                                <button
                                  type="button"
                                  onClick={() => handleToggleExpandCatalog(cat.id)}
                                  className="p-1 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                                  title={cat.isExpanded ? "Recolher catálogo" : "Expandir catálogo"}
                                >
                                  {cat.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                </button>

                                {/* Um botão Toggle Switch (ativo/rosa por padrão) */}
                                <CustomToggle
                                  checked={cat.active}
                                  onChange={() => handleToggleActiveCatalog(cat.id)}
                                  title={cat.active ? "Desativar catálogo" : "Ativar catálogo"}
                                  ariaLabel="Ativar ou desativar catálogo"
                                />

                                {/* Um campo de input de texto estilizado sem bordas pesadas, com o valor padrão "Nossos serviços" */}
                                <input
                                  type="text"
                                  value={cat.title}
                                  onChange={e => handleUpdateCatalogTitle(cat.id, e.target.value)}
                                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-800 rounded-xl border border-neutral-300 focus:outline-none focus:ring-1 focus:ring-pink-500 bg-white w-full max-w-sm"
                                  placeholder="Nossos serviços"
                                />
                              </div>

                              <div className="flex items-center gap-3 shrink-0">
                                {/* Um texto pequeno em cinza alinhado à direita: "0 item(ns)" */}
                                <span className="text-xs text-neutral-400 font-medium whitespace-nowrap">
                                  {(cat.items ? cat.items.length : (cat.itemCount || 0))} item(ns)
                                </span>

                                {/* Ícone de lixeira (excluir) na extrema direita */}
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCatalog(cat.id)}
                                  className="p-1 text-neutral-400 hover:text-red-500 transition cursor-pointer"
                                  title="Excluir catálogo"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </div>

                            {/* Corpo do Card (Abaixo do cabeçalho) */}
                            {cat.isExpanded && (
                              (!cat.items || cat.items.length === 0) ? (
                                <div className="rounded-xl border border-neutral-200 bg-neutral-50/50 p-6 text-center space-y-4">
                                  {/* Área com borda tracejada ou cinza clara com fundo levemente acinzentado e o texto centralizado */}
                                  <p className="text-xs text-neutral-500 font-normal">
                                    Nenhum item ainda. Use os botões abaixo pra adicionar imagens ou vídeos.
                                  </p>

                                  {/* Inputs invisíveis de arquivo */}
                                  <input
                                    type="file"
                                    id={`upload-image-empty-${cat.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'image', file);
                                      e.target.value = '';
                                    }}
                                  />
                                  <input
                                    type="file"
                                    id={`upload-video-empty-${cat.id}`}
                                    accept="video/*,image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'video', file);
                                      e.target.value = '';
                                    }}
                                  />
                                  <input
                                    type="file"
                                    id={`upload-tour-empty-${cat.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'tour', file);
                                      e.target.value = '';
                                    }}
                                  />

                                  {/* Rodapé do Card (Botões de ação): Gatilhos para o file picker */}
                                  <div className="flex flex-row items-center justify-center gap-3">
                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-image-empty-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <ImageIcon className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Imagem</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-video-empty-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <Video className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Vídeo</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-tour-empty-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <Globe className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Tour 360º</span>
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-4 pt-1">
                                  {/* Layout do Contêiner de Itens (Regra dos 50% - Grid com 2 colunas) */}
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                                    {cat.items.map(item => (
                                      <div 
                                        key={item.id} 
                                        className="bg-white rounded-2xl border border-neutral-200 p-3 space-y-3 shadow-2xs"
                                      >
                                        {/* Topo (Preview da Imagem): miniatura com 'CLIQUE PARA TROCAR' centralizado com sombra */}
                                        <div 
                                          onClick={() => document.getElementById(`replace-item-${item.id}`)?.click()}
                                          className="w-full aspect-[16/10] sm:aspect-[16/9] rounded-xl overflow-hidden relative cursor-pointer group bg-neutral-100 border border-neutral-200/80"
                                          title="Clique para trocar imagem"
                                        >
                                          {isItemVideo(item) ? (
                                            <video
                                              key={item.id + '-' + item.imageUrl}
                                              src={item.imageUrl}
                                              autoPlay
                                              muted
                                              loop
                                              playsInline
                                              className={`w-full h-full ${item.fit === 'contain' ? 'object-contain bg-neutral-900' : 'object-cover'}`}
                                            />
                                          ) : (
                                            <img
                                              key={item.id + '-' + item.imageUrl}
                                              src={item.imageUrl}
                                              alt="Preview"
                                              className={`w-full h-full ${item.fit === 'contain' ? 'object-contain bg-neutral-900' : 'object-cover'}`}
                                            />
                                          )}
                                          <div className="absolute inset-0 bg-black/25 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <span className="text-white text-xs sm:text-sm font-extrabold tracking-wider uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)] select-none">
                                              CLIQUE PARA TROCAR
                                            </span>
                                          </div>
                                        </div>

                                        {/* Input invisível para substituir a imagem do item */}
                                        <input
                                          type="file"
                                          id={`replace-item-${item.id}`}
                                          accept="image/*,video/*"
                                          className="hidden"
                                          onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file) handleReplaceItemFile(cat.id, item.id, file);
                                            e.target.value = '';
                                          }}
                                        />

                                        {/* Cabeçalho do Card: ícone de arrastar, Toggle padronizado, ícone, texto tipo, lixeira */}
                                        <div className="flex items-center justify-between gap-2.5 pt-0.5">
                                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                                            <GripVertical className="w-4 h-4 text-neutral-400 cursor-grab shrink-0" />
                                            
                                            <CustomToggle
                                              checked={item.active}
                                              onChange={(val) => handleUpdateCatalogItem(cat.id, item.id, { active: val })}
                                              title={item.active ? "Desativar item" : "Ativar item"}
                                              ariaLabel="Ativar ou desativar item"
                                            />

                                            <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-800">
                                              {item.type === 'video' ? (
                                                <Video className="w-4 h-4 text-neutral-700 shrink-0" />
                                              ) : item.type === 'tour' ? (
                                                <Globe className="w-4 h-4 text-neutral-700 shrink-0" />
                                              ) : (
                                                <ImageIcon className="w-4 h-4 text-neutral-700 shrink-0" />
                                              )}
                                              <span>{item.type === 'video' ? 'Vídeo' : item.type === 'tour' ? 'Tour 360º' : 'Imagem'}</span>
                                            </div>
                                          </div>

                                          <button
                                            type="button"
                                            onClick={() => handleDeleteCatalogItem(cat.id, item.id)}
                                            className="p-1 text-neutral-400 hover:text-red-500 transition cursor-pointer"
                                            title="Excluir item"
                                          >
                                            <Trash2 className="w-4 h-4" />
                                          </button>
                                        </div>

                                        {/* Linha de Selects (Dropdowns): 50% cada com Proporção e Enquadramento */}
                                        <div className="grid grid-cols-2 gap-2.5">
                                          <div>
                                            <label className="text-[11px] text-neutral-600 font-medium block mb-1">
                                              Proporção
                                            </label>
                                            <select
                                              value={item.aspectRatio || '16:9'}
                                              onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { aspectRatio: e.target.value as any })}
                                              className="w-full px-3 py-1.5 text-xs text-neutral-800 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 cursor-pointer"
                                            >
                                              <option value="16:9">Horizontal 16:9</option>
                                              <option value="1:1">Quadrada 1:1</option>
                                              <option value="4:5">Vertical 4:5</option>
                                              <option value="9:16">Stories 9:16</option>
                                            </select>
                                          </div>

                                          <div>
                                            <label className="text-[11px] text-neutral-600 font-medium block mb-1">
                                              Enquadramento
                                            </label>
                                            <select
                                              value={item.fit || 'cover'}
                                              onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { fit: e.target.value as any })}
                                              className="w-full px-3 py-1.5 text-xs text-neutral-800 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 cursor-pointer"
                                            >
                                              <option value="cover">Preencher (corta)</option>
                                              <option value="contain">Ajustar (inteira)</option>
                                            </select>
                                          </div>
                                        </div>

                                        {/* Campos de Texto (Inputs): Título, Texto, Link */}
                                        <div className="space-y-2 pt-0.5">
                                          <input
                                            type="text"
                                            placeholder="Título"
                                            value={item.title || ''}
                                            onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { title: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                                          />

                                          <textarea
                                            placeholder="Texto"
                                            rows={2}
                                            value={item.description || ''}
                                            onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { description: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 resize-none"
                                          />

                                          <input
                                            type="text"
                                            placeholder="Link (opcional) — vira botão abaixo do banner/v..."
                                            value={item.url || ''}
                                            onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { url: e.target.value })}
                                            className="w-full px-3.5 py-2 text-xs text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                                          />

                                          {/* Nova linha com dois campos dividindo 50% do espaço cada: Texto do botão e Alinhamento */}
                                          <div className="grid grid-cols-2 gap-2.5 pt-0.5">
                                            <input
                                              type="text"
                                              placeholder="Texto do botão (ex: Acessar)"
                                              value={item.buttonText || ''}
                                              onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { buttonText: e.target.value })}
                                              className="w-full px-3.5 py-1.5 text-xs text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900"
                                            />
                                            <select
                                              value={item.buttonAlign || 'left'}
                                              onChange={(e) => handleUpdateCatalogItem(cat.id, item.id, { buttonAlign: e.target.value as any })}
                                              className="w-full px-3 py-1.5 text-xs font-medium text-neutral-800 bg-white border border-neutral-300 rounded-xl focus:outline-none focus:border-neutral-900 cursor-pointer"
                                            >
                                              <option value="left">Esquerda</option>
                                              <option value="center">Centro</option>
                                              <option value="right">Direita</option>
                                            </select>
                                          </div>
                                        </div>
                                      </div>
                                    ))}
                                  </div>

                                  {/* Inputs invisíveis de arquivo para adicionar novos itens */}
                                  <input
                                    type="file"
                                    id={`upload-image-${cat.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'image', file);
                                      e.target.value = '';
                                    }}
                                  />
                                  <input
                                    type="file"
                                    id={`upload-video-${cat.id}`}
                                    accept="video/*,image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'video', file);
                                      e.target.value = '';
                                    }}
                                  />
                                  <input
                                    type="file"
                                    id={`upload-tour-${cat.id}`}
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => {
                                      const file = e.target.files?.[0];
                                      if (file) handleFileUpload(cat.id, 'tour', file);
                                      e.target.value = '';
                                    }}
                                  />

                                  {/* Botões de ação abaixo dos itens: Gatilhos para o file picker */}
                                  <div className="flex flex-row items-center justify-center gap-3 pt-2">
                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-image-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <ImageIcon className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Imagem</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-video-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <Video className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Vídeo</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => document.getElementById(`upload-tour-${cat.id}`)?.click()}
                                      className="flex-1 py-2 px-3 rounded-xl bg-white border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50 text-neutral-800 text-xs font-semibold flex items-center justify-center gap-2 shadow-2xs transition cursor-pointer"
                                    >
                                      <Globe className="w-4 h-4 text-neutral-600 shrink-0" />
                                      <span>Tour 360º</span>
                                    </button>
                                  </div>
                                </div>
                              )
                            )}
                          </div>
                        ))}
                      </div>
                    )}
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

          {/* TAB: ENDEREÇO */}
          {selectedTab === 'endereco' && previewBiosite && (
            <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col xl:flex-row items-start gap-8">
                
                {/* Coluna da Esquerda (Conteúdo/Formulários): flex-1 w-full space-y-5 */}
                <div className="flex-1 w-full space-y-5">

                  {/* Card Principal: Como chegar */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 space-y-5 shadow-2xs">
                    
                    {/* Cabeçalho */}
                    <div className="flex items-start gap-3.5">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                        <MapPin className="w-5 h-5 text-neutral-700" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-neutral-900">
                          Como chegar
                        </h3>
                        <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
                          Digite o endereço da sua empresa. No mini-site aparece um botão que abre o Google Maps já traçando a rota até você.
                        </p>
                      </div>
                    </div>

                    {/* Campo de Endereço */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Endereço completo
                      </label>
                      <textarea
                        rows={3}
                        value={addressForm.address}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, address: e.target.value }))}
                        placeholder="Ex: Av. Paulista, 1500 - Bela Vista, São Paulo - SP, 01310-200"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition resize-none leading-relaxed"
                      />
                      <p className="text-xs text-neutral-400">
                        Dica: quanto mais completo (rua, número, cidade, estado), mais preciso o Google Maps abre.
                      </p>
                    </div>

                    {/* Campo do Botão */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Texto do botão
                      </label>
                      <input
                        type="text"
                        value={addressForm.buttonText}
                        onChange={(e) => setAddressForm(prev => ({ ...prev, buttonText: e.target.value }))}
                        placeholder="Como chegar"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                    </div>

                    {/* Seletores de Cor (Grid 2 colunas) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                      <AddressColorPicker
                        label="Cor de fundo do bloco"
                        value={addressForm.cardBgColor}
                        onChange={(val) => setAddressForm(prev => ({ ...prev, cardBgColor: val }))}
                      />
                      <AddressColorPicker
                        label="Cor do texto"
                        value={addressForm.cardTextColor}
                        onChange={(val) => setAddressForm(prev => ({ ...prev, cardTextColor: val }))}
                      />
                      <AddressColorPicker
                        label="Cor do botão"
                        value={addressForm.buttonBgColor}
                        onChange={(val) => setAddressForm(prev => ({ ...prev, buttonBgColor: val }))}
                      />
                      <AddressColorPicker
                        label="Cor do texto do botão"
                        value={addressForm.buttonTextColor}
                        onChange={(val) => setAddressForm(prev => ({ ...prev, buttonTextColor: val }))}
                      />
                    </div>

                    {/* Botões de Ação (Linha) */}
                    <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-neutral-100">
                      <button
                        type="button"
                        onClick={handleSaveAddress}
                        className="px-5 py-2.5 rounded-xl text-xs font-bold bg-[#a3e635] hover:bg-[#92d324] text-neutral-950 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        Salvar endereço
                      </button>

                      <button
                        type="button"
                        onClick={handleTestMaps}
                        className="px-4 py-2.5 rounded-xl text-xs font-semibold bg-white hover:bg-neutral-50 text-neutral-700 border border-neutral-300 transition shadow-2xs flex items-center gap-1.5 cursor-pointer active:scale-[0.98]"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                        Testar no Google Maps
                      </button>

                      {addressForm.address && (
                        <button
                          type="button"
                          onClick={handleRemoveAddress}
                          className="ml-auto text-red-600 hover:text-red-700 flex items-center gap-1.5 text-xs font-semibold transition cursor-pointer hover:underline py-1"
                        >
                          <Trash2 className="w-3.5 h-3.5 text-red-600" />
                          Remover endereço
                        </button>
                      )}
                    </div>

                    {/* Rodapé de Dica */}
                    <div className="bg-amber-50/70 border border-amber-200/80 rounded-2xl p-4 flex items-start gap-3 mt-2">
                      <div className="w-6 h-6 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center shrink-0 mt-0.5">
                        <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                      </div>
                      <div className="space-y-0.5">
                        <h4 className="text-xs font-bold text-amber-950">
                          Como funciona:
                        </h4>
                        <p className="text-xs text-amber-900/80 leading-relaxed font-normal">
                          Ao clicar no botão no seu mini-site, o visitante será direcionado diretamente para o aplicativo ou site do Google Maps com a rota já calculada a partir da localização atual dele.
                        </p>
                      </div>
                    </div>

                  </div>

                  {/* Card / Bloco de Salvar Alterações do Catálogo */}
                  <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <h4 className="text-xs font-bold text-neutral-900">Salvar alterações do Catálogo</h4>
                      <p className="text-[11px] text-neutral-500 mt-0.5 font-normal">
                        Grave todas as alterações feitas nos catálogos, mídias e carrossel para atualizar seu mini-site.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveCatalog}
                      className="px-6 py-2.5 rounded-xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-950 font-black text-xs shadow-xs transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shrink-0"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar alterações</span>
                    </button>
                  </div>

                </div>

                {/* Coluna da Direita (Preview ao Vivo - Smartphone / Desktop) */}
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

          {/* TAB: SERVIÇOS (SEM MOCKUP DE PREVIEW, LARGURA TOTAL) */}
          {selectedTab === 'servicos' && (
            <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
                
                {/* Cabeçalho */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Clock className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Serviços
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
                      Cadastre e gerencie os serviços exibidos no seu mini-site. Defina o nome, tempo estimado e o valor de cada procedimento.
                    </p>
                  </div>
                </div>

                {/* Formulário de Adicionar Serviço (Inputs em Linha + Botão Verde +) */}
                <form onSubmit={handleAddService} className="pt-2">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                    
                    {/* Nome do serviço */}
                    <div className="flex-1 space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Nome do serviço
                      </label>
                      <input
                        type="text"
                        value={newServiceName}
                        onChange={(e) => setNewServiceName(e.target.value)}
                        placeholder="Ex: Corte Masculino, Design de Sobrancelha..."
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                    </div>

                    {/* Duração (minutos) */}
                    <div className="w-full sm:w-40 space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Duração (minutos)
                      </label>
                      <input
                        type="number"
                        min="5"
                        step="5"
                        value={newServiceDuration}
                        onChange={(e) => setNewServiceDuration(e.target.value)}
                        placeholder="Ex: 30"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                    </div>

                    {/* Preço (R$) */}
                    <div className="w-full sm:w-40 space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Preço (R$)
                      </label>
                      <input
                        type="text"
                        value={newServicePrice}
                        onChange={(e) => setNewServicePrice(e.target.value)}
                        placeholder="Ex: 50,00"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                    </div>

                    {/* Botão Verde com Ícone + */}
                    <div className="sm:self-end">
                      <button
                        type="submit"
                        className="w-full sm:w-auto h-[42px] px-4 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white flex items-center justify-center gap-1.5 font-bold transition shadow-xs cursor-pointer active:scale-95"
                        title="Adicionar Serviço"
                      >
                        <Plus className="w-5 h-5 stroke-[2.5]" />
                        <span className="sm:hidden text-xs">Adicionar Serviço</span>
                      </button>
                    </div>

                  </div>
                </form>

                {/* Lista de Serviços ou Empty State */}
                <div className="pt-4 border-t border-neutral-100">
                  {siteServices.length === 0 ? (
                    /* Estado Vazio (Print 1) */
                    <div className="py-12 px-4 text-center rounded-2xl border-2 border-dashed border-neutral-200/80 bg-neutral-50/50 flex flex-col items-center justify-center">
                      <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-400 mb-3">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-neutral-800 mb-1">
                        Nenhum serviço cadastrado ainda
                      </h4>
                      <p className="text-xs text-neutral-500 max-w-md">
                        Preencha os campos acima com o nome, duração e preço do procedimento e clique no botão verde com o sinal de mais (+) para cadastrar seu primeiro serviço.
                      </p>
                    </div>
                  ) : (
                    /* Lista com Serviços (Print 2) */
                    <div className="space-y-3">
                      <div className="flex items-center justify-between pb-1">
                        <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                          Serviços cadastrados ({siteServices.length})
                        </span>
                      </div>

                      <div className="space-y-2.5">
                        {siteServices.map(svc => {
                          const isEditing = editingServiceId === svc.id;

                          if (isEditing) {
                            return (
                              <div 
                                key={svc.id}
                                className="p-3.5 sm:p-4 rounded-xl border-2 border-[#10b981] bg-emerald-50/20 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 transition"
                              >
                                <input
                                  type="text"
                                  value={editServiceName}
                                  onChange={(e) => setEditServiceName(e.target.value)}
                                  placeholder="Nome do serviço"
                                  className="flex-1 px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-800 font-semibold focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                                />
                                <div className="w-full sm:w-32">
                                  <input
                                    type="number"
                                    value={editServiceDuration}
                                    onChange={(e) => setEditServiceDuration(e.target.value)}
                                    placeholder="Duração (min)"
                                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                                  />
                                </div>
                                <div className="w-full sm:w-32">
                                  <input
                                    type="text"
                                    value={editServicePrice}
                                    onChange={(e) => setEditServicePrice(e.target.value)}
                                    placeholder="Preço (R$)"
                                    className="w-full px-3 py-1.5 rounded-lg border border-neutral-200 text-xs bg-white text-neutral-800 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20"
                                  />
                                </div>
                                <div className="flex items-center gap-1.5 justify-end">
                                  <button
                                    onClick={() => handleSaveEditService(svc.id)}
                                    className="px-3 py-1.5 rounded-lg bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1 transition cursor-pointer"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Salvar
                                  </button>
                                  <button
                                    onClick={() => setEditingServiceId(null)}
                                    className="p-1.5 rounded-lg bg-neutral-200 hover:bg-neutral-300 text-neutral-700 text-xs transition cursor-pointer"
                                    title="Cancelar"
                                  >
                                    <X className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          }

                          return (
                            <div
                              key={svc.id}
                              className="p-4 rounded-xl border border-neutral-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-neutral-300 hover:shadow-xs transition"
                            >
                              <div className="space-y-1">
                                <div className="flex items-center gap-2">
                                  <h4 className="text-sm font-bold text-neutral-900">
                                    {svc.name}
                                  </h4>
                                  {!svc.active && (
                                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-500">
                                      Inativo
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2.5 text-xs text-neutral-500">
                                  <span className="flex items-center gap-1 font-medium">
                                    <Clock className="w-3.5 h-3.5 text-neutral-400" />
                                    {svc.durationMinutes} min
                                  </span>
                                  <span className="text-neutral-300">•</span>
                                  <span className="font-bold text-neutral-800">
                                    R$ {Number(svc.price).toFixed(2).replace('.', ',')}
                                  </span>
                                </div>
                              </div>

                              <div className="flex items-center gap-2.5 self-end sm:self-center">
                                <CustomToggle
                                  checked={svc.active}
                                  onChange={(checked) => {
                                    updateService(svc.id, { active: checked });
                                    setFloatingToast(checked ? 'Serviço ativado!' : 'Serviço desativado!');
                                    setTimeout(() => setFloatingToast(null), 2500);
                                  }}
                                  title={svc.active ? "Desativar serviço" : "Ativar serviço"}
                                  ariaLabel={`Ativar ou desativar ${svc.name}`}
                                />
                                <button
                                  onClick={() => handleStartEditService(svc)}
                                  className="p-2 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-neutral-600 hover:text-neutral-900 transition cursor-pointer"
                                  title="Editar serviço"
                                >
                                  <Edit3 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => handleDeleteService(svc.id)}
                                  className="p-2 rounded-lg bg-neutral-100 hover:bg-red-50 text-neutral-400 hover:text-red-600 transition cursor-pointer"
                                  title="Excluir serviço"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>

              </div>
            </div>
          )}

          {/* TAB: DISPONIBILIDADE (EXACT REPLICA OF THE 3 PRINTS) */}
          {selectedTab === 'disponibilidade' && (
            <div className="w-full max-w-7xl mx-auto space-y-4 animate-in fade-in duration-200">
              
              {/* Aviso Superior */}
              <div className="bg-neutral-50/90 border border-neutral-200/80 rounded-2xl px-5 py-3.5 flex items-center gap-2.5 text-xs text-neutral-700 shadow-2xs">
                <span className="text-base select-none shrink-0">💡</span>
                <span>
                  <strong className="font-bold text-neutral-800">Não precisa republicar o site.</strong> Todo horário que você abre ou fecha aqui já vale no ato pro cliente. Cada mudança salva sozinha e mostra um "✓" no canto.
                </span>
              </div>

              {/* Grid 2 Colunas */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
                
                {/* Coluna Esquerda: Calendário (Ajustes por data) */}
                <div className="lg:col-span-5 bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                  <h3 className="text-sm font-bold text-neutral-900">
                    Ajustes por data
                  </h3>

                  {/* Navegador de Mês */}
                  <div className="flex items-center justify-between px-2 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 0) {
                          setCalMonth(11);
                          setCalYear(prev => prev - 1);
                        } else {
                          setCalMonth(prev => prev - 1);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <span className="text-xs font-bold text-neutral-800 capitalize select-none">
                      {['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'][calMonth]} {calYear}
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        if (calMonth === 11) {
                          setCalMonth(0);
                          setCalYear(prev => prev + 1);
                        } else {
                          setCalMonth(prev => prev + 1);
                        }
                      }}
                      className="p-1 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-800 transition cursor-pointer"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Dias da Semana */}
                  <div className="grid grid-cols-7 text-center text-xs text-neutral-400 font-medium py-1">
                    {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map(d => (
                      <span key={d} className="select-none">{d}</span>
                    ))}
                  </div>

                  {/* Grid de Dias */}
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {getCalendarDays().map((item, idx) => {
                      if (!item.isCurrentMonth) {
                        return (
                          <div
                            key={idx}
                            className="h-9 flex items-center justify-center text-xs text-neutral-300 font-normal select-none"
                          >
                            {item.day}
                          </div>
                        );
                      }

                      const isSelected = item.day === selectedDay;
                      const isBlocked = !!blockedDays[item.dateKey];

                      let dayClass = "text-neutral-800 hover:bg-neutral-100 font-medium cursor-pointer";
                      if (isSelected) {
                        dayClass = "bg-[#ff2a85] text-white font-bold shadow-xs cursor-pointer";
                      } else if (isBlocked) {
                        dayClass = "bg-[#ffe4e6]/60 text-neutral-700 cursor-pointer";
                      }

                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => setSelectedDay(item.day)}
                          className={`h-9 rounded-lg flex items-center justify-center text-xs transition ${dayClass}`}
                        >
                          <span className={isBlocked ? "line-through" : ""}>
                            {item.day}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Rodapé Informativo */}
                  <p className="text-[11px] text-neutral-500 pt-1 select-none">
                    Dias <span className="line-through font-semibold text-neutral-700">riscados</span> estão bloqueados.
                  </p>
                </div>

                {/* Coluna Direita: Horários do Dia */}
                <div className="lg:col-span-7 bg-white rounded-2xl border border-neutral-200 p-5 sm:p-6 space-y-4 shadow-2xs">
                  <div>
                    <h3 className="text-sm font-bold text-neutral-900">
                      {getSelectedDateTitle()}
                    </h3>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Ligue ou desligue cada horário deste dia. Verde = aberto, cinza = fechado.
                    </p>
                  </div>

                  {/* Botão Bloquear / Desbloquear Dia Inteiro (Exato aos Prints 1, 2 e 3) */}
                  {!isCurrentDayBlocked ? (
                    /* Prints 1 e 2: Dia não bloqueado */
                    <button
                      type="button"
                      onClick={handleToggleBlockCurrentDay}
                      className="w-full py-2.5 px-4 rounded-xl border border-neutral-200 hover:bg-neutral-50 flex items-center justify-center gap-2 text-xs font-semibold text-neutral-800 transition cursor-pointer active:scale-[0.99]"
                    >
                      <span className="text-sm select-none">🚫</span>
                      <span>Bloquear o dia inteiro</span>
                    </button>
                  ) : (
                    /* Print 3: Dia bloqueado */
                    <div className="w-full p-2.5 sm:p-3 rounded-xl border border-rose-200 bg-white flex items-center justify-between gap-3 shadow-2xs animate-in fade-in">
                      <div className="flex items-center gap-2 text-xs font-semibold text-neutral-800">
                        <span className="text-sm select-none">🚫</span>
                        <span>Dia inteiro bloqueado</span>
                      </div>
                      <button
                        type="button"
                        onClick={handleToggleBlockCurrentDay}
                        className="px-4 py-2 rounded-xl bg-[#e11d48] hover:bg-[#be123c] text-white text-xs font-bold transition shadow-xs cursor-pointer active:scale-95"
                      >
                        Desbloquear dia
                      </button>
                    </div>
                  )}

                  {/* Grid de Horários em 2 Colunas */}
                  <div className="grid grid-cols-2 gap-2.5 pt-1">
                    {ALL_TIME_SLOTS.map(slot => {
                      const currentSlots = isCurrentDayBlocked
                        ? []
                        : (dayOpenSlots[currentDateKey] ?? ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00']);
                      const isOpen = currentSlots.includes(slot);

                      if (isOpen && !isCurrentDayBlocked) {
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => handleToggleSlot(slot)}
                            className="px-3.5 py-2.5 rounded-xl border border-[#fbcfe8] bg-[#fdf2f8] flex items-center justify-between text-xs font-bold text-neutral-800 hover:border-pink-300 transition cursor-pointer"
                          >
                            <span>{slot}</span>
                            <span className="w-3 h-3 rounded-full bg-[#ec4899] shrink-0" />
                          </button>
                        );
                      }

                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleToggleSlot(slot)}
                          className="px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/70 flex items-center justify-between text-xs text-neutral-400 hover:bg-neutral-100 transition cursor-pointer"
                        >
                          <span className="line-through">{slot}</span>
                          <span className="w-3 h-3 rounded-full bg-neutral-300 shrink-0" />
                        </button>
                      );
                    })}
                  </div>

                </div>

              </div>
            </div>
          )}

          {/* TAB: PIXELS & RASTREIO */}
          {selectedTab === 'pixels' && (
            <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
                
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0 mt-0.5">
                    <Target className="w-5 h-5 text-neutral-700" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Pixels & Rastreio
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
                      Conecte ferramentas de análise e rastreamento para acompanhar as conversões dos seus anúncios no Meta, Google e TikTok.
                    </p>
                  </div>
                </div>

                <form onSubmit={handleSavePixels} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* Meta / Facebook Pixel */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Meta (Facebook) Pixel ID
                      </label>
                      <input
                        type="text"
                        value={pixelsForm.metaPixel}
                        onChange={(e) => setPixelsForm({ ...pixelsForm, metaPixel: e.target.value })}
                        placeholder="Ex: 1234567890123456"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                      <p className="text-[11px] text-neutral-400">Rastreia visualizações de página, cliques nos botões e agendamentos.</p>
                    </div>

                    {/* Google Analytics 4 */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Google Analytics 4 (GA4 ID)
                      </label>
                      <input
                        type="text"
                        value={pixelsForm.ga4}
                        onChange={(e) => setPixelsForm({ ...pixelsForm, ga4: e.target.value })}
                        placeholder="Ex: G-XXXXXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                      <p className="text-[11px] text-neutral-400">ID de métrica do Google Analytics (começa com 'G-').</p>
                    </div>

                    {/* Google Tag Manager */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        Google Tag Manager (GTM ID)
                      </label>
                      <input
                        type="text"
                        value={pixelsForm.gtm}
                        onChange={(e) => setPixelsForm({ ...pixelsForm, gtm: e.target.value })}
                        placeholder="Ex: GTM-XXXXXXX"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                      <p className="text-[11px] text-neutral-400">ID do contêiner do GTM para disparo de scripts personalizados.</p>
                    </div>

                    {/* TikTok Pixel */}
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-neutral-800 block">
                        TikTok Pixel ID
                      </label>
                      <input
                        type="text"
                        value={pixelsForm.tiktok}
                        onChange={(e) => setPixelsForm({ ...pixelsForm, tiktok: e.target.value })}
                        placeholder="Ex: C1234567890ABCDEF"
                        className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm text-neutral-800 placeholder-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10b981]/20 focus:border-[#10b981] transition"
                      />
                      <p className="text-[11px] text-neutral-400">Identificador do pixel do TikTok Ads Manager.</p>
                    </div>

                  </div>

                  <div className="pt-3 flex justify-end">
                    <button
                      type="submit"
                      className="px-5 py-2.5 rounded-xl bg-[#10b981] hover:bg-[#059669] text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>Salvar Configurações de Rastreio</span>
                    </button>
                  </div>
                </form>

              </div>
            </div>
          )}

          {/* TAB: ACESSO DO CLIENTE */}
          {selectedTab === 'acesso_cliente' && (
            <AcessoClienteTab />
          )}

          {/* TAB: SEJA PARCEIRO */}
          {selectedTab === 'seja_parceiro' && (
            <div className="w-full max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
              <div className="bg-white rounded-2xl border border-neutral-200 p-6 sm:p-7 shadow-2xs space-y-6">
                
                {/* Header */}
                <div className="flex items-start gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 mt-0.5">
                    <Gift className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-neutral-900">
                      Programa Seja Parceiro MB Web Digital
                    </h2>
                    <p className="text-xs text-neutral-500 mt-1 font-normal leading-relaxed">
                      Indique outros profissionais e estabelecimentos e ganhe comissões mensais recorrentes para cada cliente ativo.
                    </p>
                  </div>
                </div>

                {/* Destaque das Vantagens */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                    <span className="text-2xl font-black text-rose-600">30%</span>
                    <h4 className="text-xs font-bold text-neutral-900">Comissão Recorrente</h4>
                    <p className="text-[11px] text-neutral-500">Receba todos os meses enquanto sua indicação mantiver o plano ativo.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                    <span className="text-2xl font-black text-emerald-600">Pix</span>
                    <h4 className="text-xs font-bold text-neutral-900">Pagamento Automático</h4>
                    <p className="text-[11px] text-neutral-500">Transferência direta na sua chave Pix cadastrada todo dia 10.</p>
                  </div>

                  <div className="p-4 rounded-xl border border-neutral-200 bg-neutral-50/50 space-y-1">
                    <span className="text-2xl font-black text-neutral-900">100%</span>
                    <h4 className="text-xs font-bold text-neutral-900">Apoio & Material</h4>
                    <p className="text-[11px] text-neutral-500">Artes prontas, modelos demonstrativos e suporte dedicado da equipe.</p>
                  </div>
                </div>

                {/* Link de Indicação */}
                <div className="p-5 rounded-2xl bg-neutral-900 text-white space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <h4 className="text-sm font-bold text-white">Seu link exclusivo de indicação</h4>
                      <p className="text-xs text-neutral-400 mt-0.5">Compartilhe com amigos, clientes e nas redes sociais:</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://bio.mbwebdigital.com.br/r/${activeBiosite?.slug || 'parceiro'}`);
                        setFloatingToast('Link de parceiro copiado!');
                        setTimeout(() => setFloatingToast(null), 2500);
                      }}
                      className="px-4 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-900 text-xs font-bold flex items-center gap-1.5 transition cursor-pointer self-start sm:self-center"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copiar link de parceiro</span>
                    </button>
                  </div>

                  <div className="p-3 rounded-xl bg-neutral-800 text-xs font-mono text-emerald-400 select-all break-all">
                    https://bio.mbwebdigital.com.br/r/{activeBiosite?.slug || 'parceiro'}
                  </div>
                </div>

                {/* CTA WhatsApp */}
                <div className="pt-2 flex justify-start">
                  <button
                    type="button"
                    onClick={() => window.open('https://api.whatsapp.com/send?phone=5511999999999&text=Ol%C3%A1%2C%20gostaria%20de%20saber%20mais%20sobre%20o%20Programa%20de%20Parceiros%20MB%20Web%20Digital', '_blank')}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-2 transition shadow-xs cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Falar com o time de parcerias</span>
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* TAB: PROFISSIONAIS matching screenshots */}
          {selectedTab === 'profissionais' && (
            <ProfissionaisTab />
          )}

          {/* TAB: MEUS LINKS (Admin) / MEU LINK (Cliente) */}
          {selectedTab === 'links' && (
            <div className="max-w-6xl mx-auto animate-in fade-in duration-200">
              <LinksManagementPage />
            </div>
          )}

      {/* TAB: URL E ACESSO (Antigo Títulos) */}
          {selectedTab === 'titulos' && activeBiosite && (
            <div className="max-w-5xl mx-auto flex justify-center animate-in fade-in duration-200 pt-4">
              <SlugSettingsField 
                currentSiteId={activeBiosite.id}
                initialSlug={activeBiosite.slug}
                onSave={async (newSlug) => {
                  try {
                    showToast('Atualizando URL do seu site...');
                    // Essa linha salva direto no banco de dados Neon
                    await updateBiosite(activeBiosite.id, { slug: newSlug });
                    showToast('URL alterada com sucesso! Seu site já está no novo endereço.', 'success');
                  } catch (err) {
                    showToast('Erro ao atualizar URL no banco de dados.', 'error');
                  }
                }}
              />
            </div>
          )}

          {/* EDITING TABS: Re-uses BioSiteEditor smoothly */}
          {(['leads', 'layout', 'pix', 'cadastros'].includes(selectedTab)) && (
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
                  `https://bio.mbwebdigital.com.br/${activeBiosite.slug}`
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

      {/* Modal Novo Catálogo - Conforme design do print */}
      {isNewCatalogModalOpen && (
        <div 
          tabIndex={-1}
          onKeyDown={e => {
            if (e.key === 'Escape') setIsNewCatalogModalOpen(false);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setIsNewCatalogModalOpen(false)}
        >
          <div 
            className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl border border-neutral-100 relative animate-in zoom-in-95 duration-150"
            onClick={e => e.stopPropagation()}
          >
            {/* Botão de Fechar X no topo direito */}
            <button
              type="button"
              onClick={() => setIsNewCatalogModalOpen(false)}
              className="absolute top-5 right-5 text-neutral-700 hover:text-neutral-950 p-1.5 rounded-full hover:bg-neutral-100 transition cursor-pointer"
              title="Fechar"
            >
              <X className="w-4 h-4 stroke-[2.5]" />
            </button>

            {/* Título */}
            <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
              Novo catálogo
            </h3>

            {/* Subtítulo / Instrução */}
            <p className="text-xs sm:text-[13px] text-neutral-700 mt-2 font-normal leading-relaxed">
              Dê um nome para o catálogo (ex: Fotos da loja, Vídeos, Promoções).
            </p>

            {/* Formulário com label, campo de texto e botões */}
            <form onSubmit={handleConfirmCreateCatalog} className="mt-5">
              <div>
                <label className="text-xs font-bold text-neutral-900 block mb-2">
                  Nome do catálogo
                </label>
                <input
                  ref={newCatalogInputRef}
                  type="text"
                  value={newCatalogTitle}
                  onChange={e => setNewCatalogTitle(e.target.value)}
                  placeholder="Nossos serviços"
                  className="w-full px-4 py-2.5 text-xs sm:text-sm text-neutral-900 bg-white rounded-2xl border border-neutral-300 focus:outline-none focus:border-neutral-900 focus:ring-1 focus:ring-neutral-900 transition"
                />
              </div>

              {/* Botões Cancelar e Criar alinhados à direita */}
              <div className="flex items-center justify-end gap-2.5 mt-6 pt-1">
                <button
                  type="button"
                  onClick={() => setIsNewCatalogModalOpen(false)}
                  className="px-5 py-2.5 rounded-2xl border border-neutral-300 bg-white hover:bg-neutral-50 text-neutral-900 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-2xl bg-[#d9f92e] hover:bg-[#c8ea23] text-neutral-950 text-xs font-bold transition shadow-2xs cursor-pointer"
                >
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>

  );
};
