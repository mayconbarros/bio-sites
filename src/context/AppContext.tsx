import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Biosite, 
  Service, 
  Appointment, 
  AppointmentStatus, 
  AgencySettings,
  AnalyticsEventType,
  Professional,
  CreatorProfile,
  User,
  ClientUser
} from '../types';
import { 
  INITIAL_BIOSITES, 
  INITIAL_SERVICES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_AGENCY_SETTINGS 
} from '../data/mockData';
import { INITIAL_CLIENTS } from '../data/rbacConstants';
import { getMediaUrl } from '../utils/mediaStorage';

export function safeSetItem(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch (err: any) {
    console.warn(`[Storage] Storage quota or issue for key '${key}'. Sanitizing large data...`, err?.message || err);
    try {
      const parsed = JSON.parse(value);
      const stripLargeStrings = (val: any): any => {
        if (typeof val === 'string') {
          // If large data URL (>40KB), data:video, or blob: URL, strip to avoid localStorage quota crash
          if (val.startsWith('data:video/') || (val.startsWith('data:') && val.length > 40000) || val.startsWith('blob:')) {
            return '';
          }
          return val;
        }
        if (Array.isArray(val)) return val.map(stripLargeStrings);
        if (val && typeof val === 'object') {
          const res: any = {};
          for (const k of Object.keys(val)) {
            res[k] = stripLargeStrings(val[k]);
          }
          return res;
        }
        return val;
      };
      const cleaned = stripLargeStrings(parsed);
      localStorage.setItem(key, JSON.stringify(cleaned));
    } catch (innerErr) {
      console.warn(`[Storage] Could not persist sanitized key '${key}'`, innerErr);
    }
  }
}

export type AppView = 'agency' | 'client' | 'public' | 'login';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  isAuthenticated: boolean;
  currentUser: User | null;
  setCurrentUser: React.Dispatch<React.SetStateAction<User | null>>;
  login: (email: string, password: string) => boolean;
  logout: () => void;
  switchUserRole: (role: 'admin' | 'client', clientUser?: ClientUser) => void;
  changePassword: (currentPassword: string, newPassword: string) => { success: boolean; message: string };
  agencyActiveTab: 'sites' | 'clients' | 'profile' | 'links';
  setAgencyActiveTab: (tab: 'sites' | 'clients' | 'profile' | 'links') => void;
  clients: ClientUser[];
  addClient: (data: Omit<ClientUser, 'id' | 'createdAt'>) => ClientUser;
  updateClient: (id: string, data: Partial<ClientUser>) => void;
  deleteClient: (id: string) => void;
  creatorProfile: CreatorProfile;
  updateCreatorProfile: (profile: Partial<CreatorProfile>) => void;
  activeBiositeId: string;
  setActiveBiositeId: (id: string) => void;
  previewDevice: 'mobile' | 'desktop';
  setPreviewDevice: (device: 'mobile' | 'desktop') => void;
  
  biosites: Biosite[];
  services: Service[];
  professionals: Professional[];
  appointments: Appointment[];
  agencySettings: AgencySettings;

  updateAgencySettings: (settings: Partial<AgencySettings>) => void;
  addBiosite: (data: Partial<Biosite>) => Biosite;
  updateBiosite: (id: string, data: Partial<Biosite>) => void;
  deleteBiosite: (id: string) => void;
  duplicateBiosite: (id: string) => void;

  addService: (data: Omit<Service, 'id'>) => Service;
  updateService: (id: string, data: Partial<Service>) => void;
  deleteService: (id: string) => void;

  addProfessional: (data: Partial<Professional> & { name: string; biositeId: string }) => Professional;
  updateProfessional: (id: string, data: Partial<Professional>) => void;
  deleteProfessional: (id: string) => void;

  addAppointment: (data: Omit<Appointment, 'id' | 'createdAt' | 'status'> & { status?: AppointmentStatus }) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus) => void;
  deleteAppointment: (id: string) => void;

  trackEvent: (biositeId: string, eventType: AnalyticsEventType, targetId?: string) => void;
  getBiositeStats: (biositeId?: string) => {
    views: number;
    clicks: number;
    bookings: number;
    revenue: number;
    conversionRate: number;
  };

  toast: { message: string; type: 'success' | 'info' | 'error' } | null;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  activeBiosite: Biosite | undefined;
  clientActiveTab: string;
  setClientActiveTab: (tab: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Initialize state with LocalStorage if available
  const [biosites, setBiosites] = useState<Biosite[]>(() => {
    const saved = localStorage.getItem('biosaas_biosites');
    const rawList: Biosite[] = saved ? JSON.parse(saved) : INITIAL_BIOSITES;
    return rawList.map(b => {
      let existing = b.contactButtons || [];
      const hasAgendar = existing.some(btn => btn.label?.toLowerCase() === 'agendar' || btn.type === 'Agendar' || btn.id === 'btn-agendar');
      if (!hasAgendar) {
        existing = [
          ...existing,
          {
            id: 'btn-agendar',
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
          }
        ];
      }
      return { ...b, contactButtons: existing };
    });
  });

  // Resolve initial route from URL (e.g. /esmalteriavip or /painel/esmalteriavip)
  const resolveRoute = (siteList: Biosite[]): { view: AppView; siteId: string } => {
    if (typeof window === 'undefined') {
      return { view: 'login', siteId: siteList[0]?.id || 'bio-bella-nails' };
    }
    const path = window.location.pathname.replace(/^\/+|\/+$/g, '');
    const searchParams = new URLSearchParams(window.location.search);
    const siteQuery = searchParams.get('site');
    const hash = window.location.hash.replace(/^#\/?/, '');

    if (path === 'login') {
      return {
        view: 'login',
        siteId: siteList[0]?.id || 'bio-bella-nails'
      };
    }

    if (path.startsWith('painel')) {
      const slug = path.split('/')[1];
      const match = (siteList || []).find(s => s && (s.slug?.toLowerCase() === slug?.toLowerCase() || s.id?.toLowerCase() === slug?.toLowerCase()));
      return {
        view: 'client',
        siteId: match ? match.id : (siteList?.[0]?.id || 'bio-bella-nails')
      };
    }

    const candidate = siteQuery || hash || (path && path !== 'agency' && path !== 'client' && path !== 'login' && path !== 'index.html' ? path : null);
    if (candidate) {
      const match = (siteList || []).find(s => 
        s && (s.slug?.toLowerCase() === candidate.toLowerCase() || 
        s.id?.toLowerCase() === candidate.toLowerCase())
      );
      if (match) {
        return {
          view: 'public',
          siteId: match.id
        };
      }
    }

    const isAuth = localStorage.getItem('biosaas_is_authenticated') === 'true';
    return {
      view: isAuth ? 'agency' : 'login',
      siteId: siteList[0]?.id || 'bio-bella-nails'
    };
  };

  const initialRoute = React.useMemo(() => resolveRoute(biosites), []);
  const [currentView, setCurrentView] = useState<AppView>(initialRoute.view);
  const [activeBiositeId, setActiveBiositeId] = useState<string>(initialRoute.siteId);
  const [clientActiveTab, setClientActiveTab] = useState<string>('aparencia');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    try {
      return localStorage.getItem('biosaas_is_authenticated') === 'true';
    } catch {
      return false;
    }
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('biosaas_user');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-maycon',
      name: 'Maycon Barros',
      email: 'mayconconsultoria@gmail.com',
      role: 'admin',
      agencyId: 'agency-mb-web',
      phone: '(98) 99150-6106',
    };
  });

  const [clients, setClients] = useState<ClientUser[]>(() => {
    try {
      const saved = localStorage.getItem('biosaas_clients');
      return saved ? JSON.parse(saved) : INITIAL_CLIENTS;
    } catch {
      return INITIAL_CLIENTS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('biosaas_clients', JSON.stringify(clients));
    } catch {}
  }, [clients]);

  const addClient = (data: Omit<ClientUser, 'id' | 'createdAt'>): ClientUser => {
    const newClient: ClientUser = {
      ...data,
      id: `client-${Date.now()}`,
      createdAt: new Date().toLocaleDateString('pt-BR'),
      role: 'client',
    };
    setClients(prev => [newClient, ...prev]);
    showToast(`Cliente "${newClient.name}" cadastrado com sucesso!`, 'success');
    return newClient;
  };

  const updateClient = (id: string, data: Partial<ClientUser>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...data } : c));
    showToast('Dados do cliente atualizados!', 'success');
  };

  const deleteClient = (id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
    showToast('Cliente removido com sucesso!', 'info');
  };

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('biosaas_services');
    const parsed = saved ? JSON.parse(saved) : null;
    return (parsed && parsed.length > 0) ? parsed : INITIAL_SERVICES;
  });

  const [professionals, setProfessionals] = useState<Professional[]>(() => {
    const saved = localStorage.getItem('biosaas_professionals');
    return saved ? JSON.parse(saved) : [];
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('biosaas_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

  const [agencyActiveTab, setAgencyActiveTab] = useState<'sites' | 'clients' | 'profile' | 'links'>('sites');

  const [creatorProfile, setCreatorProfile] = useState<CreatorProfile>(() => {
    try {
      const saved = localStorage.getItem('biosaas_creator_profile');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      name: 'MB Web Digital',
      photoUrl: '',
      linkType: 'site',
      linkUrl: 'https://mbwebdigital.com.br',
    };
  });

  const updateCreatorProfile = (profile: Partial<CreatorProfile>) => {
    setCreatorProfile(prev => {
      const next = { ...prev, ...profile };
      safeSetItem('biosaas_creator_profile', JSON.stringify(next));
      return next;
    });
  };

  const [agencySettings, setAgencySettings] = useState<AgencySettings>(() => {
    const saved = localStorage.getItem('biosaas_agency');
    return saved ? JSON.parse(saved) : INITIAL_AGENCY_SETTINGS;
  });

  // Track events in memory/localStorage for analytics
  const [eventCounts, setEventCounts] = useState<Record<string, { views: number; clicks: number; bookings: number }>>(() => {
    const saved = localStorage.getItem('biosaas_events');
    return saved ? JSON.parse(saved) : {
      'bio-bella-nails': { views: 842, clicks: 312, bookings: 46 },
      'bio-barber-club': { views: 615, clicks: 240, bookings: 38 },
    };
  });

  // Load global state from server for cross-device support (cell phones, incognito tabs, etc.)
  useEffect(() => {
    let isMounted = true;
    fetch('/api/state')
      .then(res => res.ok ? res.json() : null)
      .then(serverState => {
        if (serverState.biosites && Array.isArray(serverState.biosites)) {
          const sanitized = serverState.biosites.map((b: any) => ({
            ...b,
            businessHours: b.businessHours || [],
            contactButtons: b.contactButtons || [],
            catalogs: b.catalogs || [],
            catalogSettings: b.catalogSettings || { autoplay: true, interval: 5 },
            locationConfig: b.locationConfig || { enabled: false },
          }));
          setBiosites(sanitized);
          safeSetItem('biosaas_biosites', JSON.stringify(sanitized));
        }
        if (serverState.services && Array.isArray(serverState.services)) {
          setServices(serverState.services);
          safeSetItem('biosaas_services', JSON.stringify(serverState.services));
        }
        if (serverState.creatorProfile) {
          setCreatorProfile(serverState.creatorProfile);
          safeSetItem('biosaas_creator_profile', JSON.stringify(serverState.creatorProfile));
        }
      })
      .catch(() => {});
    return () => { isMounted = false; };
  }, []);

  // Save to server API in background on changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetch('/api/state', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          biosites,
          services,
          creatorProfile,
          agencySettings,
        }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(timer);
  }, [biosites, services, creatorProfile, agencySettings]);

  useEffect(() => {
    safeSetItem('biosaas_biosites', JSON.stringify(biosites));
  }, [biosites]);

  useEffect(() => {
    safeSetItem('biosaas_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    safeSetItem('biosaas_professionals', JSON.stringify(professionals));
  }, [professionals]);

  useEffect(() => {
    safeSetItem('biosaas_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    safeSetItem('biosaas_agency', JSON.stringify(agencySettings));
  }, [agencySettings]);

  useEffect(() => {
    safeSetItem('biosaas_events', JSON.stringify(eventCounts));
  }, [eventCounts]);

  // Hydrate stored cover videos from IndexedDB
  useEffect(() => {
    let isMounted = true;
    biosites.forEach(async (b) => {
      try {
        const storedVideoUrl = await getMediaUrl(`cover_video_${b.id}`);
        if (isMounted && storedVideoUrl) {
          setBiosites(prev => prev.map(item => item.id === b.id ? { ...item, videoUrl: storedVideoUrl, coverType: 'video' } : item));
        }
      } catch (e) {
        console.warn('Could not hydrate video from IndexedDB:', e);
      }
    });
    return () => { isMounted = false; };
  }, []);

  // Sync state across browser tabs in real-time and handle browser navigation
  useEffect(() => {
    const handlePopState = () => {
      const route = resolveRoute(biosites);
      setCurrentView(route.view);
      setActiveBiositeId(route.siteId);
    };

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'biosaas_biosites' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setBiosites(updated);
        } catch {}
      }
      if (e.key === 'biosaas_services' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setServices(updated);
        } catch {}
      }
      if (e.key === 'biosaas_creator_profile' && e.newValue) {
        try {
          const updated = JSON.parse(e.newValue);
          setCreatorProfile(updated);
        } catch {}
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [biosites]);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  const updateAgencySettings = (settings: Partial<AgencySettings>) => {
    setAgencySettings(prev => ({ ...prev, ...settings }));
    showToast('Configurações da agência salvas!');
  };

  const addBiosite = (data: Partial<Biosite>): Biosite => {
    const id = `bio-${Date.now()}`;
    const newSite: Biosite = {
      ...INITIAL_BIOSITES[0],
      id,
      title: data.title || 'Novo Estabelecimento',
      subtitle: data.subtitle || 'Serviços Especializados',
      slug: data.slug || `site-${Date.now()}`,
      clientName: data.clientName || 'Proprietário',
      clientEmail: data.clientEmail || 'contato@cliente.com',
      clientPhone: data.clientPhone || '(11) 99999-0000',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...data,
    };

    setBiosites(prev => [newSite, ...prev]);
    setActiveBiositeId(newSite.id);
    showToast(`Bio Site "${newSite.title}" criado com sucesso!`);
    return newSite;
  };

  const updateBiosite = (id: string, data: Partial<Biosite>) => {
    setBiosites(prev => prev.map(site => site.id === id ? { ...site, ...data, updatedAt: new Date().toISOString() } : site));
    showToast('Alterações salvas com sucesso!');
  };

  const deleteBiosite = (id: string) => {
    setBiosites(prev => prev.filter(site => site.id !== id));
    setServices(prev => prev.filter(service => service.biositeId !== id));
    setAppointments(prev => prev.filter(app => app.biositeId !== id));
    if (activeBiositeId === id && biosites.length > 1) {
      const remaining = biosites.filter(s => s.id !== id);
      setActiveBiositeId(remaining[0]?.id || '');
    }
    showToast('Bio Site removido!');
  };

  const duplicateBiosite = (id: string) => {
    const source = biosites.find(s => s.id === id);
    if (!source) return;

    const newId = `bio-${Date.now()}`;
    const duplicated: Biosite = {
      ...source,
      id: newId,
      title: `${source.title} (Cópia)`,
      slug: `${source.slug}-copia-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Duplicate services
    const sourceServices = services.filter(s => s.biositeId === id);
    const newServices: Service[] = sourceServices.map(s => ({
      ...s,
      id: `srv-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      biositeId: newId,
    }));

    setBiosites(prev => [duplicated, ...prev]);
    setServices(prev => [...prev, ...newServices]);
    setActiveBiositeId(newId);
    showToast('Bio Site duplicado com sucesso!');
  };

  const addService = (data: Omit<Service, 'id'>): Service => {
    const newService: Service = {
      ...data,
      id: `srv-${Date.now()}`,
    };
    setServices(prev => [...prev, newService]);
    showToast(`Serviço "${newService.name}" adicionado!`);
    return newService;
  };

  const updateService = (id: string, data: Partial<Service>) => {
    setServices(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    showToast('Serviço atualizado com sucesso!');
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
    showToast('Serviço removido!');
  };

  const addProfessional = (data: Partial<Professional> & { name: string; biositeId: string }): Professional => {
    const newProfessional: Professional = {
      id: `prof-${Date.now()}`,
      biositeId: data.biositeId,
      name: data.name.trim() || 'Colaboradora Maria',
      photoUrl: data.photoUrl,
      color: data.color || '#1d4ed8',
      active: data.active ?? true,
      services: data.services || [],
      workSchedule: data.workSchedule || [
        { dayOfWeek: 0, dayLabel: 'Dom', enabled: false },
        { dayOfWeek: 1, dayLabel: 'Seg', enabled: false },
        { dayOfWeek: 2, dayLabel: 'Ter', enabled: false },
        { dayOfWeek: 3, dayLabel: 'Qua', enabled: false },
        { dayOfWeek: 4, dayLabel: 'Qui', enabled: false },
        { dayOfWeek: 5, dayLabel: 'Sex', enabled: false },
        { dayOfWeek: 6, dayLabel: 'Sáb', enabled: false },
      ],
      blockedDates: data.blockedDates || [],
      createdAt: new Date().toISOString(),
    };
    setProfessionals(prev => [newProfessional, ...prev]);
    return newProfessional;
  };

  const updateProfessional = (id: string, data: Partial<Professional>) => {
    setProfessionals(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  };

  const deleteProfessional = (id: string) => {
    setProfessionals(prev => prev.filter(p => p.id !== id));
    showToast('Profissional removido!');
  };

  const addAppointment = (data: Omit<Appointment, 'id' | 'createdAt' | 'status'> & { status?: AppointmentStatus }): Appointment => {
    const newAppointment: Appointment = {
      ...data,
      id: `app-${Date.now()}`,
      status: data.status || 'pending',
      createdAt: new Date().toISOString(),
    };
    setAppointments(prev => [newAppointment, ...prev]);

    // Track in stats
    setEventCounts(prev => {
      const current = prev[data.biositeId] || { views: 0, clicks: 0, bookings: 0 };
      return {
        ...prev,
        [data.biositeId]: {
          ...current,
          bookings: current.bookings + 1,
        },
      };
    });

    showToast('Agendamento realizado com sucesso!');
    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus) => {
    setAppointments(prev => prev.map(app => app.id === id ? { ...app, status } : app));
    const labels: Record<AppointmentStatus, string> = {
      pending: 'Pendente',
      confirmed: 'Confirmado ✅',
      completed: 'Concluído 🏆',
      cancelled: 'Cancelado ❌',
    };
    showToast(`Status atualizado para: ${labels[status]}`);
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(app => app.id !== id));
    showToast('Agendamento excluído!');
  };

  const trackEvent = (biositeId: string, eventType: AnalyticsEventType) => {
    setEventCounts(prev => {
      const current = prev[biositeId] || { views: 0, clicks: 0, bookings: 0 };
      if (eventType === 'page_view') {
        return { ...prev, [biositeId]: { ...current, views: current.views + 1 } };
      }
      if (eventType === 'click_button' || eventType === 'pix_copied' || eventType === 'wifi_copied' || eventType === 'maps_clicked') {
        return { ...prev, [biositeId]: { ...current, clicks: current.clicks + 1 } };
      }
      if (eventType === 'booking_complete') {
        return { ...prev, [biositeId]: { ...current, bookings: current.bookings + 1 } };
      }
      return prev;
    });
  };

  const getBiositeStats = (biositeId?: string) => {
    if (biositeId) {
      const count = eventCounts[biositeId] || { views: 120, clicks: 45, bookings: 12 };
      const siteAppointments = appointments.filter(a => a.biositeId === biositeId);
      const revenue = siteAppointments
        .filter(a => a.status === 'confirmed' || a.status === 'completed')
        .reduce((acc, curr) => acc + curr.totalPrice, 0);

      const conversionRate = count.views > 0 ? (count.bookings / count.views) * 100 : 0;

      return {
        views: count.views,
        clicks: count.clicks,
        bookings: siteAppointments.length,
        revenue,
        conversionRate: Math.round(conversionRate * 10) / 10,
      };
    }

    // Consolidated Agency Stats
    let totalViews = 0;
    let totalClicks = 0;
    Object.values(eventCounts).forEach(c => {
      totalViews += c.views;
      totalClicks += c.clicks;
    });

    const totalRevenue = appointments
      .filter(a => a.status === 'confirmed' || a.status === 'completed')
      .reduce((acc, curr) => acc + curr.totalPrice, 0);

    const conversionRate = totalViews > 0 ? (appointments.length / totalViews) * 100 : 0;

    return {
      views: totalViews,
      clicks: totalClicks,
      bookings: appointments.length,
      revenue: totalRevenue,
      conversionRate: Math.round(conversionRate * 10) / 10,
    };
  };

  const activeBiosite = (biosites || []).find(s => s && s.id === activeBiositeId) || biosites?.[0];

  const navigateView = (view: AppView) => {
    setCurrentView(view);
    if (typeof window !== 'undefined') {
      const activeSite = (biosites || []).find(s => s && s.id === activeBiositeId) || biosites?.[0];
      if (view === 'login') {
        if (window.location.pathname !== '/' && window.location.pathname !== '/login') {
          window.history.pushState({}, '', '/');
        }
      } else if (view === 'public' && activeSite) {
        const target = `/${activeSite.slug}`;
        if (window.location.pathname !== target) {
          window.history.pushState({}, '', target);
        }
      } else if (view === 'agency') {
        if (window.location.pathname !== '/' && !window.location.pathname.startsWith('/painel')) {
          window.history.pushState({}, '', '/');
        }
      } else if (view === 'client' && activeSite) {
        const target = `/painel/${activeSite.slug}`;
        if (window.location.pathname !== target) {
          window.history.pushState({}, '', target);
        }
      }
    }
  };

  const login = (emailInput: string, passwordInput: string): boolean => {
    const cleanEmail = emailInput.trim().toLowerCase();
    const cleanPassword = passwordInput.trim();

    // 1. Verifica se é um Cliente cadastrado
    const clientMatch = clients.find(c => c.email.toLowerCase() === cleanEmail);
    if (clientMatch) {
      if (clientMatch.status === 'blocked') {
        showToast('Esta conta de cliente está bloqueada. Contate o administrador.', 'error');
        return false;
      }
      const user: User = {
        id: clientMatch.id,
        name: clientMatch.name,
        email: clientMatch.email,
        phone: clientMatch.phone,
        role: 'client',
        assignedBiositeIds: clientMatch.assignedBiositeIds,
        permissions: clientMatch.permissions,
        mustChangePassword: clientMatch.mustChangePassword,
        temporaryPassword: clientMatch.temporaryPassword,
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      if (clientMatch.assignedBiositeIds?.[0]) {
        setActiveBiositeId(clientMatch.assignedBiositeIds[0]);
      }
      try {
        localStorage.setItem('biosaas_is_authenticated', 'true');
        localStorage.setItem('biosaas_user', JSON.stringify(user));
      } catch {}
      navigateView('client');
      showToast(`Bem-vindo, ${clientMatch.name}! Painel do cliente ativo.`, 'success');
      return true;
    }

    // 2. Aceita credenciais de Administrador (padrão mayconconsultoria@gmail.com / SenhaSegura123!)
    const isTargetAdmin = cleanEmail === 'mayconconsultoria@gmail.com' && cleanPassword === 'SenhaSegura123!';
    const isValidFormat = cleanEmail.includes('@') && cleanPassword.length >= 4;

    if (isTargetAdmin || isValidFormat) {
      const user: User = {
        id: 'usr-maycon',
        name: cleanEmail.includes('maycon') ? 'Maycon Barros (Admin)' : 'Administrador',
        email: cleanEmail,
        role: 'admin',
        agencyId: 'agency-mb-web',
        phone: '(98) 99150-6106',
      };
      setIsAuthenticated(true);
      setCurrentUser(user);
      try {
        localStorage.setItem('biosaas_is_authenticated', 'true');
        localStorage.setItem('biosaas_user', JSON.stringify(user));
      } catch {}
      navigateView('agency');
      showToast('Bem-vindo, Administrador! Acesso total concedido.', 'success');
      return true;
    }

    return false;
  };

  const logout = () => {
    setIsAuthenticated(false);
    try {
      localStorage.setItem('biosaas_is_authenticated', 'false');
    } catch {}
    navigateView('login');
    showToast('Você saiu da sua conta.', 'info');
  };

  const switchUserRole = (role: 'admin' | 'client', clientUser?: ClientUser) => {
    if (role === 'admin') {
      const adminUser: User = {
        id: 'usr-maycon',
        name: 'Maycon Barros (Admin)',
        email: 'mayconconsultoria@gmail.com',
        role: 'admin',
        agencyId: 'agency-mb-web',
        phone: '(98) 99150-6106',
      };
      setCurrentUser(adminUser);
      setIsAuthenticated(true);
      try {
        localStorage.setItem('biosaas_user', JSON.stringify(adminUser));
      } catch {}
      navigateView('agency');
      setAgencyActiveTab('sites');
      showToast('Visão de Administrador ativada (Acesso Total).', 'info');
    } else {
      const targetClient = clientUser || clients[0] || INITIAL_CLIENTS[0];
      const clientAuth: User = {
        id: targetClient.id,
        name: targetClient.name,
        email: targetClient.email,
        phone: targetClient.phone,
        role: 'client',
        assignedBiositeIds: targetClient.assignedBiositeIds,
        permissions: targetClient.permissions,
        mustChangePassword: targetClient.mustChangePassword,
        temporaryPassword: targetClient.temporaryPassword,
      };
      setCurrentUser(clientAuth);
      setIsAuthenticated(true);
      if (targetClient.assignedBiositeIds?.[0]) {
        setActiveBiositeId(targetClient.assignedBiositeIds[0]);
      }
      try {
        localStorage.setItem('biosaas_user', JSON.stringify(clientAuth));
      } catch {}
      navigateView('client');
      showToast(`Simulando visão do Cliente: ${targetClient.name}`, 'info');
    }
  };

  const changePassword = (currentPassword: string, newPassword: string): { success: boolean; message: string } => {
    if (!currentUser) return { success: false, message: 'Usuário não autenticado.' };

    if (currentUser.temporaryPassword && currentPassword !== currentUser.temporaryPassword) {
      return { success: false, message: 'A senha atual informada está incorreta.' };
    }

    if (newPassword.length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres.' };
    }

    const updatedUser: User = {
      ...currentUser,
      mustChangePassword: false,
      temporaryPassword: newPassword,
    };
    setCurrentUser(updatedUser);

    setClients(prev => prev.map(c => (c.id === currentUser.id || c.email === currentUser.email) ? {
      ...c,
      mustChangePassword: false,
      temporaryPassword: newPassword,
    } : c));

    try {
      localStorage.setItem('biosaas_user', JSON.stringify(updatedUser));
    } catch {}

    showToast('Senha alterada com sucesso! Acesso liberado.', 'success');
    return { success: true, message: 'Senha atualizada com sucesso!' };
  };

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView: navigateView,
        isAuthenticated,
        currentUser,
        setCurrentUser,
        login,
        logout,
        switchUserRole,
        changePassword,
        agencyActiveTab,
        setAgencyActiveTab,
        clients,
        addClient,
        updateClient,
        deleteClient,
        creatorProfile,
        updateCreatorProfile,
        activeBiositeId,
        setActiveBiositeId,
        previewDevice,
        setPreviewDevice,
        biosites,
        services,
        professionals,
        appointments,
        agencySettings,
        updateAgencySettings,
        addBiosite,
        updateBiosite,
        deleteBiosite,
        duplicateBiosite,
        addService,
        updateService,
        deleteService,
        addProfessional,
        updateProfessional,
        deleteProfessional,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        trackEvent,
        getBiositeStats,
        toast,
        showToast,
        activeBiosite,
        clientActiveTab,
        setClientActiveTab,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
