import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';

import { WaterQualityDecisionEngine, WaterDecisionOutput } from './decisionEngine';
import { SerialHardwareService } from './serialService';
import { SimulationService, DemoScenario } from './simulationService';

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

app.use(express.json());

// Enable CORS for local Vite dev server
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    name: 'SWPM Backend',
    status: 'running',
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    endpoints: [
      '/api/status',
      '/api/readings/latest',
      '/api/readings/history',
      '/api/ports',
      '/api/simulation/scenario',
    ],
  });
});

// Services Initialization
const decisionEngine = new WaterQualityDecisionEngine();
const serialService = new SerialHardwareService();
const simulationService = new SimulationService();

let isSimulationMode = true; // Default to simulation mode until hardware connected
let latestProcessedDecision: WaterDecisionOutput | null = null;
const readingHistory: WaterDecisionOutput[] = [];
const MAX_HISTORY = 100;

// Broadcast payload to all connected WebSockets
function broadcast(data: any) {
  const jsonStr = JSON.stringify(data);
  wss.clients.forEach((client) => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(jsonStr);
    }
  });
}

// Process incoming telemetry (from Serial OR Simulator)
function handleNewTelemetry(rawTelemetry: any) {
  const decision = decisionEngine.processReading(rawTelemetry);
  latestProcessedDecision = decision;

  readingHistory.push(decision);
  if (readingHistory.length > MAX_HISTORY) readingHistory.shift();

  console.log(`[ANALYTICS] Water evaluated: Status=${decision.overallStatus}, RiskScore=${decision.riskScore}`);
  if (decision.anomalies.length > 0) {
    console.log(`[ANALYTICS] ${decision.anomalies[0].parameter} anomaly detected! Cause: ${decision.anomalies[0].probableCause}`);
  }

  // Broadcast real-time update event
  broadcast({
    type: 'TELEMETRY_UPDATE',
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    hardwareStatus: serialService.getStatus(),
    data: decision,
  });
}

// Wire Serial Data Event Handler
serialService.setOnDataListener((rawTelemetry) => {
  if (!isSimulationMode) {
    handleNewTelemetry(rawTelemetry);
  }
});

// Wire Serial Status Change Handler
serialService.setOnStatusChangeListener((connected, port) => {
  console.log(`[ESP32] Connection state changed: connected=${connected}, port=${port}`);
  if (connected) {
    isSimulationMode = false;
  }
  broadcast({
    type: 'STATUS_UPDATE',
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    hardwareStatus: serialService.getStatus(),
  });
});

// Timer for Simulation Mode Telemetry Loop
setInterval(() => {
  if (isSimulationMode) {
    const rawSim = simulationService.generateSimulatedReading();
    handleNewTelemetry(rawSim);
  }
}, 2000);

// ==========================================
// REST API ENDPOINTS
// ==========================================

// 1. List Available COM Ports
app.get('/api/ports', async (req, res) => {
  const ports = await serialService.listPorts();
  res.json({ success: true, ports });
});

// 2. Connect to Serial Port
app.post('/api/connect', async (req, res) => {
  const { port, baudRate } = req.body;
  if (!port) {
    return res.status(400).json({ success: false, error: 'Port path is required' });
  }

  const baud = baudRate ? parseInt(baudRate, 10) : 115200;
  console.log(`[ESP32] Connection request for ${port} @ ${baud} baud`);
  const success = await serialService.connectPort(port, baud);

  if (success) {
    isSimulationMode = false;
    return res.json({
      success: true,
      message: `Connected to ${port} @ ${baud}`,
      status: serialService.getStatus(),
    });
  } else {
    return res.status(500).json({
      success: false,
      error: `Failed to open port ${port}. Ensure device is plugged in and not in use.`,
    });
  }
});

// 3. Disconnect Serial Port
app.post('/api/disconnect', async (req, res) => {
  await serialService.disconnect();
  isSimulationMode = true; // Fallback to simulation mode on disconnect
  res.json({
    success: true,
    message: 'Serial port disconnected. Switched to Simulation Mode.',
    status: serialService.getStatus(),
  });
});

// 4. Get Current Status
app.get('/api/status', (req, res) => {
  res.json({
    success: true,
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    scenario: simulationService.getScenario(),
    hardware: serialService.getStatus(),
    latestReading: latestProcessedDecision,
  });
});

// 5. Get Latest Decision & Sensor Reading
app.get('/api/readings/latest', (req, res) => {
  res.json({
    success: true,
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    data: latestProcessedDecision,
  });
});

// 6. Get Historical Readings
app.get('/api/readings/history', (req, res) => {
  res.json({
    success: true,
    count: readingHistory.length,
    history: readingHistory,
    anomalies: decisionEngine.getAnomalyHistory(),
  });
});

// 7. Toggle Mode (SIMULATION vs REAL HARDWARE)
app.post('/api/simulation/mode', (req, res) => {
  const { mode } = req.body;
  if (mode === 'HARDWARE') {
    if (!serialService.getStatus().connected) {
      return res.status(400).json({
        success: false,
        error: 'Cannot switch to HARDWARE mode because no ESP32 COM port is currently connected.',
      });
    }
    isSimulationMode = false;
  } else {
    isSimulationMode = true;
  }

  broadcast({
    type: 'STATUS_UPDATE',
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
    hardwareStatus: serialService.getStatus(),
  });

  res.json({
    success: true,
    mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
  });
});

// 8. Trigger Demo Simulation Scenario
app.post('/api/simulation/scenario', (req, res) => {
  const { scenario } = req.body as { scenario: DemoScenario };
  if (!scenario) {
    return res.status(400).json({ success: false, error: 'Scenario is required' });
  }

  simulationService.setScenario(scenario);
  isSimulationMode = true; // Automatically enable simulation mode when triggering scenario

  // Immediately generate first reading for instant response
  const rawSim = simulationService.generateSimulatedReading();
  handleNewTelemetry(rawSim);

  res.json({
    success: true,
    scenario: simulationService.getScenario(),
    message: `Triggered simulation scenario: ${scenario}`,
  });
});

// 9. Update Calibration Settings
app.post('/api/calibration', (req, res) => {
  const updated = serialService.updateCalibration(req.body);
  res.json({ success: true, calibration: updated });
});

// WebSocket Connection Logic
wss.on('connection', (ws) => {
  console.log('[WS] Client connected to live telemetry stream');
  ws.send(
    JSON.stringify({
      type: 'INIT',
      mode: isSimulationMode ? 'SIMULATION' : 'HARDWARE',
      hardwareStatus: serialService.getStatus(),
      data: latestProcessedDecision,
    })
  );
});

// Start HTTP + WS Server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`  SWPM Backend SCADA Telemetry Server Running`);
  console.log(`  HTTP REST API: http://localhost:${PORT}`);
  console.log(`  WebSocket URL: ws://localhost:${PORT}`);
  console.log(`  Default Mode: ${isSimulationMode ? 'SIMULATION' : 'HARDWARE'}`);
  console.log(`====================================================`);
});
