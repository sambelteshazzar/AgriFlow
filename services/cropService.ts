
import { db } from './persistence';
import { Crop } from '../types';

export class CropService {
  static async getAll(): Promise<Crop[]> {
    return await db.getCrops();
  }

  static async add(cropData: Omit<Crop, 'id'>): Promise<Crop[]> {
    // Backend Validation
    if (!cropData.name || !cropData.variety || cropData.area <= 0) {
      throw new Error("Invalid crop data: Name, Variety, and Area > 0 are required.");
    }

    const currentCrops = await db.getCrops();
    
    const newCrop: Crop = {
      ...cropData,
      id: db.generateId('crop'),
      biodiversityScore: cropData.biodiversityScore ?? 50,
      soilHealth: cropData.soilHealth || 'Unknown',
      waterEfficiency: cropData.waterEfficiency || 'Moderate',
      status: cropData.status || 'Healthy'
    };

    const updatedCrops = [newCrop, ...currentCrops];
    await db.saveCrops(updatedCrops);
    return updatedCrops;
  }

  static async delete(id: string): Promise<Crop[]> {
    const currentCrops = await db.getCrops();
    const updatedCrops = currentCrops.filter(c => c.id !== id);
    await db.saveCrops(updatedCrops);
    return updatedCrops;
  }

  static async updateStatus(id: string, status: Crop['status']): Promise<Crop[]> {
    const currentCrops = await db.getCrops();
    const updatedCrops = currentCrops.map(c => 
      c.id === id ? { ...c, status } : c
    );
    await db.saveCrops(updatedCrops);
    return updatedCrops;
  }

  /**
   * Calculates projected revenue based on area, soil health, and current market price.
   * This represents logic that would typically live on a backend server.
   */
  static calculateProjectedYield(crop: Crop, marketPricePerUnit: number): number {
    // Base yield per acre (hypothetical generic unit)
    let baseYield = 100; 

    // Modifiers based on health
    if (crop.soilHealth === 'Excellent') baseYield *= 1.2;
    if (crop.soilHealth === 'Degraded') baseYield *= 0.7;
    
    // Modifiers based on water efficiency
    if (crop.waterEfficiency === 'High') baseYield *= 1.1;
    if (crop.waterEfficiency === 'Low') baseYield *= 0.9;

    const totalYield = baseYield * crop.area;
    return Math.floor(totalYield * marketPricePerUnit);
  }
}
