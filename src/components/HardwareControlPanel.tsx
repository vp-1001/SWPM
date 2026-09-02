import React, { useState, useEffect } from 'react';
import {
  Cpu,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertCircle,
  Play,
  Sliders,
  Radio,
  Settings2,
  Activity,
  Layers,
} from 'lucide-react';
import {
  HardwarePortInfo,
  HardwareStatus,
  DemoScenario,
  WaterDecisionOutput,
} from '../types';
import { hardwareService } from '../services/hardwareService';

interface HardwareControlPanelProps {
  currentDecision: WaterDecisionOutput | null;
}

export const HardwareControlPanel: React.FC<HardwareControlPanelProps> = ({ currentDecision }) => {
  const [ports, setPorts] = useState<HardwarePortInfo[]>([]);
  const [selectedPort, setSelectedPort] = useState<string>('');
  const [baudRate, setBaudRate] = useState<number>(115200);
  const [isLoadingPorts, setIsLoadingPorts] = useState<boolean>(false);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [mode, setMode] = useState<'SIMULATION' | 'HARDWARE'>('SIMULATION');
  const [status, setStatus] = useState<HardwareStatus>(hardwareService.getStatus());
  const [activeScenario, setActiveScenario] = useState<DemoScenario>('NORMAL');
  const [showCalibration, setShowCalibration] = useState<boolean>(false);

  // Calibration Form
  const [coeffB, setCoeffB] = useState<number>(-3.5);
  const [coeffC, setCoeffC] = useState<number>(8.8);

  useEffect(() => {
    const unsub = hardwareService.subscribeStatus((newMode, newStatus) => {
      setMode(newMode);
      setStatus(newStatus);
      if (newStatus.calibration) {
        setCoeffB(newStatus.calibration.coeffB);
        setCoeffC(newStatus.calibration.coeffC);
      }
    });
    handleScanPorts();
    return () => unsub();
  }, []);

  const handleScanPorts = async () => {
    setIsLoadingPorts(true);
    setErrorMessage(null);
    const available = await hardwareService.fetchPorts();
    setPorts(available);
    if (available.length > 0 && !selectedPort) {
      setSelectedPort(available[0].path);
    }
    setIsLoadingPorts(false);
  };

  const handleConnect = async () => {
    if (!selectedPort) {
      setErrorMessage('Please select a valid COM port.');
      return;
    }
    setIsConnecting(true);
    setErrorMessage(null);
    const res = await hardwareService.connectPort(selectedPort, baudRate);
    if (!res.success) {
      setErrorMessage(res.error || 'Failed to connect to port');
    }
    setIsConnecting(false);
  };

  const handleDisconnect = async () => {
    setIsConnecting(true);
    await hardwareService.disconnectPort();
    setIsConnecting(false);
  };

  const handleTriggerScenario = async (scenario: DemoScenario) => {
    setActiveScenario(scenario);
    await hardwareService.triggerScenario(scenario);
  };

  const handleSaveCalibration = async () => {
    await hardwareService.updateCalibration({ coeffB, coeffC });
    setShowCalibration(false);
  };

  return (
    <div
      id="hardware-control-panel"
      className="p-5 rounded-2xl bg-slate-900/95 border border-slate-800 shadow-xl space-y-5 transition-all"
    >
      {/* 1. Header & Live Mode Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 shadow-inner">
            <Cpu className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white tracking-wide font-mono">
                ESP32 Hardware Telemetry & Controller
              </h3>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                CP210x UART
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Live Sensor Ingest: pH, TDS, Temperature, Turbidity (GPIO 32)
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex items-center gap-2">
          {mode === 'HARDWARE' && status.connected ? (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              HARDWARE CONNECTED ({status.port})
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-500/40">
              <Radio className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              SIMULATION MODE ACTIVE
            </span>
          )}
        </div>
      </div>

      {/* 2. Connection Controls Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-end">
        {/* COM Port Selector */}
        <div className="lg:col-span-4 space-y-1.5">
          <label className="text-xs font-mono font-medium text-slate-300 flex items-center justify-between">
            <span>Select Serial COM Port</span>
            <button
              onClick={handleScanPorts}
              disabled={isLoadingPorts}
              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 font-mono"
            >
              <RefreshCw className={`w-3 h-3 ${isLoadingPorts ? 'animate-spin' : ''}`} />
              Scan Ports
            </button>
          </label>
          <select
            value={selectedPort}
            onChange={(e) => setSelectedPort(e.target.value)}
            disabled={status.connected}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-60"
          >
            {ports.length === 0 ? (
              <option value="">No COM ports detected (Plug in ESP32)</option>
            ) : (
              ports.map((p) => (
                <option key={p.path} value={p.path}>
                  {p.friendlyName}
                </option>
              ))
            )}
          </select>
        </div>

        {/* Baud Rate */}
        <div className="lg:col-span-3 space-y-1.5">
          <label className="text-xs font-mono font-medium text-slate-300">Baud Rate</label>
          <select
            value={baudRate}
            onChange={(e) => setBaudRate(Number(e.target.value))}
            disabled={status.connected}
            className="w-full px-3 py-2 rounded-lg bg-slate-950 border border-slate-800 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-60"
          >
            <option value={115200}>115200 Baud (Standard)</option>
            <option value={9600}>9600 Baud</option>
            <option value={57600}>57600 Baud</option>
          </select>
        </div>

        {/* Action Buttons */}
        <div className="lg:col-span-5 flex items-center gap-2">
          {status.connected ? (
            <button
              onClick={handleDisconnect}
              disabled={isConnecting}
              className="flex-1 py-2 px-4 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 text-xs font-mono font-bold transition-all"
            >
              DISCONNECT ESP32
            </button>
          ) : (
            <button
              onClick={handleConnect}
              disabled={isConnecting || !selectedPort}
              className="flex-1 py-2 px-4 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-mono font-bold transition-all shadow-md shadow-cyan-950/50 flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {isConnecting ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Zap className="w-4 h-4 fill-slate-950" />
              )}
              <span>CONNECT ESP32</span>
            </button>
          )}

          <button
            onClick={() => setShowCalibration(!showCalibration)}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono transition-colors"
            title="Sensor Calibration Settings"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Error Banner */}
      {errorMessage && (
        <div className="p-3 rounded-lg bg-rose-950/70 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* 3. Demo Simulation Scenarios & Quick Test Suite */}
      <div className="pt-3 border-t border-slate-800/80">
        <div className="flex items-center justify-between mb-2.5">
          <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
            <Play className="w-3.5 h-3.5 text-cyan-400" />
            <span>Demonstration & Water Quality Stress Scenarios:</span>
          </span>
          <span className="text-[10px] font-mono text-slate-400">
            Works in both Simulation & Verification Modes
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
          <button
            onClick={() => handleTriggerScenario('NORMAL')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left border ${
              activeScenario === 'NORMAL' && mode === 'SIMULATION'
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>NORMAL</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">SAFE Water</div>
          </button>

          <button
            onClick={() => handleTriggerScenario('HIGH_TURBIDITY')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left border ${
              activeScenario === 'HIGH_TURBIDITY' && mode === 'SIMULATION'
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>TURBIDITY</span>
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">8.4 NTU Spike</div>
          </button>

          <button
            onClick={() => handleTriggerScenario('HIGH_TDS')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left border ${
              activeScenario === 'HIGH_TDS' && mode === 'SIMULATION'
                ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>HIGH TDS</span>
              <span className="w-2 h-2 rounded-full bg-blue-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">1240 mg/L</div>
          </button>

          <button
            onClick={() => handleTriggerScenario('ABNORMAL_PH')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left border ${
              activeScenario === 'ABNORMAL_PH' && mode === 'SIMULATION'
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>pH ACIDIC</span>
              <span className="w-2 h-2 rounded-full bg-rose-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">5.2 pH Low</div>
          </button>

          <button
            onClick={() => handleTriggerScenario('RECOVERY')}
            className={`px-3 py-2 rounded-lg text-xs font-mono font-medium transition-all text-left border ${
              activeScenario === 'RECOVERY' && mode === 'SIMULATION'
                ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40 shadow-sm'
                : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
            }`}
          >
            <div className="font-bold flex items-center justify-between">
              <span>RECOVERY</span>
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
            </div>
            <div className="text-[10px] text-slate-400 mt-0.5">Post-Treatment</div>
          </button>
        </div>
      </div>

      {/* 4. Live Sensor ADC & Voltage Inspection Panel */}
      {currentDecision && (
        <div className="p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/90 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
          <div>
            <div className="text-slate-400 text-[10px]">Turbidity Raw ADC</div>
            <div className="text-slate-100 font-bold mt-0.5">
              {currentDecision.turbidityRaw || 'N/A'} (12-bit)
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Turbidity ADC Voltage</div>
            <div className="text-cyan-300 font-bold mt-0.5">
              {currentDecision.turbidityVoltage ? `${currentDecision.turbidityVoltage} V` : 'N/A'}
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Calibrated Turbidity</div>
            <div className="text-amber-300 font-bold mt-0.5">
              {currentDecision.turbidity} NTU
            </div>
          </div>
          <div>
            <div className="text-slate-400 text-[10px]">Decision Risk Score</div>
            <div className="text-emerald-300 font-bold mt-0.5">
              {currentDecision.riskScore}/100 ({currentDecision.overallStatus})
            </div>
          </div>
        </div>
      )}

      {/* 5. Calibration Modal / Drawer */}
      {showCalibration && (
        <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3 animate-in fade-in duration-200">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <span className="text-xs font-mono font-bold text-white flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-cyan-400" />
              <span>Turbidity Sensor Calibration Coefficients</span>
            </span>
            <button
              onClick={() => setShowCalibration(false)}
              className="text-slate-400 hover:text-white text-xs"
            >
              Close ✕
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
            <div>
              <label className="text-slate-400 text-[11px] block mb-1">Linear Slope (Coeff B)</label>
              <input
                type="number"
                step="0.1"
                value={coeffB}
                onChange={(e) => setCoeffB(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px]">Intercept (Coeff C)</label>
              <input
                type="number"
                step="0.1"
                value={coeffC}
                onChange={(e) => setCoeffC(Number(e.target.value))}
                className="w-full px-3 py-1.5 rounded bg-slate-900 border border-slate-800 text-slate-200"
              />
            </div>
          </div>
          <div className="pt-2 flex justify-end">
            <button
              onClick={handleSaveCalibration}
              className="px-3 py-1.5 rounded bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-mono font-bold text-xs"
            >
              Save Coefficients
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
