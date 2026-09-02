import { evaluateParameterStatus, ParameterEvaluation } from './bisRules';

export interface RawSensorTelemetry {
  deviceId: string;
  timestamp: number;
  ph: number;
  tds: number;
  temperature: number;
  turbidity: number;
  turbidityRaw: number;
  turbidityVoltage: number;
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
  riskScore: number; // 0 to 100
  parameters: {
    ph: ParameterEvaluation;
    tds: ParameterEvaluation;
    temperature: ParameterEvaluation;
    turbidity: ParameterEvaluation;
  };
  reasons: string[];
  anomalies: AnomalyRecord[];
  probableProblemClass: string;
  recommendation: string;
  treatmentSteps: string[];
}

export class WaterQualityDecisionEngine {
  private historyWindow: RawSensorTelemetry[] = [];
  private readonly maxHistorySize = 30;
  private anomalyHistory: AnomalyRecord[] = [];

  public processReading(reading: RawSensorTelemetry): WaterDecisionOutput {
    // 1. Parameter Evaluations against BIS IS 10500
    const phEval = evaluateParameterStatus('ph', reading.ph);
    const tdsEval = evaluateParameterStatus('tds', reading.tds);
    const tempEval = evaluateParameterStatus('temperature', reading.temperature);
    const turbEval = evaluateParameterStatus('turbidity', reading.turbidity);

    const reasons: string[] = [];
    const anomaliesDetected: AnomalyRecord[] = [];

    // 2. Anomaly Detection (Rate of Change & Baseline Moving Average)
    if (this.historyWindow.length >= 3) {
      const recent = this.historyWindow.slice(-5);
      const avgTurbidity = recent.reduce((sum, r) => sum + r.turbidity, 0) / recent.length;
      const prevReading = this.historyWindow[this.historyWindow.length - 1];

      // Turbidity Sudden Change Spike (e.g. 0.5 -> 8.0 NTU)
      if (reading.turbidity > avgTurbidity + 2.0 && reading.turbidity > 3.0) {
        const anomaly: AnomalyRecord = {
          id: `ANOM-${Date.now().toString().slice(-6)}`,
          timestamp: new Date(reading.timestamp || Date.now()).toISOString(),
          deviceId: reading.deviceId,
          parameter: 'turbidity',
          previousValue: +avgTurbidity.toFixed(2),
          currentValue: reading.turbidity,
          severity: reading.turbidity > 5.0 ? 'critical' : 'warning',
          probableCause: 'Suspended solids / particulate disturbance in transmission pipeline',
          recommendation: 'Initiate coagulation + sedimentation + multi-media filtration',
        };
        anomaliesDetected.push(anomaly);
        this.anomalyHistory.unshift(anomaly);
      }

      // TDS Sudden Change Spike
      if (Math.abs(reading.tds - prevReading.tds) > 150) {
        const anomaly: AnomalyRecord = {
          id: `ANOM-${Date.now().toString().slice(-6)}`,
          timestamp: new Date(reading.timestamp || Date.now()).toISOString(),
          deviceId: reading.deviceId,
          parameter: 'tds',
          previousValue: prevReading.tds,
          currentValue: reading.tds,
          severity: reading.tds > 1000 ? 'critical' : 'warning',
          probableCause: 'Dissolved minerals / saline intrusion or chemical dosage anomaly',
          recommendation: 'Conduct conductivity audit & verify membrane desalination pathway',
        };
        anomaliesDetected.push(anomaly);
        this.anomalyHistory.unshift(anomaly);
      }
    }

    // Keep history window trimmed
    this.historyWindow.push(reading);
    if (this.historyWindow.length > this.maxHistorySize) {
      this.historyWindow.shift();
    }

    // 3. Transparent Risk Score Calculation (100 = Perfect SAFE, 0 = Extremely Unsafe)
    let scorePenalty = 0;

    // Turbidity Scoring
    if (turbEval.status === 'CRITICAL') {
      scorePenalty += 35;
      reasons.push(`Turbidity: HIGH (${reading.turbidity} NTU - exceeds 5.0 NTU ceiling)`);
    } else if (turbEval.status === 'WARNING') {
      scorePenalty += 15;
      reasons.push(`Turbidity: ELEVATED (${reading.turbidity} NTU - exceeds 1.0 NTU target)`);
    }

    // TDS Scoring
    if (tdsEval.status === 'CRITICAL') {
      scorePenalty += 35;
      reasons.push(`TDS: CRITICAL HIGH (${reading.tds} mg/L - exceeds 2000 mg/L permissible ceiling)`);
    } else if (tdsEval.status === 'WARNING') {
      scorePenalty += 15;
      reasons.push(`TDS: HIGH (${reading.tds} mg/L - exceeds 500 mg/L acceptable limit)`);
    }

    // pH Scoring
    if (phEval.status === 'CRITICAL') {
      scorePenalty += 30;
      reasons.push(`pH: CRITICAL (${reading.ph} - severe acid/alkali deviation)`);
    } else if (phEval.status === 'WARNING') {
      scorePenalty += 12;
      reasons.push(`pH: DEVIATED (${reading.ph} - outside 6.5–8.5 band)`);
    }

    // Temperature Scoring
    if (tempEval.status === 'WARNING') {
      scorePenalty += 5;
      reasons.push(`Temperature: ANOMALY (${reading.temperature} °C)`);
    }

    // Anomaly Penalty
    if (anomaliesDetected.length > 0) {
      scorePenalty += 10;
      reasons.push(`Transient Anomaly Detected: ${anomaliesDetected[0].probableCause}`);
    }

    const calculatedRiskScore = Math.max(0, Math.min(100, 100 - scorePenalty));

    // 4. Overall Status Determination
    let overallStatus: 'SAFE' | 'WARNING' | 'UNSAFE' = 'SAFE';
    if (calculatedRiskScore < 70 || turbEval.status === 'CRITICAL' || tdsEval.status === 'CRITICAL' || phEval.status === 'CRITICAL') {
      overallStatus = 'UNSAFE';
    } else if (calculatedRiskScore < 90 || turbEval.status === 'WARNING' || tdsEval.status === 'WARNING' || phEval.status === 'WARNING') {
      overallStatus = 'WARNING';
    }

    // 5. Probable Problem Classification & Treatment Recommendations
    let probableProblemClass = 'Normal Water Quality Matrix';
    let recommendation = 'Water quality is currently within standard configured limits.';
    const treatmentSteps: string[] = ['Maintain standard telemetry monitoring & disinfection protocol.'];

    if (reading.turbidity > 5.0 && reading.tds > 1000) {
      probableProblemClass = 'Combined Suspended Solids & High Dissolved Mineral Event';
      recommendation = 'High turbidity and high dissolved solids detected simultaneously.';
      treatmentSteps.length = 0;
      treatmentSteps.push('Step 1: Rapid mixing with alum/polyelectrolyte coagulant.');
      treatmentSteps.push('Step 2: Flocculation & Lamella plate sedimentation.');
      treatmentSteps.push('Step 3: Dual-media sand & active carbon filtration.');
      treatmentSteps.push('Step 4: Reverse Osmosis / Nano-filtration for TDS reduction.');
      treatmentSteps.push('Step 5: Re-testing water quality prior to grid distribution.');
    } else if (reading.turbidity > 1.0) {
      probableProblemClass = 'Suspended-Solids / Turbidity Elevation';
      recommendation = 'Turbidity spike detected. Suspended particulate matter is above acceptable threshold.';
      treatmentSteps.length = 0;
      treatmentSteps.push('Step 1: Apply chemical coagulation (Alum / PACl dosage).');
      treatmentSteps.push('Step 2: Allow gravity sedimentation in settling basins.');
      treatmentSteps.push('Step 3: Pass effluent through pressure sand filters.');
      treatmentSteps.push('Step 4: Perform post-filter turbidity re-testing.');
    } else if (reading.tds > 500) {
      probableProblemClass = 'High Dissolved Solids / Mineral Salinity';
      recommendation = 'TDS is elevated above 500 mg/L desirable threshold.';
      treatmentSteps.length = 0;
      treatmentSteps.push('Step 1: Inspect upstream source mixing and groundwater blend ratios.');
      treatmentSteps.push('Step 2: Route flow through RO membrane or electrodialysis reversal unit.');
      treatmentSteps.push('Step 3: Conduct re-test and verify TDS < 500 mg/L.');
    } else if (reading.ph < 6.5 || reading.ph > 8.5) {
      probableProblemClass = 'pH Equilibrium Imbalance';
      recommendation = `Water pH (${reading.ph}) is outside the 6.5 - 8.5 potability window.`;
      treatmentSteps.length = 0;
      treatmentSteps.push(reading.ph < 6.5 ? 'Step 1: Dosing with Sodium Carbonate (Soda Ash) or Lime to elevate pH.' : 'Step 1: Dosing with dilute Acid / CO2 neutralization to lower pH.');
      treatmentSteps.push('Step 2: Agitate thoroughly in flash mixer.');
      treatmentSteps.push('Step 3: Re-measure pH stability.');
    }

    if (reasons.length === 0) {
      reasons.push('pH: NORMAL');
      reasons.push('TDS: NORMAL');
      reasons.push('Turbidity: NORMAL');
      reasons.push('Temperature: NORMAL');
    }

    return {
      id: `RDG-${Date.now()}`,
      deviceId: reading.deviceId || 'ESP32-001',
      timestamp: new Date(reading.timestamp || Date.now()).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
      ph: reading.ph,
      tds: reading.tds,
      temperature: reading.temperature,
      turbidity: reading.turbidity,
      turbidityRaw: reading.turbidityRaw,
      turbidityVoltage: reading.turbidityVoltage,
      overallStatus,
      riskScore: calculatedRiskScore,
      parameters: {
        ph: phEval.status,
        tds: tdsEval.status,
        temperature: tempEval.status,
        turbidity: turbEval.status,
      },
      reasons,
      anomalies: anomaliesDetected,
      probableProblemClass,
      recommendation,
      treatmentSteps,
    };
  }

  public getAnomalyHistory(): AnomalyRecord[] {
    return [...this.anomalyHistory];
  }
}
