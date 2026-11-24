import { describe, it, expect } from 'vitest';
import { IaqService } from '../services/iaq.service';

describe('IaqService & Clean Air Sanctuaries', () => {
  it('implements AHAM 2/3 Clean Air Delivery Rate (CADR) sizing rule', () => {
    // 150 sq ft room -> 150 * (2/3) * 1.699 = ~170 m³/h
    expect(IaqService.calculateRequiredCadr(150)).toBe(170);

    // 300 sq ft room -> 300 * (2/3) * 1.699 = ~340 m³/h
    expect(IaqService.calculateRequiredCadr(300)).toBe(340);
  });

  it('accurately models infiltration across drafty vs sealed window envelopes', () => {
    const outdoorAqi = 300; // ~195 µg/m³
    const drafty = IaqService.estimateIndoorPm25(outdoorAqi, 200, false, 0, 'SINGLE_PANE_DRAFTY');
    const weatherstripped = IaqService.estimateIndoorPm25(outdoorAqi, 200, false, 0, 'WEATHERSTRIPPED');
    const sealed = IaqService.estimateIndoorPm25(outdoorAqi, 200, false, 0, 'SEALED');

    expect(drafty).toBeGreaterThan(weatherstripped);
    expect(weatherstripped).toBeGreaterThan(sealed);
    expect(sealed).toBeLessThan(70);
  });

  it('delivers actionable DIY Corsi-Rosenthal Box specifications', () => {
    const solutions = IaqService.getDiySolutions();
    const crBox = solutions.find((s) => s.title.includes('Corsi-Rosenthal'));

    expect(crBox).toBeDefined();
    expect(crBox?.estimatedCostUsd).toBeLessThan(100);
    expect(crBox?.pmReductionPercent).toBeGreaterThanOrEqual(85);
    expect(crBox?.materialsNeeded.some((m) => m.includes('MERV 13'))).toBe(true);
    expect(crBox?.stepByStepGuide.length).toBeGreaterThanOrEqual(5);
  });

  it('assesses room IAQ and produces personalized action checklist', () => {
    const bedroom = IaqService.assessRoom('BEDROOM', 280, 220, true, 300, 'WEATHERSTRIPPED');

    expect(bedroom.roomName).toBe('Master Bedroom');
    expect(bedroom.purifierRecommendation.status).toBeDefined();
    expect(bedroom.actionChecklist.length).toBeGreaterThan(2);
    expect(bedroom.actionChecklist.some((a) => a.includes('CADR'))).toBe(true);
  });
});
