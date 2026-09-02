import { WaterQualityDecisionEngine, RawSensorTelemetry, WaterDecisionOutput } from './decisionEngine';

export type DemoScenario = 'NORMAL' | 'HIGH_TURBIDITY' | 'HIGH_TDS' | 'ABNORMAL_PH' | 'RECOVERY';

export class SimulationService {
  private currentScenario: DemoScenario = 'NORMAL';
  private stepCount = 0;

  public setScenario(scenario: DemoScenario) {
    this.currentScenario = scenario;
    this.stepCount = 0;
  }

  public getScenario(): DemoScenario {
    return this.currentScenario;
  }

  public generateSimulatedReading(): RawSensorTelemetry {
    this.stepCount++;

    // Base deterministic values without synthetic Math.random noise
    let basePh = 7.2;
    let baseTds = 250;
    let baseTemp = 27;
    let baseTurbidity = 0.5;
    let baseTurbRaw = 2500;
    let baseTurbVoltage = 2.02;

    switch (this.currentScenario) {
      case 'HIGH_TURBIDITY':
        baseTurbidity = 8.4;
        baseTurbRaw = 1420;
        baseTurbVoltage = 1.15;
        break;

      case 'HIGH_TDS':
        baseTds = 1240;
        break;

      case 'ABNORMAL_PH':
        basePh = 5.2;
        break;

      case 'RECOVERY':
        if (this.stepCount < 3) {
          baseTurbidity = 3.2;
          baseTds = 450;
          basePh = 6.6;
        } else {
          baseTurbidity = 0.55;
          baseTds = 260;
          basePh = 7.15;
        }
        break;

      case 'NORMAL':
      default:
        break;
    }

    return {
      deviceId: 'ESP32-001 (SIMULATED)',
      timestamp: Date.now(),
      ph: +basePh.toFixed(2),
      tds: Math.round(baseTds),
      temperature: +baseTemp.toFixed(1),
      turbidity: +Math.max(0.1, baseTurbidity).toFixed(2),
      turbidityRaw: baseTurbRaw,
      turbidityVoltage: +baseTurbVoltage.toFixed(3),
    };
  }
}
