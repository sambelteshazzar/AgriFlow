
import React, { useState, useEffect } from 'react';
import { Menu, Wifi, WifiOff, Globe, Bell, X, AlertTriangle, TrendingUp, Info, LogIn, User, Loader2, CheckCircle, AlertCircle, Info as InfoIcon } from 'lucide-react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import CropManager from './components/CropManager';
import LivestockManager from './components/LivestockManager';
import EducationHub from './components/EducationHub';
import MarketAnalytics from './components/MarketAnalytics';
import NewsHub from './components/NewsHub';
import AIAdvisor from './components/AIAdvisor';
import ResourceCalculator from './components/ResourceCalculator';
import CommunityHub from './components/CommunityHub';
import GamesHub from './components/GamesHub';
import GetStarted from './components/GetStarted';
import SettingsPage from './components/Settings';
import VoiceAgent from './components/VoiceAgent'; // Import Global Agent
import { NavigationTab } from './types';
import { FarmProvider, useFarm } from './contexts/FarmContext';

const AppContent: React.FC = () => {
  const { userProfile, alerts, isSignedIn, login, logout, toasts, removeToast, currentView, navigate } = useFarm();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  
  // Persist hasStarted state
  const [hasStarted, setHasStarted] = useState(() => {
    return localStorage.getItem('agriflow_has_started') === 'true';
  });

  const [isOnline, setIsOnline] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  
  // Auth Modal State
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authEmail, setAuthEmail] = useState('');
  const [authName, setAuthName] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const unreadAlerts = alerts.length;

  const handleStart = () => {
    setHasStarted(true);
    localStorage.setItem('agriflow_has_started', 'true');
  };

  const renderContent = () => {
    switch (currentView) {
      case NavigationTab.DASHBOARD:
        return <Dashboard />;
      case NavigationTab.CROPS:
        return <CropManager />;
      case NavigationTab.LIVESTOCK:
        return <LivestockManager />;
      case NavigationTab.CALCULATOR:
        return <ResourceCalculator />;
      case NavigationTab.COMMUNITY:
        return <CommunityHub />;
      case NavigationTab.EDUCATION:
        return <EducationHub />;
      case NavigationTab.MARKET:
        return <MarketAnalytics />;
      case NavigationTab.NEWS:
        return <NewsHub />;
      case NavigationTab.AI_ADVISOR:
        return <AIAdvisor />;
      case NavigationTab.GAMES:
        return <GamesHub />;
      case NavigationTab.SETTINGS:
        return <SettingsPage />;
      default:
        return <Dashboard />;
    }
  };

  const getPageTitle = (tab: NavigationTab) => {
    switch(tab) {
      case NavigationTab.AI_ADVISOR: return 'AI Consultant';
      case NavigationTab.CALCULATOR: return 'Resource Tools';
      case NavigationTab.COMMUNITY: return 'Community Hub';
      case NavigationTab.CROPS: return 'Field Operations';
      case NavigationTab.DASHBOARD: return 'Command Center';
      case NavigationTab.EDUCATION: return 'Training';
      case NavigationTab.LIVESTOCK: return 'Livestock';
      case NavigationTab.MARKET: return 'Market Data';
      case NavigationTab.NEWS: return 'Global Wire';
      case NavigationTab.GAMES: return 'Arcade';
      case NavigationTab.SETTINGS: return 'System Configuration';
      default: return 'AgriFlow';
    }
  };

  const handleLogout = () => {
    logout(); 
    setHasStarted(false); 
    localStorage.removeItem('agriflow_has_started');
    navigate(NavigationTab.DASHBOARD);
    setIsMobileOpen(false);
  };

  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authEmail && authName) {
      setIsAuthenticating(true);
      await login(authName, authEmail);
      setIsAuthenticating(false);
      setIsAuthModalOpen(false);
      setAuthEmail('');
      setAuthName('');
    }
  };

  if (!hasStarted) {
    return <GetStarted onStart={handleStart} />;
  }

  return (
    <div className="flex h-screen h-[100dvh] bg-[#FDFCF8] dark:bg-slate-950 overflow-hidden relative transition-colors duration-300">
      
      {/* GLOBAL TOAST CONTAINER */}
      <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-3 pointer-events-none">
        {toasts.map(toast => (
          <div 
            key={toast.id}
            className={`
              pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl backdrop-blur-md border animate-fade-in-up min-w-[300px] max-w-sm
              ${toast.type === 'success' ? 'bg-green-50/90 dark:bg-green-900/90 border-green-200 dark:border-green-800 text-green-800 dark:text-green-100' : ''}
              ${toast.type === 'error' ? 'bg-red-50/90 dark:bg-red-900/90 border-red-200 dark:border-red-800 text-red-800 dark:text-red-100' : ''}
              ${toast.type === 'info' ? 'bg-slate-50/90 dark:bg-slate-800/90 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100' : ''}
            `}
          >
            <div className="shrink-0">
              {toast.type === 'success' && <CheckCircle className="w-5 h-5" />}
              {toast.type === 'error' && <AlertCircle className="w-5 h-5" />}
              {toast.type === 'info' && <InfoIcon className="w-5 h-5" />}
            </div>
            <p className="text-sm font-bold flex-1">{toast.message}</p>
            <button onClick={() => removeToast(toast.id)} className="opacity-60 hover:opacity-100 transition-opacity">
              <X className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>

      {/* --- GLOBAL VOICE AGENT --- */}
      <VoiceAgent />

      {/* SIGN IN MODAL */}
      {isAuthModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md animate-fade-in">
           <div className="bg-white dark:bg-slate-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800">
              <div className="p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-between items-center">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Access Terminal</h3>
                 <button onClick={() => setIsAuthModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"><X className="w-6 h-6"/></button>
              </div>
              <form onSubmit={handleSignInSubmit} className="p-8 space-y-5">
                 <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-yellow-500 rounded-full mx-auto flex items-center justify-center mb-4 shadow-lg shadow-yellow-500/20">
                       <User className="w-8 h-8 text-slate-900" />
                    </div>
                    <p className="text-sm text-slate-600 dark:text-slate-300 font-medium">Sign in to your AgriFlow account to sync data.</p>
                 </div>
                 
                 <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-1">Operator Name</label>
                    <input 
                      type="text" 
                      value={authName} 
                      onChange={e => setAuthName(e.target.value)} 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500" 
                      placeholder="e.g. John Doe"
                      autoFocus
                      required
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-1">Email Address</label>
                    <input 
                      type="email" 
                      value={authEmail} 
                      onChange={e => setAuthEmail(e.target.value)} 
                      className="w-full p-3 bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-lg font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500" 
                      placeholder="name@example.com"
                      required
                    />
                 </div>
                 <button 
                   type="submit" 
                   disabled={isAuthenticating}
                   className="w-full py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-black uppercase tracking-widest rounded-lg hover:opacity-90 transition-opacity shadow-xl flex items-center justify-center gap-2"
                 >
                   {isAuthenticating ? <Loader2 className="w-5 h-5 animate-spin"/> : <LogIn className="w-5 h-5"/>}
                   {isAuthenticating ? 'Authenticating...' : 'Initialize Session'}
                 </button>
              </form>
           </div>
        </div>
      )}

      {/* Sidebar Component */}
      <Sidebar 
        activeTab={currentView} 
        setActiveTab={navigate} 
        isMobileOpen={isMobileOpen}
        setIsMobileOpen={setIsMobileOpen}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden w-full relative">
        
        {/* TOP HEADER (Desktop & Mobile) */}
        <header className="h-20 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0 flex items-center justify-between px-4 md:px-8 z-20 shadow-sm transition-colors">
            
            {/* Left: Mobile Toggle & Page Title */}
            <div className="flex items-center">
              <button 
                onClick={() => setIsMobileOpen(true)}
                className="md:hidden p-2 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg mr-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                aria-label="Open Navigation Menu"
              >
                <Menu className="w-6 h-6" aria-hidden="true" />
              </button>
              <div>
                  <h1 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight font-heading">
                    {getPageTitle(currentView)}
                  </h1>
                  <p className="text-[10px] md:text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest hidden md:block">
                    System Status: Nominal
                  </p>
              </div>
            </div>

            {/* Right: Profile & Controls */}
            <div className="flex items-center gap-2 md:gap-6">
              
              {/* System Controls (Hidden on small mobile) */}
              <div className="hidden md:flex items-center gap-3 border-r border-slate-200 dark:border-slate-800 pr-6">
                  <button 
                    onClick={() => setIsOnline(!isOnline)}
                    className={`flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border ${isOnline ? 'bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800' : 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800'}`}
                  >
                    {isOnline ? <Wifi className="w-3 h-3 mr-2" /> : <WifiOff className="w-3 h-3 mr-2" />}
                    {isOnline ? 'Online' : 'Offline'}
                  </button>
                  <button className="flex items-center px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
                    <Globe className="w-3 h-3 mr-2" /> EN-US
                  </button>
                  
                  {/* Notifications Dropdown */}
                  <div className="relative">
                    <button 
                      onClick={() => setShowNotifications(!showNotifications)}
                      className="relative p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors focus:outline-none"
                    >
                      <Bell className="w-5 h-5" />
                      {unreadAlerts > 0 && <span className="absolute top-1.5 right-2 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-slate-900"></span>}
                    </button>

                    {showNotifications && (
                      <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-slate-900 rounded-lg shadow-xl border border-slate-200 dark:border-slate-800 z-50 animate-fade-in-up">
                        <div className="bg-slate-50 dark:bg-slate-800 p-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
                            <h3 className="text-xs font-bold text-slate-800 dark:text-white uppercase tracking-wider">Alerts ({unreadAlerts})</h3>
                            <button onClick={() => setShowNotifications(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                              <X className="w-4 h-4" />
                            </button>
                        </div>
                        <div className="max-h-96 overflow-y-auto">
                           {alerts.length > 0 ? alerts.map(alert => (
                             <div key={alert.id} className="p-4 border-b border-slate-100 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors cursor-pointer group">
                                <div className="flex items-start gap-3">
                                   <div className="bg-red-100 dark:bg-red-900/30 p-1.5 rounded-full text-red-600 dark:text-red-400 mt-0.5"><AlertTriangle className="w-4 h-4" /></div>
                                   <div>
                                      <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-red-700 dark:group-hover:text-red-400">{alert.title}</p>
                                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">{alert.message}</p>
                                      <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Just now</p>
                                   </div>
                                </div>
                             </div>
                           )) : (
                             <div className="p-4 text-center text-slate-400 text-xs">No active alerts</div>
                           )}
                        </div>
                        <div className="bg-slate-50 dark:bg-slate-800 p-2 border-t border-slate-200 dark:border-slate-700 text-center">
                            <button className="text-[10px] font-bold uppercase text-slate-500 hover:text-slate-800 dark:hover:text-slate-300">Mark all as read</button>
                        </div>
                      </div>
                    )}
                  </div>
              </div>

              {/* User Profile / Sign In */}
              {isSignedIn ? (
                <div className="flex items-center gap-3">
                    <div className="text-right hidden md:block">
                      <p className="text-sm font-bold text-slate-900 dark:text-white leading-none">{userProfile.name}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400 font-bold uppercase mt-1 tracking-wide">{userProfile.role}</p>
                    </div>
                    <div 
                      onClick={() => navigate(NavigationTab.SETTINGS)} 
                      className="relative cursor-pointer group"
                      title="Settings"
                    >
                      <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-slate-900 dark:bg-slate-800 text-yellow-500 flex items-center justify-center font-bold text-lg border-2 border-white dark:border-slate-700 shadow-md group-hover:bg-slate-800 dark:group-hover:bg-slate-700 transition-colors overflow-hidden">
                        {userProfile.avatar ? (
                          <img 
                            src={userProfile.avatar} 
                            alt="Profile" 
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              // Fallback to UI Avatars if image fails
                              e.currentTarget.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(userProfile.name)}&background=random`;
                            }}
                          />
                        ) : (
                          userProfile.name.charAt(0)
                        )}
                      </div>
                      <div className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-white dark:border-slate-900 ${isOnline ? 'bg-green-500' : 'bg-red-500'} shadow-sm`}></div>
                    </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-yellow-500 hover:bg-yellow-400 text-slate-900 rounded-lg font-bold text-xs uppercase tracking-wide transition-all shadow-md active:scale-95"
                >
                  <LogIn className="w-4 h-4" /> Sign In
                </button>
              )}

            </div>
        </header>

        {/* Scrollable Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-[#F1F5F9] dark:bg-[#020617] transition-colors">
          <div className="max-w-7xl mx-auto h-full">
            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <FarmProvider>
      <AppContent />
    </FarmProvider>
  );
}

export default App;
