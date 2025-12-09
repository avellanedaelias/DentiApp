import React, { useState, useEffect } from 'react';
import { ViewState, TimeSlot, TreatmentType, User, Doctor, Appointment } from '../types';
import { Button } from './Button';
import { ChevronLeft, CheckCircle, Calendar as CalendarIcon, AlertTriangle, User as UserIcon, Star, Lock } from 'lucide-react';
import { appointmentService, doctorService } from '../services/api';

interface BookingProps {
  onChangeView: (view: ViewState) => void;
  user: User;
}

export const Booking: React.FC<BookingProps> = ({ onChangeView, user }) => {
  // State for Data
  const [treatments, setTreatments] = useState<TreatmentType[]>([]);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [activeTreatments, setActiveTreatments] = useState<string[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Step 1: Treatment, 2: Doctor, 3: Date/Time, 4: Confirm
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [selectedTreatment, setSelectedTreatment] = useState<string | null>(null);
  const [selectedDoctor, setSelectedDoctor] = useState<string | null>(null); // 'any' or doctorId
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [generatedSlots, setGeneratedSlots] = useState<TimeSlot[]>([]);
  const [dayAppointments, setDayAppointments] = useState<Appointment[]>([]); // Turnos existentes del día
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [finalDoctorId, setFinalDoctorId] = useState<string | null>(null); // For summary

  // Load Data on Mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [tData, dData, userAppointments] = await Promise.all([
          doctorService.getTreatments(),
          doctorService.getAll(),
          appointmentService.getByUser(user.id)
        ]);
        
        setTreatments(tData);
        setDoctors(dData);

        // Identificar tratamientos con turnos activos (no completados)
        const active = userAppointments
          .filter(a => a.status !== 'completed' && a.status !== 'cancelled' as any) 
          .map(a => a.treatment);
        
        setActiveTreatments(active);

      } catch (e) {
        setError("Error cargando datos. Por favor reintente.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user.id]);

  // Cargar turnos del día seleccionado
  useEffect(() => {
    const loadDayAppointments = async () => {
      if (!selectedDate) return;
      setLoadingSlots(true);
      try {
        const appts = await appointmentService.getAllByDate(selectedDate);
        // Filtramos solo los confirmados para calcular ocupación
        const confirmed = appts.filter(a => a.status === 'confirmed');
        setDayAppointments(confirmed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingSlots(false);
      }
    };

    loadDayAppointments();
  }, [selectedDate]);

  // Helper: Convertir "HH:mm" a minutos desde medianoche
  const timeToMinutes = (time: string) => {
    const [h, m] = time.split(':').map(Number);
    return h * 60 + m;
  };

  // Helper: Generar TimeSlots dinámicos
  const generateSlotsForDate = () => {
    if (!selectedDate || !selectedTreatment) return [];
    if (loadingSlots) return []; // Esperar a que carguen los turnos existentes

    const dateObj = new Date(selectedDate);
    // getDay returns 0 for Sunday, we match with our Doctor DaySchedule (0=Sun)
    const dayOfWeek = dateObj.getUTCDay(); 

    // Obtener duración del tratamiento seleccionado
    const selectedTreatmentObj = treatments.find(t => t.id === selectedTreatment);
    const newDuration = selectedTreatmentObj ? selectedTreatmentObj.duration : 30;

    // Find relevant doctors
    let candidateDoctors: Doctor[] = [];
    if (selectedDoctor && selectedDoctor !== 'any') {
      const doc = doctors.find(d => d.id === selectedDoctor);
      if (doc) candidateDoctors = [doc];
    } else {
      // All doctors that do this treatment
      candidateDoctors = doctors.filter(d => d.specialties.includes(selectedTreatment));
    }

    // Filter doctors who are blocked (Licencia) on this date
    candidateDoctors = candidateDoctors.filter(doc => {
      const isBlocked = doc.blockedDates.some(range => {
         const start = new Date(range.startDate);
         const end = new Date(range.endDate);
         const check = new Date(selectedDate);
         return check >= start && check <= end;
      });
      return !isBlocked;
    });

    const slotsMap = new Set<string>();

    candidateDoctors.forEach(doc => {
      const schedule = doc.schedule.find(s => s.dayOfWeek === dayOfWeek);
      if (schedule && schedule.isWorking) {
         
         // Buscar turnos existentes de ESTE doctor para ESTE día
         // IMPORTANTE: Ahora comparamos por ID
         const doctorAppts = dayAppointments.filter(a => a.doctorId === doc.id);

         let currentTime = schedule.startTime;
         const endTimeMinutes = timeToMinutes(schedule.endTime);

         while (timeToMinutes(currentTime) < endTimeMinutes) {
            const currentSlotMinutes = timeToMinutes(currentTime);
            const currentSlotEnd = currentSlotMinutes + newDuration; // Hora fin del potencial nuevo turno

            // Si el turno termina después del horario de salida del doctor, no es válido
            if (currentSlotEnd > endTimeMinutes) {
                 // Siguiente slot
                 const [h, m] = currentTime.split(':').map(Number);
                 const d = new Date();
                 d.setHours(h, m + 30);
                 currentTime = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
                 continue;
            }
            
            // Verificar si este slot choca con algún turno existente
            const isOccupied = doctorAppts.some(appt => {
              const apptStart = timeToMinutes(appt.time);
              // Buscar duración del tratamiento de ese turno existente
              const treat = treatments.find(t => t.name === appt.treatment);
              const existingDuration = treat ? treat.duration : 30;
              const apptEnd = apptStart + existingDuration;

              // Lógica de Solapamiento de Intervalos:
              // max(StartA, StartB) < min(EndA, EndB)
              return Math.max(currentSlotMinutes, apptStart) < Math.min(currentSlotEnd, apptEnd);
            });

            if (!isOccupied) {
               slotsMap.add(currentTime);
            }

            // Add 30 mins for next slot check
            const [h, m] = currentTime.split(':').map(Number);
            const d = new Date();
            d.setHours(h, m + 30);
            currentTime = d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', hour12: false});
         }
      }
    });

    // Convert Set to Array and sort
    const sortedSlots = Array.from(slotsMap).sort().map(time => ({ time, available: true }));
    setGeneratedSlots(sortedSlots);
  };

  // Regenerar slots cuando cambian los datos o la carga termina
  useEffect(() => {
    if (selectedDate && !loadingSlots) {
      generateSlotsForDate();
      setSelectedTime(null);
    }
  }, [selectedDate, selectedDoctor, loadingSlots, dayAppointments]);


  const handleConfirm = async () => {
    if (!selectedTreatment || !selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    setError(null);

    try {
      const treatmentName = treatments.find(t => t.id === selectedTreatment)?.name || 'Consulta';
      
      // Obtener duración del tratamiento nuevo
      const selectedTreatmentObj = treatments.find(t => t.id === selectedTreatment);
      const newDuration = selectedTreatmentObj ? selectedTreatmentObj.duration : 30;

      // Resolve doctor ID
      let doctorIdToBook = selectedDoctor;

      // Logic to resolve "any" doctor or confirm specific doctor availability
      // We must pick a doctor that is free at this specific time slot
      if (!selectedDoctor || selectedDoctor === 'any') {
        const dateObj = new Date(selectedDate);
        const dayOfWeek = dateObj.getUTCDay();
        const slotMinutes = timeToMinutes(selectedTime);
        const slotEnd = slotMinutes + newDuration;

        const availableDocs = doctors.filter(d => {
          // 1. Hace el tratamiento?
          if (!d.specialties.includes(selectedTreatment)) return false;
          
          // 2. Trabaja ese día y hora?
          const schedule = d.schedule.find(s => s.dayOfWeek === dayOfWeek);
          if (!schedule || !schedule.isWorking) return false;
          if (slotMinutes < timeToMinutes(schedule.startTime) || slotEnd > timeToMinutes(schedule.endTime)) return false;

          // 3. No está de licencia?
          const isBlocked = d.blockedDates.some(range => {
             const start = new Date(range.startDate);
             const end = new Date(range.endDate);
             const check = new Date(selectedDate);
             return check >= start && check <= end;
          });
          if (isBlocked) return false;

          // 4. No tiene solapamiento con otros turnos?

          const docAppts = dayAppointments.filter(a => a.doctorId === d.id);
          const isBusy = docAppts.some(appt => {
              const start = timeToMinutes(appt.time);
              const treat = treatments.find(t => t.name === appt.treatment);
              const dur = treat ? treat.duration : 30;
              const end = start + dur;
              
              // Overlap check
              return Math.max(slotMinutes, start) < Math.min(slotEnd, end);
          });
          
          return !isBusy;
        });

        if (availableDocs.length > 0) {
           // Simple load balancing: Random
           const randomDoc = availableDocs[Math.floor(Math.random() * availableDocs.length)];
           doctorIdToBook = randomDoc.id;
        } else {
            throw new Error("No hay profesionales disponibles en este horario (alguien más pudo haberlo reservado recién).");
        }
      } else {
        // Specific doctor selected
        doctorIdToBook = selectedDoctor;
      }

      setFinalDoctorId(doctorIdToBook);
      
      await appointmentService.create(
        user.id,
        selectedDate,
        selectedTime,
        treatmentName,
        doctorIdToBook!
      );
      
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Error al reservar el turno. Intente nuevamente.');
    } finally {
      setIsBooking(false);
    }
  };

  // Filter doctors based on selected treatment
  const availableDoctors = selectedTreatment 
    ? doctors.filter(doc => doc.specialties.includes(selectedTreatment))
    : [];

  if (success) {
    const treatmentName = treatments.find(t => t.id === selectedTreatment)?.name;
    return (
      <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-6 bg-white animate-in zoom-in duration-300">
        <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mb-4 shadow-lg shadow-green-100">
          <CheckCircle size={48} />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">¡Turno Confirmado!</h2>
        <p className="text-slate-500 max-w-xs mx-auto">
          Te esperamos el día <strong>{selectedDate}</strong> a las <strong>{selectedTime}</strong> para tu {treatmentName}.
        </p>
        <Button onClick={() => onChangeView(ViewState.HOME)} fullWidth className="max-w-xs">
          Volver al Inicio
        </Button>
      </div>
    );
  }

  if (loadingData) {
    return (
       <div className="h-full flex items-center justify-center flex-col gap-3 text-slate-400">
          <div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          <span className="text-sm">Cargando disponibilidad...</span>
       </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white relative">
      {/* Header */}
      <div className="flex items-center gap-4 p-6 border-b border-slate-100">
        <button 
          onClick={() => step === 1 ? onChangeView(ViewState.HOME) : setStep(step - 1 as any)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-600 transition-colors"
        >
          <ChevronLeft size={24} />
        </button>
        <div>
          <h2 className="font-bold text-lg text-slate-900">Nuevo Turno</h2>
          <div className="flex items-center gap-2">
            <div className="h-1 w-24 bg-slate-100 rounded-full overflow-hidden">
               <div className={`h-full bg-primary-500 transition-all duration-500`} style={{ width: `${step * 25}%` }} />
            </div>
            <p className="text-xs text-slate-500">Paso {step} de 4</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 pb-32">
        
        {error && (
           <div className="bg-red-50 text-red-500 p-3 mb-4 rounded-xl flex items-center gap-2 text-sm border border-red-100 animate-in shake">
              <AlertTriangle size={16} />
              {error}
            </div>
        )}

        {/* STEP 1: Treatment */}
        {step === 1 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Selecciona el tratamiento</h3>
            {treatments.map((t) => {
              const isActive = activeTreatments.includes(t.name);
              return (
                <button
                  key={t.id}
                  disabled={isActive}
                  onClick={() => {
                    setSelectedTreatment(t.id);
                    setSelectedDoctor(null); // Reset doctor when treatment changes
                    setStep(2);
                  }}
                  className={`w-full p-4 card-base text-left transition-all flex justify-between items-center ${
                    isActive 
                      ? 'opacity-60 bg-slate-50 cursor-not-allowed border-slate-100' 
                      : selectedTreatment === t.id 
                        ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-500' 
                        : 'card-hover'
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="block font-medium text-slate-900">{t.name}</span>
                      {isActive && (
                        <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Lock size={10} />
                          PENDIENTE
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-slate-500">{t.duration} minutos</span>
                  </div>
                  
                  {!isActive && (
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                      selectedTreatment === t.id ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                    }`}>
                      {selectedTreatment === t.id && <div className="w-2 h-2 bg-white rounded-full" />}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* STEP 2: Doctor Selection */}
        {step === 2 && (
          <div className="space-y-4 animate-in slide-in-from-right duration-300">
            <h3 className="text-lg font-semibold text-slate-800 mb-4">Selecciona un profesional</h3>
            
            <button
              onClick={() => setSelectedDoctor('any')}
              className={`w-full p-4 card-base text-left transition-all flex items-center gap-4 ${
                selectedDoctor === 'any' 
                  ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-500' 
                  : 'card-hover'
              }`}
            >
               <div className="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                 <Star size={20} />
               </div>
               <div className="flex-1">
                  <span className="block font-medium text-slate-900">Sin preferencia</span>
                  <span className="text-xs text-slate-500">Asignaremos el primer profesional disponible</span>
               </div>
               <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  selectedDoctor === 'any' ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                }`}>
                  {selectedDoctor === 'any' && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
            </button>

            {availableDoctors.map((doc) => (
               <button
                key={doc.id}
                onClick={() => setSelectedDoctor(doc.id)}
                className={`w-full p-4 card-base text-left transition-all flex items-center gap-4 ${
                  selectedDoctor === doc.id 
                    ? 'ring-2 ring-primary-500 bg-primary-50 border-primary-500' 
                    : 'card-hover'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                   <UserIcon size={20} />
                </div>
                <div className="flex-1">
                  <span className="block font-medium text-slate-900">{doc.name}</span>
                  <div className="flex items-center gap-1 text-yellow-500">
                    <Star size={12} fill="currentColor"/>
                    <span className="text-xs text-slate-600 font-medium">{doc.rating}</span>
                  </div>
                </div>
                <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                  selectedDoctor === doc.id ? 'border-primary-500 bg-primary-500' : 'border-slate-300'
                }`}>
                  {selectedDoctor === doc.id && <div className="w-2 h-2 bg-white rounded-full" />}
                </div>
              </button>
            ))}
            
            {availableDoctors.length === 0 && (
               <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
                 <p className="text-slate-500 text-sm">No hay profesionales específicos para este tratamiento.</p> 
                 <p className="text-xs text-slate-400 mt-1">Por favor, selecciona "Sin preferencia".</p>
               </div>
            )}
          </div>
        )}

        {/* STEP 3: Date & Time */}
        {step === 3 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Selecciona una fecha</label>
              <div className="relative">
                <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20}/>
                <input 
                  type="date" 
                  className="input-base pl-10 w-full"
                  onChange={(e) => setSelectedDate(e.target.value)}
                  value={selectedDate}
                  min={new Date().toISOString().split('T')[0]}
                />
              </div>
            </div>

            {selectedDate && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <h3 className="text-sm font-medium text-slate-700 mb-3 flex items-center justify-between">
                   Horarios Disponibles
                   {loadingSlots && <span className="text-xs text-slate-400 animate-pulse">Verificando agenda...</span>}
                </h3>
                
                {!loadingSlots && generatedSlots.length === 0 ? (
                  <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-100 text-slate-500 text-sm">
                    No hay turnos disponibles para esta fecha. <br/> Intenta con otro día o selecciona otro profesional.
                  </div>
                ) : (
                  <div className="grid grid-cols-3 gap-3">
                    {generatedSlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                          !slot.available 
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed line-through' 
                            : selectedTime === slot.time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 transform scale-105'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* STEP 4: Summary */}
        {step === 4 && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="card-base p-6 space-y-4 border-l-4 border-l-primary-500">
              <h3 className="font-semibold text-slate-900 border-b border-slate-100 pb-2">Resumen del Turno</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tratamiento</span>
                  <span className="font-medium text-slate-900">{treatments.find(t => t.id === selectedTreatment)?.name}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-slate-500">Profesional</span>
                   <span className="font-medium text-slate-900">
                     {selectedDoctor === 'any' 
                        ? 'Sin preferencia (Asignado)' 
                        : doctors.find(d => d.id === selectedDoctor)?.name}
                   </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Fecha</span>
                  <span className="font-medium text-slate-900">{new Date(selectedDate).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Hora</span>
                  <span className="font-medium text-slate-900">{selectedTime} Hs</span>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 p-4 rounded-xl flex gap-3 border border-blue-100">
               <div className="text-blue-500 mt-0.5">
                 <CheckCircle size={20} />
               </div>
               <p className="text-sm text-blue-700">
                 Recibirás un recordatorio 24 horas antes de tu turno por WhatsApp.
               </p>
            </div>
          </div>
        )}

      </div>

      {/* Footer Actions */}
      <div className="p-6 border-t border-slate-100 bg-white absolute bottom-0 w-full z-10 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
        {step === 2 && (
           <Button 
            fullWidth 
            disabled={!selectedDoctor}
            onClick={() => setStep(3)}
            className="shadow-xl shadow-primary-500/20"
          >
            Continuar
          </Button>
        )}
        {step === 3 && (
          <Button 
            fullWidth 
            disabled={!selectedDate || !selectedTime}
            onClick={() => setStep(4)}
            className="shadow-xl shadow-primary-500/20"
          >
            Ver Resumen
          </Button>
        )}
        {step === 4 && (
          <Button 
            fullWidth 
            onClick={handleConfirm}
            disabled={isBooking}
            className="bg-green-600 hover:bg-green-700 shadow-xl shadow-green-500/20"
          >
            {isBooking ? 'Confirmando...' : 'Confirmar Turno'}
          </Button>
        )}
      </div>
    </div>
  );
};