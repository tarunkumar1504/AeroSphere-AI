import { DiyIaqSolution, RoomIaqAssessment, RoomType, SeverityLevel } from '../types';

export class IaqService {
  /**
   * AHAM (Association of Home Appliance Manufacturers) 2/3 rule:
   * Required CADR (Clean Air Delivery Rate) in CFM = Room Area in sq ft * (2 / 3)
   * To convert CFM to m³/h: multiply by 1.699
   */
  public static calculateRequiredCadr(roomAreaSqFt: number): number {
    const cfm = roomAreaSqFt * (2 / 3);
    return Math.round(cfm * 1.699);
  }

  /**
   * Estimates indoor PM2.5 based on outdoor levels, window sealing, and purifier CADR
   */
  public static estimateIndoorPm25(
    outdoorAqi: number,
    roomAreaSqFt: number,
    hasPurifier: boolean,
    purifierCadr: number,
    windowStatus: 'SEALED' | 'WEATHERSTRIPPED' | 'SINGLE_PANE_DRAFTY'
  ): number {
    // Outdoor PM2.5 proxy from AQI
    const outdoorPm25 = outdoorAqi * 0.65;

    // Infiltration factor through building envelope
    let infiltrationRate = 0.55; // Weatherstripped
    if (windowStatus === 'SEALED') infiltrationRate = 0.25;
    if (windowStatus === 'SINGLE_PANE_DRAFTY') infiltrationRate = 0.85;

    let baseIndoorPm25 = outdoorPm25 * infiltrationRate;

    // Purifier reduction
    if (hasPurifier && purifierCadr > 0) {
      const roomVolumeM3 = (roomAreaSqFt * 9) * 0.0283168; // 9 ft ceiling
      const airChangesPerHour = purifierCadr / (roomVolumeM3 || 1);
      // Effectiveness increases with ACH
      const filtrationEfficiency = Math.min(0.92, airChangesPerHour * 0.22);
      baseIndoorPm25 = baseIndoorPm25 * (1 - filtrationEfficiency);
    }

    return Math.max(5, Math.round(baseIndoorPm25 * 10) / 10);
  }

  public static assessRoom(
    room: RoomType,
    outdoorAqi: number,
    roomAreaSqFt: number = 220,
    hasPurifier: boolean = false,
    purifierCadr: number = 0,
    windowStatus: 'SEALED' | 'WEATHERSTRIPPED' | 'SINGLE_PANE_DRAFTY' = 'WEATHERSTRIPPED'
  ): RoomIaqAssessment {
    const estimatedIndoorPm25 = this.estimateIndoorPm25(
      outdoorAqi,
      roomAreaSqFt,
      hasPurifier,
      purifierCadr,
      windowStatus
    );

    let hazardLevel: SeverityLevel = 'GOOD';
    if (estimatedIndoorPm25 > 150) hazardLevel = 'HAZARDOUS';
    else if (estimatedIndoorPm25 > 75) hazardLevel = 'VERY_UNHEALTHY';
    else if (estimatedIndoorPm25 > 55) hazardLevel = 'UNHEALTHY';
    else if (estimatedIndoorPm25 > 35) hazardLevel = 'UNHEALTHY_SENSITIVE';
    else if (estimatedIndoorPm25 > 12) hazardLevel = 'MODERATE';

    const requiredCadr = this.calculateRequiredCadr(roomAreaSqFt);

    let purifierSpeed: 'OFF' | 'LOW' | 'MEDIUM' | 'TURBO' = 'LOW';
    if (estimatedIndoorPm25 > 75) purifierSpeed = 'TURBO';
    else if (estimatedIndoorPm25 > 35) purifierSpeed = 'MEDIUM';
    else if (estimatedIndoorPm25 <= 12) purifierSpeed = 'LOW';

    let naturalVentilationWindow = '12:00 PM - 02:00 PM (Quick 10-minute flush during midday inversion lifting)';
    if (outdoorAqi > 350) {
      naturalVentilationWindow = 'DO NOT OPEN WINDOWS. Outdoor air is acutely toxic; run purifiers on recirculation.';
    }

    const checklist: string[] = [
      `Maintain minimum CADR of ${requiredCadr} m³/h for ${roomAreaSqFt} sq ft area.`,
      windowStatus === 'SINGLE_PANE_DRAFTY'
        ? 'CRITICAL: Apply silicone door draft stoppers and foam tape along window sashes.'
        : 'Window perimeter is reasonably insulated against particulate ingress.',
      room === 'KITCHEN'
        ? 'Always run range hood on high when using gas stove or sautéing; close kitchen doors to isolate other rooms.'
        : 'Keep doors closed to maintain filtered clean-air microclimate.',
      room === 'NURSERY' || room === 'BEDROOM'
        ? 'Place air purifier 3 feet away from bed headboard, angled towards breathing zone.'
        : 'Elevate purifier off floor for optimal convection airflow.',
    ];

    const roomNames: Record<RoomType, string> = {
      BEDROOM: 'Master Bedroom',
      LIVING_ROOM: 'Family Living Room',
      NURSERY: "Child's Nursery / Study Room",
      KITCHEN: 'Cooking & Kitchen Zone',
      HOME_OFFICE: 'Home Workspace',
    };

    return {
      room,
      roomName: roomNames[room],
      estimatedIndoorPm25,
      hazardLevel,
      purifierRecommendation: {
        status: purifierSpeed,
        minCadrM3h: requiredCadr,
        recommendedSchedule: 'Continuous low-speed base; Turbo boost during 06:00-09:00 and 19:00-22:00 inversion spikes.',
      },
      ventilationPlan: {
        naturalVentilationWindow,
        sealDraftsUrgency: windowStatus === 'SINGLE_PANE_DRAFTY' ? 'CRITICAL' : 'MEDIUM',
        exhaustFanNotes: 'Operate bathroom and kitchen exhaust only with backdraft dampers to avoid pulling smog in through gaps.',
      },
      actionChecklist: checklist,
    };
  }

  public static getDiySolutions(): DiyIaqSolution[] {
    return [
      {
        title: 'Corsi-Rosenthal Box (4-Filter High CADR Clean Air Machine)',
        tagline: 'World Health Organization & EPA recognized low-cost, ultra-high CADR particulate filter',
        estimatedCostUsd: 65,
        pmReductionPercent: 88,
        cadrRatingM3h: 580,
        materialsNeeded: [
          '1x 20-inch Box Fan (3-speed, UL listed)',
          '4x 20x20x1 or 20x20x2 MERV 13 (or MPR 1900+) furnace filters',
          '1x 20x20 cardboard base square',
          '1x Roll of heavy-duty duct tape or gaffer tape',
          'Cardboard fan shroud with 15-inch circular cutout (boosts air velocity by 25%)',
        ],
        stepByStepGuide: [
          'Step 1: Form a cube with the 4 MERV 13 filters as the sides, ensuring all airflow arrows point INWARD toward the center.',
          'Step 2: Tape the 20x20 cardboard base to the bottom edge, sealing all corner seams airtight.',
          'Step 3: Place the 20-inch box fan on top of the cube facing UPWARD (blowing filtered air toward the ceiling).',
          'Step 4: Securely tape the fan perimeter to the filter edges with wide duct tape.',
          'Step 5: Cut a circular shroud with 15" diameter from cardboard and tape over the fan face to eliminate blade vortex drag.',
          'Step 6: Plug in on Speed 1 or 2. This delivers 580 m³/h clean air—matching $600 HEPA machines at 1/10th the cost.',
        ],
      },
      {
        title: 'Low-Emission Window Thermal & Draft Barrier',
        tagline: 'Prevent smog infiltration and trap indoor warmth during severe winter freezes',
        estimatedCostUsd: 15,
        pmReductionPercent: 45,
        cadrRatingM3h: 0,
        materialsNeeded: [
          'Self-adhesive closed-cell EVA foam weatherstripping tape (1/4 inch thickness)',
          'Clear bubble wrap or heat-shrink window insulation film',
          'Spray bottle with water & double-sided removable tape',
          'Fabric draft snake filled with sand/rice for bottom door sweeps',
        ],
        stepByStepGuide: [
          'Step 1: Clean window frames and sashes thoroughly to remove dust and oil.',
          'Step 2: Press EVA foam weatherstripping firmly into the window frame contact edges where drafts enter.',
          'Step 3: Lightly mist window glass with water and press bubble wrap flat against the pane (bubbles facing glass); it adheres naturally, creating a thermal insulation barrier.',
          'Step 4: Place fabric draft snakes at exterior door thresholds to prevent corridor or porch smog infiltration.',
        ],
      },
      {
        title: 'Eco-Induction Shift & Cooking Fume Barrier',
        tagline: 'Eliminate indoor combustion gases (NO2, CO, ultrafine particles) from winter kitchens',
        estimatedCostUsd: 40,
        pmReductionPercent: 70,
        cadrRatingM3h: 0,
        materialsNeeded: [
          'Single-burner portable electric induction cooktop',
          'Tight-fitting glass lids for pans',
          'High-smoke-point cooking oils (avocado, mustard, clarified ghee) instead of low-smoke oils',
        ],
        stepByStepGuide: [
          'Step 1: Shift primary winter cooking from LPG/gas to portable electric induction to eliminate indoor NO2 production.',
          'Step 2: Keep pans covered with tight-fitting lids when simmering or sautéing to trap particulate aerosol.',
          'Step 3: Run range hood exhaust on highest setting and keep kitchen access door closed for 20 minutes post-cooking.',
        ],
      },
    ];
  }
}
