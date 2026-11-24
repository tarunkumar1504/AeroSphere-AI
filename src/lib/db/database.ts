import fs from 'fs';
import path from 'path';
import os from 'os';
import {
  CityLocation,
  FamilyMember,
  DailyRoutinePlan,
  CommunityAlert,
  SecurityAuditEntry,
} from '../types';

export interface DatabaseSchema {
  cities: CityLocation[];
  familyMembers: FamilyMember[];
  routinePlans: DailyRoutinePlan[];
  communityAlerts: CommunityAlert[];
  auditLogs: SecurityAuditEntry[];
}

const DEFAULT_DATA_DIR = process.env.AEROSPHERE_DATA_DIR || path.join(process.cwd(), 'data');

export class DatabaseService {
  private static instance: DatabaseService;
  private cache: DatabaseSchema | null = null;
  private dbFilePath: string;

  private constructor() {
    this.dbFilePath = this.resolvePath();
    this.ensureInitialized();
  }

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  private resolvePath(): string {
    if (process.env.VERCEL) {
      const tmpDir = path.join(os.tmpdir(), 'aerosphere_data');
      if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
      return path.join(tmpDir, 'aerosphere_store.json');
    }
    const dataDir = process.env.AEROSPHERE_DATA_DIR || DEFAULT_DATA_DIR;
    if (!fs.existsSync(/*turbopackIgnore: true*/ dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Fallback to os tmpdir
        const tmpDir = path.join(os.tmpdir(), 'aerosphere_data');
        if (!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir, { recursive: true });
        return path.join(tmpDir, 'aerosphere_store.json');
      }
    }
    return path.join(dataDir, 'aerosphere_store.json');
  }

  public createSeedData(): DatabaseSchema {
    return {
      cities: [
        {
          id: 'delhi-anand-vihar',
          name: 'Delhi - Anand Vihar',
          region: 'NCR',
          country: 'India',
          currentAirQuality: {
            aqi: 382,
            pm25: 236.4,
            pm10: 388.1,
            no2: 84.2,
            o3: 21.0,
            temperature: 14.5,
            humidity: 78,
            inversionRisk: 'CRITICAL',
            category: 'HAZARDOUS',
            dominantPollutant: 'PM2.5',
            timestamp: new Date().toISOString(),
          },
          hourlyForecast: [
            { hour: '05:00', aqi: 410, pm25: 265, inversionRisk: 'CRITICAL', safeForOutdoor: false, notes: 'Peak ground-level thermal inversion; stagnant hazardous air' },
            { hour: '07:00', aqi: 395, pm25: 248, inversionRisk: 'CRITICAL', safeForOutdoor: false, notes: 'Morning commute rush mixing with trapped cold air' },
            { hour: '09:00', aqi: 360, pm25: 215, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Sun rises; slow dissipation begins' },
            { hour: '12:00', aqi: 240, pm25: 145, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Midday thermal mixing window; best time for brief outdoor ventilation' },
            { hour: '15:00', aqi: 220, pm25: 130, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Maximum solar dispersion; safest window for errands' },
            { hour: '18:00', aqi: 310, pm25: 185, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Evening temperature inversion sets in; cool layer traps new vehicle emissions' },
            { hour: '21:00', aqi: 375, pm25: 230, inversionRisk: 'CRITICAL', safeForOutdoor: false, notes: 'Heavy night inversion; close all windows and activate air purifiers' },
          ],
        },
        {
          id: 'lahore-gulberg',
          name: 'Lahore - Gulberg',
          region: 'Punjab',
          country: 'Pakistan',
          currentAirQuality: {
            aqi: 345,
            pm25: 210.8,
            pm10: 340.0,
            no2: 76.5,
            o3: 18.2,
            temperature: 15.0,
            humidity: 82,
            inversionRisk: 'CRITICAL',
            category: 'HAZARDOUS',
            dominantPollutant: 'PM2.5',
            timestamp: new Date().toISOString(),
          },
          hourlyForecast: [
            { hour: '06:00', aqi: 370, pm25: 235, inversionRisk: 'CRITICAL', safeForOutdoor: false, notes: 'Dense winter smog blanket' },
            { hour: '12:00', aqi: 215, pm25: 125, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Midday dispersion break' },
            { hour: '18:00', aqi: 320, pm25: 190, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Rapid evening cooling and inversion cap' },
          ],
        },
        {
          id: 'salt-lake-city-downtown',
          name: 'Salt Lake City - Downtown',
          region: 'Utah',
          country: 'USA',
          currentAirQuality: {
            aqi: 158,
            pm25: 68.5,
            pm10: 95.0,
            no2: 42.0,
            o3: 31.0,
            temperature: -2.0,
            humidity: 65,
            inversionRisk: 'HIGH',
            category: 'UNHEALTHY',
            dominantPollutant: 'PM2.5',
            timestamp: new Date().toISOString(),
          },
          hourlyForecast: [
            { hour: '08:00', aqi: 170, pm25: 75, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Wasatch valley bowl inversion trapping wood smoke and vehicle exhaust' },
            { hour: '13:00', aqi: 130, pm25: 52, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Weak breeze provides partial relief' },
            { hour: '20:00', aqi: 165, pm25: 72, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Cold night air pools on valley floor' },
          ],
        },
        {
          id: 'beijing-chaoyang',
          name: 'Beijing - Chaoyang',
          region: 'Beijing',
          country: 'China',
          currentAirQuality: {
            aqi: 188,
            pm25: 92.4,
            pm10: 160.0,
            no2: 55.0,
            o3: 25.0,
            temperature: 1.0,
            humidity: 50,
            inversionRisk: 'HIGH',
            category: 'UNHEALTHY',
            dominantPollutant: 'PM2.5',
            timestamp: new Date().toISOString(),
          },
          hourlyForecast: [
            { hour: '07:00', aqi: 195, pm25: 98, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Winter heating season inversion' },
            { hour: '14:00', aqi: 140, pm25: 60, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Northerly gust improves visibility' },
            { hour: '21:00', aqi: 185, pm25: 90, inversionRisk: 'HIGH', safeForOutdoor: false, notes: 'Inversion returns overnight' },
          ],
        },
        {
          id: 'london-marylebone',
          name: 'London - Marylebone',
          region: 'Greater London',
          country: 'UK',
          currentAirQuality: {
            aqi: 85,
            pm25: 28.2,
            pm10: 45.0,
            no2: 48.0,
            o3: 20.0,
            temperature: 6.0,
            humidity: 85,
            inversionRisk: 'LOW',
            category: 'MODERATE',
            dominantPollutant: 'NO2',
            timestamp: new Date().toISOString(),
          },
          hourlyForecast: [
            { hour: '08:00', aqi: 105, pm25: 35, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Urban street canyon NO2 buildup during peak commute' },
            { hour: '13:00', aqi: 65, pm25: 20, inversionRisk: 'LOW', safeForOutdoor: true, notes: 'Breezy conditions clear roadside pollutants' },
            { hour: '18:00', aqi: 95, pm25: 31, inversionRisk: 'MODERATE', safeForOutdoor: true, notes: 'Evening diesel and heating exhaust' },
          ],
        },
      ],
      familyMembers: [
        {
          id: 'fam-1',
          name: 'Alex (Self)',
          relation: 'SELF',
          age: 34,
          vulnerabilities: ['NONE'],
          dailyRoutineType: 'COMMUTER',
          n95Recommended: true,
          maxSafeOutdoorAqi: 150,
        },
        {
          id: 'fam-2',
          name: 'Aria (Daughter)',
          relation: 'CHILD',
          age: 6,
          vulnerabilities: ['ASTHMA', 'ALLERGIES'],
          dailyRoutineType: 'STUDENT',
          n95Recommended: true,
          maxSafeOutdoorAqi: 80,
        },
        {
          id: 'fam-3',
          name: 'Grandmother Elena',
          relation: 'ELDER',
          age: 72,
          vulnerabilities: ['COPD', 'CARDIOVASCULAR'],
          dailyRoutineType: 'SENIOR',
          n95Recommended: true,
          maxSafeOutdoorAqi: 60,
        },
      ],
      routinePlans: [],
      communityAlerts: [
        {
          id: 'comm-1',
          authorName: 'Rohan Sharma',
          neighborhood: 'Sector 14 Green Park',
          type: 'OPEN_BURNING_REPORT',
          title: 'Illegal leaf & trash burning reported near community boundary',
          description: 'Noticed smoke billowing near boundary gate. Municipal ward contacted. Residents advised to keep windows sealed for the next 3 hours.',
          severity: 'WARNING',
          status: 'ACTIVE',
          upvotes: 24,
          createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'comm-2',
          authorName: 'Priya Mehta',
          neighborhood: 'Vasant Vihar',
          type: 'CARPOOL_OFFER',
          title: 'Electric Carpool: 3 seats available to Connaught Place',
          description: 'EV Carpool departing 09:15 AM to reduce peak rush emissions. Route passes Metro Station Line 2. Clean HEPA filter running in cabin.',
          severity: 'INFO',
          status: 'ACTIVE',
          upvotes: 18,
          createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
        },
        {
          id: 'comm-3',
          authorName: 'City Air Watch',
          neighborhood: 'Anand Vihar Hub',
          type: 'CLEAN_AIR_SHELTER',
          title: 'Public Clean Air Haven at District Library open with HEPA filtration',
          description: 'Air-conditioned hall with triple HEPA filtration open to seniors, children, and vulnerable citizens during peak morning smog hours (06:00 - 11:00 AM).',
          severity: 'INFO',
          status: 'VERIFIED',
          upvotes: 42,
          createdAt: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
      ],
      auditLogs: [
        {
          id: 'audit-init',
          timestamp: new Date().toISOString(),
          actor: 'SYSTEM',
          action: 'SYSTEM_BOOTSTRAP',
          details: 'AeroSphere AI database initialized with verified multi-city air quality profiles and WCAG 2.1 AAA protocols.',
        },
      ],
    };
  }

  private ensureInitialized(): void {
    if (!fs.existsSync(this.dbFilePath)) {
      const initialData = this.createSeedData();
      this.writeToDisk(initialData);
      this.cache = initialData;
    }
  }

  private readFromDisk(): DatabaseSchema {
    try {
      const raw = fs.readFileSync(this.dbFilePath, 'utf-8');
      return JSON.parse(raw) as DatabaseSchema;
    } catch {
      const fallback = this.createSeedData();
      this.writeToDisk(fallback);
      return fallback;
    }
  }

  private writeToDisk(data: DatabaseSchema): void {
    const tempPath = `${this.dbFilePath}.${Date.now()}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(data, null, 2), 'utf-8');
    fs.renameSync(tempPath, this.dbFilePath);
  }

  public getDb(): DatabaseSchema {
    if (!this.cache) {
      this.cache = this.readFromDisk();
    }
    return this.cache;
  }

  public save(): void {
    if (this.cache) {
      this.writeToDisk(this.cache);
    }
  }

  public logAudit(actor: string, action: string, details: string, ipAddress?: string): void {
    const db = this.getDb();
    const entry: SecurityAuditEntry = {
      id: `audit-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      ipAddress,
    };
    db.auditLogs.unshift(entry);
    // Keep last 500 logs
    if (db.auditLogs.length > 500) {
      db.auditLogs = db.auditLogs.slice(0, 500);
    }
    this.save();
  }
}

export const dbService = DatabaseService.getInstance();
