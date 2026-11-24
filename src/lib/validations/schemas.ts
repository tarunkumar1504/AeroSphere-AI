import { z } from 'zod';

export const LocationQuerySchema = z.object({
  cityId: z.string().min(1).max(100),
});

export const FamilyMemberSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  relation: z.enum(['SELF', 'CHILD', 'ELDER', 'PARTNER', 'INFANT']),
  age: z.number().int().min(0).max(120),
  vulnerabilities: z.array(z.enum(['ASTHMA', 'COPD', 'CARDIOVASCULAR', 'ALLERGIES', 'PREGNANCY', 'NONE'])).min(1),
  dailyRoutineType: z.enum(['COMMUTER', 'REMOTE_WORKER', 'STUDENT', 'OUTDOOR_WORKER', 'SENIOR']),
  n95Recommended: z.boolean().default(false),
  maxSafeOutdoorAqi: z.number().int().min(20).max(500).default(100),
});

export const GenerateRoutineSchema = z.object({
  cityId: z.string().min(1).max(50),
  lifestyle: z.enum(['COMMUTER', 'REMOTE_WORKER', 'STUDENT', 'OUTDOOR_WORKER', 'SENIOR']),
  familyMembers: z.array(FamilyMemberSchema).optional().default([]),
  userPreferences: z.object({
    hasAirPurifier: z.boolean().default(true),
    canWorkFromHome: z.boolean().default(false),
    commuteMode: z.enum(['CAR', 'METRO', 'BUS', 'BIKE', 'WALK']).default('METRO'),
  }).optional(),
});

export const IaqAssessmentSchema = z.object({
  roomType: z.enum(['BEDROOM', 'LIVING_ROOM', 'NURSERY', 'KITCHEN', 'HOME_OFFICE']),
  roomAreaSqFt: z.number().min(50).max(2000).default(200),
  outdoorAqi: z.number().min(0).max(999),
  hasPurifier: z.boolean().default(false),
  purifierCadr: z.number().min(0).max(2000).default(0),
  windowStatus: z.enum(['SEALED', 'WEATHERSTRIPPED', 'SINGLE_PANE_DRAFTY']).default('WEATHERSTRIPPED'),
  cookingType: z.enum(['ELECTRIC_INDUCTION', 'NATURAL_GAS', 'LPG', 'BIOMASS_KEROSENE']).default('NATURAL_GAS'),
});

export const ImpactCalculateSchema = z.object({
  outdoorAqi: z.number().min(0).max(999),
  hoursSpentIndoorsWithFilter: z.number().min(0).max(24),
  commuteModeShifted: z.enum(['CAR_TO_METRO', 'SOLO_CAR_TO_CARPOOL', 'CAR_TO_CYCLE_INDOOR', 'AVOIDED_COMMUTE_WFH', 'NONE']),
  cookingFumeExhaustUsed: z.boolean(),
  woodBurningAvoided: z.boolean(),
});

export const CommunityAlertSchema = z.object({
  authorName: z.string().min(2).max(60),
  neighborhood: z.string().min(2).max(100),
  type: z.enum(['OPEN_BURNING_REPORT', 'CARPOOL_OFFER', 'CLEAN_AIR_SHELTER', 'ECO_HEATING_PLEDGE', 'AIR_ADVISORY']),
  title: z.string().min(5).max(120),
  description: z.string().min(10).max(800),
  severity: z.enum(['INFO', 'WARNING', 'CRITICAL']),
});

export const VoiceCompanionSchema = z.object({
  queryText: z.string().min(1).max(1000),
  locationCity: z.string().max(100).optional().default('Delhi - Anand Vihar'),
  currentAqi: z.number().optional().default(280),
  vulnerableMemberTypes: z.array(z.string()).optional().default([]),
});
