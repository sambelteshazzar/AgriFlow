
import React, { useState, useEffect } from 'react';
import { CloudRain, Wind, Droplets, Thermometer, AlertTriangle, Calendar, CheckSquare, Square, MapPin, Activity, ShieldAlert, TrendingDown, Sparkles, Loader2, Navigation, MapPinOff, Globe, ExternalLink, X } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';
import { generateDailyTasks, getLiveAgriIntel } from '../services/geminiService';

const Dashboard: React.FC = () => {
  const { tasks, toggleTask, crops, addTask, userLocation, weather, alerts } = useFarm();
  const [isGenerating, setIsGenerating] = useState(false);
  const [liveIntel, setLiveIntel] = useState<string | null>(null);
  const [isLoadingIntel, setIsLoadingIntel] = useState(false);
  const [showWeatherAlert, setShowWeatherAlert] = useState(true);

  useEffect(() => {
    // Auto-fetch intel on mount
    const fetchIntel = async () => {
      setIsLoadingIntel(true);
      try {
        const intel = await getLiveAgriIntel();
        setLiveIntel(intel);
      } catch (e) {
        console.error("Intel fetch failed", e);
      } finally {
        setIsLoadingIntel(false);
      }
    };
    fetchIntel();
  }, []);

  // Re-show alert if risk condition persists or changes to severe
  useEffect(() => {
    if (weather.climateRiskIndex === 'High' || weather.climateRiskIndex === 'Severe') {
      setShowWeatherAlert(true);
    }
  }, [weather.climateRiskIndex]);

  const getRiskColor = (risk: string) => {
    switch(risk) {
      case 'Low': return 'text-green-600 dark:text-green-500';
      case 'Moderate': return 'text-yellow-600 dark:text-yellow-500';
      case 'High': return 'text-orange-600 dark:text-orange-500';
      case 'Severe': return 'text-red-600 dark:text-red-500 animate-pulse';
      default: return 'text-slate-500';
    }
  };

  const handleTaskKeyDown = (e: React.KeyboardEvent, id: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleTask(id);
    }
  };

  const handleGenerateMissions = async () => {
    setIsGenerating(true);
    try {
      // Fetch AI generated tasks based on context
      const jsonString = await generateDailyTasks(weather, crops);
      
      try {
        const newTasks: string[] = JSON.parse(jsonString);
        // Add each task to the context
        newTasks.forEach(taskText => {
          addTask(taskText);
        });
      } catch (parseError) {
        console.error("Failed to parse AI task response:", jsonString);
        // Fallback or retry logic could go here
      }
    } catch (error) {
      console.error("Failed to generate missions", error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-8">
      
      {/* Weather Risk Alert Banner */}
      {showWeatherAlert && (weather.climateRiskIndex === 'High' || weather.climateRiskIndex === 'Severe') && (
        <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-200 p-4 rounded-r shadow-md flex justify-between items-start animate-fade-in-up">
            <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 mr-3 mt-0.5 flex-shrink-0 animate-pulse text-red-600 dark:text-red-400" />
                <div>
                    <h3 className="font-bold text-lg uppercase tracking-wide">Climate Risk Alert</h3>
                    <p className="text-sm mt-1 font-medium">{weather.forecast}</p>
                </div>
            </div>
            <button 
              onClick={() => setShowWeatherAlert(false)} 
              className="text-red-600 hover:text-red-800 dark:hover:text-red-100 transition-colors p-1"
              aria-label="Dismiss alert"
            >
                <X className="w-5 h-5" />
            </button>
        </div>
      )}

      <header className="mb-6 flex flex-col md:flex-row md:items-end justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Farm Overview</h2>
          <div className="flex items-center mt-1">
             {userLocation.latitude && userLocation.longitude ? (
               <div className="flex items-center text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
                  <Navigation className="w-3 h-3 mr-1.5 text-blue-600 dark:text-blue-400" />
                  {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
               </div>
             ) : (
               <div className="flex items-center text-slate-500 bg-slate-50 dark:bg-slate-900 px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700">
                  <MapPinOff className="w-3 h-3 mr-1.5" />
                  {userLocation.error ? 'Locating Failed' : 'Updating Location...'}
               </div>
             )}
             <span className="mx-3 text-slate-300 dark:text-slate-600">|</span>
             <span className="text-slate-600 dark:text-slate-400 text-sm font-medium">Season 2025</span>
          </div>
        </div>
        <div className="mt-4 md:mt-0 flex items-center gap-3">
           <div className="flex items-center bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700">
             <div className="w-2.5 h-2.5 rounded-full bg-green-500 mr-2.5" aria-hidden="true"></div>
             <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">Systems Active</span>
           </div>
        </div>
      </header>

      {/* Global Intelligence Unit */}
      <section className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 relative overflow-hidden">
         <div className="flex items-start gap-4 relative z-10">
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400">
               <Globe className="w-6 h-6" />
            </div>
            <div className="flex-1">
               <div className="flex justify-between items-center mb-3">
                  <h3 className="text-slate-900 dark:text-white font-bold text-base flex items-center">
                     Global Market Intelligence
                  </h3>
                  {isLoadingIntel && <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />}
               </div>
               <div className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed">
                  {liveIntel ? (
                    liveIntel.split('\n').map((line, i) => <p key={i} className="mb-2 last:mb-0 border-l-2 border-blue-500 pl-3">{line}</p>)
                  ) : (
                    <div className="flex items-center gap-2 text-slate-500 italic">
                       <Loader2 className="w-3 h-3 animate-spin"/>
                       <span>Updating global monitoring feed...</span>
                    </div>
                  )}
               </div>
            </div>
         </div>
      </section>

      {/* Climate & Resource Telemetry */}
      <section 
        className="bg-white dark:bg-slate-900 rounded-xl p-6 shadow-sm border border-slate-200 dark:border-slate-800 transition-colors"
        aria-label="Climate Telemetry"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          <div className="lg:col-span-2 lg:border-r border-slate-100 dark:border-slate-800 lg:pr-8">
             <div className="flex items-center text-slate-600 dark:text-slate-400 mb-3">
                <ShieldAlert className="w-5 h-5 mr-2 text-slate-500" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-wider">Risk Assessment</span>
             </div>
             <div className={`text-4xl font-bold mb-2 ${getRiskColor(weather.climateRiskIndex)}`}>
               {weather.climateRiskIndex} Risk
             </div>
             <div className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed flex items-start">
               <MapPin className="w-4 h-4 mr-2 text-slate-500 mt-0.5 shrink-0" />
               <span>
                 <span className="font-bold text-slate-900 dark:text-white block mb-1">{weather.locationName}</span> 
                 {weather.forecast}
               </span>
             </div>
          </div>
          
          <div className="lg:col-span-3 grid grid-cols-3 gap-4">
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Temp</span>
                   <Thermometer className="w-5 h-5 text-orange-500" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{weather.temp}°C</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">{weather.condition}</div>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Humidity</span>
                   <Droplets className="w-5 h-5 text-blue-500" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{weather.humidity}%</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Moisture Lvl</div>
                </div>
             </div>
             <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 flex flex-col justify-between hover:border-slate-300 dark:hover:border-slate-600 transition-colors">
                <div className="flex justify-between items-start mb-2">
                   <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase">Wind</span>
                   <Wind className="w-5 h-5 text-slate-400" aria-hidden="true" />
                </div>
                <div>
                  <div className="text-2xl font-bold text-slate-900 dark:text-white">{weather.windSpeed} <span className="text-base font-normal text-slate-500">km/h</span></div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1">Speed</div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Operations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Critical Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center">
               <AlertTriangle className="w-5 h-5 mr-2 text-orange-500" aria-hidden="true" />
               Priority Alerts
             </h3>
             {alerts.length > 0 && <span className="bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 text-xs font-bold px-2.5 py-1 rounded-full">{alerts.length} Active</span>}
          </div>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {alerts.length === 0 ? (
              <div className="p-8 text-center text-slate-500 dark:text-slate-400 italic">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto mb-3">
                   <ShieldAlert className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                No critical threats detected.
              </div>
            ) : (
              alerts.map((alert) => (
                <div key={alert.id} className="p-5 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                  <div className="flex justify-between items-start mb-1">
                     <h4 className="font-bold text-slate-900 dark:text-white text-sm">{alert.title}</h4>
                     <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${alert.category === 'FINANCIAL' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-200' : 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200'}`}>
                       {alert.category}
                     </span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400">{alert.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Task Manifest */}
        <div className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
             <div className="flex items-center">
                <Calendar className="w-5 h-5 mr-2 text-slate-500" aria-hidden="true" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Daily Tasks</h3>
             </div>
             
             {/* AI Mission Generator Button */}
             <button 
               onClick={handleGenerateMissions}
               disabled={isGenerating}
               className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 text-sm font-bold transition-colors disabled:opacity-50"
             >
               {isGenerating ? (
                 <Loader2 className="w-4 h-4 animate-spin" />
               ) : (
                 <Sparkles className="w-4 h-4" />
               )}
               {isGenerating ? "Generating..." : "Generate Plan"}
             </button>
          </div>
          
          <div className="bg-slate-50 dark:bg-slate-800/50 px-5 py-3 border-b border-slate-100 dark:border-slate-800 text-xs font-bold text-slate-500 dark:text-slate-400 uppercase flex justify-between tracking-wide">
            <span>Pending: {tasks.filter(t => !t.completed).length}</span>
            <span>Total: {tasks.length}</span>
          </div>

          <div role="list" className="p-0">
             {tasks.map((task) => (
               <div 
                 key={task.id}
                 role="checkbox"
                 aria-checked={task.completed}
                 tabIndex={0}
                 onClick={() => toggleTask(task.id)}
                 onKeyDown={(e) => handleTaskKeyDown(e, task.id)}
                 className={`
                   flex items-center p-4 cursor-pointer border-b border-slate-100 dark:border-slate-800 last:border-0 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors focus:outline-none
                   ${task.completed ? 'opacity-60' : ''}
                 `}
               >
                 <div className={`mr-4 ${task.completed ? 'text-slate-400 dark:text-slate-600' : 'text-green-600 dark:text-green-500'}`}>
                   {task.completed ? <CheckSquare className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                 </div>
                 <div className="flex-1">
                   <p className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-900 dark:text-white'}`}>
                     {task.text}
                   </p>
                   {task.priority === 'high' && !task.completed && (
                     <span className="inline-block mt-1 text-[10px] bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200 px-2 py-0.5 rounded-full font-bold uppercase">
                       Priority
                     </span>
                   )}
                 </div>
               </div>
             ))}
             {tasks.length === 0 && (
               <div className="p-10 text-center">
                 <div className="w-12 h-12 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3 text-slate-400">
                    <Calendar className="w-6 h-6"/>
                 </div>
                 <p className="text-slate-600 dark:text-slate-400 font-medium text-sm">No tasks scheduled.</p>
                 <button onClick={handleGenerateMissions} className="mt-2 text-blue-600 dark:text-blue-400 text-sm font-bold hover:underline">Generate with AI</button>
               </div>
             )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
