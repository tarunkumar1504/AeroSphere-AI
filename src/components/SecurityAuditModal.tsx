'use client';

import React, { useState, useEffect } from 'react';
import { Shield, X, RefreshCw } from 'lucide-react';
import { SecurityAuditEntry } from '@/lib/types';

interface SecurityAuditModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SecurityAuditModal: React.FC<SecurityAuditModalProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<SecurityAuditEntry[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/audit');
      if (res.ok) {
        const data = await res.json();
        setLogs(data.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) fetchLogs();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-slate-800 max-h-[85vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="audit-modal-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-sky-600 dark:text-sky-400" />
            <h2 id="audit-modal-title" className="text-lg font-extrabold text-slate-900 dark:text-white">
              Immutable Security & Compliance Audit Trail
            </h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchLogs}
              disabled={loading}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
              title="Refresh logs"
              aria-label="Refresh audit logs"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition touch-target"
              aria-label="Close audit log"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-500 my-3">
          Every critical transaction, alert creation, and routine generation is logged with timestamp and actor identity for security compliance.
        </p>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {logs.map((log) => (
            <div
              key={log.id}
              className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
            >
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                <span className="font-mono font-bold text-sky-600 dark:text-sky-400">{log.action}</span>
                <span>{new Date(log.timestamp).toLocaleTimeString()} ({new Date(log.timestamp).toLocaleDateString()})</span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200">{log.details}</p>
              <div className="mt-1 text-[10px] text-slate-400">
                Actor: <strong>{log.actor}</strong> {log.ipAddress ? `| IP: ${log.ipAddress}` : ''}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
