import React, { useState } from 'react';
import {
  PipelineGraph,
  PipelineNode,
  SensorReadingsSnapshot,
  NodeTestResult,
} from '../types';
import {
  getDownstreamNodes,
  getUpstreamNodes,
  runNodeQualityTest,
  getReachableDestinations,
} from '../services/topologyService';
import {
  Activity,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  XCircle,
  Play,
  RotateCcw,
  Sliders,
  ShieldCheck,
  Radio,
  Droplets,
  Gauge,
  Thermometer,
  Zap,
  ArrowDownRight,
  ArrowUpLeft,
  X,
  Sparkles,
  Layers,
  MapPin,
} from 'lucide-react';

interface NodeDetailPanelProps {
  nodeId: string;
  graph: PipelineGraph;
  onUpdateGraph: (updatedGraph: PipelineGraph, testResult?: NodeTestResult) => void;
  onClose?: () => void;
}

export const NodeDetailPanel: React.FC<NodeDetailPanelProps> = ({
  nodeId,
  graph,
  onUpdateGraph,
  onClose,
}) => {
  const node = graph.nodes.find((n) => n.id === nodeId);
  const [activeTab, setActiveTab] = useState<'overview' | 'test' | 'impact'>('overview');

  // Interactive Test Simulation State
  const [simTurbidity, setSimTurbidity] = useState<number>(node?.readings.turbidity || 1.4);
  const [simPh, setSimPh] = useState<number>(node?.readings.pH || 7.35);
  const [simTds, setSimTds] = useState<number>(node?.readings.tds || 200);
  const [simChlorine, setSimChlorine] = useState<number>(node?.readings.residualChlorine || 0.8);
  const [lastRunResult, setLastRunResult] = useState<NodeTestResult | null>(null);

  if (!node) {
    return (
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 text-center text-slate-400">
        <p>No node selected.</p>
      </div>
    );
  }

  // Traversal lists
  const downstreamNodes = getDownstreamNodes(node.id, graph);
  const upstreamNodes = getUpstreamNodes(node.id, graph);
  const reachableDestinations = getReachableDestinations(node.id, graph);

  // Execute Test Action
  const handleExecuteTest = (customReadings?: Partial<SensorReadingsSnapshot>, forceFail = false) => {
    const readingsToTest: Partial<SensorReadingsSnapshot> = customReadings || {
      turbidity: Number(simTurbidity),
      pH: Number(simPh),
      tds: Number(simTds),
      residualChlorine: Number(simChlorine),
    };

    const { result, updatedGraph } = runNodeQualityTest(
      node.id,
      graph,
      readingsToTest,
      forceFail
    );

    setLastRunResult(result);
    onUpdateGraph(updatedGraph, result);
  };

  // Quick Preset Actions
  const handlePresetHealthy = () => {
    setSimTurbidity(1.15);
    setSimPh(7.32);
    setSimTds(190);
    setSimChlorine(0.95);
    handleExecuteTest({ turbidity: 1.15, pH: 7.32, tds: 190, residualChlorine: 0.95 }, false);
  };

  const handlePresetTurbidityAnomaly = () => {
    setSimTurbidity(7.85);
    setSimPh(8.65);
    setSimTds(460);
    setSimChlorine(0.12);
    handleExecuteTest({ turbidity: 7.85, pH: 8.65, tds: 460, residualChlorine: 0.12 }, true);
  };

  const handlePresetChlorineDepletion = () => {
    setSimTurbidity(3.2);
    setSimPh(7.8);
    setSimTds(340);
    setSimChlorine(0.06);
    handleExecuteTest({ turbidity: 3.2, pH: 7.8, tds: 340, residualChlorine: 0.06 }, true);
  };

  return (
    <div
      id={`node-detail-panel-${node.id}`}
      className="rounded-2xl bg-slate-900/95 border border-slate-800/90 p-5 shadow-2xl backdrop-blur-md transition-all flex flex-col"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-start gap-3">
          <div
            className={`p-2.5 rounded-xl ${
              node.status === 'critical'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : node.status === 'potentially_affected'
                ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">{node.name}</h3>
              <span className="px-2 py-0.5 rounded font-mono text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                {node.code}
              </span>
              <span
                className={`px-2.5 py-0.5 rounded-full text-xs font-mono font-bold ${
                  node.status === 'critical'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                    : node.status === 'potentially_affected'
                    ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                    : node.status === 'warning'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                    : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                }`}
              >
                {node.status === 'healthy'
                  ? '🟢 HEALTHY'
                  : node.status === 'critical'
                  ? '🔴 CRITICAL ANOMALY'
                  : node.status === 'potentially_affected'
                  ? '🟠 POTENTIALLY AFFECTED'
                  : '🟡 WARNING'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-500" />
              {node.location} · <span className="text-slate-300">{node.zone}</span>
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 mt-4 mb-4 border-b border-slate-800/80 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'overview'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Activity className="w-3.5 h-3.5" />
          Sensor Telemetry
        </button>
        <button
          onClick={() => setActiveTab('test')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'test'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Play className="w-3.5 h-3.5 text-cyan-400" />
          Run Quality Test & Sim
        </button>
        <button
          onClick={() => setActiveTab('impact')}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all ${
            activeTab === 'impact'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-3.5 h-3.5" />
          Downstream Impact ({downstreamNodes.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & SENSOR READINGS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Active Anomaly Banner if Critical or Affected */}
          {node.status === 'critical' && (
            <div className="p-3.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Water Quality Anomaly Active on this Node</span>
                <p className="mt-0.5 text-rose-300/90 leading-relaxed">
                  {node.anomalyReason || 'Turbidity and TDS parameters exceed BIS IS 10500 permissible ceilings.'}
                </p>
                <p className="mt-1 text-[11px] text-rose-400/80 font-mono">
                  Downstream impact: {downstreamNodes.length} nodes marked potentially affected.
                </p>
              </div>
            </div>
          )}

          {node.status === 'potentially_affected' && (
            <div className="p-3.5 rounded-xl bg-orange-950/50 border border-orange-800/70 text-orange-200 text-xs flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Hydraulically Downstream of Anomaly</span>
                <p className="mt-0.5 text-orange-300/90 leading-relaxed">
                  This node is safe locally, but is receiving water from an upstream node with detected quality deviations.
                </p>
              </div>
            </div>
          )}

          {/* 4 Essential Sensor Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {/* Turbidity */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Turbidity</span>
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-white">{node.readings.turbidity}</span>
                <span className="text-xs text-slate-400 ml-1">NTU</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Limit: &lt;5.0 NTU</div>
            </div>

            {/* pH */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>pH Value</span>
                <Gauge className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-white">{node.readings.pH}</span>
                <span className="text-xs text-slate-400 ml-1">pH</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Limit: 6.5 – 8.5</div>
            </div>

            {/* TDS */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>TDS</span>
                <Zap className="w-3.5 h-3.5 text-sky-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-white">{node.readings.tds}</span>
                <span className="text-xs text-slate-400 ml-1">ppm</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Limit: &lt;500 ppm</div>
            </div>

            {/* Chlorine */}
            <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between text-slate-400 text-xs">
                <span>Chlorine</span>
                <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              </div>
              <div className="mt-2">
                <span className="text-xl font-bold font-mono text-white">
                  {node.readings.residualChlorine ?? 0.8}
                </span>
                <span className="text-xs text-slate-400 ml-1">mg/L</span>
              </div>
              <div className="mt-1 text-[10px] text-slate-500 font-mono">Min: ≥0.20 mg/L</div>
            </div>
          </div>

          {/* Hydraulic Metadata */}
          <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <span className="text-slate-400 block text-[11px]">Flow Rate</span>
              <span className="font-mono font-bold text-white">{node.flowRate ?? 1420} m³/h</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Conduit Pressure</span>
              <span className="font-mono font-bold text-white">{node.pressure ?? 4.8} bar</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[11px]">Pipe Conduit</span>
              <span className="font-mono text-slate-200">{node.pipeDiameterMm ?? 1200}mm ({node.pipeMaterial ?? 'Ductile Iron'})</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: RUN QUALITY TEST & SIMULATOR */}
      {activeTab === 'test' && (
        <div className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              Water Quality Test Simulation
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Inject custom parameters into <span className="text-white font-semibold">{node.code}</span> to test automated downstream graph propagation.
            </p>

            {/* Quick Test Preset Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
              <button
                onClick={handlePresetHealthy}
                className="px-3 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                Pass Test (Healthy)
              </button>

              <button
                onClick={handlePresetTurbidityAnomaly}
                className="px-3 py-2 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Fail Test (High Turbidity)
              </button>

              <button
                onClick={handlePresetChlorineDepletion}
                className="px-3 py-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
              >
                <Droplets className="w-3.5 h-3.5" />
                Low Chlorine Test
              </button>
            </div>
          </div>

          {/* Interactive Sliders for Granular Ingestion */}
          <div className="space-y-3 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800 text-xs">
            {/* Turbidity Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>Turbidity (NTU):</span>
                <span className={`font-mono font-bold ${simTurbidity > 5.0 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {simTurbidity} NTU {simTurbidity > 5.0 && '(ANOMALY)'}
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10.0"
                step="0.1"
                value={simTurbidity}
                onChange={(e) => setSimTurbidity(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* pH Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>pH Level:</span>
                <span
                  className={`font-mono font-bold ${
                    simPh < 6.5 || simPh > 8.5 ? 'text-rose-400' : 'text-cyan-300'
                  }`}
                >
                  {simPh} {simPh < 6.5 || simPh > 8.5 ? '(OUT OF BOUNDS)' : ''}
                </span>
              </div>
              <input
                type="range"
                min="5.0"
                max="10.0"
                step="0.05"
                value={simPh}
                onChange={(e) => setSimPh(parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            {/* TDS Slider */}
            <div>
              <div className="flex items-center justify-between text-slate-300 mb-1">
                <span>TDS (ppm):</span>
                <span className={`font-mono font-bold ${simTds > 500 ? 'text-rose-400' : 'text-cyan-300'}`}>
                  {simTds} ppm
                </span>
              </div>
              <input
                type="range"
                min="100"
                max="800"
                step="10"
                value={simTds}
                onChange={(e) => setSimTds(parseInt(e.target.value, 10))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
            </div>

            <div className="pt-2">
              <button
                onClick={() => handleExecuteTest()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <Play className="w-4 h-4 fill-current" />
                Run Water Quality Test on {node.code}
              </button>
            </div>
          </div>

          {/* Test Feedback Summary */}
          {lastRunResult && (
            <div
              className={`p-3.5 rounded-xl text-xs border ${
                lastRunResult.isAbnormal
                  ? 'bg-rose-950/60 border-rose-800 text-rose-200'
                  : 'bg-emerald-950/60 border-emerald-800 text-emerald-200'
              }`}
            >
              <div className="font-bold flex items-center gap-1.5 mb-1">
                {lastRunResult.isAbnormal ? (
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                )}
                Test Result: {lastRunResult.status.toUpperCase()}
              </div>
              <p className="leading-relaxed">{lastRunResult.summaryMessage}</p>
              {lastRunResult.isAbnormal && lastRunResult.affectedDownstreamNodeIds.length > 0 && (
                <div className="mt-2 pt-2 border-t border-rose-800/60 text-[11px] font-mono">
                  Affected Downstream Nodes ({lastRunResult.affectedDownstreamNodeIds.length}):{' '}
                  <span className="text-white font-bold">
                    {lastRunResult.affectedDownstreamNodeIds.join(', ')}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DOWNSTREAM & UPSTREAM IMPACT GRAPH TRACE */}
      {activeTab === 'impact' && (
        <div className="space-y-4 text-xs">
          {/* Downstream Nodes List */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ArrowDownRight className="w-4 h-4 text-cyan-400" />
                Reachable Downstream Pipeline Nodes ({downstreamNodes.length})
              </span>
            </div>

            {downstreamNodes.length === 0 ? (
              <p className="text-slate-500 italic">No downstream nodes. This is a terminal point in the network.</p>
            ) : (
              <div className="space-y-2 mt-2">
                {downstreamNodes.map((dNode) => (
                  <div
                    key={dNode.id}
                    className={`p-2.5 rounded-lg border flex items-center justify-between gap-2 ${
                      dNode.status === 'potentially_affected'
                        ? 'bg-orange-950/40 border-orange-800/60 text-orange-200'
                        : dNode.status === 'critical'
                        ? 'bg-rose-950/40 border-rose-800/60 text-rose-200'
                        : 'bg-slate-900 border-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-white">{dNode.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {dNode.code} · {dNode.location}
                      </div>
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        dNode.status === 'potentially_affected'
                          ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                          : dNode.status === 'critical'
                          ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      }`}
                    >
                      {dNode.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upstream Feeder Nodes List */}
          <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-200 flex items-center gap-1.5">
                <ArrowUpLeft className="w-4 h-4 text-emerald-400" />
                Upstream Feeder Nodes ({upstreamNodes.length})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">UN-AFFECTED BY DOWNSTREAM</span>
            </div>

            {upstreamNodes.length === 0 ? (
              <p className="text-slate-500 italic">This is the source intake plant (no upstream feeders).</p>
            ) : (
              <div className="space-y-2 mt-2">
                {upstreamNodes.map((uNode) => (
                  <div
                    key={uNode.id}
                    className="p-2.5 rounded-lg border bg-slate-900 border-slate-800 flex items-center justify-between gap-2 text-slate-300"
                  >
                    <div>
                      <div className="font-semibold text-white">{uNode.name}</div>
                      <div className="text-[11px] text-slate-400">
                        {uNode.code} · {uNode.location}
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      🟢 NORMAL
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
