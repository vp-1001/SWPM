export type NodeStatus = 'online' | 'offline' | 'degraded' | 'maintenance';
export type RiskLevel = 'low' | 'moderate' | 'high' | 'critical';
export type AlertSeverity = 'critical' | 'warning' | 'advisory' | 'info';
export type AlertStatus = 'active' | 'investigating' | 'resolved' | 'acknowledged';
export type SensorQualityStatus = 'optimal' | 'acceptable' | 'warning' | 'critical';
export type TimeRange = '24H' | '7D' | '30D';

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
