import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus, Service } from '../../types';
import { BioSiteEditor } from '../agency/BioSiteEditor';
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
  Calendar as CalendarIcon
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    activeBiosite, 
    appointments, 
    services, 
    updateAppointmentStatus, 
    addAppointment,
    setCurrentView,
    showToast,
    getBiositeStats 
  } = useApp();

  const [selectedTab, setSelectedTab] = useState<string>('estatisticas');
  const [datePeriod, setDatePeriod] = useState<'hoje' | 'ontem' | '7d' | '15d' | '30d' | 'maximo'>('30d');
  const [copiedLink, setCopiedLink] = useState(false);
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

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
          <aside className="w-56 bg-white border-r border-neutral-200 py-4 px-3 flex flex-col justify-between shrink-0 min-h-[calc(100vh-92px)] overflow-y-auto">
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
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-w-0">
          
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

          {/* EDITING TABS: Re-uses BioSiteEditor smoothly */}
          {(['templates', 'aparencia', 'titulos', 'botoes', 'catalogo', 'endereco', 'leads', 'layout', 'links', 'servicos', 'profissionais', 'pix', 'cadastros'].includes(selectedTab)) && (
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

    </div>
  );
};
