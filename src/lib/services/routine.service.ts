import { DailyRoutinePlan, FamilyMember, LifestyleType, RoutineSlot } from '../types';
import { AirQualityService } from './air-quality.service';
import { ImpactService } from './impact.service';
import { dbService } from '../db/database';

export interface RoutineGeneratorInput {
  cityId: string;
  lifestyle: LifestyleType;
  familyMembers?: FamilyMember[];
  userPreferences?: {
    hasAirPurifier: boolean;
    canWorkFromHome: boolean;
    commuteMode: 'CAR' | 'METRO' | 'BUS' | 'BIKE' | 'WALK';
  };
}

export class RoutineService {
  public static generatePlan(input: RoutineGeneratorInput): DailyRoutinePlan {
    const { cityId, lifestyle, familyMembers = [], userPreferences } = input;
    const city = AirQualityService.getCityById(cityId) || AirQualityService.getAllCities()[0];
    const forecast = city.hourlyForecast;
    const currentAqi = city.currentAirQuality.aqi;

    // Check for vulnerable members
    const hasVulnerable = familyMembers.some((m) =>
      m.vulnerabilities.some((v) => v !== 'NONE')
    );

    const slots: RoutineSlot[] = [];

    // Slot 1: Early Morning (06:00 - 08:30) - Peak Winter Inversion Window
    const morningAqi = forecast.find((f) => f.hour === '06:00' || f.hour === '07:00')?.aqi || (currentAqi + 25);
    slots.push({
      timeWindow: '06:00 - 08:30',
      activity: lifestyle === 'STUDENT' ? 'School preparation & morning commute' : 'Morning exercise / early commute',
      isSafeOutdoor: morningAqi <= 100 && !hasVulnerable,
      recommendedAlternative: morningAqi > 100
        ? 'STRICTLY INDOORS: Reschedule outdoor jogging to yoga/calisthenics indoors. Keep windows sealed with foam weatherstripping.'
        : 'Brief outdoor stroll permissible with light layers.',
      lowEmissionAction: userPreferences?.commuteMode === 'CAR'
        ? 'Switch from solo personal car to electric transit or carpool; cuts 2.4kg of cold-start CO2'
        : 'Zero vehicle emissions. Avoid idling vehicle engines.',
      inversionFactor: 'Critical ground-level radiation inversion traps toxic particulate matter within 150m of surface.',
      hourlyAqi: morningAqi,
    });

    // Slot 2: Midday Sunlight & Solar Mixing Window (11:30 - 14:30)
    const middayAqi = forecast.find((f) => f.hour === '12:00' || f.hour === '13:00')?.aqi || Math.max(80, currentAqi - 120);
    slots.push({
      timeWindow: '11:30 - 14:30',
      activity: 'Lunch, errands, and dwelling air exchange',
      isSafeOutdoor: middayAqi < 250,
      recommendedAlternative: middayAqi < 250
        ? 'SAFEST DAILY WINDOW: Perform necessary outdoor errands, doctor visits, or quick grocery runs now.'
        : 'Limit outdoor exposure; wear N95 mask if outdoors longer than 15 minutes.',
      lowEmissionAction: 'Open cross-ventilation windows for 10 minutes to purge indoor CO2 while outdoor PM2.5 is at daily nadir.',
      inversionFactor: 'Solar thermal convection breaks inversion cap, providing temporary dispersion relief.',
      hourlyAqi: middayAqi,
    });

    // Slot 3: Evening Commute & Smog Re-capping (17:30 - 20:00)
    const eveningAqi = forecast.find((f) => f.hour === '18:00' || f.hour === '20:00')?.aqi || (currentAqi + 10);
    slots.push({
      timeWindow: '17:30 - 20:00',
      activity: 'Evening commute and dinner cooking',
      isSafeOutdoor: false,
      recommendedAlternative: 'Commute with closed vehicle windows with AC set to internal recirculation. Avoid street food near heavy traffic intersections.',
      lowEmissionAction: 'Use electric induction or covered pans with range hood on high to eliminate indoor cooking VOCs/NO2.',
      inversionFactor: 'Rapid surface radiative cooling resets temperature inversion, trapping evening rush hour emissions.',
      hourlyAqi: eveningAqi,
    });

    // Slot 4: Night-time Rest & Clean Air Sanctuary (21:00 - 06:00)
    const nightAqi = forecast.find((f) => f.hour === '21:00')?.aqi || (currentAqi + 30);
    slots.push({
      timeWindow: '21:00 - 06:00',
      activity: 'Sleeping & overnight recovery',
      isSafeOutdoor: false,
      recommendedAlternative: 'Activate bedroom HEPA purifier or Corsi-Rosenthal box on medium/low mode. Seal door gaps with draft stoppers.',
      lowEmissionAction: 'Avoid wood fireplaces or kerosene space heaters. Use ceramic electric or radiant water heating.',
      inversionFactor: 'Maximum atmospheric stagnation; particulates settle overnight in valley basements and lower floors.',
      hourlyAqi: nightAqi,
    });

    // Quantified impact calculation
    const impact = ImpactService.calculate({
      outdoorPm25: city.currentAirQuality.pm25,
      hoursIndoorsWithPurifier: userPreferences?.hasAirPurifier ? 14 : 6,
      commuteShift: userPreferences?.canWorkFromHome
        ? 'AVOIDED_COMMUTE_WFH'
        : userPreferences?.commuteMode === 'METRO'
        ? 'CAR_TO_METRO'
        : 'SOLO_CAR_TO_CARPOOL',
      usedRangeHood: true,
      avoidedBiomassBurning: true,
    });

    let overallRisk: 'LOW' | 'MODERATE' | 'HIGH' | 'CRITICAL' = 'MODERATE';
    if (currentAqi > 300) overallRisk = 'CRITICAL';
    else if (currentAqi > 200) overallRisk = 'HIGH';
    else if (currentAqi <= 100) overallRisk = 'LOW';

    const plan: DailyRoutinePlan = {
      id: `plan-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      targetDate: new Date().toISOString().slice(0, 10),
      cityId: city.id,
      cityName: city.name,
      lifestyle,
      overallRiskLevel: overallRisk,
      summary: `Tailored low-emission routine for ${city.name} during severe winter inversion. Shifts physical exertion and ventilation to the 11:30-14:30 solar window while safeguarding vulnerable family members during morning and night smog spikes.`,
      slots,
      impact,
      generatedByAi: false,
      createdAt: new Date().toISOString(),
    };

    // Save plan to persistent store
    const db = dbService.getDb();
    db.routinePlans.unshift(plan);
    if (db.routinePlans.length > 50) db.routinePlans = db.routinePlans.slice(0, 50);
    dbService.save();

    return plan;
  }
}
