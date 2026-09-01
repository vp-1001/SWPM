import React from 'react';
import {
  Activity,
  MapPin,
  TrendingUp,
  Brain,
  Crosshair,
  ShieldCheck,
  BellRing,
  SearchCode,
  FileSpreadsheet,
  Cpu,
  ArrowRight,
  Sparkles,
  Construction,
} from 'lucide-react';
import { NavigationPageId } from '../types';

interface PlaceholderPageProps {
  pageId: NavigationPageId;
  onNavigateToDashboard?: () => void;
  onBackToDashboard?: () => void;
}

export const PlaceholderPage: React.FC<PlaceholderPageProps> = ({
  pageId,
  onNavigateToDashboard,
  onBackToDashboard,
}) => {
  const handleReturn = () => {
    if (onNavigateToDashboard) onNavigateToDashboard();
    else if (onBackToDashboard) onBackToDashboard();
  };
  const getPageDetails = (id: NavigationPageId) => {
    switch (id) {
      case 'live-monitoring':
        return {
          title: 'Live Monitoring Telemetry Grid',
          subtitle: 'Sub-second real-time streaming matrix for electrochemical sensors, hydrophones, and mass flow sensors.',
          icon: <Activity className="w-8 h-8 text-emerald-400" />,
          features: [
            'High-frequency 10 Hz raw ADC sensor streaming',
            'Spectroscopic UV-Vis absorption tracking',
            'Dissolved oxygen & oxidation reduction potential (ORP)',
            'Dynamic transient wave velocity monitoring',
          ],
          phase: 'Phase 2 Architecture',
        };
      case 'network-map':
        return {
          title: 'Geospatial Hydro-Pipeline Topology',
          subtitle: 'Interactive GIS pipeline network with topological nodes, hydraulic head loss, and valve control.',
          icon: <MapPin className="w-8 h-8 text-cyan-400" />,
          features: [
            'Vector GIS map layer with pipe diameters & material attributes',
            'Hydraulic pressure gradient contour visualization',
            'Isolation valve control and backflow containment zones',
            'Elevation profiling from Palta to Tala reservoirs',
          ],
          phase: 'Phase 2 Architecture',
        };
      case 'analytics':
        return {
          title: 'Predictive Quality & Historical Analytics',
          subtitle: 'Longitudinal trend decomposition, seasonal regression models, and consumption pattern tracking.',
          icon: <TrendingUp className="w-8 h-8 text-sky-400" />,
          features: [
            'Historical multi-month seasonal drift analysis',
            'Comparative diurnal consumption vs water quality curves',
            'Autoregressive integrated moving average (ARIMA) forecasting',
            'Automated CSV/Excel data export pipeline',
          ],
          phase: 'Phase 2 Architecture',
        };
      case 'ai-intelligence':
        return {
          title: 'AI Intelligence & Neural Diagnostics',
          subtitle: 'Deep learning anomaly detection models trained on water matrix signatures and multi-variate correlations.',
          icon: <Brain className="w-8 h-8 text-blue-400" />,
          features: [
            'Transformer-based multivariate time-series anomaly engine',
            'Automated false-alarm rejection via sensor correlation',
            'Biofilm growth probability scoring',
            'Predictive pump wear and pipeline cavitation detection',
          ],
          phase: 'Phase 3 Architecture',
        };
      case 'contamination-localization':
        return {
          title: 'Contamination Vector Localization',
          subtitle: 'Hydraulic inverse tracing algorithms to pinpoint pollution ingress coordinates along transmission mains.',
          icon: <Crosshair className="w-8 h-8 text-amber-400" />,
          features: [
            'Advection-dispersion equation inverse solvers',
            'Probabilistic contaminant source triangulation',
            'Downstream plume dispersion simulation',
            'Automatic emergency containment valve isolation commands',
          ],
          phase: 'Phase 3 Architecture',
        };
      case 'bis-compliance':
        return {
          title: 'BIS IS 10500:2012 Drinking Water Audit',
          subtitle: 'Statutory compliance validation engine mapped against Bureau of Indian Standards potability criteria.',
          icon: <ShieldCheck className="w-8 h-8 text-emerald-400" />,
          features: [
            'Automated BIS IS 10500:2012 parameter rule checking',
            'Desirable vs Permissible limit violation logs',
            'Government laboratory certificate generation',
            'Water Safety Plan (WSP) regulatory reporting',
          ],
          phase: 'Phase 3 Architecture',
        };
      case 'alerts':
        return {
          title: 'Alarm Dispatch & Incident Management Center',
          subtitle: 'Centralized SCADA alarm queue with escalation policies, SMS/email relays, and on-call engineer dispatch.',
          icon: <BellRing className="w-8 h-8 text-amber-400" />,
          features: [
            'Real-time multi-tier alarm escalation engine',
            'SOP-driven diagnostic workflows for field engineers',
            'Historical root-cause incident audit log',
            'Automated SMS/Email broadcast relays',
          ],
          phase: 'Operational Queue Linked in Dashboard',
        };
      case 'advanced-detection':
        return {
          title: 'Advanced Hydro-Acoustic & Spectral Detection',
          subtitle: 'High-frequency acoustic leak noise correlation and multi-wavelength optical fingerprinting.',
          icon: <SearchCode className="w-8 h-8 text-purple-400" />,
          features: [
            'Cross-correlation acoustic leak detection',
            'Fourier transform spectral power density analysis',
            'Turbidity scatter matrix at 860nm NIR',
            'Micro-leak detection before catastrophic pipe rupture',
          ],
          phase: 'Phase 4 Architecture',
        };
      case 'reports':
        return {
          title: 'Compliance & Municipal Reporting Suite',
          subtitle: 'Automated executive summaries, regulatory dossiers, and environmental footprint reports.',
          icon: <FileSpreadsheet className="w-8 h-8 text-teal-400" />,
          features: [
            'Automated daily/weekly municipal water quality bulletins',
            'Export to PDF, CSV, and secure cryptographic audit ledger',
            'EPA / CPCB / WBPCB standardized environmental reporting',
            'Custom report schedule generator',
          ],
          phase: 'Phase 4 Architecture',
        };
      case 'system-architecture':
        return {
          title: 'System Architecture & IoT Hardware Topology',
          subtitle: 'Hardware specifications, Modbus/MQTT brokers, edge microcontrollers, and edge security.',
          icon: <Cpu className="w-8 h-8 text-cyan-400" />,
          features: [
            'Edge microcontroller schematic & RS-485 Modbus topology',
            'MQTT / CoAP low-bandwidth telemetry protocol stack',
            'End-to-end TLS 1.3 cryptographic key rotation',
            'Solar power management & battery health telemetry',
          ],
          phase: 'Phase 4 Architecture',
        };
      default:
        return {
          title: 'System Module',
          subtitle: 'Module initialized in SCADA framework.',
          icon: <Construction className="w-8 h-8 text-slate-400" />,
          features: ['Configured in routing table', 'Ready for Phase rollout'],
          phase: 'Upcoming Phase',
        };
    }
  };

  const details = getPageDetails(pageId);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 shadow-inner shrink-0">
            {details.icon}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                {pageId.replace('-', ' ')}
              </span>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                {details.phase}
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-100 mt-1">{details.title}</h2>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">
              {details.subtitle}
            </p>
          </div>
        </div>

        {/* Feature roadmap cards */}
        <div className="mt-6 pt-5 border-t border-slate-800">
          <div className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Planned Engineering Specifications for this Module:</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {details.features.map((feat, i) => (
              <div
                key={i}
                className="p-3 rounded-lg bg-slate-950/70 border border-slate-800/80 text-xs font-mono text-slate-300 flex items-start gap-2.5"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shrink-0 mt-1.5"></span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Navigation Return */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Phase 1 Focus: Core Shell & Main SCADA Dashboard
          </span>
          <button
            id="return-to-dashboard-btn"
            onClick={handleReturn}
            className="px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-cyan-950/50 flex items-center gap-1.5 return-dashboard-btn"
          >
            <span>Return to Main Dashboard</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
