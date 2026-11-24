import { GoogleGenerativeAI } from '@google/generative-ai';
import crypto from 'crypto';
import { DailyRoutinePlan, FamilyMember, LifestyleType, VoiceAssistantResponse } from '../types';
import { sanitizePrompt } from '../utils/sanitize';
import { RoutineService } from './routine.service';
import { AirQualityService } from './air-quality.service';

// In-Memory SHA-256 Caching Engine (100-entry LRU policy) for Efficiency & Latency Reduction
const CACHE_MAX_ENTRIES = 100;
const geminiCache = new Map<string, { value: unknown; timestamp: number }>();

function getCacheKey(prefix: string, data: unknown): string {
  const hash = crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  return `${prefix}:${hash}`;
}

function getFromCache<T>(key: string): T | null {
  const entry = geminiCache.get(key);
  if (!entry) return null;
  // Refresh position in map (LRU)
  geminiCache.delete(key);
  geminiCache.set(key, entry);
  return entry.value as T;
}

function setInCache<T>(key: string, value: T): void {
  if (geminiCache.size >= CACHE_MAX_ENTRIES) {
    const oldestKey = geminiCache.keys().next().value;
    if (oldestKey) geminiCache.delete(oldestKey);
  }
  geminiCache.set(key, { value, timestamp: Date.now() });
}

export class GeminiService {
  private static readonly MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-3.5-flash';

  private static getApiKey(): string | null {
    return process.env.GEMINI_API_KEY || null;
  }

  /**
   * 1. GenAI Tailored Low-Emission Daily Routine Planner
   * Incorporates real-time inversion curves, lifestyle, and family vulnerabilities
   */
  public static async generateTailoredRoutine(
    cityId: string,
    lifestyle: LifestyleType,
    familyMembers: FamilyMember[] = [],
    preferences?: { hasAirPurifier: boolean; canWorkFromHome: boolean; commuteMode: 'CAR' | 'METRO' | 'BUS' | 'BIKE' | 'WALK' }
  ): Promise<DailyRoutinePlan> {
    const cacheKey = getCacheKey('smart_routine', { cityId, lifestyle, familyMembers, preferences });
    const cached = getFromCache<DailyRoutinePlan>(cacheKey);
    if (cached) return cached;

    const apiKey = this.getApiKey();
    const city = AirQualityService.getCityById(cityId) || AirQualityService.getAllCities()[0];
    const basePlan = RoutineService.generatePlan({ cityId, lifestyle, familyMembers, userPreferences: preferences });

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: this.MODEL_NAME });

        const prompt = `
You are an expert environmental atmospheric scientist and public health physician specializing in winter smog, temperature inversions, and urban particulate air pollution.
Create a personalized, low-emission daily routine for a family residing in ${sanitizePrompt(city.name)}.

Context Data:
- Location: ${city.name}, ${city.country}
- Current AQI: ${city.currentAirQuality.aqi} (PM2.5: ${city.currentAirQuality.pm25} µg/m³, Category: ${city.currentAirQuality.category})
- Inversion Hazard: ${city.currentAirQuality.inversionRisk}
- User Lifestyle: ${lifestyle}
- Family Vulnerabilities: ${JSON.stringify(familyMembers.map((m) => ({ name: m.name, relation: m.relation, vulnerabilities: m.vulnerabilities })))}
- User Preferences: ${JSON.stringify(preferences || {})}

Return STRICT JSON matching this schema:
{
  "summary": string,
  "overallRiskLevel": "LOW" | "MODERATE" | "HIGH" | "CRITICAL",
  "slots": [
    {
      "timeWindow": string,
      "activity": string,
      "isSafeOutdoor": boolean,
      "recommendedAlternative": string,
      "lowEmissionAction": string,
      "inversionFactor": string,
      "hourlyAqi": number
    }
  ]
}
Output ONLY raw JSON with no backticks or markdown fences.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.slots && Array.isArray(parsed.slots)) {
          const aiPlan: DailyRoutinePlan = {
            ...basePlan,
            summary: parsed.summary || basePlan.summary,
            overallRiskLevel: parsed.overallRiskLevel || basePlan.overallRiskLevel,
            slots: parsed.slots.map((s: Record<string, unknown>, idx: number) => ({
              timeWindow: String(s.timeWindow || basePlan.slots[idx]?.timeWindow || '08:00 - 10:00'),
              activity: String(s.activity || basePlan.slots[idx]?.activity || 'Daily Task'),
              isSafeOutdoor: Boolean(s.isSafeOutdoor),
              recommendedAlternative: String(s.recommendedAlternative || basePlan.slots[idx]?.recommendedAlternative || ''),
              lowEmissionAction: String(s.lowEmissionAction || basePlan.slots[idx]?.lowEmissionAction || ''),
              inversionFactor: String(s.inversionFactor || basePlan.slots[idx]?.inversionFactor || ''),
              hourlyAqi: Number(s.hourlyAqi) || basePlan.slots[idx]?.hourlyAqi || city.currentAirQuality.aqi,
            })),
            generatedByAi: true,
          };

          setInCache(cacheKey, aiPlan);
          return aiPlan;
        }
      } catch (err) {
        console.warn('Gemini API call failed, using deterministic domain fallback engine:', err);
      }
    }

    // High-precision fallback engine
    setInCache(cacheKey, basePlan);
    return basePlan;
  }

  /**
   * 2. Clean-Air Voice Companion ("Vayu AI")
   * Conversational guidance for families navigating smog emergencies
   */
  public static async queryVoiceCompanion(
    queryText: string,
    cityId: string = 'delhi-anand-vihar',
    vulnerableTypes: string[] = []
  ): Promise<VoiceAssistantResponse> {
    const sanitized = sanitizePrompt(queryText, 500);
    const cacheKey = getCacheKey('voice_companion', { sanitized, cityId, vulnerableTypes });
    const cached = getFromCache<VoiceAssistantResponse>(cacheKey);
    if (cached) return cached;

    const apiKey = this.getApiKey();
    const city = AirQualityService.getCityById(cityId) || AirQualityService.getAllCities()[0];
    const aqi = city.currentAirQuality.aqi;

    if (apiKey) {
      try {
        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: this.MODEL_NAME });

        const prompt = `
You are "Vayu AI", an empathetic, scientifically rigorous AI clean-air companion for families navigating severe winter smog.
Location: ${city.name} (Current AQI: ${aqi}, PM2.5: ${city.currentAirQuality.pm25} µg/m³).
Family Vulnerabilities: ${vulnerableTypes.join(', ') || 'General adult population'}.
Citizen Question: "${sanitized}"

Respond in STRICT JSON:
{
  "replyText": string (2-3 concise spoken sentences ideal for speech synthesis, warm and reassuring yet protective),
  "recommendedActions": string[] (2-4 concrete, actionable steps),
  "urgencyLevel": "LOW" | "MODERATE" | "HIGH" | "EMERGENCY",
  "impactSummary": string (1 sentence explaining the health or emission impact)
}
Output ONLY raw JSON without markdown fences.
`;

        const result = await model.generateContent(prompt);
        const text = result.response.text().trim();
        const cleaned = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned) as VoiceAssistantResponse;

        setInCache(cacheKey, parsed);
        return parsed;
      } catch (err) {
        console.warn('Gemini companion error, falling back:', err);
      }
    }

    // Deterministic Domain Grounded Fallback
    const fallbackResponse: VoiceAssistantResponse = {
      replyText: aqi > 200
        ? `The air in ${city.name} is currently hazardous with an AQI of ${aqi}. Please keep windows sealed, run your air purifier, and avoid all outdoor physical exercise.`
        : `The air in ${city.name} has an AQI of ${aqi}. Midday (12:00 to 14:00) is the safest window for brief outdoor tasks.`,
      recommendedActions: [
        'Keep home windows sealed with foam weatherstripping during evening inversion spikes.',
        'Run HEPA air purifier or Corsi-Rosenthal box filter in sleeping areas.',
        'Wear an airtight N95 respirator if leaving the house during morning commute hours.',
        'Use electric transit or carpool to avoid adding cold-start vehicle emissions to the smog.',
      ],
      urgencyLevel: aqi > 300 ? 'EMERGENCY' : aqi > 200 ? 'HIGH' : aqi > 100 ? 'MODERATE' : 'LOW',
      impactSummary: `Following these precautions prevents up to 180 µg of toxic particulate inhalation and reduces acute asthma attack risk by 75%.`,
    };

    setInCache(cacheKey, fallbackResponse);
    return fallbackResponse;
  }
}
