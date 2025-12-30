import React, { useState, useRef } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { Plus, Trash2, X, Beef, Tag, Activity, FileText, ClipboardList, Calendar, HeartPulse, Image as ImageIcon, Scan, AlertTriangle, Upload, Loader2, Stethoscope, Clipboard, Database } from 'lucide-react';
import { Livestock, LogEntry } from '../types';
import { analyzeCropImage } from '../services/geminiService'; // Reusing the multimodal analysis service
import { INITIAL_LIVESTOCK } from '../constants';

// Helper to provide context-aware default images
const getLivestockImage = (species: string) => {
  const s = species.toLowerCase();
  if (s.includes('cattle') || s.includes('cow') || s.includes('bull')) return 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1000&auto=format&fit=crop';
  if (s.includes('goat')) return 'https://images.unsplash.com/photo-1527153857715-3908f2bae5e8?q=80&w=1000&auto=format&fit=crop';
  if (s.includes('sheep') || s.includes('lamb')) return 'https://images.unsplash.com/photo-1484557985045-edf25e08da73?q=80&w=1000&auto=format&fit=crop';
  if (s.includes('chicken') || s.includes('poultry') || s.includes('hen')) return 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1000&auto=format&fit=crop';
  if (s.includes('pig') || s.includes('swine')) return 'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1000&auto=format&fit=crop';
  if (s.includes('horse')) return 'https://images.unsplash.com/photo-1553284965-83fd3e82fa5a?q=80&w=1000&auto=format&fit=crop';
  // Default Farm Animal
  return 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1000&auto=format&fit=crop';
};

const LivestockManager: React.FC = () => {
  const { livestock, addLivestock, deleteLivestock, updateLivestockStatus, addActivityLog, getLogsByRef, showToast } = useFarm();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newAnimal, setNewAnimal] = useState<Partial<Livestock>>({ 
    name: '', 
    species: 'Cattle', 
    count: 1, 
    status: 'Healthy', 
    grazingType: 'Rotational', 
    imageUrl: getLivestockImage('Cattle'), 
    notes: '' 
  });

  // Records Modal State
  const [isRecordsModalOpen, setIsRecordsModalOpen] = useState(false);
  const [selectedAnimalId, setSelectedAnimalId] = useState<string | null>(null);
  const [animalLogs, setAnimalLogs] = useState<LogEntry[]>([]);
  const [newLog, setNewLog] = useState<{ type: LogEntry['type'], note: string }>({ type: 'Observation', note: '' });

  // Scanner State
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanImage, setScanImage] = useState<string | null>(null);
  const [scanContext, setScanContext] = useState('');
  const [scanResult, setScanResult] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const scanInputRef = useRef<HTMLInputElement>(null);

  const openRecordsModal = async (id: string) => {
    setSelectedAnimalId(id);
    const logs = await getLogsByRef(id);
    setAnimalLogs(logs);
    setIsRecordsModalOpen(true);
  };

  const handleSpeciesChange = (species: string) => {
    setNewAnimal(prev => ({
      ...prev,
      species: species as any,
      imageUrl: getLivestockImage(species)
    }));
  };

  const loadSampleData = async () => {
    for (const animal of INITIAL_LIVESTOCK) {
      await addLivestock(animal as Omit<Livestock, 'id'>);
    }
    showToast("Demo livestock data loaded!", "success");
  };

  const handleLogSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedAnimalId && newLog.note) {
      const entry: Omit<LogEntry, 'id'> = {
        referenceId: selectedAnimalId,
        category: 'LIVESTOCK',
        date: new Date().toISOString(),
        type: newLog.type,
        note: newLog.note
      };
      try {
        await addActivityLog(entry);
        // Fetch fresh logs to ensure integrity and correct IDs
        const updatedLogs = await getLogsByRef(selectedAnimalId);
        setAnimalLogs(updatedLogs);
        setNewLog({ type: 'Observation', note: '' });
      } catch (error) {
        showToast("Failed to save log", "error");
      }
    }
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newAnimal.name && newAnimal.count && newAnimal.count > 0) {
      addLivestock(newAnimal as Omit<Livestock, 'id'>);
      setIsModalOpen(false);
      // Reset form
      setNewAnimal({ 
        name: '', 
        species: 'Cattle', 
        count: 1, 
        status: 'Healthy', 
        grazingType: 'Rotational', 
        imageUrl: getLivestockImage('Cattle'), 
        notes: '' 
      });
    } else {
       showToast("Please enter a valid Herd Name and a Count greater than 0.", "error");
    }
  };

  const handleStatusChange = async (id: string, newStatus: Livestock['status']) => {
    await updateLivestockStatus(id, newStatus);
  };

  // -- Scanner Handlers --
  const handleScanUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => { setScanImage(reader.result as string); setScanResult(''); };
      reader.readAsDataURL(file);
    }
  };

  const performScan = async () => {
    if (!scanImage) return;
    setIsScanning(true);
    try {
      // Reusing the Gemini vision service but with livestock context
      const diagnosis = await analyzeCropImage(scanImage, `LIVESTOCK HEALTH ANALYSIS: ${scanContext}. Check for signs of disease, injury, or malnutrition.`);
      setScanResult(diagnosis);
    } catch {
      setScanResult("Error: Could not complete diagnosis. Please ensure the image is clear.");
    } finally {
      setIsScanning(false);
    }
  };

  const resetScanner = () => { setScanImage(null); setScanContext(''); setScanResult(''); setIsScannerOpen(false); };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Healthy': return 'bg-green-100 text-green-800 border-green-300 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Sick': return 'bg-red-100 text-red-800 border-red-300 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800';
      case 'Quarantined': return 'bg-orange-100 text-orange-800 border-orange-300 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      case 'Lactating': return 'bg-blue-100 text-blue-800 border-blue-300 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      default: return 'bg-slate-100 text-slate-800 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  return (
    <div className="space-y-6 pb-10 animate-fade-in">
      <div className="bg-white dark:bg-slate-900 p-5 rounded-lg shadow-sm border border-slate-300 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4 transition-colors">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Livestock Inventory</h2>
          <p className="text-slate-700 dark:text-slate-300 font-bold mt-1 uppercase text-xs tracking-wide">Monitoring {livestock.reduce((acc, curr) => acc + curr.count, 0)} Head</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setIsScannerOpen(true)} className="flex items-center px-4 py-3 bg-red-600 text-white rounded font-bold uppercase tracking-wide hover:bg-red-700 transition-colors shadow-sm border border-red-800 focus:outline-none focus:ring-2 focus:ring-red-500">
            <Scan className="w-5 h-5 mr-2" /> AI Health Scan
          </button>
          <button onClick={() => setIsModalOpen(true)} className="flex items-center px-6 py-3 bg-slate-800 dark:bg-slate-700 text-white rounded font-bold uppercase tracking-wide hover:bg-slate-900 dark:hover:bg-slate-600 transition-colors shadow-sm border border-slate-900 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500">
            <Plus className="w-5 h-5 mr-2" /> Add Herd Unit
          </button>
        </div>
      </div>

      {livestock.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-16 bg-slate-50 dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 text-center animate-fade-in-up relative overflow-hidden group">
          <div className="absolute inset-0 opacity-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] pointer-events-none"></div>
          <div className="relative z-10 max-w-md">
             <div className="w-24 h-24 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mb-6 shadow-sm mx-auto group-hover:scale-110 transition-transform duration-500">
               <Clipboard className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
             </div>
             <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-3 uppercase tracking-wide">Barn is Empty</h3>
             <p className="text-slate-500 dark:text-slate-400 mb-8 text-sm font-medium leading-relaxed">
               Begin monitoring your herd health, grazing patterns, and veterinary logs by adding your first livestock unit to the system.
             </p>
             <div className="flex flex-col sm:flex-row gap-4 justify-center">
               <button onClick={() => setIsModalOpen(true)} className="px-8 py-3 bg-yellow-500 text-slate-900 font-bold uppercase rounded-lg hover:bg-yellow-400 transition-all shadow-lg active:scale-95 tracking-wide text-xs flex items-center justify-center gap-2">
                 <Plus className="w-4 h-4" /> Register Herd
               </button>
               <button onClick={loadSampleData} className="px-8 py-3 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 font-bold uppercase rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95 tracking-wide text-xs flex items-center justify-center gap-2">
                 <Database className="w-4 h-4" /> Load Sample Herd
               </button>
             </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {livestock.map((animal) => (
            <div key={animal.id} className="bg-white dark:bg-slate-900 rounded border border-slate-200 dark:border-slate-700 border-l-8 border-l-yellow-500 shadow-md hover:shadow-lg transition-all group relative">
              <div className="p-5">
                <div className="flex justify-between items-start mb-4">
                   <div className="flex items-center">
                      <div className="bg-yellow-500 text-slate-900 p-2 rounded-sm mr-3 font-bold shadow-sm"><Tag className="w-5 h-5" /></div>
                      <div>
                         <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase">{animal.name}</h3>
                         <p className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase tracking-wide">{animal.species}</p>
                      </div>
                   </div>
                   <div className="text-right"><span className="block text-3xl font-bold text-slate-800 dark:text-slate-200 font-heading">{animal.count}</span><span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-bold">Count</span></div>
                </div>

                <div className="grid grid-cols-2 gap-2 mb-4">
                   {/* Interactive Status Selector */}
                   <div className={`relative rounded border-2 ${getStatusColor(animal.status)}`}>
                      <select 
                        value={animal.status} 
                        onChange={(e) => handleStatusChange(animal.id, e.target.value as any)}
                        className={`w-full h-full py-2 pl-2 pr-1 bg-transparent text-xs font-bold uppercase appearance-none focus:outline-none cursor-pointer`}
                      >
                        <option value="Healthy" className="text-slate-900 dark:text-slate-900">Healthy</option>
                        <option value="Sick" className="text-slate-900 dark:text-slate-900">Sick</option>
                        <option value="Quarantined" className="text-slate-900 dark:text-slate-900">Quarantined</option>
                        <option value="Lactating" className="text-slate-900 dark:text-slate-900">Lactating</option>
                      </select>
                      <HeartPulse className="w-3 h-3 absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none opacity-50"/>
                   </div>
                   
                   <div className="text-center py-2 px-1 rounded border-2 border-slate-300 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs font-bold uppercase">{animal.grazingType}</div>
                </div>
                
                <div className="h-28 w-full bg-slate-200 dark:bg-slate-800 mb-4 rounded-sm overflow-hidden border border-slate-300 dark:border-slate-700 relative group">
                   <img src={animal.imageUrl} className="w-full h-full object-cover" alt={`${animal.name} photo`} />
                   {animal.notes && (
                     <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity p-4 text-center">
                       <p className="text-white text-xs font-medium italic">"{animal.notes}"</p>
                     </div>
                   )}
                </div>

                <div className="flex gap-2 border-t border-slate-200 dark:border-slate-700 pt-3">
                  <button onClick={() => openRecordsModal(animal.id)} className="flex-1 py-2 text-xs font-bold uppercase tracking-wide bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded transition-colors border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400">Records</button>
                  <button onClick={() => deleteLivestock(animal.id)} className="px-3 py-2 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 rounded hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors border border-slate-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-red-500"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Records Modal */}
      {isRecordsModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg shadow-2xl rounded-md border border-slate-600 max-h-[85vh] flex flex-col">
            <div className="bg-slate-900 p-5 flex justify-between items-center border-b-4 border-yellow-500 shrink-0">
              <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center">
                 <ClipboardList className="w-5 h-5 mr-2 text-yellow-500" /> Herd Records
              </h3>
              <button onClick={() => setIsRecordsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
               {/* Add New Record Form */}
               <form onSubmit={handleLogSubmit} className="mb-6 p-4 bg-slate-50 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700">
                  <h4 className="text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-3">Add Entry</h4>
                  <div className="space-y-3">
                     <select value={newLog.type} onChange={e => setNewLog({...newLog, type: e.target.value as any})} className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded font-bold text-sm text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500">
                        <option value="Observation">General Observation</option>
                        <option value="Action">Vet Visit / Treatment</option>
                        <option value="Input">Feeding</option>
                     </select>
                     <input type="text" value={newLog.note} onChange={e => setNewLog({...newLog, note: e.target.value})} className="w-full p-2 bg-white dark:bg-slate-900 border border-slate-400 dark:border-slate-600 rounded text-sm font-medium text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 focus:outline-none focus:border-yellow-500" placeholder="Details..." required />
                     <button type="submit" className="w-full bg-slate-800 dark:bg-slate-700 text-white py-2 text-xs font-bold uppercase rounded hover:bg-slate-900 dark:hover:bg-slate-600">Save Record</button>
                  </div>
               </form>

               {/* History List */}
               <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-700 dark:text-slate-400 uppercase mb-2">History</h4>
                  {animalLogs.length === 0 ? (
                    <p className="text-sm text-slate-500 italic">No records found.</p>
                  ) : (
                    animalLogs.map((log, idx) => (
                      <div key={idx} className="border-l-2 border-slate-300 dark:border-slate-700 pl-3 pb-3">
                         <div className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase mb-1 flex items-center">
                            <Calendar className="w-3 h-3 mr-1" /> {new Date(log.date).toLocaleDateString()}
                            <span className="ml-2 px-1.5 py-0.5 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-sm">{log.type}</span>
                         </div>
                         <p className="text-sm text-slate-900 dark:text-slate-300 font-medium">{log.note}</p>
                      </div>
                    ))
                  )}
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Add Livestock Modal (Standard Form) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-md" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-slate-900 w-full max-w-lg shadow-2xl rounded-md border border-slate-600 max-h-[90vh] overflow-y-auto">
             <div className="bg-slate-900 p-5 flex justify-between items-center border-b-4 border-yellow-500 sticky top-0 z-10">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center"><Beef className="w-5 h-5 mr-2 text-yellow-500" /> New Herd Entry</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
             </div>
             <div className="p-6">
                <form onSubmit={handleAddSubmit} className="space-y-4">
                   
                   {/* Image Preview Area */}
                   <div className="flex gap-4 items-start bg-slate-50 dark:bg-slate-800 p-3 rounded border border-slate-200 dark:border-slate-700">
                    <div className="w-24 h-24 shrink-0 bg-slate-200 dark:bg-slate-700 rounded border border-slate-300 dark:border-slate-600 overflow-hidden relative group">
                       <img src={newAnimal.imageUrl} alt="Animal Preview" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1">
                       <div className="mb-2">
                         <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1 flex items-center"><ImageIcon className="w-3 h-3 mr-1" /> Image URL</label>
                         <input 
                           type="text" 
                           value={newAnimal.imageUrl} 
                           onChange={e => setNewAnimal({...newAnimal, imageUrl: e.target.value})} 
                           className="w-full px-4 py-2 border-2 border-slate-300 dark:border-slate-600 focus:border-yellow-500 dark:focus:border-yellow-500 rounded-sm font-medium text-slate-900 dark:text-white text-xs bg-white dark:bg-slate-900"
                           placeholder="https://..."
                         />
                       </div>
                       <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Auto-assigned based on species. Replace if you have a specific photo URL.</p>
                    </div>
                  </div>

                   <div><label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Herd ID / Name</label><input autoFocus type="text" value={newAnimal.name} onChange={e => setNewAnimal({...newAnimal, name: e.target.value})} className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-bold text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500" placeholder="e.g. Black Angus Herd #4" required /></div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Species</label>
                        <select value={newAnimal.species} onChange={e => handleSpeciesChange(e.target.value)} className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500">
                          <option value="Cattle">Cattle</option>
                          <option value="Goat">Goat</option>
                          <option value="Sheep">Sheep</option>
                          <option value="Chicken">Chicken</option><option value="Pig">Pig</option>
                        </select>
                      </div>
                      <div><label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Count</label><input type="number" min="1" value={newAnimal.count} onChange={e => setNewAnimal({...newAnimal, count: Number(e.target.value)})} className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-bold text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500" placeholder="e.g. 12" required /></div>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div><label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Status</label><select value={newAnimal.status} onChange={e => setNewAnimal({...newAnimal, status: e.target.value as any})} className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500"><option value="Healthy">Healthy</option><option value="Sick">Sick</option><option value="Quarantined">Quarantined</option><option value="Lactating">Lactating</option></select></div>
                      <div><label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Grazing</label><select value={newAnimal.grazingType} onChange={e => setNewAnimal({...newAnimal, grazingType: e.target.value as any})} className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-bold text-slate-900 dark:text-white bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500"><option value="Rotational">Rotational</option><option value="Free Range">Free Range</option><option value="Feedlot">Feedlot</option></select></div>
                   </div>
                   
                   <div>
                      <label className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Notes</label>
                      <textarea 
                        value={newAnimal.notes} 
                        onChange={e => setNewAnimal({...newAnimal, notes: e.target.value})} 
                        className="w-full px-4 py-3 border-2 border-slate-400 dark:border-slate-600 rounded-sm font-medium text-slate-900 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 bg-white dark:bg-slate-900 focus:outline-none focus:border-yellow-500"
                        rows={2} 
                        placeholder="Location, breed details, or health history..."
                      />
                   </div>

                   <button type="submit" className="w-full bg-yellow-500 text-slate-900 py-4 font-bold uppercase tracking-wider hover:bg-yellow-400 rounded-sm shadow-md">Confirm Entry</button>
                </form>
             </div>
          </div>
        </div>
      )}

      {/* AI Health Scanner Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-md" role="dialog" aria-modal="true">
           <div className="bg-slate-100 dark:bg-slate-900 w-full max-w-2xl shadow-2xl rounded-md flex flex-col max-h-[90vh] border border-slate-600">
              <div className="bg-slate-900 p-5 flex justify-between items-center border-b-4 border-red-600 shrink-0">
                <h3 className="text-xl font-bold text-white uppercase tracking-wider flex items-center"><Stethoscope className="w-5 h-5 mr-2 text-red-500" /> Veterinary Diagnostics AI</h3>
                <button onClick={resetScanner} className="text-slate-400 hover:text-white"><X className="w-6 h-6" /></button>
              </div>
              <div className="p-6 overflow-y-auto">
                 {!scanResult ? (
                   <div className="space-y-6">
                      <div onClick={() => scanInputRef.current?.click()} className={`border-4 border-dashed rounded-lg p-10 flex flex-col items-center justify-center cursor-pointer ${scanImage ? 'border-red-600 bg-red-50 dark:bg-red-900/20' : 'border-slate-500 dark:border-slate-600 bg-white dark:bg-slate-800'}`}>
                         <input type="file" accept="image/*" className="hidden" ref={scanInputRef} onChange={handleScanUpload} />
                         {scanImage ? <img src={scanImage} className="max-h-48 object-contain" /> : <><Upload className="w-12 h-12 text-slate-500 mb-4" /><p className="text-slate-800 dark:text-slate-200 font-bold uppercase">Tap to Upload Photo</p></>}
                      </div>
                      <textarea value={scanContext} onChange={e => setScanContext(e.target.value)} className="w-full p-3 border-2 border-slate-400 dark:border-slate-600 rounded font-medium text-slate-800 dark:text-white placeholder-slate-600 dark:placeholder-slate-400 bg-white dark:bg-slate-800 focus:outline-none focus:border-red-500" placeholder="Add specific observation notes (e.g., lethargy, spots, limping)..." rows={3} />
                      <button onClick={performScan} disabled={!scanImage || isScanning} className="w-full py-4 bg-red-600 text-white font-bold uppercase tracking-widest hover:bg-red-700 rounded-sm shadow-md flex items-center justify-center">
                        {isScanning ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : 'Run Analysis'}
                      </button>
                   </div>
                 ) : (
                   <div className="space-y-4">
                      <div className="bg-white dark:bg-slate-800 border-l-4 border-red-600 p-6 shadow-sm"><p className="whitespace-pre-wrap font-medium text-slate-900 dark:text-white">{scanResult}</p></div>
                      <button onClick={() => setScanResult('')} className="w-full py-3 bg-slate-800 text-white font-bold uppercase rounded-sm">New Scan</button>
                   </div>
                 )}
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default LivestockManager;