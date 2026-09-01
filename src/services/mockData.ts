import {
  AlertItem,
  KPISummary,
  MonitoringNode,
  RiskAssessment,
  TimeSeriesDataPoint,
  TimeRange,
} from '../types';

// ==========================================
// 1. Centralized Static & Baseline Mock Data
// ==========================================

export const INITIAL_NODES: MonitoringNode[] = [
  {
    id: 'PALTA-01',
    name: 'Palta Raw Water Intake & Screening',
    zone: 'Intake Sector Alpha (Hooghly Riverfront)',
    locationDesc: 'River Intake Pumpstation 1A, Barrier Grid',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: 'Just now (10s ago)',
    batteryLevel: 98,
    signalStrength: -62,
    pressure: 4.8,
    flowRate: 1420,
    pipeDiameterMm: 1200,
    pipeMaterial: 'Ductile Iron (Class K9)',
    currentReadings: {
      pH: 7.42,
      tds: 218,
      turbidity: 3.4,
      temperature: 24.6,
      residualChlorine: 0.1,
      dissolvedOxygen: 6.8,
      flowRate: 1420,
      pressure: 4.8,
    },
    coordinates: { lat: 22.7932, lng: 88.3619 },
  },
  {
    id: 'PALTA-02',
    name: 'Palta Primary Treatment & Clarifier',
    zone: 'Clarification & Rapid Sand Filtration',
    locationDesc: 'Clariflocculator Basin B4 Output',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: 'Just now (18s ago)',
    batteryLevel: 95,
    signalStrength: -67,
    pressure: 5.1,
    flowRate: 1380,
    pipeDiameterMm: 1200,
    pipeMaterial: 'Prestressed Concrete (PCCP)',
    currentReadings: {
      pH: 7.35,
      tds: 194,
      turbidity: 1.8,
      temperature: 24.2,
      residualChlorine: 1.2,
      dissolvedOxygen: 7.2,
      flowRate: 1380,
      pressure: 5.1,
    },
    coordinates: { lat: 22.7955, lng: 88.3645 },
  },
  {
    id: 'TALA-01',
    name: 'Tala Central Reservoir & Booster',
    zone: 'Main Transmission Arterial Trunk',
    locationDesc: 'Overhead Tank Complex Valve House 2',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: '1 min ago',
    batteryLevel: 91,
    signalStrength: -71,
    pressure: 6.2,
    flowRate: 2100,
    pipeDiameterMm: 1500,
    pipeMaterial: 'Mild Steel Mortar Lined',
    currentReadings: {
      pH: 7.28,
      tds: 182,
      turbidity: 1.2,
      temperature: 23.8,
      residualChlorine: 0.85,
      dissolvedOxygen: 7.5,
      flowRate: 2100,
      pressure: 6.2,
    },
    coordinates: { lat: 22.6041, lng: 88.3752 },
  },
  {
    id: 'TALA-02',
    name: 'Tala South Outlet Pressure Chamber',
    zone: 'Secondary Gravity Feeder Network',
    locationDesc: 'Sub-surface Chamber B-12, Junction 9',
    status: 'degraded',
    riskLevel: 'moderate',
    lastUpdate: '45s ago',
    batteryLevel: 78,
    signalStrength: -82,
    pressure: 3.9,
    flowRate: 890,
    pipeDiameterMm: 900,
    pipeMaterial: 'Cast Iron (Rehabilitated)',
    currentReadings: {
      pH: 7.68,
      tds: 245,
      turbidity: 4.85, // Elevated turbidity triggering alert
      temperature: 25.1,
      residualChlorine: 0.35,
      dissolvedOxygen: 6.1,
      flowRate: 890,
      pressure: 3.9,
    },
    coordinates: { lat: 22.5988, lng: 88.3795 },
  },
  {
    id: 'DIST-01',
    name: 'Distribution Node North Metro',
    zone: 'Sector A Urban Municipal Branch',
    locationDesc: 'Avenue 4 Sub-distribution Manifold',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: '2 mins ago',
    batteryLevel: 88,
    signalStrength: -74,
    pressure: 3.4,
    flowRate: 520,
    pipeDiameterMm: 450,
    pipeMaterial: 'High-Density Polyethylene (HDPE)',
    currentReadings: {
      pH: 7.21,
      tds: 198,
      turbidity: 1.4,
      temperature: 24.1,
      residualChlorine: 0.6,
      dissolvedOxygen: 7.1,
      flowRate: 520,
      pressure: 3.4,
    },
    coordinates: { lat: 22.5815, lng: 88.362 },
  },
  {
    id: 'DIST-02',
    name: 'Distribution Node Commercial Hub',
    zone: 'Sector B Commercial High-Demand Loop',
    locationDesc: 'Central Ring Feed Meter Vault #4',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: '3 mins ago',
    batteryLevel: 84,
    signalStrength: -69,
    pressure: 3.8,
    flowRate: 740,
    pipeDiameterMm: 600,
    pipeMaterial: 'Ductile Iron',
    currentReadings: {
      pH: 7.31,
      tds: 205,
      turbidity: 1.9,
      temperature: 24.4,
      residualChlorine: 0.55,
      dissolvedOxygen: 6.9,
      flowRate: 740,
      pressure: 3.8,
    },
    coordinates: { lat: 22.5697, lng: 88.3512 },
  },
  {
    id: 'DIST-03',
    name: 'Distribution Node South Terminal',
    zone: 'Sector C Terminal Zone & Peripheral Line',
    locationDesc: 'South Perimeter Pressure Reduction Station',
    status: 'online',
    riskLevel: 'low',
    lastUpdate: '1 min ago',
    batteryLevel: 93,
    signalStrength: -73,
    pressure: 2.9,
    flowRate: 410,
    pipeDiameterMm: 350,
    pipeMaterial: 'High-Density Polyethylene (HDPE)',
    currentReadings: {
      pH: 7.15,
      tds: 212,
      turbidity: 2.1,
      temperature: 24.9,
      residualChlorine: 0.42,
      dissolvedOxygen: 6.7,
      flowRate: 410,
      pressure: 2.9,
    },
    coordinates: { lat: 22.5412, lng: 88.3498 },
  },
];

export const INITIAL_ALERTS: AlertItem[] = [
  {
    id: 'ALT-8092',
    severity: 'warning',
    node: 'TALA-02',
    nodeName: 'Tala South Outlet Chamber',
    timestamp: '2026-09-01 09:14:22',
    timeAgo: '8 mins ago',
    title: 'Warning — Turbidity deviation',
    description: 'Turbidity spiked to 4.85 NTU, exceeding the 5.0 NTU permissible BIS IS 10500 advisory ceiling and historical rolling baseline by +42%.',
    status: 'active',
    parameterAffected: 'Turbidity',
    observedValue: '4.85 NTU',
    thresholdValue: '1.0 NTU (Desirable) / 5.0 NTU (Permissible)',
  },
  {
    id: 'ALT-8090',
    severity: 'advisory',
    node: 'DIST-03',
    nodeName: 'Distribution Node South Terminal',
    timestamp: '2026-09-01 08:35:10',
    timeAgo: '47 mins ago',
    title: 'Advisory — Residual Chlorine low margin',
    description: 'Chlorine concentration at 0.42 mg/L. Approaching minimum terminal regulatory threshold (0.2 mg/L). Automated booster dosing recommended.',
    status: 'active',
    parameterAffected: 'Residual Chlorine',
    observedValue: '0.42 mg/L',
    thresholdValue: '≥ 0.20 mg/L minimum',
  },
  {
    id: 'ALT-8084',
    severity: 'info',
    node: 'PALTA-01',
    nodeName: 'Palta Raw Water Intake',
    timestamp: '2026-09-01 06:00:00',
    timeAgo: '3.2 hrs ago',
    title: 'Info — Scheduled Backwash Completed',
    description: 'Rapid gravity filter unit 3 backwash cycle completed within standard nominal parameters. Differential pressure normalized to 0.12 bar.',
    status: 'resolved',
    acknowledgedBy: 'Automation Controller SCADA-01',
  },
  {
    id: 'ALT-8079',
    severity: 'advisory',
    node: 'TALA-01',
    nodeName: 'Tala Central Reservoir',
    timestamp: '2026-08-31 22:15:00',
    timeAgo: '11 hrs ago',
    title: 'Advisory — Peak Demand Pressure Fluctuations',
    description: 'Transient pressure drop to 3.8 bar during nighttime peak filling phase. Stabilized within 14 minutes.',
    status: 'acknowledged',
    acknowledgedBy: 'Chief Engineer K. Sen',
  },
];

export const INITIAL_RISK_ASSESSMENT: RiskAssessment = {
  score: 28,
  maxScore: 100,
  level: 'LOW RISK',
  statusColor: 'emerald',
  headline: 'Pipeline Integrity & Potability Index: 91.4% Nominal',
  shortExplanation:
    'Overall network telemetry indicates safe potable delivery conforming to BIS IS 10500 standards across 6 of 7 nodes. Mild turbidity deviation detected at TALA-02 is isolated and undergoing automated acoustic-gradient localization.',
  breakdown: [
    {
      category: 'Biological & Pathogenic Vector Risk',
      score: 12,
      max: 100,
      status: 'optimal',
      description: 'Residual chlorine buffer in main arterial lines is 0.85 mg/L, suppressing microbiological regrowth.',
    },
    {
      category: 'Physicochemical Stability (pH, TDS)',
      score: 18,
      max: 100,
      status: 'optimal',
      description: 'pH 7.28–7.68 and TDS <250 ppm remain firmly in BIS IS 10500 desirable brackets.',
    },
    {
      category: 'Suspended Solids & Turbidity Anomaly',
      score: 44,
      max: 100,
      status: 'moderate',
      description: 'TALA-02 localized sediment shift elevated localized turbidity to 4.85 NTU.',
    },
    {
      category: 'Hydraulic Integrity & Pressure Transients',
      score: 22,
      max: 100,
      status: 'optimal',
      description: 'Pressure gradients along transmission mains remain between 2.9 to 6.2 bar without cavitation.',
    },
  ],
  recommendations: [
    'Maintain continuous automated sampling on node TALA-02 downstream manifold.',
    'Verify chemical dosing rate at Palta Clariflocculator Basin B4.',
    'Inspect South Terminal (DIST-03) secondary chlorination station within 12 hours.',
  ],
  lastCalculated: '2026-09-01 09:20:00 UTC',
};

// ==========================================
// 2. Multi-Line Time Series Generators
// ==========================================

export function generateTimeSeriesData(range: TimeRange): TimeSeriesDataPoint[] {
  const pointsCount = range === '24H' ? 24 : range === '7D' ? 28 : 30;
  const result: TimeSeriesDataPoint[] = [];

  const now = new Date();
  
  for (let i = pointsCount - 1; i >= 0; i--) {
    let dateObj: Date;
    let label = '';

    if (range === '24H') {
      dateObj = new Date(now.getTime() - i * 60 * 60 * 1000);
      label = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } else if (range === '7D') {
      dateObj = new Date(now.getTime() - i * 6 * 60 * 60 * 1000);
      label = `${dateObj.toLocaleDateString([], { weekday: 'short' })} ${dateObj.getHours()}:00`;
    } else {
      dateObj = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      label = `${dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' })}`;
    }

    // Realistic fluctuating curves with slight sinusoidal patterns & realistic noise
    const t = (pointsCount - i) / 4;
    const basePh = 7.32 + Math.sin(t) * 0.18 + (Math.random() - 0.5) * 0.08;
    const baseTds = 195 + Math.cos(t * 0.8) * 16 + (Math.random() - 0.5) * 8;
    
    // Simulate a mild bump in turbidity towards recent points (simulating TALA-02 transient)
    const turbidityBump = i < 5 ? 1.4 * Math.exp(-(5 - i) * 0.2) : 0;
    const baseTurbidity = 1.45 + Math.sin(t * 1.2) * 0.4 + turbidityBump + (Math.random() - 0.5) * 0.15;
    
    const baseTemp = 24.2 + Math.sin(t * 0.5) * 1.1 + (Math.random() - 0.5) * 0.3;
    const baseChlorine = 0.75 + Math.cos(t * 0.7) * 0.15 + (Math.random() - 0.5) * 0.05;
    const baseWqi = 92 - (baseTurbidity > 3 ? 6 : 0) - (basePh > 7.6 ? 2 : 0);

    result.push({
      timestamp: dateObj.toISOString(),
      timeLabel: label,
      pH: Number(basePh.toFixed(2)),
      tds: Math.round(baseTds),
      turbidity: Number(Math.max(0.4, baseTurbidity).toFixed(2)),
      temperature: Number(baseTemp.toFixed(1)),
      chlorine: Number(Math.max(0.1, baseChlorine).toFixed(2)),
      wqi: Math.round(baseWqi),
    });
  }

  return result;
}

// ==========================================
// 3. Service Layer (Easily swap with live API)
// ==========================================

export const INITIAL_KPI_SUMMARY: KPISummary = {
  overallWQI: {
    id: 'kpi-wqi',
    parameter: 'wqi',
    label: 'Overall Water Quality (WQI)',
    value: 91.4,
    displayValue: '91.4',
    unit: 'WQI / 100',
    status: 'optimal',
    statusLabel: 'EXCELLENT',
    trend: 'up',
    trendPercentage: 1.2,
    historicalSparkline: [88.5, 89.2, 90.1, 89.8, 91.0, 90.7, 91.4],
    lastUpdated: '10s ago',
    bisStandardLimit: '≥ 85 (Grade A Potable)',
    safeRange: [85, 100],
    isSimulated: true,
  },
  pH: {
    id: 'kpi-ph',
    parameter: 'pH',
    label: 'System Mean pH',
    value: 7.34,
    displayValue: '7.34',
    unit: 'pH',
    status: 'optimal',
    statusLabel: 'BIS COMPLIANT',
    trend: 'stable',
    trendPercentage: 0.1,
    historicalSparkline: [7.3, 7.32, 7.35, 7.33, 7.36, 7.34, 7.34],
    lastUpdated: '12s ago',
    bisStandardLimit: '6.5 – 8.5 (BIS IS 10500)',
    safeRange: [6.5, 8.5],
    isSimulated: true,
  },
  tds: {
    id: 'kpi-tds',
    parameter: 'tds',
    label: 'Total Dissolved Solids (TDS)',
    value: 202,
    displayValue: '202',
    unit: 'mg/L (ppm)',
    status: 'optimal',
    statusLabel: 'DESIRABLE TIER',
    trend: 'down',
    trendPercentage: -2.4,
    historicalSparkline: [215, 212, 208, 204, 206, 201, 202],
    lastUpdated: '15s ago',
    bisStandardLimit: '< 500 mg/L Desirable',
    safeRange: [50, 500],
    isSimulated: true,
  },
  turbidity: {
    id: 'kpi-turbidity',
    parameter: 'turbidity',
    label: 'Mean Turbidity',
    value: 2.18,
    displayValue: '2.18',
    unit: 'NTU',
    status: 'warning',
    statusLabel: 'ELEVATED AT TALA-02',
    trend: 'up',
    trendPercentage: 14.8,
    historicalSparkline: [1.2, 1.3, 1.4, 1.7, 2.0, 2.3, 2.18],
    lastUpdated: '10s ago',
    bisStandardLimit: '1.0 (Desirable) / 5.0 (Max)',
    safeRange: [0, 5.0],
    isSimulated: true,
  },
  temperature: {
    id: 'kpi-temp',
    parameter: 'temperature',
    label: 'Water Temperature',
    value: 24.3,
    displayValue: '24.3',
    unit: '°C',
    status: 'optimal',
    statusLabel: 'NORMAL',
    trend: 'stable',
    trendPercentage: 0.3,
    historicalSparkline: [23.9, 24.0, 24.2, 24.5, 24.4, 24.2, 24.3],
    lastUpdated: '18s ago',
    bisStandardLimit: 'Ambient (15 – 30°C)',
    safeRange: [15, 30],
    isSimulated: true,
  },
  activeAlerts: {
    total: 2,
    critical: 0,
    warning: 1,
    advisory: 1,
    statusLabel: '1 WARNING, 1 ADVISORY',
    lastUpdated: '8 mins ago',
  },
  monitoringNodes: {
    total: 7,
    online: 6,
    offline: 0,
    degraded: 1,
    statusLabel: '6 / 7 OPTIMAL (85.7%)',
    lastUpdated: 'Continuous Stream',
  },
};

export class WaterMonitoringService {
  private static nodes: MonitoringNode[] = [...INITIAL_NODES];
  private static alerts: AlertItem[] = [...INITIAL_ALERTS];
  private static riskAssessment: RiskAssessment = { ...INITIAL_RISK_ASSESSMENT };

  public static getKPISummary(): KPISummary {
    return INITIAL_KPI_SUMMARY;
  }

  public static getNodes(): MonitoringNode[] {
    return this.nodes;
  }

  public static getNodeById(id: string): MonitoringNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }

  public static getAlerts(): AlertItem[] {
    return this.alerts;
  }

  public static getRiskAssessment(): RiskAssessment {
    return this.riskAssessment;
  }

  public static getTimeSeriesData(range: TimeRange): TimeSeriesDataPoint[] {
    return generateTimeSeriesData(range);
  }

  public static acknowledgeAlert(alertId: string, user = 'Operator Admin'): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.acknowledgedBy = user;
      return true;
    }
    return false;
  }

  public static resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find((a) => a.id === alertId);
    if (alert) {
      alert.status = 'resolved';
      return true;
    }
    return false;
  }
}
