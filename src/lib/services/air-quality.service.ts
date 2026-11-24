import { AirQualityMetrics, CityLocation, InversionRisk, SeverityLevel } from '../types';
import { dbService } from '../db/database';

export class AirQualityService {
  /**
   * Breakpoint-based EPA AQI calculation from PM2.5 (µg/m³)
   */
  public static calculatePm25Aqi(pm25: number): number {
    const breakpoints = [
      { cLow: 0.0, cHigh: 12.0, iLow: 0, iHigh: 50 },
      { cLow: 12.1, cHigh: 35.4, iLow: 51, iHigh: 100 },
      { cLow: 35.5, cHigh: 55.4, iLow: 101, iHigh: 150 },
      { cLow: 55.5, cHigh: 150.4, iLow: 151, iHigh: 200 },
      { cLow: 150.5, cHigh: 250.4, iLow: 201, iHigh: 300 },
      { cLow: 250.5, cHigh: 350.4, iLow: 301, iHigh: 400 },
      { cLow: 350.5, cHigh: 500.4, iLow: 401, iHigh: 500 },
    ];

    for (const bp of breakpoints) {
      if (pm25 >= bp.cLow && pm25 <= bp.cHigh) {
        return Math.round(
          ((bp.iHigh - bp.iLow) / (bp.cHigh - bp.cLow)) * (pm25 - bp.cLow) + bp.iLow
        );
      }
    }
    if (pm25 > 500.4) return 500;
    return 0;
  }

  public static getSeverityCategory(aqi: number): SeverityLevel {
    if (aqi <= 50) return 'GOOD';
    if (aqi <= 100) return 'MODERATE';
    if (aqi <= 150) return 'UNHEALTHY_SENSITIVE';
    if (aqi <= 200) return 'UNHEALTHY';
    if (aqi <= 300) return 'VERY_UNHEALTHY';
    return 'HAZARDOUS';
  }

  /**
   * Evaluates winter temperature inversion risk
   * Inversion traps particulate matter in the shallow atmospheric boundary layer (100-300m)
   * Peak hazard occurs at night and early morning when ground radiation cools rapidly
   */
  public static calculateInversionRisk(hour: number, temperature: number, humidity: number): InversionRisk {
    // Night and early morning (22:00 - 08:00) with low temperatures & high humidity represent highest risk
    const isPeakInversionHours = hour >= 22 || hour <= 8;
    const isCold = temperature <= 15;
    const isStagnantHumid = humidity >= 65;

    if (isPeakInversionHours && isCold && isStagnantHumid) {
      return 'CRITICAL';
    }
    if (isPeakInversionHours || (isCold && isStagnantHumid)) {
      return 'HIGH';
    }
    if (hour >= 11 && hour <= 16) {
      return 'MODERATE'; // Midday solar heating breaks inversion layer
    }
    return 'LOW';
  }

  public static getAllCities(): CityLocation[] {
    return dbService.getDb().cities;
  }

  public static getCityById(cityId: string): CityLocation | null {
    const city = dbService.getDb().cities.find((c) => c.id === cityId);
    return city || null;
  }

  public static getRealtimeAssessment(cityId: string): {
    city: CityLocation;
    currentMetrics: AirQualityMetrics;
    safeVentilationHour: string;
    vulnerableShieldAdvice: string;
  } {
    const city = this.getCityById(cityId) || dbService.getDb().cities[0];
    const metrics = city.currentAirQuality;

    let safeVentilationHour = '12:00 PM - 02:30 PM';
    if (metrics.aqi > 300) {
      safeVentilationHour = 'Windows must remain sealed; rely strictly on HEPA/Corsi-Rosenthal recirculated air';
    }

    let vulnerableAdvice = 'Outdoor activity safe with routine caution.';
    if (metrics.aqi > 200) {
      vulnerableAdvice = 'URGENT: Asthmatics, seniors, and children must stay indoors. If outdoors is unavoidable, an airtight N95 respirator is strictly required.';
    } else if (metrics.aqi > 100) {
      vulnerableAdvice = 'Sensitive individuals should limit prolonged outdoor exertion.';
    }

    return {
      city,
      currentMetrics: metrics,
      safeVentilationHour,
      vulnerableShieldAdvice: vulnerableAdvice,
    };
  }
}
