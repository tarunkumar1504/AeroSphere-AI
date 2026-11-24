import { describe, it, expect } from 'vitest';
import { RoutineService } from '../services/routine.service';

describe('RoutineService & Low-Emission Daily Routines', () => {
  it('generates low-emission schedule adapted to winter temperature inversions', () => {
    const plan = RoutineService.generatePlan({
      cityId: 'delhi-anand-vihar',
      lifestyle: 'COMMUTER',
      userPreferences: {
        hasAirPurifier: true,
        canWorkFromHome: false,
        commuteMode: 'METRO',
      },
    });

    expect(plan.slots.length).toBe(4);
    // Morning slot should flag hazardous outdoor conditions during peak inversion
    const morningSlot = plan.slots[0];
    expect(morningSlot.isSafeOutdoor).toBe(false);
    expect(morningSlot.recommendedAlternative).toContain('STRICTLY INDOORS');

    // Midday slot should leverage the solar mixing window
    const middaySlot = plan.slots[1];
    expect(middaySlot.recommendedAlternative).toContain('SAFEST DAILY WINDOW');

    // Impact should be quantified
    expect(plan.impact.pm25InhaledAvoidedMicrograms).toBeGreaterThan(0);
    expect(plan.impact.co2EmissionsSavedKg).toBeGreaterThan(0);
  });

  it('protects vulnerable family members by prioritizing strict indoor protocols', () => {
    const plan = RoutineService.generatePlan({
      cityId: 'lahore-gulberg',
      lifestyle: 'STUDENT',
      familyMembers: [
        {
          id: 'child-1',
          name: 'Samir',
          relation: 'CHILD',
          age: 8,
          vulnerabilities: ['ASTHMA'],
          dailyRoutineType: 'STUDENT',
          n95Recommended: true,
          maxSafeOutdoorAqi: 80,
        },
      ],
    });

    expect(plan.slots[0].isSafeOutdoor).toBe(false);
    expect(plan.slots[0].recommendedAlternative).toContain('STRICTLY INDOORS');
  });
});
