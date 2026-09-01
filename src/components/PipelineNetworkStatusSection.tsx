import React, { useState } from 'react';
import {
  PipelineGraph,
  PipelineNode,
  NodeTestResult,
  TopologyScenario,
  Pathway,
} from '../types';
import { PipelineTopologyMap } from './PipelineTopologyMap';
import { NodeDetailPanel } from './NodeDetailPanel';
import { applyTopologyScenario } from '../services/topologyService';
import {
  Compass,
  Layers,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  Play,
  RotateCcw,
  ArrowRight,
  ShieldAlert,
  GitFork,
  Activity,
  MapPin,
  TrendingDown,
} from 'lucide-react';

interface PipelineNetworkStatusSectionProps {
  graph: PipelineGraph;
  onUpdateGraph: (updatedGraph: PipelineGraph, testResult?: NodeTestResult) => void;
  onNavigateToNetworkMap?: () => void;
}

export const PipelineNetworkStatusSection: React.FC<PipelineNetworkStatusSectionProps> = ({
  graph,
  onUpdateGraph,
  onNavigateToNetworkMap,
}) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string>('NODE-02');
  const [selectedPathwayId, setSelectedPathwayId] = useState<string | null>(null);
  const [activeScenario, setActiveScenario] = useState<TopologyScenario>('normal');

  // Compute graph status tallies
  const totalNodes = graph.nodes.length;
  const healthyCount = graph.nodes.filter((n) => n.status === 'healthy').length;
  const criticalCount = graph.nodes.filter((n) => n.status === 'critical').length;
  const affectedCount = graph.nodes.filter((n) => n.status === 'potentially_affected').length;
  const warningCount = graph.nodes.filter((n) => n.status === 'warning').length;

  const destinations = graph.nodes.filter((n) => n.type === 'destination');
  const atRiskDestinations = destinations.filter(
    (d) => d.status === 'critical' || d.status === 'potentially_affected'
  );

  const handleScenarioChange = (scenario: TopologyScenario) => {
    setActiveScenario(scenario);
    const updated = applyTopologyScenario(scenario, graph);
    onUpdateGraph(updated);
    if (scenario === 'node2_fail') {
      setSelectedNodeId('NODE-02');
    } else if (scenario === 'node3_fail') {
      setSelectedNodeId('NODE-03');
    } else if (scenario === 'node6_fail') {
      setSelectedNodeId('NODE-06');
    }
  };

  return (
    <div
      id="pipeline-topology-section"
      className="space-y-4 rounded-2xl bg-slate-900/80 border border-slate-800/90 p-5 shadow-lg backdrop-blur-sm"
    >
      {/* 1. Header & Topology Overview Metrics */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <GitFork className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-bold text-white tracking-tight ledger-heading">
              Water-Pipeline Topology & Downstream Impact System
            </h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
              GRAPH PROPAGATION ENGINE
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-3xl">
            Pipeline hydro-network model tracking directed water flow from Palta Treatment Plant through Tala Reservoir to Dum Dum, Howrah, and Sector V destinations.
          </p>
        </div>

        {/* Real-Time Topology Summary Chips */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center gap-2">
            <span className="text-slate-400">Pathways:</span>
            <span className="font-bold text-white">{graph.pathways.length}</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-emerald-950/40 border border-emerald-800/50 flex items-center gap-2 text-emerald-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Healthy:</span>
            <span className="font-bold">{healthyCount}</span>
          </div>
          {criticalCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-rose-950/60 border border-rose-800/80 flex items-center gap-2 text-rose-300 animate-pulse">
              <span className="w-2 h-2 rounded-full bg-rose-500" />
              <span>Critical:</span>
              <span className="font-bold">{criticalCount}</span>
            </div>
          )}
          {affectedCount > 0 && (
            <div className="px-3 py-1.5 rounded-xl bg-orange-950/60 border border-orange-800/80 flex items-center gap-2 text-orange-300">
              <span className="w-2 h-2 rounded-full bg-orange-500 animate-pulse" />
              <span>Potentially Affected:</span>
              <span className="font-bold">{affectedCount}</span>
            </div>
          )}
          <div
            className={`px-3 py-1.5 rounded-xl border flex items-center gap-2 ${
              atRiskDestinations.length > 0
                ? 'bg-rose-950/50 border-rose-800/80 text-rose-300'
                : 'bg-slate-950/80 border-slate-800 text-slate-300'
            }`}
          >
            <MapPin className="w-3.5 h-3.5 text-cyan-400" />
            <span>Destinations At Risk:</span>
            <span className="font-bold font-mono">
              {atRiskDestinations.length} / {destinations.length}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Interactive Scenario Presets Toolbar */}
      <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-semibold text-slate-300">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Interactive Downstream Impact Scenarios:</span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Scenario A: Normal */}
          <button
            onClick={() => handleScenarioChange('normal')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'normal'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🟢 Scenario A: Normal Operation
          </button>

          {/* Scenario B: Node 2 (Clarifier Splitter) Fail */}
          <button
            onClick={() => handleScenarioChange('node2_fail')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'node2_fail'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🔴 Fail Node 2 (Clarifier Splitter)
          </button>

          {/* Scenario C: Node 3 (Tala Reservoir) Fail */}
          <button
            onClick={() => handleScenarioChange('node3_fail')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'node3_fail'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🔴 Fail Node 3 (Tala Reservoir)
          </button>

          {/* Scenario D: Node 6 (Howrah Feeder) Fail */}
          <button
            onClick={() => handleScenarioChange('node6_fail')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
              activeScenario === 'node6_fail'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 font-bold shadow-sm'
                : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            🔴 Fail Node 6 (Howrah Branch)
          </button>

          {/* Recovery Button */}
          <button
            onClick={() => handleScenarioChange('recovery')}
            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Restore All Healthy
          </button>
        </div>
      </div>

      {/* 3. Pathway Cards Grid (Pathway 1, 2, 3) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {graph.pathways.map((p) => {
          const isImpacted = p.status === 'impacted';
          const isSelected = selectedPathwayId === p.id;
          return (
            <div
              key={p.id}
              onClick={() => setSelectedPathwayId(isSelected ? null : p.id)}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                isSelected
                  ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                  : isImpacted
                  ? 'bg-rose-950/30 border-rose-800/70 hover:border-rose-700'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between gap-2 mb-1.5">
                <span className="font-bold text-white text-xs">{p.code}</span>
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
              <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{p.name}</p>

              <div className="mt-2.5 pt-2 border-t border-slate-800/70 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <span>Destination:</span>
                <span
                  className={`font-semibold ${
                    isImpacted ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {p.destination.split(' ')[0]} ({isImpacted ? 'AT RISK' : 'SAFE'})
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* 4. Interactive Vector Pipeline Map & Node Inspector Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Vector SVG Topology Map */}
        <div className="lg:col-span-7 xl:col-span-8">
          <PipelineTopologyMap
            graph={graph}
            selectedNodeId={selectedNodeId}
            onSelectNode={(id) => setSelectedNodeId(id)}
            selectedPathwayId={selectedPathwayId}
            onSelectPathway={(id) => setSelectedPathwayId(id)}
          />
        </div>

        {/* Selected Node Details & Live Quality Tester Sandbox */}
        <div className="lg:col-span-5 xl:col-span-4">
          <NodeDetailPanel
            nodeId={selectedNodeId}
            graph={graph}
            onUpdateGraph={onUpdateGraph}
          />
        </div>
      </div>
    </div>
  );
};
