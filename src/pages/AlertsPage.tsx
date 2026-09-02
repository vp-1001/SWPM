import React from 'react';
import { AlertItem, NavigationPageId } from '../types';
import { ActiveAlertsSection } from '../components/ActiveAlertsSection';
import {
  AlertTriangle,
  ShieldAlert,
  BellRing,
  CheckCircle2,
  Clock,
  Radio,
  RefreshCw,
} from 'lucide-react';

interface AlertsPageProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (id: string) => void;
  onNavigate: (page: NavigationPageId) => void;
}

export const AlertsPage: React.FC<AlertsPageProps> = ({
  alerts,
  onAcknowledgeAlert,
  onNavigate,
}) => {
  const activeCount = alerts.filter((a) => a.status === 'active').length;
  const criticalCount = alerts.filter((a) => a.severity === 'critical').length;
  const warningCount = alerts.filter((a) => a.severity === 'warning').length;
  const resolvedCount = alerts.filter((a) => a.status === 'resolved' || a.status === 'acknowledged').length;

  return (
    <div id="alerts-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-rose-950/60 via-slate-900 to-slate-950 border border-rose-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/30 shadow-inner">
            <BellRing className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Active SCADA Alarms & Event Log
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
                {activeCount} PENDING ACTION
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Centralized alarm dispatch queue · Automated escalation, operator acknowledgement & event logging
            </p>
          </div>
        </div>
      </div>

      {/* Alarm Status KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Active Alarms</div>
            <div className="text-2xl font-bold font-mono text-white mt-0.5">{activeCount}</div>
            <div className="text-[10px] text-amber-400 font-mono mt-0.5">Requiring Operator Review</div>
          </div>
          <div className="p-3 rounded-xl bg-slate-800 text-amber-400 border border-slate-700">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Priority</div>
            <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">{criticalCount}</div>
            <div className="text-[10px] text-rose-400 font-mono mt-0.5">Threshold Violations</div>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Advisory Warnings</div>
            <div className="text-2xl font-bold font-mono text-amber-300 mt-0.5">{warningCount}</div>
            <div className="text-[10px] text-amber-300 font-mono mt-0.5">Non-Critical Drift</div>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Radio className="w-5 h-5" />
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-[11px] font-mono text-slate-400 uppercase">Acknowledged / Resolved</div>
            <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">{resolvedCount}</div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Verified by Chief Eng.</div>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Active SCADA Alarms & Event Log Component */}
      <section aria-label="Active SCADA Alarms Section">
        <ActiveAlertsSection
          alerts={alerts}
          onAcknowledgeAlert={onAcknowledgeAlert}
        />
      </section>
    </div>
  );
};
