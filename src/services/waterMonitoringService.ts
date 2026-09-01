import {
  AlertItem,
  KPISummary,
  MonitoringNode,
  RiskAssessment,
  TimeSeriesDataPoint,
  TimeRange,
} from '../types';
import {
  INITIAL_ALERTS,
  INITIAL_KPI_SUMMARY,
  INITIAL_NODES,
  INITIAL_RISK_ASSESSMENT,
  generateTimeSeriesData,
} from './mockData';

class WaterMonitoringService {
  private nodes: MonitoringNode[] = [...INITIAL_NODES];
  private alerts: AlertItem[] = [...INITIAL_ALERTS];
  private kpis: KPISummary = { ...INITIAL_KPI_SUMMARY };
  private risk: RiskAssessment = { ...INITIAL_RISK_ASSESSMENT };
  private listeners: Array<() => void> = [];
  private simulationActive = true;
  private lastUpdatedDate: Date = new Date();

  constructor() {
    if (typeof window !== 'undefined') {
      setInterval(() => {
        if (this.simulationActive) {
          this.applyLiveJitter();
        }
      }, 4000);
    }
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify(): void {
    this.lastUpdatedDate = new Date();
    this.listeners.forEach((l) => l());
  }

  public getNodes(): MonitoringNode[] {
    return [...this.nodes];
  }

  public getNodeById(id: string): MonitoringNode | undefined {
    return this.nodes.find((n) => n.id === id);
  }

  public getAlerts(): AlertItem[] {
    return [...this.alerts];
  }

  public getKPISummary(): KPISummary {
    return { ...this.kpis };
  }

  public getRiskAssessment(): RiskAssessment {
    return { ...this.risk };
  }

  public getTimeSeries(range: TimeRange): TimeSeriesDataPoint[] {
    return generateTimeSeriesData(range);
  }

  public getLastUpdated(): Date {
    return this.lastUpdatedDate;
  }

  public toggleSimulation(): boolean {
    this.simulationActive = !this.simulationActive;
    return this.simulationActive;
  }

  public isSimulating(): boolean {
    return this.simulationActive;
  }

  public acknowledgeAlert(alertId: string, user: string = 'Current SCADA Operator'): void {
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'acknowledged',
          acknowledgedBy: user,
        };
      }
      return a;
    });
    this.notify();
  }

  public resolveAlert(alertId: string): void {
    this.alerts = this.alerts.map((a) => {
      if (a.id === alertId) {
        return {
          ...a,
          status: 'resolved',
        };
      }
      return a;
    });
    this.kpis.activeAlerts.warning = Math.max(0, this.kpis.activeAlerts.warning - 1);
    this.kpis.activeAlerts.total = this.alerts.filter((a) => a.status === 'active' || a.status === 'investigating').length;
    this.notify();
  }

  public triggerMockAnomaly(): void {
    const randomNode = this.nodes[Math.floor(Math.random() * this.nodes.length)];
    const newAlert: AlertItem = {
      id: `ALT-${Math.floor(1000 + Math.random() * 9000)}`,
      severity: 'warning',
      node: randomNode.id,
      nodeName: randomNode.name,
      timestamp: new Date().toISOString(),
      timeAgo: 'Just now',
      title: `Micro-pressure oscillation detected at ${randomNode.id}`,
      description: `Hydraulic transient spike (+0.4 bar) logged in acoustic hydrophone sensor. Automatic surge damping engaged.`,
      status: 'active',
      parameterAffected: 'Pressure',
      observedValue: `${(randomNode.pressure + 0.4).toFixed(1)} bar`,
      thresholdValue: 'Nominal ±0.2 bar transient',
    };

    this.alerts = [newAlert, ...this.alerts];
    this.kpis.activeAlerts.total += 1;
    this.kpis.activeAlerts.warning += 1;
    this.notify();
  }

  private applyLiveJitter(): void {
    this.nodes = this.nodes.map((node) => {
      const phDrift = (Math.random() - 0.5) * 0.02;
      const tdsDrift = (Math.random() - 0.5) * 1.5;
      const turbDrift = (Math.random() - 0.5) * 0.04;
      const tempDrift = (Math.random() - 0.5) * 0.05;

      return {
        ...node,
        lastUpdate: 'Just now (<5s)',
        currentReadings: {
          ...node.currentReadings,
          pH: +(node.currentReadings.pH + phDrift).toFixed(2),
          tds: Math.round(node.currentReadings.tds + tdsDrift),
          turbidity: +(Math.max(0.2, node.currentReadings.turbidity + turbDrift)).toFixed(2),
          temperature: +(node.currentReadings.temperature + tempDrift).toFixed(1),
        },
      };
    });

    const avgPh = +(this.nodes.reduce((acc, n) => acc + n.currentReadings.pH, 0) / this.nodes.length).toFixed(2);
    const avgTds = Math.round(this.nodes.reduce((acc, n) => acc + n.currentReadings.tds, 0) / this.nodes.length);
    const avgTurb = +(this.nodes.reduce((acc, n) => acc + n.currentReadings.turbidity, 0) / this.nodes.length).toFixed(2);

    this.kpis.pH.value = avgPh;
    this.kpis.pH.displayValue = avgPh.toString();
    this.kpis.tds.value = avgTds;
    this.kpis.tds.displayValue = avgTds.toString();
    this.kpis.turbidity.value = avgTurb;
    this.kpis.turbidity.displayValue = avgTurb.toString();

    this.notify();
  }
}

export const waterMonitoringService = new WaterMonitoringService();
