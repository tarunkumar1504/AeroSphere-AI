import { describe, it, expect } from 'vitest';
import { AirQualityService } from '../services/air-quality.service';

describe('AirQualityService', () => {
  it('accurately maps PM2.5 concentrations to EPA AQI breakpoints', () => {
    // Good: 0 - 12.0 µg/m³ -> AQI 0 - 50
    expect(AirQualityService.calculatePm25Aqi(6.0)).toBe(25);
    expect(AirQualityService.calculatePm25Aqi(12.0)).toBe(50);

    // Moderate: 12.1 - 35.4 µg/m³ -> AQI 51 - 100
    expect(AirQualityService.calculatePm25Aqi(23.75)).toBe(76);

    // Unhealthy for Sensitive Groups: 35.5 - 55.4 µg/m³ -> AQI 101 - 150
    expect(AirQualityService.calculatePm25Aqi(45.45)).toBe(126);

    // Unhealthy: 55.5 - 150.4 µg/m³ -> AQI 151 - 200
    expect(AirQualityService.calculatePm25Aqi(102.95)).toBe(176);

    // Very Unhealthy: 150.5 - 250.4 µg/m³ -> AQI 201 - 300
    expect(AirQualityService.calculatePm25Aqi(200.45)).toBe(251);

    // Hazardous: 250.5 - 500.4 µg/m³ -> AQI 301 - 500
    expect(AirQualityService.calculatePm25Aqi(300.45)).toBe(351);
  });

  it('evaluates winter temperature inversion risk accurately', () => {
    // Early morning cold & humid -> CRITICAL
    const morningHazard = AirQualityService.calculateInversionRisk(6, 10, 85);
    expect(morningHazard).toBe('CRITICAL');

    // Midday solar warming -> MODERATE
    const middayRelief = AirQualityService.calculateInversionRisk(13, 22, 45);
    expect(middayRelief).toBe('MODERATE');

    // Afternoon mild -> LOW
    const afternoonNormal = AirQualityService.calculateInversionRisk(17, 24, 40);
    expect(afternoonNormal).toBe('LOW');
  });

  it('retrieves city air quality assessment with protective guidelines', () => {
    const assessment = AirQualityService.getRealtimeAssessment('delhi-anand-vihar');
    expect(assessment.city.name).toContain('Delhi');
    expect(assessment.currentMetrics.aqi).toBeGreaterThan(300);
    expect(assessment.currentMetrics.category).toBe('HAZARDOUS');
    expect(assessment.vulnerableShieldAdvice).toContain('URGENT');
  });
});
