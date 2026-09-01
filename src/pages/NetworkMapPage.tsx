import React, { useState } from 'react';
import {
  PipelineGraph,
  PipelineNode,
  NodeTestResult,
  TopologyScenario,
} from '../types';
import { PipelineTopologyMap } from '../components/PipelineTopologyMap';
import { NodeDetailPanel } from '../components/NodeDetailPanel';
import { applyTopologyScenario } from '../services/topologyService';
import {
  Compass,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  GitFork,
  MapPin,
  Activity,
  ArrowLeft,
  Filter,
  Eye,
  Info,
} from 'lucide-react';

interface NetworkMapPageProps {
  graph: PipelineGraph;
  onUpdateGraph: (updatedGraph: PipelineGraph, testResult?: NodeTestResult) => void;
  onBackToDashboard: () => void;
}

export const NetworkMapPage: React.FC<NetworkMapPageProps> = ({
  graph,
  onUpdateGraph,
  onBackToDashboard,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('NODE-02');
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<TopologyScenario>('normal');

  const healthyCount = graph.nodes.filter((n) => n.status === 'healthy').length;
  const criticalCount = graph.nodes.filter((n) => n.status === 'critical').length;
  const affectedCount = graph.nodes.filter((n) => n.status === 'potentially_affected').length;
  const destinations = graph.nodes.filter((n) => n.type === 'destination');
  const atRiskDestinations = destinations.filter(
    (d) => d.status === 'critical' || d.status === 'potentially_affected'
  );

  const handleScenarioChange = (scenario: TopologyScenario) => {
    setActiveScenario(scenario);
    const updated = applyTopologyScenario(scenario, graph);
    onUpdateGraph(updated);
    if (scenario === 'node2_fail') setSelectedNodeId('NODE-02');
    else if (scenario === 'node3_fail') setSelectedNodeId('NODE-03');
    else if (scenario === 'node6_fail') setSelectedNodeId('NODE-06');
  };

  return (
    <div id="network-map-view" className="space-y-6 max-w-7xl mx-auto pb-10">
      {/* Top Breadcrumb & Return Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <button
            onClick={onBackToDashboard}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5 text-xs font-semibold"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </button>
          <div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Geospatial Hydro-Pipeline Network Topology Studio
            </h1>
            <p className="text-xs text-slate-400">
              Interactive directed graph representing water travel from Palta WTP through distribution branches
            </p>
          </div>
        </div>

        {/* Global Summary Badge */}
        <div className="flex items-center gap-2 font-mono text-xs">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-950/40 text-emerald-300 border border-emerald-800/50">
            {healthyCount} / {graph.nodes.length} Optimal
          </span>
          {criticalCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-rose-950/60 text-rose-300 border border-rose-800/80 animate-pulse">
              {criticalCount} Critical
            </span>
          )}
          {affectedCount > 0 && (
            <span className="px-3 py-1.5 rounded-xl bg-orange-950/60 text-orange-300 border border-orange-800/80">
              {affectedCount} Affected
            </span>
          )}
        </div>
      </div>

      {/* Scenario Presets Toolbar */}
      <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 text-xs">
          <div className="font-semibold text-slate-200 flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Downstream Propagation Scenarios:</span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleScenarioChange('normal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenario === 'normal'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🟢 Scenario A: Normal (All Healthy)
            </button>
            <button
              onClick={() => handleScenarioChange('node2_fail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenario === 'node2_fail'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🔴 Fail Node 2 (Palta Clarifier)
            </button>
            <button
              onClick={() => handleScenarioChange('node3_fail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenario === 'node3_fail'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🔴 Fail Node 3 (Tala Reservoir)
            </button>
            <button
              onClick={() => handleScenarioChange('node6_fail')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeScenario === 'node6_fail'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              🔴 Fail Node 6 (Howrah Feeder)
            </button>
            <button
              onClick={() => handleScenarioChange('recovery')}
              className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-semibold flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Pathways Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {graph.pathways.map((p) => {
          const isImpacted = p.status === 'impacted';
          const isSelected = selectedPathwayId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPathwayId(isSelected ? null : p.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 ring-1 ring-cyan-500/50'
                  : isImpacted
                  ? 'bg-rose-950/30 border-rose-800/70'
                  : 'bg-slate-900/90 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="font-bold text-white text-sm">{p.code}</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                    isImpacted
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {isImpacted ? '⚠ IMPACTED' : '🟢 NORMAL'}
                </span>
              </div>
              <p className="text-xs text-slate-400 line-clamp-2">{p.description}</p>
              <div className="mt-3 pt-3 border-t border-slate-800/70 flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Destination:</span>
                <span className={`font-semibold ${isImpacted ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {p.destination}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Topology Map + Node Detail Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7 xl:col-span-8">
          <PipelineTopologyMap
            graph={graph}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
            selectedPathwayId={selectedPathwayId}
            onSelectPathway={(id) => setSelectedPathwayId(id)}
          />
        </div>

        <div className="lg:col-span-5 xl:col-span-4">
          <NodeDetailPanel
            nodeId={selectedNodeId}
            graph={graph}
            onUpdateGraph={onUpdateGraph}
          />
        </div>
      </div>

      {/* Directed Pipeline Graph Routing Matrix */}
      <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-white flex items-center gap-2">
            <GitFork className="w-4 h-4 text-cyan-400" />
            Topological Nodes & Pipeline Conduits Routing Table
          </h3>
          <span className="text-xs font-mono text-slate-400">
            {graph.edges.length} Active Directed Hydraulic Segments
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                <th className="p-3">Edge ID</th>
                <th className="p-3">Upstream Feeder</th>
                <th className="p-3">Downstream Target</th>
                <th className="p-3">Distance</th>
                <th className="p-3">Flow Rate</th>
                <th className="p-3">Conduit Spec</th>
                <th className="p-3">Hydraulic Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              {graph.edges.map((e) => {
                const fromNode = graph.nodes.find((n) => n.id === e.fromNodeId);
                const toNode = graph.nodes.find((n) => n.id === e.toNodeId);
                const isImpacted = e.status === 'impacted';

                return (
                  <tr
                    key={e.id}
                    className={`hover:bg-slate-800/40 transition-colors ${
                      isImpacted ? 'bg-rose-950/20' : ''
                    }`}
                  >
                    <td className="p-3 font-bold text-white">{e.id}</td>
                    <td className="p-3">
                      <span className="text-slate-200">{fromNode?.code}</span>
                      <span className="text-[10px] text-slate-500 block">{fromNode?.name}</span>
                    </td>
                    <td className="p-3">
                      <span className="text-slate-200">{toNode?.code}</span>
                      <span className="text-[10px] text-slate-500 block">{toNode?.name}</span>
                    </td>
                    <td className="p-3 text-cyan-400">{e.distanceKm} km</td>
                    <td className="p-3 text-slate-200">{e.flowRateM3h} m³/h</td>
                    <td className="p-3 text-slate-400">{e.pipeDiameterMm}mm</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isImpacted
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                            : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        }`}
                      >
                        {isImpacted ? '⚠ IMPACTED FLOW' : '🟢 NOMINAL'}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
