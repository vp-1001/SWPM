import React from 'react';
import {
  KPISummary,
  NavigationPageId,
  WaterDecisionOutput,
} from '../types';
import { KPICardsGrid } from '../components/KPICardsGrid';
import { HardwareControlPanel } from '../components/HardwareControlPanel';
import {
  Sparkles,
  Droplets,
  AlertTriangle,
  Activity,
  Radio,
  Zap,
  Gauge,
  Waves,
  RefreshCw,
} from 'lucide-react';

interface LiveMonitoringPageProps {
  kpis: KPISummary;
  currentDecision?: WaterDecisionOutput | null;
  onNavigate: (page: NavigationPageId) => void;
  onRefreshTelemetry: () => void;
}

export const LiveMonitoringPage: React.FC<LiveMonitoringPageProps> = ({
  kpis,
  currentDecision = null,
  onNavigate,
  onRefreshTelemetry,
}) => {
  return (
    <div id="live-monitoring-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Live Monitoring Section Title Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-inner">
            <Activity className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Live SCADA Telemetry & Stream Matrix
              </h1>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                HIGH-SPEED STREAM (10 Hz)
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Continuous multi-sensor ingestion · Electrochemical, Optical Turbidity & Hydrodynamic Transducers
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="live-refresh-btn"
            onClick={onRefreshTelemetry}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            Sync Hardware Ingest
          </button>
        </div>
      </div>

      {/* 1. Hardware Connection & Controller Panel */}
      <section aria-label="ESP32 Hardware Control & Simulation">
        <HardwareControlPanel currentDecision={currentDecision} />
      </section>

      {/* 2. Decision Engine Treatment Recommendation Banner (if active anomaly) */}
      {currentDecision && currentDecision.overallStatus !== 'SAFE' && (
        <div
          id="water-decision-recommendation-card"
          className="p-5 rounded-2xl bg-gradient-to-r from-amber-950/90 via-slate-900 to-slate-950 border border-amber-500/50 shadow-xl space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Decision Engine Alert: {currentDecision.overallStatus} QUALITY DETECTED
                </span>
                <h3 className="text-base font-bold text-white">
                  {currentDecision.probableProblemClass}
                </h3>
              </div>
            </div>
            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
              Risk Score: {currentDecision.riskScore}/100
            </span>
          </div>

          <p className="text-xs text-slate-300 font-mono leading-relaxed">
            {currentDecision.recommendation}
          </p>

          {currentDecision.treatmentSteps && currentDecision.treatmentSteps.length > 0 && (
            <div className="pt-2 border-t border-amber-500/20 grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentDecision.treatmentSteps.map((step, idx) => (
                <div
                  key={idx}
                  className="px-3 py-1.5 rounded-lg bg-slate-950/60 border border-amber-500/20 text-[11px] font-mono text-amber-200 flex items-center gap-2"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{step}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. Municipal Water Transmission Telemetry Overview Banner */}
      <div
        id="dashboard-telemetry-banner"
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-950 border border-slate-800/80 shadow-md transition-colors"
      >
        <div className="flex items-center gap-3.5">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Droplets className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-bold text-white tracking-tight ledger-heading">
                Municipal Water Transmission Telemetry Overview
              </h2>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Ingest Active
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Monitoring 7 Primary Nodes · Intake at Palta WTP to Tala Reservoir Distribution Mains
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            id="banner-btn-contamination"
            onClick={() => onNavigate('contamination-localization')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            Contamination AI
          </button>
          <button
            id="banner-btn-analytics"
            onClick={() => onNavigate('analytics')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Activity className="w-3.5 h-3.5" />
            Quality Analytics
          </button>
        </div>
      </div>

      {/* 4. KPI Cards Grid (All 7 Cards Above Pipeline Topology) */}
      <section aria-label="Key Performance Indicators">
        <KPICardsGrid
          kpis={kpis}
          onNavigateToAlerts={() => onNavigate('alerts')}
          onNavigateToNodes={() => onNavigate('network-map')}
        />
      </section>

      {/* 5. Live Stream Telemetry Matrix & Sampling Diagnostics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Sampling Rate</div>
            <div className="text-base font-bold text-white font-mono">10 Samples/Sec</div>
            <div className="text-[10px] text-emerald-400 font-mono">Sub-second Latency &lt;45ms</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Stream Protocol</div>
            <div className="text-base font-bold text-white font-mono">WebSocket / JSON Stream</div>
            <div className="text-[10px] text-emerald-400 font-mono">Encrypted Dual-Channel Ingest</div>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-3.5">
          <div className="p-3 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
            <Waves className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-mono uppercase text-slate-400">Signal Integrity</div>
            <div className="text-base font-bold text-white font-mono">99.98% Confidence</div>
            <div className="text-[10px] text-cyan-400 font-mono">Active Kalman Filter Smoothing</div>
          </div>
        </div>
      </div>
    </div>
  );
};
