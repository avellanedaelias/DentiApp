import React from 'react';
import { ViewState } from '../types';
import { Home, Calendar, MessageCircle, User } from 'lucide-react';

interface NavBarProps {
  currentView: ViewState;
  onChangeView: (view: ViewState) => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentView, onChangeView }) => {
  // Hide navbar in login/register
  if (currentView === ViewState.LOGIN || currentView === ViewState.REGISTER) return null;

  const navItems = [
    { view: ViewState.HOME, icon: Home, label: 'Inicio' },
    { view: ViewState.BOOKING, icon: Calendar, label: 'Turnos' },
    { view: ViewState.CHAT, icon: MessageCircle, label: 'Asistente' },
    { view: ViewState.PROFILE, icon: User, label: 'Perfil' },
  ];

  return (
    <div className="fixed bottom-0 left-0 w-full bg-white border-t border-slate-200 pb-safe pt-2 px-6 z-50">
      <div className="flex justify-between items-center max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.view;
          return (
            <button
              key={item.label}
              onClick={() => onChangeView(item.view)}
              className={`nav-item ${isActive ? 'nav-item-active' : 'nav-item-inactive'}`}
            >
              <div className={`nav-icon-bg ${isActive ? 'nav-icon-bg-active' : ''}`}>
                 <item.icon size={24} strokeWidth={isActive ? 2.5 : 2} />
              </div>
              <span className={`text-[10px] font-medium ${isActive ? 'opacity-100' : 'opacity-0 hidden'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};