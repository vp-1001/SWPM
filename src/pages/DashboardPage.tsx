import React from 'react';
import {
  AlertItem,
  KPISummary,
  MonitoringNode,
  NavigationPageId,
  RiskAssessment,
  TimeRange,
  TimeSeriesDataPoint,
} from '../types';
import { KPICardsGrid } from '../components/KPICardsGrid';
import { WaterQualityTrendsChart } from '../components/WaterQualityTrendsChart';
import { NetworkHealthSection } from '../components/NetworkHealthSection';
import { ActiveAlertsSection } from '../components/ActiveAlertsSection';
import { RiskOverviewSection } from '../components/RiskOverviewSection';
import {
  Sparkles,
  ShieldCheck,
  Droplets,
  Radio,
} from 'lucide-react';

interface DashboardPageProps {
  kpis: KPISummary;
  nodes: MonitoringNode[];
  alerts: AlertItem[];
  riskAssessment: RiskAssessment;
  trendData: TimeSeriesDataPoint[];
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
  onRefreshTelemetry: () => void;
  onAcknowledgeAlert: (id: string) => void;
  onNavigate: (page: NavigationPageId) => void;
  theme?: 'dark' | 'light';
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  kpis,
  nodes,
  alerts,
  riskAssessment,
  trendData,
  selectedRange,
  onRangeChange,
  onRefreshTelemetry,
  onAcknowledgeAlert,
  onNavigate,
  theme = 'dark',
}) => {
  return (
    <div id="dashboard-main-view" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* 1. Dashboard Sub-Banner / Live Telemetry Ingest Info */}
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
            id="banner-btn-bis"
            onClick={() => onNavigate('bis-compliance')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            BIS IS 10500 Audit
          </button>
        </div>
      </div>

      {/* 2. KPI Cards Grid (7 Cards) */}
      <section aria-label="Key Performance Indicators">
        <KPICardsGrid
          kpis={kpis}
          onNavigateToAlerts={() => onNavigate('alerts')}
          onNavigateToNodes={() => onNavigate('network-map')}
        />
      </section>

      {/* 3. Water Quality Trends Multi-Line Chart (Responsive 24H / 7D / 30D) */}
      <section aria-label="Water Quality Trends Chart">
        <WaterQualityTrendsChart
          data={trendData}
          selectedRange={selectedRange}
          onRangeChange={onRangeChange}
          onRefresh={onRefreshTelemetry}
          theme={theme}
        />
      </section>

      {/* 4. Risk Overview & Active Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        {/* Risk Overview Score (28 / 100 — LOW RISK) */}
        <div className="lg:col-span-7 flex flex-col">
          <RiskOverviewSection assessment={riskAssessment} />
        </div>

        {/* Active Alerts Panel */}
        <div className="lg:col-span-5 flex flex-col">
          <ActiveAlertsSection
            alerts={alerts}
            onAcknowledgeAlert={onAcknowledgeAlert}
            onNavigateToFullAlerts={() => onNavigate('alerts')}
          />
        </div>
      </div>

      {/* 5. Network Health Table & Node Telemetry */}
      <section aria-label="Network Health & Monitoring Nodes">
        <NetworkHealthSection nodes={nodes} />
      </section>
    </div>
  );
};
