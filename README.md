# SWPM - Smart Water Pipeline Monitoring System

## Live Deployment

- Frontend (Vercel): http://swpm-phi.vercel.app/
- Backend (Render): https://swpm-backend-mo0z.onrender.com/

## ESP32 Hardware Integration & Telemetry Architecture

SWPM connects physical ESP32 water quality hardware measuring **pH**, **TDS**, **Temperature**, and **Turbidity (GPIO 32)** to the SWPM SCADA dashboard via USB Serial (CP210x UART) @ 115200 Baud.

```
PHYSICAL SENSORS (pH, TDS, Temp, Turbidity GPIO 32)
      ↓
ESP32 Dev Module (CP210x UART @ 115200 Baud)
      ↓
USB Serial Interface / COM Port (Windows)
      ↓
Node.js Express + SerialPort Service (Backend: server/server.ts)
      ↓
Validation + Calibration Layer (Raw ADC -> Voltage -> NTU / Coefficients)
      ↓
In-Memory Storage & Reading History (Circular Buffer)
      ↓
Water Quality Decision Engine (BIS IS 10500 Rule Engine)
      ↓
Anomaly Detection Engine (Threshold + Sudden Change + Moving Average)
      ↓
Transparent Risk Score Calculator & Treatment Recommendation Engine
      ↓
WebSocket Real-Time Event Dispatcher (ws://localhost:3001)
      ↓
Existing SWPM React Dashboard & Hardware Controller Panel
```

---

## 1. Hardware Setup & Wiring

- **Microcontroller**: ESP32 Dev Module (CP210x USB-to-UART bridge)
- **USB Connection**: Plug into Windows PC (Appears as `COM3`, `COM4`, etc.)
- **Turbidity Sensor**: 3-pin analog (GND -> GND, VCC -> 5V/3.3V, OUT -> **ESP32 GPIO 32**)
- **pH Sensor**: Analog output -> **ESP32 GPIO 34**
- **TDS Sensor**: Analog output -> **ESP32 GPIO 35**
- **Temperature Sensor**: Analog output -> **ESP32 GPIO 33**

---

## 2. Firmware Installation (`firmware/swpm_esp32_firmware.ino`)

1. Open `firmware/swpm_esp32_firmware.ino` in Arduino IDE.
2. Select Board: **ESP32 Dev Module**.
3. Set Serial Monitor Baud Rate: `115200`.
4. Upload to ESP32.
5. The ESP32 outputs JSON Lines every 1.5 seconds:
   ```json
   {"deviceId":"ESP32-001","timestamp":1725270000000,"ph":7.21,"tds":252.4,"temperature":25.6,"turbidity":0.62,"turbidityRaw":2470,"turbidityVoltage":1.998}
   ```

---

## 3. Quick Start & Software Setup

### Step A: Install Dependencies
```bash
npm install
```

### Step B: Start Backend SCADA Telemetry Server
```bash
npm run server
```
- Starts Node.js Express REST API at `http://localhost:3001`
- Starts WebSocket live stream server at `ws://localhost:3001`

### Step C: Start Frontend SWPM Application
```bash
npm run dev
```
- Open `http://localhost:3000` in your web browser.

---

## 4. Hardware vs. Simulation Mode

### A. Real Hardware Mode
1. Connect ESP32 to Windows via USB.
2. In the SWPM Dashboard, locate the **ESP32 Hardware Telemetry & Controller** widget.
3. Click **SCAN PORTS**. Select your CP210x COM Port from the dropdown (e.g. `COM3`).
4. Select Baud Rate `115200`.
5. Click **CONNECT ESP32**.
6. The dashboard will instantly switch to live telemetry streaming directly from your hardware sensors.

### B. Simulation & Stress Test Mode
- When ESP32 is not connected, the system automatically runs in **Simulation Mode**.
- Use the quick scenario buttons to test water quality stress conditions:
  - `NORMAL`: pH 7.2, TDS 250 ppm, Turbidity 0.5 NTU -> **SAFE** (Risk Score 95/100)
  - `TURBIDITY`: Turbidity 8.4 NTU -> **UNSAFE** (Coagulation + Sedimentation + Filtration Protocol)
  - `HIGH TDS`: TDS 1240 mg/L -> **UNSAFE** (Membrane RO / Electrodialysis Protocol)
  - `pH ACIDIC`: pH 5.2 -> **UNSAFE** (Soda Ash / Lime Neutralization Protocol)
  - `RECOVERY`: Simulates step-by-step return to safe potability after treatment.

---

## 5. BIS IS 10500 Rule Engine & Calibration

- Configured according to **BIS IS 10500:2012 Drinking Water Specification**:
  - **pH**: Acceptable 6.5 – 8.5 (Unsafe < 5.5 or > 9.5)
  - **TDS**: Acceptable 500 mg/L, Permissible max 2000 mg/L
  - **Turbidity**: Acceptable 1.0 NTU, Permissible ceiling 5.0 NTU
  - **Temperature**: Nominal ambient range 15 – 30°C
- Calibration coefficients for raw ADC to Voltage to NTU conversion can be customized in the UI settings drawer.

---

## 6. Troubleshooting & Logging

- **COM Port busy**: Ensure Arduino IDE Serial Monitor is closed before clicking CONNECT in SWPM.
- **Backend Logs**:
  - `[ESP32] Port detected`
  - `[ESP32] Connected`
  - `[ESP32] Reading received & parsed: pH=7.21, TDS=252.4, Turb=0.62 NTU`
  - `[ANALYTICS] Water evaluated: Status=SAFE, RiskScore=95`
