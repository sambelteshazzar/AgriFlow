
import React, { useState, useRef, useEffect } from 'react';
import { Mic, X, Activity, Zap, Command, MicOff } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from "@google/genai";
import { NavigationTab } from '../types';

const VoiceAgent: React.FC = () => {
  const { navigate, toggleTheme, addTask, showToast, userProfile, weather, marketPrices } = useFarm();
  
  // State
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [volume, setVolume] = useState(0);
  
  // Refs for Audio & Session
  const audioContextRef = useRef<AudioContext | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceNodeRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const activeSourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionRef = useRef<any>(null);
  const lastVolumeUpdateRef = useRef<number>(0);

  // Refs for Live Data (To avoid stale closures in the long-running connection)
  const weatherRef = useRef(weather);
  const marketPricesRef = useRef(marketPrices);

  // Sync Refs
  useEffect(() => { weatherRef.current = weather; }, [weather]);
  useEffect(() => { marketPricesRef.current = marketPrices; }, [marketPrices]);

  // --- TOOLS DEFINITION ---
  const navTool: FunctionDeclaration = {
    name: "navigateApp",
    description: "Navigate to a specific section of the application.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        destination: {
          type: Type.STRING,
          enum: ["DASHBOARD", "CROPS", "LIVESTOCK", "MARKET", "NEWS", "AI_ADVISOR", "CALCULATOR", "COMMUNITY", "GAMES", "SETTINGS"],
          description: "The destination tab to navigate to."
        }
      },
      required: ["destination"]
    }
  };

  const themeTool: FunctionDeclaration = {
    name: "setTheme",
    description: "Change the application visual theme.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        mode: { type: Type.STRING, enum: ["light", "dark"], description: "The target theme mode." }
      },
      required: ["mode"]
    }
  };

  const taskTool: FunctionDeclaration = {
    name: "createTask",
    description: "Add a new task to the farm to-do list.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        text: { type: Type.STRING, description: "The content of the task." },
        priority: { type: Type.STRING, enum: ["normal", "high"], description: "Priority level of the task." }
      },
      required: ["text"]
    }
  };

  const weatherTool: FunctionDeclaration = {
    name: "getFarmWeather",
    description: "Get the current weather conditions, forecast, and climate risk for the farm.",
    parameters: {
      type: Type.OBJECT,
      properties: {},
    }
  };

  const marketTool: FunctionDeclaration = {
    name: "getMarketPulse",
    description: "Get current market prices for crops.",
    parameters: {
      type: Type.OBJECT,
      properties: {
        commodity: { type: Type.STRING, description: "The specific crop to check (e.g., 'Corn', 'Wheat'). If null, returns top movers." }
      }
    }
  };

  // --- AUDIO UTILS ---
  const b64ToUint8Array = (base64: string) => {
    const binaryString = atob(base64);
    const len = binaryString.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    return bytes;
  };

  const floatTo16BitPCM = (input: Float32Array) => {
    const output = new Int16Array(input.length);
    for (let i = 0; i < input.length; i++) {
      const s = Math.max(-1, Math.min(1, input[i]));
      output[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
    }
    return output;
  };

  const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    const len = bytes.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary);
  };

  // --- SESSION MANAGEMENT ---
  const connect = async () => {
    if (!process.env.API_KEY) {
      showToast("API Key missing", "error");
      return;
    }

    setIsConnecting(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContextClass({ sampleRate: 16000 }); // Try 16k, but browser might override
      await ctx.resume(); // Ensure context is running
      
      audioContextRef.current = ctx;
      nextStartTimeRef.current = ctx.currentTime;

      const stream = await navigator.mediaDevices.getUserMedia({ audio: { channelCount: 1, sampleRate: 16000 } });
      mediaStreamRef.current = stream;

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
          systemInstruction: {
            parts: [{ text: `You are AgriFlow's Voice OS. You control the app and have access to live farm data.
            - Use 'navigateApp' to change screens.
            - Use 'createTask' for reminders.
            - Use 'getFarmWeather' for climate info.
            - Use 'getMarketPulse' for prices.
            - Be concise (1-2 sentences). You are talking to a busy farmer in the field.` }]
          },
          tools: [{ functionDeclarations: [navTool, themeTool, taskTool, weatherTool, marketTool] }]
        },
        callbacks: {
          onopen: async () => {
            setIsActive(true);
            setIsConnecting(false);
            
            const source = ctx.createMediaStreamSource(stream);
            const processor = ctx.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              
              // Optimized Volume Meter (Throttle updates)
              const now = Date.now();
              if (now - lastVolumeUpdateRef.current > 100) {
                let sum = 0;
                // Sample subset of points for performance
                for(let i=0; i<inputData.length; i+=10) sum += inputData[i] * inputData[i];
                const rms = Math.sqrt(sum / (inputData.length / 10));
                setVolume(Math.min(100, rms * 400));
                lastVolumeUpdateRef.current = now;
              }

              const pcm16 = floatTo16BitPCM(inputData);
              const b64Data = arrayBufferToBase64(pcm16.buffer);
              
              sessionPromise.then(session => {
                session.sendRealtimeInput({
                  media: { 
                    mimeType: `audio/pcm;rate=${ctx.sampleRate}`, // Dynamic Rate Fix
                    data: b64Data 
                  }
                });
              });
            };

            source.connect(processor);
            processor.connect(ctx.destination);
            sourceNodeRef.current = source;
            processorRef.current = processor;
          },
          onmessage: async (msg: LiveServerMessage) => {
            // 1. Handle Tools
            if (msg.toolCall) {
              for (const fc of msg.toolCall.functionCalls) {
                let result: any = { status: 'ok' };
                
                try {
                  if (fc.name === 'navigateApp') {
                    const dest = (fc.args as any).destination;
                    navigate(dest as NavigationTab);
                    result = { output: `Navigated to ${dest}` };
                  } else if (fc.name === 'setTheme') {
                    toggleTheme();
                    result = { output: `Theme toggled` };
                  } else if (fc.name === 'createTask') {
                    const { text, priority } = fc.args as any;
                    addTask(`${text} ${priority === 'high' ? '(High Priority)' : ''}`);
                    result = { output: `Task added: ${text}` };
                  } else if (fc.name === 'getFarmWeather') {
                    const w = weatherRef.current;
                    result = { output: `Current: ${w.temp}°C, ${w.condition}. Risk Level: ${w.climateRiskIndex}. Forecast: ${w.forecast}` };
                  } else if (fc.name === 'getMarketPulse') {
                    const commodity = (fc.args as any).commodity;
                    const prices = marketPricesRef.current;
                    if (commodity) {
                      const match = prices.find(p => p.cropName.toLowerCase().includes(commodity.toLowerCase()));
                      result = match 
                        ? { output: `${match.cropName} is trading at $${match.price}. Trend is ${match.trend}.` } 
                        : { output: `No data found for ${commodity}.` };
                    } else {
                      const top = prices.slice(0, 3).map(p => `${p.cropName}: $${p.price}`).join(', ');
                      result = { output: `Market Snapshot: ${top}` };
                    }
                  }
                } catch (e) {
                  result = { error: 'Action failed' };
                }

                sessionPromise.then(session => {
                  session.sendToolResponse({
                    functionResponses: [{
                      id: fc.id,
                      name: fc.name,
                      response: { result }
                    }]
                  });
                });
              }
            }

            // 2. Handle Audio
            const audioData = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (audioData) {
              const audioBytes = b64ToUint8Array(audioData);
              const int16Data = new Int16Array(audioBytes.buffer);
              const audioBuffer = ctx.createBuffer(1, int16Data.length, 24000);
              const channelData = audioBuffer.getChannelData(0);
              for (let i = 0; i < int16Data.length; i++) {
                channelData[i] = int16Data[i] / 32768.0;
              }
              
              const startTime = Math.max(ctx.currentTime, nextStartTimeRef.current);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(startTime);
              
              activeSourcesRef.current.add(source);
              source.onended = () => activeSourcesRef.current.delete(source);
              nextStartTimeRef.current = startTime + audioBuffer.duration;
            }

            if (msg.serverContent?.interrupted) {
              activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
              activeSourcesRef.current.clear();
              nextStartTimeRef.current = ctx.currentTime;
            }
          },
          onclose: () => disconnect(),
          onerror: (err) => {
            console.error(err);
            disconnect();
            showToast("Connection lost", "error");
          }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
      showToast("Microphone access failed", "error");
    }
  };

  const disconnect = () => {
    setIsActive(false);
    setIsConnecting(false);
    setVolume(0);
    
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach(track => track.stop());
      mediaStreamRef.current = null;
    }
    if (processorRef.current) {
      processorRef.current.disconnect();
      processorRef.current = null;
    }
    if (sourceNodeRef.current) {
      sourceNodeRef.current.disconnect();
      sourceNodeRef.current = null;
    }
    
    const ctx = audioContextRef.current;
    if (ctx) {
      audioContextRef.current = null;
      if (ctx.state !== 'closed') {
        ctx.close().catch(e => console.debug("Error closing AudioContext:", e));
      }
    }
    
    activeSourcesRef.current.forEach(s => { try { s.stop(); } catch(e){} });
    activeSourcesRef.current.clear();
  };

  return (
    <div className={`fixed bottom-6 right-6 z-[80] flex flex-col items-end gap-4 transition-all ${isActive ? 'translate-y-0' : ''}`}>
      
      {/* Visualizer Overlay */}
      {isActive && (
        <div className="bg-slate-900/90 backdrop-blur-md p-6 rounded-2xl shadow-2xl border border-white/10 w-72 mb-2 animate-fade-in-up">
           <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                 <span className="relative flex h-3 w-3">
                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                   <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                 </span>
                 <span className="text-xs font-bold text-white uppercase tracking-wider">Voice OS Active</span>
              </div>
              <button onClick={disconnect} className="text-slate-400 hover:text-white transition-colors"><X className="w-4 h-4"/></button>
           </div>
           
           <div className="h-16 flex items-center justify-center gap-1">
              {[...Array(5)].map((_, i) => (
                 <div 
                   key={i} 
                   className="w-2 bg-gradient-to-t from-green-500 to-green-300 rounded-full transition-all duration-75"
                   style={{ height: `${Math.max(10, volume * (1 + Math.random()))}%` }}
                 ></div>
              ))}
           </div>
           
           <div className="mt-4 pt-3 border-t border-white/10 text-[10px] text-slate-400 text-center font-mono">
              Listening for commands...
           </div>
        </div>
      )}

      {/* Toggle Button */}
      <button 
        onClick={isActive ? disconnect : connect}
        disabled={isConnecting}
        className={`
          w-16 h-16 rounded-full flex items-center justify-center shadow-lg transition-all active:scale-95 border-4
          ${isActive 
            ? 'bg-red-500 hover:bg-red-600 border-red-400 text-white animate-pulse' 
            : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-700 dark:border-slate-200 hover:scale-110'}
        `}
      >
        {isConnecting ? (
          <Activity className="w-8 h-8 animate-spin" />
        ) : isActive ? (
          <MicOff className="w-8 h-8" />
        ) : (
          <Mic className="w-8 h-8" />
        )}
      </button>
    </div>
  );
};

export default VoiceAgent;
