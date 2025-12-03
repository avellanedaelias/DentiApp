import React, { useEffect, useState } from 'react';
import { User, Appointment, ViewState, AppNotification } from '../types';
import { Calendar, Clock, Plus, Activity, Star, Bell, X } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip } from 'recharts';
import { appointmentService, notificationService } from '../services/api';
import { Logo } from './Logo';

interface HomeProps {
  user: User;
  onChangeView: (view: ViewState) => void;
}

const mockHealthData = [
  { month: 'Ene', score: 85 },
  { month: 'Feb', score: 88 },
  { month: 'Mar', score: 90 },
  { month: 'Abr', score: 85 },
  { month: 'May', score: 92 },
  { month: 'Jun', score: 95 },
];

export const Home: React.FC<HomeProps> = ({ user, onChangeView }) => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appData, notifData] = await Promise.all([
           appointmentService.getByUser(user.id),
           notificationService.getUnread(user.id)
        ]);
        setAppointments(appData);
        setNotifications(notifData);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [user.id]);

  const handleMarkRead = async (id: number) => {
    try {
      await notificationService.markAsRead(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (error) {
      console.error("Error marking read", error);
    }
  };

  // Find the next confirmed appointment
  const nextAppointment = appointments.find(a => 
    a.status === 'confirmed' && new Date(a.date + 'T' + a.time) >= new Date()
  ) || appointments[0]; 

  return (
    <div className="p-6 space-y-8 pb-24 relative">
      <header className="flex justify-between items-center animate-in fade-in duration-500">
        <div className="flex items-center gap-3">
          <div className="bg-white p-2 rounded-xl shadow-sm border border-slate-100">
             <Logo size="sm" />
          </div>
          <div>
            <h2 className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Hola de nuevo</h2>
            <h1 className="text-xl font-bold text-slate-900">{user.name.split(' ')[0]}</h1>
          </div>
        </div>
        
        {/* Notification Bell */}
        <div className="relative">
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-slate-600 shadow-sm border border-slate-100 hover:bg-slate-50 transition-colors"
          >
            <Bell size={20} />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full animate-bounce">
                {notifications.length}
              </span>
            )}
          </button>

          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 top-12 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 p-2 z-50 animate-in slide-in-from-top-2">
              <div className="flex justify-between items-center px-3 py-2 border-b border-slate-50 mb-2">
                <span className="font-bold text-sm text-slate-800">Notificaciones</span>
                <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              </div>
              
              <div className="max-h-60 overflow-y-auto space-y-1">
                {notifications.length === 0 ? (
                  <div className="text-center py-6 text-slate-400 text-xs">
                    <Bell size={24} className="mx-auto mb-2 opacity-20" />
                    No tienes notificaciones nuevas.
                  </div>
                ) : (
                  notifications.map(notif => (
                    <div key={notif.id} className="p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors relative group">
                       <p className="text-xs text-slate-800 font-medium leading-relaxed pr-6">
                         {notif.message}
                       </p>
                       <div className="flex justify-between items-center mt-2">
                          <span className="text-[10px] text-slate-400">{notif.createdAt}</span>
                          <button 
                            onClick={(e) => { e.stopPropagation(); handleMarkRead(notif.id); }}
                            className="text-[10px] text-primary-600 font-bold hover:underline"
                          >
                            Marcar leída
                          </button>
                       </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Next Appointment Card */}
      <section className="animate-in slide-in-from-bottom-4 duration-500 delay-100">
        <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Próximo Turno</h3>
          <button className="text-sm text-primary-600 font-medium hover:underline">Ver todos</button>
        </div>
        
        {loading ? (
          <div className="card-base p-8 text-center text-slate-400 flex flex-col items-center gap-2">
             <div className="w-6 h-6 border-2 border-slate-200 border-t-primary-500 rounded-full animate-spin"/>
             <span className="text-xs">Cargando...</span>
          </div>
        ) : nextAppointment ? (
          <div className="bg-primary-600 rounded-2xl p-5 text-white shadow-xl shadow-primary-500/30 relative overflow-hidden group cursor-pointer transition-transform hover:scale-[1.02]">
            <div className="absolute -top-10 -right-10 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Calendar size={140} />
            </div>
            
            <div className="relative z-10">
              <div className="flex items-start justify-between mb-6">
                <div>
                  <span className="inline-block px-2 py-1 bg-white/10 rounded-md text-xs font-medium text-primary-100 mb-2 backdrop-blur-sm border border-white/10">
                    {nextAppointment.treatment}
                  </span>
                  <h4 className="text-lg font-bold leading-tight">{nextAppointment.doctor}</h4>
                </div>
                <span className="bg-white text-primary-700 px-3 py-1 rounded-full text-xs font-bold shadow-sm">
                  {nextAppointment.status === 'confirmed' ? 'Confirmado' : nextAppointment.status}
                </span>
              </div>
              
              <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Calendar size={16} />
                  <span className="text-sm font-medium">
                    {new Date(nextAppointment.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-lg backdrop-blur-sm">
                  <Clock size={16} />
                  <span className="text-sm font-medium">{nextAppointment.time} Hs</span>
                </div>
              </div>
            </div>
          </div>
        ) : (
           <div className="card-base p-6 flex flex-col items-center justify-center text-slate-500 gap-3 py-10">
             <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                <Calendar size={24} />
             </div>
             <p className="text-sm">No tienes turnos programados.</p>
           </div>
        )}
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-2 gap-4 animate-in slide-in-from-bottom-4 duration-500 delay-200">
        <button 
          onClick={() => onChangeView(ViewState.BOOKING)}
          className="card-base hover:shadow-md transition-all p-4 flex flex-col items-center justify-center gap-3 group border-transparent hover:border-primary-100 active:scale-95"
        >
          <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center text-green-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
            <Plus size={28} />
          </div>
          <span className="font-semibold text-slate-700 text-sm">Nuevo Turno</span>
        </button>

        <button 
           onClick={() => onChangeView(ViewState.CHAT)}
          className="card-base hover:shadow-md transition-all p-4 flex flex-col items-center justify-center gap-3 group border-transparent hover:border-purple-100 active:scale-95"
        >
          <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform duration-300 shadow-sm">
             <Activity size={28} />
          </div>
          <span className="font-semibold text-slate-700 text-sm">Consultar IA</span>
        </button>
      </section>

      {/* Health Chart */}
      <section className="animate-in slide-in-from-bottom-4 duration-500 delay-300">
         <div className="flex justify-between items-center mb-3">
          <h3 className="font-semibold text-slate-800">Salud Dental</h3>
          <div className="flex items-center gap-1 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-full text-xs font-bold border border-yellow-100">
            <Star size={12} fill="currentColor" />
            <span>9.5/10</span>
          </div>
        </div>
        <div className="h-48 w-full card-base p-4">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={mockHealthData}>
              <defs>
                <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Tooltip 
                contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px -2px rgb(0 0 0 / 0.1)' }}
                itemStyle={{ color: '#0ea5e9', fontWeight: 'bold' }}
              />
              <Area 
                type="monotone" 
                dataKey="score" 
                stroke="#0ea5e9" 
                strokeWidth={3}
                fillOpacity={1} 
                fill="url(#colorScore)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  );
};