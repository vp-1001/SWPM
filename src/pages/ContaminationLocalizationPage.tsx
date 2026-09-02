import React from 'react';
import { MonitoringNode } from '../types';
import { NetworkHealthSection } from '../components/NetworkHealthSection';
import {
  Crosshair,
  MapPin,
  ShieldAlert,
  Layers,
  Activity,
  ArrowRight,
  Droplets,
  AlertOctagon,
} from 'lucide-react';

interface ContaminationLocalizationPageProps {
  nodes: MonitoringNode[];
  onSelectNode?: (node: MonitoringNode) => void;
}

export const ContaminationLocalizationPage: React.FC<ContaminationLocalizationPageProps> = ({
  nodes,
}) => {
  return (
    <div id="contamination-localization-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-950/60 via-slate-900 to-slate-950 border border-amber-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-inner">
            <Crosshair className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Contamination Vector Localization & Ingress Triangulation
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                INVERSE SOLVER ACTIVE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Hydraulic advection-dispersion inverse tracing to isolate pollutant entry points across pipeline mains
            </p>
          </div>
        </div>
      </div>

      {/* Contamination Triangulation Diagnostic Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Active Hydraulic Ingress Triangulation Vector
              </h2>
              <p className="text-xs text-slate-400">
                Cross-correlating downstream transient signals against upstream baseline sensors
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
            CONFIDENCE: 94.2%
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Suspected Segment</div>
            <div className="text-base font-bold text-amber-300 font-mono mt-0.5">
              Palta &rarr; Dum Dum Trunk Main
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Pipe Chainage KM 4.200 to 5.800 (1200mm MS)
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Contaminant Class</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              Particulate Silt & Organic Turbidity
            </div>
            <div className="text-[11px] text-amber-400 font-mono mt-1">
              Gradient Surge &Delta;NTU +4.6 over 18 min
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Isolation Command</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              Valve ISV-04 Standby
            </div>
            <div className="text-[11px] text-emerald-300 font-mono mt-1">
              Automatic downstream bypass ready
            </div>
          </div>
        </div>
      </div>

      {/* Network Health & Node Telemetry Section */}
      <section aria-label="Network Health & Monitoring Nodes">
        <NetworkHealthSection nodes={nodes} />
      </section>
    </div>
  );
};
