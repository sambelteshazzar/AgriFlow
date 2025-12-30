
import React, { useState } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { Save, User, Download, Upload, AlertTriangle, Moon, Sun, Trash2, Shield, MapPin } from 'lucide-react';
import { DB_KEYS } from '../services/persistence';

const Settings: React.FC = () => {
  const { userProfile, updateUserProfile, theme, toggleTheme, resetApp, showToast } = useFarm();
  
  // Profile Form State
  const [formData, setFormData] = useState({
    name: userProfile.name,
    farmName: userProfile.farmName,
    bio: userProfile.bio,
    avatar: userProfile.avatar,
    role: userProfile.role
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleProfileSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    await updateUserProfile(formData);
    setTimeout(() => setIsSaving(false), 800);
  };

  const handleExportData = () => {
    const data: Record<string, any> = {};
    Object.values(DB_KEYS).forEach(key => {
      const item = localStorage.getItem(key);
      if (item) {
        try {
          data[key] = JSON.parse(item);
        } catch {
          data[key] = item;
        }
      }
    });
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agriflow_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    showToast('Backup download started', 'success');
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        Object.keys(data).forEach(key => {
          if (Object.values(DB_KEYS).includes(key)) {
            localStorage.setItem(key, JSON.stringify(data[key]));
          }
        });
        showToast('Data imported successfully. Reloading...', 'success');
        setTimeout(() => window.location.reload(), 1500);
      } catch (err) {
        showToast('Failed to parse backup file', 'error');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-10 animate-fade-in">
      <div className="border-b-4 border-slate-800 dark:border-slate-600 pb-4 mb-8">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">System Settings</h2>
        <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wide mt-1">Configuration & Data Management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* PROFILE CARD */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
           <div className="flex items-center gap-3 mb-6 border-b border-slate-100 dark:border-slate-800 pb-4">
              <User className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase">Profile Settings</h3>
           </div>
           
           <form onSubmit={handleProfileSave} className="space-y-4">
              <div className="flex items-center gap-4 mb-4">
                 <img src={formData.avatar} alt="Avatar Preview" className="w-16 h-16 rounded-full border-4 border-slate-200 dark:border-slate-700 object-cover" />
                 <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Avatar URL</label>
                    <input 
                      type="text" 
                      value={formData.avatar} 
                      onChange={e => setFormData({...formData, avatar: e.target.value})}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                 </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Display Name</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={e => setFormData({...formData, name: e.target.value})}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-bold focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                 </div>
                 <div>
                    <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Role Title</label>
                    <input 
                      type="text" 
                      value={formData.role} 
                      onChange={e => setFormData({...formData, role: e.target.value})}
                      className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-medium focus:outline-none focus:border-blue-500 dark:text-white"
                    />
                 </div>
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Farm Name</label>
                 <input 
                   type="text" 
                   value={formData.farmName} 
                   onChange={e => setFormData({...formData, farmName: e.target.value})}
                   className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-bold focus:outline-none focus:border-blue-500 dark:text-white"
                 />
              </div>

              <div>
                 <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase mb-1">Bio</label>
                 <textarea 
                   value={formData.bio} 
                   onChange={e => setFormData({...formData, bio: e.target.value})}
                   rows={3}
                   className="w-full p-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded text-sm font-medium focus:outline-none focus:border-blue-500 resize-none dark:text-white"
                 />
              </div>

              <button 
                type="submit" 
                disabled={isSaving}
                className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded font-bold uppercase tracking-wide transition-colors flex items-center justify-center gap-2"
              >
                {isSaving ? 'Saving...' : <><Save className="w-4 h-4" /> Update Profile</>}
              </button>
           </form>
        </div>

        {/* PREFERENCES & DATA */}
        <div className="space-y-8">
           {/* Appearance */}
           <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                 <Sun className="w-5 h-5 text-yellow-500" /> Interface
              </h3>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                 <div>
                    <span className="block font-bold text-slate-800 dark:text-white text-sm">Theme Mode</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">Toggle between light and dark interface</span>
                 </div>
                 <button 
                   onClick={toggleTheme}
                   className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${theme === 'dark' ? 'bg-blue-600' : 'bg-slate-300'}`}
                 >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`} />
                 </button>
              </div>
           </div>

           {/* Data Management */}
           <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 p-6">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white uppercase mb-4 flex items-center gap-2">
                 <Shield className="w-5 h-5 text-green-500" /> Data Center
              </h3>
              
              <div className="space-y-4">
                 <div className="grid grid-cols-2 gap-4">
                    <button onClick={handleExportData} className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group">
                       <Download className="w-6 h-6 text-slate-400 group-hover:text-blue-500 mb-2" />
                       <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Backup Data</span>
                    </button>
                    <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors group cursor-pointer">
                       <Upload className="w-6 h-6 text-slate-400 group-hover:text-green-500 mb-2" />
                       <span className="text-xs font-bold uppercase text-slate-600 dark:text-slate-300">Import Data</span>
                       <input type="file" accept=".json" className="hidden" onChange={handleImportData} />
                    </label>
                 </div>

                 <div className="border-t border-slate-100 dark:border-slate-800 pt-4">
                    <h4 className="text-xs font-black text-red-600 uppercase mb-2 flex items-center gap-1">
                       <AlertTriangle className="w-4 h-4" /> Danger Zone
                    </h4>
                    <p className="text-xs text-slate-500 mb-3">Irreversibly wipe all local data and return to factory settings.</p>
                    <button 
                      onClick={() => { if(confirm('Are you sure? All farm data will be lost.')) resetApp() }}
                      className="w-full py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800 rounded font-bold uppercase text-xs hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors flex items-center justify-center gap-2"
                    >
                       <Trash2 className="w-4 h-4" /> Factory Reset
                    </button>
                 </div>
              </div>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
