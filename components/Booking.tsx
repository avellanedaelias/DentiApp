import React, { useState, useEffect } from 'react';
import { ViewState, TimeSlot, TreatmentType, User, Doctor } from '../types';
import { Button } from './Button';
import { ChevronLeft, CheckCircle, Calendar as CalendarIcon, AlertTriangle, User as UserIcon, Star, Lock } from 'lucide-react';
import { appointmentService, doctorService } from '../services/api';

interface BookingProps {
  onChangeView: (view: ViewState) => void;
  user: User;
}

const morningSlots: TimeSlot[] = [
  { time: '09:00', available: true },
  { time: '09:30', available: false },
  { time: '10:00', available: true },
  { time: '10:30', available: true },
  { time: '11:00', available: true },
  { time: '11:30', available: false },
];

const afternoonSlots: TimeSlot[] = [
  { time: '14:00', available: true },
  { time: '14:30', available: true },
  { time: '15:00', available: false },
  { time: '15:30', available: true },
  { time: '16:00', available: true },
  { time: '16:30', available: true },
];

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
  const [isBooking, setIsBooking] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
          .filter(a => a.status !== 'completed' && a.status !== 'cancelled' as any) // 'cancelled' might not be in type yet but good practice
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

  const handleConfirm = async () => {
    if (!selectedTreatment || !selectedDate || !selectedTime) return;
    
    setIsBooking(true);
    setError(null);

    try {
      const treatmentName = treatments.find(t => t.id === selectedTreatment)?.name || 'Consulta';
      
      // Resolve doctor name
      let doctorName = 'Profesional de Turno';
      if (selectedDoctor && selectedDoctor !== 'any') {
        doctorName = doctors.find(d => d.id === selectedDoctor)?.name || doctorName;
      } else {
        // Logic for default assignment if "any" is selected
        // Pick a random available doctor for that treatment
        const availableDocs = doctors.filter(d => d.specialties.includes(selectedTreatment));
        if (availableDocs.length > 0) {
           doctorName = availableDocs[0].name;
        }
      }
      
      await appointmentService.create(
        user.id,
        selectedDate,
        selectedTime,
        treatmentName,
        doctorName
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
                <h3 className="text-sm font-medium text-slate-700 mb-3">Horarios Disponibles</h3>
                
                <div className="mb-4">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Mañana</span>
                  <div className="grid grid-cols-3 gap-3">
                    {morningSlots.map(slot => (
                      <button
                        key={slot.time}
                        disabled={!slot.available}
                        onClick={() => setSelectedTime(slot.time)}
                        className={`py-2 px-3 rounded-lg text-sm font-medium transition-all border ${
                          !slot.available 
                            ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed decoration-slice line-through' 
                            : selectedTime === slot.time
                              ? 'bg-primary-600 text-white border-primary-600 shadow-lg shadow-primary-500/30 transform scale-105'
                              : 'bg-white border-slate-200 text-slate-600 hover:border-primary-300 hover:bg-primary-50'
                        }`}
                      >
                        {slot.time}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 block">Tarde</span>
                  <div className="grid grid-cols-3 gap-3">
                    {afternoonSlots.map(slot => (
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
                </div>
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