import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';
import { RawSensorTelemetry } from './decisionEngine';

export interface CalibrationConfig {
  rawZeroNtu: number;      // Raw ADC reading in clear water (0 NTU)
  rawHighNtu: number;      // Raw ADC reading in calibrated high NTU sample
  calibratedHighNtu: number; // Known NTU value of sample (e.g., 100 NTU)
  coeffA: number;          // Quad term: NTU = a*V^2 + b*V + c
  coeffB: number;
  coeffC: number;
}

export const DEFAULT_CALIBRATION: CalibrationConfig = {
  rawZeroNtu: 2550,
  rawHighNtu: 1200,
  calibratedHighNtu: 100,
  coeffA: 0,
  coeffB: -3.5,
  coeffC: 8.8,
};

export class SerialHardwareService {
  private port: SerialPort | null = null;
  private parser: ReadlineParser | null = null;
  private connectedPortName: string | null = null;
  private baudRate = 115200;
  private isConnected = false;
  private autoReconnect = false;
  private lastReading: RawSensorTelemetry | null = null;
  private calibration: CalibrationConfig = { ...DEFAULT_CALIBRATION };

  // ---- EMA Smoothing State (alpha = 0.2 → heavy smoothing, stable values) ----
  private readonly EMA_ALPHA = 0.2;
  private emaph: number | null = null;
  private emaTds: number | null = null;
  private emaTurbidity: number | null = null;
  private emaTemperature: number | null = null;

  // ---- Plain-text Block Accumulator (collects full reading between === markers) ----
  private blockPh: number | null = null;
  private blockTds: number | null = null;
  private blockTemp: number | null = null;
  private blockTurb: number | null = null;
  private blockTurbRaw: number | null = null;
  private blockTurbVoltage: number | null = null;
  private inBlock = false;

  private onDataCallback: ((reading: RawSensorTelemetry) => void) | null = null;
  private onErrorCallback: ((errorMsg: string) => void) | null = null;
  private onStatusChangeCallback: ((connected: boolean, port: string | null) => void) | null = null;

  public setOnDataListener(cb: (reading: RawSensorTelemetry) => void) {
    this.onDataCallback = cb;
  }

  public setOnErrorListener(cb: (errorMsg: string) => void) {
    this.onErrorCallback = cb;
  }

  public setOnStatusChangeListener(cb: (connected: boolean, port: string | null) => void) {
    this.onStatusChangeCallback = cb;
  }

  public async listPorts() {
    try {
      const ports = await SerialPort.list();
      return ports.map((p) => ({
        path: p.path,
        manufacturer: p.manufacturer || 'Generic / CP210x',
        serialNumber: p.serialNumber || 'N/A',
        pnpId: p.pnpId || '',
        friendlyName: `${p.path} (${p.manufacturer || 'CP210x UART'})`,
      }));
    } catch (err: any) {
      console.error('[ESP32 Serial] Error listing ports:', err.message);
      return [];
    }
  }

  public async connectPort(path: string, baud: number = 115200): Promise<boolean> {
    if (this.isConnected && this.port) {
      await this.disconnect();
    }

    return new Promise((resolve) => {
      try {
        console.log(`[ESP32 Serial] Attempting connection to ${path} @ ${baud} baud...`);
        this.port = new SerialPort({
          path,
          baudRate: baud,
          autoOpen: false,
        });

        this.port.open((err) => {
          if (err) {
            console.error(`[ESP32 Serial] Failed to open ${path}:`, err.message);
            if (this.onErrorCallback) this.onErrorCallback(`Connection failed on ${path}: ${err.message}`);
            this.isConnected = false;
            this.connectedPortName = null;
            if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, null);
            resolve(false);
            return;
          }

          console.log(`[ESP32 Serial] Successfully connected to ${path}`);
          this.isConnected = true;
          this.connectedPortName = path;
          this.baudRate = baud;
          this.autoReconnect = true;

          this.parser = this.port!.pipe(new ReadlineParser({ delimiter: '\n' }));

          // Listen to raw data chunks in addition to line parser for maximum compatibility
          this.port!.on('data', (buffer: Buffer) => {
            const rawText = buffer.toString('utf-8');
            this.handleRawDataBuffer(rawText);
          });

          this.parser.on('data', (line: string) => {
            this.handleSerialLine(line);
          });

          this.port!.on('close', () => {
            console.warn(`[ESP32 Serial] Connection closed on ${path}`);
            this.isConnected = false;
            const droppedPort = this.connectedPortName;
            this.connectedPortName = null;
            if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, null);

            if (this.autoReconnect && droppedPort) {
              console.log(`[ESP32 Serial] Scheduling auto-reconnect to ${droppedPort} in 3 seconds...`);
              setTimeout(() => {
                this.connectPort(droppedPort, this.baudRate);
              }, 3000);
            }
          });

          this.port!.on('error', (portErr) => {
            console.error(`[ESP32 Serial] Error on ${path}:`, portErr.message);
            if (this.onErrorCallback) this.onErrorCallback(`Serial Error: ${portErr.message}`);
          });

          if (this.onStatusChangeCallback) this.onStatusChangeCallback(true, path);
          resolve(true);
        });
      } catch (ex: any) {
        console.error(`[ESP32 Serial] Exception opening port:`, ex.message);
        this.isConnected = false;
        this.connectedPortName = null;
        resolve(false);
      }
    });
  }

  public async disconnect(): Promise<void> {
    this.autoReconnect = false;
    if (this.port && this.port.isOpen) {
      return new Promise((resolve) => {
        this.port!.close((err) => {
          if (err) console.error('[ESP32 Serial] Error closing port:', err.message);
          this.isConnected = false;
          this.connectedPortName = null;
          this.port = null;
          this.parser = null;
          if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, null);
          console.log('[ESP32 Serial] Disconnected serial port.');
          resolve();
        });
      });
    } else {
      this.isConnected = false;
      this.connectedPortName = null;
      if (this.onStatusChangeCallback) this.onStatusChangeCallback(false, null);
    }
  }

  private rawBufferAccumulator = '';

  private handleRawDataBuffer(text: string) {
    this.rawBufferAccumulator += text;
    const lines = this.rawBufferAccumulator.split(/\r?\n/);
    // Keep last incomplete line in accumulator
    this.rawBufferAccumulator = lines.pop() || '';

    for (const line of lines) {
      if (line.trim()) {
        this.handleSerialLine(line);
      }
    }
  }

  private handleSerialLine(rawLine: string) {
    const trimmed = rawLine.trim();
    if (!trimmed) return;

    // Log raw incoming serial stream to backend terminal
    console.log(`[RAW SERIAL COM5] ${trimmed}`);

    try {
      // 1. Check if line is a JSON object
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        const parsed = JSON.parse(trimmed);
        if (typeof parsed.ph === 'number' || typeof parsed.tds === 'number') {
          const turbidityVoltage = parsed.turbidityVoltage || (parsed.turbidityRaw ? (parsed.turbidityRaw / 4095.0) * 3.3 : 2.0);

          // ---- Step 1: Hard Guard Rails (reject physically impossible values from floating pins) ----
          let rawPh = parsed.ph as number;
          let rawTds = parsed.tds as number;
          let rawTurb = (parsed.turbidity as number) ?? 0;
          let rawTemp = (parsed.temperature as number) ?? 25.0;

          // If pH pin is floating at 3.3V (raw 4090+) → clamp to last stable EMA or neutral 7.0
          if (rawPh < 2.0 || rawPh > 12.0) {
            rawPh = this.emaph ?? 7.0;
          }
          // If TDS reads impossibly high (> 2000 ppm) or is noise-only → clamp
          if (rawTds < 0 || rawTds > 2000) {
            rawTds = this.emaTds ?? 0;
          }

          // ---- Step 2: Exponential Moving Average — stable, smooth display values ----
          const a = this.EMA_ALPHA;
          this.emaph = this.emaph == null ? rawPh : +(a * rawPh + (1 - a) * this.emaph).toFixed(2);
          this.emaTds = this.emaTds == null ? rawTds : +(a * rawTds + (1 - a) * this.emaTds);
          this.emaTurbidity = this.emaTurbidity == null ? rawTurb : +(a * rawTurb + (1 - a) * this.emaTurbidity).toFixed(1);
          this.emaTemperature = this.emaTemperature == null ? rawTemp : +(a * rawTemp + (1 - a) * this.emaTemperature).toFixed(1);

          const telemetry: RawSensorTelemetry = {
            deviceId: parsed.deviceId || 'ESP32-001 (HARDWARE)',
            timestamp: Date.now(),
            ph: +this.emaph.toFixed(2),
            tds: Math.round(this.emaTds),
            temperature: +this.emaTemperature.toFixed(1),
            turbidity: +Math.max(0, this.emaTurbidity).toFixed(1),
            turbidityRaw: parsed.turbidityRaw || Math.round((turbidityVoltage / 3.3) * 4095),
            turbidityVoltage: +turbidityVoltage.toFixed(3),
          };

          this.lastReading = telemetry;
          console.log(`[ESP32 LIVE HARDWARE DATA] pH=${telemetry.ph}, TDS=${telemetry.tds} ppm, Temp=${telemetry.temperature}°C, Turbidity=${telemetry.turbidity} NTU`);

          if (this.onDataCallback) {
            this.onDataCallback(telemetry);
          }
          return;
        }
      }

      // 2. Fallback parser for key-value plain-text block from Arduino Serial.println()
      // Block format:
      //   ========== WATER QUALITY ==========
      //   pH Raw: 2209 | Voltage: 1.780 V | pH: 7.11
      //   TDS Raw: 460 | Voltage: 0.371 V | TDS: 128 ppm
      //   Temperature: 29.00 °C
      //   Turbidity Raw: 4095 | Voltage: 3.300 V | Turbidity: 0.0 NTU
      //   ===================================
      //
      // Strategy: collect all values between the two === lines, then emit ONE complete reading.
      //
      // NOTE: this path only exists for backward compatibility with an older
      // sketch that prints plain text instead of JSON. It reports REAL,
      // unmodified sensor values (after guard-rail clamping + EMA smoothing)
      // — it must never remap values into a cosmetic "safe-looking" range.
      // A previous version of this function did that; it has been removed
      // because it would have silently hidden genuinely unsafe readings.

      if (trimmed.includes('WATER QUALITY')) {
        // Start of a new block — reset accumulators
        this.blockPh = null;
        this.blockTds = null;
        this.blockTemp = null;
        this.blockTurb = null;
        this.blockTurbRaw = null;
        this.blockTurbVoltage = null;
        this.inBlock = true;
        return;
      }

      if (this.inBlock) {
        // Parse pH (only the last value on the line: "pH: 7.11")
        if (trimmed.startsWith('pH')) {
          const m = trimmed.match(/pH:\s*([\d\.]+)\s*$/);
          if (m) this.blockPh = parseFloat(m[1]);
        }

        // Parse TDS (line ends with "TDS: 128 ppm")
        if (trimmed.startsWith('TDS')) {
          const m = trimmed.match(/TDS:\s*([\d\.]+)/);
          if (m) this.blockTds = parseFloat(m[1]);
        }

        // Parse Temperature
        if (trimmed.startsWith('Temperature')) {
          const m = trimmed.match(/Temperature:\s*([\d\.]+)/);
          if (m) this.blockTemp = parseFloat(m[1]);
        }

        // Parse Turbidity (line: "Turbidity Raw: 4095 | Voltage: 3.300 V | Turbidity: 0.0 NTU")
        if (trimmed.startsWith('Turbidity')) {
          const rawM = trimmed.match(/Raw:\s*(\d+)/);
          const voltM = trimmed.match(/Voltage:\s*([\d\.]+)/);
          const ntuM = trimmed.match(/Turbidity:\s*([\d\.]+)\s*NTU/);
          if (rawM) this.blockTurbRaw = parseInt(rawM[1]);
          if (voltM) this.blockTurbVoltage = parseFloat(voltM[1]);
          if (ntuM) this.blockTurb = parseFloat(ntuM[1]);
        }

        // End of block detected (the closing ===... line)
        if (trimmed.startsWith('===')) {
          this.inBlock = false;

          // Only emit if we have at least pH AND TDS from this block
          if (this.blockPh !== null && this.blockTds !== null) {
            let rawPh = this.blockPh;
            let rawTds = this.blockTds;
            let rawTemp = this.blockTemp ?? 25.0;
            let rawTurb = this.blockTurb ?? 0.0;

            // Hard Guard Rails — clamp to physically valid ranges
            rawPh = Math.min(14.0, Math.max(0.0, rawPh));
            rawTds = Math.min(5000, Math.max(0, rawTds));

            // EMA Smoothing (alpha=0.2 → stable, absorbs spikes)
            const a = this.EMA_ALPHA;
            this.emaph = this.emaph == null ? rawPh : +(a * rawPh + (1 - a) * this.emaph).toFixed(2);
            this.emaTds = this.emaTds == null ? rawTds : +(a * rawTds + (1 - a) * this.emaTds);
            this.emaTurbidity = this.emaTurbidity == null ? rawTurb : +(a * rawTurb + (1 - a) * this.emaTurbidity).toFixed(1);
            this.emaTemperature = this.emaTemperature == null ? rawTemp : +(a * rawTemp + (1 - a) * this.emaTemperature).toFixed(1);

            const telemetry: RawSensorTelemetry = {
              deviceId: 'ESP32-001 (HARDWARE)',
              timestamp: Date.now(),
              ph: +this.emaph.toFixed(2),
              tds: Math.round(this.emaTds),
              temperature: +this.emaTemperature.toFixed(1),
              turbidity: +Math.max(0, this.emaTurbidity).toFixed(1),
              turbidityRaw: this.blockTurbRaw ?? 4095,
              turbidityVoltage: this.blockTurbVoltage ?? 3.3,
            };

            this.lastReading = telemetry;
            console.log(`[ESP32 COMPLETE BLOCK] pH=${telemetry.ph} | TDS=${telemetry.tds} ppm | Temp=${telemetry.temperature}°C | Turb=${telemetry.turbidity} NTU`);
            if (this.onDataCallback) this.onDataCallback({ ...telemetry });
          }
        }
      }

    } catch (err: any) {
      // Ignore non-parseable lines
    }
  }

  public getStatus() {
    return {
      connected: this.isConnected,
      port: this.connectedPortName,
      baudRate: this.baudRate,
      lastReading: this.lastReading,
      calibration: this.calibration,
    };
  }

  public updateCalibration(config: Partial<CalibrationConfig>) {
    this.calibration = { ...this.calibration, ...config };
    return this.calibration;
  }
}