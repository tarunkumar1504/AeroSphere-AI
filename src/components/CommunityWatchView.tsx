'use client';

import React, { useState, useEffect } from 'react';
import { Users, ThumbsUp, PlusCircle, CheckCircle2 } from 'lucide-react';
import { CommunityAlert } from '@/lib/types';

export const CommunityWatchView: React.FC = () => {
  const [alerts, setAlerts] = useState<CommunityAlert[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [showModal, setShowModal] = useState<boolean>(false);

  // Form state
  const [authorName, setAuthorName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [type, setType] = useState<CommunityAlert['type']>('OPEN_BURNING_REPORT');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity] = useState<CommunityAlert['severity']>('WARNING');

  const fetchAlerts = async () => {
    try {
      const res = await fetch('/api/community');
      if (res.ok) {
        const data = await res.json();
        setAlerts(data.alerts);
        setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Failed to load community alerts:', err);
    }
  };

  useEffect(() => {
    fetchAlerts();
  }, []);

  const handleUpvote = async (alertId: string) => {
    try {
      const res = await fetch('/api/community/upvote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (res.ok) {
        const updated = await res.json();
        setAlerts((prev) => prev.map((a) => (a.id === updated.id ? updated : a)));
      }
    } catch (err) {
      console.error('Failed to upvote:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/community', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName,
          neighborhood,
          type,
          title,
          description,
          severity,
        }),
      });
      if (res.ok) {
        setShowModal(false);
        setAuthorName('');
        setNeighborhood('');
        setTitle('');
        setDescription('');
        fetchAlerts();
      }
    } catch (err) {
      console.error('Failed to submit alert:', err);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Banner & Metrics */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-sky-500" />
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                Community Smog Watch & Clean Air Action Hub
              </h2>
            </div>
            <p className="text-sm text-slate-600 dark:text-slate-300 mt-1">
              Crowdsourced defense against illegal leaf/waste burning, clean air sanctuary locations, and shared low-emission commuter carpools.
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shadow transition touch-target"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Post Clean Air Action</span>
          </button>
        </div>

        {/* Quick metrics */}
        {metrics && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-200 dark:border-slate-800 text-center">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Active Smog Alerts</span>
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{metrics.activeAlertsCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Clean Air Shelters</span>
              <span className="text-xl font-extrabold text-sky-600 dark:text-sky-400">{metrics.cleanAirSheltersCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Active Carpool Offers</span>
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{metrics.carpoolPledgesCount}</span>
            </div>
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
              <span className="text-xs text-slate-500 block">Neighborhoods Protected</span>
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{metrics.totalNeighborhoodsCovered}</span>
            </div>
          </div>
        )}
      </div>

      {/* Community Feed */}
      <div className="space-y-4">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                  {alert.neighborhood}
                </span>
                {alert.status === 'VERIFIED' && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Community Verified
                  </span>
                )}
              </div>
              <span className="text-xs text-slate-400">
                Posted by <strong>{alert.authorName}</strong>
              </span>
            </div>

            <div className="py-3">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                {alert.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                {alert.description}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800">
              <span className={`text-[11px] font-bold uppercase px-2 py-0.5 rounded ${
                alert.severity === 'CRITICAL' ? 'bg-red-100 text-red-800' : 'bg-sky-100 text-sky-800'
              }`}>
                {alert.type.replace(/_/g, ' ')}
              </span>

              <button
                onClick={() => handleUpvote(alert.id)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
                aria-label={`Upvote this alert. Current upvotes: ${alert.upvotes}`}
              >
                <ThumbsUp className="w-3.5 h-3.5 text-sky-500" />
                <span>Confirm / Upvote ({alert.upvotes})</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Submission Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white mb-4">
              Post Community Clean Air Action
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={authorName}
                  onChange={(e) => setAuthorName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm touch-target"
                  placeholder="e.g. Maya Lin"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Neighborhood / Sector</label>
                <input
                  type="text"
                  required
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm touch-target"
                  placeholder="e.g. Sector 18 / Civil Lines"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Action Category</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm touch-target"
                >
                  <option value="OPEN_BURNING_REPORT">Open Burning & Smog Hazard Report</option>
                  <option value="CARPOOL_OFFER">Low-Emission Carpool Offer</option>
                  <option value="CLEAN_AIR_SHELTER">Clean Air Shelter / Filtered Haven</option>
                  <option value="ECO_HEATING_PLEDGE">Community Eco-Heating Pledge</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm touch-target"
                  placeholder="Brief summary of hazard or initiative"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Description & Advice</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm"
                  placeholder="Provide precise location, time, and safety steps for neighbors."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-bold touch-target"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm touch-target shadow"
                >
                  Publish Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
