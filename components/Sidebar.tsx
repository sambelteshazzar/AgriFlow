
import React from 'react';
import { LayoutDashboard, Sprout, TrendingUp, BrainCircuit, Leaf, Beef, GraduationCap, Calculator, Users, ArrowLeft, Gamepad2, Globe, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { NavigationTab } from '../types';

interface SidebarProps {
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  isMobileOpen: boolean;
  setIsMobileOpen: (isOpen: boolean) => void;
  onLogout: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab, isMobileOpen, setIsMobileOpen, onLogout }) => {
  
  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    setIsMobileOpen(false);
  };

  const navItems = [
    { id: NavigationTab.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
    { id: NavigationTab.CROPS, label: 'Crop Manager', icon: Sprout },
    { id: NavigationTab.LIVESTOCK, label: 'Livestock', icon: Beef },
    { id: NavigationTab.MARKET, label: 'Market Analytics', icon: TrendingUp },
    { id: NavigationTab.NEWS, label: 'Global News', icon: Globe },
    { id: NavigationTab.AI_ADVISOR, label: 'AI Advisor', icon: BrainCircuit },
    { id: NavigationTab.CALCULATOR, label: 'Calculator', icon: Calculator },
    { id: NavigationTab.EDUCATION, label: 'Education', icon: GraduationCap },
    { id: NavigationTab.COMMUNITY, label: 'Community', icon: Users },
    { id: NavigationTab.GAMES, label: 'Arcade', icon: Gamepad2 },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-black/60 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsMobileOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 left-0 z-[70] h-full w-64 bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200 shadow-2xl transform transition-transform duration-300 ease-in-out border-r border-slate-100 dark:border-slate-800
          md:translate-x-0 md:static md:h-screen md:shadow-none flex flex-col
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        {/* Branding Header */}
        <div className="flex items-center px-6 h-16 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors shrink-0">
          <div className="bg-green-600 rounded p-1 mr-3">
            <Leaf className="w-5 h-5 text-white" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Agri<span className="text-green-600">Flow</span></h1>
        </div>

        {/* Scrollable Nav Area */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1 custom-scrollbar">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`
                  w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 text-sm font-medium
                  ${isActive 
                    ? 'bg-slate-100 dark:bg-slate-800 text-green-700 dark:text-green-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-slate-900 dark:hover:text-slate-200'
                  }
                `}
              >
                <item.icon 
                  className={`w-5 h-5 mr-3 ${isActive ? 'text-green-600 dark:text-green-400' : 'text-slate-400 dark:text-slate-500'}`} 
                />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 shrink-0">
           <button 
             onClick={() => handleNavClick(NavigationTab.SETTINGS)}
             className={`w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${activeTab === NavigationTab.SETTINGS ? 'bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
           >
             <SettingsIcon className="w-5 h-5 mr-3" />
             Settings
           </button>
           <button 
             onClick={onLogout}
             className="w-full flex items-center px-3 py-2.5 rounded-lg text-sm font-bold uppercase text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
           >
             <LogOut className="w-5 h-5 mr-3" />
             Log Out
           </button>
           <p className="text-center text-[10px] text-slate-400 mt-4">© 2025 AgriFlow Inc.</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
