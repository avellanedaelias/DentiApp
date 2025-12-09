import React, { useEffect, useState } from 'react';
import { Appointment, User, Doctor, DaySchedule, DateRange } from '../types';
import { appointmentService, doctorService } from '../services/api';
import { Calendar, User as UserIcon, LogOut, Activity, CheckCircle, Ban, Search, Clock, Filter, Briefcase, Plus, Save, Trash2, LayoutDashboard, Users } from 'lucide-react';
import { Logo } from './Logo';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'doctors'>('dashboard');

  return (
     <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Full Width */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
                <Logo size="sm" />
                <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
                <h1 className="font-bold text-slate-800 text-lg tracking-tight">DentiApp <span className="text-slate-400 font-normal">Admin</span></h1>
            </div>

            {/* Navigation Tabs */}
            <nav className="hidden md:flex items-center gap-1">
                <button 
                  onClick={() => setCurrentTab('dashboard')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentTab === 'dashboard' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <LayoutDashboard size={18} />
                    Dashboard
                </button>
                <button 
                  onClick={() => setCurrentTab('doctors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentTab === 'doctors' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <Users size={18} />
                    Profesionales
                </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm">
                  <span className="font-bold text-sm">{user.name.charAt(0)}</span>
               </div>
               <span className="text-sm font-medium text-slate-600 pr-2">{user.name}</span>
            </div>
            <button 
              onClick={onLogout}
              className="flex items-center gap-2 text-slate-500 hover:text-red-600 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors font-medium text-sm"
            >
              <LogOut size={18} />
              <span className="hidden sm:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentTab === 'dashboard' ? <DashboardView /> : <DoctorsView />}
      </main>
    </div>
  );
};

// --- SUB-VIEWS ---

const DashboardView: React.FC = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    useEffect(() => {
        const fetchAppointments = async () => {
        setLoading(true);
        try {
            const data = await appointmentService.getAllByDate(date);
            setAppointments(data);
        } catch (error) {
            console.error("Error fetching agenda", error);
        } finally {
            setLoading(false);
        }
        };

        fetchAppointments();
    }, [date]);

    const stats = {
        total: appointments.length,
        confirmed: appointments.filter(a => a.status === 'confirmed').length,
        completed: appointments.filter(a => a.status === 'completed').length,
        cancelled: appointments.filter(a => a.status === 'cancelled').length,
    };

    const filteredAppointments = appointments.filter(a => {
        if (filter === 'all') return true;
        if (filter === 'pending') return a.status === 'confirmed';
        return a.status === filter;
    });

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Calendar size={14} />
                        Fecha de Agenda
                    </label>
                    <input 
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-4 px-4 font-semibold text-slate-700 text-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition-all cursor-pointer hover:bg-slate-100"
                    />
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-1 gap-4">
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pendientes</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.confirmed}</p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500 group-hover:scale-110 transition-transform">
                            <Clock size={24} />
                        </div>
                    </div>
                    {/* ... other stats cards ... */}
                    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-green-200 transition-colors">
                        <div>
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Atendidos</p>
                            <p className="text-3xl font-bold text-slate-800 mt-1">{stats.completed}</p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500 group-hover:scale-110 transition-transform">
                            <CheckCircle size={24} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="lg:col-span-8 space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                        <Activity className="text-primary-500" />
                        Turnos Programados
                    </h2>
                    
                    <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Todos</button>
                        <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'pending' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Pendientes</button>
                        <button onClick={() => setFilter('completed')} className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'completed' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Atendidos</button>
                    </div>
                </div>

                {loading ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                        <div className="w-10 h-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4"/>
                        <span className="font-medium">Sincronizando agenda...</span>
                    </div>
                ) : filteredAppointments.length === 0 ? (
                    <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4"><Search size={32} className="text-slate-300" /></div>
                        <p className="text-lg font-medium text-slate-600">No hay resultados</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {filteredAppointments.map(apt => (
                            <div key={apt.id} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6">
                                <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${apt.status === 'confirmed' ? 'bg-blue-500' : apt.status === 'completed' ? 'bg-green-500' : 'bg-red-400'}`} />
                                <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-0 min-w-[5rem] px-2 sm:border-r border-slate-100">
                                    <span className="text-2xl font-bold text-slate-700">{apt.time}</span>
                                    <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">HS</span>
                                </div>
                                <div className="flex-1 w-full">
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800 text-lg">{apt.patientName || 'Paciente Anónimo'}</h3>
                                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'cancelled' ? 'Cancelado' : 'Completado'}</span>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                                        <span className="font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md self-start">{apt.treatment}</span>
                                        <span className="text-slate-500 flex items-center gap-1.5"><UserIcon size={14} />{apt.doctorName}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const DoctorsView: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    // Form States
    const [schedule, setSchedule] = useState<DaySchedule[]>([]);
    const [blockedDates, setBlockedDates] = useState<DateRange[]>([]);
    const [newBlocked, setNewBlocked] = useState({ start: '', end: '', reason: '' });

    const loadDoctors = async () => {
        setLoading(true);
        const data = await doctorService.getAll();
        setDoctors(data);
        setLoading(false);
    };

    useEffect(() => {
        loadDoctors();
    }, []);

    // When doctor is selected, load their schedule
    useEffect(() => {
        if (selectedDoctorId) {
            const doc = doctors.find(d => d.id === selectedDoctorId);
            if (doc) {
                setSchedule(JSON.parse(JSON.stringify(doc.schedule))); // Deep copy
                setBlockedDates(doc.blockedDates || []);
            }
        }
    }, [selectedDoctorId, doctors]);

    const handleSaveSchedule = async () => {
        if (!selectedDoctorId) return;
        try {
            await doctorService.updateSchedule(selectedDoctorId, schedule);
            alert('Horarios actualizados correctamente');
            // Recargar datos para asegurar consistencia
            await loadDoctors();
        } catch (error) {
            alert('Error al guardar horarios');
        }
    };

    const handleAddBlock = async () => {
        if (!selectedDoctorId || !newBlocked.start || !newBlocked.end) return;
        try {
            const newRange: DateRange = {
                id: Date.now().toString(),
                startDate: newBlocked.start,
                endDate: newBlocked.end,
                reason: newBlocked.reason || 'Licencia'
            };
            await doctorService.addBlockedDate(selectedDoctorId, newRange);
            
            // Recargar datos
            await loadDoctors();
            setNewBlocked({ start: '', end: '', reason: '' });

        } catch (error) {
            alert('Error al agregar bloqueo');
        }
    };

    const handleScheduleChange = (dayIndex: number, field: keyof DaySchedule, value: any) => {
        const newSchedule = [...schedule];
        // @ts-ignore
        newSchedule[dayIndex][field] = value;
        setSchedule(newSchedule);
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* List of Doctors */}
            <div className="lg:col-span-4 space-y-4">
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                    <Briefcase className="text-primary-500" size={20} />
                    Lista de Profesionales
                </h3>
                {loading ? (
                    <p>Cargando...</p>
                ) : (
                    <div className="space-y-2">
                        {doctors.map(doc => (
                            <button
                                key={doc.id}
                                onClick={() => setSelectedDoctorId(doc.id)}
                                className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-3 ${selectedDoctorId === doc.id ? 'bg-primary-50 border-primary-500 ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                            >
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selectedDoctorId === doc.id ? 'bg-primary-200 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                                    <UserIcon size={20} />
                                </div>
                                <div>
                                    <p className="font-medium text-slate-900">{doc.name}</p>
                                    <p className="text-xs text-slate-500">{doc.specialties.length} especialidades</p>
                                </div>
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Doctor Details */}
            <div className="lg:col-span-8 space-y-8">
                {selectedDoctorId ? (
                    <>
                        {/* Schedule Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <div className="flex justify-between items-center mb-6">
                                <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                    <Clock className="text-primary-500" size={20} />
                                    Horarios Semanales
                                </h3>
                                <button onClick={handleSaveSchedule} className="flex items-center gap-2 bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">
                                    <Save size={16} />
                                    Guardar Cambios
                                </button>
                            </div>

                            <div className="space-y-4">
                                {schedule.map((day, idx) => (
                                    <div key={day.dayOfWeek} className={`flex items-center gap-4 p-3 rounded-lg border ${day.isWorking ? 'bg-white border-slate-200' : 'bg-slate-50 border-transparent opacity-60'}`}>
                                        <div className="w-32 flex items-center gap-3">
                                            <input 
                                                type="checkbox" 
                                                checked={day.isWorking} 
                                                onChange={(e) => handleScheduleChange(idx, 'isWorking', e.target.checked)}
                                                className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                            />
                                            <span className="font-medium text-sm text-slate-700">{DAYS_OF_WEEK[day.dayOfWeek]}</span>
                                        </div>
                                        
                                        <div className="flex items-center gap-2">
                                            <input 
                                                type="time" 
                                                value={day.startTime}
                                                disabled={!day.isWorking}
                                                onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                                                className="border border-slate-300 rounded-md px-2 py-1 text-sm disabled:bg-slate-100"
                                            />
                                            <span className="text-slate-400">-</span>
                                            <input 
                                                type="time" 
                                                value={day.endTime}
                                                disabled={!day.isWorking}
                                                onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                                                className="border border-slate-300 rounded-md px-2 py-1 text-sm disabled:bg-slate-100"
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Blocked Dates Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2 mb-6">
                                <Ban className="text-red-500" size={20} />
                                Licencias y Bloqueos
                            </h3>

                            <div className="flex flex-col md:flex-row gap-4 mb-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Desde</label>
                                    <input 
                                        type="date" 
                                        value={newBlocked.start} 
                                        onChange={(e) => setNewBlocked({...newBlocked, start: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Hasta</label>
                                    <input 
                                        type="date" 
                                        value={newBlocked.end}
                                        onChange={(e) => setNewBlocked({...newBlocked, end: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Razón</label>
                                    <input 
                                        type="text" 
                                        placeholder="Vacaciones..." 
                                        value={newBlocked.reason}
                                        onChange={(e) => setNewBlocked({...newBlocked, reason: e.target.value})}
                                        className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm"
                                    />
                                </div>
                                <div className="flex items-end">
                                    <button onClick={handleAddBlock} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
                                        <Plus size={16} /> Agregar
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-2">
                                {blockedDates.length === 0 ? (
                                    <p className="text-slate-400 text-sm text-center py-4">No hay fechas bloqueadas.</p>
                                ) : (
                                    blockedDates.map(block => (
                                        <div key={block.id} className="flex justify-between items-center p-3 bg-white border border-slate-100 rounded-lg">
                                            <div>
                                                <p className="font-medium text-slate-800 text-sm">{block.reason}</p>
                                                <p className="text-xs text-slate-500">
                                                    {new Date(block.startDate).toLocaleDateString()} - {new Date(block.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="bg-red-50 text-red-500 text-xs font-bold px-2 py-1 rounded">Bloqueado</div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100 p-12">
                        <Users size={48} className="mb-4 text-slate-200" />
                        <p className="text-lg font-medium text-slate-600">Selecciona un profesional</p>
                        <p className="text-sm">Configura sus horarios de atención y licencias.</p>
                    </div>
                )}
            </div>
        </div>
    );
};