import React, { useState } from 'react';
import {
  PipelineGraph,
  PipelineNode,
  PipelineEdge,
  PipelineNodeStatus,
  Pathway,
} from '../types';
import {
  getDownstreamNodes,
  getUpstreamNodes,
} from '../services/topologyService';
import {
  Layers,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  MapPin,
  Compass,
  Gauge,
  Droplets,
  Activity,
  Flame,
} from 'lucide-react';

interface PipelineTopologyMapProps {
  graph: PipelineGraph;
  selectedNodeId: string | null;
  onSelectNode: (nodeId: string) => void;
  selectedPathwayId?: string | null;
  onSelectPathway?: (pathwayId: string | null) => void;
}

export const PipelineTopologyMap: React.FC<PipelineTopologyMapProps> = ({
  graph,
  selectedNodeId,
  onSelectNode,
  selectedPathwayId,
  onSelectPathway,
}) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  // Layout coordinate mapping for nodes (SVG canvas 1000 x 480)
  // Clean, high-legibility metro-style hydro topology grid
  const nodePositions: Record<string, { x: number; y: number; labelPos: 'top' | 'bottom' | 'right' | 'left' }> = {
    // Water Treatment Plant (Source)
    'PLANT-01': { x: 70, y: 220, labelPos: 'bottom' },
    // Trunk line
    'NODE-01': { x: 190, y: 220, labelPos: 'bottom' },
    'NODE-02': { x: 320, y: 220, labelPos: 'bottom' }, // Main splitter junction

    // Branch A: Dum Dum Main Route (Upper-middle arterial)
    'NODE-03': { x: 470, y: 150, labelPos: 'top' }, // Tala Reservoir & Splitter
    'NODE-04': { x: 620, y: 150, labelPos: 'top' },
    'NODE-05': { x: 760, y: 150, labelPos: 'top' },
    'DEST-DUMDUM': { x: 910, y: 150, labelPos: 'right' },

    // Branch B: Howrah River-Crossing Route (Lower arterial branching from Node 2)
    'NODE-06': { x: 470, y: 360, labelPos: 'bottom' },
    'NODE-07': { x: 670, y: 360, labelPos: 'bottom' },
    'DEST-HOWRAH': { x: 880, y: 360, labelPos: 'right' },

    // Branch C: Sector V IT Route (Branching from Node 3 / Tala)
    'NODE-08': { x: 640, y: 250, labelPos: 'bottom' },
    'DEST-SECTORV': { x: 860, y: 250, labelPos: 'right' },
  };

  // Helper to get status color tokens
  const getNodeColorConfig = (status: PipelineNodeStatus, isSelected: boolean) => {
    switch (status) {
      case 'critical':
        return {
          fill: '#EF4444',
          stroke: '#B91C1C',
          ring: 'rgba(239, 68, 68, 0.4)',
          text: 'text-rose-400',
          bg: 'bg-rose-500/20',
          border: 'border-rose-500',
          badgeText: 'CRITICAL ANOMALY',
          iconColor: '#FCA5A5',
        };
      case 'potentially_affected':
        return {
          fill: '#F97316',
          stroke: '#C2410C',
          ring: 'rgba(249, 115, 22, 0.35)',
          text: 'text-orange-400',
          bg: 'bg-orange-500/20',
          border: 'border-orange-500',
          badgeText: 'POTENTIALLY AFFECTED',
          iconColor: '#FDBA74',
        };
      case 'warning':
        return {
          fill: '#F59E0B',
          stroke: '#D97706',
          ring: 'rgba(245, 158, 11, 0.35)',
          text: 'text-amber-400',
          bg: 'bg-amber-500/20',
          border: 'border-amber-500',
          badgeText: 'WARNING',
          iconColor: '#FCD34D',
        };
      case 'offline':
        return {
          fill: '#64748B',
          stroke: '#475569',
          ring: 'rgba(100, 116, 139, 0.2)',
          text: 'text-slate-400',
          bg: 'bg-slate-800',
          border: 'border-slate-700',
          badgeText: 'OFFLINE',
          iconColor: '#94A3B8',
        };
      case 'healthy':
      default:
        return {
          fill: '#10B981',
          stroke: '#059669',
          ring: 'rgba(16, 185, 129, 0.25)',
          text: 'text-emerald-400',
          bg: 'bg-emerald-500/20',
          border: 'border-emerald-500',
          badgeText: 'HEALTHY',
          iconColor: '#6EE7B7',
        };
    }
  };

  const selectedNode = graph.nodes.find((n) => n.id === selectedNodeId);
  const hoveredNode = graph.nodes.find((n) => n.id === hoveredNodeId);
  const activeFocusNode = hoveredNode || selectedNode;

  // Find downstream & upstream nodes for visual flow highlighting
  const activeDownstreamIds = activeFocusNode
    ? new Set(getDownstreamNodes(activeFocusNode.id, graph).map((n) => n.id))
    : new Set<string>();

  const activeUpstreamIds = activeFocusNode
    ? new Set(getUpstreamNodes(activeFocusNode.id, graph).map((n) => n.id))
    : new Set<string>();

  // Filter edges if a specific pathway is selected
  const visibleEdges = selectedPathwayId
    ? graph.edges.filter((e) => {
        const pw = graph.pathways.find((p) => p.id === selectedPathwayId);
        return pw?.edgeIds.includes(e.id);
      })
    : graph.edges;

  return (
    <div
      id="pipeline-topology-map-container"
      className="relative w-full rounded-2xl bg-slate-950/90 border border-slate-800/90 p-4 sm:p-5 shadow-xl backdrop-blur-md overflow-hidden transition-all"
    >
      {/* Top Header & Legend Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Compass className="w-5 h-5 animate-spin-slow" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
                Water-Pipeline Network Topology & Hydro Flow Graph
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                DIRECTED PROPAGATION ENGINE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive SCADA topology map · Click any node to inspect sensor readings and simulate downstream quality propagation
            </p>
          </div>
        </div>

        {/* Status Indicators Legend */}
        <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-950/40 border border-emerald-800/50 text-emerald-300">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-sm shadow-emerald-500/50" />
            <span>🟢 Healthy</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-950/40 border border-amber-800/50 text-amber-300">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-500/50" />
            <span>🟡 Warning</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-950/50 border border-rose-800/60 text-rose-300">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
            <span>🔴 Critical Failed</span>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-orange-950/50 border border-orange-800/60 text-orange-300">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500 animate-pulse" />
            <span>🟠 Potentially Affected</span>
          </div>
        </div>
      </div>

      {/* Pathway Quick Filter Chips */}
      <div className="flex flex-wrap items-center gap-2 mb-4">
        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1.5 mr-1">
          <Layers className="w-3.5 h-3.5 text-cyan-400" />
          Filter Pathway:
        </span>
        <button
          onClick={() => onSelectPathway && onSelectPathway(null)}
          className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
            !selectedPathwayId
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 font-semibold'
              : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          All Pathways ({graph.pathways.length})
        </button>
        {graph.pathways.map((p) => {
          const isImpacted = p.status === 'impacted';
          const isSelected = selectedPathwayId === p.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectPathway && onSelectPathway(isSelected ? null : p.id)}
              className={`px-3 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
                isSelected
                  ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400 font-semibold shadow-sm'
                  : isImpacted
                  ? 'bg-rose-950/40 text-rose-300 hover:bg-rose-900/50 border border-rose-800/60'
                  : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  isImpacted ? 'bg-rose-500 animate-pulse' : 'bg-emerald-400'
                }`}
              />
              <span>{p.code}</span>
              {isImpacted && (
                <span className="px-1 py-0.2 rounded text-[9px] font-mono bg-rose-500/30 text-rose-200 border border-rose-500/40">
                  IMPACTED ({p.criticalNodeCount + p.affectedNodeCount})
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Main Interactive SVG Canvas */}
      <div className="relative w-full overflow-x-auto bg-slate-950/80 rounded-xl border border-slate-800/80 p-2 scrollbar-thin">
        <svg
          viewBox="0 0 1000 460"
          className="w-full h-auto min-w-[760px] select-none"
          style={{ minHeight: '380px' }}
        >
          <defs>
            {/* Directional Flow Gradient Patterns */}
            <linearGradient id="flowNormalGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#06B6D4" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.8" />
            </linearGradient>

            <linearGradient id="flowImpactGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#EF4444" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F97316" stopOpacity="0.9" />
            </linearGradient>

            <linearGradient id="flowAffectedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#F97316" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.9" />
            </linearGradient>

            {/* Custom Arrow Markers for Water Flow Direction */}
            <marker
              id="arrow-normal"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#06B6D4" />
            </marker>

            <marker
              id="arrow-impacted"
              viewBox="0 0 10 10"
              refX="16"
              refY="5"
              markerWidth="6"
              markerHeight="6"
              orient="auto-start-reverse"
            >
              <path d="M 0 1.5 L 8 5 L 0 8.5 z" fill="#EF4444" />
            </marker>

            {/* Glow filters */}
            <filter id="glow-red" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-orange" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
            <filter id="glow-cyan" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Background Grid Accent Lines */}
          <g opacity="0.08" stroke="#38BDF8" strokeWidth="1" strokeDasharray="4 8">
            <line x1="0" y1="150" x2="1000" y2="150" />
            <line x1="0" y1="220" x2="1000" y2="220" />
            <line x1="0" y1="250" x2="1000" y2="250" />
            <line x1="0" y1="360" x2="1000" y2="360" />
            <line x1="320" y1="0" x2="320" y2="460" />
            <line x1="470" y1="0" x2="470" y2="460" />
          </g>

          {/* 1. PIPELINE EDGES (Drawn first so nodes sit on top) */}
          <g id="pipeline-edges-layer">
            {visibleEdges.map((edge) => {
              const fromPos = nodePositions[edge.fromNodeId];
              const toPos = nodePositions[edge.toNodeId];
              if (!fromPos || !toPos) return null;

              const fromNode = graph.nodes.find((n) => n.id === edge.fromNodeId);
              const toNode = graph.nodes.find((n) => n.id === edge.toNodeId);

              const isEdgeImpacted =
                fromNode?.status === 'critical' ||
                toNode?.status === 'critical' ||
                fromNode?.status === 'potentially_affected' ||
                toNode?.status === 'potentially_affected';

              const isSelectedPath =
                (selectedNodeId &&
                  (activeDownstreamIds.has(edge.toNodeId) &&
                    (activeDownstreamIds.has(edge.fromNodeId) || edge.fromNodeId === selectedNodeId))) ||
                (selectedNodeId &&
                  (activeUpstreamIds.has(edge.fromNodeId) &&
                    (activeUpstreamIds.has(edge.toNodeId) || edge.toNodeId === selectedNodeId)));

              let strokeColor = isEdgeImpacted ? '#EF4444' : '#0284C7';
              if (fromNode?.status === 'potentially_affected' || toNode?.status === 'potentially_affected') {
                strokeColor = '#F97316';
              }
              if (!isEdgeImpacted && isSelectedPath) {
                strokeColor = '#38BDF8';
              }

              // Generate smooth bezier curve if branching, or straight line if horizontal
              const isCurved = fromPos.y !== toPos.y;
              let pathData = '';
              if (!isCurved) {
                pathData = `M ${fromPos.x} ${fromPos.y} L ${toPos.x} ${toPos.y}`;
              } else {
                const midX = (fromPos.x + toPos.x) / 2;
                pathData = `M ${fromPos.x} ${fromPos.y} C ${midX} ${fromPos.y}, ${midX} ${toPos.y}, ${toPos.x} ${toPos.y}`;
              }

              return (
                <g key={edge.id} className="transition-all duration-300">
                  {/* Outer glow line for impacted or active path */}
                  {(isEdgeImpacted || isSelectedPath) && (
                    <path
                      d={pathData}
                      fill="none"
                      stroke={strokeColor}
                      strokeWidth={isEdgeImpacted ? '8' : '6'}
                      strokeOpacity="0.25"
                      strokeLinecap="round"
                    />
                  )}

                  {/* Base Pipeline Conduit */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={strokeColor}
                    strokeWidth={isSelectedPath ? '4' : '3.5'}
                    strokeDasharray={isEdgeImpacted ? '6 4' : 'none'}
                    markerEnd={isEdgeImpacted ? 'url(#arrow-impacted)' : 'url(#arrow-normal)'}
                    className="transition-colors duration-300"
                  />

                  {/* Animated Flow Pulse (Simulating moving water) */}
                  <path
                    d={pathData}
                    fill="none"
                    stroke={isEdgeImpacted ? '#FEF08A' : '#E0F2FE'}
                    strokeWidth="2.5"
                    strokeDasharray="8 32"
                    strokeLinecap="round"
                    className="opacity-75"
                  >
                    <animate
                      attributeName="stroke-dashoffset"
                      from="40"
                      to="0"
                      dur={isEdgeImpacted ? '1.2s' : '2s'}
                      repeatCount="indefinite"
                    />
                  </path>

                  {/* Flow Rate & Diameter Badge in midpoint */}
                  <g
                    transform={`translate(${(fromPos.x + toPos.x) / 2}, ${(fromPos.y + toPos.y) / 2 - 10})`}
                    className="opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
                  >
                    <rect
                      x="-28"
                      y="-8"
                      width="56"
                      height="16"
                      rx="8"
                      fill="#090D16"
                      stroke={strokeColor}
                      strokeWidth="1"
                    />
                    <text
                      x="0"
                      y="3.5"
                      textAnchor="middle"
                      fill="#94A3B8"
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {edge.distanceKm} km
                    </text>
                  </g>
                </g>
              );
            })}
          </g>

          {/* 2. PIPELINE NODES & DESTINATIONS LAYER */}
          <g id="pipeline-nodes-layer">
            {graph.nodes.map((node) => {
              const pos = nodePositions[node.id];
              if (!pos) return null;

              const isSelected = selectedNodeId === node.id;
              const isHovered = hoveredNodeId === node.id;
              const isDownstream = selectedNodeId ? activeDownstreamIds.has(node.id) : false;
              const isUpstream = selectedNodeId ? activeUpstreamIds.has(node.id) : false;

              const config = getNodeColorConfig(node.status, isSelected);

              const isSource = node.type === 'source';
              const isDestination = node.type === 'destination';
              const isJunction = node.type === 'junction';

              const radius = isSource || isDestination ? 24 : isJunction ? 20 : 18;

              return (
                <g
                  key={node.id}
                  transform={`translate(${pos.x}, ${pos.y})`}
                  onClick={() => onSelectNode(node.id)}
                  onMouseEnter={() => setHoveredNodeId(node.id)}
                  onMouseLeave={() => setHoveredNodeId(null)}
                  className="cursor-pointer group"
                  id={`topology-node-${node.id}`}
                >
                  {/* Selection / Downstream Impact Halo */}
                  {isSelected && (
                    <circle
                      r={radius + 12}
                      fill="none"
                      stroke={config.stroke}
                      strokeWidth="2.5"
                      strokeDasharray="4 4"
                      className="animate-spin-slow opacity-80"
                    />
                  )}

                  {/* Pulsing ring for Critical Nodes */}
                  {node.status === 'critical' && (
                    <circle
                      r={radius + 8}
                      fill="none"
                      stroke="#EF4444"
                      strokeWidth="2"
                      className="animate-ping opacity-60"
                    />
                  )}

                  {/* Pulsing ring for Potentially Affected Nodes */}
                  {node.status === 'potentially_affected' && (
                    <circle
                      r={radius + 6}
                      fill="none"
                      stroke="#F97316"
                      strokeWidth="1.5"
                      className="animate-pulse opacity-70"
                    />
                  )}

                  {/* Main Node Body Outer */}
                  <circle
                    r={radius}
                    fill="#0F172A"
                    stroke={isSelected ? '#38BDF8' : config.stroke}
                    strokeWidth={isSelected ? '3.5' : '2.5'}
                    filter={
                      node.status === 'critical'
                        ? 'url(#glow-red)'
                        : node.status === 'potentially_affected'
                        ? 'url(#glow-orange)'
                        : isSelected
                        ? 'url(#glow-cyan)'
                        : undefined
                    }
                    className="transition-all duration-200 group-hover:stroke-cyan-300"
                  />

                  {/* Inner Status Core */}
                  <circle
                    r={radius - 6}
                    fill={config.fill}
                    fillOpacity={node.status === 'healthy' ? '0.85' : '0.95'}
                    className="transition-colors duration-300"
                  />

                  {/* Center Node Icon / Abbreviation */}
                  <text
                    x="0"
                    y={isDestination ? '3.5' : isSource ? '4' : '3.5'}
                    textAnchor="middle"
                    fill="#FFFFFF"
                    fontSize={isDestination ? '9' : isSource ? '9' : '10'}
                    fontWeight="800"
                    fontFamily="monospace"
                    className="pointer-events-none drop-shadow"
                  >
                    {isSource ? 'WTP' : isDestination ? 'DEST' : node.code.replace('NODE ', 'N')}
                  </text>

                  {/* Node Name & Type Badge Label */}
                  <g
                    transform={`translate(0, ${
                      pos.labelPos === 'top'
                        ? -(radius + 18)
                        : pos.labelPos === 'bottom'
                        ? radius + 18
                        : 0
                    })`}
                    className="pointer-events-none"
                  >
                    {/* Background bubble for text */}
                    <rect
                      x={pos.labelPos === 'right' ? radius + 8 : -65}
                      y={pos.labelPos === 'right' ? -18 : -12}
                      width={pos.labelPos === 'right' ? 120 : 130}
                      height="30"
                      rx="6"
                      fill="#090D16"
                      fillOpacity="0.92"
                      stroke={isSelected ? '#38BDF8' : '#334155'}
                      strokeWidth={isSelected ? '1.5' : '1'}
                    />

                    {/* Node Code & Name */}
                    <text
                      x={pos.labelPos === 'right' ? radius + 14 : 0}
                      y={pos.labelPos === 'right' ? -4 : -1}
                      textAnchor={pos.labelPos === 'right' ? 'start' : 'middle'}
                      fill="#F8FAFC"
                      fontSize="10"
                      fontWeight="bold"
                      fontFamily="sans-serif"
                    >
                      {node.code}
                    </text>

                    {/* Status Pill Subtitle */}
                    <text
                      x={pos.labelPos === 'right' ? radius + 14 : 0}
                      y={pos.labelPos === 'right' ? 7 : 10}
                      textAnchor={pos.labelPos === 'right' ? 'start' : 'middle'}
                      fill={config.fill}
                      fontSize="8.5"
                      fontWeight="600"
                      fontFamily="monospace"
                    >
                      {node.status === 'healthy'
                        ? '🟢 HEALTHY'
                        : node.status === 'critical'
                        ? '🔴 CRITICAL'
                        : node.status === 'potentially_affected'
                        ? '🟠 AFFECTED'
                        : '🟡 WARNING'}
                    </text>
                  </g>

                  {/* Downstream / Upstream Indicator Badges when a node is selected */}
                  {isSelected && (
                    <g transform={`translate(0, ${-(radius + 32)})`}>
                      <rect
                        x="-45"
                        y="-10"
                        width="90"
                        height="18"
                        rx="9"
                        fill="#0284C7"
                        stroke="#38BDF8"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill="#FFFFFF"
                        fontSize="9"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        SELECTED NODE
                      </text>
                    </g>
                  )}

                  {isDownstream && (
                    <g transform={`translate(0, ${-(radius + 32)})`}>
                      <rect
                        x="-52"
                        y="-10"
                        width="104"
                        height="18"
                        rx="9"
                        fill="#C2410C"
                        stroke="#F97316"
                        strokeWidth="1"
                      />
                      <text
                        x="0"
                        y="2"
                        textAnchor="middle"
                        fill="#FFEDD5"
                        fontSize="8.5"
                        fontWeight="bold"
                        fontFamily="monospace"
                      >
                        DOWNSTREAM IMPACT
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>
        </svg>
      </div>

      {/* Selected Node Bottom Quick Bar */}
      {selectedNode && (
        <div
          id="topology-selected-node-bar"
          className="mt-4 p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
        >
          <div className="flex items-center gap-3">
            <div
              className={`p-2 rounded-lg ${
                selectedNode.status === 'critical'
                  ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  : selectedNode.status === 'potentially_affected'
                  ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
              }`}
            >
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-white text-sm">{selectedNode.name}</span>
                <span className="px-2 py-0.5 rounded font-mono text-[10px] bg-slate-800 text-slate-300">
                  {selectedNode.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                    selectedNode.status === 'critical'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      : selectedNode.status === 'potentially_affected'
                      ? 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  }`}
                >
                  {selectedNode.status.toUpperCase()}
                </span>
              </div>
              <p className="text-slate-400 text-xs mt-0.5">
                Location: {selectedNode.location} · Turbidity: {selectedNode.readings.turbidity} NTU · pH:{' '}
                {selectedNode.readings.pH} · TDS: {selectedNode.readings.tds} ppm
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right font-mono text-slate-400 hidden sm:block">
              <div>
                Downstream Reach:{' '}
                <span className="text-cyan-300 font-bold">{activeDownstreamIds.size} nodes</span>
              </div>
              <div className="text-[10px] text-slate-500">
                Upstream Feeders: {activeUpstreamIds.size} nodes
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
