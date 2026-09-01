import React from 'react';
import { RiskAssessment } from '../types';
import {
  ShieldCheck,
  AlertTriangle,
  HelpCircle,
  CheckCircle2,
  TrendingDown,
  Info,
  Layers,
} from 'lucide-react';

interface RiskOverviewSectionProps {
  assessment: RiskAssessment;
}

export const RiskOverviewSection: React.FC<RiskOverviewSectionProps> = ({
  assessment,
}) => {
  // Score calculations (28 / 100)
  const score = assessment.score;
  const strokeDashoffset = 283 - (283 * score) / 100;

  return (
    <div
      id="risk-overview-card"
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-4 sm:p-5 shadow-sm backdrop-blur-sm h-auto lg:h-[513.875px] min-h-[480px] flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Network Contamination Risk Overview
            </h2>
            <p className="text-xs text-slate-400">
              Multi-parameter Bayesian risk engine aggregating 7 telemetry node vectors
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time Risk Matrix v2.4</span>
        </div>
      </div>

      {/* Main Content Grid: Big Radial Score + Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left: Prominent Circular Risk Score Display */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-5 bg-slate-950/70 border border-slate-800/80 rounded-xl relative overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute inset-0 bg-emerald-500/5 blur-2xl pointer-events-none" />

          <div className="relative w-40 h-40 flex items-center justify-center">
            {/* SVG Circular Meter */}
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              {/* Background circle track */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-slate-800"
                strokeWidth="8"
                fill="transparent"
              />
              {/* Progress stroke */}
              <circle
                cx="50"
                cy="50"
                r="42"
                className="stroke-emerald-400 transition-all duration-1000 ease-out"
                strokeWidth="8"
                strokeDasharray="264"
                strokeDashoffset={264 - (264 * score) / 100}
                strokeLinecap="round"
                fill="transparent"
              />
            </svg>

            {/* Centered Score Readout */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-black font-mono tracking-tight text-white">
                {score}
              </span>
              <span className="text-[11px] font-mono font-medium text-slate-400">
                / {assessment.maxScore}
              </span>
              <span className="mt-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                {assessment.level}
              </span>
            </div>
          </div>

          <div className="mt-3 text-center">
            <h4 className="text-xs font-bold text-slate-200">System Safety Confidence</h4>
            <div className="flex items-center justify-center gap-1 text-[11px] text-emerald-400 mt-0.5">
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Risk down 4.2% over past 24h</span>
            </div>
          </div>
        </div>

        {/* Right: Explanation & Category Vector Breakdown */}
        <div className="lg:col-span-8 space-y-4">
          <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80">
            <div className="text-xs font-semibold text-emerald-300 flex items-center gap-1.5 mb-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              {assessment.headline}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {assessment.shortExplanation}
            </p>
          </div>

          {/* 4 Vector Progress Breakdown */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {assessment.breakdown.map((item, idx) => {
              const isModerate = item.status === 'moderate';
              return (
                <div
                  key={idx}
                  className="p-3 bg-slate-950/40 rounded-lg border border-slate-800/60 flex flex-col justify-between"
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-semibold text-slate-300 truncate pr-2">
                      {item.category}
                    </span>
                    <span
                      className={`font-mono text-xs font-bold ${
                        isModerate ? 'text-amber-400' : 'text-emerald-400'
                      }`}
                    >
                      {item.score}%
                    </span>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1.5">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isModerate ? 'bg-amber-400' : 'bg-emerald-400'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Actionable Engineering Advisory */}
          <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs border-t border-slate-800/60 text-slate-400">
            <div className="flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
              <span>
                Protocol Advisory: <strong>Acoustic localization running at TALA-02</strong>.
              </span>
            </div>
            <span className="font-mono text-[10px] text-slate-400">
              Evaluated: {assessment.lastCalculated}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
