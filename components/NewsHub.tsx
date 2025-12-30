
import React, { useEffect } from 'react';
import { useFarm } from '../contexts/FarmContext';
import { Newspaper, Loader2, ExternalLink, Clock, RefreshCw, Zap, TrendingUp, Leaf, Landmark, Signal } from 'lucide-react';

const NewsHub: React.FC = () => {
  const { newsArticles, refreshNews, isLoadingNews, showToast } = useFarm();

  useEffect(() => {
    // Initial fetch if empty
    if (newsArticles.length === 0) {
      refreshNews();
    }
  }, []);

  const handleNewsClick = (e: React.MouseEvent, url?: string) => {
    if (!url || url === '#' || url.trim() === '') {
      e.preventDefault();
      showToast('Full article source is not available in demo mode.', 'info');
    }
  };

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'Tech': return <Zap className="w-3 h-3" />;
      case 'Market': return <TrendingUp className="w-3 h-3" />;
      case 'Climate': return <Leaf className="w-3 h-3" />;
      case 'Policy': return <Landmark className="w-3 h-3" />;
      default: return <Newspaper className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'Tech': return 'bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800';
      case 'Market': return 'bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800';
      case 'Climate': return 'bg-green-100 text-green-700 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800';
      case 'Policy': return 'bg-orange-100 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800';
      default: return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
    }
  };

  const getDeterministicImage = (cat: string) => {
    // Use high quality visuals with specific subject matter
    switch (cat) {
      case 'Tech': return 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80&fit=crop';
      case 'Market': return 'https://images.unsplash.com/photo-1611974765270-ca1258634369?w=800&q=80&fit=crop';
      case 'Climate': return 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800&q=80&fit=crop';
      case 'Policy': return 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?w=800&q=80&fit=crop';
      default: return 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&fit=crop';
    }
  };

  const featuredArticle = newsArticles[0];
  const remainingArticles = newsArticles.slice(1);

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b-4 border-slate-800 dark:border-slate-600 pb-4 transition-colors">
        <div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white uppercase tracking-tight flex items-center">
            Global Wire <span className="ml-2 w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]"></span>
          </h2>
          <p className="text-slate-600 dark:text-slate-400 font-bold text-xs uppercase tracking-wide mt-1 flex items-center">
            <Signal className="w-3 h-3 mr-1" /> Live Satellite Feed
          </p>
        </div>
        <button 
          onClick={refreshNews}
          disabled={isLoadingNews}
          className="mt-4 md:mt-0 flex items-center px-4 py-2 bg-slate-900 dark:bg-white border border-slate-900 dark:border-white text-white dark:text-slate-900 rounded hover:opacity-90 transition-opacity text-xs font-bold shadow-sm uppercase tracking-wide disabled:opacity-50 active:scale-95"
        >
          {isLoadingNews ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
          {isLoadingNews ? 'Syncing...' : 'Refresh Wire'}
        </button>
      </div>

      {isLoadingNews && newsArticles.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-200 dark:border-slate-800">
           <div className="relative">
             <div className="absolute inset-0 bg-blue-500/20 rounded-full animate-ping"></div>
             <Loader2 className="w-12 h-12 mb-4 animate-spin text-blue-600 dark:text-blue-400 relative z-10" />
           </div>
           <p className="text-sm font-bold uppercase tracking-widest text-slate-600 dark:text-slate-400">Establishing Satellite Link...</p>
           <p className="text-[10px] text-slate-500 mt-2">Aggregating global market data</p>
        </div>
      ) : newsArticles.length > 0 ? (
        <>
          {/* Featured Article */}
          {featuredArticle && (
            <div className="relative h-[450px] rounded-2xl overflow-hidden shadow-2xl group cursor-pointer border border-slate-200 dark:border-slate-800">
               <img 
                 src={getDeterministicImage(featuredArticle.category)} 
                 alt={featuredArticle.title} 
                 className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                 onError={(e) => {
                   e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&fit=crop';
                 }}
               />
               {/* Strengthened Gradient for Readability */}
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/80 to-transparent opacity-90 group-hover:opacity-100 transition-opacity"></div>
               
               <div className="absolute bottom-0 left-0 p-6 md:p-10 w-full max-w-4xl">
                  <div className="flex items-center gap-3 mb-4">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded border text-[10px] font-black uppercase tracking-widest ${getCategoryColor(featuredArticle.category)} bg-white/90 text-slate-900 border-white/20 backdrop-blur-md shadow-lg`}>
                       {getCategoryIcon(featuredArticle.category)} {featuredArticle.category}
                    </div>
                    <span className="text-[10px] font-bold uppercase text-slate-300 tracking-wider bg-black/40 px-2 py-1 rounded backdrop-blur-sm">Top Story</span>
                  </div>
                  
                  <h3 className="text-3xl md:text-5xl font-black text-white font-heading leading-tight mb-4 drop-shadow-xl">
                    {featuredArticle.title}
                  </h3>
                  
                  <p className="text-slate-200 text-sm md:text-lg font-medium leading-relaxed mb-8 line-clamp-2 max-w-3xl drop-shadow-md">
                    {featuredArticle.summary}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-white/10 pt-4">
                     <span className="text-white flex items-center gap-2">
                       <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                       {featuredArticle.source}
                     </span>
                     <span>•</span>
                     <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {featuredArticle.timeAgo}</span>
                     
                     <a 
                       href={featuredArticle.url || '#'} 
                       onClick={(e) => handleNewsClick(e, featuredArticle.url)}
                       target="_blank" 
                       rel="noreferrer" 
                       className="ml-auto flex items-center gap-2 px-4 py-2 bg-yellow-500 text-slate-900 rounded-lg hover:bg-yellow-400 transition-all shadow-lg active:scale-95"
                     >
                       Read Full Story <ExternalLink className="w-3 h-3" />
                     </a>
                  </div>
               </div>
            </div>
          )}

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
             {remainingArticles.map(article => (
               <div key={article.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden hover:shadow-xl transition-all flex flex-col group hover:-translate-y-1">
                  <div className="h-44 overflow-hidden relative">
                     <img 
                       src={getDeterministicImage(article.category)} 
                       alt={article.title} 
                       loading="lazy"
                       className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                       onError={(e) => {
                         e.currentTarget.src = 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800&q=80&fit=crop';
                       }}
                     />
                     <div className="absolute top-3 right-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold uppercase border shadow-sm ${getCategoryColor(article.category)} bg-white/95 dark:bg-slate-900/90 backdrop-blur-sm`}>
                           {getCategoryIcon(article.category)} {article.category}
                        </span>
                     </div>
                  </div>
                  
                  <div className="p-5 flex-1 flex flex-col">
                     <div className="mb-4">
                        <h4 className="font-bold text-slate-900 dark:text-white text-lg leading-tight mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2">
                          {article.title}
                        </h4>
                        <p className="text-slate-600 dark:text-slate-400 text-xs leading-relaxed line-clamp-3 font-medium">
                          {article.summary}
                        </p>
                     </div>
                     
                     <div className="mt-auto pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-[10px] font-bold uppercase text-slate-500 dark:text-slate-400">
                        <span className="truncate max-w-[100px] text-slate-700 dark:text-slate-300">{article.source}</span>
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {article.timeAgo}</span>
                     </div>
                     
                     <a 
                       href={article.url || '#'} 
                       onClick={(e) => handleNewsClick(e, article.url)}
                       target="_blank" 
                       rel="noreferrer" 
                       className="mt-3 block w-full text-center py-2.5 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold uppercase rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
                     >
                        Read Source
                     </a>
                  </div>
               </div>
             ))}
          </div>
        </>
      ) : (
        <div className="p-12 text-center border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl bg-slate-50 dark:bg-slate-900/30">
           <div className="w-16 h-16 bg-slate-200 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
             <Newspaper className="w-8 h-8 text-slate-400" />
           </div>
           <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">No News Available</h3>
           <p className="text-slate-500 dark:text-slate-400 text-sm mb-6 max-w-xs mx-auto">We couldn't fetch the latest headlines. Please check your internet connection and try again.</p>
           <button 
             onClick={refreshNews} 
             className="px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold text-xs uppercase tracking-wide shadow-md transition-all active:scale-95"
           >
             Retry Connection
           </button>
        </div>
      )}
    </div>
  );
};

export default NewsHub;
