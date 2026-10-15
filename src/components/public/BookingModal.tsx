import React, { useState } from 'react';
import { Biosite, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Phone, 
  FileText, 
  CheckCircle2, 
  ChevronRight, 
  MessageCircle,
  Sparkles
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  biosite: Biosite;
  services: Service[];
  preselectedServiceId?: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  biosite,
  services,
  preselectedServiceId,
  isOpen,
  onClose,
}) => {
  const { addAppointment, trackEvent } = useApp();

  const [step, setStep] = useState<number>(preselectedServiceId ? 2 : 1);
  const [selectedServiceId, setSelectedServiceId] = useState<string>(preselectedServiceId || (services[0]?.id || ''));
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedTime, setSelectedTime] = useState<string>('14:00');
  const [customerName, setCustomerName] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('');
  const [customerNotes, setCustomerNotes] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [bookedAppointment, setBookedAppointment] = useState<any>(null);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];

  // Available sample time slots
  const timeSlots = [
    '09:00', '09:45', '10:30', '11:15', '13:30', 
    '14:15', '15:00', '16:00', '17:00', '18:00', '19:00'
  ];

  // Next 7 available days
  const getNextDays = () => {
    const days = [];
    const today = new Date();
    for (let i = 0; i < 7; i++) {
      const d = new Date();
      d.setDate(today.getDate() + i);
      const dayOfWeek = d.getDay();
      const isSunday = dayOfWeek === 0;
      days.push({
        fullDate: d.toISOString().split('T')[0],
        dayNumber: d.getDate(),
        dayLabel: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][dayOfWeek],
        isClosed: isSunday,
      });
    }
    return days;
  };

  const handlePhoneChange = (val: string) => {
    // Basic Brazilian phone mask (XX) 9XXXX-XXXX
    let cleaned = val.replace(/\D/g, '').substring(0, 11);
    if (cleaned.length > 10) {
      cleaned = cleaned.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
    } else if (cleaned.length > 6) {
      cleaned = cleaned.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3');
    } else if (cleaned.length > 2) {
      cleaned = cleaned.replace(/^(\d{2})(\d{0,5})/, '($1) $2');
    }
    setCustomerPhone(cleaned);
  };

  const handleConfirmBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      return;
    }

    const price = currentService?.promotionalPrice || currentService?.price || 0;

    const appointment = addAppointment({
      biositeId: biosite.id,
      serviceId: currentService.id,
      serviceName: currentService.name,
      customerName,
      customerPhone,
      appointmentDate: selectedDate,
      appointmentTime: selectedTime,
      durationMinutes: currentService.durationMinutes,
      totalPrice: price,
      customerNotes,
      status: 'pending',
    });

    setBookedAppointment(appointment);
    setIsSuccess(true);
    trackEvent(biosite.id, 'booking_complete', currentService.id);

    // Trigger celebration confetti
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });
    } catch {
      // safe fallback
    }
  };

  const handleWhatsAppNotify = () => {
    if (!bookedAppointment) return;
    const phoneClean = biosite.clientPhone.replace(/\D/g, '');
    const dateFormatted = selectedDate.split('-').reverse().join('/');
    const text = encodeURIComponent(
      `Olá! Meu nome é ${customerName}. Acabei de solicitar o agendamento de *${currentService.name}* para o dia *${dateFormatted}* às *${selectedTime}* pelo seu Bio Site! Poderia confirmar por favor?`
    );
    window.open(`https://api.whatsapp.com/send?phone=55${phoneClean}&text=${text}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="w-full max-w-lg overflow-hidden rounded-3xl bg-neutral-900 border border-neutral-800 text-neutral-100 shadow-2xl flex flex-col max-h-[90vh]"
        style={{
          boxShadow: `0 20px 40px -15px ${biosite.themeConfig.primaryColor}33`,
        }}
      >
        {/* Header */}
        <div className="relative p-5 border-b border-neutral-800 flex items-center justify-between bg-neutral-950/60">
          <div>
            <span className="text-xs uppercase tracking-wider font-semibold text-emerald-400 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Agendamento Online
            </span>
            <h3 className="text-lg font-bold text-white mt-0.5">
              {biosite.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto space-y-6 flex-1">
          {isSuccess ? (
            <div className="text-center py-6 space-y-5 animate-in zoom-in-95 duration-300">
              <div 
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center"
                style={{ backgroundColor: `${biosite.themeConfig.primaryColor}22` }}
              >
                <CheckCircle2 
                  className="w-10 h-10" 
                  style={{ color: biosite.themeConfig.primaryColor }}
                />
              </div>

              <div>
                <h4 className="text-xl font-bold text-white">Agendamento Solicitado!</h4>
                <p className="text-sm text-neutral-400 mt-1">
                  Seu horário foi reservado no sistema do estabelecimento.
                </p>
              </div>

              {/* Summary card */}
              <div className="p-4 rounded-2xl bg-neutral-800/80 border border-neutral-700/80 text-left space-y-3 text-sm">
                <div className="flex justify-between pb-2 border-b border-neutral-700/50">
                  <span className="text-neutral-400">Serviço:</span>
                  <span className="font-semibold text-white">{currentService?.name}</span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-700/50">
                  <span className="text-neutral-400">Data e Horário:</span>
                  <span className="font-semibold text-white">
                    {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                  </span>
                </div>
                <div className="flex justify-between pb-2 border-b border-neutral-700/50">
                  <span className="text-neutral-400">Duração Estimada:</span>
                  <span className="font-semibold text-white">{currentService?.durationMinutes} min</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Valor Previsto:</span>
                  <span className="font-bold text-emerald-400">
                    R$ {(currentService?.promotionalPrice || currentService?.price || 0).toFixed(2).replace('.', ',')}
                  </span>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <button
                  onClick={handleWhatsAppNotify}
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-500 transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-900/30"
                >
                  <MessageCircle className="w-5 h-5" />
                  Avisar no WhatsApp Agora
                </button>
                <button
                  onClick={onClose}
                  className="w-full py-2.5 px-4 rounded-xl font-medium text-neutral-400 hover:text-white bg-neutral-800/50 hover:bg-neutral-800 transition text-sm"
                >
                  Fechar Janela
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Step indicator */}
              <div className="flex items-center justify-between text-xs text-neutral-400 px-2">
                <span className={`font-semibold ${step >= 1 ? 'text-white' : ''}`}>1. Serviço</span>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className={`font-semibold ${step >= 2 ? 'text-white' : ''}`}>2. Data & Horário</span>
                <ChevronRight className="w-3 h-3 text-neutral-600" />
                <span className={`font-semibold ${step >= 3 ? 'text-white' : ''}`}>3. Seus Dados</span>
              </div>

              {/* STEP 1: Choose Service */}
              {step === 1 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-neutral-300">
                    Selecione o serviço desejado:
                  </label>
                  <div className="space-y-2">
                    {services.map(svc => {
                      const isSelected = selectedServiceId === svc.id;
                      return (
                        <div
                          key={svc.id}
                          onClick={() => setSelectedServiceId(svc.id)}
                          className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between ${
                            isSelected 
                              ? 'border-neutral-200 bg-neutral-800/90 text-white' 
                              : 'border-neutral-800 bg-neutral-900/60 hover:bg-neutral-800/50 text-neutral-300'
                          }`}
                        >
                          <div>
                            <div className="font-semibold text-white">{svc.name}</div>
                            <div className="text-xs text-neutral-400 flex items-center gap-2 mt-0.5">
                              <span>⏱️ {svc.durationMinutes} min</span>
                              <span>•</span>
                              <span>{svc.category}</span>
                            </div>
                          </div>
                          <div className="text-right">
                            {svc.promotionalPrice ? (
                              <div>
                                <span className="text-xs text-neutral-500 line-through block">
                                  R$ {svc.price.toFixed(2).replace('.', ',')}
                                </span>
                                <span className="font-bold text-emerald-400">
                                  R$ {svc.promotionalPrice.toFixed(2).replace('.', ',')}
                                </span>
                              </div>
                            ) : (
                              <span className="font-bold text-emerald-400">
                                R$ {svc.price.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <button
                    onClick={() => setStep(2)}
                    className="w-full mt-4 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
                    style={{ backgroundColor: biosite.themeConfig.primaryColor }}
                  >
                    Próximo: Escolher Horário
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* STEP 2: Choose Date & Time */}
              {step === 2 && (
                <div className="space-y-5">
                  {/* Selected service pill */}
                  <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-neutral-400 block">Serviço:</span>
                      <strong className="text-white text-sm">{currentService.name}</strong>
                    </div>
                    <button 
                      onClick={() => setStep(1)} 
                      className="text-xs font-medium underline text-neutral-400 hover:text-white"
                    >
                      Alterar
                    </button>
                  </div>

                  {/* Day Picker */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2.5">
                      <CalendarIcon className="w-3.5 h-3.5" />
                      Selecione o Dia
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {getNextDays().map(day => {
                        const isSelected = selectedDate === day.fullDate;
                        return (
                          <button
                            key={day.fullDate}
                            type="button"
                            disabled={day.isClosed}
                            onClick={() => setSelectedDate(day.fullDate)}
                            className={`p-2.5 rounded-xl border flex flex-col items-center justify-center transition text-center ${
                              day.isClosed 
                                ? 'opacity-30 cursor-not-allowed border-neutral-800 bg-neutral-900' 
                                : isSelected 
                                  ? 'border-white bg-white text-black font-bold shadow-md' 
                                  : 'border-neutral-800 bg-neutral-800/50 hover:bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            <span className="text-[11px] uppercase">{day.dayLabel}</span>
                            <span className="text-lg font-bold">{day.dayNumber}</span>
                            {day.isClosed && <span className="text-[9px] text-red-400">Fechado</span>}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Time Slot Picker */}
                  <div>
                    <label className="text-xs font-semibold uppercase tracking-wider text-neutral-400 flex items-center gap-1.5 mb-2.5">
                      <Clock className="w-3.5 h-3.5" />
                      Horários Disponíveis
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {timeSlots.map(time => {
                        const isSelected = selectedTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedTime(time)}
                            className={`py-2 rounded-xl text-xs font-semibold border transition ${
                              isSelected 
                                ? 'border-emerald-400 bg-emerald-500/20 text-emerald-300 shadow' 
                                : 'border-neutral-800 bg-neutral-800/40 hover:bg-neutral-800 text-neutral-300'
                            }`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="w-1/3 py-3 rounded-xl font-medium text-neutral-400 hover:text-white bg-neutral-800 transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="w-2/3 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2"
                      style={{ backgroundColor: biosite.themeConfig.primaryColor }}
                    >
                      Avançar para Seus Dados
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: Customer Information */}
              {step === 3 && (
                <form onSubmit={handleConfirmBooking} className="space-y-4">
                  <div className="p-3 rounded-xl bg-neutral-800/60 border border-neutral-700/60 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Serviço:</span>
                      <strong className="text-white">{currentService.name}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-neutral-400">Data e Hora:</span>
                      <strong className="text-white">
                        {selectedDate.split('-').reverse().join('/')} às {selectedTime}
                      </strong>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5 mb-1.5">
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      Seu Nome Completo *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Gabriela Silva"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5 mb-1.5">
                      <Phone className="w-3.5 h-3.5 text-neutral-400" />
                      Seu WhatsApp *
                    </label>
                    <input
                      type="tel"
                      required
                      placeholder="(11) 99999-9999"
                      value={customerPhone}
                      onChange={e => handlePhoneChange(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition text-sm"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-medium text-neutral-300 flex items-center gap-1.5 mb-1.5">
                      <FileText className="w-3.5 h-3.5 text-neutral-400" />
                      Observações ou Preferências (Opcional)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Ex: Preferência por esmalte escuro / francesinha..."
                      value={customerNotes}
                      onChange={e => setCustomerNotes(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl bg-neutral-800 border border-neutral-700 text-white placeholder-neutral-500 focus:outline-none focus:border-emerald-400 transition text-sm resize-none"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-1/3 py-3 rounded-xl font-medium text-neutral-400 hover:text-white bg-neutral-800 transition"
                    >
                      Voltar
                    </button>
                    <button
                      type="submit"
                      className="w-2/3 py-3 rounded-xl font-bold text-white transition flex items-center justify-center gap-2 shadow-lg"
                      style={{ backgroundColor: biosite.themeConfig.primaryColor }}
                    >
                      Confirmar Agendamento
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
