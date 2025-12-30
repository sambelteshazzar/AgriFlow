
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Gamepad2, Bug, Sprout, ShieldAlert, Trophy, Home, Zap, Skull, Sun, Droplets, Hammer, Heart, Coins, Shovel, CloudRain, ShoppingCart, ArrowUpCircle, Flame, User, Truck, Rat, Bird, Star, Wheat, Lock, MousePointer2, Egg, Drumstick, Cpu, ArrowBigUp, Users, Cloud, Sparkles, Megaphone, Dna, Bot, Moon, Package, ArrowRight, HelpCircle, X, Timer, Calendar, Crosshair, Tractor, Loader2, Play, BrainCircuit, RefreshCw } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';
import { GoogleGenAI, Type } from "@google/genai";

// --- SHARED UTILS ---
const useInterval = (callback: () => void, delay: number | null) => {
  const savedCallback = useRef(callback);
  useEffect(() => { savedCallback.current = callback; }, [callback]);
  useEffect(() => {
    if (delay !== null) {
      const id = setInterval(() => savedCallback.current(), delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};

// --- TYPES ---
type GameMode = 'MENU' | 'CROP_DEFENDER' | 'ECO_TYCOON' | 'POULTRY_BUILDER';

// --- CROP DEFENDER ---
type CDState = 'MENU' | 'PLAYING' | 'GAME_OVER';
type EnemyType = 'NONE' | 'BUG' | 'RAT' | 'CROW' | 'BOMB';

interface CDCell {
  id: number;
  col: number; // 0, 1, 2 for determining farmer position
  type: EnemyType;
  health: number;
  isHit: boolean;
  hitTimer: number; // Frame counter for hit effect
  spawnTime: number;
}

// --- ECO TYCOON ---
interface EcoTurn {
  day: number;
  scenario: string;
  visualKeyword: string;
  choices: {
    id: string;
    text: string;
    cost: number;
    risk: 'LOW' | 'MED' | 'HIGH';
  }[];
  outcome?: string;
}

interface EcoStats {
  funds: number;
  soilHealth: number;
  reputation: number;
}

const GamesHub: React.FC = () => {
  const { showToast } = useFarm();
  const [activeGame, setActiveGame] = useState<GameMode>('MENU');

  // ==========================================
  // GAME 1: CROP DEFENDER (Action)
  // ==========================================
  const [cdState, setCdState] = useState<CDState>('MENU');
  const [cdScore, setCdScore] = useState(0);
  const [cdWave, setCdWave] = useState(1);
  const [cdGrid, setCdGrid] = useState<CDCell[]>(Array(9).fill(null).map((_, i) => ({ id: i, col: i % 3, type: 'NONE', health: 1, isHit: false, hitTimer: 0, spawnTime: 0 })));
  const [playerCol, setPlayerCol] = useState(1);
  const [shootAnim, setShootAnim] = useState<{col: number, visible: boolean}>({col: 1, visible: false});

  // ==========================================
  // GAME 2: ECO TYCOON (AI Adventure)
  // ==========================================
  const [ecoStats, setEcoStats] = useState<EcoStats>({ funds: 5000, soilHealth: 100, reputation: 50 });
  const [ecoHistory, setEcoHistory] = useState<EcoTurn[]>([]);
  const [ecoLoading, setEcoLoading] = useState(false);
  const [ecoGameOver, setEcoGameOver] = useState(false);

  // --- CD Logic ---
  const spawnEnemy = useCallback(() => {
    setCdGrid(prev => {
      let newGrid = prev.map(c => ({ ...c, hitTimer: c.hitTimer > 0 ? c.hitTimer - 1 : 0, isHit: c.hitTimer > 0 }));
      const emptySlots = newGrid.filter(c => c.type === 'NONE');
      if (emptySlots.length === 0) return newGrid;

      if (Math.random() > 0.3) {
          const idx = emptySlots[Math.floor(Math.random() * emptySlots.length)].id;
          const rand = Math.random();
          let type: EnemyType = 'BUG';
          let hp = 1;
          const waveMod = Math.min(0.4, cdWave * 0.05);

          if (rand > 0.95 - (waveMod/2)) { type = 'BOMB'; }
          else if (rand > 0.85 - waveMod) { type = 'CROW'; hp = 1; }
          else { type = 'BUG'; hp = 1; }
          
          newGrid[idx] = { ...newGrid[idx], type, health: hp, spawnTime: Date.now() };
      }
      return newGrid;
    });
  }, [cdWave]);

  const resetCD = () => {
    setCdState('PLAYING');
    setCdScore(0);
    setCdWave(1);
    setPlayerCol(1);
    setCdGrid(Array(9).fill(null).map((_, i) => ({ id: i, col: i % 3, type: 'NONE', health: 1, isHit: false, hitTimer: 0, spawnTime: 0 })));
  };

  const handleGridClick = (index: number) => {
    if (cdState !== 'PLAYING') return;
    const targetCol = index % 3;
    setPlayerCol(targetCol);
    setShootAnim({ col: targetCol, visible: true });
    setTimeout(() => setShootAnim(prev => ({...prev, visible: false})), 150);

    setCdGrid(prev => {
        const newGrid = [...prev];
        const cell = newGrid[index];
        if (cell.type !== 'NONE') {
            if (cell.type === 'BOMB') {
                setCdScore(s => Math.max(0, s - 50));
            } else {
                setCdScore(s => s + (cell.type === 'CROW' ? 20 : 10));
            }
            newGrid[index] = { ...cell, type: 'NONE', isHit: true, hitTimer: 5 };
        }
        return newGrid;
    });
  };

  useInterval(() => {
    if (cdState === 'PLAYING') {
      spawnEnemy();
      if (Math.random() > 0.99) setCdWave(w => w + 1);
    }
  }, cdState === 'PLAYING' ? 800 : null);

  // --- ECO TYCOON LOGIC ---
  const startEcoGame = async () => {
    setEcoStats({ funds: 5000, soilHealth: 100, reputation: 50 });
    setEcoHistory([]);
    setEcoGameOver(false);
    await generateEcoTurn(1, { funds: 5000, soilHealth: 100, reputation: 50 }, "Start of a new season. The farm has been fallow for winter.");
  };

  const generateEcoTurn = async (day: number, currentStats: EcoStats, context: string) => {
    setEcoLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `
        You are the game engine for "Eco Tycoon", a farming simulation.
        Current Stats: Funds $${currentStats.funds}, Soil Health ${currentStats.soilHealth}%, Reputation ${currentStats.reputation}%.
        Day: ${day}.
        Previous Context: ${context}.

        Generate a new random farming event (e.g., Drought, Market Crash, Pest Outbreak, Investor Visit, Heavy Rain).
        Provide 3 strategic choices for the player. One should be expensive but safe, one cheap but risky, one balanced or regenerative.
        
        Respond in JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              scenario: { type: Type.STRING },
              visualKeyword: { type: Type.STRING, description: "A single visual keyword for unsplash background image e.g. 'storm', 'wheat field', 'tractor'" },
              choices: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    text: { type: Type.STRING },
                    cost: { type: Type.NUMBER },
                    risk: { type: Type.STRING, enum: ['LOW', 'MED', 'HIGH'] }
                  }
                }
              }
            }
          }
        }
      });

      // Cleanup Markdown artifacts if present
      const cleanJson = (response.text || "{}").replace(/```json|```/g, '').trim();
      const data = JSON.parse(cleanJson);
      setEcoHistory(prev => [...prev, { day, ...data }]);

    } catch (e) {
      console.error(e);
      showToast("AI Engine Failure. Retrying...", "error");
    } finally {
      setEcoLoading(false);
    }
  };

  const handleEcoChoice = async (choiceIdx: number) => {
    const currentTurn = ecoHistory[ecoHistory.length - 1];
    const choice = currentTurn.choices[choiceIdx];
    
    // Calculate simple outcome logic (AI normally handles this in a full loop, simulating locally for speed)
    let outcomeText = "";
    let fundsChange = -choice.cost;
    let soilChange = 0;
    let repChange = 0;

    // Simulate RNG based on risk
    const roll = Math.random();
    const success = choice.risk === 'LOW' ? (roll > 0.1) : choice.risk === 'MED' ? (roll > 0.4) : (roll > 0.6);

    if (success) {
      outcomeText = `Success! You chose to "${choice.text}". The farm thrived.`;
      fundsChange += Math.floor(Math.random() * 500) + 100; // Revenue
      soilChange = 5;
      repChange = 2;
    } else {
      outcomeText = `Setback. You chose to "${choice.text}" but complications arose.`;
      soilChange = -10;
      repChange = -5;
    }

    // Apply Stats
    const newStats = {
      funds: Math.max(0, ecoStats.funds + fundsChange),
      soilHealth: Math.max(0, Math.min(100, ecoStats.soilHealth + soilChange)),
      reputation: Math.max(0, Math.min(100, ecoStats.reputation + repChange))
    };
    setEcoStats(newStats);

    // Update History with outcome
    const updatedHistory = [...ecoHistory];
    updatedHistory[updatedHistory.length - 1].outcome = outcomeText;
    setEcoHistory(updatedHistory);

    // Check Game Over
    if (newStats.funds <= 0 || newStats.soilHealth <= 0) {
      setEcoGameOver(true);
    } else {
      // Next Turn
      await generateEcoTurn(currentTurn.day + 1, newStats, outcomeText);
    }
  };

  const handleLockedClick = (name: string) => {
    showToast(`${name} is currently locked in your region.`, 'info');
  };

  // --- RENDER ---
  const renderMenu = () => (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 h-full overflow-y-auto">
      {/* CROP DEFENDER CARD */}
      <div 
        onClick={() => setActiveGame('CROP_DEFENDER')} 
        className="relative h-96 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all hover:shadow-green-500/20 border border-slate-700 hover:border-green-500"
      >
        <img 
          src="https://images.unsplash.com/photo-1628151016020-5324683050c0?q=80&w=800&fit=crop" 
          alt="Crop Defender"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&fit=crop';
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90"></div>
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
          <div className="bg-green-500/20 backdrop-blur-md p-3 rounded-2xl w-fit mb-4 border border-green-500/30 group-hover:bg-green-500/30 transition-colors">
             <ShieldAlert className="w-10 h-10 text-green-400" />
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">Crop Defender</h3>
          <p className="text-slate-300 text-sm font-medium mb-6 line-clamp-2">Protect your harvest from pests and environmental hazards in this fast-paced arcade shooter.</p>
          <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider border border-slate-600">Action</span>
             <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider border border-slate-600">Single Player</span>
          </div>
        </div>
      </div>

      {/* ECO TYCOON CARD (UNLOCKED) */}
      <div 
        onClick={() => { setActiveGame('ECO_TYCOON'); startEcoGame(); }}
        className="relative h-96 rounded-3xl overflow-hidden cursor-pointer group shadow-2xl transition-all hover:shadow-blue-500/20 border border-slate-700 hover:border-blue-500"
      >
        <img 
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=800&fit=crop"
          alt="Eco Tycoon"
          className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/60 to-transparent opacity-90"></div>
        <div className="absolute inset-0 p-8 flex flex-col justify-end">
           <div className="bg-blue-500/20 backdrop-blur-md p-3 rounded-2xl w-fit mb-4 border border-blue-500/30 group-hover:bg-blue-500/30 transition-colors">
             <BrainCircuit className="w-10 h-10 text-blue-400" />
           </div>
           <h3 className="text-3xl font-black text-white uppercase tracking-tight mb-2 drop-shadow-lg">Eco Tycoon</h3>
           <p className="text-slate-300 text-sm font-medium mb-6 line-clamp-2">AI-Powered Farm Simulator. Every decision matters in this generated narrative adventure.</p>
           <div className="flex items-center gap-3">
             <span className="px-3 py-1 rounded-full bg-blue-900/50 text-blue-200 text-[10px] font-bold uppercase tracking-wider border border-blue-500/30">AI Story</span>
             <span className="px-3 py-1 rounded-full bg-slate-800 text-white text-[10px] font-bold uppercase tracking-wider border border-slate-600">Simulation</span>
          </div>
        </div>
      </div>

      {/* POULTRY BUILDER CARD (LOCKED) */}
      <div 
        onClick={() => handleLockedClick("Poultry Builder")}
        className="relative h-96 rounded-3xl overflow-hidden group shadow-xl border border-slate-800 opacity-80 cursor-not-allowed hover:opacity-90 transition-opacity"
      >
        <img 
          src="https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=800&fit=crop"
          alt="Poultry Builder"
          className="absolute inset-0 w-full h-full object-cover grayscale opacity-50"
        />
        <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center p-6 text-center">
           <div className="bg-slate-800 p-4 rounded-full mb-4 border-2 border-slate-700">
             <Lock className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-2xl font-black text-slate-400 uppercase tracking-tight mb-2">Poultry Builder</h3>
           <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-4">Locked • Beta Access Only</p>
           <button className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-full text-xs font-bold uppercase transition-colors">
             Request Access
           </button>
        </div>
      </div>
    </div>
  );

  const renderGame = () => {
    switch (activeGame) {
      case 'CROP_DEFENDER':
        return (
          <div className="flex flex-col items-center justify-center h-full text-white bg-slate-900/95 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)] pointer-events-none"></div>
            
            <div className="absolute top-0 w-full p-6 flex justify-between items-start z-20">
               <button onClick={() => setCdState('MENU')} className="bg-slate-800/80 p-3 rounded-full hover:bg-red-900/50 transition-colors border border-slate-700 hover:border-red-500">
                 <X className="w-6 h-6 text-slate-400 hover:text-red-400" />
               </button>
               <div className="text-right">
                 <h2 className="text-4xl font-black text-green-400 font-heading uppercase drop-shadow-md">Crop Defender</h2>
                 <p className="text-green-200/60 font-mono text-xs uppercase tracking-widest">Defense Protocol v2.1</p>
               </div>
            </div>
            
            {cdState === 'MENU' && (
              <div className="text-center z-10 animate-fade-in-up">
                <div className="w-32 h-32 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-8 border-4 border-green-500/50 shadow-[0_0_50px_rgba(34,197,94,0.2)]">
                   <Tractor className="w-16 h-16 text-green-400" />
                </div>
                <h1 className="text-6xl font-black text-white mb-6 tracking-tight">READY?</h1>
                <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg font-medium">Tap the grid to move your tractor and shoot pests. Avoid bombs!</p>
                <button onClick={resetCD} className="group relative bg-green-600 px-16 py-6 rounded-2xl font-black text-2xl hover:bg-green-500 transition-all shadow-[0_0_40px_rgba(22,163,74,0.4)] hover:shadow-[0_0_60px_rgba(22,163,74,0.6)] border-b-8 border-green-800 hover:border-green-700 active:border-b-0 active:translate-y-2 uppercase tracking-widest">
                  Start Mission
                  <div className="absolute -inset-1 bg-white/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </button>
              </div>
            )}

            {cdState === 'PLAYING' && (
              <div className="text-center relative z-10 w-full max-w-lg px-4">
                <div className="mb-6 flex justify-between items-center bg-slate-950/80 px-6 py-3 rounded-full border border-slate-700 backdrop-blur-md">
                  <div className="text-left">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Score</p>
                    <p className="text-2xl font-mono font-bold text-yellow-400">{cdScore.toString().padStart(5, '0')}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Wave</p>
                    <p className="text-2xl font-mono font-bold text-blue-400">{cdWave}</p>
                  </div>
                </div>

                <div className="bg-slate-800/50 p-4 rounded-3xl border-4 border-slate-700 shadow-2xl backdrop-blur-sm relative">
                  <div className="grid grid-cols-3 gap-3 mb-20 relative z-10">
                    {cdGrid.map((cell, index) => (
                      <div 
                        key={cell.id} 
                        onClick={() => handleGridClick(index)}
                        className={`
                          aspect-square bg-slate-900/80 rounded-xl flex items-center justify-center border-2 
                          ${cell.isHit ? 'border-yellow-500 bg-yellow-500/20' : 'border-slate-700 hover:border-slate-500'} 
                          relative overflow-hidden cursor-crosshair active:scale-95 transition-all
                        `}
                      >
                        {cell.type !== 'NONE' && !cell.isHit && (
                          <div className="animate-bounce">
                             {cell.type === 'BUG' ? <Bug className="w-10 h-10 text-green-500 drop-shadow-[0_0_10px_rgba(34,197,94,0.8)]" /> :
                              cell.type === 'CROW' ? <Bird className="w-10 h-10 text-blue-400 drop-shadow-[0_0_10px_rgba(96,165,250,0.8)]" /> :
                              <Skull className="w-10 h-10 text-red-500 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" />
                             }
                          </div>
                        )}
                        {cell.isHit && (
                           <div className="absolute inset-0 flex items-center justify-center">
                              <div className="w-full h-full bg-yellow-400/50 animate-ping"></div>
                           </div>
                        )}
                        {shootAnim.visible && shootAnim.col === (index % 3) && Math.floor(index / 3) === 2 && (
                           <div className="absolute bottom-0 w-2 h-8 bg-yellow-400 rounded-full blur-[2px] animate-pulse"></div>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="absolute bottom-0 left-0 right-0 h-20 bg-slate-900/80 rounded-b-2xl border-t border-slate-700 flex items-end pb-2 justify-around px-4">
                     {[0, 1, 2].map(col => (
                        <div key={col} className="w-full flex justify-center relative">
                           {playerCol === col && (
                             <div className="flex flex-col items-center animate-fade-in-up">
                                {shootAnim.visible && <div className="w-8 h-8 bg-yellow-500 rounded-full blur-md absolute -top-4 animate-ping"></div>}
                                <Tractor className="w-12 h-12 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
                                <div className="w-10 h-2 bg-black/50 rounded-full blur-sm mt-1"></div>
                             </div>
                           )}
                           {playerCol !== col && (
                             <div 
                               onClick={() => setPlayerCol(col)} 
                               className="w-12 h-12 rounded-full border-2 border-dashed border-slate-700 flex items-center justify-center opacity-30 cursor-pointer hover:opacity-60 hover:border-slate-500 transition-all"
                             >
                                <Crosshair className="w-6 h-6 text-white" />
                             </div>
                           )}
                        </div>
                     ))}
                  </div>
                </div>
                <p className="mt-6 text-slate-500 font-bold uppercase text-xs tracking-widest">Tap grid to shoot</p>
              </div>
            )}
          </div>
        );

      case 'ECO_TYCOON':
        const currentTurn = ecoHistory[ecoHistory.length - 1];
        
        return (
          <div className="h-full bg-slate-950 relative overflow-hidden flex flex-col">
             {/* Dynamic Background */}
             {currentTurn?.visualKeyword && (
               <>
                 <img 
                   src={`https://images.unsplash.com/photo-1625246333195-00305256a836?w=1600&q=80&fit=crop&query=${encodeURIComponent(currentTurn.visualKeyword)}`} 
                   className="absolute inset-0 w-full h-full object-cover opacity-30 transition-opacity duration-1000"
                   alt="Scenario Background"
                   onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1625246333195-00305256a836?w=1600&q=80&fit=crop'; }}
                 />
                 <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-slate-900/60"></div>
               </>
             )}

             {/* Header HUD */}
             <div className="relative z-10 p-6 flex justify-between items-center border-b border-white/10 bg-slate-900/50 backdrop-blur-md">
                <button onClick={() => setActiveGame('MENU')} className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors"><X className="w-6 h-6"/></button>
                <div className="flex gap-6 text-white">
                   <div className="flex items-center gap-2"><Coins className="w-4 h-4 text-yellow-400"/> <span className="font-mono font-bold">${ecoStats.funds}</span></div>
                   <div className="flex items-center gap-2"><Sprout className="w-4 h-4 text-green-400"/> <span className="font-mono font-bold">{ecoStats.soilHealth}%</span></div>
                   <div className="flex items-center gap-2"><Users className="w-4 h-4 text-blue-400"/> <span className="font-mono font-bold">{ecoStats.reputation}%</span></div>
                </div>
                <div className="text-right">
                   <p className="text-[10px] font-bold uppercase text-slate-500 tracking-wider">Day</p>
                   <p className="text-xl font-black text-white">{currentTurn ? currentTurn.day : 1}</p>
                </div>
             </div>

             {/* Main Content */}
             <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
                {ecoLoading ? (
                   <div className="text-center animate-pulse">
                      <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border border-blue-500/50">
                         <Bot className="w-8 h-8 text-blue-400 animate-bounce" />
                      </div>
                      <h2 className="text-2xl font-bold text-white mb-2">Simulating World...</h2>
                      <p className="text-slate-400 text-sm">AI is generating local weather patterns and market conditions.</p>
                   </div>
                ) : ecoGameOver ? (
                   <div className="text-center bg-slate-900/80 p-10 rounded-3xl border border-red-900/50 backdrop-blur-lg animate-fade-in-up">
                      <h2 className="text-5xl font-black text-red-500 mb-4 font-heading">GAME OVER</h2>
                      <p className="text-slate-300 text-lg mb-8">Your farm could not sustain the operational costs or environmental damage.</p>
                      <button onClick={startEcoGame} className="px-8 py-3 bg-white text-slate-900 font-bold uppercase rounded-full hover:scale-105 transition-transform flex items-center gap-2 mx-auto"><RefreshCw className="w-5 h-5"/> Restart Season</button>
                   </div>
                ) : currentTurn ? (
                   <div className="w-full animate-fade-in-up">
                      <div className="bg-slate-900/60 p-8 rounded-3xl border border-white/10 backdrop-blur-md mb-8 shadow-2xl">
                         <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">{currentTurn.scenario}</h2>
                         {currentTurn.outcome && (
                           <div className="mb-6 p-4 bg-white/5 rounded-xl border-l-4 border-yellow-500">
                              <p className="text-yellow-100 italic">"{currentTurn.outcome}"</p>
                           </div>
                         )}
                      </div>

                      {!currentTurn.outcome && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                           {currentTurn.choices.map((choice, idx) => (
                              <button 
                                key={idx} 
                                onClick={() => handleEcoChoice(idx)}
                                className="group relative bg-slate-800/80 hover:bg-slate-700/90 p-6 rounded-2xl border border-slate-600 hover:border-blue-500 transition-all text-left shadow-lg hover:-translate-y-1 active:translate-y-0"
                              >
                                 <div className="flex justify-between items-start mb-3">
                                    <span className={`text-[10px] font-bold px-2 py-1 rounded uppercase ${choice.risk === 'HIGH' ? 'bg-red-900/50 text-red-300' : choice.risk === 'MED' ? 'bg-yellow-900/50 text-yellow-300' : 'bg-green-900/50 text-green-300'}`}>{choice.risk} Risk</span>
                                    <span className="text-sm font-bold text-white font-mono">-${choice.cost}</span>
                                 </div>
                                 <p className="text-slate-200 font-bold text-lg group-hover:text-blue-300 transition-colors">{choice.text}</p>
                              </button>
                           ))}
                        </div>
                      )}
                   </div>
                ) : null}
             </div>
          </div>
        );

      default:
        return renderMenu();
    }
  };

  return (
    <div className="h-full bg-slate-950 rounded-xl overflow-hidden shadow-2xl relative border border-slate-800">
      <div className="absolute top-6 left-6 z-20">
        <button onClick={() => setActiveGame('MENU')} className="bg-slate-900/90 backdrop-blur-md text-white p-3 rounded-full hover:bg-slate-800 transition-all border border-slate-700 shadow-xl group hover:scale-110 active:scale-95">
          <Home className="w-5 h-5 group-hover:text-green-400 transition-colors" />
        </button>
      </div>
      {renderGame()}
    </div>
  );
};

export default GamesHub;
