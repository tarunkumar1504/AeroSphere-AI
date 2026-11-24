/**
 * AeroSphere AI Domain Models & TypeScript Types
 * WCAG 2.1 AAA Compliant & Clean Architecture
 */

export type SeverityLevel = 'GOOD' | 'MODERATE' | 'UNHEALTHY_SENSITIVE' | 'UNHEALTHY' | 'VERY_UNHEALTHY' | 'HAZARDOUS';
export type InversionRisk = 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
export type VulnerabilityType = 'ASTHMA' | 'COPD' | 'CARDIOVASCULAR' | 'ALLERGIES' | 'PREGNANCY' | 'NONE';
export type LifestyleType = 'COMMUTER' | 'REMOTE_WORKER' | 'STUDENT' | 'OUTDOOR_WORKER' | 'SENIOR';
export type RoomType = 'BEDROOM' | 'LIVING_ROOM' | 'NURSERY' | 'KITCHEN' | 'HOME_OFFICE';

export interface AirQualityMetrics {
  aqi: number;
  pm25: number; // in µg/m³
  pm10: number; // in µg/m³
  no2: number;  // in ppb
  o3: number;   // in ppb
  temperature: number; // in °C
  humidity: number;    // in %
  inversionRisk: InversionRisk;
  category: SeverityLevel;
  dominantPollutant: 'PM2.5' | 'PM10' | 'NO2' | 'O3';
  timestamp: string;
}

export interface HourlyForecast {
  hour: string; // e.g. "06:00"
  aqi: number;
  pm25: number;
  inversionRisk: InversionRisk;
  safeForOutdoor: boolean;
  notes: string;
}

export interface CityLocation {
  id: string;
  name: string;
  region: string;
  country: string;
  currentAirQuality: AirQualityMetrics;
  hourlyForecast: HourlyForecast[];
}

export interface FamilyMember {
  id: string;
  name: string;
  relation: 'SELF' | 'CHILD' | 'ELDER' | 'PARTNER' | 'INFANT';
  age: number;
  vulnerabilities: VulnerabilityType[];
  dailyRoutineType: LifestyleType;
  n95Recommended: boolean;
  maxSafeOutdoorAqi: number;
}

export interface QuantifiedImpact {
  pm25InhaledAvoidedMicrograms: number;
  cigarettesEquivalentAvoided: number;
  co2EmissionsSavedKg: number;
  noxEmissionsSavedGrams: number;
  respiratoryRiskReductionPercent: number;
  cleanAirHoursGained: number;
  explanation: string;
}

export interface RoutineSlot {
  timeWindow: string; // "07:00 - 09:00"
  activity: string;
  isSafeOutdoor: boolean;
  recommendedAlternative: string;
  lowEmissionAction: string;
  inversionFactor: string;
  hourlyAqi: number;
}

export interface DailyRoutinePlan {
  id: string;
  targetDate: string;
  cityId: string;
  cityName: string;
  lifestyle: LifestyleType;
  overallRiskLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL';
  summary: string;
  slots: RoutineSlot[];
  impact: QuantifiedImpact;
  generatedByAi: boolean;
  createdAt: string;
}

export interface DiyIaqSolution {
  title: string;
  tagline: string;
  estimatedCostUsd: number;
  pmReductionPercent: number;
  cadrRatingM3h: number;
  materialsNeeded: string[];
  stepByStepGuide: string[];
}

export interface RoomIaqAssessment {
  room: RoomType;
  roomName: string;
  estimatedIndoorPm25: number;
  hazardLevel: SeverityLevel;
  purifierRecommendation: {
    status: 'OFF' | 'LOW' | 'MEDIUM' | 'TURBO';
    minCadrM3h: number;
    recommendedSchedule: string;
  };
  ventilationPlan: {
    naturalVentilationWindow: string;
    sealDraftsUrgency: 'LOW' | 'MEDIUM' | 'CRITICAL';
    exhaustFanNotes: string;
  };
  actionChecklist: string[];
}

export interface CommunityAlert {
  id: string;
  authorName: string;
  neighborhood: string;
  type: 'OPEN_BURNING_REPORT' | 'CARPOOL_OFFER' | 'CLEAN_AIR_SHELTER' | 'ECO_HEATING_PLEDGE' | 'AIR_ADVISORY';
  title: string;
  description: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  status: 'ACTIVE' | 'VERIFIED' | 'RESOLVED';
  upvotes: number;
  createdAt: string;
}

export interface SecurityAuditEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ipAddress?: string;
}

export interface VoiceAssistantResponse {
  replyText: string;
  recommendedActions: string[];
  urgencyLevel: 'LOW' | 'MODERATE' | 'HIGH' | 'EMERGENCY';
  impactSummary: string;
}
