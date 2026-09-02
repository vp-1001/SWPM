import React from 'react';
import { MonitoringNode } from '../types';
import { NetworkHealthSection } from '../components/NetworkHealthSection';
import {
  RadioTower,
  Activity,
  Waves,
  Zap,
  Layers,
  SearchCode,
  ShieldCheck,
} from 'lucide-react';

interface AdvancedDetectionPageProps {
  nodes: MonitoringNode[];
  onSelectNode?: (node: MonitoringNode) => void;
}

export const AdvancedDetectionPage: React.FC<AdvancedDetectionPageProps> = ({
  nodes,
}) => {
  return (
    <div id="advanced-detection-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-purple-950/60 via-slate-900 to-slate-950 border border-purple-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 shadow-inner">
            <RadioTower className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Advanced Hydro-Acoustic & Transient Wave Detection
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-purple-500/20 text-purple-300 border border-purple-500/40">
                PIEZO-HYDROPHONE ARRAY
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              High-frequency acoustic leak noise correlation, Fourier transform spectral analysis & micro-cavitation detection
            </p>
          </div>
        </div>
      </div>

      {/* Advanced Waveform Diagnostics Diagnostic Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Waves className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Hydro-Acoustic Frequency & Transient Wave Speed Matrix
              </h2>
              <p className="text-xs text-slate-400">
                Wave propagation velocity: 1,120 m/s across ductile iron & mild steel transmission pipelines
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            NO PIPE BURSTS DETECTED
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Acoustic Leak Correlation</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              0.02 bar RMS Noise Floor
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Below 50 Hz – 2.5 kHz micro-fracture threshold
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Transient Surge Velocity</div>
            <div className="text-base font-bold text-white font-mono mt-0.5">
              1.42 m/s Hydrodynamic Flow
            </div>
            <div className="text-[11px] text-cyan-300 font-mono mt-1">
              Laminar boundary layer preserved
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Water Hammer Protection</div>
            <div className="text-base font-bold text-emerald-400 font-mono mt-0.5">
              Air-Surge Vessel Online
            </div>
            <div className="text-[11px] text-slate-400 font-mono mt-1">
              Pressure relief dampening 98.6%
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
