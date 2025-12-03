import React, { useState } from 'react';
import { ViewState, User } from './types';
import { Auth } from './components/Auth';
import { Home } from './components/Home';
import { NavBar } from './components/NavBar';
import { Booking } from './components/Booking';
import { Chat } from './components/Chat';
import { Profile } from './components/Profile';
import { AdminPanel } from './components/AdminPanel';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<ViewState>(ViewState.LOGIN);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    
    // Simple Admin Check logic
    if (loggedInUser.email === 'admin@denti.app') {
      setCurrentView(ViewState.ADMIN);
    } else {
      setCurrentView(ViewState.HOME);
    }
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView(ViewState.LOGIN);
  };

  // --- ADMIN VIEW (WEB / DESKTOP) ---
  // Renders full screen, bypassing the mobile container
  if (currentView === ViewState.ADMIN && user) {
    return <AdminPanel user={user} onLogout={handleLogout} />;
  }

  // --- USER VIEW (MOBILE APP SIMULATION) ---
  return (
    <div className="bg-slate-100 min-h-screen flex justify-center">
      {/* Mobile Container simulation */}
      <div className="w-full max-w-md bg-white h-screen overflow-hidden shadow-2xl relative flex flex-col">
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-hidden relative">
          {currentView === ViewState.LOGIN || currentView === ViewState.REGISTER ? (
            <Auth onLogin={handleLogin} initialView={currentView} />
          ) : (
            <>
              {currentView === ViewState.HOME && user && (
                <div className="h-full overflow-y-auto no-scrollbar">
                  <Home user={user} onChangeView={setCurrentView} />
                </div>
              )}
              
              {currentView === ViewState.BOOKING && user && (
                <div className="h-full pb-20">
                  <Booking onChangeView={setCurrentView} user={user} />
                </div>
              )}

              {currentView === ViewState.CHAT && user && (
                 <div className="h-full pb-20"> 
                   <Chat user={user} />
                 </div>
              )}
              
              {currentView === ViewState.PROFILE && user && (
                 <div className="h-full overflow-y-auto no-scrollbar">
                  <Profile user={user} onLogout={handleLogout} />
                 </div>
              )}
            </>
          )}
        </main>

        {/* Navigation Bar - Only show for normal users */}
        {user && (
          <NavBar currentView={currentView} onChangeView={setCurrentView} />
        )}
      </div>
    </div>
  );
};

export default App;