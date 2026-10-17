import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  Biosite, 
  Service, 
  Appointment, 
  AppointmentStatus, 
  AgencySettings,
  AnalyticsEventType
} from '../types';
import { 
  INITIAL_BIOSITES, 
  INITIAL_SERVICES, 
  INITIAL_APPOINTMENTS, 
  INITIAL_AGENCY_SETTINGS 
} from '../data/mockData';

export type AppView = 'agency' | 'client' | 'public';

interface AppContextType {
  currentView: AppView;
  setCurrentView: (view: AppView) => void;
  activeBiositeId: string;
  setActiveBiositeId: (id: string) => void;
  previewDevice: 'mobile' | 'desktop';
  setPreviewDevice: (device: 'mobile' | 'desktop') => void;
  
  biosites: Biosite[];
  services: Service[];
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentView, setCurrentView] = useState<AppView>('agency');
  const [activeBiositeId, setActiveBiositeId] = useState<string>('bio-bella-nails');
  const [previewDevice, setPreviewDevice] = useState<'mobile' | 'desktop'>('mobile');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // Initialize state with LocalStorage if available
  const [biosites, setBiosites] = useState<Biosite[]>(() => {
    const saved = localStorage.getItem('biosaas_biosites');
    const rawList: Biosite[] = saved ? JSON.parse(saved) : INITIAL_BIOSITES;
    return rawList.map(b => {
      const existing = b.contactButtons || [];
      const hasBooking = existing.some(btn => btn.id === 'btn-booking' || btn.type === 'Agendar' || (btn as any).isSpecial === 'booking');
      const hasPix = existing.some(btn => btn.id === 'btn-pix' || btn.type === 'Pix' || (btn as any).isSpecial === 'pix');
      const hasWifi = existing.some(btn => btn.id === 'btn-wifi' || btn.type === 'WiFi' || (btn as any).isSpecial === 'wifi');
      const fullList = [...existing];
      if (!hasBooking) {
        fullList.unshift({
          id: 'btn-booking',
          label: 'Agendar Horário Online',
          icon: 'Sparkles',
          lucideIcon: 'Sparkles',
          url: '#agendar',
          isWhatsApp: false,
          active: true,
          type: 'Agendar',
          isSpecial: 'booking',
          displayMode: 'full_button',
          pulseEffect: false,
          bgColor: 'padrão',
          textColor: 'padrão',
        });
      }
      if (!hasPix && b.pixConfig?.pixKey) {
        fullList.push({
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
          bgColor: b.pixConfig.buttonBgColor || 'padrão',
          textColor: b.pixConfig.buttonTextColor || 'padrão',
        });
      }
      if (!hasWifi && b.wifiConfig?.networkName) {
        fullList.push({
          id: 'btn-wifi',
          label: `Wi-Fi: ${b.wifiConfig.networkName}`,
          icon: 'Wifi',
          lucideIcon: 'Wifi',
          url: '#wifi',
          isWhatsApp: false,
          active: true,
          type: 'WiFi',
          isSpecial: 'wifi',
          displayMode: 'full_button',
          pulseEffect: false,
          bgColor: b.wifiConfig.buttonBgColor || 'padrão',
          textColor: b.wifiConfig.buttonTextColor || 'padrão',
        });
      }
      return { ...b, contactButtons: fullList };
    });
  });

  const [services, setServices] = useState<Service[]>(() => {
    const saved = localStorage.getItem('biosaas_services');
    return saved ? JSON.parse(saved) : INITIAL_SERVICES;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem('biosaas_appointments');
    return saved ? JSON.parse(saved) : INITIAL_APPOINTMENTS;
  });

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

  useEffect(() => {
    localStorage.setItem('biosaas_biosites', JSON.stringify(biosites));
  }, [biosites]);

  useEffect(() => {
    localStorage.setItem('biosaas_services', JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem('biosaas_appointments', JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem('biosaas_agency', JSON.stringify(agencySettings));
  }, [agencySettings]);

  useEffect(() => {
    localStorage.setItem('biosaas_events', JSON.stringify(eventCounts));
  }, [eventCounts]);

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

  const activeBiosite = biosites.find(s => s.id === activeBiositeId) || biosites[0];

  return (
    <AppContext.Provider
      value={{
        currentView,
        setCurrentView,
        activeBiositeId,
        setActiveBiositeId,
        previewDevice,
        setPreviewDevice,
        biosites,
        services,
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
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        trackEvent,
        getBiositeStats,
        toast,
        showToast,
        activeBiosite,
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
