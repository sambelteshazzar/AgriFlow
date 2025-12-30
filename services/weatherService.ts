import { WeatherData } from '../types';
import { MOCK_WEATHER } from '../constants';

export class WeatherService {
  static async getLocalWeather(lat: number, lon: number): Promise<WeatherData> {
    // Simulate API network latency
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Deterministic simulation based on coordinates to make it feel persistent
    // Lat affects temp, Long affects wind (hypothetically)
    const tempMod = (Math.abs(lat) % 15); 
    const newTemp = Math.round(18 + tempMod);
    const newWind = Math.round(5 + (Math.abs(lon) % 20));
    
    // Logic for condition/risk based on the simulated temp
    let condition = 'Partly Cloudy';
    let risk: 'Low' | 'Moderate' | 'High' | 'Severe' = 'Low';
    let forecast = 'Optimal growing conditions. Soil moisture stable.';

    if (newTemp > 30) {
      condition = 'Heat Wave';
      risk = 'High';
      forecast = 'Extreme heat expected. Increase irrigation frequency immediately.';
    } else if (newTemp > 25) {
      condition = 'Sunny';
      risk = 'Moderate';
      forecast = 'High evaporation rates. Monitor young seedlings.';
    } else if (newTemp < 10) {
      condition = 'Frost Warning';
      risk = 'Severe';
      forecast = 'Frost events likely overnight. Cover sensitive crops.';
    } else if ((Math.abs(lon) % 10) > 7) {
      condition = 'Heavy Rain';
      risk = 'Moderate';
      forecast = 'Precipitation expected. Delay fertilizer application.';
    }

    return {
      locationName: `Field Sector ${lat.toFixed(2)}`, // Simulating a mapped sector name
      temp: newTemp,
      condition: condition,
      humidity: Math.round(40 + (Math.abs(lon) % 40)),
      windSpeed: newWind,
      forecast: forecast,
      climateRiskIndex: risk
    };
  }
}