import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle, Key, ArrowLeft } from 'lucide-react';
import { authService } from '../services/api';
import { Logo } from './Logo';

interface AuthProps {
  onLogin: (user: User) => void;
  initialView?: ViewState;
}

export const Auth: React.FC<AuthProps> = ({ onLogin, initialView = ViewState.LOGIN }) => {
  const [view, setView] = useState<ViewState>(initialView);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  // Recovery Fields
  const [token, setToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
					 
      if (view === ViewState.LOGIN) {
        const user = await authService.login(email, password);
        onLogin(user);
      } else if (view === ViewState.REGISTER) {
        const user = await authService.register(name, email, password);
        onLogin(user);
      } else if (view === ViewState.FORGOT_PASSWORD) {
        await authService.forgotPassword(email);
        setSuccessMsg('Si el correo existe, recibirás un token de recuperación. Revisa la consola del backend (simulación).');
        setView(ViewState.RESET_PASSWORD);
      } else if (view === ViewState.RESET_PASSWORD) {
        await authService.resetPassword(email, token, newPassword);
        setSuccessMsg('Contraseña actualizada correctamente. Inicia sesión.');
        setView(ViewState.LOGIN);
        setPassword('');
      }
					
    } catch (err: any) {
      setError(err.message || 'Error en la operación.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = view === ViewState.LOGIN;
  const isForgot = view === ViewState.FORGOT_PASSWORD;
  const isReset = view === ViewState.RESET_PASSWORD;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white relative overflow-hidden">
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-primary-100 rounded-full blur-3xl opacity-50" />
      <div className="absolute -bottom-20 -left-20 w-64 h-64 bg-blue-100 rounded-full blur-3xl opacity-50" />

      <div className="w-full max-w-sm z-10 space-y-8">
        <div className="text-center space-y-4">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-primary-50 rounded-3xl shadow-sm">
              <Logo size="lg" />
            </div>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center justify-center gap-2">
              DentiApp
            </h1>
            <p className="text-slate-500 mt-2">
            {isLogin ? 'Tu sonrisa, nuestra pasión.' : 
               isForgot ? 'Recupera tu acceso' :
               isReset ? 'Crea una nueva contraseña' :
               'Empieza a cuidar tu salud dental.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100 animate-in shake">
              <AlertCircle size={16} />
              {error}
            </div>
          )}
          {successMsg && (
            <div className="bg-green-50 text-green-600 p-3 rounded-xl flex items-center gap-2 text-sm border border-green-100 animate-in fade-in">
              <CheckCircle size={16} />
              {successMsg}
            </div>
          )}

          {view === ViewState.REGISTER && (
            <Input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon size={20} />}
              required
            />
          )}
          {/* Email is needed for Login, Register, Forgot, Reset */}
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
            readOnly={isReset} // Readonly in reset step				
          />
          {(isLogin || view === ViewState.REGISTER) && (
            <Input
              type="password"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              icon={<Lock size={20} />}
              required
            />
          )}

          {isReset && (
             <>
                <Input
                  type="text"
                  placeholder="Token de recuperación"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  icon={<Key size={20} />}
                  required
                />
                <Input
                  type="password"
                  placeholder="Nueva Contraseña"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  icon={<Lock size={20} />}
                  required
                />
             </>
          )}

          <Button type="submit" fullWidth className="mt-6 group shadow-xl shadow-primary-500/20" disabled={loading}>
            {loading ? 'Procesando...' : 
             isLogin ? 'Iniciar Sesión' : 
             view === ViewState.REGISTER ? 'Registrarse' :
             isForgot ? 'Enviar Token' : 'Cambiar Contraseña'}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        
        <div className="text-center space-y-2">
          {isLogin && (
             <button
                type="button"
                onClick={() => {
                   setView(ViewState.FORGOT_PASSWORD);
                   setError(null);
                   setSuccessMsg(null);
                }}
                className="block w-full text-sm text-slate-400 hover:text-slate-600 font-medium transition-colors"
             >
                Olvidé mi contraseña
             </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (isForgot || isReset) {
                  setView(ViewState.LOGIN);
              } else {
                  setView(isLogin ? ViewState.REGISTER : ViewState.LOGIN);
              }
              setError(null);
              setSuccessMsg(null);
            }}
            className="text-sm text-primary-600 hover:text-primary-700 font-medium transition-colors inline-flex items-center gap-1"
          >
             {(isForgot || isReset) && <ArrowLeft size={14} />}
             {(isForgot || isReset) ? 'Volver al inicio' : (isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión')}
          </button>
        </div>
      </div>
    </div>
  );
};

// Helper for success icon
function CheckCircle({size}: {size:number}) {
    return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
}