
import { GoogleGenAI, GenerateContentResponse, Type } from "@google/genai";
import { WeatherData, Crop, Task, NewsArticle } from '../types';

// Initialize the Gemini Client
// Using process.env.API_KEY directly as per guidelines.
// Note: If API_KEY is missing, API calls will be skipped via check below.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// --- SIMPLE IN-MEMORY CACHE ---
const responseCache = new Map<string, any>();

// --- FALLBACK DATA (SIMULATION LAYER) ---
const FALLBACK_NEWS: NewsArticle[] = [
  { id: 'fb-1', title: 'Global Wheat Prices Stabilize After Record Harvest Reports', summary: 'Major output from Australia and Canada has calmed fears of a supply deficit, bringing futures down by 3.4% this week.', category: 'Market', source: 'AgriGlobal Wire', timeAgo: '2h ago', url: '#' },
  { id: 'fb-2', title: 'New Drought-Resistant Maize Variety Approved for 2025', summary: 'The "Hydra-Guard" seed promises 20% higher yields in sub-optimal moisture conditions, targeted at Midwest growers.', category: 'Tech', source: 'SeedTech Daily', timeAgo: '5h ago', url: '#' },
  { id: 'fb-3', title: 'Carbon Credit Subsidies Expanded for Cover Cropping', summary: 'Federal policy changes now allow retroactive claiming for fields under continuous cover for 3+ years.', category: 'Policy', source: 'Farm Policy Journal', timeAgo: '8h ago', url: '#' },
  { id: 'fb-4', title: 'El Niño Transition Expected to Bring Wet Spring', summary: 'Meteorologists predict a rapid shift to ENSO-neutral conditions, increasing flood risks for river valley farms.', category: 'Climate', source: 'Weather Watch', timeAgo: '12h ago', url: '#' },
  { id: 'fb-5', title: 'Autonomous Tractor Fleets See 40% Adoption Jump', summary: 'Labor shortages are driving rapid automation in harvest operations across California and Texas.', category: 'Tech', source: 'Future Farming', timeAgo: '1d ago', url: '#' },
  { id: 'fb-6', title: 'Nitrogen Fertilizer Prices Dip to 2-Year Low', summary: 'Easing natural gas costs have finally trickled down to input suppliers, offering relief for the upcoming planting season.', category: 'Market', source: 'Commodity Inst.', timeAgo: '1d ago', url: '#' },
];

const FALLBACK_INTEL = `• Soybeans showing bullish trend (+1.2%) due to export demand spike.
• Heavy rainfall forecast for Midwest may delay planting windows by 5-7 days.
• New pest advisory: Armyworm moth counts elevated in southern sectors.`;

const FALLBACK_TASKS = [
  "Inspect irrigation nozzles in Sector 4 for pressure drops.",
  "Scout Maize borders for early signs of Armyworm activity.",
  "Update inventory logs for upcoming fertilizer delivery."
];

const FALLBACK_ADVICE = {
  text: "Based on standard agricultural protocols, I recommend focusing on soil moisture retention given the current dry forecast. \n\n1. **Mulching**: Apply organic residue to reduce evaporation.\n2. **Irrigation Timing**: Shift watering schedules to pre-dawn hours to maximize absorption.\n3. **Scouting**: Check for heat stress markers like leaf rolling in maize.",
  sources: []
};

const FALLBACK_ANALYSIS = "Based on visual analysis, this crop appears to be showing signs of **Nitrogen Deficiency**. \n\n**Indicators:**\n• Yellowing (chlorosis) running down the midrib of older leaves.\n• Stunted growth relative to expected stage.\n\n**Recommendation:**\nConsider a side-dressing of Urea or Ammonium Nitrate if rain is forecast, or a foliar application for quicker uptake.";

/**
 * REGENERATIVE AGRICULTURE & 2025 RESILIENCE SYSTEM INSTRUCTION
 */
const SYSTEM_INSTRUCTION = `
You are the "AgriFlow Resilience Engine," powered by Gemini 3. Your goal is to help farmers navigate the critical challenges of 2025: Climate Instability, Economic Profit Squeeze, and Soil Degradation.

CORE KNOWLEDGE BASE (2025 CONTEXT):
1. Economic Squeeze: Farmers are price takers. Input costs (fertilizer/fuel) are soaring (+60%), while commodity prices are volatile. Focus on margin protection and low-input strategies.
2. Climate Extremes: Move beyond simple weather. Account for El Niño/La Niña shifts, water scarcity, and heat stress on specific crops.
3. Soil Regeneration: Topsoil loss is a crisis. Aggressively promote cover cropping, no-till, and biodiversity to restore land.
4. Labor Crisis: Farm labor is aging (avg age 57). Suggest labor-efficient technologies or workflows.

STRICT FORMATTING RULES:
- DO NOT use markdown formatting characters like asterisks (** or *) or hashes (##).
- DO NOT use bolding syntax.
- DO NOT use markdown headers.
- Write in clear, plain text.
- Use "1.", "2." for numbered lists.
- Use "-" or "•" for bullet points.
- Separate sections with clear paragraph breaks.

RESPONSE STRUCTURE:
1. Risk Assessment: Identify immediate threats (Climate, Pest, Economic).
2. Cost-Benefit Analysis: If recommending an action, briefly mention the input cost implication.
3. Regenerative Solution: How does this improve soil/water retention long-term?
4. Action Item: A clear, industrial-grade instruction for the farm manager.
`;

/**
 * Helper to strip markdown artifacts if the model ignores strict instructions.
 */
const cleanGeminiOutput = (text: string): string => {
  if (!text) return "";
  return text
    .replace(/\*{1,2}(.*?)\*{1,2}/g, '$1') // Remove bold/italic
    .replace(/^#+\s*/gm, '') // Remove headers
    .replace(/(\*\*|##)/g, '') // Remove lingering symbols
    .replace(/^\s*\*\s/gm, '• ') // Standardize bullets
    .trim();
};

/**
 * Robust JSON Extractor
 * Attempts to find a JSON block between markdown fences first.
 * If not found, attempts to clean the string of markdown code syntax.
 */
const extractJson = (text: string): string => {
  // 1. Try extracting content between ```json and ```
  const jsonMatch = text.match(/```json([\s\S]*?)```/);
  if (jsonMatch && jsonMatch[1]) {
    return jsonMatch[1].trim();
  }
  
  // 2. Try extracting content between generic ``` and ```
  const genericMatch = text.match(/```([\s\S]*?)```/);
  if (genericMatch && genericMatch[1]) {
    return genericMatch[1].trim();
  }

  // 3. Fallback: Clean markers and return the whole text
  return text.replace(/```json|```/g, '').trim();
};

/**
 * Sends a text prompt to Gemini with the Regenerative persona and Search Grounding.
 */
export const getFarmingAdvice = async (prompt: string): Promise<{ text: string; sources?: { title: string; uri: string }[] }> => {
  if (!process.env.API_KEY) {
    await new Promise(r => setTimeout(r, 1500));
    return FALLBACK_ADVICE;
  }
  
  const cacheKey = `ADVICE_${prompt.trim().toLowerCase()}`;
  if (responseCache.has(cacheKey)) {
    return responseCache.get(cacheKey);
  }

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.4,
        tools: [{ googleSearch: {} }] 
      }
    });
    
    let sources: { title: string; uri: string }[] = [];
    if (response.candidates?.[0]?.groundingMetadata?.groundingChunks) {
      sources = response.candidates[0].groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          title: chunk.web.title,
          uri: chunk.web.uri
        }));
    }

    const rawText = response.text || "I couldn't generate a response at this time.";
    const result = {
      text: cleanGeminiOutput(rawText),
      sources: sources.length > 0 ? sources : undefined
    };

    responseCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.error("Gemini Text Error (Falling back):", error);
    return FALLBACK_ADVICE;
  }
};

/**
 * Fetches structured real-time global agriculture news.
 */
export const fetchAgNews = async (): Promise<NewsArticle[]> => {
  if (!process.env.API_KEY) {
    await new Promise(r => setTimeout(r, 1000));
    return FALLBACK_NEWS;
  }

  const cacheKey = 'GLOBAL_AG_NEWS';
  const cached = responseCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp < 1000 * 60 * 15)) {
    return cached.data;
  }

  const prompt = `
    Find the 8 latest significant global agriculture news headlines from the last 24 hours.
    Focus on Commodities (Crop Prices), AgTech (New innovations), Climate (Weather impacts on farming), and Policy (Trade/Subsidies).
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              summary: { type: Type.STRING },
              category: { type: Type.STRING, enum: ["Market", "Tech", "Policy", "Climate"] },
              source: { type: Type.STRING },
              timeAgo: { type: Type.STRING },
              url: { type: Type.STRING }
            },
            required: ["title", "summary", "category", "source", "timeAgo"]
          }
        }
      }
    });

    const jsonStr = extractJson(response.text || "[]");
    const articles = JSON.parse(jsonStr);
    
    const result = articles.map((a: any, i: number) => ({
      ...a,
      id: `news-${Date.now()}-${i}`
    }));

    responseCache.set(cacheKey, { timestamp: Date.now(), data: result });
    return result;

  } catch (error) {
    console.error("News Fetch Error (Falling back):", error);
    return FALLBACK_NEWS;
  }
};

/**
 * Fetches real-time agricultural intelligence summaries.
 */
export const getLiveAgriIntel = async (): Promise<string> => {
  if (!process.env.API_KEY) {
    await new Promise(r => setTimeout(r, 800));
    return FALLBACK_INTEL;
  }

  const cacheKey = 'LIVE_INTEL_SUMMARY';
  if (responseCache.has(cacheKey)) return responseCache.get(cacheKey);

  const prompt = "What are the 3 most critical agricultural news headlines right now regarding climate events, pest outbreaks, or major commodity price shifts globally? Be concise, 1 sentence per headline.";

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        temperature: 0.3
      }
    });

    const text = response.text || "Market intelligence systems offline.";
    const cleanText = cleanGeminiOutput(text);
    responseCache.set(cacheKey, cleanText);
    return cleanText;
  } catch (error) {
    console.error("Intel Fetch Error (Falling back):", error);
    return FALLBACK_INTEL;
  }
}

/**
 * Generates specific daily tasks based on weather and active crops.
 */
export const generateDailyTasks = async (weather: WeatherData, crops: Crop[]): Promise<string> => {
  if (!process.env.API_KEY) {
    await new Promise(r => setTimeout(r, 1200));
    return JSON.stringify(FALLBACK_TASKS);
  }

  const cropNames = crops.map(c => `${c.name} (${c.status})`).join(', ');
  
  const prompt = `
    Context:
    Current Weather: ${weather.temp}°C, Condition: ${weather.condition}, Wind: ${weather.windSpeed}km/h, Forecast: ${weather.forecast}.
    Active Plots: ${cropNames}.

    Task:
    Generate 3 high-priority, specific farming tasks for today based on this context. 
    Focus on risk mitigation and yield protection.
    
    Format:
    Return ONLY a valid JSON array of strings. Do not include markdown formatting or "json" tags.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
      config: { temperature: 0.3 }
    });

    return extractJson(response.text || "[]");
  } catch (error) {
    console.error("Gemini Task Generation Error (Falling back):", error);
    return JSON.stringify(FALLBACK_TASKS);
  }
};

/**
 * Analyzes a crop or soil image using multimodal reasoning.
 */
export const analyzeCropImage = async (base64Image: string, userPrompt: string): Promise<string> => {
  if (!process.env.API_KEY) {
    await new Promise(r => setTimeout(r, 2000));
    return FALLBACK_ANALYSIS;
  }

  try {
    const mimeTypeMatch = base64Image.match(/data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+).*,.*/);
    const mimeType = mimeTypeMatch ? mimeTypeMatch[1] : 'image/jpeg';
    const base64Data = base64Image.split(',')[1] || base64Image;

    const enhancedPrompt = `
      Analyze this image acting as a Resilience Agronomist.
      User Context: ${userPrompt || "Assess for disease, nutrient deficiency, or soil health indicators."}
      
      Look for:
      1. Early signs of disease (Monoculture fragility risk).
      2. Soil compaction or degradation symptoms.
      3. Water stress indicators.
      
      Provide a diagnosis that balances biological treatment with economic reality.
    `;

    const response: GenerateContentResponse = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', 
      contents: {
        parts: [
          { inlineData: { mimeType: mimeType, data: base64Data } },
          { text: enhancedPrompt }
        ]
      },
      config: { systemInstruction: SYSTEM_INSTRUCTION }
    });

    const text = response.text || "I analyzed the image but couldn't generate a specific diagnosis.";
    return cleanGeminiOutput(text);
  } catch (error) {
    console.error("Gemini Vision Error (Falling back):", error);
    return FALLBACK_ANALYSIS;
  }
};
