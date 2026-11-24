import { describe, it, expect } from 'vitest';
import { ImpactService } from '../services/impact.service';

describe('ImpactService & Direct Choice Quantification', () => {
  it('calculates inhaled PM2.5 avoidance from indoor air filtration', () => {
    const impact = ImpactService.calculate({
      outdoorPm25: 200, // 200 µg/m³ severe smog
      hoursIndoorsWithPurifier: 10,
      commuteShift: 'CAR_TO_METRO',
      usedRangeHood: true,
      avoidedBiomassBurning: false,
    });

    // 10 hours * 0.45 m³/h * (200 - 30) = 765 µg + 45 µg cooking = 810 µg
    expect(impact.pm25InhaledAvoidedMicrograms).toBeGreaterThan(500);
    expect(impact.respiratoryRiskReductionPercent).toBeGreaterThanOrEqual(30);
    expect(impact.cleanAirHoursGained).toBe(10);
  });

  it('quantifies equivalent cigarettes avoided using Berkeley Earth formula', () => {
    const impact = ImpactService.calculate({
      outdoorPm25: 250,
      hoursIndoorsWithPurifier: 16,
      commuteShift: 'CAR_TO_METRO',
      usedRangeHood: true,
      avoidedBiomassBurning: true,
    });

    expect(impact.cigarettesEquivalentAvoided).toBeGreaterThan(5);
  });

  it('calculates greenhouse gas (CO2) and toxic NOx emissions saved by commute shift', () => {
    const metroShift = ImpactService.calculate({
      outdoorPm25: 150,
      hoursIndoorsWithPurifier: 8,
      commuteShift: 'CAR_TO_METRO',
      commuteDistanceKm: 25,
      usedRangeHood: false,
      avoidedBiomassBurning: false,
    });

    expect(metroShift.co2EmissionsSavedKg).toBeCloseTo(4.1, 1);
    expect(metroShift.noxEmissionsSavedGrams).toBeGreaterThan(5);

    const wfhShift = ImpactService.calculate({
      outdoorPm25: 150,
      hoursIndoorsWithPurifier: 8,
      commuteShift: 'AVOIDED_COMMUTE_WFH',
      commuteDistanceKm: 20,
      usedRangeHood: false,
      avoidedBiomassBurning: false,
    });

    expect(wfhShift.co2EmissionsSavedKg).toBeCloseTo(3.8, 1);
  });

  it('explains the direct impact of choices in understandable language', () => {
    const impact = ImpactService.calculate({
      outdoorPm25: 180,
      hoursIndoorsWithPurifier: 12,
      commuteShift: 'SOLO_CAR_TO_CARPOOL',
      usedRangeHood: true,
      avoidedBiomassBurning: true,
    });

    expect(impact.explanation).toContain('By filtering indoor air');
    expect(impact.explanation).toContain('cigarettes');
    expect(impact.explanation).toContain('kg of CO2');
  });
});
