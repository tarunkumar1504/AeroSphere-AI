'use client';

import React, { useState } from 'react';
import { Home, Wind, Hammer, CheckCircle2 } from 'lucide-react';
import { RoomIaqAssessment, RoomType, DiyIaqSolution } from '@/lib/types';
import { IaqService } from '@/lib/services/iaq.service';

interface IaqOptimizerViewProps {
  outdoorAqi: number;
}

export const IaqOptimizerView: React.FC<IaqOptimizerViewProps> = ({ outdoorAqi }) => {
  const [selectedRoom, setSelectedRoom] = useState<RoomType>('BEDROOM');
  const [areaSqFt, setAreaSqFt] = useState<number>(220);
  const [hasPurifier, setHasPurifier] = useState<boolean>(true);
  const [purifierCadr] = useState<number>(300);
  const [windowStatus, setWindowStatus] = useState<'SEALED' | 'WEATHERSTRIPPED' | 'SINGLE_PANE_DRAFTY'>('WEATHERSTRIPPED');

  const assessment: RoomIaqAssessment = IaqService.assessRoom(
    selectedRoom,
    outdoorAqi,
    areaSqFt,
    hasPurifier,
    purifierCadr,
    windowStatus
  );

  const diyGuides: DiyIaqSolution[] = IaqService.getDiySolutions();

  return (
    <div className="space-y-8">
      {/* Room Diagnostics Header & Controls */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Home className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            Indoor Air Quality (IAQ) Intelligence & Clean Air Sanctuary
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          During winter thermal inversions, indoor PM2.5 can reach 60-80% of outdoor smog without active barriers. Calibrate your room volume, filter CADR, and draught sealing below.
        </p>

        {/* Room selection tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
          {(['BEDROOM', 'LIVING_ROOM', 'NURSERY', 'KITCHEN', 'HOME_OFFICE'] as RoomType[]).map((r) => (
            <button
              key={r}
              onClick={() => setSelectedRoom(r)}
              className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition touch-target text-center ${
                selectedRoom === r
                  ? 'bg-sky-600 text-white border-sky-600 shadow'
                  : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
              }`}
            >
              {r.replace('_', ' ')}
            </button>
          ))}
        </div>

        {/* Room Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Room Area: {areaSqFt} sq ft
            </label>
            <input
              type="range"
              min="80"
              max="800"
              step="20"
              value={areaSqFt}
              onChange={(e) => setAreaSqFt(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
            />
            <span className="text-[11px] text-slate-500 mt-1 block">
              Required AHAM CADR: <strong>{assessment.purifierRecommendation.minCadrM3h} m³/h</strong>
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Window Envelope Condition:
            </label>
            <select
              value={windowStatus}
              onChange={(e) => setWindowStatus(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-medium touch-target"
            >
              <option value="SEALED">Sealed Double Glazing (Airtight)</option>
              <option value="WEATHERSTRIPPED">Weatherstripped Single/Double Pane</option>
              <option value="SINGLE_PANE_DRAFTY">Single Pane Drafty (Gaps present)</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-3">
            <input
              type="checkbox"
              id="purifier-status"
              checked={hasPurifier}
              onChange={(e) => setHasPurifier(e.target.checked)}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 touch-target"
            />
            <div>
              <label htmlFor="purifier-status" className="text-xs font-bold text-slate-900 dark:text-white block">
                Air Purifier Active in Room
              </label>
              <span className="text-[11px] text-slate-500">
                {hasPurifier ? 'Continuous air cleaning' : 'No active air filter'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Diagnostics Readout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Estimated Indoor PM2.5</span>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-slate-900 dark:text-white">
              {assessment.estimatedIndoorPm25}
            </span>
            <span className="text-xs text-slate-500">µg/m³</span>
          </div>
          <span className="mt-2 inline-block px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300">
            {assessment.hazardLevel} Hazard
          </span>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-3">
            Versus Outdoor AQI of {outdoorAqi}. Room envelope stops ~{Math.round((1 - assessment.estimatedIndoorPm25 / (outdoorAqi * 0.65 || 1)) * 100)}% of particulate smog.
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Purifier Recommendation</span>
          <div className="flex items-center gap-2 mt-2">
            <Wind className="w-5 h-5 text-sky-500" />
            <span className="text-xl font-extrabold text-slate-900 dark:text-white">
              Mode: {assessment.purifierRecommendation.status}
            </span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            {assessment.purifierRecommendation.recommendedSchedule}
          </p>
        </div>

        <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase">Ventilation Strategy</span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mt-2">
            {assessment.ventilationPlan.naturalVentilationWindow}
          </h3>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
            Draught sealing urgency: <strong>{assessment.ventilationPlan.sealDraftsUrgency}</strong>
          </p>
        </div>
      </div>

      {/* Action Checklist */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          Room Clean-Air Action Checklist
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {assessment.actionChecklist.map((item, i) => (
            <div key={i} className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span className="text-xs font-medium text-slate-800 dark:text-slate-200">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* DIY Corsi-Rosenthal & Low-Emission Solutions */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Hammer className="w-5 h-5 text-amber-500" />
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
            Sustainable & Low-Cost DIY Air Quality Blueprints
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {diyGuides.map((guide, idx) => (
            <div
              key={idx}
              className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200">
                    Est. Cost: ${guide.estimatedCostUsd}
                  </span>
                  <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
                    -{guide.pmReductionPercent}% PM2.5
                  </span>
                </div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-3">
                  {guide.title}
                </h4>
                <p className="text-xs text-slate-500 mt-1 mb-4">
                  {guide.tagline}
                </p>

                <div className="text-xs space-y-2 mb-4">
                  <span className="font-bold text-slate-700 dark:text-slate-300 block">Required Materials:</span>
                  <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-400 text-[11px]">
                    {guide.materialsNeeded.map((m, mIdx) => (
                      <li key={mIdx}>{m}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <details className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                <summary className="font-bold text-sky-600 dark:text-sky-400 cursor-pointer touch-target py-1">
                  View Assembly Guide ({guide.stepByStepGuide.length} Steps)
                </summary>
                <div className="mt-2 space-y-1.5 pl-2 border-l-2 border-sky-500 text-slate-700 dark:text-slate-300 text-[11px]">
                  {guide.stepByStepGuide.map((step, sIdx) => (
                    <p key={sIdx}>{step}</p>
                  ))}
                </div>
              </details>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
