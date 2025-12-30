import React, { useState } from 'react';
import { Calculator, Droplets, Sprout, RefreshCw } from 'lucide-react';

const ResourceCalculator: React.FC = () => {
  const [mode, setMode] = useState<'FERTILIZER' | 'IRRIGATION'>('FERTILIZER');

  // Fertilizer State
  const [targetN, setTargetN] = useState<number>(100); // kg/ha
  const [fertType, setFertType] = useState<number>(46); // Urea default N%
  const [area, setArea] = useState<number>(1);
  const [fertResult, setFertResult] = useState<number>(0);

  // Irrigation State
  const [cropFactor, setCropFactor] = useState<number>(1.2); // Kc (Maize mid-season)
  const [et0, setEt0] = useState<number>(5); // mm/day
  const [efficiency, setEfficiency] = useState<number>(0.75); // 75%
  const [irrigationResult, setIrrigationResult] = useState<number>(0);

  const calculateFertilizer = () => {
    // Formula: (Target N / % in Fert) * Area
    const result = (targetN / (fertType / 100)) * area;
    setFertResult(Math.round(result));
  };

  const calculateIrrigation = () => {
    // Formula: (ET0 * Kc * Area(m2)) / Efficiency = Liters
    // 1 ha = 10,000 m2. 1 mm = 1 L/m2.
    const areaM2 = area * 10000; // Assuming input is hectares
    const demandMm = et0 * cropFactor;
    const grossDemandMm = demandMm / efficiency;
    const liters = grossDemandMm * areaM2;
    setIrrigationResult(Math.round(liters));
  };

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-800 dark:border-slate-600 pb-4 transition-colors">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Resource Toolkit</h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wide mt-1">Optimize Inputs & Reduce Waste</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
           <button 
             onClick={() => setMode('FERTILIZER')}
             aria-pressed={mode === 'FERTILIZER'}
             className={`px-4 py-2 rounded font-bold uppercase tracking-wide text-xs border-2 focus:outline-none focus:ring-2 focus:ring-slate-500 transition-colors ${mode === 'FERTILIZER' ? 'bg-slate-900 dark:bg-white text-yellow-500 dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'}`}
           >
             Fertilizer
           </button>
           <button 
             onClick={() => setMode('IRRIGATION')}
             aria-pressed={mode === 'IRRIGATION'}
             className={`px-4 py-2 rounded font-bold uppercase tracking-wide text-xs border-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${mode === 'IRRIGATION' ? 'bg-blue-900 dark:bg-blue-600 text-white border-blue-900 dark:border-blue-600' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-slate-600'}`}
           >
             Irrigation
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Calculation Panel */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded shadow-sm border border-slate-200 dark:border-slate-700 transition-colors">
           <h3 className="text-xl font-bold text-slate-800 dark:text-white uppercase mb-6 flex items-center">
             {mode === 'FERTILIZER' ? <Sprout className="w-6 h-6 mr-2 text-green-600 dark:text-green-400" aria-hidden="true"/> : <Droplets className="w-6 h-6 mr-2 text-blue-600 dark:text-blue-400" aria-hidden="true"/>}
             {mode === 'FERTILIZER' ? 'Nutrient Planner' : 'Water Scheduler'}
           </h3>

           {mode === 'FERTILIZER' ? (
             <div className="space-y-4">
                <div>
                   <label htmlFor="targetN" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Target Nitrogen (N)</label>
                   <div className="flex items-center">
                     <input id="targetN" type="number" value={targetN} onChange={e => setTargetN(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500"/>
                     <span className="ml-2 font-bold text-slate-700 dark:text-slate-400" aria-hidden="true">kg/ha</span>
                   </div>
                </div>
                <div>
                   <label htmlFor="fertType" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Fertilizer Type</label>
                   <select id="fertType" value={fertType} onChange={e => setFertType(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500">
                      <option value={46}>Urea (46% N)</option>
                      <option value={21}>Sulphate of Ammonia (21% N)</option>
                      <option value={33}>Ammonium Nitrate (33% N)</option>
                      <option value={18}>DAP (18% N)</option>
                   </select>
                </div>
                <div>
                   <label htmlFor="fertArea" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Field Area</label>
                   <div className="flex items-center">
                     <input id="fertArea" type="number" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-yellow-500"/>
                     <span className="ml-2 font-bold text-slate-700 dark:text-slate-400" aria-hidden="true">ha</span>
                   </div>
                </div>
                <button onClick={calculateFertilizer} className="w-full bg-slate-900 dark:bg-white text-yellow-500 dark:text-slate-900 py-4 font-bold uppercase tracking-widest hover:bg-slate-800 dark:hover:bg-slate-200 mt-4 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2 rounded transition-colors shadow-lg">Calculate Requirements</button>
             </div>
           ) : (
             <div className="space-y-4">
                <div>
                   <label htmlFor="cropFactor" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Crop Factor (Kc)</label>
                   <select id="cropFactor" value={cropFactor} onChange={e => setCropFactor(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option value={1.2}>Maize (Mid-season)</option>
                      <option value={1.05}>Wheat (Mid-season)</option>
                      <option value={0.8}>Vegetables (Avg)</option>
                      <option value={1.1}>Fruit Trees</option>
                   </select>
                </div>
                <div>
                   <label htmlFor="et0" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Evapotranspiration (ET0)</label>
                   <div className="flex items-center">
                     <input id="et0" type="number" value={et0} onChange={e => setEt0(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"/>
                     <span className="ml-2 font-bold text-slate-700 dark:text-slate-400" aria-hidden="true">mm/day</span>
                   </div>
                </div>
                <div>
                   <label htmlFor="efficiency" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">System Efficiency</label>
                   <select id="efficiency" value={efficiency} onChange={e => setEfficiency(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500">
                      <option value={0.9}>Drip (90%)</option>
                      <option value={0.75}>Sprinkler (75%)</option>
                      <option value={0.5}>Flood (50%)</option>
                   </select>
                </div>
                <div>
                   <label htmlFor="irrArea" className="block text-xs font-bold text-slate-800 dark:text-slate-300 uppercase mb-1">Field Area</label>
                   <div className="flex items-center">
                     <input id="irrArea" type="number" value={area} onChange={e => setArea(Number(e.target.value))} className="w-full p-3 bg-white dark:bg-slate-800 border border-slate-400 dark:border-slate-600 rounded font-bold text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"/>
                     <span className="ml-2 font-bold text-slate-700 dark:text-slate-400" aria-hidden="true">ha</span>
                   </div>
                </div>
                <button onClick={calculateIrrigation} className="w-full bg-blue-900 dark:bg-blue-600 text-white py-4 font-bold uppercase tracking-widest hover:bg-blue-800 dark:hover:bg-blue-500 mt-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 rounded transition-colors shadow-lg">Calculate Water Needs</button>
             </div>
           )}
        </div>

        {/* Results Panel */}
        <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded shadow-lg border-l-8 border-yellow-500 flex flex-col justify-center relative overflow-hidden transition-colors" role="status" aria-live="polite">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent"></div>
           
           <div className="relative z-10 text-center">
              <h4 className="text-slate-300 font-bold uppercase tracking-widest text-sm mb-4">Calculated Output</h4>
              
              {mode === 'FERTILIZER' ? (
                <>
                  <div className="text-7xl font-bold font-heading text-white mb-2">{fertResult}</div>
                  <div className="text-yellow-500 text-xl font-bold uppercase mb-6">Kilograms Needed</div>
                  <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded text-left border border-slate-700">
                    <p className="text-xs text-slate-300 uppercase font-bold mb-2">Cost Estimation</p>
                    <p className="text-sm">At current market rates (~$1.20/kg), this application will cost approximately <span className="text-white font-bold">${(fertResult * 1.2).toFixed(2)}</span>.</p>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-7xl font-bold font-heading text-blue-400 mb-2">{irrigationResult.toLocaleString()}</div>
                  <div className="text-white text-xl font-bold uppercase mb-6">Liters / Day</div>
                  <div className="bg-slate-800 dark:bg-slate-900 p-4 rounded text-left border border-slate-700">
                    <p className="text-xs text-slate-300 uppercase font-bold mb-2">Conservation Tip</p>
                    <p className="text-sm">Switching to Drip Irrigation (90% Eff) would save <span className="text-green-400 font-bold">{(irrigationResult - (irrigationResult * (efficiency/0.9))).toLocaleString()} Liters</span> daily.</p>
                  </div>
                </>
              )}
           </div>
        </div>

      </div>
    </div>
  );
};

export default ResourceCalculator;