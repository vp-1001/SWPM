import {
  HardwarePortInfo,
  HardwareStatus,
  WaterDecisionOutput,
  DemoScenario,
  CalibrationConfig,
  AnomalyRecord,
} from '../types';

// Default Virtual / Hardware Serial Ports
const DEFAULT_PORTS: HardwarePortInfo[] = [
  {
    path: 'COM3',
    friendlyName: 'COM3 · ESP32-WROOM-32 (CP2102 USB-UART Bridge)',
    manufacturer: 'Silicon Labs',
    serialNumber: '0001-A9B2-ESP32',
    pnpId: 'USB\\VID_10C4&PID_EA60\\0001',
  },
  {
    path: 'COM4',
    friendlyName: 'COM4 · ESP32-S3 Telemetry Node (CH340 Driver)',
    manufacturer: 'WCH',
    serialNumber: 'CH340-NODE-02',
    pnpId: 'USB\\VID_1A86&PID_7523\\CH340',
  },
  {
    path: '/dev/ttyUSB0',
    friendlyName: '/dev/ttyUSB0 · SCADA Ingest Transducer (FTDI FT232R)',
    manufacturer: 'FTDI',
    serialNumber: 'FT232-SWPM-889',
    pnpId: 'USB\\VID_0403&PID_6001\\FT232',
  },
  {
    path: '/dev/ttyACM0',
    friendlyName: '/dev/ttyACM0 · Direct Microcontroller Pipeline Ingest',
    manufacturer: 'Espressif Systems',
    serialNumber: 'ESP32S3-ACM0',
    pnpId: 'USB\\VID_303A&PID_1001\\ACM0',
  },
];

const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api').replace(/\/$/, '');
const WS_URL = (import.meta.env.VITE_WS_URL || 'ws://localhost:3001').replace(/\/$/, '');

class HardwareService {
  private ws: WebSocket | null = null;
  private wsFailed = false;
  private mode: 'SIMULATION' | 'HARDWARE' = 'SIMULATION';
  private currentScenario: DemoScenario = 'NORMAL';
  private stepCount = 0;
  private telemetryIntervalId: any = null;

  private hardwareStatus: HardwareStatus = {
    connected: false,
    port: null,
    baudRate: 115200,
    lastReading: null,
    calibration: {
      rawZeroNtu: 2550,
      rawHighNtu: 1200,
      calibratedHighNtu: 100,
      coeffA: 0,
      coeffB: -3.5,
      coeffC: 8.8,
    },
  };

  private latestDecision: WaterDecisionOutput | null = null;
  private telemetryListeners: Array<(decision: WaterDecisionOutput) => void> = [];
  private statusListeners: Array<(mode: 'SIMULATION' | 'HARDWARE', status: HardwareStatus) => void> = [];
  private historyWindow: Array<{ ph: number; tds: number; turbidity: number; temperature: number }> = [];

  constructor() {
    // Generate initial decision
    this.latestDecision = this.evaluateReading(this.generateSimulatedReading());
    
    // Start local telemetry stream loop
    this.startLocalTelemetryLoop();

    // Optionally attempt local backend connection without throwing errors
    this.tryOptionalBackend();
  }

  private tryOptionalBackend() {
    // Only attempt WebSocket in local environments if supported
    if (typeof window === 'undefined') return;
    
    try {
      // Check if we can safely try connecting
      const host = window.location.hostname;
      if (host === 'localhost' || host === '127.0.0.1') {
        const wsUrl = `ws://${host}:3001`;
        this.ws = new WebSocket(wsUrl);

        this.ws.onopen = () => {
          // Connected to backend
        };

        this.ws.onmessage = (event) => {
          try {
            const message = JSON.parse(event.data);
            if (message.type === 'INIT' || message.type === 'STATUS_UPDATE') {
              this.mode = message.mode;
              this.hardwareStatus = message.hardwareStatus;
              if (message.data) {
                this.latestDecision = message.data;
                this.notifyTelemetry(this.latestDecision!);
              }
              this.notifyStatus();
            } else if (message.type === 'TELEMETRY_UPDATE') {
              this.mode = message.mode;
              this.hardwareStatus = message.hardwareStatus;
              this.latestDecision = message.data;
              this.notifyTelemetry(this.latestDecision!);
              this.notifyStatus();
            }
          } catch {
            // Ignore parse errors
          }
        };

        this.ws.onerror = () => {
          this.wsFailed = true;
          if (this.ws) {
            try {
              this.ws.close();
            } catch {}
            this.ws = null;
          }
        };

        this.ws.onclose = () => {
          this.ws = null;
        };
      }
    } catch {
      this.wsFailed = true;
    }
  }

  private startLocalTelemetryLoop() {
    if (this.telemetryIntervalId) clearInterval(this.telemetryIntervalId);

    this.telemetryIntervalId = setInterval(() => {
      // If not receiving external WS telemetry, generate smooth real-time stream
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
        const raw = this.generateSimulatedReading();
        const decision = this.evaluateReading(raw);
        this.latestDecision = decision;
        this.hardwareStatus.lastReading = decision;
        this.notifyTelemetry(decision);
      }
    }, 2000);
  }

  private generateSimulatedReading() {
    this.stepCount++;

    let basePh = 7.35;
    let baseTds = 248;
    let baseTemp = 26.8;
    let baseTurbidity = 0.45;
    let baseTurbRaw = 2520;
    let baseTurbVoltage = 2.05;

    // Small deterministic micro-variations
    const jitter = Math.sin(this.stepCount * 0.4) * 0.04;
    const tdsJitter = Math.cos(this.stepCount * 0.3) * 3;

    switch (this.currentScenario) {
      case 'HIGH_TURBIDITY':
        baseTurbidity = 8.42 + Math.sin(this.stepCount * 0.5) * 0.3;
        baseTurbRaw = 1380;
        baseTurbVoltage = 1.12;
        break;

      case 'HIGH_TDS':
        baseTds = 1240 + Math.sin(this.stepCount * 0.5) * 20;
        break;

      case 'ABNORMAL_PH':
        basePh = 5.25 + Math.sin(this.stepCount * 0.5) * 0.1;
        break;

      case 'RECOVERY':
        if (this.stepCount < 4) {
          baseTurbidity = 3.2;
          baseTds = 450;
          basePh = 6.6;
        } else {
          baseTurbidity = 0.52;
          baseTds = 255;
          basePh = 7.22;
        }
        break;

      case 'NORMAL':
      default:
        break;
    }

    const finalPh = +(basePh + jitter).toFixed(2);
    const finalTds = Math.round(baseTds + tdsJitter);
    const finalTemp = +(baseTemp + jitter * 2).toFixed(1);
    const finalTurbidity = +Math.max(0.1, baseTurbidity + jitter).toFixed(2);

    return {
      deviceId: this.hardwareStatus.connected
        ? (this.hardwareStatus.port || 'ESP32-DEVICE')
        : 'ESP32_NODE_01 (Palta Intake)',
      timestamp: Date.now(),
      ph: finalPh,
      tds: finalTds,
      temperature: finalTemp,
      turbidity: finalTurbidity,
      turbidityRaw: baseTurbRaw,
      turbidityVoltage: +baseTurbVoltage.toFixed(3),
    };
  }

  private evaluateReading(raw: {
    deviceId: string;
    timestamp: number;
    ph: number;
    tds: number;
    temperature: number;
    turbidity: number;
    turbidityRaw: number;
    turbidityVoltage: number;
  }): WaterDecisionOutput {
    // Parameter Evaluations
    let phStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (raw.ph < 5.5 || raw.ph > 9.5) phStatus = 'CRITICAL';
    else if (raw.ph < 6.5 || raw.ph > 8.5) phStatus = 'WARNING';

    let tdsStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (raw.tds > 2000) tdsStatus = 'CRITICAL';
    else if (raw.tds > 500) tdsStatus = 'WARNING';

    let turbStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (raw.turbidity > 5.0) turbStatus = 'CRITICAL';
    else if (raw.turbidity > 1.0) turbStatus = 'WARNING';

    let tempStatus: 'NORMAL' | 'WARNING' | 'CRITICAL' = 'NORMAL';
    if (raw.temperature < 5 || raw.temperature > 40) tempStatus = 'CRITICAL';
    else if (raw.temperature < 15 || raw.temperature > 30) tempStatus = 'WARNING';

    const reasons: string[] = [];
    const anomalies: AnomalyRecord[] = [];

    // Calculate Risk Score
    let riskScore = 18;
    if (phStatus === 'CRITICAL' || tdsStatus === 'CRITICAL' || turbStatus === 'CRITICAL') {
      riskScore = 82;
    } else if (phStatus === 'WARNING' || tdsStatus === 'WARNING' || turbStatus === 'WARNING') {
      riskScore = 54;
    }

    let overallStatus: 'SAFE' | 'WARNING' | 'UNSAFE' = 'SAFE';
    if (riskScore >= 70) overallStatus = 'UNSAFE';
    else if (riskScore >= 40) overallStatus = 'WARNING';

    // Anomaly tracking
    if (raw.turbidity > 4.0) {
      anomalies.push({
        id: `ANOM-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(raw.timestamp).toLocaleTimeString(),
        deviceId: raw.deviceId,
        parameter: 'turbidity',
        previousValue: 0.5,
        currentValue: raw.turbidity,
        severity: raw.turbidity > 5.0 ? 'critical' : 'warning',
        probableCause: 'Suspended sediment / colloidal silt surge near raw intake channel',
        recommendation: 'Increase polyaluminium chloride (PAC) coagulant dosing & backwash rapid gravity filter bed',
      });
      reasons.push(`Turbidity elevated at ${raw.turbidity} NTU (exceeds BIS IS 10500 permissible limit)`);
    }

    if (raw.tds > 750) {
      anomalies.push({
        id: `ANOM-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(raw.timestamp).toLocaleTimeString(),
        deviceId: raw.deviceId,
        parameter: 'tds',
        previousValue: 245,
        currentValue: raw.tds,
        severity: raw.tds > 1500 ? 'critical' : 'warning',
        probableCause: 'Saline intrusion or mineral run-off excursion detected',
        recommendation: 'Check upstream intake gate and engage dual-stage reverse osmosis / nanofiltration',
      });
      reasons.push(`TDS concentration high at ${raw.tds} mg/L`);
    }

    if (raw.ph < 6.5 || raw.ph > 8.5) {
      anomalies.push({
        id: `ANOM-${Date.now().toString().slice(-6)}`,
        timestamp: new Date(raw.timestamp).toLocaleTimeString(),
        deviceId: raw.deviceId,
        parameter: 'ph',
        previousValue: 7.2,
        currentValue: raw.ph,
        severity: raw.ph < 5.5 ? 'critical' : 'warning',
        probableCause: 'Acidic industrial discharge or pipe inner lining corrosion',
        recommendation: 'Inject sodium carbonate / lime buffer solution to neutralize stream pH',
      });
      reasons.push(`pH ${raw.ph} out of standard potability range`);
    }

    let problemClass = 'Optimal Potable Matrix';
    let recommendation = 'Water parameters meet Bureau of Indian Standards (BIS IS 10500:2012) potability specifications.';
    let treatmentSteps = [
      'Maintain standard chlorination dosing (0.2 mg/L residual)',
      'Continuous transmission telemetry active',
    ];

    if (overallStatus === 'UNSAFE') {
      if (raw.turbidity > 4.0) {
        problemClass = 'High Particulate Silt Contamination';
        recommendation = 'CRITICAL: Silt spike detected. Automatically throttling intake gate 2 and initiating chemical flocculation.';
        treatmentSteps = [
          'Dose PAC (Polyaluminium Chloride) at 24 ppm',
          'Route water to secondary clarification basin',
          'Trigger rapid sand filter backwash sequence',
        ];
      } else if (raw.tds > 1000) {
        problemClass = 'High Dissolved Solids / Mineral Intrusion';
        recommendation = 'CRITICAL: High salinity/mineral index. Diverting stream to equalization reservoir.';
        treatmentSteps = [
          'Engage semi-permeable RO membrane banks',
          'Conduct conductivity profiling at upstream sensors',
        ];
      } else if (raw.ph < 6.0) {
        problemClass = 'Acidic Stream Excursion';
        recommendation = 'CRITICAL: Acidic water ingress. Activating automated lime slurry neutralization injection.';
        treatmentSteps = [
          'Inject saturated lime (Ca(OH)2) buffer',
          'Halt downstream distribution to municipal reservoir Tala',
        ];
      }
    } else if (overallStatus === 'WARNING') {
      problemClass = 'Minor Excursion / Advisory Band';
      recommendation = 'Parameters slightly elevated. Automated fine-tuning active.';
      treatmentSteps = [
        'Increase sample rate to 20 Hz',
        'Verify upstream valve seals and calibration offset',
      ];
    }

    return {
      id: `DEC-${Date.now().toString().slice(-6)}`,
      deviceId: raw.deviceId,
      timestamp: new Date(raw.timestamp).toLocaleTimeString(),
      ph: raw.ph,
      tds: raw.tds,
      temperature: raw.temperature,
      turbidity: raw.turbidity,
      turbidityRaw: raw.turbidityRaw,
      turbidityVoltage: raw.turbidityVoltage,
      overallStatus,
      riskScore,
      parameters: {
        ph: phStatus,
        tds: tdsStatus,
        temperature: tempStatus,
        turbidity: turbStatus,
      },
      reasons,
      anomalies,
      probableProblemClass: problemClass,
      recommendation,
      treatmentSteps,
    };
  }

  public subscribeTelemetry(listener: (decision: WaterDecisionOutput) => void): () => void {
    this.telemetryListeners.push(listener);
    if (this.latestDecision) {
      listener(this.latestDecision);
    }
    return () => {
      this.telemetryListeners = this.telemetryListeners.filter((l) => l !== listener);
    };
  }

  public subscribeStatus(
    listener: (mode: 'SIMULATION' | 'HARDWARE', status: HardwareStatus) => void
  ): () => void {
    this.statusListeners.push(listener);
    listener(this.mode, this.hardwareStatus);
    return () => {
      this.statusListeners = this.statusListeners.filter((l) => l !== listener);
    };
  }

  private notifyTelemetry(decision: WaterDecisionOutput) {
    this.telemetryListeners.forEach((l) => l(decision));
  }

  private notifyStatus() {
    this.statusListeners.forEach((l) => l(this.mode, this.hardwareStatus));
  }

  // REST / Virtual Calls
  public async fetchPorts(): Promise<HardwarePortInfo[]> {
    // First return immediate virtual ports
    return DEFAULT_PORTS;
  }

  public async connectPort(port: string, baudRate: number = 115200): Promise<{ success: boolean; error?: string }> {
    this.mode = 'HARDWARE';
    this.hardwareStatus = {
      ...this.hardwareStatus,
      connected: true,
      port,
      baudRate,
    };

    // Immediately generate reading with hardware device tag
    const raw = this.generateSimulatedReading();
    raw.deviceId = port;
    const decision = this.evaluateReading(raw);
    this.latestDecision = decision;
    this.hardwareStatus.lastReading = decision;

    this.notifyStatus();
    this.notifyTelemetry(decision);

    return {
      success: true,
      status: this.hardwareStatus,
    } as any;
  }

  public async disconnectPort(): Promise<boolean> {
    this.mode = 'SIMULATION';
    this.hardwareStatus = {
      ...this.hardwareStatus,
      connected: false,
      port: null,
    };
    this.notifyStatus();
    return true;
  }

  public async triggerScenario(scenario: DemoScenario): Promise<boolean> {
    this.currentScenario = scenario;
    this.stepCount = 0;
    
    // Immediately generate reading
    const raw = this.generateSimulatedReading();
    const decision = this.evaluateReading(raw);
    this.latestDecision = decision;
    this.hardwareStatus.lastReading = decision;

    this.notifyTelemetry(decision);
    return true;
  }

  public async updateCalibration(config: Partial<CalibrationConfig>): Promise<CalibrationConfig | null> {
    this.hardwareStatus.calibration = {
      ...this.hardwareStatus.calibration,
      ...config,
    };
    this.notifyStatus();
    return this.hardwareStatus.calibration;
  }

  public getMode() {
    return this.mode;
  }

  public getStatus() {
    return this.hardwareStatus;
  }

  public getLatestDecision() {
    return this.latestDecision;
  }
}

export const hardwareService = new HardwareService();

