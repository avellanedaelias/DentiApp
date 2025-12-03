import React, { useEffect, useState } from 'react';
import { User, Appointment } from '../types';
import { LogOut, Clock, ChevronRight, FileText, AlertCircle, Ban } from 'lucide-react';
import { appointmentService } from '../services/api';

interface ProfileProps {
  user: User;
  onLogout: () => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout }) => {
  const [history, setHistory] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const data = await appointmentService.getByUser(user.id);
        setHistory(data);
      } catch (err) {
        console.error("Error cargando historial", err);
        setError("No pudimos cargar tu historial de turnos.");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user.id]);

  const handleCancel = async (id: string) => {
    if(!window.confirm("¿Estás seguro que deseas cancelar este turno?")) return;

    try {
      //Actualización optimista      
      setHistory(prev => prev.map(apt => apt.id === id ? { ...apt, status: 'cancelled' } : apt));

      await appointmentService.cancel(id);
    } catch (err) {
      console.error("Error cancelando turno", err);
      alert("No pudimos cancelar el turno. Intenta nuevamente.");
      //Revertir cambio optimista
      const data = await appointmentService.getByUser(user.id);
      setHistory(data);
    }
  }

  return (
    <div className="p-6 space-y-8 pb-24 bg-slate-50 min-h-full">
      <header>
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Mi Perfil</h1>
        
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 className="font-bold text-slate-900 text-lg">{user.name}</h2>
            <p className="text-slate-500 text-sm">{user.email}</p>
            {user.phone && <p className="text-slate-400 text-xs mt-1">{user.phone}</p>}
          </div>
        </div>
      </header>

      <section className="space-y-4">
        <h3 className="font-semibold text-slate-800 flex items-center gap-2">
          <Clock size={18} className="text-primary-500"/>
          Historial de Turnos
        </h3>
        
        {loading ? (
           <div className="space-y-3">
             {[1, 2].map(i => (
               <div key={i} className="bg-white p-4 rounded-xl border border-slate-100 h-20 animate-pulse" />
             ))}
           </div>
        ) : error ? (
           <div className="bg-red-50 text-red-500 p-4 rounded-xl text-sm flex items-center gap-2">
             <AlertCircle size={16} />
             {error}
           </div>
        ) : history.length === 0 ? (
           <div className="text-center py-8 text-slate-400 bg-white rounded-xl border border-slate-100 border-dashed">
             <p className="text-sm">Aún no tienes turnos registrados.</p>
           </div>
        ) : (
          <div className="space-y-3">
            {history.map(apt => (
              <div key={apt.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center hover:shadow-sm transition-shadow">
                <div>
                <p className={`font-medium ${apt.status === 'cancelled' ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{apt.treatment}</p>
                  <p className="text-xs text-slate-500">
                    {new Date(apt.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} • {apt.time} hs • {apt.doctor}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase ${
                    apt.status === 'confirmed' ? 'bg-blue-100 text-blue-700' :
                    apt.status === 'completed' ? 'bg-green-100 text-green-700' :
                    apt.status === 'cancelled' ? 'bg-red-50 text-red-500' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {apt.status === 'confirmed' ? 'Confirmado' : apt.status === 'completed' ? 'Completado' : apt.status === 'cancelled' ? 'Cancelado' : apt.status}
                  </span>
                  
                  {apt.status === 'confirmed' && (
                    <button 
                      onClick={() => handleCancel(apt.id)}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      title="Cancelar turno"
                    >
                      <Ban size={18} />
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-2">
        <button className="w-full bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="flex items-center gap-3">
                <FileText size={20} className="text-slate-400"/>
                <span>Mis Estudios</span>
            </div>
            <ChevronRight size={16} className="text-slate-300"/>
        </button>
        <button className="w-full bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center text-slate-700 hover:bg-slate-50 active:scale-95 transition-all">
            <div className="flex items-center gap-3">
                <FileText size={20} className="text-slate-400"/>
                <span>Plan de Tratamiento</span>
            </div>
            <ChevronRight size={16} className="text-slate-300"/>
        </button>
      </section>

      <button 
        onClick={onLogout}
        className="w-full flex items-center justify-center gap-2 text-red-500 font-medium py-4 hover:bg-red-50 rounded-xl transition-colors active:scale-95"
      >
        <LogOut size={20} />
        Cerrar Sesión
      </button>
    </div>
  );
};