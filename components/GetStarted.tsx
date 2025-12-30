
import React, { useRef, useState } from 'react';
import { Sprout, BrainCircuit, ChevronRight, BarChart3, Globe, Zap, CloudLightning, ArrowUpRight, ArrowDownRight, Users, Leaf, GraduationCap, Gamepad2, Calculator, MessageSquare, Database, Code, Layers, Shield, Cpu } from 'lucide-react';
import { useFarm } from '../contexts/FarmContext';

interface GetStartedProps {
  onStart: () => void;
}

const GetStarted: React.FC<GetStartedProps> = ({ onStart }) => {
  const { showToast } = useFarm();
  const featuresRef = useRef<HTMLDivElement>(null);
  const aboutRef = useRef<HTMLDivElement>(null);
  const architectureRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null); // This is the scrollable viewport
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  const scrollToSection = (ref: React.RefObject<HTMLDivElement>) => {
    if (ref.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (containerRef.current) {
      const rect = containerRef.current.getBoundingClientRect();
      setMousePosition({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handlePlaceholderLink = (e: React.MouseEvent, name: string) => {
    e.preventDefault();
    showToast(`${name} page is not available in this demo environment.`, 'info');
  };

  return (
    <div 
      ref={containerRef}
      onMouseMove={handleMouseMove}
      className="h-screen w-full bg-slate-900 text-white font-sans selection:bg-green-500 selection:text-white overflow-y-auto overflow-x-hidden relative scroll-smooth"
    >
      
      {/* --- CINEMATIC BACKGROUND LAYER (Fixed relative to viewport) --- */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        {/* Primary Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 animate-slow-zoom"
          style={{ backgroundImage: 'url("https://images.unsplash.com/photo-1527847263472-aa5338d178b8?q=80&w=2674&auto=format&fit=crop")' }}
        ></div>
        
        {/* Gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-900/80 to-slate-900/40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-slate-900/50 to-slate-950"></div>

        {/* Interactive Glow */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(800px_circle_at_var(--x)_var(--y),rgba(34,197,94,0.06),transparent_50%)] z-10"
          style={{ 
            '--x': `${mousePosition.x}px`, 
            '--y': `${mousePosition.y}px` 
          } as React.CSSProperties}
        ></div>
      </div>

      {/* --- NAVIGATION (Sticky) --- */}
      <nav className="sticky top-0 z-50 w-full p-6 flex justify-between items-center border-b border-white/5 bg-slate-950/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
           <div className="bg-green-600 p-2 rounded-lg shadow-lg shadow-green-500/20">
             <Sprout className="w-6 h-6 text-white" />
           </div>
           <div className="flex flex-col">
             <span className="text-xl font-bold tracking-tight font-heading leading-none">Agri<span className="text-green-400">Flow</span></span>
           </div>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
           <button onClick={() => scrollToSection(featuresRef)} className="hover:text-white cursor-pointer transition-colors">Platform</button>
           <button onClick={() => scrollToSection(architectureRef)} className="hover:text-white cursor-pointer transition-colors">Architecture</button>
           <button onClick={() => scrollToSection(aboutRef)} className="hover:text-white cursor-pointer transition-colors">About Us</button>
           <div className="w-px h-4 bg-slate-700"></div>
           <button 
             onClick={onStart} 
             className="px-5 py-2 bg-white text-slate-900 rounded-full font-bold hover:bg-green-400 hover:text-slate-900 transition-all shadow-lg"
           >
             Launch App
           </button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <div className="relative z-10 flex flex-col justify-center items-start px-4 max-w-7xl mx-auto w-full pt-32 pb-48">
        
        <div className="max-w-4xl">
          {/* Status Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/30 text-green-300 text-xs font-bold uppercase tracking-wider mb-8 animate-fade-in-up backdrop-blur-md shadow-[0_0_15px_rgba(34,197,94,0.2)]">
            <Zap className="w-3 h-3 text-green-400" />
            V3.0 System Operational • Gemini AI Integrated
          </div>
          
          {/* Main Heading */}
          <h1 className="text-6xl md:text-8xl font-black font-heading tracking-tight leading-[0.9] text-white mb-8 animate-fade-in-up drop-shadow-2xl">
            Cultivating <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 via-emerald-300 to-teal-500">Intelligence.</span>
          </h1>
          
          {/* Subheading */}
          <p className="text-xl md:text-2xl text-slate-300 max-w-2xl font-medium leading-relaxed mb-12 animate-fade-in-up border-l-4 border-green-500 pl-6">
            The complete operating system for modern agriculture. From seed to sale, powered by next-generation AI.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col md:flex-row gap-5 items-center animate-fade-in-up">
            <button 
              onClick={onStart}
              className="group px-10 py-5 bg-green-600 hover:bg-green-500 text-white font-bold text-lg rounded-full transition-all shadow-[0_0_30px_rgba(22,163,74,0.3)] hover:shadow-[0_0_50px_rgba(22,163,74,0.5)] flex items-center gap-3 w-full md:w-auto justify-center"
            >
              Enter Dashboard
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={() => scrollToSection(featuresRef)}
              className="px-10 py-5 bg-white/5 hover:bg-white/10 backdrop-blur-md border border-white/10 text-white font-bold text-lg rounded-full transition-all w-full md:w-auto"
            >
              Explore Modules
            </button>
          </div>
        </div>

      </div>

      {/* --- LIVE TICKER --- */}
      <div className="relative z-20 bg-slate-950/80 border-y border-slate-800 py-4 backdrop-blur-md overflow-hidden">
         <div className="flex animate-marquee whitespace-nowrap gap-24 max-w-7xl mx-auto">
            {[1, 2, 3, 4].map((i) => (
              <React.Fragment key={i}>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                  <Globe className="w-4 h-4 text-blue-500" /> 
                  <span className="text-slate-200">Global Feeds Active</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <span className="text-white font-bold">CORN</span> 
                  <span className="text-green-400">$142.50 (+2.4%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <span className="text-white font-bold">SOY</span> 
                  <span className="text-red-400">$98.20 (-0.8%)</span>
                </div>
                <div className="flex items-center gap-2 text-sm font-medium text-slate-400">
                  <span className="text-white font-bold">WHEAT</span> 
                  <span className="text-green-400">$58.00 (+1.2%)</span>
                </div>
                <div className="flex items-center gap-4 text-sm font-bold text-slate-400">
                  <CloudLightning className="w-4 h-4 text-yellow-500" /> 
                  <span className="text-slate-200">Weather API Connected</span>
                </div>
              </React.Fragment>
            ))}
         </div>
      </div>

      {/* --- FEATURES GRID --- */}
      <div ref={featuresRef} className="relative z-10 w-full bg-slate-950 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 py-32">
          
          <div className="mb-20">
             <span className="text-green-500 font-bold tracking-widest uppercase text-sm mb-2 block">System Capabilities</span>
             <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
               Complete Operational Control
             </h2>
             <p className="text-slate-400 text-xl leading-relaxed max-w-3xl">
               AgriFlow consolidates critical farm data into a single, intelligent interface. Replace spreadsheets with real-time insights.
             </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Cards */}
            {[
              { icon: Database, color: 'text-green-400', bg: 'bg-green-500/10', title: 'Crop Manager', desc: 'Detailed plot tracking, soil health logging, and growth stage monitoring.' },
              { icon: Users, color: 'text-yellow-400', bg: 'bg-yellow-500/10', title: 'Community', desc: 'Global marketplace and expert forums for knowledge sharing.' },
              { icon: BrainCircuit, color: 'text-purple-400', bg: 'bg-purple-500/10', title: 'Gemini AI', desc: 'Advanced diagnostics and personalized agronomy advice.' },
              { icon: BarChart3, color: 'text-blue-400', bg: 'bg-blue-500/10', title: 'Analytics', desc: 'Financial forecasting and input cost optimization tools.' },
              { icon: GraduationCap, color: 'text-pink-400', bg: 'bg-pink-500/10', title: 'Education', desc: 'Professional certification courses on regenerative practices.' },
              { icon: Gamepad2, color: 'text-red-400', bg: 'bg-red-500/10', title: 'Agri-Arcade', desc: 'Simulation modules to test strategies without financial risk.' },
              { icon: Calculator, color: 'text-teal-400', bg: 'bg-teal-500/10', title: 'Resource Tools', desc: 'Precision calculators for irrigation and fertilizer usage.' },
              { icon: Globe, color: 'text-orange-400', bg: 'bg-orange-500/10', title: 'Global News', desc: 'Aggregated intelligence on climate and trade policies.' },
            ].map((item, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-slate-900 border border-slate-800 hover:border-slate-600 hover:bg-slate-800/50 transition-all group">
                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                  <item.icon className={`w-7 h-7 ${item.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 leading-relaxed text-sm font-medium">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- ARCHITECTURE SECTION --- */}
      <div ref={architectureRef} className="relative z-10 w-full bg-slate-900 border-t border-slate-800 py-32">
        <div className="max-w-7xl mx-auto px-6">
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                 <div className="inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-blue-500/10 text-blue-400 text-xs font-bold uppercase border border-blue-500/20">
                    <Cpu className="w-3 h-3" /> Technical Specs
                 </div>
                 <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Built for Resilience & Speed</h2>
                 <p className="text-slate-400 text-lg mb-8 leading-relaxed">
                    AgriFlow is engineered as a progressive web application (PWA) designed to function in low-connectivity rural environments while leveraging cloud-native AI when connected.
                 </p>
                 
                 <div className="space-y-6">
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                          <Code className="w-6 h-6 text-sky-400" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg">Modern Frontend Stack</h4>
                          <p className="text-slate-500 text-sm">React 19, TypeScript, and TailwindCSS ensure a snappy, type-safe, and responsive user experience on any device.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                          <Shield className="w-6 h-6 text-emerald-400" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg">Secure & Offline-First</h4>
                          <p className="text-slate-500 text-sm">Robust local persistence layer mimics backend behavior, syncing data when connectivity is restored.</p>
                       </div>
                    </div>
                    <div className="flex gap-4">
                       <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 border border-slate-700">
                          <BrainCircuit className="w-6 h-6 text-purple-400" />
                       </div>
                       <div>
                          <h4 className="text-white font-bold text-lg">Generative AI Core</h4>
                          <p className="text-slate-500 text-sm">Direct integration with Google's Gemini 3.0 Pro model for multimodal image analysis and complex reasoning.</p>
                       </div>
                    </div>
                 </div>
              </div>
              
              <div className="relative">
                 {/* Visual Representation of Stack */}
                 <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/20 to-purple-500/20 blur-3xl rounded-full"></div>
                 <div className="relative bg-slate-950 border border-slate-800 rounded-3xl p-8 shadow-2xl">
                    <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800">
                       <span className="text-slate-400 font-mono text-xs">system_status.log</span>
                       <div className="flex gap-2">
                          <div className="w-3 h-3 rounded-full bg-red-500"></div>
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                       </div>
                    </div>
                    <div className="space-y-4 font-mono text-sm">
                       <div className="flex justify-between">
                          <span className="text-slate-500">Core.Framework</span>
                          <span className="text-sky-400">React v19.2.3</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">UI.Engine</span>
                          <span className="text-sky-400">TailwindCSS</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">AI.Model</span>
                          <span className="text-purple-400">Gemini-3-Flash</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">Data.Vis</span>
                          <span className="text-orange-400">Recharts</span>
                       </div>
                       <div className="flex justify-between">
                          <span className="text-slate-500">Icons</span>
                          <span className="text-white">Lucide-React</span>
                       </div>
                       <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-600">
                          > System Integrity: 100%<br/>
                          > Modules Loaded: 12/12<br/>
                          > Ready for deployment...
                       </div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* --- MISSION / ABOUT SECTION --- */}
      <div ref={aboutRef} className="relative z-10 w-full bg-slate-950 border-t border-slate-800 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 mb-6">
                 <div className="p-1.5 rounded-lg bg-green-500/20"><Leaf className="w-5 h-5 text-green-400"/></div>
                 <span className="text-green-400 font-bold uppercase tracking-widest text-sm">Our Mission</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">Farming for the Next Century</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-6">
                We believe that the future of agriculture lies at the intersection of traditional wisdom and advanced technology. 
              </p>
              <p className="text-slate-400 text-lg leading-relaxed mb-8">
                In an era of climate uncertainty, AgriFlow provides the digital infrastructure needed to secure yields, protect soil health, and ensure profitability for generations to come.
              </p>
              
              <button 
                onClick={onStart}
                className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold uppercase tracking-wide hover:bg-green-400 transition-colors shadow-lg"
              >
                Join the Revolution
              </button>
            </div>
            
            <div className="order-1 lg:order-2 relative h-[500px] rounded-3xl overflow-hidden shadow-2xl border border-slate-800 group">
               <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1605000797499-95a51c5269ae?q=80&w=1000&auto=format&fit=crop')] bg-cover bg-center transition-transform duration-700 group-hover:scale-105"></div>
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent"></div>
               <div className="absolute bottom-0 left-0 p-10 w-full bg-gradient-to-t from-slate-950/90 to-transparent">
                  <p className="text-white font-bold text-3xl font-heading mb-3">"Data is the new fertilizer."</p>
                  <p className="text-slate-400 text-sm uppercase tracking-wide font-bold">- The AgriFlow Team</p>
               </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="bg-slate-950 border-t border-slate-900 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-slate-600 text-sm">
          <div className="flex items-center gap-3 mb-4 md:mb-0">
            <div className="bg-slate-900 p-2 rounded border border-slate-800"><Sprout className="w-5 h-5 text-green-700" /></div>
            <span className="font-bold text-slate-500">AgriFlow System &copy; 2025</span>
          </div>
          <div className="flex gap-8">
            <button onClick={(e) => handlePlaceholderLink(e, 'Privacy')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">Privacy</button>
            <button onClick={(e) => handlePlaceholderLink(e, 'Terms')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">Terms</button>
            <button onClick={(e) => handlePlaceholderLink(e, 'API Docs')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">API Docs</button>
            <button onClick={(e) => handlePlaceholderLink(e, 'Support')} className="hover:text-white transition-colors cursor-pointer bg-transparent border-none p-0">Support</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 40s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default GetStarted;
