export type NodeStatus = 'online' | 'offline' | 'degraded' | 'maintenance';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type AlertSeverity = 'critical' | 'warning' | 'advisory' | 'info';
export type AlertStatus = 'active' | 'investigating' | 'resolved' | 'acknowledged';
export type SensorQualityStatus = 'optimal' | 'acceptable' | 'warning' | 'critical';
export type TimeRange = '1H' | '24H' | '7D';

export type DemoScenario = 'NORMAL' | 'HIGH_TURBIDITY' | 'HIGH_TDS' | 'ABNORMAL_PH' | 'RECOVERY';

export interface HardwarePortInfo {
  path: string;
  manufacturer: string;
  serialNumber: string;
  pnpId: string;
  friendlyName: string;
}

export interface CalibrationConfig {
  rawZeroNtu: number;
  rawHighNtu: number;
  calibratedHighNtu: number;
  coeffA: number;
  coeffB: number;
  coeffC: number;
}

export interface HardwareStatus {
  connected: boolean;
  port: string | null;
  baudRate: number;
  lastReading: any;
  calibration: CalibrationConfig;
}

export interface AnomalyRecord {
  id: string;
  timestamp: string;
  deviceId: string;
  parameter: 'ph' | 'tds' | 'turbidity' | 'temperature';
  previousValue: number;
  currentValue: number;
  severity: 'warning' | 'critical';
  probableCause: string;
  recommendation: string;
}

export interface WaterDecisionOutput {
  id: string;
  deviceId: string;
  timestamp: string;
  ph: number;
  tds: number;
  temperature: number;
  turbidity: number;
  turbidityRaw: number;
  turbidityVoltage: number;
  overallStatus: 'SAFE' | 'WARNING' | 'UNSAFE';
  riskScore: number;
  parameters: {
    ph: 'NORMAL' | 'WARNING' | 'CRITICAL';
    tds: 'NORMAL' | 'WARNING' | 'CRITICAL';
    temperature: 'NORMAL' | 'WARNING' | 'CRITICAL';
    turbidity: 'NORMAL' | 'WARNING' | 'CRITICAL';
  };
  reasons: string[];
  anomalies: AnomalyRecord[];
  probableProblemClass: string;
  recommendation: string;
  treatmentSteps: string[];
}

export interface NodeCoordinates {
  lat: number;
  lng: number;
}

export interface SensorReadingsSnapshot {
  pH: number;
  tds: number; // in ppm or mg/L
  turbidity: number; // in NTU
  temperature: number; // in °C
  residualChlorine?: number; // in mg/L
  dissolvedOxygen?: number; // in mg/L
  flowRate?: number; // in m³/h
  pressure?: number; // in bar
}

export interface MonitoringNode {
  id: string; // e.g. "PALTA-01"
  name: string; // e.g. "Palta Intake & Clarification Unit"
  zone: string; // e.g. "Intake & Water Treatment Plant"
  locationDesc: string;
  status: NodeStatus;
  riskLevel: RiskLevel;
  lastUpdate: string; // relative or timestamp
  batteryLevel: number; // percentage
  signalStrength: number; // in dBm
  pressure: number; // in bar
  flowRate: number; // in m³/h
  pipeDiameterMm: number;
  pipeMaterial: string;
  currentReadings: SensorReadingsSnapshot;
  coordinates: NodeCoordinates;
}

export interface SensorReading {
  id: string;
  parameter: 'wqi' | 'pH' | 'tds' | 'turbidity' | 'temperature' | 'residualChlorine';
  label: string;
  value: number;
  displayValue: string;
  unit: string;
  status: SensorQualityStatus;
  statusLabel: string;
  trend: 'up' | 'down' | 'stable';
  trendPercentage: number;
  historicalSparkline: number[];
  lastUpdated: string;
  bisStandardLimit: string;
  safeRange: [number, number];
  isSimulated?: boolean;
}

export interface AlertItem {
  id: string;
  severity: AlertSeverity;
  node: string;
  nodeName: string;
  timestamp: string;
  timeAgo: string;
  title: string;
  description: string;
  status: AlertStatus;
  parameterAffected?: string;
  observedValue?: string;
  thresholdValue?: string;
  acknowledgedBy?: string;
}

export interface RiskFactor {
  category: string;
  score: number;
  max: number;
  status: 'optimal' | 'moderate' | 'elevated';
  description: string;
}

export interface RiskAssessment {
  score: number; // e.g. 28
  maxScore: number; // 100
  level: 'LOW RISK' | 'MODERATE RISK' | 'HIGH RISK' | 'CRITICAL RISK';
  statusColor: string;
  headline: string;
  shortExplanation: string;
  breakdown: RiskFactor[];
  recommendations: string[];
  lastCalculated: string;
}

export interface TimeSeriesDataPoint {
  timestamp: string;
  timeLabel: string;
  pH: number;
  tds: number;
  turbidity: number;
  temperature: number;
  chlorine?: number;
  wqi?: number;
}

export interface KPISummary {
  overallWQI: SensorReading;
  pH: SensorReading;
  tds: SensorReading;
  turbidity: SensorReading;
  temperature: SensorReading;
  activeAlerts: {
    total: number;
    critical: number;
    warning: number;
    advisory: number;
    statusLabel: string;
    lastUpdated: string;
  };
  monitoringNodes: {
    total: number;
    online: number;
    offline: number;
    degraded: number;
    statusLabel: string;
    lastUpdated: string;
  };
}

export type NavigationPageId =
  | 'dashboard'
  | 'live-monitoring'
  | 'network-map'
  | 'analytics'
  | 'ai-intelligence'
  | 'contamination-localization'
  | 'bis-compliance'
  | 'alerts'
  | 'advanced-detection'
  | 'reports'
  | 'system-architecture';

export interface NavItemConfig {
  id: NavigationPageId;
  label: string;
  icon: string;
  badge?: string | number;
  badgeVariant?: 'blue' | 'amber' | 'emerald' | 'rose' | 'slate';
  section?: 'core' | 'intelligence' | 'compliance_system';
}

// ==========================================
// Pipeline Topology & Propagation Data Models
// ==========================================

export type PipelineNodeType = 'source' | 'node' | 'junction' | 'destination';
export type PipelineNodeStatus =
  | 'healthy'
  | 'warning'
  | 'critical'
  | 'potentially_affected'
  | 'offline';

export interface PipelineNode {
  id: string; // e.g. "NODE-01", "PLANT-01", "DEST-DUMDUM"
  name: string; // e.g. "Palta Raw Intake Unit"
  code: string; // e.g. "NODE-1"
  location: string;
  zone: string;
  type: PipelineNodeType;
  status: PipelineNodeStatus;
  sensorStatus: SensorQualityStatus;
  coordinates: NodeCoordinates;
  readings: SensorReadingsSnapshot;
  batteryLevel?: number;
  signalStrength?: number;
  pressure?: number;
  flowRate?: number;
  pipeDiameterMm?: number;
  pipeMaterial?: string;
  lastTested?: string;
  lastTestResult?: 'pass' | 'warning' | 'critical';
  anomalyReason?: string;
  pathwayIds: string[];
  isFailedSource?: boolean; // Whether this node itself failed quality check
}

export interface PipelineEdge {
  id: string;
  fromNodeId: string;
  toNodeId: string;
  pathwayId: string;
  flowDirection: 'downstream';
  distanceKm?: number;
  flowRateM3h?: number;
  pipeDiameterMm?: number;
  status?: 'normal' | 'impacted' | 'warning';
}

export interface Pathway {
  id: string;
  name: string;
  code: string;
  sourceNodeId: string;
  destination: string;
  destinationNodeId: string;
  nodeIds: string[];
  edgeIds: string[];
  status: 'normal' | 'impacted' | 'warning';
  criticalNodeCount: number;
  affectedNodeCount: number;
  healthyNodeCount: number;
  description: string;
}

export interface NodeTestResult {
  nodeId: string;
  timestamp: string;
  status: 'pass' | 'warning' | 'critical';
  readings: SensorReadingsSnapshot;
  violations: string[];
  summaryMessage: string;
  isAbnormal: boolean;
  affectedDownstreamNodeIds: string[];
  impactedDestinationIds: string[];
}

export interface DownstreamImpactResult {
  failedNodeId: string;
  downstreamNodeIds: string[];
  upstreamNodeIds: string[];
  impactedPathwayIds: string[];
  impactedDestinations: string[];
  severity: AlertSeverity;
  description: string;
}

export interface PipelineGraph {
  nodes: PipelineNode[];
  edges: PipelineEdge[];
  pathways: Pathway[];
}

export type TopologyScenario = 'normal' | 'node2_fail' | 'node3_fail' | 'node6_fail' | 'recovery';

