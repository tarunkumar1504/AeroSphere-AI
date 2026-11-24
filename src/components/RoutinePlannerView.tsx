'use client';

import React, { useState } from 'react';
import { Clock, Sparkles, AlertCircle, Leaf } from 'lucide-react';
import { CityLocation, DailyRoutinePlan, FamilyMember, LifestyleType } from '@/lib/types';

interface RoutinePlannerViewProps {
  currentCity: CityLocation;
  familyMembers: FamilyMember[];
}

export const RoutinePlannerView: React.FC<RoutinePlannerViewProps> = ({
  currentCity,
  familyMembers,
}) => {
  const [lifestyle, setLifestyle] = useState<LifestyleType>('COMMUTER');
  const [hasPurifier, setHasPurifier] = useState<boolean>(true);
  const [canWfh, setCanWfh] = useState<boolean>(false);
  const [commuteMode, setCommuteMode] = useState<'CAR' | 'METRO' | 'BUS' | 'BIKE' | 'WALK'>('METRO');
  const [loading, setLoading] = useState<boolean>(false);
  const [plan, setPlan] = useState<DailyRoutinePlan | null>(null);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/routine', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cityId: currentCity.id,
          lifestyle,
          familyMembers,
          userPreferences: {
            hasAirPurifier: hasPurifier,
            canWorkFromHome: canWfh,
            commuteMode,
          },
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setPlan(data);
      }
    } catch (err) {
      console.error('Failed to generate routine:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-sky-500" />
          <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
            GenAI Low-Emission Daily Routine Planner
          </h2>
        </div>
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Generates an inversion-aware schedule shifting high-exertion tasks away from early morning/late night smog spikes while suggesting sustainable commute and clean cooking alternatives.
        </p>

        {/* Lifestyle Selector */}
        <div className="mb-6">
          <label className="block text-sm font-bold text-slate-800 dark:text-slate-200 mb-2">
            Select Household Lifestyle Profile:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2.5">
            {(['COMMUTER', 'STUDENT', 'REMOTE_WORKER', 'SENIOR', 'OUTDOOR_WORKER'] as LifestyleType[]).map((type) => (
              <button
                key={type}
                onClick={() => setLifestyle(type)}
                className={`py-2.5 px-3 rounded-xl border text-xs font-bold transition touch-target text-center ${
                  lifestyle === type
                    ? 'bg-sky-600 text-white border-sky-600 shadow'
                    : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200 dark:border-slate-700 hover:bg-slate-100'
                }`}
              >
                {type.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Commute and Purification toggles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              Primary Commute Mode:
            </label>
            <select
              value={commuteMode}
              onChange={(e) => setCommuteMode(e.target.value as any)}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-sm font-medium touch-target"
            >
              <option value="METRO">Electric Metro / Rapid Transit</option>
              <option value="CAR">Personal ICE Car (Solo)</option>
              <option value="BUS">Public City Bus</option>
              <option value="BIKE">Bicycle / E-Bike</option>
              <option value="WALK">Walking</option>
            </select>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="purifier-check"
              checked={hasPurifier}
              onChange={(e) => setHasPurifier(e.target.checked)}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 touch-target"
            />
            <label htmlFor="purifier-check" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Home has HEPA / Corsi-Rosenthal Filter
            </label>
          </div>

          <div className="flex items-center gap-3 pt-4">
            <input
              type="checkbox"
              id="wfh-check"
              checked={canWfh}
              onChange={(e) => setCanWfh(e.target.checked)}
              className="w-5 h-5 rounded text-sky-600 focus:ring-sky-500 touch-target"
            />
            <label htmlFor="wfh-check" className="text-xs font-semibold text-slate-800 dark:text-slate-200">
              Flexible WFH Option on Red-Alert Smog Days
            </label>
          </div>
        </div>

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="w-full py-3.5 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-base flex items-center justify-center gap-2 shadow-md transition touch-target disabled:opacity-50"
        >
          {loading ? (
            <span>Analyzing Atmospheric Inversion & Synthesizing Routine...</span>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Tailored Low-Emission Daily Routine</span>
            </>
          )}
        </button>
      </div>

      {/* Generated Routine Results */}
      {plan && (
        <div className="space-y-6">
          {/* Summary & Impact Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-200 dark:border-sky-800">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300">
                  Targeted Protective Plan ({plan.cityName})
                </span>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200 mt-1 max-w-2xl">
                  {plan.summary}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-center">
                  <span className="text-xs font-semibold text-slate-500 block">PM2.5 Avoided</span>
                  <span className="text-lg font-extrabold text-sky-600 dark:text-sky-400">
                    {plan.impact.pm25InhaledAvoidedMicrograms} µg
                  </span>
                </div>
                <div className="px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-sky-300 dark:border-sky-700 text-center">
                  <span className="text-xs font-semibold text-slate-500 block">CO2 Saved</span>
                  <span className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">
                    {plan.impact.co2EmissionsSavedKg} kg
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Timeline Slots */}
          <div className="space-y-4">
            <h2 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-500" />
              Hourly Inversion-Proof Routine Timeline
            </h2>

            <div className="grid grid-cols-1 gap-4">
              {plan.slots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3">
                      <span className="px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white font-extrabold text-sm">
                        {slot.timeWindow}
                      </span>
                      <h3 className="font-bold text-slate-900 dark:text-white">{slot.activity}</h3>
                    </div>
                    <div>
                      {slot.isSafeOutdoor ? (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                          Outdoor Safe (AQI: {slot.hourlyAqi})
                        </span>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-300">
                          Hazardous Outdoors (AQI: {slot.hourlyAqi})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 text-xs">
                    <div>
                      <span className="font-bold text-slate-500 uppercase block mb-1">
                        Protective Routine Alternative
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {slot.recommendedAlternative}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400 uppercase block mb-1 flex items-center gap-1">
                        <Leaf className="w-3.5 h-3.5" /> Low-Emission Action
                      </span>
                      <p className="text-slate-800 dark:text-slate-200 font-medium">
                        {slot.lowEmissionAction}
                      </p>
                    </div>

                    <div>
                      <span className="font-bold text-amber-600 dark:text-amber-400 uppercase block mb-1 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" /> Atmospheric Inversion Factor
                      </span>
                      <p className="text-slate-600 dark:text-slate-400 font-medium">
                        {slot.inversionFactor}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
