import React, { useEffect, useState } from 'react';
import { Appointment, User, Doctor, DaySchedule, DateRange, TreatmentType } from '../types';
import { appointmentService, doctorService, userService } from '../services/api';
import { Calendar, User as UserIcon, LogOut, Activity, CheckCircle, Ban, Search, Clock, Filter, Briefcase, Plus, Save, Trash2, LayoutDashboard, Users, FileText, ClipboardList, ChevronRight, X, ShieldAlert, MessageCircle, Edit2, Phone, MapPin, CreditCard, Lock } from 'lucide-react';
import { Logo } from './Logo';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

const DAYS_OF_WEEK = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

const COUNTRY_CODES = [
  { code: '+54', country: 'Argentina' },
  { code: '+52', country: 'México' },
  { code: '+57', country: 'Colombia' },
  { code: '+56', country: 'Chile' },
  { code: '+51', country: 'Perú' },
  { code: '+34', country: 'España' },
  { code: '+1', country: 'USA' },
];

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

    const handleWhatsAppReminder = (appt: Appointment) => {
        if (!appt.patientPhone) {
            alert('El paciente no tiene un teléfono registrado.');
            return;
        }
        const cleanPhone = appt.patientPhone.replace(/[^0-9]/g, '');
        const message = `Hola ${appt.patientName}, le recordamos su turno en DentiApp para *${appt.treatment}* el día ${new Date(appt.date).toLocaleDateString()} a las *${appt.time}hs* con ${appt.doctorName}. \n\n¿Confirma su asistencia?`;
        const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
        window.open(url, '_blank');
    };

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
                                        <div className="flex items-center gap-2">
                                            {/* WhatsApp Reminder Button */}
                                            {apt.status === 'confirmed' && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleWhatsAppReminder(apt);
                                                    }}
                                                    title="Enviar Recordatorio por WhatsApp"
                                                    className="p-1.5 text-white bg-green-500 hover:bg-green-600 rounded-full transition-colors shadow-sm flex items-center gap-1 px-3"
                                                >
                                                    <MessageCircle size={14} />
                                                    <span className="text-xs font-bold hidden sm:inline">Recordar</span>
                                                </button>
                                            )}
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600' : apt.status === 'completed' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>{apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'cancelled' ? 'Cancelado' : 'Completado'}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                                        <span className="font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md self-start">{apt.treatment}</span>
                                        <span className="text-slate-500 flex items-center gap-1.5"><UserIcon size={14} />{apt.doctorName}</span>
                                        {apt.patientPhone && (
                                            <span className="text-slate-400 text-xs hidden sm:inline-block">Tel: {apt.patientPhone}</span>
                                        )}
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
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);
    
    // Edit User Modal State
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    
    // History Modal State
    const [historyUser, setHistoryUser] = useState<User | null>(null);
    const [userAppointments, setUserAppointments] = useState<Appointment[]>([]);
    const [loadingHistory, setLoadingHistory] = useState(false);
    
    const [editForm, setEditForm] = useState({
        name: '',
        countryCode: '+54',
        phoneNumber: '',
        dni: '',
        dateOfBirth: '',
        address: ''
    });

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const data = await userService.getAll();
                setUsers(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const openEditModal = (user: User) => {
        setEditingUser(user);
        let phone = user.phone || '';
        let code = '+54';
        let number = '';
        const matchedCode = COUNTRY_CODES.find(c => phone.startsWith(c.code));
        if (matchedCode) {
            code = matchedCode.code;
            number = phone.substring(code.length);
        } else {
            number = phone;
        }

        setEditForm({
            name: user.name,
            countryCode: code,
            phoneNumber: number,
            dni: user.dni || '',
            dateOfBirth: user.dateOfBirth || '',
            address: user.address || ''
        });
        setShowEditModal(true);
    };

    const openHistoryModal = async (user: User) => {
        setHistoryUser(user);
        setLoadingHistory(true);
        try {
            const apps = await appointmentService.getByUser(user.id);
            // Sort by date descending
            setUserAppointments(apps.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
        } catch (e) {
            console.error(e);
            setUserAppointments([]);
        } finally {
            setLoadingHistory(false);
        }
    };

    const handleSaveUser = async () => {
        if (!editingUser) return;
        try {
            const fullPhone = editForm.phoneNumber ? `${editForm.countryCode}${editForm.phoneNumber}` : '';
            const updatedData = {
                name: editForm.name,
                phone: fullPhone,
                dni: editForm.dni,
                dateOfBirth: editForm.dateOfBirth,
                address: editForm.address
            };
            await userService.update(editingUser.id, updatedData);
            setUsers(prev => prev.map(u => u.id === editingUser.id ? { ...u, ...updatedData } : u));
            setShowEditModal(false);
        } catch (error) {
            alert('Error al actualizar paciente.');
        }
    };

    const handleDeleteUser = async (userToDelete: User) => {
        if(window.confirm(`¿Estás seguro de eliminar al usuario ${userToDelete.name}?`)) {
            try {
                await userService.delete(userToDelete.id);
                setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
            } catch (error) {
                alert('Error al eliminar usuario');
            }
        }
    };

    const filteredUsers = users.filter(u => 
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.dni && u.dni.includes(searchTerm))
    );

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
             <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <h2 className="text-xl font-bold text-slate-800">Base de Pacientes</h2>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar por nombre, email o DNI..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                    />
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4">Paciente</th>
                                <th className="px-6 py-4">Contacto</th>
                                <th className="px-6 py-4">DNI</th>
                                <th className="px-6 py-4">Rol</th>
                                <th className="px-6 py-4 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"/>
                                        Cargando datos...
                                    </td>
                                </tr>
                            ) : filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron pacientes.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map(u => (
                                    <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-100 text-primary-700 rounded-full flex items-center justify-center font-bold text-sm">
                                                    {u.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-slate-900">{u.name}</p>
                                                    <p className="text-xs text-slate-400">ID: #{u.id}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <p className="text-slate-600 flex items-center gap-2">
                                                    <span className="w-4 h-4 flex items-center justify-center text-slate-400">@</span>
                                                    {u.email}
                                                </p>
                                                <p className="text-slate-600 flex items-center gap-2">
                                                    <span className="w-4 h-4 flex items-center justify-center text-slate-400">#</span>
                                                    {u.phone || 'Sin teléfono'}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-slate-600 font-mono">
                                            {u.dni || '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                             <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wide border ${
                                                u.role === 'admin' 
                                                ? 'bg-purple-50 text-purple-700 border-purple-100' 
                                                : 'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                                {u.role === 'admin' ? <ShieldAlert size={12}/> : <UserIcon size={12}/>}
                                                {u.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
                                            <button 
                                                onClick={() => openHistoryModal(u)}
                                                className="p-2 text-slate-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors inline-block" 
                                                title="Ver Historial"
                                            >
                                                <Clock size={18} />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(u)}
                                                className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors inline-block" 
                                                title="Editar Usuario"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteUser(u)}
                                                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors inline-block" 
                                                title="Eliminar Usuario"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* EDIT USER MODAL */}
            {showEditModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-10">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-lg text-slate-800">Editar Perfil del Paciente</h3>
                            <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Nombre Completo</label>
                                <input type="text" className="w-full input-base" value={editForm.name} onChange={(e) => setEditForm({...editForm, name: e.target.value})} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">DNI / Cédula</label>
                                    <div className="relative">
                                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input type="text" className="w-full input-base pl-9" placeholder="12345678" value={editForm.dni} onChange={(e) => setEditForm({...editForm, dni: e.target.value})} />
                                    </div>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500 uppercase">F. Nacimiento</label>
                                    <input type="date" className="w-full input-base" value={editForm.dateOfBirth} onChange={(e) => setEditForm({...editForm, dateOfBirth: e.target.value})} />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Teléfono / WhatsApp</label>
                                <div className="flex gap-2">
                                    <select className="w-24 input-base px-2 text-center" value={editForm.countryCode} onChange={(e) => setEditForm({...editForm, countryCode: e.target.value})}>
                                        {COUNTRY_CODES.map(c => <option key={c.code} value={c.code}>{c.code}</option>)}
                                    </select>
                                    <div className="relative flex-1">
                                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                        <input type="tel" className="w-full input-base pl-9" placeholder="11 1234 5678" value={editForm.phoneNumber} onChange={(e) => setEditForm({...editForm, phoneNumber: e.target.value})} />
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500 uppercase">Dirección / Domicilio</label>
                                <div className="relative">
                                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
                                    <input type="text" className="w-full input-base pl-9" placeholder="Calle 123, Ciudad" value={editForm.address} onChange={(e) => setEditForm({...editForm, address: e.target.value})} />
                                </div>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-slate-50 flex justify-end gap-2">
                            <button onClick={() => setShowEditModal(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
                            <button onClick={handleSaveUser} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20">Guardar Cambios</button>
                        </div>
                    </div>
                </div>
            )}

            {/* HISTORY MODAL */}
            {historyUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Historial Clínico</h3>
                                <p className="text-xs text-slate-500">Paciente: {historyUser.name}</p>
                            </div>
                            <button onClick={() => setHistoryUser(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            {loadingHistory ? (
                                <div className="flex justify-center py-10"><div className="w-8 h-8 border-2 border-primary-200 border-t-primary-600 rounded-full animate-spin"/></div>
                            ) : userAppointments.length === 0 ? (
                                <div className="text-center py-10 text-slate-400 border-2 border-dashed border-slate-100 rounded-xl">
                                    <ClipboardList size={32} className="mx-auto mb-2 opacity-50"/>
                                    <p>No hay turnos registrados para este paciente.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {userAppointments.map(app => (
                                        <div key={app.id} className="border border-slate-100 rounded-xl p-4 flex gap-4 hover:border-primary-100 transition-colors">
                                            <div className="flex flex-col items-center justify-center min-w-[60px] bg-slate-50 rounded-lg p-2">
                                                <span className="text-xs font-bold text-slate-400 uppercase">{new Date(app.date).toLocaleDateString('es-ES', {month:'short'})}</span>
                                                <span className="text-xl font-bold text-slate-800">{new Date(app.date).getDate()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <h4 className="font-bold text-slate-800">{app.treatment}</h4>
                                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${app.status === 'confirmed' ? 'bg-blue-100 text-blue-700' : app.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-red-50 text-red-500'}`}>
                                                        {app.status}
                                                    </span>
                                                </div>
                                                <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
                                                    <UserIcon size={12}/> {app.doctorName} <span className="text-slate-300">|</span> <Clock size={12}/> {app.time}hs
                                                </p>
                                                {app.clinicalNotes && (
                                                    <div className="mt-3 bg-yellow-50 p-3 rounded-lg border border-yellow-100 text-sm text-slate-700">
                                                        <span className="font-bold text-yellow-700 text-xs block mb-1">Notas Clínicas:</span>
                                                        {app.clinicalNotes}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const DoctorsView: React.FC = () => {
    const [doctors, setDoctors] = useState<Doctor[]>([]);
    const [loading, setLoading] = useState(true);
    
    // Modal States
    const [editingScheduleDoc, setEditingScheduleDoc] = useState<Doctor | null>(null);
    const [scheduleForm, setScheduleForm] = useState<DaySchedule[]>([]);

    const [blockingDatesDoc, setBlockingDatesDoc] = useState<Doctor | null>(null);
    const [blockForm, setBlockForm] = useState({ startDate: '', endDate: '', reason: '' });

    useEffect(() => {
        loadDoctors();
    }, []);

    const loadDoctors = async () => {
        setLoading(true);
        try {
            const data = await doctorService.getAll();
            setDoctors(data);
        } catch (err) { console.error(err); } 
        finally { setLoading(false); }
    };

    const handleEditSchedule = (doc: Doctor) => {
        setEditingScheduleDoc(doc);
        // Deep copy of schedule to avoid mutating state directly
        setScheduleForm(JSON.parse(JSON.stringify(doc.schedule)));
    };

    const handleSaveSchedule = async () => {
        if (!editingScheduleDoc) return;
        try {
            await doctorService.updateSchedule(editingScheduleDoc.id, scheduleForm);
            alert('Horarios actualizados correctamente');
            setEditingScheduleDoc(null);
            loadDoctors();
        } catch (e) { alert('Error al guardar horarios'); }
    };

    const handleBlockDates = (doc: Doctor) => {
        setBlockingDatesDoc(doc);
        setBlockForm({ startDate: '', endDate: '', reason: '' });
    };

    const handleSaveBlock = async () => {
        if (!blockingDatesDoc || !blockForm.startDate || !blockForm.endDate) return;
        try {
            await doctorService.addBlockedDate(blockingDatesDoc.id, {
                id: Date.now().toString(),
                startDate: blockForm.startDate,
                endDate: blockForm.endDate,
                reason: blockForm.reason
            });
            alert('Fechas bloqueadas correctamente');
            setBlockingDatesDoc(null);
            loadDoctors();
        } catch (e) { alert('Error al bloquear fechas'); }
    };

    const updateDaySchedule = (index: number, field: keyof DaySchedule, value: any) => {
        const newSchedule = [...scheduleForm];
        newSchedule[index] = { ...newSchedule[index], [field]: value };
        setScheduleForm(newSchedule);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-slate-800">Profesionales</h2>
                <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm bg-primary-600 text-white hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/20">
                    <Plus size={18} /> Nuevo Profesional
                </button>
            </div>

            {loading ? (
                 <div className="text-center py-12">
                    <div className="w-8 h-8 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin mx-auto mb-2"/>
                    <span className="text-slate-400 text-sm">Cargando profesionales...</span>
                 </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {doctors.map(doc => (
                        <div key={doc.id} className="bg-white rounded-2xl border border-slate-100 p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                        <UserIcon size={24} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-900">{doc.name}</h3>
                                        <div className="flex items-center gap-1 text-sm text-slate-500">
                                            <Activity size={14} className="text-yellow-500" />
                                            <span className="font-medium text-slate-700">{doc.rating}</span>
                                        </div>
                                    </div>
                                </div>
                                <button className="text-slate-400 hover:text-slate-600">
                                    <Briefcase size={18} />
                                </button>
                            </div>

                            <div className="space-y-3">
                                <div className="text-sm">
                                    <p className="text-slate-500 mb-1 font-medium">Horarios de Atención</p>
                                    <div className="space-y-1">
                                        {doc.schedule.filter(s => s.isWorking).map(s => (
                                            <div key={s.dayOfWeek} className="flex justify-between text-xs text-slate-600 bg-slate-50 px-2 py-1 rounded">
                                                <span>{DAYS_OF_WEEK[s.dayOfWeek]}</span>
                                                <span>{s.startTime} - {s.endTime}</span>
                                            </div>
                                        ))}
                                        {doc.schedule.filter(s => s.isWorking).length === 0 && (
                                            <span className="text-xs text-slate-400 italic">Sin horarios configurados</span>
                                        )}
                                    </div>
                                </div>
                                <div className="pt-4 border-t border-slate-50 flex gap-2">
                                     <button 
                                        onClick={() => handleEditSchedule(doc)}
                                        className="flex-1 text-xs font-medium text-primary-600 bg-primary-50 py-2 rounded-lg hover:bg-primary-100 transition-colors"
                                     >
                                        Editar Agenda
                                     </button>
                                     <button 
                                        onClick={() => handleBlockDates(doc)}
                                        className="flex-1 text-xs font-medium text-slate-600 bg-slate-100 py-2 rounded-lg hover:bg-slate-200 transition-colors"
                                     >
                                        Bloquear Fechas
                                     </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* EDIT SCHEDULE MODAL */}
            {editingScheduleDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden animate-in slide-in-from-bottom-10 flex flex-col max-h-[85vh]">
                        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Editar Agenda</h3>
                                <p className="text-xs text-slate-500">{editingScheduleDoc.name}</p>
                            </div>
                            <button onClick={() => setEditingScheduleDoc(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-3">
                            {scheduleForm.map((day, idx) => (
                                <div key={day.dayOfWeek} className={`flex items-center gap-3 p-3 rounded-xl border ${day.isWorking ? 'border-primary-100 bg-primary-50/30' : 'border-slate-100 bg-slate-50 opacity-60'}`}>
                                    <div className="w-8">
                                        <input 
                                            type="checkbox" 
                                            className="w-5 h-5 text-primary-600 rounded focus:ring-primary-500"
                                            checked={day.isWorking}
                                            onChange={(e) => updateDaySchedule(idx, 'isWorking', e.target.checked)}
                                        />
                                    </div>
                                    <div className="w-24 font-medium text-sm text-slate-700">{DAYS_OF_WEEK[day.dayOfWeek]}</div>
                                    <div className="flex-1 flex gap-2 items-center">
                                        <input 
                                            type="time" 
                                            disabled={!day.isWorking}
                                            value={day.startTime}
                                            onChange={(e) => updateDaySchedule(idx, 'startTime', e.target.value)}
                                            className="input-base py-1 px-2 text-sm text-center"
                                        />
                                        <span className="text-slate-400">-</span>
                                        <input 
                                            type="time" 
                                            disabled={!day.isWorking}
                                            value={day.endTime}
                                            onChange={(e) => updateDaySchedule(idx, 'endTime', e.target.value)}
                                            className="input-base py-1 px-2 text-sm text-center"
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                             <button onClick={() => setEditingScheduleDoc(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
                             <button onClick={handleSaveSchedule} className="px-4 py-2 text-sm font-medium bg-primary-600 text-white rounded-lg hover:bg-primary-700 shadow-lg shadow-primary-500/20">Guardar Agenda</button>
                        </div>
                    </div>
                </div>
            )}

            {/* BLOCK DATES MODAL */}
            {blockingDatesDoc && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden animate-in zoom-in-95">
                         <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="font-bold text-lg text-slate-800">Bloquear Fechas</h3>
                                <p className="text-xs text-slate-500">{blockingDatesDoc.name}</p>
                            </div>
                            <button onClick={() => setBlockingDatesDoc(null)} className="text-slate-400 hover:text-slate-600"><X size={20}/></button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Desde</label>
                                    <input 
                                        type="date" 
                                        className="input-base"
                                        value={blockForm.startDate}
                                        onChange={(e) => setBlockForm({...blockForm, startDate: e.target.value})}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-slate-500">Hasta</label>
                                    <input 
                                        type="date" 
                                        className="input-base"
                                        value={blockForm.endDate}
                                        onChange={(e) => setBlockForm({...blockForm, endDate: e.target.value})}
                                    />
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-500">Motivo (Opcional)</label>
                                <input 
                                    type="text" 
                                    placeholder="Vacaciones, Congreso, etc."
                                    className="input-base"
                                    value={blockForm.reason}
                                    onChange={(e) => setBlockForm({...blockForm, reason: e.target.value})}
                                />
                            </div>

                            {/* Existing Blocked Dates List */}
                            {blockingDatesDoc.blockedDates.length > 0 && (
                                <div className="mt-4 pt-4 border-t border-slate-100">
                                    <p className="text-xs font-bold text-slate-400 mb-2 uppercase">Bloqueos Vigentes</p>
                                    <div className="space-y-2">
                                        {blockingDatesDoc.blockedDates.map(b => (
                                            <div key={b.id} className="flex justify-between items-center text-xs bg-red-50 p-2 rounded text-red-700">
                                                <span>{new Date(b.startDate).toLocaleDateString()} - {new Date(b.endDate).toLocaleDateString()}</span>
                                                <span className="font-medium">{b.reason}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                        <div className="px-6 py-4 border-t border-slate-100 flex justify-end gap-2">
                             <button onClick={() => setBlockingDatesDoc(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800">Cancelar</button>
                             <button onClick={handleSaveBlock} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-lg shadow-red-500/20">Confirmar Bloqueo</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};