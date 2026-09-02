/**
  BIS IS 10500:2012 Bureau of Indian Standards Specification for Drinking Water
  
  Acceptable Limit: Standard target limit for potable drinking water.
  Permissible Limit: Maximum allowable limit in the absence of an alternate source.
*/

export interface BISParameterConfig {
  name: string;
  unit: string;
  acceptableMin?: number;
  acceptableMax?: number;
  permissibleMin?: number;
  permissibleMax?: number;
  warningMin?: number;
  warningMax?: number;
  unsafeMin?: number;
  unsafeMax?: number;
  description: string;
}

export const BIS_IS_10500_CONFIG: Record<string, BISParameterConfig> = {
  ph: {
    name: 'pH Value',
    unit: 'pH',
    acceptableMin: 6.5,
    acceptableMax: 8.5,
    permissibleMin: 6.5,
    permissibleMax: 8.5,
    warningMin: 6.2,
    warningMax: 8.8,
    unsafeMin: 5.5,
    unsafeMax: 9.5,
    description: 'BIS IS 10500 specifies acceptable pH range between 6.5 and 8.5.',
  },
  tds: {
    name: 'Total Dissolved Solids (TDS)',
    unit: 'mg/L',
    acceptableMax: 500,
    permissibleMax: 2000,
    warningMax: 750,
    unsafeMax: 2000,
    description: 'BIS IS 10500 acceptable limit is 500 mg/L, permissible up to 2000 mg/L.',
  },
  turbidity: {
    name: 'Turbidity',
    unit: 'NTU',
    acceptableMax: 1.0,
    permissibleMax: 5.0,
    warningMax: 3.0,
    unsafeMax: 5.0,
    description: 'BIS IS 10500 acceptable limit is 1.0 NTU, permissible up to 5.0 NTU.',
  },
  temperature: {
    name: 'Water Temperature',
    unit: '°C',
    acceptableMin: 15,
    acceptableMax: 30,
    warningMin: 10,
    warningMax: 35,
    unsafeMin: 5,
    unsafeMax: 40,
    description: 'Nominal ambient potable water temperature range.',
  },
};

export type ParameterEvaluation = 'NORMAL' | 'WARNING' | 'CRITICAL';

export function evaluateParameterStatus(
  parameterKey: string,
  value: number
): { status: ParameterEvaluation; label: string; violation?: string } {
  const config = BIS_IS_10500_CONFIG[parameterKey];
  if (!config) return { status: 'NORMAL', label: 'NORMAL' };

  if (parameterKey === 'ph') {
    if (value < config.unsafeMin! || value > config.unsafeMax!) {
      return {
        status: 'CRITICAL',
        label: 'CRITICAL UNACCEPTABLE',
        violation: `pH ${value} breaches safety threshold (${config.acceptableMin} - ${config.acceptableMax})`,
      };
    }
    if (value < config.acceptableMin! || value > config.acceptableMax!) {
      return {
        status: 'WARNING',
        label: 'OUT OF DESIRABLE BAND',
        violation: `pH ${value} outside acceptable limit (${config.acceptableMin} - ${config.acceptableMax})`,
      };
    }
    return { status: 'NORMAL', label: 'NORMAL' };
  }

  if (parameterKey === 'tds') {
    if (value > config.permissibleMax!) {
      return {
        status: 'CRITICAL',
        label: 'EXCEEDS PERMISSIBLE LIMIT',
        violation: `TDS ${value} mg/L exceeds maximum permissible ceiling of 2000 mg/L`,
      };
    }
    if (value > config.acceptableMax!) {
      return {
        status: 'WARNING',
        label: 'EXCEEDS ACCEPTABLE LIMIT',
        violation: `TDS ${value} mg/L exceeds acceptable limit of 500 mg/L`,
      };
    }
    return { status: 'NORMAL', label: 'NORMAL' };
  }

  if (parameterKey === 'turbidity') {
    if (value > config.permissibleMax!) {
      return {
        status: 'CRITICAL',
        label: 'EXCEEDS PERMISSIBLE CEILING',
        violation: `Turbidity ${value} NTU exceeds maximum permissible ceiling of 5.0 NTU`,
      };
    }
    if (value > config.acceptableMax!) {
      return {
        status: 'WARNING',
        label: 'EXCEEDS ACCEPTABLE LIMIT',
        violation: `Turbidity ${value} NTU exceeds acceptable limit of 1.0 NTU`,
      };
    }
    return { status: 'NORMAL', label: 'NORMAL' };
  }

  if (parameterKey === 'temperature') {
    if (value < config.warningMin! || value > config.warningMax!) {
      return {
        status: 'WARNING',
        label: 'TEMPERATURE ANOMALY',
        violation: `Temperature ${value}°C outside nominal ambient range (15–30°C)`,
      };
    }
    return { status: 'NORMAL', label: 'NORMAL' };
  }

  return { status: 'NORMAL', label: 'NORMAL' };
}
