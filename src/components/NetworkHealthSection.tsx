import React, { useState } from 'react';
import {
  MonitoringNode,
  NodeStatus,
  RiskLevel,
} from '../types';
import {
  Radio,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Clock,
  Wifi,
  Battery,
  Maximize2,
  X,
  Gauge,
  Droplets,
  Activity,
  Layers,
  MapPin,
} from 'lucide-react';

interface NetworkHealthSectionProps {
  nodes: MonitoringNode[];
  onSelectNode?: (node: MonitoringNode) => void;
}

export const NetworkHealthSection: React.FC<NetworkHealthSectionProps> = ({
  nodes,
}) => {
  const [selectedNodeModal, setSelectedNodeModal] = useState<MonitoringNode | null>(null);
  const [filter, setFilter] = useState<'all' | 'online' | 'degraded'>('all');

  const filteredNodes = nodes.filter((node) => {
    if (filter === 'online') return node.status === 'online';
    if (filter === 'degraded') return node.status === 'degraded' || node.riskLevel !== 'low';
    return true;
  });

  const getStatusBadge = (status: NodeStatus) => {
    switch (status) {
      case 'online':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONLINE
          </span>
        );
      case 'degraded':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-amber-500/15 text-amber-400 border border-amber-500/30">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
            DEGRADED
          </span>
        );
      case 'offline':
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
            OFFLINE
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-400">
            MAINTENANCE
          </span>
        );
    }
  };

  const getRiskBadge = (risk: RiskLevel) => {
    switch (risk) {
      case 'low':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            LOW RISK
          </span>
        );
      case 'moderate':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-950/60 text-amber-300 border border-amber-800/60">
            MODERATE RISK
          </span>
        );
      case 'high':
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-300 border border-rose-800/60">
            HIGH RISK
          </span>
        );
    }
  };

  return (
    <div
      id="network-health-card"
      className="bg-slate-900/90 border border-slate-800/80 rounded-xl p-5 shadow-sm backdrop-blur-sm"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pb-4 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Radio className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              Network Health & Node Telemetry
            </h2>
            <p className="text-xs text-slate-400">
              7 Active SCADA telemetry stations across Kolkata Water Supply network
            </p>
          </div>
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-2">
          <div className="inline-flex p-1 bg-slate-950/80 border border-slate-800 rounded-lg text-xs font-medium">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'all'
                  ? 'bg-slate-800 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({nodes.length})
            </button>
            <button
              onClick={() => setFilter('online')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'online'
                  ? 'bg-emerald-500/20 text-emerald-300 font-semibold'
                  : 'text-slate-400 hover:text-emerald-400'
              }`}
            >
              Optimal (6)
            </button>
            <button
              onClick={() => setFilter('degraded')}
              className={`px-2.5 py-1 rounded-md transition-all ${
                filter === 'degraded'
                  ? 'bg-amber-500/20 text-amber-300 font-semibold'
                  : 'text-slate-400 hover:text-amber-400'
              }`}
            >
              Degraded (1)
            </button>
          </div>
        </div>
      </div>

      {/* Nodes Table / Grid */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-950/50">
              <th className="py-2.5 px-3">Node Code</th>
              <th className="py-2.5 px-3">Location & Zone</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-3">Risk Level</th>
              <th className="py-2.5 px-3">Live Telemetry (pH / TDS / Turbidity)</th>
              <th className="py-2.5 px-3">Hydraulics (P / Q)</th>
              <th className="py-2.5 px-3">Last Update</th>
              <th className="py-2.5 px-3 text-right">Inspect</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-sans">
            {filteredNodes.map((node) => {
              const isDegraded = node.status === 'degraded';
              return (
                <tr
                  key={node.id}
                  id={`node-row-${node.id}`}
                  className={`hover:bg-slate-800/40 transition-colors group cursor-pointer ${
                    isDegraded ? 'bg-amber-500/[0.03]' : ''
                  }`}
                  onClick={() => setSelectedNodeModal(node)}
                >
                  <td className="py-3 px-3 font-mono font-bold text-white flex items-center gap-2">
                    <span className="text-cyan-400 group-hover:text-cyan-300 transition-colors">
                      {node.id}
                    </span>
                    {node.id === 'PALTA-01' && (
                      <span className="text-[9px] font-sans px-1 py-0.2 bg-blue-500/10 text-blue-300 rounded border border-blue-500/20">
                        Intake
                      </span>
                    )}
                    {node.id === 'TALA-01' && (
                      <span className="text-[9px] font-sans px-1 py-0.2 bg-violet-500/10 text-violet-300 rounded border border-violet-500/20">
                        Trunk
                      </span>
                    )}
                  </td>

                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-200">{node.name}</div>
                    <div className="text-[11px] text-slate-400">{node.zone}</div>
                  </td>

                  <td className="py-3 px-3">{getStatusBadge(node.status)}</td>

                  <td className="py-3 px-3">{getRiskBadge(node.riskLevel)}</td>

                  <td className="py-3 px-3 font-mono">
                    <div className="flex items-center gap-2 text-slate-300">
                      <span title="pH">pH {node.currentReadings.pH}</span>
                      <span className="text-slate-400">·</span>
                      <span title="TDS">{node.currentReadings.tds} ppm</span>
                      <span className="text-slate-400">·</span>
                      <span
                        title="Turbidity"
                        className={
                          node.currentReadings.turbidity > 3.5
                            ? 'text-amber-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {node.currentReadings.turbidity} NTU
                      </span>
                    </div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-300">
                    <div>{node.pressure} bar</div>
                    <div className="text-[10px] text-slate-400">{node.flowRate} m³/h</div>
                  </td>

                  <td className="py-3 px-3 font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    <span>{node.lastUpdate}</span>
                  </td>

                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNodeModal(node);
                      }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-cyan-500/20 text-slate-400 hover:text-cyan-300 border border-slate-700/60 transition-colors"
                      title="Inspect Node Details"
                    >
                      <Maximize2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Node Detail Modal / Flyout */}
      {selectedNodeModal && (
        <div
          id="node-detail-modal"
          className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedNodeModal(null)}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-4 border-b border-slate-800">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-lg text-cyan-400">
                    {selectedNodeModal.id}
                  </span>
                  {getStatusBadge(selectedNodeModal.status)}
                  {getRiskBadge(selectedNodeModal.riskLevel)}
                </div>
                <h3 className="text-base font-bold text-white mt-1">{selectedNodeModal.name}</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {selectedNodeModal.locationDesc}
                </p>
              </div>
              <button
                onClick={() => setSelectedNodeModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body: Telemetry Grid */}
            <div className="mt-5 grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase">pH Reading</span>
                <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
                  {selectedNodeModal.currentReadings.pH}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">BIS: 6.5–8.5</div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase">TDS</span>
                <div className="text-xl font-bold font-mono text-blue-400 mt-1">
                  {selectedNodeModal.currentReadings.tds}{' '}
                  <span className="text-xs text-slate-400">ppm</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Desirable &lt;500</div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Turbidity</span>
                <div
                  className={`text-xl font-bold font-mono mt-1 ${
                    selectedNodeModal.currentReadings.turbidity > 3.5
                      ? 'text-amber-400'
                      : 'text-white'
                  }`}
                >
                  {selectedNodeModal.currentReadings.turbidity}{' '}
                  <span className="text-xs text-slate-400">NTU</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Limit &le; 5.0 NTU</div>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-xl border border-slate-800">
                <span className="text-[11px] font-mono text-slate-400 uppercase">Temperature</span>
                <div className="text-xl font-bold font-mono text-violet-400 mt-1">
                  {selectedNodeModal.currentReadings.temperature}
                  <span className="text-xs text-slate-400">°C</span>
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5">Ambient</div>
              </div>
            </div>

            {/* Pipeline Physical Properties & Hardware Stats */}
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                  <Layers className="w-3.5 h-3.5 text-cyan-400" /> Pipeline Asset Specifications
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Diameter:</span>
                  <span className="font-mono text-slate-200">
                    {selectedNodeModal.pipeDiameterMm} mm
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Material:</span>
                  <span className="font-mono text-slate-200">
                    {selectedNodeModal.pipeMaterial}
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Hydro Pressure:</span>
                  <span className="font-mono text-cyan-400 font-semibold">
                    {selectedNodeModal.pressure} bar ({selectedNodeModal.flowRate} m³/h)
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-xl border border-slate-800/80 space-y-2">
                <h4 className="font-semibold text-slate-300 flex items-center gap-1.5 text-xs">
                  <Wifi className="w-3.5 h-3.5 text-emerald-400" /> SCADA Telemetry Health
                </h4>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Signal RSSI:</span>
                  <span className="font-mono text-emerald-400">
                    {selectedNodeModal.signalStrength} dBm (4G / LoRaWAN)
                  </span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800/60">
                  <span className="text-slate-400">Battery Level:</span>
                  <span className="font-mono text-slate-200">
                    {selectedNodeModal.batteryLevel}% (Solar Charged)
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">Coordinates:</span>
                  <span className="font-mono text-slate-400">
                    {selectedNodeModal.coordinates.lat.toFixed(4)}°N,{' '}
                    {selectedNodeModal.coordinates.lng.toFixed(4)}°E
                  </span>
                </div>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="mt-5 pt-4 border-t border-slate-800 flex items-center justify-between">
              <span className="text-[11px] font-mono text-slate-400">
                Last Heartbeat: {selectedNodeModal.lastUpdate}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setSelectedNodeModal(null)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
