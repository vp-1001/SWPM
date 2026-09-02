import React, { useState } from 'react';
import { RiskAssessment } from '../types';
import { RiskOverviewSection } from '../components/RiskOverviewSection';
import {
  FileText,
  Download,
  FileSpreadsheet,
  CheckCircle2,
  Calendar,
  Building,
  ShieldCheck,
  Printer,
  Sparkles,
} from 'lucide-react';

interface ReportsPageProps {
  assessment: RiskAssessment;
}

export const ReportsPage: React.FC<ReportsPageProps> = ({ assessment }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'compliance'>('daily');
  const [downloadSuccess, setDownloadSuccess] = useState<string | null>(null);

  const handleExport = (format: string) => {
    setDownloadSuccess(`Generated ${reportType.toUpperCase()} Water Quality Report (${format.toUpperCase()})`);
    setTimeout(() => setDownloadSuccess(null), 3500);
  };

  return (
    <div id="reports-page" className="space-y-6 max-w-7xl mx-auto pb-8">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-slate-950 border border-teal-500/30 shadow-lg">
        <div className="flex items-center gap-3.5">
          <div className="p-3 rounded-xl bg-teal-500/10 text-teal-400 border border-teal-500/30 shadow-inner">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-white tracking-tight">
                Municipal Water Quality & Compliance Reports
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 border border-teal-500/40">
                AUDIT SUITE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Automated executive bulletins, statutory potability summaries & environmental regulatory dossiers
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleExport('csv')}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
            Export CSV
          </button>
          <button
            onClick={() => handleExport('pdf')}
            className="px-3 py-1.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            Export Audit PDF
          </button>
        </div>
      </div>

      {downloadSuccess && (
        <div className="p-3.5 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{downloadSuccess} — saved to local municipal ledger archive.</span>
        </div>
      )}

      {/* 1. Network Contamination Risk Overview Section */}
      <section aria-label="Network Contamination Risk Overview" className="w-full">
        <RiskOverviewSection assessment={assessment} />
      </section>

      {/* 2. Municipal Sign-Off & Regulatory Audit Summary Card */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 shadow-md space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-white">
                Statutory Potability & Regulatory Sign-Off
              </h2>
              <p className="text-xs text-slate-400">
                Audited against Municipal Water Safety Protocol & Public Health Engineering Directorate (PHED)
              </p>
            </div>
          </div>
          <span className="text-xs font-mono text-slate-400">Ledger Hash: #0x7F9B...2E41</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-mono">
          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Supervising Engineer</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">Er. K. Sen, M.E. (Env)</div>
            <div className="text-emerald-400 text-[10px] mt-1">Digital Signature Verified (L3)</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Audit Jurisdiction</div>
            <div className="text-sm font-bold text-slate-200 mt-0.5">Kolkata Municipal Corp.</div>
            <div className="text-slate-400 text-[10px] mt-1">Boroughs I to VII Transmission</div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800">
            <div className="text-slate-400 text-[10px] uppercase">Compliance Status</div>
            <div className="text-sm font-bold text-emerald-400 mt-0.5">APPROVED FOR SUPPLY</div>
            <div className="text-slate-400 text-[10px] mt-1">Water Safety Plan (WSP) Tier-1</div>
          </div>
        </div>
      </div>
    </div>
  );
};
