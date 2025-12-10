import React, { useEffect, useState } from 'react';
import { Appointment, User, Doctor, DaySchedule, DateRange, TreatmentType } from '../types';
import { appointmentService, doctorService, userService } from '../services/api';
import { Calendar, User as UserIcon, LogOut, Activity, CheckCircle, Ban, Search, Clock, Filter, Briefcase, Plus, Save, Trash2, LayoutDashboard, Users, FileText, ClipboardList, ChevronRight, X } from 'lucide-react';
import { Logo } from './Logo';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
  const [currentTab, setCurrentTab] = useState<'dashboard' | 'doctors' | 'patients'>('dashboard');

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
                  onClick={() => setCurrentTab('patients')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentTab === 'patients' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <ClipboardList size={18} />
                    Pacientes
                </button>
                <button 
                  onClick={() => setCurrentTab('doctors')}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${currentTab === 'doctors' ? 'bg-primary-50 text-primary-700' : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'}`}
                >
                    <Briefcase size={18} />
                    Profesionales
                </button>
            </nav>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-3 bg-slate-100 px-3 py-1.5 rounded-full">
               <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-primary-600 shadow-sm uppercase">
                  <span className="font-bold text-sm">{user.name.charAt(0)}</span>
               </div>
               <span className="text-sm font-medium text-slate-600 pr-2 capitalize">{user.name}</span>
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
        {currentTab === 'dashboard' && <DashboardView />}
        {currentTab === 'doctors' && <DoctorsView />}
        {currentTab === 'patients' && <PatientsView />}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
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

const PatientsView: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [search, setSearch] = useState('');
    const [history, setHistory] = useState<Appointment[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Notes Editor State
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
    const [noteText, setNoteText] = useState('');

    // Add Record Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [treatments, setTreatments] = useState<TreatmentType[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [newRecord, setNewRecord] = useState({
        date: new Date().toISOString().split('T')[0],
        time: '09:00',
        treatmentId: '',
        doctorId: '',
        notes: ''
    });

    useEffect(() => {
        const loadInitialData = async () => {
           setLoading(true);
           try {
             const [usersData, treatData, docData] = await Promise.all([
                 userService.getAll(),
                 doctorService.getTreatments(),
                 doctorService.getAll()
             ]);
             setUsers(usersData);
             setTreatments(treatData);
             setDoctors(docData);
             
             // Pre-select defaults for modal
             if(treatData.length > 0) setNewRecord(prev => ({ ...prev, treatmentId: treatData[0].id }));
             if(docData.length > 0) setNewRecord(prev => ({ ...prev, doctorId: docData[0].id }));

           } catch(e) { console.error(e) }
           finally { setLoading(false); }
        };
        loadInitialData();
    }, []);

    useEffect(() => {
        const loadHistory = async () => {
           if(selectedUser) {
              const data = await appointmentService.getByUser(selectedUser.id);
              setHistory(data);
           }
        };
        loadHistory();
    }, [selectedUser]);

    const filteredUsers = users.filter(u => 
       u.name.toLowerCase().includes(search.toLowerCase()) || 
       u.email.toLowerCase().includes(search.toLowerCase())
    );

    const handleSaveNote = async (id: string) => {
       try {
          await appointmentService.updateClinicalNotes(id, noteText);
          // Actualizar local
          setHistory(prev => prev.map(a => a.id === id ? { ...a, clinicalNotes: noteText } : a));
          setEditingNoteId(null);
       } catch(e) {
          alert('Error al guardar nota');
       }
    };

    const handleCreateRecord = async () => {
        if (!selectedUser || !newRecord.treatmentId || !newRecord.doctorId) return;
        try {
            const treatName = treatments.find(t => t.id === newRecord.treatmentId)?.name || 'Consulta';
            
            // 1. Crear el turno
            const appt = await appointmentService.create(
                selectedUser.id,
                newRecord.date,
                newRecord.time,
                treatName,
                newRecord.doctorId
            );

            // 2. Si tiene notas, agregarlas inmediatamente
            if (newRecord.notes) {
                await appointmentService.updateClinicalNotes(appt.id, newRecord.notes);
                appt.clinicalNotes = newRecord.notes; // Update local obj
                appt.status = 'completed'; // Assume historical records are completed
            }

            // 3. Actualizar lista
            // Re-fetch to be sure or append
            const newData = await appointmentService.getByUser(selectedUser.id);
            setHistory(newData);

            setShowAddModal(false);
            setNewRecord(prev => ({ ...prev, notes: '' })); // Reset notes
            alert('Registro agregado exitosamente');

        } catch (error) {
            console.error(error);
            alert('Error al crear registro');
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2 duration-500">
             {/* Patient List */}
             <div className="lg:col-span-4 space-y-4">
                 <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input 
                      type="text" 
                      placeholder="Buscar paciente..." 
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full bg-white border border-slate-200 rounded-xl py-3 pl-10 pr-4 focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                    />
                 </div>
                 
                 <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden max-h-[600px] overflow-y-auto">
                    {loading ? (
                       <div className="p-8 text-center text-slate-400">Cargando pacientes...</div>
                    ) : filteredUsers.length === 0 ? (
                       <div className="p-8 text-center text-slate-400">No se encontraron pacientes.</div>
                    ) : (
                       filteredUsers.map(u => (
                          <button
                            key={u.id}
                            onClick={() => setSelectedUser(u)}
                            className={`w-full text-left p-4 flex items-center gap-3 border-b border-slate-50 hover:bg-slate-50 transition-colors ${selectedUser?.id === u.id ? 'bg-primary-50' : ''}`}
                          >
                             <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold capitalize ${selectedUser?.id === u.id ? 'bg-primary-200 text-primary-700' : 'bg-slate-100 text-slate-500'}`}>
                                {u.name.charAt(0)}
                             </div>
                             <div className="flex-1 overflow-hidden">
                                <p className="font-medium text-slate-900 truncate capitalize">{u.name}</p>
                                <p className="text-xs text-slate-500 truncate">{u.email}</p>
                             </div>
                             <ChevronRight size={16} className="text-slate-300" />
                          </button>
                       ))
                    )}
                 </div>
             </div>

             {/* Patient Details & History */}
             <div className="lg:col-span-8 space-y-6">
                 {selectedUser ? (
                    <>
                       {/* Header Card */}
                       <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex justify-between items-start">
                          <div className="flex items-center gap-4">
                             <div className="w-16 h-16 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                                <UserIcon size={32} />
                             </div>
                             <div>
                                <h2 className="text-2xl font-bold text-slate-900 capitalize">{selectedUser.name}</h2>
                                <p className="text-slate-500">{selectedUser.email}</p>
                             </div>
                          </div>
                          <div className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold border border-blue-100">
                             Paciente Activo
                          </div>
                       </div>

                       {/* History Timeline */}
                       <div className="space-y-4">
                          <div className="flex justify-between items-center">
                              <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                 <FileText size={20} className="text-primary-500" />
                                 Historia Clínica
                              </h3>
                              <button 
                                onClick={() => setShowAddModal(true)}
                                className="flex items-center gap-2 text-sm font-medium text-primary-600 bg-primary-50 hover:bg-primary-100 px-4 py-2 rounded-lg transition-colors"
                              >
                                  <Plus size={16} />
                                  Agregar Registro
                              </button>
                          </div>
                          
                          {history.length === 0 ? (
                             <div className="p-12 text-center bg-white rounded-2xl border border-dashed border-slate-200 text-slate-400">
                                Este paciente aún no tiene turnos registrados.
                             </div>
                          ) : (
                             <div className="space-y-6 relative pl-4">
                                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-slate-200" />
                                {history.map(apt => (
                                   <div key={apt.id} className="relative pl-8">
                                      {/* Timeline Dot */}
                                      <div className={`absolute left-2.5 -translate-x-1/2 mt-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm ${apt.status === 'completed' ? 'bg-green-500' : apt.status === 'confirmed' ? 'bg-blue-500' : 'bg-slate-300'}`} />
                                      
                                      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                         <div className="flex justify-between items-start mb-2">
                                            <div>
                                               <h4 className="font-bold text-slate-800 text-lg">{apt.treatment}</h4>
                                               <p className="text-sm text-slate-500">{new Date(apt.date).toLocaleDateString()} • {apt.doctorName}</p>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${apt.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-blue-50 text-blue-700'}`}>
                                               {apt.status}
                                            </span>
                                         </div>

                                         {/* Clinical Notes Section */}
                                         {(apt.status === 'completed' || apt.clinicalNotes) && (
                                            <div className="mt-4 pt-4 border-t border-slate-50">
                                               <div className="flex items-center gap-2 mb-2">
                                                  <Activity size={14} className="text-primary-500" />
                                                  <span className="text-xs font-bold text-slate-700 uppercase">Evolución / Notas</span>
                                               </div>
                                               
                                               {editingNoteId === apt.id ? (
                                                  <div className="space-y-2 animate-in fade-in">
                                                     <textarea 
                                                        className="w-full p-3 bg-slate-50 border border-primary-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500/20 focus:outline-none"
                                                        rows={3}
                                                        value={noteText}
                                                        onChange={(e) => setNoteText(e.target.value)}
                                                        placeholder="Escriba la evolución del tratamiento..."
                                                     />
                                                     <div className="flex justify-end gap-2">
                                                        <button 
                                                          onClick={() => setEditingNoteId(null)}
                                                          className="px-3 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-700"
                                                        >
                                                           Cancelar
                                                        </button>
                                                        <button 
                                                           onClick={() => handleSaveNote(apt.id)}
                                                           className="px-3 py-1.5 text-xs font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                                                        >
                                                           Guardar Nota
                                                        </button>
                                                     </div>
                                                  </div>
                                               ) : (
                                                  <div 
                                                    className="group cursor-pointer hover:bg-slate-50 p-2 -ml-2 rounded-lg transition-colors"
                                                    onClick={() => {
                                                       setEditingNoteId(apt.id);
                                                       setNoteText(apt.clinicalNotes || '');
                                                    }}
                                                  >
                                                     <p className="text-sm text-slate-600 leading-relaxed">
                                                        {apt.clinicalNotes || <span className="text-slate-400 italic">Sin notas registradas. Clic para agregar.</span>}
                                                     </p>
                                                  </div>
                                               )}
                                            </div>
                                         )}
                                      </div>
                                   </div>
                                ))}
                             </div>
                          )}
                       </div>
                    </>
                 ) : (
                    <div className="h-full flex flex-col items-center justify-center text-slate-400 bg-white rounded-2xl border border-slate-100 p-12">
                        <Users size={48} className="mb-4 text-slate-200" />
                        <p className="text-lg font-medium text-slate-600">Selecciona un paciente</p>
                        <p className="text-sm">Para ver su historia clínica y evoluciones.</p>
                    </div>
                 )}
             </div>

             {/* Add Record Modal */}
             {showAddModal && (
                 <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                     <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-10">
                         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                             <h3 className="font-bold text-lg text-slate-800">Agregar Registro Manual</h3>
                             <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                         </div>
                         <div className="p-6 space-y-4">
                             <div className="grid grid-cols-2 gap-4">
                                 <div className="space-y-1">
                                     <label className="text-xs font-bold text-slate-500">Fecha</label>
                                     <input 
                                       type="date" 
                                       className="w-full input-base"
                                       value={newRecord.date}
                                       onChange={(e) => setNewRecord({...newRecord, date: e.target.value})}
                                     />
                                 </div>
                                 <div className="space-y-1">
                                     <label className="text-xs font-bold text-slate-500">Hora</label>
                                     <input 
                                       type="time" 
                                       className="w-full input-base"
                                       value={newRecord.time}
                                       onChange={(e) => setNewRecord({...newRecord, time: e.target.value})}
                                     />
                                 </div>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-500">Tratamiento</label>
                                 <select 
                                   className="w-full input-base"
                                   value={newRecord.treatmentId}
                                   onChange={(e) => setNewRecord({...newRecord, treatmentId: e.target.value})}
                                 >
                                     {treatments.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
                                 </select>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-500">Profesional</label>
                                 <select 
                                   className="w-full input-base"
                                   value={newRecord.doctorId}
                                   onChange={(e) => setNewRecord({...newRecord, doctorId: e.target.value})}
                                 >
                                     {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                                 </select>
                             </div>

                             <div className="space-y-1">
                                 <label className="text-xs font-bold text-slate-500">Notas de Evolución (Opcional)</label>
                                 <textarea 
                                   rows={3}
                                   className="w-full input-base"
                                   placeholder="Detalle del procedimiento realizado..."
                                   value={newRecord.notes}
                                   onChange={(e) => setNewRecord({...newRecord, notes: e.target.value})}
                                 />
                             </div>
                         </div>
                         <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2">
                             <button 
                               onClick={() => setShowAddModal(false)}
                               className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800"
                             >
                                 Cancelar
                             </button>
                             <button 
                               onClick={handleCreateRecord}
                               className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20"
                             >
                                 Guardar Ficha
                             </button>
                         </div>
                     </div>
                 </div>
             )}
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
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in slide-in-from-bottom-2 duration-500">
            {/* List of Doctors */}
            <div className="lg:col-span-4 space-y-4">
                <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm mb-4">
                   <h3 className="font-bold text-slate-800 flex items-center gap-2">
                       <Briefcase className="text-primary-500" size={20} />
                       Profesionales
                   </h3>
                   <p className="text-xs text-slate-400 mt-1">Gestiona horarios y licencias.</p>
                </div>

                {loading ? (
                    <p className="text-slate-400 text-center">Cargando...</p>
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