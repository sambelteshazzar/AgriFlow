import { db } from './persistence';
import { Livestock } from '../types';

export class LivestockService {
  static async getAll(): Promise<Livestock[]> {
    return await db.getLivestock();
  }

  static async add(animalData: Omit<Livestock, 'id'>): Promise<Livestock[]> {
    // Backend Validation
    if (!animalData.name || !animalData.count || animalData.count <= 0) {
      throw new Error("Invalid livestock data: Name and Count > 0 are required.");
    }

    const currentLivestock = await db.getLivestock();
    
    // Robust ID generation to ensure data integrity
    const newAnimal: Livestock = {
      ...animalData,
      id: `${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      grazingType: animalData.grazingType || 'Rotational',
      status: animalData.status || 'Healthy'
    };

    const updatedLivestock = [newAnimal, ...currentLivestock];
    await db.saveLivestock(updatedLivestock);
    return updatedLivestock;
  }

  static async delete(id: string): Promise<Livestock[]> {
    const currentLivestock = await db.getLivestock();
    const updatedLivestock = currentLivestock.filter(a => a.id !== id);
    await db.saveLivestock(updatedLivestock);
    return updatedLivestock;
  }

  static async updateHealth(id: string, status: Livestock['status']): Promise<Livestock[]> {
    const currentLivestock = await db.getLivestock();
    const updatedLivestock = currentLivestock.map(a => 
      a.id === id ? { ...a, status } : a
    );
    await db.saveLivestock(updatedLivestock);
    return updatedLivestock;
  }
}