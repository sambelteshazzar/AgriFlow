
import { db } from './persistence';
import { MarketPrice } from '../types';
import { MARKET_PRICES } from '../constants';

export class MarketService {
  static async getAll(): Promise<MarketPrice[]> {
    return await db.getMarketPrices();
  }

  static async refreshPrices(): Promise<MarketPrice[]> {
    let currentPrices = await db.getMarketPrices();
    const currentTrends = await db.getMarketTrends();
    
    // Migration: Add missing default crops if they don't exist in current storage
    // This ensures new crops (Coffee, Cotton, etc.) appear for existing users
    const existingNames = new Set(currentPrices.map(p => p.cropName));
    const missingDefaults = MARKET_PRICES.filter(p => !existingNames.has(p.cropName));
    
    if (missingDefaults.length > 0) {
      currentPrices = [...currentPrices, ...missingDefaults];
    }
    
    const updatedPrices = currentPrices.map(item => {
      // 1. Initialize Trend if missing
      if (!currentTrends[item.cropName] || currentTrends[item.cropName].duration <= 0) {
        // Decide new trend
        const rand = Math.random();
        let direction: 'UP' | 'DOWN' | 'STABLE' = 'STABLE';
        if (rand > 0.6) direction = 'UP';
        else if (rand < 0.4) direction = 'DOWN';
        
        currentTrends[item.cropName] = {
          direction,
          duration: Math.floor(Math.random() * 5) + 3 // Trend lasts 3-8 updates
        };
      }

      // 2. Apply Trend Logic
      const trend = currentTrends[item.cropName];
      let trendBias = 0;
      if (trend.direction === 'UP') trendBias = 0.03; // +3% bias
      if (trend.direction === 'DOWN') trendBias = -0.03; // -3% bias

      // 3. Random Volatility (Noise)
      const volatility = 0.02; // +/- 2% noise
      const noise = (Math.random() * volatility * 2) - volatility;

      const totalChangePercent = trendBias + noise;
      const newPrice = Math.max(0.5, Number((item.price * (1 + totalChangePercent)).toFixed(2))); // Prevent negative prices

      // 4. Update Trend Display
      let displayTrend: 'up' | 'down' | 'stable' = 'stable';
      if (totalChangePercent > 0.005) displayTrend = 'up';
      else if (totalChangePercent < -0.005) displayTrend = 'down';

      // 5. Decrement Duration
      trend.duration -= 1;

      return { 
        ...item, 
        price: newPrice, 
        trend: displayTrend, 
        changePercentage: Number((totalChangePercent * 100).toFixed(1))
      };
    });

    // Save state
    await db.saveMarketPrices(updatedPrices);
    await db.saveMarketTrends(currentTrends);

    return updatedPrices;
  }
}
