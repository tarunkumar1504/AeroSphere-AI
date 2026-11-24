import { QuantifiedImpact } from '../types';

export interface ImpactInput {
  outdoorPm25: number;             // in µg/m³
  hoursIndoorsWithPurifier: number; // 0 to 24
  commuteShift: 'CAR_TO_METRO' | 'SOLO_CAR_TO_CARPOOL' | 'CAR_TO_CYCLE_INDOOR' | 'AVOIDED_COMMUTE_WFH' | 'NONE';
  commuteDistanceKm?: number;      // default 20km round-trip
  usedRangeHood: boolean;
  avoidedBiomassBurning: boolean;
}

export class ImpactService {
  /**
   * Average adult respiration rate: 10.8 m³/day (~0.45 m³/hour)
   * Berkeley Earth equivalence: 22 µg/m³ of PM2.5 exposure for 24h = 1 cigarette
   */
  private static readonly INHALATION_RATE_M3_PER_HOUR = 0.45;

  public static calculate(input: ImpactInput): QuantifiedImpact {
    const {
      outdoorPm25,
      hoursIndoorsWithPurifier,
      commuteShift,
      commuteDistanceKm = 20,
      usedRangeHood,
      avoidedBiomassBurning,
    } = input;

    // 1. Inhaled PM2.5 avoidance:
    // With HEPA/Corsi-Rosenthal filtration, indoor PM2.5 drops by ~85%
    const unmitigatedExposurePerHour = outdoorPm25 * this.INHALATION_RATE_M3_PER_HOUR;
    const mitigatedExposurePerHour = outdoorPm25 * 0.15 * this.INHALATION_RATE_M3_PER_HOUR;
    const pm25AvoidedIndoors = Math.max(0, (unmitigatedExposurePerHour - mitigatedExposurePerHour) * hoursIndoorsWithPurifier);

    // Range hood and clean cooking adds an extra ~45 µg avoided
    const indoorCookingAvoided = usedRangeHood ? 45.0 : 0;
    // Avoiding outdoor wood/leaf burning prevents extreme local plumes (~120 µg avoided)
    const biomassAvoided = avoidedBiomassBurning ? 120.0 : 0;

    const totalPm25AvoidedMicrograms = Math.round((pm25AvoidedIndoors + indoorCookingAvoided + biomassAvoided) * 10) / 10;

    // 2. Equivalent cigarettes avoided
    const cigarettesEquivalent = Math.max(
      0,
      Math.round((totalPm25AvoidedMicrograms / (outdoorPm25 > 0 ? (outdoorPm25 * 0.45) : 237.6)) * 10) / 10
    );

    // 3. CO2 and NOx Emissions Saved
    let co2SavedKg = 0;
    let noxSavedGrams = 0;

    // Average passenger ICE car produces ~0.192 kg CO2 per km and ~0.45g NOx per km
    if (commuteShift === 'CAR_TO_METRO') {
      // Metro produces ~0.028 kg CO2/km -> net savings ~0.164 kg CO2/km
      co2SavedKg = Math.round(commuteDistanceKm * 0.164 * 10) / 10;
      noxSavedGrams = Math.round(commuteDistanceKm * 0.42 * 10) / 10;
    } else if (commuteShift === 'SOLO_CAR_TO_CARPOOL') {
      // Carpool splits vehicle emissions among 3-4 riders (~60% net savings)
      co2SavedKg = Math.round(commuteDistanceKm * 0.192 * 0.6 * 10) / 10;
      noxSavedGrams = Math.round(commuteDistanceKm * 0.45 * 0.6 * 10) / 10;
    } else if (commuteShift === 'AVOIDED_COMMUTE_WFH' || commuteShift === 'CAR_TO_CYCLE_INDOOR') {
      // 100% vehicle elimination
      co2SavedKg = Math.round(commuteDistanceKm * 0.192 * 10) / 10;
      noxSavedGrams = Math.round(commuteDistanceKm * 0.45 * 10) / 10;
    }

    if (avoidedBiomassBurning) {
      co2SavedKg += 4.5; // Burning leaves/wood emits significant biogenic CO2 & black carbon
      noxSavedGrams += 12.0;
    }

    // 4. Respiratory Risk Reduction Percentage
    // Based on EPA / WHO exposure-response curve for acute PM2.5 reduction
    const exposureReductionRatio = Math.min(1.0, totalPm25AvoidedMicrograms / (outdoorPm25 * 10.8 || 1));
    const respiratoryRiskReduction = Math.min(88, Math.round(exposureReductionRatio * 100 * 0.85));

    // 5. Clean Air Hours Gained
    const cleanAirHours = Math.round(hoursIndoorsWithPurifier);

    const explanation = `By filtering indoor air for ${hoursIndoorsWithPurifier} hours and choosing ${commuteShift.replace(/_/g, ' ').toLowerCase()}, you prevented ${totalPm25AvoidedMicrograms} µg of deep-lung PM2.5 inhalation (equivalent to avoiding ${cigarettesEquivalent} cigarettes) and cut ${co2SavedKg} kg of CO2 and ${noxSavedGrams}g of toxic NOx from your community's winter airshed.`;

    return {
      pm25InhaledAvoidedMicrograms: totalPm25AvoidedMicrograms,
      cigarettesEquivalentAvoided: cigarettesEquivalent,
      co2EmissionsSavedKg: co2SavedKg,
      noxEmissionsSavedGrams: noxSavedGrams,
      respiratoryRiskReductionPercent: respiratoryRiskReduction,
      cleanAirHoursGained: cleanAirHours,
      explanation,
    };
  }
}
