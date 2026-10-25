import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { Professional, Service, ProfessionalDaySchedule } from '../../types';
import { CustomToggle } from '../common/CustomToggle';
import { uploadMediaFile } from '../../utils/uploadMedia';
import { 
  Plus, 
  ChevronDown, 
  ChevronUp, 
  Trash2, 
  Ban, 
  Calendar as CalendarIcon,
  X,
  Check
} from 'lucide-react';

const DAYS_OF_WEEK: { index: number; label: string }[] = [
  { index: 0, label: 'Dom' },
  { index: 1, label: 'Seg' },
  { index: 2, label: 'Ter' },
  { index: 3, label: 'Qua' },
  { index: 4, label: 'Qui' },
  { index: 5, label: 'Sex' },
  { index: 6, label: 'Sáb' },
];

export const ProfissionaisTab: React.FC = () => {
  const { 
    activeBiosite, 
    services, 
    professionals, 
    addProfessional, 
    updateProfessional, 
    deleteProfessional,
    showToast 
  } = useApp();

  const [newProfName, setNewProfName] = useState('');
  const [expandedProfIds, setExpandedProfIds] = useState<Record<string, boolean>>({});
  const [showSuccessToast, setShowSuccessToast] = useState(false);
  const [blockDateInputs, setBlockDateInputs] = useState<Record<string, string>>({});
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  if (!activeBiosite) return null;

  // Filter services and professionals for this biosite
  const biositeServices = services.filter(s => s.biositeId === activeBiosite.id);
  const biositeProfessionals = professionals.filter(p => p.biositeId === activeBiosite.id);

  // Toggle card expansion
  const toggleExpand = (profId: string) => {
    setExpandedProfIds(prev => ({
      ...prev,
      [profId]: !prev[profId],
    }));
  };

  // Add professional handler
  const handleAddProfessional = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const nameToAdd = newProfName.trim() || 'Colaboradora Maria';

    // Build initial services map with all services disabled
    const initialServices = biositeServices.map(s => ({
      serviceId: s.id,
      enabled: false,
    }));

    // Build initial schedule with all days disabled
    const initialSchedule: ProfessionalDaySchedule[] = DAYS_OF_WEEK.map(d => ({
      dayOfWeek: d.index,
      dayLabel: d.label,
      enabled: false,
      startTime: '09:00',
      endTime: '18:00',
    }));

    const created = addProfessional({
      biositeId: activeBiosite.id,
      name: nameToAdd,
      color: '#1d4ed8', // Royal blue as shown in screenshot
      active: true,
      services: initialServices,
      workSchedule: initialSchedule,
      blockedDates: [],
    });

    setNewProfName('');
    
    // Trigger toast notification from Print 2
    setShowSuccessToast(true);
    setTimeout(() => {
      setShowSuccessToast(false);
    }, 4500);

    // Keep it collapsed or expand based on ID
    setExpandedProfIds(prev => ({ ...prev, [created.id]: false }));
  };

  // Toggle professional active/inactive
  const handleToggleActive = (profId: string, active: boolean) => {
    updateProfessional(profId, { active });
  };

  // Toggle service for professional
  const handleToggleService = (profId: string, serviceId: string, enabled: boolean) => {
    const prof = biositeProfessionals.find(p => p.id === profId);
    if (!prof) return;

    const existingConfigs = prof.services || [];
    const index = existingConfigs.findIndex(s => s.serviceId === serviceId);

    let updatedConfigs;
    if (index >= 0) {
      updatedConfigs = existingConfigs.map((s, idx) => 
        idx === index ? { ...s, enabled } : s
      );
    } else {
      updatedConfigs = [...existingConfigs, { serviceId, enabled }];
    }

    updateProfessional(profId, { services: updatedConfigs });
  };

  // Toggle work day for professional
  const handleToggleDay = (profId: string, dayOfWeek: number, enabled: boolean) => {
    const prof = biositeProfessionals.find(p => p.id === profId);
    if (!prof) return;

    const existingSchedule = prof.workSchedule || [];
    const index = existingSchedule.findIndex(d => d.dayOfWeek === dayOfWeek);

    let updatedSchedule: ProfessionalDaySchedule[];
    if (index >= 0) {
      updatedSchedule = existingSchedule.map((d, idx) => 
        idx === index ? { ...d, enabled } : d
      );
    } else {
      const dayInfo = DAYS_OF_WEEK.find(d => d.index === dayOfWeek);
      updatedSchedule = [
        ...existingSchedule,
        {
          dayOfWeek,
          dayLabel: dayInfo?.label || '',
          enabled,
          startTime: '09:00',
          endTime: '18:00',
        }
      ];
    }

    updateProfessional(profId, { workSchedule: updatedSchedule });
  };

  // Update working hours for a day
  const handleWorkingHoursChange = (profId: string, dayOfWeek: number, startTime: string, endTime: string) => {
    const prof = biositeProfessionals.find(p => p.id === profId);
    if (!prof) return;

    const updatedSchedule = (prof.workSchedule || []).map(d => 
      d.dayOfWeek === dayOfWeek ? { ...d, startTime, endTime } : d
    );
    updateProfessional(profId, { workSchedule: updatedSchedule });
  };

  // Photo upload handler
  const handlePhotoUpload = async (profId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      showToast('Enviando foto diretamente para o Cloudinary...');
      const secureUrl = await uploadMediaFile(file);
      updateProfessional(profId, { photoUrl: secureUrl });
      showToast('Foto do profissional atualizada com sucesso!', 'success');
    } catch (err: any) {
      console.error('Erro no upload da foto do profissional:', err);
      showToast(`Erro ao enviar foto: ${err?.message || 'Falha no upload'}`, 'error');
    }
    e.target.value = '';
  };

  // Color picker handler
  const handleColorChange = (profId: string, color: string) => {
    updateProfessional(profId, { color });
  };

  // Block date handler
  const handleAddBlockDate = (profId: string) => {
    const dateVal = blockDateInputs[profId];
    if (!dateVal) return;

    const prof = biositeProfessionals.find(p => p.id === profId);
    if (!prof) return;

    const currentBlocks = prof.blockedDates || [];
    if (!currentBlocks.includes(dateVal)) {
      updateProfessional(profId, {
        blockedDates: [...currentBlocks, dateVal],
      });
    }

    setBlockDateInputs(prev => ({ ...prev, [profId]: '' }));
  };

  // Remove blocked date
  const handleRemoveBlockDate = (profId: string, dateStr: string) => {
    const prof = biositeProfessionals.find(p => p.id === profId);
    if (!prof) return;

    updateProfessional(profId, {
      blockedDates: (prof.blockedDates || []).filter(d => d !== dateStr),
    });
  };

  // Format date helper (YYYY-MM-DD to DD/MM/YYYY)
  const formatDisplayDate = (d: string) => {
    if (!d) return '';
    const parts = d.split('-');
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`;
    }
    return d;
  };

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6 font-sans select-none animate-in fade-in duration-200">
      
      {/* Toast Notification matching Print 2: Dark pill with close button + green checkmark */}
      {showSuccessToast && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="bg-[#0b1c14] border border-emerald-950/80 rounded-2xl px-4 py-2.5 shadow-2xl flex items-center gap-3 text-white">
            <button 
              onClick={() => setShowSuccessToast(false)}
              className="w-4 h-4 rounded-full border border-neutral-600 flex items-center justify-center text-[10px] text-neutral-400 hover:text-white transition cursor-pointer"
              title="Fechar"
            >
              ✕
            </button>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded-full bg-emerald-500 text-[#0b1c14] flex items-center justify-center text-[10px] font-black shrink-0">
                ✓
              </div>
              <span className="text-xs font-semibold text-white tracking-wide">
                Profissional adicionado ✓
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Top Banner Notice matching Print 1 & 2 */}
      <div className="bg-[#fff5f8] border border-[#fbcfe8] rounded-2xl p-4 sm:p-5 flex items-start gap-3 text-xs sm:text-[13px] text-neutral-700 leading-relaxed shadow-2xs">
        <span className="text-base shrink-0 select-none">💡</span>
        <p>
          Cadastre aqui os <strong className="font-bold text-neutral-900">profissionais</strong> (ex: cabeleireiros, manicures). Marque quais <strong className="font-bold text-neutral-900">serviços</strong> cada um faz e defina o <strong className="font-bold text-neutral-900">horário de trabalho</strong> deles. No mini-site, o cliente vai escolher o profissional antes de agendar.
        </p>
      </div>

      {/* Card: Novo profissional matching Print 1 & 2 */}
      <div className="bg-white rounded-2xl border border-neutral-200 p-5 shadow-2xs">
        <h3 className="text-xs sm:text-sm font-semibold text-neutral-800 mb-3">
          Novo profissional
        </h3>
        <form onSubmit={handleAddProfessional} className="flex items-center gap-2.5">
          <input
            type="text"
            value={newProfName}
            onChange={(e) => setNewProfName(e.target.value)}
            placeholder="Nome do profissional"
            className="flex-1 rounded-xl border border-neutral-300 px-4 py-2.5 text-xs sm:text-sm text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-neutral-400 bg-white transition"
          />
          <button
            type="submit"
            className="h-10 w-10 sm:h-11 sm:w-11 rounded-xl bg-[#bef264] hover:bg-[#aee625] text-neutral-900 flex items-center justify-center font-black transition cursor-pointer shadow-2xs shrink-0"
            title="Adicionar profissional"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </button>
        </form>
      </div>

      {/* Empty State when no professionals registered matching Print 1 */}
      {biositeProfessionals.length === 0 && (
        <div className="py-12 text-center text-xs sm:text-sm text-neutral-500 font-normal select-none">
          Nenhum profissional cadastrado.
        </div>
      )}

      {/* List of Professionals matching Print 2, 3, 4 */}
      {biositeProfessionals.length > 0 && (
        <div className="space-y-3">
          {biositeProfessionals.map((prof) => {
            const isExpanded = !!expandedProfIds[prof.id];

            // Calculate active services count
            const activeServicesCount = (prof.services || []).filter(s => s.enabled).length;

            // Calculate active work days count
            const activeDaysCount = (prof.workSchedule || []).filter(d => d.enabled).length;

            return (
              <div 
                key={prof.id}
                className="bg-white rounded-2xl border border-neutral-200 p-4 sm:p-5 shadow-2xs transition-all"
              >
                {/* Header Row matching Print 2, 3, 4 */}
                <div className="flex items-center justify-between gap-3">
                  {/* Left: Avatar + Name + Subtitle (Clickable to toggle expand) */}
                  <div 
                    onClick={() => toggleExpand(prof.id)}
                    className="flex items-center gap-3 flex-1 cursor-pointer min-w-0"
                  >
                    <div 
                      className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-xs overflow-hidden"
                      style={{ backgroundColor: prof.photoUrl ? 'transparent' : (prof.color || '#1d4ed8') }}
                    >
                      {prof.photoUrl ? (
                        <img src={prof.photoUrl} alt={prof.name} className="w-full h-full object-cover" />
                      ) : (
                        prof.name.trim().charAt(0).toUpperCase() || 'P'
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 truncate">
                        {prof.name}
                      </h4>
                      <p className="text-[11px] text-neutral-500">
                        {activeServicesCount} serviço(s) · {activeDaysCount} dia(s) trabalhando
                      </p>
                    </div>
                  </div>

                  {/* Right: Active Toggle Switch + Chevron + Trash Icon */}
                  <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                    <CustomToggle
                      checked={prof.active}
                      onChange={(checked) => handleToggleActive(prof.id, checked)}
                      size="md"
                      title={prof.active ? 'Profissional ativo' : 'Profissional inativo'}
                    />
                    <button
                      onClick={() => toggleExpand(prof.id)}
                      className="text-neutral-500 hover:text-neutral-800 p-1 rounded-md transition cursor-pointer"
                      title={isExpanded ? 'Recolher detalhes' : 'Expandir detalhes'}
                    >
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4" />
                      ) : (
                        <ChevronDown className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteProfessional(prof.id)}
                      className="text-neutral-400 hover:text-red-500 p-1 rounded-md transition cursor-pointer"
                      title="Excluir profissional"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Expanded Details matching Print 3 & 4 */}
                {isExpanded && (
                  <div className="mt-5 pt-5 border-t border-neutral-100 space-y-6 animate-in fade-in duration-200">
                    
                    {/* Foto (opcional) & Cor matching Print 3 */}
                    <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                      {/* Foto (opcional) */}
                      <div className="flex-1 w-full">
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                          Foto (opcional)
                        </label>
                        <div className="rounded-xl border border-neutral-200 px-3 py-2 flex items-center justify-between bg-white text-xs gap-2">
                          <label className="bg-neutral-100 hover:bg-neutral-200 text-neutral-800 px-3 py-1.5 rounded-lg border border-neutral-300 font-medium text-xs cursor-pointer transition shrink-0">
                            Escolher arquivo
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              ref={(el) => { fileInputRefs.current[prof.id] = el; }}
                              onChange={(e) => handlePhotoUpload(prof.id, e)}
                            />
                          </label>
                          <span className="text-neutral-500 text-xs truncate max-w-[240px]">
                            {prof.photoUrl ? 'Foto anexada' : 'Nenhum arquivo escolhido'}
                          </span>
                        </div>
                      </div>

                      {/* Cor */}
                      <div className="w-full sm:w-auto shrink-0">
                        <label className="text-[11px] font-semibold text-neutral-700 block mb-1.5">
                          Cor
                        </label>
                        <div className="flex items-center gap-2">
                          <label 
                            className="w-16 h-10 rounded-xl cursor-pointer border border-neutral-200 flex items-center justify-center transition shadow-2xs overflow-hidden relative"
                            style={{ backgroundColor: prof.color || '#1d4ed8' }}
                            title="Clique para alterar a cor do profissional"
                          >
                            <input
                              type="color"
                              value={prof.color || '#1d4ed8'}
                              onChange={(e) => handleColorChange(prof.id, e.target.value)}
                              className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                            />
                          </label>
                        </div>
                      </div>
                    </div>

                    {/* Serviços que atende matching Print 3 & 4 */}
                    <div>
                      <div className="mb-2.5">
                        <h5 className="text-xs font-semibold text-neutral-800">
                          Serviços que atende
                        </h5>
                        <p className="text-[11px] text-neutral-400">
                          Preço/duração em branco = usa o padrão do serviço.
                        </p>
                      </div>

                      <div className="space-y-2">
                        {biositeServices.map(service => {
                          const existingConfig = (prof.services || []).find(s => s.serviceId === service.id);
                          const isServiceEnabled = !!existingConfig?.enabled;

                          return (
                            <div
                              key={service.id}
                              className="rounded-2xl border border-neutral-200 p-3.5 bg-white flex items-center justify-between gap-3 shadow-2xs"
                            >
                              <div className="flex items-center gap-3">
                                <CustomToggle
                                  checked={isServiceEnabled}
                                  onChange={(checked) => handleToggleService(prof.id, service.id, checked)}
                                  size="md"
                                />
                                <div>
                                  <h6 className="text-xs font-semibold text-neutral-900">
                                    {service.name}
                                  </h6>
                                  <p className="text-[11px] text-neutral-500">
                                    padrão: {service.durationMinutes}min • R$ {service.price.toFixed(0)}
                                  </p>
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Horário de trabalho matching Print 3 & 4 */}
                    <div>
                      <div className="mb-3">
                        <h5 className="text-xs font-semibold text-neutral-800">
                          Horário de trabalho
                        </h5>
                        <p className="text-[11px] text-neutral-400">
                          Se todos os dias ficarem desativados, usa o horário geral da empresa.
                        </p>
                      </div>

                      <div className="space-y-2.5">
                        {DAYS_OF_WEEK.map((day) => {
                          const dayConfig = (prof.workSchedule || []).find(d => d.dayOfWeek === day.index);
                          const isDayEnabled = !!dayConfig?.enabled;

                          return (
                            <div key={day.index} className="flex items-center gap-4">
                              <span className="w-8 text-xs font-medium text-neutral-700">
                                {day.label}
                              </span>
                              <CustomToggle
                                checked={isDayEnabled}
                                onChange={(checked) => handleToggleDay(prof.id, day.index, checked)}
                                size="md"
                              />
                              {isDayEnabled && (
                                <div className="flex items-center gap-2 text-xs text-neutral-600 animate-in fade-in duration-150">
                                  <input
                                    type="time"
                                    value={dayConfig?.startTime || '09:00'}
                                    onChange={(e) => handleWorkingHoursChange(prof.id, day.index, e.target.value, dayConfig?.endTime || '18:00')}
                                    className="border border-neutral-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                                  />
                                  <span>às</span>
                                  <input
                                    type="time"
                                    value={dayConfig?.endTime || '18:00'}
                                    onChange={(e) => handleWorkingHoursChange(prof.id, day.index, dayConfig?.startTime || '09:00', e.target.value)}
                                    className="border border-neutral-200 rounded-lg px-2 py-1 text-xs bg-white focus:outline-none"
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Folgas / Bloqueios matching Print 4 */}
                    <div>
                      <h5 className="text-xs font-semibold text-neutral-800 mb-2">
                        Folgas / Bloqueios
                      </h5>
                      <div className="flex items-center gap-2">
                        <div className="relative flex-1">
                          <input
                            type="date"
                            value={blockDateInputs[prof.id] || ''}
                            onChange={(e) => setBlockDateInputs(prev => ({ ...prev, [prof.id]: e.target.value }))}
                            className="w-full rounded-xl border border-neutral-300 px-4 py-2 text-xs text-neutral-700 focus:outline-none focus:border-neutral-400 bg-white"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => handleAddBlockDate(prof.id)}
                          className="rounded-xl border border-neutral-300 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-neutral-50 flex items-center gap-1.5 transition cursor-pointer shrink-0 shadow-2xs"
                        >
                          <Ban className="w-3.5 h-3.5 text-neutral-500" />
                          <span>Bloquear dia</span>
                        </button>
                      </div>

                      {/* Blocked dates tags */}
                      {prof.blockedDates && prof.blockedDates.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {prof.blockedDates.map((dateStr) => (
                            <div
                              key={dateStr}
                              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-red-50 border border-red-200 text-red-700 text-xs font-medium"
                            >
                              <span>{formatDisplayDate(dateStr)}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveBlockDate(prof.id, dateStr)}
                                className="text-red-400 hover:text-red-700 font-bold ml-1 cursor-pointer"
                                title="Desbloquear data"
                              >
                                ✕
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
};
