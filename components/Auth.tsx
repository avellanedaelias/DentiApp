import React, { useState } from 'react';
import { User, ViewState } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { Mail, Lock, User as UserIcon, ArrowRight, AlertCircle } from 'lucide-react';
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      let user: User;
      if (view === ViewState.LOGIN) {
        user = await authService.login(email, password);
      } else {
        user = await authService.register(name, email, password);
      }
      onLogin(user);
    } catch (err) {
      setError('Credenciales inválidas o error de conexión.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = view === ViewState.LOGIN;

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
              {isLogin ? 'Tu sonrisa, nuestra pasión.' : 'Empieza a cuidar tu salud dental.'}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-500 p-3 rounded-xl flex items-center gap-2 text-sm border border-red-100">
              <AlertCircle size={16} />
              {error}
            </div>
          )}

          {!isLogin && (
            <Input
              type="text"
              placeholder="Nombre completo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              icon={<UserIcon size={20} />}
              required
            />
          )}
          <Input
            type="email"
            placeholder="correo@ejemplo.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            icon={<Mail size={20} />}
            required
          />
          <Input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock size={20} />}
            required
          />

          <Button type="submit" fullWidth className="mt-6 group shadow-xl shadow-primary-500/20" disabled={loading}>
            {loading ? 'Procesando...' : (isLogin ? 'Iniciar Sesión' : 'Registrarse')}
            {!loading && <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />}
          </Button>
        </form>

        <div className="text-center">
          <button
            type="button"
            onClick={() => {
              setView(isLogin ? ViewState.REGISTER : ViewState.LOGIN);
              setError(null);
            }}
            className="text-sm text-slate-600 hover:text-primary-600 font-medium transition-colors"
          >
            {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
          </button>
        </div>
      </div>
    </div>
  );
};