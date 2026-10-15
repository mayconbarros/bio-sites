import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment, AppointmentStatus } from '../../types';
import { 
  Calendar as CalendarIcon, 
  Phone, 
  CheckCircle2, 
  MessageCircle, 
  ExternalLink, 
  Plus, 
  Copy, 
  Check, 
  Sparkles, 
  Search,
  DollarSign,
  AlertCircle
} from 'lucide-react';

export const ClientDashboard: React.FC = () => {
  const { 
    activeBiosite, 
    appointments, 
    services, 
    updateAppointmentStatus, 
    addAppointment,
    setCurrentView,
    showToast 
  } = useApp();

  const [dateFilter, setDateFilter] = useState<'today' | 'upcoming' | 'all'>('today');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedLink, setCopiedLink] = useState(false);
  const [manualModalOpen, setManualModalOpen] = useState(false);

  // Manual appointment form state
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualServiceId, setManualServiceId] = useState(services[0]?.id || '');
  const [manualDate, setManualDate] = useState(new Date().toISOString().split('T')[0]);
  const [manualTime, setManualTime] = useState('15:00');
  const [manualNotes, setManualNotes] = useState('');

  if (!activeBiosite) {
    return (
      <div className="p-8 text-center text-neutral-500">
        Nenhum bio site selecionado.
      </div>
    );
  }

  const siteAppointments = appointments.filter(a => a.biositeId === activeBiosite.id);
  const siteServices = services.filter(s => s.biositeId === activeBiosite.id);

  const todayStr = new Date().toISOString().split('T')[0];

  // Filtering
  const filteredAppointments = siteAppointments.filter(app => {
    if (dateFilter === 'today' && app.appointmentDate !== todayStr) return false;
    if (dateFilter === 'upcoming' && app.appointmentDate < todayStr) return false;
    if (statusFilter !== 'all' && app.status !== statusFilter) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        app.customerName.toLowerCase().includes(q) ||
        app.serviceName.toLowerCase().includes(q) ||
        app.customerPhone.includes(q)
      );
    }

    return true;
  }).sort((a, b) => {
    if (a.appointmentDate === b.appointmentDate) {
      return a.appointmentTime.localeCompare(b.appointmentTime);
    }
    return a.appointmentDate.localeCompare(b.appointmentDate);
  });

  // Today stats
  const todayApps = siteAppointments.filter(a => a.appointmentDate === todayStr);
  const todayPending = todayApps.filter(a => a.status === 'pending');
  const todayRevenue = todayApps
    .filter(a => a.status === 'confirmed' || a.status === 'completed')
    .reduce((acc, curr) => acc + curr.totalPrice, 0);

  const handleCopyLink = () => {
    const fullUrl = `${window.location.origin}/bio/${activeBiosite.slug}`;
    navigator.clipboard.writeText(fullUrl);
    setCopiedLink(true);
    showToast('Link do Bio Site copiado!');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleWhatsAppCustomer = (app: Appointment) => {
    const cleanPhone = app.customerPhone.replace(/\D/g, '');
    const dateFormatted = app.appointmentDate.split('-').reverse().join('/');
    const text = encodeURIComponent(
      `Olá ${app.customerName}! Tudo bem? Aqui é do ${activeBiosite.title}. Passando para confirmar seu agendamento de *${app.serviceName}* no dia *${dateFormatted}* às *${app.appointmentTime}*. Posso confirmar seu horário?`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${cleanPhone}&text=${text}`, '_blank');
  };

  const handleSaveManualAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualName.trim() || !manualPhone.trim()) return;

    const chosenService = siteServices.find(s => s.id === manualServiceId) || siteServices[0];
    const price = chosenService?.promotionalPrice || chosenService?.price || 0;

    addAppointment({
      biositeId: activeBiosite.id,
      serviceId: chosenService.id,
      serviceName: chosenService.name,
      customerName: manualName,
      customerPhone: manualPhone,
      appointmentDate: manualDate,
      appointmentTime: manualTime,
      durationMinutes: chosenService.durationMinutes,
      totalPrice: price,
      customerNotes: manualNotes,
      status: 'confirmed',
    });

    setManualModalOpen(false);
    setManualName('');
    setManualPhone('');
    setManualNotes('');
  };

  return (
    <div className="flex-1 bg-white text-neutral-900 p-6 sm:p-8 space-y-7 min-h-screen">
      
      {/* Establishment Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-3xl bg-neutral-50 border border-neutral-200 shadow-xs">
        <div className="flex items-center gap-4">
          <img 
            src={activeBiosite.avatarUrl} 
            alt={activeBiosite.title}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-pink-400 shadow-md bg-white"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-200">
                Painel do Cliente
              </span>
              <span className="text-neutral-400 text-xs">•</span>
              <span className="text-xs text-neutral-500">{activeBiosite.clientName}</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 mt-1">
              {activeBiosite.title}
            </h1>
            <p className="text-xs text-neutral-500">
              Agenda em tempo real dos agendamentos recebidos através do seu Bio Site.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-200 shadow-xs"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            {copiedLink ? 'Link Copiado!' : 'Copiar Link da Bio'}
          </button>

          <button
            onClick={() => setCurrentView('public')}
            className="px-3.5 py-2 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 text-xs font-semibold flex items-center gap-1.5 transition border border-neutral-200 shadow-xs"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#ff2a85]" />
            Ver Meu Bio Site
          </button>

          <button
            onClick={() => setManualModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-sm shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4" />
            Agendar Manualmente
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Agendamentos Hoje</span>
            <CalendarIcon className="w-4 h-4 text-[#ff2a85]" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {todayApps.length}
          </div>
          <span className="text-[10px] text-neutral-400">
            Data de hoje ({todayStr.split('-').reverse().join('/')})
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Aguardando Confirmação</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600">
            {todayPending.length}
          </div>
          <span className="text-[10px] text-amber-700 font-medium">
            Envie mensagem no WhatsApp!
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Faturamento Hoje</span>
            <DollarSign className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600">
            R$ {todayRevenue.toFixed(2).replace('.', ',')}
          </div>
          <span className="text-[10px] text-neutral-400">
            Confirmados ou concluídos
          </span>
        </div>

        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200 space-y-1">
          <div className="flex items-center justify-between text-neutral-500 text-xs">
            <span>Total Histórico</span>
            <Sparkles className="w-4 h-4 text-blue-500" />
          </div>
          <div className="text-2xl font-black text-neutral-900">
            {siteAppointments.length}
          </div>
          <span className="text-[10px] text-neutral-400">
            Agendamentos totais recebidos
          </span>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pt-2">
        <div className="flex items-center p-1 rounded-2xl bg-neutral-100 text-xs">
          <button
            onClick={() => setDateFilter('today')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              dateFilter === 'today' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Hoje ({todayApps.length})
          </button>
          <button
            onClick={() => setDateFilter('upcoming')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              dateFilter === 'upcoming' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Próximos Dias
          </button>
          <button
            onClick={() => setDateFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition ${
              dateFilter === 'all' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-500 hover:text-neutral-900'
            }`}
          >
            Todos ({siteAppointments.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <div className="relative flex-1 md:w-56">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar cliente..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs placeholder-neutral-400 focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-900 text-xs focus:outline-none"
          >
            <option value="all">Todos os Status</option>
            <option value="pending">Apenas Pendentes</option>
            <option value="confirmed">Apenas Confirmados</option>
            <option value="completed">Concluídos</option>
            <option value="cancelled">Cancelados</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-neutral-50 border border-neutral-200 space-y-2">
            <CalendarIcon className="w-10 h-10 text-neutral-400 mx-auto" />
            <h3 className="text-base font-bold text-neutral-800">Nenhum agendamento encontrado</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              Não há agendamentos para o filtro selecionado. Novos agendamentos feitos no Bio Site aparecerão aqui automaticamente!
            </p>
          </div>
        ) : (
          filteredAppointments.map(app => {
            const isToday = app.appointmentDate === todayStr;

            return (
              <div
                key={app.id}
                className="p-4 sm:p-5 rounded-2xl bg-white border border-neutral-200 shadow-xs hover:border-neutral-300 transition flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-200 text-center shrink-0 min-w-20">
                    <span className="text-xs text-neutral-500 block font-mono">
                      {app.appointmentDate.split('-').reverse().slice(0, 2).join('/')}
                    </span>
                    <strong className="text-base font-black text-neutral-900 block">
                      {app.appointmentTime}
                    </strong>
                    <span className="text-[10px] text-neutral-400 block">
                      {app.durationMinutes} min
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-base text-neutral-900">
                        {app.customerName}
                      </h3>
                      {isToday && (
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase bg-pink-100 text-[#ff2a85] border border-pink-200">
                          Hoje
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-neutral-500">
                      <span className="font-semibold text-neutral-700">
                        {app.serviceName}
                      </span>
                      <span>•</span>
                      <span className="font-bold text-emerald-600">
                        R$ {app.totalPrice.toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
                      <Phone className="w-3 h-3 text-neutral-400" />
                      <span>{app.customerPhone}</span>
                    </div>

                    {app.customerNotes && (
                      <p className="text-xs text-neutral-500 italic bg-neutral-50 px-2.5 py-1 rounded-lg border border-neutral-200 inline-block mt-1">
                        "{app.customerNotes}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-2 md:pt-0 border-t md:border-t-0 border-neutral-100">
                  <button
                    onClick={() => handleWhatsAppCustomer(app)}
                    className="py-2 px-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 transition shadow-xs"
                    title="Chamar no WhatsApp com mensagem pronta"
                  >
                    <MessageCircle className="w-4 h-4" />
                    Chamar no WhatsApp
                  </button>

                  {app.status === 'pending' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'confirmed')}
                      className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-emerald-50 text-emerald-700 text-xs font-semibold flex items-center gap-1 transition border border-neutral-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Confirmar
                    </button>
                  )}

                  {app.status === 'confirmed' && (
                    <button
                      onClick={() => updateAppointmentStatus(app.id, 'completed')}
                      className="py-2 px-3 rounded-xl bg-neutral-100 hover:bg-blue-50 text-blue-700 text-xs font-semibold flex items-center gap-1 transition border border-neutral-200"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Concluir
                    </button>
                  )}

                  <select
                    value={app.status}
                    onChange={e => updateAppointmentStatus(app.id, e.target.value as AppointmentStatus)}
                    className={`px-3 py-2 rounded-xl text-xs font-bold border transition focus:outline-none ${
                      app.status === 'confirmed' 
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300' 
                        : app.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border-amber-300'
                          : app.status === 'completed'
                            ? 'bg-blue-50 text-blue-700 border-blue-300'
                            : 'bg-red-50 text-red-700 border-red-300'
                    }`}
                  >
                    <option value="pending">⏳ Pendente</option>
                    <option value="confirmed">✅ Confirmado</option>
                    <option value="completed">🏆 Concluído</option>
                    <option value="cancelled">❌ Cancelado</option>
                  </select>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MANUAL APPOINTMENT MODAL */}
      {manualModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white border border-neutral-200 rounded-3xl p-6 shadow-2xl space-y-4">
            <div>
              <span className="text-xs uppercase tracking-wider font-semibold text-emerald-600 flex items-center gap-1.5">
                <Plus className="w-3.5 h-3.5" />
                Agendamento de Balcão / Telefone
              </span>
              <h3 className="text-lg font-bold text-neutral-900 mt-1">
                Novo Agendamento Manual
              </h3>
            </div>

            <form onSubmit={handleSaveManualAppointment} className="space-y-3">
              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Nome do Cliente *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Beatriz Lima"
                  value={manualName}
                  onChange={e => setManualName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">WhatsApp do Cliente *</label>
                <input
                  type="tel"
                  required
                  placeholder="(11) 99999-9999"
                  value={manualPhone}
                  onChange={e => setManualPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Serviço</label>
                <select
                  value={manualServiceId}
                  onChange={e => setManualServiceId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                >
                  {siteServices.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} - R$ {(s.promotionalPrice || s.price).toFixed(2).replace('.', ',')} ({s.durationMinutes} min)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Data</label>
                  <input
                    type="date"
                    required
                    value={manualDate}
                    onChange={e => setManualDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-neutral-700 block mb-1">Horário</label>
                  <input
                    type="time"
                    required
                    value={manualTime}
                    onChange={e => setManualTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-medium text-neutral-700 block mb-1">Observações</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Pagará no balcão via Pix"
                  value={manualNotes}
                  onChange={e => setManualNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-neutral-50 border border-neutral-300 text-neutral-900 text-xs resize-none"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setManualModalOpen(false)}
                  className="w-1/2 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs"
                >
                  Confirmar Horário
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
