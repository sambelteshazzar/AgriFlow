
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Crop, MarketPrice, Task, Livestock, LearningModule, LogEntry, MarketplaceListing, ForumPost, ForumReply, CommunityChatMessage, UserLocation, WeatherData, Story, SocialTrend, SuggestedUser, UserProfile, SystemAlert, NewsArticle, ToastMessage, PollOption, NavigationTab } from '../types';
import { CropService } from '../services/cropService';
import { LivestockService } from '../services/livestockService';
import { MarketService } from '../services/marketService';
import { LogService } from '../services/logService';
import { CommunityService } from '../services/communityService';
import { WeatherService } from '../services/weatherService';
import { fetchAgNews } from '../services/geminiService';
import { db, DB_KEYS } from '../services/persistence';
import { MOCK_WEATHER, CURRENT_USER, GUEST_USER, INITIAL_ALERTS } from '../constants';

interface FarmContextType {
  userProfile: UserProfile;
  isSignedIn: boolean;
  alerts: SystemAlert[];
  
  // Navigation
  currentView: NavigationTab;
  navigate: (view: NavigationTab) => void;

  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;

  // Toasts
  toasts: ToastMessage[];
  showToast: (message: string, type: ToastMessage['type']) => void;
  removeToast: (id: string) => void;

  crops: Crop[];
  livestock: Livestock[];
  tasks: Task[];
  marketPrices: MarketPrice[];
  learningModules: LearningModule[];
  newsArticles: NewsArticle[];
  isLoadingNews: boolean;
  listings: MarketplaceListing[];
  posts: ForumPost[];
  chatMessages: CommunityChatMessage[];
  userLocation: UserLocation;
  weather: WeatherData;
  // Social Data
  stories: Story[];
  trends: SocialTrend[];
  suggestedUsers: SuggestedUser[];
  followedUserIds: string[];
  likedPostIds: string[];
  
  // Poll Data
  pollData: PollOption[];
  pollVoted: number | null;
  handlePollVote: (id: number) => void;

  // Auth Methods
  login: (name: string, email: string) => Promise<void>;
  logout: () => void;
  updateUserProfile: (profile: Partial<UserProfile>) => Promise<void>;
  resetApp: () => void;

  addCrop: (crop: Omit<Crop, 'id'>) => Promise<void>;
  deleteCrop: (id: string) => Promise<void>;
  updateCropStatus: (id: string, status: Crop['status']) => Promise<void>;
  addLivestock: (animal: Omit<Livestock, 'id'>) => Promise<void>;
  deleteLivestock: (id: string) => Promise<void>;
  updateLivestockStatus: (id: string, status: Livestock['status']) => Promise<void>;
  toggleTask: (id: string) => void;
  addTask: (text: string) => void;
  completeModule: (id: string) => void;
  refreshMarketPrices: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshLocation: () => void;
  
  // Logs
  addActivityLog: (log: Omit<LogEntry, 'id'>) => Promise<void>;
  getLogsByRef: (refId: string) => Promise<LogEntry[]>;

  // Community
  addListing: (listing: Omit<MarketplaceListing, 'id' | 'verified' | 'status' | 'date'>) => Promise<void>;
  markListingSold: (id: string) => Promise<void>;
  addPost: (post: Omit<ForumPost, 'id' | 'replies' | 'likes' | 'date'>) => Promise<void>;
  getPostReplies: (postId: string) => Promise<ForumReply[]>;
  addPostReply: (postId: string, content: string) => Promise<ForumReply[]>;
  likePost: (postId: string) => Promise<void>;
  sendChatMessage: (message: Omit<CommunityChatMessage, 'id' | 'timestamp'>) => Promise<void>;
  toggleFollowUser: (userId: string) => Promise<void>;
  
  dismissAlert: (id: string) => void;
}

const FarmContext = createContext<FarmContextType | undefined>(undefined);

export const FarmProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // --- State ---
  const [userProfile, setUserProfile] = useState<UserProfile>(GUEST_USER);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [alerts, setAlerts] = useState<SystemAlert[]>(INITIAL_ALERTS);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  
  // Navigation State
  const [currentView, setCurrentView] = useState<NavigationTab>(NavigationTab.DASHBOARD);

  // Theme State
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    if (typeof window !== 'undefined') {
      const savedTheme = localStorage.getItem('agriflow_theme') as 'light' | 'dark';
      if (savedTheme) {
        return savedTheme;
      }
      if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        return 'dark';
      }
    }
    return 'light';
  });

  // Apply Theme to DOM
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('agriflow_theme', theme);
  }, [theme]);

  const [crops, setCrops] = useState<Crop[]>([]);
  const [livestock, setLivestock] = useState<Livestock[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [learningModules, setLearningModules] = useState<LearningModule[]>([]);
  const [newsArticles, setNewsArticles] = useState<NewsArticle[]>([]);
  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [listings, setListings] = useState<MarketplaceListing[]>([]);
  const [posts, setPosts] = useState<ForumPost[]>([]);
  const [chatMessages, setChatMessages] = useState<CommunityChatMessage[]>([]);
  
  // Social State
  const [stories, setStories] = useState<Story[]>([]);
  const [trends, setTrends] = useState<SocialTrend[]>([]);
  const [suggestedUsers, setSuggestedUsers] = useState<SuggestedUser[]>([]);
  const [followedUserIds, setFollowedUserIds] = useState<string[]>([]);
  const [likedPostIds, setLikedPostIds] = useState<string[]>([]);

  // Poll State (Persisted in session)
  const [pollData, setPollData] = useState<PollOption[]>([
    { id: 1, text: 'Switching to Drought Seeds', percent: 45, votes: 558 },
    { id: 2, text: 'Increasing Irrigation', percent: 30, votes: 372 },
    { id: 3, text: 'Reducing Acreage', percent: 25, votes: 310 },
  ]);
  const [pollVoted, setPollVoted] = useState<number | null>(null);

  // Location & Weather State
  const [userLocation, setUserLocation] = useState<UserLocation>({
    latitude: null,
    longitude: null,
    error: null,
    timestamp: null
  });
  const [weather, setWeather] = useState<WeatherData>(MOCK_WEATHER);

  // --- Initialization ---
  useEffect(() => {
    const loadData = async () => {
      try {
        const [
          loadedCrops, 
          loadedLivestock, 
          loadedTasks, 
          loadedModules, 
          loadedPrices, 
          loadedListings, 
          loadedPosts, 
          loadedChats, 
          loadedStories, 
          loadedTrends, 
          loadedSuggested, 
          loadedFollows, 
          loadedLikes,
          loadedProfile
        ] = await Promise.all([
          CropService.getAll(),
          LivestockService.getAll(),
          db.getTasks(),
          db.getModules(),
          MarketService.getAll(),
          CommunityService.getListings(),
          CommunityService.getPosts(),
          CommunityService.getChatMessages(),
          CommunityService.getStories(),
          CommunityService.getTrends(),
          CommunityService.getSuggestedUsers(),
          CommunityService.getFollowedUserIds(),
          CommunityService.getLikedPostIds(),
          db.getUserProfile()
        ]);

        setCrops(loadedCrops);
        setLivestock(loadedLivestock);
        setTasks(loadedTasks);
        setLearningModules(loadedModules);
        setMarketPrices(loadedPrices);
        setListings(loadedListings);
        setPosts(loadedPosts);
        setChatMessages(loadedChats);
        setStories(loadedStories);
        setTrends(loadedTrends);
        setSuggestedUsers(loadedSuggested);
        setFollowedUserIds(loadedFollows);
        setLikedPostIds(loadedLikes);
        
        // If persisted profile name differs from Guest, assume logged in (for simple persistence)
        if (loadedProfile && loadedProfile.name !== GUEST_USER.name) {
           setUserProfile(loadedProfile);
           setIsSignedIn(true);
        }
      } catch (error) {
        console.error("Failed to load farm data:", error);
      }
    };
    loadData();
    refreshLocation();
  }, []);

  // Navigation Logic
  const navigate = useCallback((view: NavigationTab) => {
    setCurrentView(view);
  }, []);

  // Theme Logic
  const toggleTheme = useCallback(() => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  }, []);

  // Toast Logic
  const showToast = useCallback((message: string, type: ToastMessage['type'] = 'info') => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    // Auto remove
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Poll Logic
  const handlePollVote = useCallback((optionId: number) => {
    if (pollVoted !== null) return;
    setPollVoted(optionId);
    
    setPollData(prev => {
      const updated = prev.map(opt => {
        if (opt.id === optionId) {
          return { ...opt, votes: opt.votes + 1 };
        }
        return opt;
      });
      
      const totalVotes = updated.reduce((acc, curr) => acc + curr.votes, 0);
      return updated.map(opt => ({
        ...opt,
        percent: Math.round((opt.votes / totalVotes) * 100)
      }));
    });
    showToast('Vote submitted', 'success');
  }, [pollVoted, showToast]);

  // --- Auth Logic ---
  const login = useCallback(async (name: string, email: string) => {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 800));
    const newProfile = {
      ...CURRENT_USER,
      name: name || CURRENT_USER.name
    };
    setUserProfile(newProfile);
    setIsSignedIn(true);
    db.saveUserProfile(newProfile);
    showToast(`Welcome back, ${newProfile.name}`, 'success');
  }, [showToast]);

  const logout = useCallback(() => {
    setUserProfile(GUEST_USER);
    setIsSignedIn(false);
    showToast('Signed out successfully', 'info');
  }, [showToast]);

  const updateUserProfile = useCallback(async (updates: Partial<UserProfile>) => {
    const newProfile = { ...userProfile, ...updates };
    setUserProfile(newProfile);
    await db.saveUserProfile(newProfile);
    showToast('Profile updated', 'success');
  }, [userProfile, showToast]);

  const resetApp = useCallback(() => {
    // Clear Local Storage Keys for App
    Object.values(DB_KEYS).forEach(key => localStorage.removeItem(key));
    localStorage.removeItem('agriflow_theme');
    window.location.reload();
  }, []);

  // --- Location Logic ---
  const refreshLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setUserLocation(prev => ({ ...prev, error: "Geolocation not supported by browser" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          error: null,
          timestamp: position.timestamp
        });
      },
      (error) => {
        let errorMessage = "Unknown location error";
        switch(error.code) {
          case error.PERMISSION_DENIED: errorMessage = "Location permission denied"; break;
          case error.POSITION_UNAVAILABLE: errorMessage = "Location unavailable"; break;
          case error.TIMEOUT: errorMessage = "Location request timed out"; break;
        }
        setUserLocation(prev => ({ ...prev, error: errorMessage }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 }
    );
  }, []);

  // --- Weather Update Effect ---
  useEffect(() => {
    const updateWeather = async () => {
      if (userLocation.latitude && userLocation.longitude) {
        try {
          const localWeather = await WeatherService.getLocalWeather(userLocation.latitude, userLocation.longitude);
          setWeather(localWeather);
        } catch (e) {
          console.error("Failed to update local weather", e);
        }
      }
    };
    updateWeather();
  }, [userLocation]);

  // --- Crop Actions ---
  const addCrop = useCallback(async (cropData: Omit<Crop, 'id'>) => {
    try {
      const updated = await CropService.add(cropData);
      setCrops(updated);
      showToast('Crop plot registered', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to add crop', 'error');
    }
  }, [showToast]);

  const deleteCrop = useCallback(async (id: string) => {
    try {
      const updated = await CropService.delete(id);
      setCrops(updated);
      showToast('Crop plot removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const updateCropStatus = useCallback(async (id: string, status: Crop['status']) => {
    try {
      const updated = await CropService.updateStatus(id, status);
      setCrops(updated);
      showToast(`Status updated to ${status}`, 'success');
    } catch (e) {
      console.error("Failed to update status", e);
    }
  }, [showToast]);

  // --- Livestock Actions ---
  const addLivestock = useCallback(async (animalData: Omit<Livestock, 'id'>) => {
    try {
      const updated = await LivestockService.add(animalData);
      setLivestock(updated);
      showToast('Herd unit registered', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to add livestock', 'error');
    }
  }, [showToast]);

  const deleteLivestock = useCallback(async (id: string) => {
    try {
      const updated = await LivestockService.delete(id);
      setLivestock(updated);
      showToast('Herd unit removed', 'info');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const updateLivestockStatus = useCallback(async (id: string, status: Livestock['status']) => {
    try {
      const updated = await LivestockService.updateHealth(id, status);
      setLivestock(updated);
      showToast(`Herd status updated to ${status}`, 'success');
    } catch (e) {
      console.error("Failed to update livestock status", e);
    }
  }, [showToast]);

  // --- Task Actions ---
  const toggleTask = useCallback((id: string) => {
    setTasks(prevTasks => {
      const updatedTasks = prevTasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t);
      db.saveTasks(updatedTasks);
      return updatedTasks;
    });
  }, []);

  const addTask = useCallback((text: string) => {
    setTasks(prevTasks => {
      const newTask: Task = { id: Date.now().toString(), text, completed: false, priority: 'normal' };
      const updatedTasks = [newTask, ...prevTasks];
      db.saveTasks(updatedTasks);
      return updatedTasks;
    });
    showToast('New task added', 'success');
  }, [showToast]);

  // --- Education Actions ---
  const completeModule = useCallback((id: string) => {
    setLearningModules(prevModules => {
      const updatedModules = prevModules.map(m => m.id === id ? { ...m, completed: true } : m);
      db.saveModules(updatedModules);
      return updatedModules;
    });
    showToast('Course completed! Certificate saved.', 'success');
  }, [showToast]);

  // --- Market Actions ---
  const refreshMarketPrices = useCallback(async () => {
    try {
      const updated = await MarketService.refreshPrices();
      setMarketPrices(updated);
      showToast('Market prices updated', 'success');
    } catch (e) {
      console.error("Market update failed", e);
      showToast('Failed to fetch prices', 'error');
    }
  }, [showToast]);

  // --- News Actions ---
  const refreshNews = useCallback(async () => {
    setIsLoadingNews(true);
    try {
      const articles = await fetchAgNews();
      setNewsArticles(articles);
    } catch (e) {
      console.error("News fetch failed", e);
      showToast('Failed to fetch news', 'error');
    } finally {
      setIsLoadingNews(false);
    }
  }, [showToast]);

  // --- Log Actions ---
  const addActivityLog = useCallback(async (log: Omit<LogEntry, 'id'>) => {
    try {
      await LogService.add(log);
      showToast('Activity log saved', 'success');
    } catch (e) {
      console.error("Failed to add log", e);
      throw e; 
    }
  }, [showToast]);

  const getLogsByRef = useCallback(async (refId: string) => {
    return await LogService.getByReference(refId);
  }, []);

  // --- Community Actions ---
  const addListing = useCallback(async (listing: Omit<MarketplaceListing, 'id' | 'verified' | 'status' | 'date'>) => {
    try {
      const updated = await CommunityService.addListing(listing);
      setListings(updated);
      showToast('Listing published to Marketplace', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to create listing', 'error');
    }
  }, [showToast]);

  const markListingSold = useCallback(async (id: string) => {
    try {
      const updated = await CommunityService.markListingAsSold(id);
      setListings(updated);
      showToast('Listing marked as sold', 'success');
    } catch (e) {
      console.error(e);
    }
  }, [showToast]);

  const addPost = useCallback(async (post: Omit<ForumPost, 'id' | 'replies' | 'likes' | 'date'>) => {
    try {
      const updated = await CommunityService.addPost(post);
      setPosts(updated);
      showToast('Post shared with community', 'success');
    } catch (e) {
      console.error(e);
      showToast('Failed to post', 'error');
    }
  }, [showToast]);

  const getPostReplies = useCallback(async (postId: string) => {
    return await CommunityService.getPostReplies(postId);
  }, []);

  const addPostReply = useCallback(async (postId: string, content: string) => {
    const replies = await CommunityService.addReply(postId, content, userProfile.name);
    const updatedPosts = await CommunityService.getPosts(); // sync counts
    setPosts(updatedPosts);
    showToast('Reply added', 'success');
    return replies;
  }, [userProfile, showToast]);

  const likePost = useCallback(async (postId: string) => {
    try {
      const { posts: updatedPosts, likedIds: updatedLikedIds } = await CommunityService.toggleLike(postId);
      setPosts(updatedPosts);
      setLikedPostIds(updatedLikedIds);
    } catch (e) {
      console.error("Failed to like post", e);
    }
  }, []);

  const sendChatMessage = useCallback(async (message: Omit<CommunityChatMessage, 'id' | 'timestamp'>) => {
    try {
      const updated = await CommunityService.sendMessage(message);
      setChatMessages(updated);
    } catch (e) {
      console.error("Failed to send message", e);
    }
  }, []);

  // --- Social Actions ---
  const toggleFollowUser = useCallback(async (userId: string) => {
    try {
      const updated = await CommunityService.toggleFollowUser(userId);
      setFollowedUserIds(updated);
      const isFollowing = updated.includes(userId);
      showToast(isFollowing ? 'Following user' : 'Unfollowed user', 'info');
    } catch (e) {
      console.error("Failed to toggle follow", e);
    }
  }, [showToast]);

  const dismissAlert = useCallback((id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  }, []);

  return (
    <FarmContext.Provider value={{ 
      userProfile, isSignedIn, alerts,
      theme, toggleTheme, currentView, navigate,
      toasts, showToast, removeToast,
      crops, livestock, tasks, marketPrices, learningModules, newsArticles, isLoadingNews, listings, posts, chatMessages, userLocation, weather,
      stories, trends, suggestedUsers, followedUserIds, likedPostIds,
      pollData, pollVoted, handlePollVote,
      login, logout, updateUserProfile, resetApp,
      addCrop, deleteCrop, updateCropStatus, addLivestock, deleteLivestock, updateLivestockStatus, toggleTask, addTask, completeModule, 
      refreshMarketPrices, refreshNews, refreshLocation,
      addActivityLog, getLogsByRef, 
      addListing, markListingSold, 
      addPost, getPostReplies, addPostReply, likePost,
      sendChatMessage, toggleFollowUser, dismissAlert
    }}>
      {children}
    </FarmContext.Provider>
  );
};

export const useFarm = () => {
  const context = useContext(FarmContext);
  if (context === undefined) {
    throw new Error('useFarm must be used within a FarmProvider');
  }
  return context;
};
