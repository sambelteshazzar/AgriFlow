import React, { useState, useMemo } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { GraduationCap, PlayCircle, Check, Clock, BookOpen, BarChart, User, Star, Search, Filter, ArrowLeft, Play, FileText, Lock, Award, CheckCircle, Pause } from 'lucide-react';

// Maps specific topics to real YouTube videos
const COURSE_CONTENT_MAP: Record<string, string> = {
  'Regenerative': 'h2P5z2Q3yJ0', // Kiss the Ground / Soil Health
  'Tech': 'Q6sL-7sF_Gw', // Drone Farming
  'Economics': '1s5o7s3y_wY', // Ag Economics (Proxy)
  'Resilience': 'G9K7z9JcQj8', // Water Conservation
  'Default': 'dQw4w9WgXcQ' // Fallback
};

const EducationHub: React.FC = () => {
  const { learningModules, completeModule } = useFarm();
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [activeCourseId, setActiveCourseId] = useState<string | null>(null);
  const [currentLessonIdx, setCurrentLessonIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const categories = ['All', 'Regenerative', 'Economics', 'Tech', 'Resilience'];

  const filteredModules = learningModules.filter(m => filterCategory === 'All' || m.category === filterCategory);

  const activeCourse = useMemo(() => 
    learningModules.find(m => m.id === activeCourseId), 
  [activeCourseId, learningModules]);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'Beginner': return 'text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400';
      case 'Intermediate': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'Advanced': return 'text-red-600 bg-red-100 dark:bg-red-900/30 dark:text-red-400';
      default: return 'text-slate-600 bg-slate-100';
    }
  };

  const handleStartCourse = (id: string) => {
    setActiveCourseId(id);
    setCurrentLessonIdx(0);
    setIsPlaying(false);
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleCompleteCourse = () => {
    if (activeCourseId) {
      completeModule(activeCourseId);
    }
  };

  const handleLessonChange = (idx: number) => {
    setCurrentLessonIdx(idx);
    setIsPlaying(false); // Reset play state for new lesson
  };

  // Helper to generate deterministic but realistic lesson titles
  const getLessonTitle = (index: number, total: number, category: string) => {
    if (index === 0) return "Introduction & Core Principles";
    if (index === total - 1) return "Final Assessment & Certification";
    
    const topics: Record<string, string[]> = {
      'Regenerative': ['Soil Microbiology', 'Cover Crop Termination', 'No-Till Drills', 'Compost Tea Application', 'Carbon Sequestration Metrics'],
      'Economics': ['Hedging Strategies', 'Input Cost Analysis', 'Market Volatility', 'Cooperative Buying', 'Grant Writing'],
      'Tech': ['Drone Flight Paths', 'NDVI Data Interpretation', 'Sensor Calibration', 'Automated Irrigation', 'Data Security'],
      'Resilience': ['Water Retention Landscapes', 'Drought-Resistant Breeds', 'IPM Implementation', 'Diversification', 'Emergency Protocols']
    };

    const specificTopics = topics[category] || ['Core Concept', 'Advanced Application', 'Case Studies', 'Field Implementation', 'Review'];
    // Cycle through topics deterministically
    return `Module ${index}: ${specificTopics[(index - 1) % specificTopics.length]}`;
  };

  // --- DETAILED COURSE VIEW ---
  if (activeCourse) {
    // Generate lesson structure
    const lessons = Array.from({ length: activeCourse.lessonsCount }).map((_, i) => ({
      id: i,
      title: getLessonTitle(i, activeCourse.lessonsCount, activeCourse.category),
      duration: `${Math.floor(Math.random() * 15 + 15)}:00`,
      isLocked: i > currentLessonIdx,
      isCompleted: i < currentLessonIdx
    }));

    // Select video ID
    const videoId = COURSE_CONTENT_MAP[activeCourse.category] || COURSE_CONTENT_MAP['Default'];

    return (
      <div className="h-full flex flex-col animate-fade-in pb-10">
        {/* Navigation Bar */}
        <div className="flex items-center gap-4 mb-6 border-b border-slate-200 dark:border-slate-800 pb-4">
           <button 
             onClick={() => setActiveCourseId(null)}
             className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors group"
           >
             <ArrowLeft className="w-6 h-6 text-slate-600 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white" />
           </button>
           <div>
             <div className="flex items-center gap-2 mb-1">
               <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${getDifficultyColor(activeCourse.difficulty)}`}>
                 {activeCourse.difficulty}
               </span>
               <span className="text-slate-400 text-xs font-bold uppercase">• {activeCourse.category}</span>
             </div>
             <h1 className="text-2xl font-bold text-slate-900 dark:text-white leading-none">{activeCourse.title}</h1>
           </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
           {/* Left: Player & Info */}
           <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div className="aspect-video bg-black rounded-2xl overflow-hidden relative group shadow-2xl">
                 {isPlaying ? (
                   // Functional YouTube Embed with specific video ID
                   <iframe 
                     className="w-full h-full"
                     src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
                     title="Course Video"
                     frameBorder="0"
                     allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                     allowFullScreen
                   ></iframe>
                 ) : (
                   <>
                     <img 
                       src={activeCourse.thumbnail} 
                       className="w-full h-full object-cover opacity-60 group-hover:opacity-40 transition-opacity" 
                       alt="Video cover" 
                       onError={(e) => {
                         e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
                       }}
                     />
                     <div className="absolute inset-0 flex items-center justify-center">
                        <button 
                          onClick={() => setIsPlaying(true)}
                          className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center hover:scale-110 transition-transform cursor-pointer border-2 border-white/50"
                        >
                           <Play className="w-8 h-8 text-white fill-white ml-1" />
                        </button>
                     </div>
                     <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                        <div className="flex items-center gap-4">
                           <div className="h-1 flex-1 bg-white/30 rounded-full overflow-hidden">
                              <div className="h-full w-0 bg-yellow-500"></div>
                           </div>
                           <span className="text-xs font-bold text-white font-mono">{lessons[currentLessonIdx].duration}</span>
                        </div>
                     </div>
                   </>
                 )}
              </div>

              {/* Course Description */}
              <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
                 <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-3">{lessons[currentLessonIdx].title}</h3>
                 <p className="text-slate-600 dark:text-slate-300 leading-relaxed mb-6">
                    In this lesson, we break down critical strategies for {activeCourse.category.toLowerCase()} success. 
                    {activeCourse.description} We focus on practical application in the field to minimize risk and maximize long-term yield stability.
                 </p>
                 
                 <div className="flex items-center justify-between pt-6 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                       <div className="w-12 h-12 bg-slate-200 dark:bg-slate-700 rounded-full flex items-center justify-center text-slate-500">
                          <User className="w-6 h-6" />
                       </div>
                       <div>
                          <p className="text-sm font-bold text-slate-900 dark:text-white">{activeCourse.instructor}</p>
                          <p className="text-xs text-slate-500 font-medium">Lead Agronomist</p>
                       </div>
                    </div>
                    {activeCourse.completed ? (
                       <div className="flex items-center gap-2 px-4 py-2 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-xl font-bold text-sm">
                          <Award className="w-5 h-5" /> Certificate Earned
                       </div>
                    ) : (
                       <button 
                         onClick={handleCompleteCourse}
                         className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold uppercase text-xs tracking-wide hover:bg-slate-800 dark:hover:bg-slate-200 transition-colors shadow-lg"
                       >
                          Mark Complete
                       </button>
                    )}
                 </div>
              </div>
           </div>

           {/* Right: Syllabus */}
           <div className="lg:col-span-1">
              <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden h-full max-h-[calc(100vh-12rem)] flex flex-col">
                 <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
                    <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase tracking-wide">Course Syllabus</h3>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-500">
                       <BookOpen className="w-4 h-4" />
                       <span>{activeCourse.lessonsCount} Lessons</span>
                       <span>•</span>
                       <Clock className="w-4 h-4" />
                       <span>{activeCourse.duration} Total</span>
                    </div>
                 </div>
                 
                 <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {lessons.map((lesson, idx) => (
                       <button 
                         key={lesson.id}
                         onClick={() => !lesson.isLocked && handleLessonChange(idx)}
                         disabled={lesson.isLocked}
                         className={`w-full text-left p-4 border-b border-slate-100 dark:border-slate-800 transition-colors flex items-start gap-3 hover:bg-slate-50 dark:hover:bg-slate-800/50 ${currentLessonIdx === idx ? 'bg-blue-50 dark:bg-blue-900/10 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}`}
                       >
                          <div className={`mt-0.5 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center border ${
                             currentLessonIdx === idx ? 'bg-blue-500 border-blue-500 text-white' : 
                             lesson.isLocked ? 'border-slate-300 text-slate-300' : 'border-green-500 text-green-500'
                          }`}>
                             {lesson.isLocked ? <Lock className="w-3 h-3" /> : (currentLessonIdx === idx ? (isPlaying ? <Pause className="w-3 h-3 fill-current"/> : <Play className="w-3 h-3 fill-current" />) : <Check className="w-3 h-3" />)}
                          </div>
                          <div className="flex-1">
                             <p className={`text-sm font-bold ${currentLessonIdx === idx ? 'text-blue-700 dark:text-blue-400' : lesson.isLocked ? 'text-slate-400' : 'text-slate-700 dark:text-slate-300'}`}>
                                {lesson.title}
                             </p>
                             <span className="text-[10px] font-mono text-slate-400 mt-1 block">{lesson.duration}</span>
                          </div>
                       </button>
                    ))}
                 </div>
                 
                 {/* Progress Footer */}
                 <div className="p-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-2">
                       <span>Progress</span>
                       <span>{activeCourse.completed ? '100%' : `${Math.round((currentLessonIdx / activeCourse.lessonsCount) * 100)}%`}</span>
                    </div>
                    <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-green-500 transition-all duration-500"
                         style={{ width: activeCourse.completed ? '100%' : `${(currentLessonIdx / activeCourse.lessonsCount) * 100}%` }}
                       ></div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>
    );
  }

  // --- CATALOG LIST VIEW (Original View) ---
  return (
    <div className="h-full flex flex-col space-y-6 animate-fade-in pb-10">
      
      {/* Hero Section */}
      <div className="relative bg-slate-900 rounded-3xl p-8 overflow-hidden shadow-2xl flex-shrink-0">
         <div className="absolute inset-0 opacity-40 bg-[url('https://images.unsplash.com/photo-1592982537447-6f2a6a0c7c18?q=80&w=1200&auto=format&fit=crop')] bg-cover bg-center"></div>
         <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-900/80 to-transparent"></div>
         <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-2 mb-4">
               <span className="px-3 py-1 rounded-full bg-yellow-500 text-slate-900 text-xs font-black uppercase tracking-widest">Premium Certification</span>
               <div className="flex text-yellow-500"><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/><Star className="w-3 h-3 fill-current"/></div>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white font-heading mb-4 leading-tight">
               Master Regenerative <br/> Agriculture
            </h1>
            <p className="text-slate-300 text-lg mb-8 font-medium leading-relaxed max-w-lg">
               Join over 10,000 farmers enhancing soil health and profitability. Led by world-class agronomists.
            </p>
            <button className="bg-white text-slate-900 px-8 py-3 rounded-full font-bold uppercase tracking-wide hover:bg-yellow-400 transition-colors shadow-lg flex items-center gap-2">
               Explore Courses <BookOpen className="w-4 h-4" />
            </button>
         </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
         <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar w-full md:w-auto">
            {categories.map(cat => (
               <button 
                 key={cat}
                 onClick={() => setFilterCategory(cat)}
                 className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wide transition-all border ${filterCategory === cat ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border-slate-900 dark:border-white' : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500'}`}
               >
                  {cat}
               </button>
            ))}
         </div>
         <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-sm font-medium focus:outline-none focus:border-slate-400 dark:focus:border-slate-500 text-slate-800 dark:text-white" />
         </div>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
         {filteredModules.map(module => (
            <div key={module.id} className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 overflow-hidden flex flex-col group hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer" onClick={() => handleStartCourse(module.id)}>
               <div className="relative h-48 overflow-hidden">
                  <div className="absolute top-3 left-3 z-10 flex gap-2">
                     <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider shadow-sm ${getDifficultyColor(module.difficulty)}`}>{module.difficulty}</span>
                  </div>
                  <img 
                    src={module.thumbnail} 
                    alt={module.title} 
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80';
                    }}
                  />
                  {module.completed && (
                     <div className="absolute inset-0 bg-black/50 flex items-center justify-center backdrop-blur-[2px]">
                        <div className="bg-green-500 text-white px-4 py-2 rounded-full font-bold uppercase text-xs flex items-center shadow-lg">
                           <Check className="w-4 h-4 mr-2" /> Completed
                        </div>
                     </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent">
                     <div className="flex items-center text-white text-xs font-bold gap-3">
                        <span className="flex items-center"><BookOpen className="w-3 h-3 mr-1 opacity-80"/> {module.lessonsCount} Lessons</span>
                        <span className="flex items-center"><Clock className="w-3 h-3 mr-1 opacity-80"/> {module.duration}</span>
                     </div>
                  </div>
               </div>
               <div className="p-5 flex-1 flex flex-col">
                  <h3 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{module.title}</h3>
                  <p className="text-slate-500 dark:text-slate-400 text-sm line-clamp-2 mb-4">{module.description}</p>
                  
                  <div className="mt-auto flex items-center justify-between pt-4 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                           <User className="w-3 h-3" />
                        </div>
                        <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{module.instructor}</span>
                     </div>
                     <PlayCircle className="w-8 h-8 text-slate-300 dark:text-slate-600 group-hover:text-yellow-500 transition-colors" />
                  </div>
               </div>
            </div>
         ))}
      </div>
    </div>
  );
};

export default EducationHub;