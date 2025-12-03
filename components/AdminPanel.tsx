import React, { useEffect, useState } from 'react';
import { Appointment, User } from '../types';
import { appointmentService } from '../services/api';
import { Calendar, User as UserIcon, LogOut, Activity, CheckCircle, Ban, Search, Clock, Filter } from 'lucide-react';
import { Logo } from './Logo';

interface AdminPanelProps {
  user: User;
  onLogout: () => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({ user, onLogout }) => {
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
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar Full Width */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Logo size="sm" />
            <div className="hidden md:block w-px h-6 bg-slate-200 mx-2"></div>
            <h1 className="font-bold text-slate-800 text-lg tracking-tight">DentiApp <span className="text-slate-400 font-normal">Dashboard</span></h1>
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
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Sidebar (Left Column) - Controls & Stats */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Date Picker Card */}
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

            {/* KPI Cards */}
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

               <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center justify-between group hover:border-red-200 transition-colors col-span-2 lg:col-span-1">
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cancelados</p>
                    <p className="text-3xl font-bold text-slate-800 mt-1">{stats.cancelled}</p>
                  </div>
                  <div className="w-12 h-12 bg-red-50 rounded-xl flex items-center justify-center text-red-500 group-hover:scale-110 transition-transform">
                    <Ban size={24} />
                  </div>
               </div>
            </div>
          </div>

          {/* Main Content (Right Column) - List */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <h2 className="font-bold text-xl text-slate-800 flex items-center gap-2">
                <Activity className="text-primary-500" />
                Turnos Programados
              </h2>
              
              <div className="flex bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                <button 
                  onClick={() => setFilter('all')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'all' ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Todos
                </button>
                <button 
                  onClick={() => setFilter('pending')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'pending' ? 'bg-blue-50 text-blue-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Pendientes
                </button>
                <button 
                  onClick={() => setFilter('completed')}
                  className={`px-4 py-1.5 text-sm font-medium rounded-md transition-all ${filter === 'completed' ? 'bg-green-50 text-green-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                >
                  Atendidos
                </button>
              </div>
            </div>

            {/* Appointment List */}
            {loading ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100">
                  <div className="w-10 h-10 border-4 border-slate-100 border-t-primary-500 rounded-full animate-spin mb-4"/>
                  <span className="font-medium">Sincronizando agenda...</span>
               </div>
            ) : filteredAppointments.length === 0 ? (
               <div className="h-64 flex flex-col items-center justify-center text-slate-400 bg-white rounded-3xl border border-slate-100 border-dashed">
                 <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                    <Search size={32} className="text-slate-300" />
                 </div>
                 <p className="text-lg font-medium text-slate-600">No hay resultados</p>
                 <p className="text-sm">No se encontraron turnos con el filtro actual.</p>
               </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {filteredAppointments.map(apt => (
                  <div key={apt.id} className="group bg-white p-5 rounded-2xl border border-slate-100 hover:border-primary-200 hover:shadow-md transition-all relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center gap-6">
                     
                     {/* Status Bar */}
                     <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${
                       apt.status === 'confirmed' ? 'bg-blue-500' :
                       apt.status === 'completed' ? 'bg-green-500' :
                       'bg-red-400'
                     }`} />

                     {/* Time */}
                     <div className="flex flex-row sm:flex-col items-center gap-2 sm:gap-0 min-w-[5rem] px-2 sm:border-r border-slate-100">
                        <span className="text-2xl font-bold text-slate-700">{apt.time}</span>
                        <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">HS</span>
                     </div>

                     {/* Info */}
                     <div className="flex-1 w-full">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-bold text-slate-800 text-lg">
                            {apt.patientName || 'Paciente Anónimo'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                            apt.status === 'confirmed' ? 'bg-blue-50 text-blue-600' :
                            apt.status === 'completed' ? 'bg-green-50 text-green-600' :
                            'bg-red-50 text-red-500'
                          }`}>
                            {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'cancelled' ? 'Cancelado' : 'Completado'}
                          </span>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-sm">
                           <span className="font-medium text-primary-600 bg-primary-50 px-2 py-0.5 rounded-md self-start">
                             {apt.treatment}
                           </span>
                           <span className="text-slate-500 flex items-center gap-1.5">
                              <UserIcon size={14} />
                              {apt.doctor}
                           </span>
                        </div>
                     </div>

                     {/* Actions (Future implementation) */}
                     <div className="hidden sm:block opacity-0 group-hover:opacity-100 transition-opacity">
                        <button className="text-slate-400 hover:text-primary-600 transition-colors">
                          <Filter size={20} />
                        </button>
                     </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};