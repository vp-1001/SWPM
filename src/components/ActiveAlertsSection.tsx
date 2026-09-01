import React, { useState } from 'react';
import {
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Filter,
  Check,
  ShieldAlert,
  ArrowUpRight,
} from 'lucide-react';
import { AlertItem, AlertSeverity, AlertStatus } from '../types';
import { WaterMonitoringService } from '../services/mockData';

interface ActiveAlertsSectionProps {
  alerts: AlertItem[];
  onAcknowledgeAlert?: (alertId: string) => void;
  onNavigateToFullAlerts?: () => void;
  onSelectNode?: (nodeId: string) => void;
}

export const ActiveAlertsSection: React.FC<ActiveAlertsSectionProps> = ({
  alerts,
  onAcknowledgeAlert,
  onNavigateToFullAlerts,
  onSelectNode,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<AlertSeverity | 'all'>('all');

  const handleAcknowledge = (id: string) => {
    WaterMonitoringService.acknowledgeAlert(id, 'SCADA Operator (Current Session)');
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(id);
    }
  };

  const handleResolve = (id: string) => {
    WaterMonitoringService.resolveAlert(id);
    if (onAcknowledgeAlert) {
      onAcknowledgeAlert(id);
    }
  };


  const filteredAlerts = alerts.filter((alert) => {
    if (filterSeverity !== 'all' && alert.severity !== filterSeverity) return false;
    return true;
  });

  const getSeverityStyle = (severity: AlertSeverity) => {
    switch (severity) {
      case 'critical':
        return {
          badge: 'bg-rose-950/80 text-rose-300 border-rose-800',
          border: 'border-rose-900/60 bg-rose-950/10',
          icon: <AlertCircle className="w-4 h-4 text-rose-400" />,
          label: 'CRITICAL',
        };
      case 'warning':
        return {
          badge: 'bg-amber-950/80 text-amber-300 border-amber-800',
          border: 'border-amber-900/60 bg-amber-950/10',
          icon: <AlertTriangle className="w-4 h-4 text-amber-400" />,
          label: 'WARNING',
        };
      case 'advisory':
        return {
          badge: 'bg-sky-950/80 text-sky-300 border-sky-800',
          border: 'border-sky-900/60 bg-sky-950/10',
          icon: <Info className="w-4 h-4 text-sky-400" />,
          label: 'ADVISORY',
        };
      case 'info':
        return {
          badge: 'bg-slate-800 text-slate-300 border-slate-700',
          border: 'border-slate-800 bg-slate-950/40',
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
          label: 'INFO',
        };
    }
  };

  return (
    <div
      id="active-alerts-section"
      className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-slate-800/90 shadow-sm h-[513.875px] flex flex-col"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-800/80 shrink-0">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <h2 className="text-sm font-bold text-slate-100 uppercase font-mono tracking-wider">
              Active SCADA Alarms & Event Log
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time threshold deviations and hydrophone acoustic telemetry alarms
          </p>
        </div>

        {/* Severity Filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-950/80 rounded-lg border border-slate-800 text-xs font-mono shrink-0">
          <Filter className="w-3 h-3 text-slate-400 ml-1.5 mr-0.5" />
          <button
            onClick={() => setFilterSeverity('all')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              filterSeverity === 'all'
                ? 'bg-cyan-500 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All ({alerts.length})
          </button>
          <button
            onClick={() => setFilterSeverity('warning')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              filterSeverity === 'warning'
                ? 'bg-amber-500 text-slate-950 font-bold'
                : 'text-amber-400/80 hover:text-amber-300'
            }`}
          >
            Warnings
          </button>
          <button
            onClick={() => setFilterSeverity('advisory')}
            className={`px-2 py-0.5 rounded text-[11px] ${
              filterSeverity === 'advisory'
                ? 'bg-sky-500 text-slate-950 font-bold'
                : 'text-sky-400/80 hover:text-sky-300'
            }`}
          >
            Advisory
          </button>
        </div>
      </div>

      {/* Alerts Feed with Scroll Bar */}
      <div className="mt-4 space-y-3 flex-1 overflow-y-auto min-h-0 pr-1.5 custom-scrollbar">
        {filteredAlerts.length === 0 ? (
          <div className="py-8 text-center text-slate-400 text-xs font-mono bg-slate-950/40 rounded-lg border border-slate-800/60 flex flex-col items-center gap-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-400" />
            <span>No alarm conditions matching selected filter.</span>
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const style = getSeverityStyle(alert.severity);
            const isResolved = alert.status === 'resolved';
            const isAcked = alert.status === 'acknowledged';

            return (
              <div
                key={alert.id}
                id={`alert-card-${alert.id}`}
                className={`p-4 rounded-xl border transition-all ${style.border} ${
                  isResolved ? 'opacity-60 bg-slate-950/20' : 'hover:border-slate-700'
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3">
                  {/* Left info */}
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0 mt-0.5">
                      {style.icon}
                    </div>

                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                        <span className={`px-2 py-0.5 rounded font-bold uppercase border ${style.badge}`}>
                          {style.label}
                        </span>

                        <span className="font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                          Node: {alert.node}
                        </span>

                        <span className="text-slate-400 text-[11px] flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" />
                          {alert.timeAgo}
                        </span>

                        {isResolved ? (
                          <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/80 px-1.5 py-0.2 rounded border border-emerald-800">
                            RESOLVED
                          </span>
                        ) : isAcked ? (
                          <span className="text-[10px] font-semibold text-sky-400 bg-sky-950/80 px-1.5 py-0.2 rounded border border-sky-800">
                            ACKNOWLEDGED
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-1.5 py-0.2 rounded border border-amber-800 animate-pulse">
                            ACTIVE UNRESOLVED
                          </span>
                        )}
                      </div>

                      <h4 className="text-sm font-semibold text-slate-100 mt-1">
                        {alert.title}
                      </h4>

                      <p className="text-xs text-slate-300 font-sans leading-relaxed">
                        {alert.description}
                      </p>

                      {/* Technical Metrics context */}
                      {alert.observedValue && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] font-mono text-slate-400 pt-1">
                          <div className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                            <span className="text-slate-400">Observed: </span>
                            <span className="text-amber-300 font-bold">{alert.observedValue}</span>
                          </div>
                          <div className="bg-slate-900/90 px-2 py-0.5 rounded border border-slate-800">
                            <span className="text-slate-400">Limit: </span>
                            <span className="text-slate-300">{alert.thresholdValue}</span>
                          </div>
                          {alert.acknowledgedBy && (
                            <span className="text-[10px] text-sky-400">
                              By: {alert.acknowledgedBy}
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Actions */}
                  <div className="flex items-center gap-2 self-end md:self-center shrink-0 font-mono text-xs pt-2 md:pt-0">
                    {!isResolved && !isAcked && (
                      <button
                        onClick={() => handleAcknowledge(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
                      >
                        <Check className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Acknowledge</span>
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        onClick={() => handleResolve(alert.id)}
                        className="px-3 py-1.5 rounded-lg bg-emerald-950 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 transition-colors flex items-center gap-1.5"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Resolve</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
