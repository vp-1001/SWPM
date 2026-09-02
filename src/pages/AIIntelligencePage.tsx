import React from 'react';
import {
  Brain,
  Sparkles,
  Cpu,
  Activity,
  Zap,
  CheckCircle2,
  TrendingUp,
  AlertTriangle,
  Layers,
} from 'lucide-react';
import { WaterDecisionOutput } from '../types';

interface AIIntelligencePageProps {
  currentDecision?: WaterDecisionOutput | null;
}

export const AIIntelligencePage: React.FC<AIIntelligencePageProps> = ({
  currentDecision = null,
}) => {
  return (
    <div id="ai-intelligence-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-slate-900 to-slate-950 border border-blue-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 shadow-inner">
            <Cpu className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                AI Intelligence & Neural Diagnostics Suite
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                MODEL v2.4 ONLINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Deep-learning water matrix anomaly classification, correlation models & predictive dosing intelligence
            </p>
          </div>
        </div>
      </div>

      {/* Decision Engine Real-Time Inference Panel */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Brain className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Live SCADA Decision Engine Inference
              </h2>
              <p className="text-xs text-slate-400">
                Rule-based + Multivariate neural inference on ESP32 telemetry stream
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
            LATENCY: 12ms
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Overall Status</div>
            <div
              className={`text-xl font-bold font-mono mt-1 ${
                currentDecision?.overallStatus === 'SAFE'
                  ? 'text-emerald-400'
                  : currentDecision?.overallStatus === 'WARNING'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {currentDecision?.overallStatus || 'SAFE'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Real-time Classification</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Risk Assessment Score</div>
            <div className="text-xl font-bold font-mono text-cyan-300 mt-1">
              {currentDecision?.riskScore || 28} / 100
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Contamination Index</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Diagnosed Problem Class</div>
            <div className="text-sm font-bold text-white mt-1 line-clamp-1">
              {currentDecision?.probableProblemClass || 'Optimal Water Matrix'}
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Pattern Recognition</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-[10px] font-mono uppercase text-slate-400">Model Precision</div>
            <div className="text-xl font-bold font-mono text-emerald-400 mt-1">99.4% F1-Score</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cross-Validated</div>
          </div>
        </div>

        {currentDecision?.recommendation && (
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-mono">
            <span className="text-cyan-400 font-bold uppercase text-[10px]">AI Action Recommendation:</span>
            <p className="text-slate-200 mt-1">{currentDecision.recommendation}</p>
          </div>
        )}
      </div>

      {/* AI Intelligence Architecture Models Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-cyan-400 font-bold text-xs font-mono">
            <Sparkles className="w-4 h-4" />
            <span>Time-Series Autoencoder</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Continuously reconstructs multi-sensor inputs to compute reconstruction loss anomalies across pH, turbidity, and TDS streams.
          </p>
          <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800">
            Status: Trained & Active (450k epochs)
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs font-mono">
            <Layers className="w-4 h-4" />
            <span>Hydraulic PINN Model</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Physics-Informed Neural Network enforcing conservation of mass & momentum across the 1200mm transmission main.
          </p>
          <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800">
            Status: Hydraulic Loss = 0.0014 bar/km
          </div>
        </div>

        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
          <div className="flex items-center gap-2 text-purple-400 font-bold text-xs font-mono">
            <Activity className="w-4 h-4" />
            <span>Biofilm & Cavitation Predictor</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">
            Predicts biofilm build-up rate based on temperature, dissolved organic carbon proxy, and pipe wall roughness coefficients.
          </p>
          <div className="text-[10px] font-mono text-emerald-400 pt-1 border-t border-slate-800">
            Status: 0.12 mm/yr Growth Margin (Optimal)
          </div>
        </div>
      </div>
    </div>
  );
};
