import React, { useState } from 'react';
import {
  TimeSeriesDataPoint,
  TimeRange,
  AnomalyRecord,
  WaterDecisionOutput,
} from '../types';
import { WaterQualityTrendsChart } from '../components/WaterQualityTrendsChart';
import {
  BarChart3,
  AlertTriangle,
  TrendingUp,
  Activity,
  CheckCircle2,
  Clock,
  Filter,
  RefreshCw,
  Search,
  ShieldAlert,
  Zap,
} from 'lucide-react';

interface AnalyticsPageProps {
  trendData: TimeSeriesDataPoint[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onRefresh: () => void;
  currentDecision?: WaterDecisionOutput | null;
  theme?: 'dark' | 'light';
}

// Default historical anomaly records for tracking
const DEFAULT_ANOMALY_RECORDS: AnomalyRecord[] = [
  {
    id: 'ANOM-2026-0891',
    timestamp: '10:42:15',
    deviceId: 'ESP32_NODE_01 (Palta Intake)',
    parameter: 'turbidity',
    previousValue: 2.1,
    currentValue: 8.4,
    severity: 'critical',
    probableCause: 'Monsoonal silt surge or stormwater runoff ingress near raw intake channel',
    recommendation: 'Increase polyaluminium chloride (PAC) coagulant dosing by 18 ppm; throttle intake gate 2',
  },
  {
    id: 'ANOM-2026-0885',
    timestamp: '08:15:30',
    deviceId: 'ESP32_NODE_03 (Dum Dum Transmission)',
    parameter: 'ph',
    previousValue: 7.4,
    currentValue: 6.1,
    severity: 'warning',
    probableCause: 'Acidic industrial effluent seepage or localized pipe wall leaching',
    recommendation: 'Inject lime slurry buffer at node 3 dosing station; test upstream ground water samples',
  },
  {
    id: 'ANOM-2026-0872',
    timestamp: '04:30:10',
    deviceId: 'ESP32_NODE_02 (Clarification Unit)',
    parameter: 'tds',
    previousValue: 240,
    currentValue: 680,
    severity: 'critical',
    probableCause: 'Saline intrusion surge / tidal backflow into untreated raw intake sump',
    recommendation: 'Activate secondary sedimentation basin filter; divert flow to equalization pond',
  },
  {
    id: 'ANOM-2026-0860',
    timestamp: 'Yesterday 22:10',
    deviceId: 'ESP32_NODE_06 (Sector V)',
    parameter: 'temperature',
    previousValue: 24.5,
    currentValue: 31.2,
    severity: 'warning',
    probableCause: 'Thermal discharge from adjacent cooling loop or shallow pipe exposure',
    recommendation: 'Verify insulation jacket at road crossing; check flow velocity',
  },
];

export const AnalyticsPage: React.FC<AnalyticsPageProps> = ({
  trendData,
  selectedRange,
  onRangeChange,
  onRefresh,
  currentDecision,
  theme = 'dark',
}) => {
  const [anomalyFilter, setAnomalyFilter] = useState<'all' | 'critical' | 'warning'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine live decision anomalies with historical records
  const allAnomalies: AnomalyRecord[] = [
    ...(currentDecision?.anomalies || []),
    ...DEFAULT_ANOMALY_RECORDS,
  ];

  const filteredAnomalies = allAnomalies.filter((anom) => {
    if (anomalyFilter !== 'all' && anom.severity !== anomalyFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        anom.parameter.toLowerCase().includes(q) ||
        anom.deviceId.toLowerCase().includes(q) ||
        anom.probableCause.toLowerCase().includes(q) ||
        anom.recommendation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const criticalCount = allAnomalies.filter((a) => a.severity === 'critical').length;
  const warningCount = allAnomalies.filter((a) => a.severity === 'warning').length;

  return (
    <div id="analytics-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-sky-950/60 via-slate-900 to-slate-950 border border-sky-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/30 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Quality Trends & Predictive Anomaly Analytics
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-sky-500/20 text-sky-300 border border-sky-500/40">
                SCADA TELEMETRY LOGS
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Multi-parameter trend analysis, historical excursion rates & automated root-cause tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onRefresh}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Refresh Analytics Data
          </button>
        </div>
      </div>

      {/* 1. Water Quality Trends Multi-Line Chart */}
      <section aria-label="Water Quality Trends Chart">
        <WaterQualityTrendsChart
          data={trendData}
          selectedRange={selectedRange}
          onRangeChange={onRangeChange}
          onRefresh={onRefresh}
          theme={theme}
        />
      </section>

      {/* 2. Anomaly Tracking Section */}
      <section id="anomaly-tracking-section" aria-label="Anomaly Tracking & Diagnosis" className="space-y-4">
        {/* Anomaly Overview Metrics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Total Anomalies Logged</div>
              <div className="text-2xl font-bold font-mono text-white mt-0.5">{allAnomalies.length}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-0.5">Rolling 48H Ingest</div>
            </div>
            <div className="p-3 rounded-xl bg-slate-800 text-slate-300 border border-slate-700">
              <Activity className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Critical Excursions</div>
              <div className="text-2xl font-bold font-mono text-rose-400 mt-0.5">{criticalCount}</div>
              <div className="text-[10px] text-rose-400 font-mono mt-0.5">Threshold Violations</div>
            </div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Warning Deviations</div>
              <div className="text-2xl font-bold font-mono text-amber-400 mt-0.5">{warningCount}</div>
              <div className="text-[10px] text-amber-400 font-mono mt-0.5">Advisory Bounds</div>
            </div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <div className="text-[11px] font-mono text-slate-400 uppercase">Detection Accuracy</div>
              <div className="text-2xl font-bold font-mono text-emerald-400 mt-0.5">99.4%</div>
              <div className="text-[10px] text-emerald-400 font-mono mt-0.5">Decision Engine Rules</div>
            </div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Anomaly Tracking Records Table Card */}
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-base font-bold text-white tracking-tight">
                  Anomaly Tracking & Root-Cause Matrix
                </h2>
                <p className="text-xs text-slate-400">
                  Automated telemetry anomaly detection with physics-informed diagnosis and chemical mitigation actions
                </p>
              </div>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search cause or device..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8 pr-3 py-1 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-cyan-500/50 w-48"
                />
              </div>

              <div className="inline-flex p-1 bg-slate-950 border border-slate-800 rounded-lg text-xs">
                <button
                  onClick={() => setAnomalyFilter('all')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    anomalyFilter === 'all'
                      ? 'bg-slate-800 text-white font-semibold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  All ({allAnomalies.length})
                </button>
                <button
                  onClick={() => setAnomalyFilter('critical')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    anomalyFilter === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 font-semibold'
                      : 'text-slate-400 hover:text-rose-400'
                  }`}
                >
                  Critical ({criticalCount})
                </button>
                <button
                  onClick={() => setAnomalyFilter('warning')}
                  className={`px-2.5 py-1 rounded-md transition-all ${
                    anomalyFilter === 'warning'
                      ? 'bg-amber-500/20 text-amber-300 font-semibold'
                      : 'text-slate-400 hover:text-amber-400'
                  }`}
                >
                  Warning ({warningCount})
                </button>
              </div>
            </div>
          </div>

          {/* Anomaly Feed Items */}
          <div className="space-y-3">
            {filteredAnomalies.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400 font-mono">
                No anomalies matching current filter criteria.
              </div>
            ) : (
              filteredAnomalies.map((anom, idx) => (
                <div
                  key={anom.id || idx}
                  className={`p-4 rounded-xl border transition-all ${
                    anom.severity === 'critical'
                      ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                      : 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-800/60">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 text-[10px] font-mono font-bold rounded uppercase ${
                          anom.severity === 'critical'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        {anom.severity} ANOMALY
                      </span>
                      <span className="font-mono font-bold text-xs text-white uppercase">
                        {anom.parameter} Excursion
                      </span>
                      <span className="text-slate-400 font-mono text-xs">·</span>
                      <span className="text-xs font-mono text-cyan-300">{anom.deviceId}</span>
                    </div>

                    <div className="flex items-center gap-3 font-mono text-xs">
                      <span className="text-slate-400">
                        Baseline: <strong className="text-slate-200">{anom.previousValue}</strong> &rarr; Spike:{' '}
                        <strong className={anom.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}>
                          {anom.currentValue}
                        </strong>
                      </span>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {anom.timestamp}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] font-mono uppercase text-slate-400 mb-1">
                        Probable Root Cause
                      </div>
                      <p className="text-slate-300 leading-relaxed">{anom.probableCause}</p>
                    </div>

                    <div className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800">
                      <div className="text-[10px] font-mono uppercase text-cyan-400 mb-1">
                        Recommended Corrective Action
                      </div>
                      <p className="text-cyan-200 font-mono leading-relaxed">{anom.recommendation}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
