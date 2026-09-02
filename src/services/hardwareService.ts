import {
  HardwarePortInfo,
  HardwareStatus,
  WaterDecisionOutput,
  DemoScenario,
  CalibrationConfig,
} from '../types';

const API_BASE = 'http://localhost:3001/api';
const WS_URL = 'ws://localhost:3001';

class HardwareService {
  private ws: WebSocket | null = null;
  private mode: 'SIMULATION' | 'HARDWARE' = 'SIMULATION';
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

  constructor() {
    this.connectWebSocket();
  }

  private connectWebSocket() {
    try {
      this.ws = new WebSocket(WS_URL);

      this.ws.onopen = () => {
        console.log('[HardwareService] Connected to backend WebSocket stream');
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
        } catch (err) {
          console.error('[HardwareService] Error parsing WS message:', err);
        }
      };

      this.ws.onclose = () => {
        console.warn('[HardwareService] WebSocket closed. Retrying connection in 3s...');
        setTimeout(() => this.connectWebSocket(), 3000);
      };

      this.ws.onerror = (err) => {
        console.error('[HardwareService] WebSocket error:', err);
      };
    } catch (err) {
      console.error('[HardwareService] Failed to establish WebSocket:', err);
    }
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

  // REST Calls
  public async fetchPorts(): Promise<HardwarePortInfo[]> {
    try {
      const res = await fetch(`${API_BASE}/ports`);
      const data = await res.json();
      return data.ports || [];
    } catch (err) {
      console.error('[HardwareService] Failed to fetch COM ports:', err);
      return [];
    }
  }

  public async connectPort(port: string, baudRate: number = 115200): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch(`${API_BASE}/connect`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ port, baudRate }),
      });
      const data = await res.json();
      if (data.success) {
        this.mode = 'HARDWARE';
        this.hardwareStatus = data.status;
        this.notifyStatus();
      }
      return data;
    } catch (err: any) {
      console.error('[HardwareService] Error connecting port:', err);
      return { success: false, error: err.message || 'Network error' };
    }
  }

  public async disconnectPort(): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/disconnect`, { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        this.mode = 'SIMULATION';
        this.hardwareStatus = data.status;
        this.notifyStatus();
      }
      return data.success;
    } catch (err) {
      console.error('[HardwareService] Error disconnecting port:', err);
      return false;
    }
  }

  public async triggerScenario(scenario: DemoScenario): Promise<boolean> {
    try {
      const res = await fetch(`${API_BASE}/simulation/scenario`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario }),
      });
      const data = await res.json();
      if (data.success) {
        this.mode = 'SIMULATION';
        this.notifyStatus();
      }
      return data.success;
    } catch (err) {
      console.error('[HardwareService] Error triggering scenario:', err);
      return false;
    }
  }

  public async updateCalibration(config: Partial<CalibrationConfig>): Promise<CalibrationConfig | null> {
    try {
      const res = await fetch(`${API_BASE}/calibration`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });
      const data = await res.json();
      if (data.success) {
        this.hardwareStatus.calibration = data.calibration;
        this.notifyStatus();
        return data.calibration;
      }
      return null;
    } catch (err) {
      console.error('[HardwareService] Error updating calibration:', err);
      return null;
    }
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
