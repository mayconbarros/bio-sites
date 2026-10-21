import React, { useState, useEffect, useMemo } from 'react';
import { Biosite, Service } from '../../types';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  Calendar as CalendarIcon, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check 
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface BookingModalProps {
  biosite: Biosite;
  services: Service[];
  preselectedServiceId?: string | null;
  isOpen: boolean;
  onClose: () => void;
  inline?: boolean;
}

const MONTH_NAMES = [
  'janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'
];

const WEEKDAY_NAMES = [
  'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira',
  'quinta-feira', 'sexta-feira', 'sábado'
];

const DEFAULT_TIME_SLOTS = [
  '08:00', '08:15', '08:30',
  '08:45', '09:00', '09:15',
  '09:30', '09:45', '10:00',
  '10:15', '10:30', '10:45',
  '11:00', '11:15', '11:30',
  '11:45', '12:00', '12:15',
  '12:30', '12:45', '13:00',
  '13:15', '13:30', '13:45',
  '14:00', '14:15', '14:30',
  '14:45', '15:00', '15:15',
  '15:30', '15:45', '16:00',
  '16:15', '16:30', '16:45',
  '17:00', '17:15', '17:30',
  '17:45', '18:00'
];

// Safe formatting helpers that will never throw TypeError
const safePriceDisplay = (price: any): string => {
  if (price === undefined || price === null || price === '') return '0,00';
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(',', '.'));
  if (isNaN(num)) return '0,00';
  return num.toFixed(2).replace('.', ',');
};

const hasValidPrice = (price: any): boolean => {
  if (price === undefined || price === null || price === '') return false;
  const num = typeof price === 'number' ? price : parseFloat(String(price).replace(',', '.'));
  return !isNaN(num) && num > 0;
};

const getSafeBlockedDays = (): Record<string, boolean> => {
  try {
    const saved = localStorage.getItem('biosaas_blocked_days');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return {
    '2026-08-02': true,
    '2026-08-09': true,
    '2026-08-16': true,
    '2026-08-23': true,
    '2026-08-30': true,
  };
};

const getSafeDaySlots = (): Record<string, string[]> => {
  try {
    const saved = localStorage.getItem('biosaas_day_slots');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch {}
  return {};
};

export const BookingModal: React.FC<BookingModalProps> = ({
  biosite,
  services,
  preselectedServiceId,
  isOpen,
  onClose,
  inline = false,
}) => {
  const { addAppointment, trackEvent } = useApp();

  // Modal Step (1: Escolha o serviço, 2: Escolha o dia, 3: Escolha o horário, 4: Seus dados, 5: Sucesso)
  const [step, setStep] = useState<number>(1);
  const [selectedService, setSelectedService] = useState<Service | null>(null);

  // Calendar State (Defaulting to August 2026 as in reference Print 3)
  const [calYear, setCalYear] = useState<number>(2026);
  const [calMonth, setCalMonth] = useState<number>(7); // 7 = agosto (0-indexed)
  const [selectedDay, setSelectedDay] = useState<number>(5); // 05 de agosto
  const [selectedDate, setSelectedDate] = useState<string>('2026-08-05');
  const [selectedTime, setSelectedTime] = useState<string>('10:30');

  // Customer Form State
  const [customerName, setCustomerName] = useState<string>('Alex');
  const [customerPhone, setCustomerPhone] = useState<string>('(11) 99999-0000');
  const [customerNotes, setCustomerNotes] = useState<string>('');

  // Blocked days & custom slots state with safe initialization
  const [blockedDaysMap, setBlockedDaysMap] = useState<Record<string, boolean>>(getSafeBlockedDays);
  const [daySlotsMap, setDaySlotsMap] = useState<Record<string, string[]>>(getSafeDaySlots);

  // Fallback default services matching print 2
  const fallbackServices: Service[] = useMemo(() => [
    {
      id: 'srv-soft-gel',
      biositeId: biosite?.id || 'bio-bella-nails',
      name: 'Alongamento Soft Gel',
      description: '',
      category: 'Alongamento',
      durationMinutes: 60,
      price: 150,
      images: [],
      orderIndex: 0,
      active: true,
    },
    {
      id: 'srv-molde-f1',
      biositeId: biosite?.id || 'bio-bella-nails',
      name: 'Alongamento Molde F1',
      description: '',
      category: 'Alongamento',
      durationMinutes: 60,
      price: 150,
      images: [],
      orderIndex: 1,
      active: true,
    },
    {
      id: 'srv-fibra-vidro',
      biositeId: biosite?.id || 'bio-bella-nails',
      name: 'Alongamento em Fibra de Vidro',
      description: '',
      category: 'Alongamento',
      durationMinutes: 60,
      price: 150,
      images: [],
      orderIndex: 2,
      active: true,
    },
  ], [biosite?.id]);

  // Safe active services
  const activeServices: Service[] = useMemo(() => {
    if (Array.isArray(services) && services.length > 0) {
      const filtered = services.filter(s => s && s.active !== false);
      if (filtered.length > 0) return filtered;
    }
    return fallbackServices;
  }, [services, fallbackServices]);

  // Track previous isOpen state so step is ONLY initialized when opening the modal (false -> true)
  const prevIsOpenRef = React.useRef(false);

  // Re-read availability and set initial step ONLY when modal opens
  useEffect(() => {
    if (isOpen && !prevIsOpenRef.current) {
      setBlockedDaysMap(getSafeBlockedDays());
      setDaySlotsMap(getSafeDaySlots());

      if (preselectedServiceId && Array.isArray(activeServices)) {
        const found = activeServices.find(s => s && s.id === preselectedServiceId);
        if (found) {
          setSelectedService(found);
          setStep(2);
          prevIsOpenRef.current = isOpen;
          return;
        }
      }
      setStep(1);
    }
    prevIsOpenRef.current = isOpen;
  }, [isOpen, preselectedServiceId]);

  if (!isOpen) return null;

  // Format full date safely: "quarta-feira, 05 de agosto às 10:30"
  const formatFullDate = (dateStr: string, timeStr: string) => {
    try {
      if (!dateStr) return '';
      const parts = dateStr.split('-');
      if (parts.length !== 3) return `${dateStr} às ${timeStr}`;
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1;
      const day = parseInt(parts[2], 10);
      const d = new Date(year, month, day);

      const dayOfWeekName = WEEKDAY_NAMES[d.getDay()] || 'quarta-feira';
      const monthName = MONTH_NAMES[month] || 'agosto';
      const formattedDay = String(day).padStart(2, '0');

      return `${dayOfWeekName}, ${formattedDay} de ${monthName} às ${timeStr}`;
    } catch {
      return `${dateStr} às ${timeStr}`;
    }
  };

  // Safe check if day is blocked
  const isDateBlocked = (dateKey: string, isSunday: boolean): boolean => {
    if (blockedDaysMap && typeof blockedDaysMap === 'object' && blockedDaysMap[dateKey]) {
      return true;
    }
    return isSunday;
  };

  // Generate 42 calendar grid cells matching Print 3
  const getCalendarCells = () => {
    const cells: {
      day: number;
      dateKey: string;
      isCurrentMonth: boolean;
      isAvailable: boolean;
      isSelected: boolean;
    }[] = [];

    const firstDayIndex = new Date(calYear, calMonth, 1).getDay(); // 0 = Dom, 6 = Sáb
    const daysInCurrentMonth = new Date(calYear, calMonth + 1, 0).getDate();
    const daysInPrevMonth = new Date(calYear, calMonth, 0).getDate();

    // Previous month filler days
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const day = daysInPrevMonth - i;
      const prevMonth = calMonth === 0 ? 11 : calMonth - 1;
      const prevYear = calMonth === 0 ? calYear - 1 : calYear;
      const dateKey = `${prevYear}-${String(prevMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        dateKey,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
      });
    }

    // Current month days
    for (let day = 1; day <= daysInCurrentMonth; day++) {
      const dateKey = `${calYear}-${String(calMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      const d = new Date(calYear, calMonth, day);
      const isSunday = d.getDay() === 0;
      const isBlocked = isDateBlocked(dateKey, isSunday);
      const isSelected = selectedDate === dateKey;

      cells.push({
        day,
        dateKey,
        isCurrentMonth: true,
        isAvailable: !isBlocked,
        isSelected,
      });
    }

    // Next month filler days (fill up to 42 cells)
    const remaining = 42 - cells.length;
    for (let day = 1; day <= remaining; day++) {
      const nextMonth = calMonth === 11 ? 0 : calMonth + 1;
      const nextYear = calMonth === 11 ? calYear + 1 : calYear;
      const dateKey = `${nextYear}-${String(nextMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
      cells.push({
        day,
        dateKey,
        isCurrentMonth: false,
        isAvailable: false,
        isSelected: false,
      });
    }

    return cells;
  };

  // Safe phone mask
  const handlePhoneChange = (val: string) => {
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

  // Determine available time slots for the selected date
  const availableTimeSlots = () => {
    try {
      if (daySlotsMap && typeof daySlotsMap === 'object' && Array.isArray(daySlotsMap[selectedDate])) {
        const configuredSlots = daySlotsMap[selectedDate];
        if (configuredSlots.length > 0) {
          const expanded: string[] = [];
          configuredSlots.forEach(s => {
            if (typeof s === 'string' && s.includes(':')) {
              const [h] = s.split(':');
              expanded.push(`${h}:00`, `${h}:15`, `${h}:30`, `${h}:45`);
            }
          });
          if (expanded.length > 0) return expanded;
        }
      }
    } catch {}
    return DEFAULT_TIME_SLOTS;
  };

  // Submit booking
  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) return;

    const srv = selectedService || activeServices[0];
    if (!srv) return;

    try {
      addAppointment({
        biositeId: biosite?.id || 'bio-bella-nails',
        serviceId: srv.id,
        serviceName: srv.name,
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        appointmentDate: selectedDate,
        appointmentTime: selectedTime,
        durationMinutes: srv.durationMinutes || 60,
        totalPrice: typeof srv.price === 'number' ? srv.price : parseFloat(String(srv.price || 0)) || 0,
        customerNotes: customerNotes.trim(),
        status: 'pending',
      });
    } catch (err) {
      console.warn('Could not add appointment:', err);
    }

    try {
      trackEvent(biosite?.id || 'bio-bella-nails', 'booking_complete', srv.id);
    } catch {}

    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 },
      });
    } catch {}

    setStep(5);
  };

  const modalBody = (
    <>
      {/* Header matching all reference prints (hidden in inline accordion) */}
      {!inline && (
        <div className="flex items-center justify-between pb-3">
          <div className="flex items-center gap-2">
            <CalendarIcon className="w-5 h-5 text-neutral-900 stroke-[2]" />
            <h3 className="font-bold text-sm sm:text-base text-neutral-900 tracking-tight">
              Agendar em {biosite?.title || 'Mayrah - Esmalteria Vip'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-6 h-6 rounded-full border border-neutral-300 hover:border-neutral-500 text-neutral-400 hover:text-neutral-800 flex items-center justify-center transition cursor-pointer"
            title="Fechar"
          >
            <X className="w-3.5 h-3.5 stroke-[2.5]" />
          </button>
        </div>
      )}

      {/* STEP 1: Escolha o serviço (Print 2 & Accordion print) */}
      {step === 1 && (
        <div className="space-y-3 pt-1">
          <span className="text-xs sm:text-sm text-neutral-800 font-medium block text-left">
            Escolha o serviço:
          </span>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {activeServices.map(srv => {
              const priceFormatted = safePriceDisplay(srv.price);
              const showPrice = hasValidPrice(srv.price);

              return (
                <button
                  key={srv.id}
                  type="button"
                  onClick={() => {
                    setSelectedService(srv);
                    setStep(2);
                  }}
                  className="w-full text-left p-3.5 sm:p-4 rounded-xl border border-neutral-200 hover:border-neutral-300 bg-white transition cursor-pointer shadow-2xs group flex flex-col justify-center"
                >
                  <h4 className="text-xs sm:text-sm font-semibold text-neutral-900 group-hover:text-black">
                    {srv.name}
                  </h4>
                  <div className="flex items-center gap-1.5 text-[11px] sm:text-xs text-neutral-500 mt-1">
                    <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                    <span>{srv.durationMinutes || 60} min</span>
                    {showPrice && (
                      <>
                        <span>·</span>
                        <span>R$ {priceFormatted}</span>
                      </>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

        {/* STEP 2: Escolha o dia (Print 3) */}
        {step === 2 && (
          <div className="space-y-3 pt-1">
            <span className="text-xs text-neutral-800 font-semibold block">
              Escolha o dia
            </span>

            {/* Calendar Box matching Print 3 */}
            <div className="border border-neutral-200 rounded-2xl p-3 sm:p-4 bg-white shadow-2xs">
              
              {/* Month Navigator: [ < ] agosto 2026 [ > ] */}
              <div className="flex items-center justify-between pb-2">
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
                  className="w-7 h-7 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <span className="text-xs font-bold text-neutral-900 lowercase select-none">
                  {MONTH_NAMES[calMonth] || 'agosto'} {calYear}
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
                  className="w-7 h-7 rounded-lg border border-neutral-200 hover:bg-neutral-100 flex items-center justify-center text-neutral-600 transition cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>

              {/* Day of Week Headers: dom, seg, ter, qua, qui, sex, sab */}
              <div className="grid grid-cols-7 text-center text-xs text-neutral-700 font-medium py-1.5 select-none">
                {['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sab'].map(d => (
                  <span key={d}>{d}</span>
                ))}
              </div>

              {/* 42-cell Grid */}
              <div className="grid grid-cols-7 text-center gap-1 pt-1">
                {getCalendarCells().map((cell, idx) => {
                  if (!cell.isCurrentMonth) {
                    return (
                      <div
                        key={idx}
                        className="h-8 sm:h-9 flex items-center justify-center text-xs text-neutral-300 font-normal select-none"
                      >
                        {cell.day}
                      </div>
                    );
                  }

                  const isBlocked = !cell.isAvailable;
                  const isDayOne = cell.day === 1; // Highlighted day 1 matching Print 3

                  let styleClass = "text-neutral-800 hover:bg-neutral-100 cursor-pointer font-medium";
                  if (cell.isSelected) {
                    styleClass = "bg-[#ff2a85] text-white font-bold rounded-xl shadow-xs cursor-pointer";
                  } else if (isDayOne && !cell.isSelected) {
                    // Soft purple badge on day 1 matching Print 3
                    styleClass = "bg-[#818cf8] text-white font-bold rounded-xl shadow-xs cursor-pointer";
                  } else if (isBlocked) {
                    styleClass = "text-neutral-300 cursor-not-allowed";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => {
                        setSelectedDay(cell.day);
                        setSelectedDate(cell.dateKey);
                        setStep(3);
                      }}
                      className={`h-8 sm:h-9 rounded-xl flex items-center justify-center text-xs transition ${styleClass}`}
                    >
                      <span>{cell.day}</span>
                    </button>
                  );
                })}
              </div>

              {/* Bottom notice matching Print 3 */}
              <p className="text-[11px] text-neutral-500 text-center pt-3 select-none">
                Só aparecem os dias que a empresa liberou.
              </p>
            </div>

            {/* Back button */}
            <div className="pt-1">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs font-semibold text-neutral-800 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
              >
                <span>← Voltar</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Escolha o horário (Print 4) */}
        {step === 3 && (
          <div className="space-y-3 pt-1">
            <span className="text-xs text-neutral-800 font-semibold block">
              Escolha o horário
            </span>

            {/* Grid of 3 columns of pink time buttons matching Print 4 */}
            <div className="grid grid-cols-3 gap-2.5 max-h-[320px] overflow-y-auto pr-1 py-1">
              {availableTimeSlots().map(time => (
                <button
                  key={time}
                  type="button"
                  onClick={() => {
                    setSelectedTime(time);
                    setStep(4);
                  }}
                  className="py-2.5 px-2 rounded-2xl bg-[#ff2a85] hover:bg-[#e62075] text-white font-bold text-xs tracking-wider shadow-2xs transition cursor-pointer text-center active:scale-95"
                >
                  {time}
                </button>
              ))}
            </div>

            {/* Back button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="text-xs font-semibold text-neutral-800 hover:text-neutral-900 flex items-center gap-1 transition cursor-pointer"
              >
                <span>← Voltar</span>
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: Seus dados para confirmar (Print 5) */}
        {step === 4 && (
          <form onSubmit={handleConfirm} className="space-y-3.5 pt-1">
            <span className="text-xs text-neutral-800 font-semibold block">
              Seus dados para confirmar
            </span>

            {/* Gray Summary Box matching Print 5 */}
            <div className="bg-neutral-100 rounded-2xl p-3 sm:p-3.5 space-y-0.5">
              <h5 className="font-bold text-xs sm:text-sm text-neutral-900">
                {(selectedService?.name || activeServices[0]?.name || 'Alongamento Soft Gel')} · {(selectedService?.durationMinutes || activeServices[0]?.durationMinutes || 60)}min · R$ {safePriceDisplay(selectedService?.price || activeServices[0]?.price || 150)}
              </h5>
              <p className="text-xs text-neutral-600">
                {formatFullDate(selectedDate, selectedTime)}
              </p>
            </div>

            {/* Form Fields matching Print 5 */}
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">
                  Nome*
                </label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="Seu nome"
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none focus:border-neutral-500 bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">
                  Telefone
                </label>
                <input
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => handlePhoneChange(e.target.value)}
                  placeholder="(11) 99999-0000"
                  className="w-full rounded-xl border-2 border-neutral-800 px-3.5 py-2 text-xs sm:text-sm text-neutral-900 focus:outline-none bg-white font-mono"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-neutral-800 block mb-1">
                  Observações
                </label>
                <textarea
                  value={customerNotes}
                  onChange={(e) => setCustomerNotes(e.target.value)}
                  placeholder=""
                  className="w-full rounded-xl border border-neutral-300 px-3.5 py-2 text-xs text-neutral-900 focus:outline-none focus:border-neutral-500 bg-white h-20 resize-none"
                />
              </div>
            </div>

            {/* Bottom Actions Row matching Print 5 */}
            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="rounded-xl border border-neutral-300 px-4 py-2.5 text-xs font-semibold text-neutral-800 hover:bg-neutral-50 transition cursor-pointer shrink-0"
              >
                ← Voltar
              </button>

              <button
                type="submit"
                className="flex-1 py-2.5 px-4 rounded-xl bg-[#ff2a85] hover:bg-[#e62075] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md transition cursor-pointer"
              >
                <Check className="w-4 h-4 stroke-[2.5]" />
                <span>Confirmar agendamento</span>
              </button>
            </div>
          </form>
        )}

        {/* STEP 5: Agendamento confirmado! (Print 6) */}
        {step === 5 && (
          <div className="text-center py-5 space-y-4 animate-in zoom-in-95 duration-200">
            {/* Big pink circle with white checkmark matching Print 6 */}
            <div className="w-16 h-16 rounded-full bg-[#ff2a85] text-white flex items-center justify-center mx-auto shadow-md">
              <Check className="w-9 h-9 stroke-[3]" />
            </div>

            <div className="space-y-1">
              <h4 className="text-base sm:text-lg font-bold text-neutral-900">
                Agendamento confirmado!
              </h4>
              <p className="text-xs sm:text-sm text-neutral-600">
                {formatFullDate(selectedDate, selectedTime)}
              </p>
            </div>

            {/* Fechar button matching Print 6 */}
            <div className="pt-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  setStep(1);
                }}
                className="w-full py-3 rounded-xl bg-[#ff2a85] hover:bg-[#e62075] text-white font-bold text-xs sm:text-sm shadow-md transition cursor-pointer text-center"
              >
                Fechar
              </button>
            </div>
          </div>
        )}
    </>
  );

  if (inline) {
    return (
      <div className="w-full text-neutral-900">
        {modalBody}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-[360px] sm:max-w-[420px] bg-white rounded-3xl p-5 sm:p-6 shadow-2xl relative border border-neutral-100 text-neutral-900 animate-in zoom-in-95 duration-200">
        {modalBody}
      </div>
    </div>
  );
};
