
import { Crop, MarketPrice, WeatherData, ChartDataPoint, Task, Livestock, LearningModule, MarketplaceListing, ForumPost, CommunityChatMessage, Story, SocialTrend, SuggestedUser, UserProfile, SystemAlert } from './types';

export const APP_NAME = "AgriFlow";

// --- CURRENT USER IDENTITY ---
export const CURRENT_USER: UserProfile = {
  name: "Thomas Hale",
  role: "Lead Grower",
  farmName: "Hale Valley Farms",
  avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=300&q=80",
  bio: "Managing 450 acres of mixed crops with a focus on regenerative soil practices. Always testing new ag-tech.",
  followers: 1240,
  following: 85,
  posts: 142
};

export const GUEST_USER: UserProfile = {
  name: "Guest Farmer",
  role: "Visitor",
  farmName: "Demo Farm",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80", 
  bio: "Exploring the AgriFlow platform features. Sign in to sync your farm data.",
  followers: 0,
  following: 0,
  posts: 0
};

export const INITIAL_ALERTS: SystemAlert[] = [
  {
    id: '1',
    title: 'Profitability Squeeze',
    message: 'Nitrogen fertilizer prices up 12% this month. Re-evaluate application rates for Maize plots.',
    severity: 'high',
    category: 'FINANCIAL',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    title: 'Soil Degradation Warning',
    message: 'Sector 4 organic matter dropping below 2.5%. Cover cropping recommended immediately.',
    severity: 'medium',
    category: 'LAND',
    timestamp: new Date(Date.now() - 3600000).toISOString()
  },
  {
    id: '3',
    title: 'Heat Wave Approaching',
    message: 'Temperatures expected to exceed 35°C next Tuesday. Verify irrigation pumps.',
    severity: 'critical',
    category: 'WEATHER',
    timestamp: new Date(Date.now() - 7200000).toISOString()
  }
];

export const MOCK_WEATHER: WeatherData = {
  locationName: 'Hale Valley Station',
  temp: 28,
  condition: 'Heat Advisory',
  humidity: 45,
  windSpeed: 18,
  forecast: 'El Niño conditions persisting. High evapotranspiration rates expected.',
  climateRiskIndex: 'High'
};

export const INITIAL_CROPS: Crop[] = [
  {
    id: '1',
    name: 'Maize',
    variety: 'Drought-Tol 404',
    plantingDate: '2023-09-15',
    harvestDate: '2024-01-20',
    status: 'Needs Attention',
    area: 12.5,
    imageUrl: 'https://images.unsplash.com/photo-1551754655-cd27e38d2076?q=80&w=1000&auto=format&fit=crop', // Corn Field
    soilHealth: 'Degraded',
    waterEfficiency: 'Low',
    biodiversityScore: 20
  },
  {
    id: '2',
    name: 'Cover Crop Mix',
    variety: 'Legume/Rye',
    plantingDate: '2023-11-01',
    harvestDate: '2024-02-15',
    status: 'Healthy',
    area: 5.0,
    imageUrl: 'https://images.unsplash.com/photo-1599940824399-b87987ced72a?q=80&w=1000&auto=format&fit=crop', // Soybean/Legume
    soilHealth: 'Excellent',
    waterEfficiency: 'High',
    biodiversityScore: 95
  },
  {
    id: '3',
    name: 'Coffee',
    variety: 'Arabica Shade',
    plantingDate: '2020-03-10',
    harvestDate: '2024-04-01',
    status: 'Healthy',
    area: 8.0,
    imageUrl: 'https://images.unsplash.com/photo-1584345604325-f5091269a0d1?q=80&w=1000&auto=format&fit=crop', // Coffee
    soilHealth: 'Good',
    waterEfficiency: 'Moderate',
    biodiversityScore: 75
  }
];

export const INITIAL_LIVESTOCK: Livestock[] = [
  {
    id: '1',
    name: 'Mob Grazing Unit A',
    species: 'Cattle',
    count: 24,
    status: 'Healthy',
    grazingType: 'Rotational',
    imageUrl: 'https://images.unsplash.com/photo-1546445317-29f4545e9d53?q=80&w=1000&auto=format&fit=crop', // Cattle
    notes: 'Used for soil aeration in Sector 4.'
  },
  {
    id: '2',
    name: 'Orchard Patrol',
    species: 'Chicken',
    count: 100,
    status: 'Healthy',
    grazingType: 'Free Range',
    imageUrl: 'https://images.unsplash.com/photo-1548550023-2bdb3c5beed7?q=80&w=1000&auto=format&fit=crop', // Chicken
    notes: 'Natural pest control to reduce chemical input costs.'
  }
];

export const INITIAL_MODULES: LearningModule[] = [
  {
    id: '1',
    title: 'Advanced Soil Regenerative Systems',
    instructor: 'Dr. Elaine Richards',
    thumbnail: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?q=80&w=800&fit=crop', // Soil hands
    lessonsCount: 12,
    category: 'Regenerative',
    difficulty: 'Advanced',
    duration: '4h 15m',
    completed: false,
    description: 'Master the soil food web. Learn biological inoculation, cover crop termination timing, and carbon sequestration techniques for large acreage.'
  },
  {
    id: '2',
    title: 'Financial Resilience in Crisis',
    instructor: 'Michael Econ, MBA',
    thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?q=80&w=800', // Finance
    lessonsCount: 8,
    category: 'Economics',
    difficulty: 'Intermediate',
    duration: '2h 30m',
    completed: true,
    description: 'Strategies to hedge against input cost inflation. Hedging commodity prices, reducing nitrogen reliance, and cooperative purchasing power.'
  },
  {
    id: '3',
    title: 'Precision Irrigation Mastery',
    instructor: 'Prof. John Water',
    thumbnail: 'https://images.unsplash.com/photo-1563309461-a319263584d7?q=80&w=800', // Irrigation
    lessonsCount: 15,
    category: 'Tech',
    difficulty: 'Advanced',
    duration: '5h 00m',
    completed: false,
    description: 'Implement VRI (Variable Rate Irrigation) and soil moisture sensors. Optimize water usage per crop stage to combat drought conditions.'
  },
  {
    id: '4',
    title: 'Agri-Tech Drone Pilot',
    instructor: 'Tech Lead Sarah',
    thumbnail: 'https://images.unsplash.com/photo-1508614589041-895b8c9d7ef5?q=80&w=800', // Drone
    lessonsCount: 6,
    category: 'Tech',
    difficulty: 'Beginner',
    duration: '1h 45m',
    completed: false,
    description: 'Certification prep for deploying NDVI drones. Learn to spot disease stress before it becomes visible to the naked eye.'
  },
  {
    id: '5',
    title: 'Integrated Pest Management 2.0',
    instructor: 'Dr. Emily Vane',
    thumbnail: 'https://images.unsplash.com/photo-1585652684742-c24c64db7071?q=80&w=800', // Pests
    lessonsCount: 10,
    category: 'Resilience',
    difficulty: 'Intermediate',
    duration: '3h 20m',
    completed: false,
    description: 'Beyond chemicals. Using beneficial insects, trap crops, and pheromone disruptors to control armyworm and locust outbreaks efficiently.'
  }
];

export const MARKET_PRICES: MarketPrice[] = [
  { cropName: 'Maize', price: 42.00, unit: 'per 90kg', trend: 'down', changePercentage: -5.4, inputCostIndex: 115 },
  { cropName: 'Soybean', price: 95.00, unit: 'per kg', trend: 'stable', changePercentage: 0.2, inputCostIndex: 108 },
  { cropName: 'Wheat', price: 58.00, unit: 'per bushel', trend: 'up', changePercentage: 8.1, inputCostIndex: 112 },
  { cropName: 'Coffee (Arabica)', price: 4.80, unit: 'per kg', trend: 'up', changePercentage: 15.3, inputCostIndex: 140 },
  { cropName: 'Cotton', price: 0.85, unit: 'per lb', trend: 'down', changePercentage: -2.1, inputCostIndex: 125 },
  { cropName: 'Rice', price: 18.50, unit: 'per cwt', trend: 'stable', changePercentage: 0.5, inputCostIndex: 105 },
  { cropName: 'Cocoa', price: 3400.00, unit: 'per ton', trend: 'up', changePercentage: 4.2, inputCostIndex: 130 },
  { cropName: 'Fertilizer (UREA)', price: 120.00, unit: 'per 50kg', trend: 'up', changePercentage: 12.5, inputCostIndex: 100 },
];

export const YIELD_DATA: ChartDataPoint[] = [
  { name: '2020', value: 2400, cost: 1200 },
  { name: '2021', value: 2800, cost: 1300 },
  { name: '2022', value: 3900, cost: 1800 },
  { name: '2023', value: 3500, cost: 2600 },
  { name: '2024', value: 3200, cost: 2900 },
  { name: '2025 (Est)', value: 3100, cost: 3050 },
];

export const INITIAL_TASKS: Task[] = [
  { id: '1', text: 'Secure Drought-Resistant Seed', completed: false, priority: 'high' },
  { id: '2', text: 'Soil Moisture Test - Sector North', completed: false, priority: 'high' },
  { id: '3', text: 'Calibrate Sprayer to reduce waste', completed: false, priority: 'normal' },
];

export const INITIAL_LISTINGS: MarketplaceListing[] = [
  { 
    id: '1', 
    type: 'SELL', 
    item: 'Organic Maize - 50 Bags', 
    price: '$38/bag', 
    location: 'West County', 
    contact: 'thomas@halevalley.com', 
    verified: true,
    status: 'ACTIVE',
    date: new Date(Date.now() - 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1628102491629-778571d893a3?q=80&w=400&auto=format&fit=crop'
  },
  { 
    id: '2', 
    type: 'BUY', 
    item: 'Tractor Service - 2 Days', 
    price: 'Negotiable', 
    location: 'Hale Valley', 
    contact: 'thomas@halevalley.com', 
    verified: true,
    status: 'ACTIVE',
    date: new Date(Date.now() - 172800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1519337265831-281ec6cc8514?w=400&fit=crop'
  },
];

export const INITIAL_POSTS: ForumPost[] = [
  { 
    id: '1', 
    author: 'Sarah K.', 
    title: 'Best cover crop for clay soil in dry season?', 
    content: 'I have heavy clay soil in Sector 4 and we are expecting a dry spell. Has anyone had success with Sorghum-Sudangrass hybrids or should I stick to Rye?',
    replies: 12, 
    likes: 5,
    category: 'General',
    date: new Date(Date.now() - 86400000).toISOString(),
    image: 'https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=400&auto=format&fit=crop'
  },
  { 
    id: '2', 
    author: 'Mike D.', 
    title: 'Armyworm outbreak reported in eastern zone', 
    content: 'Just a heads up, my traps caught 50+ moths last night. Check your maize whorls immediately. Early action is key.',
    replies: 45, 
    likes: 124,
    category: 'Pests',
    date: new Date(Date.now() - 3600000).toISOString(),
    image: 'https://images.unsplash.com/photo-1533230537024-38c3459c9c9b?q=80&w=400&auto=format&fit=crop'
  },
  { 
    id: '3', 
    author: 'AgroTech', 
    title: 'Review of new solar pump models', 
    content: 'We tested the SunFlow 3000 vs the AquaSolar. Here are the flow rate results under partial cloud cover...',
    replies: 8, 
    likes: 12,
    category: 'Equipment',
    date: new Date(Date.now() - 604800000).toISOString(),
    image: 'https://images.unsplash.com/photo-1591466068305-64906f363065?q=80&w=400&auto=format&fit=crop'
  },
];

export const INITIAL_CHAT_MESSAGES: CommunityChatMessage[] = [
  { id: '1', channelId: 'general', author: 'Old MacDonald', text: 'Looks like rain coming in on Tuesday, make sure to cover the hay bales!', timestamp: new Date(Date.now() - 3600000).toISOString(), avatar: 'https://images.unsplash.com/photo-1595211877493-41a4e65eda99?w=150&h=150&fit=crop', isMe: false },
  { id: '2', channelId: 'general', author: 'Sarah K.', text: 'Thanks for the heads up! My weather app says dry but the sky says otherwise.', timestamp: new Date(Date.now() - 1800000).toISOString(), avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop', isMe: false },
  { id: '3', channelId: 'equipment', author: 'Mike D.', text: 'Anyone familiar with fixing a hydraulics leak on a JD 5050? Need advice ASAP.', timestamp: new Date(Date.now() - 900000).toISOString(), avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=150&h=150&fit=crop', isMe: false },
  { id: '4', channelId: 'fun-zone', author: 'FunnyFarmer', text: 'Why did the scarecrow win an award? Because he was outstanding in his field! 😂', timestamp: new Date(Date.now() - 4000000).toISOString(), avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop', isMe: false },
];

export const INITIAL_STORIES: Story[] = [
  { id: 'create', name: 'Add Story', img: 'https://images.unsplash.com/photo-1595211877493-41a4e65eda99?w=150&h=150&fit=crop', isUser: true },
  { id: '1', name: 'Sarah Farms', img: 'https://images.unsplash.com/photo-1627920769842-6887c7df0561?w=150&h=150&fit=crop', hasUpdate: true },
  { id: '2', name: 'GreenCo', img: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=150&h=150&fit=crop', hasUpdate: true },
  { id: '3', name: 'Vet Mike', img: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop', hasUpdate: false },
  { id: '4', name: 'AgriMach', img: 'https://images.unsplash.com/photo-1595514682057-01053229b150?w=150&h=150&fit=crop', hasUpdate: true },
];

export const INITIAL_TRENDS: SocialTrend[] = [
  { id: '1', tag: '#Harvest2025', volume: '12.4K Posts' },
  { id: '2', tag: '#SustainableSoil', volume: '8.2K Posts' },
  { id: '3', tag: '#DroughtResilience', volume: '5.1K Posts' },
  { id: '4', tag: '#AgriTech', volume: '3.9K Posts' },
];

export const INITIAL_SUGGESTED_USERS: SuggestedUser[] = [
  { id: 'sf1', name: "Sarah Jenkins", role: "Organic Specialist", img: "https://images.unsplash.com/photo-1627920769842-6887c7df0561?w=150&h=150&fit=crop", mutual: 12 },
  { id: 'sf2', name: "David Chen", role: "Hydroponics Lead", img: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?w=150&h=150&fit=crop", mutual: 8 },
  { id: 'sf3', name: "Elena Rodriguez", role: "Livestock Vet", img: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop", mutual: 24 }
];
