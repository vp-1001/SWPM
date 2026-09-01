import React from 'react';
import {
  Activity,
  Droplets,
  Gauge,
  Thermometer,
  ShieldCheck,
  AlertTriangle,
  Radio,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
} from 'lucide-react';
import { KPISummary } from '../types';
import { Sparkline } from './Sparkline';

interface KPICardsGridProps {
  kpis: KPISummary;
  onNavigateToAlerts?: () => void;
  onNavigateToNodes?: () => void;
}

export const KPICardsGrid: React.FC<KPICardsGridProps> = ({
  kpis,
  onNavigateToAlerts,
  onNavigateToNodes,
}) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3.5">
      {/* 1. Overall Water Quality (WQI) */}
      <div
        id="kpi-card-wqi"
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Water Quality
              </span>
              <div className="text-[10px] text-emerald-400 font-medium">Grade A Potable</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
            SIMULATED
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.overallWQI.displayValue}
            </span>
            <span className="text-xs font-medium text-slate-400">/ 100 WQI</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{kpis.overallWQI.trendPercentage}%</span>
            </div>
            <Sparkline
              data={kpis.overallWQI.historicalSparkline}
              color="#06b6d4"
              width={75}
              height={24}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>BIS Standard: {kpis.overallWQI.bisStandardLimit}</span>
          <span className="font-mono text-slate-400">{kpis.overallWQI.lastUpdated}</span>
        </div>
      </div>

      {/* 2. pH */}
      <div
        id="kpi-card-ph"
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-emerald-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                pH Level
              </span>
              <div className="text-[10px] text-emerald-400 font-medium">Optimal Band</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800/80">
            IS 10500
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.pH.displayValue}
            </span>
            <span className="text-xs font-medium text-slate-400">pH</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Minus className="w-3.5 h-3.5" />
              <span>Stable</span>
            </div>
            <Sparkline
              data={kpis.pH.historicalSparkline}
              color="#10b981"
              width={75}
              height={24}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Target: 6.5 – 8.5</span>
          <span className="font-mono text-slate-400">{kpis.pH.lastUpdated}</span>
        </div>
      </div>

      {/* 3. TDS */}
      <div
        id="kpi-card-tds"
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <Droplets className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                TDS
              </span>
              <div className="text-[10px] text-blue-400 font-medium">Desirable</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800/80">
            PPM
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.tds.displayValue}
            </span>
            <span className="text-xs font-medium text-slate-400">mg/L</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-emerald-400">
              <ArrowDownRight className="w-3.5 h-3.5" />
              <span>{kpis.tds.trendPercentage}%</span>
            </div>
            <Sparkline
              data={kpis.tds.historicalSparkline}
              color="#3b82f6"
              width={75}
              height={24}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Max Limit: 500</span>
          <span className="font-mono text-slate-400">{kpis.tds.lastUpdated}</span>
        </div>
      </div>

      {/* 4. Turbidity */}
      <div
        id="kpi-card-turbidity"
        className="relative overflow-hidden bg-slate-900/90 border border-amber-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between bg-gradient-to-b from-amber-500/5 to-transparent"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/30">
              <Gauge className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-amber-300">
                Turbidity
              </span>
              <div className="text-[10px] text-amber-400 font-medium">Node Warning</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
            ATTN
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.turbidity.displayValue}
            </span>
            <span className="text-xs font-medium text-slate-400">NTU</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-amber-400">
              <ArrowUpRight className="w-3.5 h-3.5" />
              <span>+{kpis.turbidity.trendPercentage}%</span>
            </div>
            <Sparkline
              data={kpis.turbidity.historicalSparkline}
              color="#f59e0b"
              width={75}
              height={24}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>BIS 10500: &le; 5.0</span>
          <span className="font-mono text-slate-400">{kpis.turbidity.lastUpdated}</span>
        </div>
      </div>

      {/* 5. Temperature */}
      <div
        id="kpi-card-temperature"
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-violet-500/40 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Thermometer className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400">
                Temperature
              </span>
              <div className="text-[10px] text-violet-400 font-medium">Ambient Normal</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-mono text-slate-400 bg-slate-800/80">
            CELSIUS
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.temperature.displayValue}
            </span>
            <span className="text-xs font-medium text-slate-400">°C</span>
          </div>

          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
              <Minus className="w-3.5 h-3.5" />
              <span>Stable</span>
            </div>
            <Sparkline
              data={kpis.temperature.historicalSparkline}
              color="#8b5cf6"
              width={75}
              height={24}
            />
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span>Nominal: 15 – 30°C</span>
          <span className="font-mono text-slate-400">{kpis.temperature.lastUpdated}</span>
        </div>
      </div>

      {/* 6. Active Alerts */}
      <div
        id="kpi-card-alerts"
        onClick={onNavigateToAlerts}
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-amber-500/60 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 group-hover:text-amber-300 transition-colors">
                Active Alerts
              </span>
              <div className="text-[10px] text-amber-400 font-medium">Action Required</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
            {kpis.activeAlerts.total}
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.activeAlerts.total}
            </span>
            <span className="text-xs font-medium text-slate-400">Events</span>
          </div>

          <div className="mt-2 text-[11px] text-amber-300/90 font-medium flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            <span id="kpi-alerts-warning-subtext" className="kpi-alert-subtext">
              1 Warning · 1 Advisory
            </span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="text-cyan-400 group-hover:underline">View alerts &rarr;</span>
          <span className="font-mono text-slate-400">{kpis.activeAlerts.lastUpdated}</span>
        </div>
      </div>

      {/* 7. Monitoring Nodes */}
      <div
        id="kpi-card-nodes"
        onClick={onNavigateToNodes}
        className="relative overflow-hidden bg-slate-900/90 border border-slate-800/80 hover:border-cyan-500/60 rounded-xl p-4 transition-all duration-200 shadow-sm flex flex-col justify-between cursor-pointer group"
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 group-hover:scale-105 transition-transform">
              <Radio className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-400 group-hover:text-cyan-300 transition-colors">
                Telemetry Nodes
              </span>
              <div className="text-[10px] text-cyan-400 font-medium">SCADA Grid</div>
            </div>
          </div>
          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            6/7 OK
          </span>
        </div>

        <div className="mt-3">
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {kpis.monitoringNodes.online}
            </span>
            <span className="text-xs font-medium text-slate-400">/ {kpis.monitoringNodes.total} Active</span>
          </div>

          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between">
            <span className="text-emerald-400 font-medium">85.7% Network Health</span>
            <span className="text-amber-400 text-[10px] font-mono">1 Degraded</span>
          </div>
        </div>

        <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
          <span className="text-cyan-400 group-hover:underline">Inspect topology &rarr;</span>
          <span className="font-mono text-slate-400">Live</span>
        </div>
      </div>
    </div>
  );
};
