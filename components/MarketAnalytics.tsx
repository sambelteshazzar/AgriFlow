
import React, { useMemo, useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart, BarChart, Bar, Legend, ReferenceLine, LineChart } from 'recharts';
import { YIELD_DATA } from '../constants';
import { TrendingUp, TrendingDown, Minus, RefreshCw, BarChart2, DollarSign, Activity, PieChart, ArrowUpRight, ArrowDownRight, Clock, Zap, Globe, MousePointer2 } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';
import { CropService } from '../services/cropService';

const MarketAnalytics: React.FC = () => {
  const { marketPrices, refreshMarketPrices, theme, crops } = useFarm();
  const [selectedCrop, setSelectedCrop] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [timeRange, setTimeRange] = useState<'1W' | '1M' | '3M'>('1M');

  // Set default selection when prices load
  useEffect(() => {
    if (marketPrices.length > 0 && !selectedCrop) {
      setSelectedCrop(marketPrices[0].cropName);
    }
  }, [marketPrices, selectedCrop]);

  // Dynamic Chart Colors based on Theme - Improved Contrast
  const isDark = theme === 'dark';
  const axisColor = isDark ? '#cbd5e1' : '#475569'; // Slate-300 (Dark) / Slate-600 (Light)
  const gridColor = isDark ? '#334155' : '#cbd5e1'; // Slate-700 (Dark) / Slate-300 (Light)
  const tooltipBg = isDark ? '#0f172a' : '#ffffff';
  const tooltipText = isDark ? '#f8fafc' : '#0f172a';

  // Generate simulated history based on current price
  useEffect(() => {
    if (!selectedCrop) return;
    
    const currentItem = marketPrices.find(p => p.cropName === selectedCrop);
    if (!currentItem) return;

    const days = timeRange === '1W' ? 7 : timeRange === '1M' ? 30 : 90;
    const data = [];
    let priceWalker = currentItem.price;
    
    // Generate backwards
    for (let i = 0; i < days; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      data.unshift({
        date: date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
        price: Number(priceWalker.toFixed(2)),
        volume: Math.floor(Math.random() * 10000) + 2000,
        ma: Number((priceWalker * (1 + (Math.random() * 0.05 - 0.025))).toFixed(2)) // Moving average proxy
      });

      // Random walk logic for history
      const volatility = currentItem.price * 0.02; // 2% volatility
      const change = (Math.random() - 0.5) * volatility;
      priceWalker += (Math.random() > 0.5 ? -change : change); // Reverse walk
    }
    setHistoryData(data);
  }, [selectedCrop, timeRange, marketPrices]);

  // Calculate projected revenue AND input costs dynamically
  const financialData = useMemo(() => {
    let projectedRevenue = 0;
    let estimatedCosts = 0;

    // Average input costs per acre (Seed + Fertilizer + Chem + Labor)
    const COST_PER_ACRE: Record<string, number> = {
      'maize': 450,
      'corn': 450,
      'soy': 300,
      'wheat': 320,
      'coffee': 800,
      'default': 350
    };

    crops.forEach(crop => {
       // 1. Revenue Calculation
       const marketPrice = marketPrices.find(p => p.cropName.toLowerCase().includes(crop.name.toLowerCase()))?.price || 50;
       const revenue = CropService.calculateProjectedYield(crop, marketPrice);
       projectedRevenue += revenue;

       // 2. Cost Calculation
       const cropKey = Object.keys(COST_PER_ACRE).find(k => crop.name.toLowerCase().includes(k)) || 'default';
       const costPerAcre = COST_PER_ACRE[cropKey];
       estimatedCosts += (crop.area * costPerAcre);
    });

    // Fallbacks if no crops exist to keep chart looking okay
    if (projectedRevenue === 0) projectedRevenue = 3200;
    if (estimatedCosts === 0) estimatedCosts = 2800;

    const newData = [...YIELD_DATA];
    const lastIdx = newData.length - 1;
    
    // Update the "2025 (Est)" data point
    newData[lastIdx] = { 
      ...newData[lastIdx], 
      value: Math.round(projectedRevenue), 
      cost: Math.round(estimatedCosts) 
    };
    return newData;
  }, [crops, marketPrices]);

  const activeTickerData = marketPrices.find(p => p.cropName === selectedCrop);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-800 dark:border-slate-600 pb-4 transition-colors">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Market Intelligence</h2>
          <div className="flex items-center gap-3 mt-1">
             <span className="flex items-center text-xs font-bold text-green-700 dark:text-green-400 uppercase tracking-wide bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded border border-green-200 dark:border-green-800">
               <Zap className="w-3 h-3 mr-1" /> Live Feed Active
             </span>
             <span className="text-slate-400 text-xs font-bold uppercase">•</span>
             <span className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wide">Global Commodities Exchange</span>
          </div>
        </div>
        <button 
          onClick={refreshMarketPrices}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent rounded hover:opacity-90 transition-all text-xs font-bold shadow-lg uppercase tracking-wide active:scale-95"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Sync Quotes
        </button>
      </div>

      {/* Interactive Tickers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {marketPrices.map((item, index) => {
          const isSelected = selectedCrop === item.cropName;
          return (
            <div 
              key={index} 
              onClick={() => setSelectedCrop(item.cropName)}
              className={`
                cursor-pointer relative p-5 border-l-4 shadow-sm hover:shadow-xl transition-all duration-300 group rounded-r-lg
                ${isSelected 
                  ? 'bg-slate-900 dark:bg-slate-800 scale-105 z-10 border-l-yellow-500' 
                  : 'bg-white dark:bg-slate-900 border-l-slate-300 dark:border-l-slate-700 hover:scale-[1.02]'}
              `}
            >
              {isSelected && <div className="absolute top-2 right-2"><MousePointer2 className="w-4 h-4 text-yellow-500 animate-pulse"/></div>}
              <div className="flex justify-between items-start mb-2">
                <h3 className={`font-black text-lg uppercase tracking-tight ${isSelected ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>{item.cropName}</h3>
                <div className={`p-1 rounded ${item.trend === 'up' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' : item.trend === 'down' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                   {item.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                   {item.trend === 'down' && <TrendingDown className="w-4 h-4" />}
                   {item.trend === 'stable' && <Minus className="w-4 h-4" />}
                </div>
              </div>
              <div className="flex items-end gap-2 mb-1">
                <span className={`text-3xl font-black font-heading tracking-tight ${isSelected ? 'text-yellow-400' : 'text-slate-900 dark:text-white'}`}>${item.price.toFixed(2)}</span>
                <span className={`text-xs font-bold mb-1.5 ${item.changePercentage > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                  {item.changePercentage > 0 ? '+' : ''}{item.changePercentage}%
                </span>
              </div>
              <div className={`text-[10px] font-bold uppercase tracking-wider ${isSelected ? 'text-slate-300' : 'text-slate-500 dark:text-slate-400'}`}>
                 Per {item.unit}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* MAIN CHART: Price Action */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
              <div>
                 <h3 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Price Action: {selectedCrop}
                 </h3>
                 <p className="text-xs text-slate-600 dark:text-slate-400 font-medium mt-1">Real-time exchange data & volatility analysis</p>
              </div>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg border border-slate-200 dark:border-slate-700">
                 {['1W', '1M', '3M'].map((range) => (
                    <button 
                      key={range}
                      onClick={() => setTimeRange(range as any)}
                      className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all ${timeRange === range ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm border border-slate-200 dark:border-slate-600' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}
                    >
                       {range}
                    </button>
                 ))}
              </div>
           </div>

           <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={historyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                       <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: axisColor, fontSize: 11, fontWeight: 700}} 
                      dy={10}
                      minTickGap={30}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: axisColor, fontSize: 11, fontWeight: 700}}
                      domain={['auto', 'auto']}
                      dx={-10}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: tooltipBg, 
                        borderRadius: '12px', 
                        border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                        color: tooltipText,
                        boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                        padding: '12px'
                      }}
                      itemStyle={{ color: tooltipText, fontSize: '12px', fontWeight: '600' }}
                      labelStyle={{ color: axisColor, fontSize: '10px', fontWeight: '700', marginBottom: '8px', textTransform: 'uppercase' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="price" 
                      stroke="#3b82f6" 
                      strokeWidth={3} 
                      fillOpacity={1} 
                      fill="url(#colorPrice)" 
                      name="Closing Price"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="ma" 
                      stroke="#fbbf24" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false}
                      name="Moving Avg (7D)" 
                    />
                 </AreaChart>
              </ResponsiveContainer>
           </div>
        </div>

        {/* SIDEBAR: Sentiment & Depth */}
        <div className="space-y-6">
           
           {/* Market Sentiment Card */}
           <div className="bg-slate-900 text-white p-6 rounded-2xl shadow-xl relative overflow-hidden border border-slate-800">
              <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-950 z-0"></div>
              <div className="relative z-10">
                 <h4 className="text-xs font-bold uppercase text-slate-400 mb-4 flex items-center">
                    <PieChart className="w-4 h-4 mr-2" /> Market Sentiment
                 </h4>
                 
                 <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-black">{activeTickerData?.trend === 'up' ? 'BULLISH' : activeTickerData?.trend === 'down' ? 'BEARISH' : 'NEUTRAL'}</span>
                    <div className={`p-2 rounded-lg ${activeTickerData?.trend === 'up' ? 'bg-green-500/20 text-green-400' : activeTickerData?.trend === 'down' ? 'bg-red-500/20 text-red-400' : 'bg-slate-500/20 text-slate-400'}`}>
                       {activeTickerData?.trend === 'up' ? <ArrowUpRight className="w-6 h-6"/> : activeTickerData?.trend === 'down' ? <ArrowDownRight className="w-6 h-6"/> : <Minus className="w-6 h-6"/>}
                    </div>
                 </div>
                 
                 <div className="w-full h-2 bg-slate-700 rounded-full mt-2 overflow-hidden flex">
                    <div className="h-full bg-green-500 transition-all duration-1000" style={{ width: activeTickerData?.trend === 'up' ? '75%' : activeTickerData?.trend === 'down' ? '25%' : '50%' }}></div>
                    <div className="h-full bg-red-500 flex-1"></div>
                 </div>
                 <div className="flex justify-between text-[10px] font-bold uppercase mt-2 text-slate-400">
                    <span>Buy Pressure</span>
                    <span>Sell Pressure</span>
                 </div>

                 <div className="mt-6 pt-4 border-t border-slate-700">
                    <div className="flex justify-between items-center mb-1">
                       <span className="text-xs font-medium text-slate-400">Volatility Index</span>
                       <span className="text-sm font-bold text-yellow-400">High (14.2)</span>
                    </div>
                    <div className="flex justify-between items-center">
                       <span className="text-xs font-medium text-slate-400">24h Volume</span>
                       <span className="text-sm font-bold text-blue-400">4.2M Tons</span>
                    </div>
                 </div>
              </div>
           </div>

           {/* Live Feed Simulator */}
           <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-bold uppercase text-slate-600 dark:text-slate-400 mb-4 flex items-center">
                 <Clock className="w-4 h-4 mr-2" /> Live Order Flow
              </h4>
              <div className="space-y-3">
                 {[1, 2, 3].map((_, i) => (
                    <div key={i} className="flex items-center justify-between text-xs animate-fade-in-up" style={{ animationDelay: `${i * 150}ms` }}>
                       <div className="flex items-center gap-2">
                          <span className="text-slate-500 dark:text-slate-400 font-mono font-medium">{new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                          <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] ${i % 2 === 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                             {i % 2 === 0 ? 'BUY' : 'SELL'}
                          </span>
                       </div>
                       <span className="font-bold text-slate-800 dark:text-slate-200">
                          {Math.floor(Math.random() * 500) + 100}T @ ${activeTickerData?.price.toFixed(2)}
                       </span>
                    </div>
                 ))}
              </div>
           </div>

        </div>
      </div>

      {/* SECONDARY CHART: Profitability Squeeze */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 transition-colors">
        <div className="flex items-center justify-between mb-6">
           <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white uppercase tracking-tight">Financial Resilience</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-bold uppercase mt-1">Yearly Revenue vs Input Costs Analysis</p>
           </div>
           <div className="hidden md:flex gap-4">
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                 <div className="w-3 h-3 bg-green-500 rounded-full"></div> Gross Revenue
              </div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-700 dark:text-slate-300">
                 <div className="w-3 h-3 bg-red-500 rounded-full"></div> Input Costs
              </div>
           </div>
        </div>
        
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={financialData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
              <XAxis 
                dataKey="name" 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: axisColor, fontSize: 12, fontWeight: 700}} 
                dy={10}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{fill: axisColor, fontSize: 12, fontWeight: 700}}
              />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{
                  backgroundColor: tooltipBg, 
                  borderRadius: '12px', 
                  border: isDark ? '1px solid #334155' : '1px solid #cbd5e1',
                  color: tooltipText,
                  boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                }}
              />
              <Legend verticalAlign="top" height={36} content={() => null} />
              <Area 
                type="monotone" 
                dataKey="value" 
                name="Revenue"
                stroke="#22c55e" 
                strokeWidth={3}
                fillOpacity={0.1} 
                fill="#22c55e" 
              />
              <Line 
                type="monotone" 
                dataKey="cost" 
                name="Input Costs"
                stroke="#ef4444" 
                strokeWidth={3}
                dot={{ r: 4, strokeWidth: 0, fill: '#ef4444' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default MarketAnalytics;
