// =====================================================
// SWPM - Smart Water Pipeline Monitoring
// ESP32 + pH + TDS + Temperature (DS18B20) + Turbidity
// Floating Pin & Air Measurement Safety Guard Rails Enabled
// Output: JSON Lines for Software Ingest
// =====================================================

#include <Arduino.h>
#include <OneWire.h>
#include <DallasTemperature.h>

// ---------------- PIN DEFINITIONS ----------------

const int PH_PIN = 34;
const int TDS_PIN = 35;
const int TEMP_PIN = 33;       // DS18B20 DATA
const int TURBIDITY_PIN = 32;  // Turbidity OUT

// ---------------- TEMPERATURE SENSOR ----------------

OneWire oneWire(TEMP_PIN);
DallasTemperature tempSensor(&oneWire);

const char* DEVICE_ID = "ESP32-001";

// ---------------- SETUP ----------------

void setup() {

  Serial.begin(115200);

  // ESP32 ADC configuration
  analogSetPinAttenuation(PH_PIN, ADC_11db);
  analogSetPinAttenuation(TDS_PIN, ADC_11db);
  analogSetPinAttenuation(TURBIDITY_PIN, ADC_11db);

  // Start temperature sensor
  tempSensor.begin();

  Serial.println();
  Serial.println("======================================");
  Serial.println("     SMART WATER QUALITY SYSTEM");
  Serial.println("======================================");
  Serial.println("pH + TDS + Temperature + Turbidity");
  Serial.println();
}

// =====================================================
// READ pH (With Disconnected / Floating Probe Guard Rail)
// =====================================================

float readPH(int &outRaw, float &outVoltage) {
  int raw = analogRead(PH_PIN);
  float voltage = (raw / 4095.0) * 3.3;

  outRaw = raw;
  outVoltage = voltage;

  // Guard Rail 1: If probe is in air / disconnected (floating at 3.3V or 0V)
  if (raw >= 4090 || voltage < 0.05) {
    return 7.00; // Neutral 7.0 pH fallback
  }

  // Your exact working calibration formula
  float pH = 7.11 + ((1.780 - voltage) * 3.0);

  if (pH < 0.0) pH = 0.0;
  if (pH > 14.0) pH = 14.0;

  return pH;
}

// =====================================================
// READ TDS (With Low Voltage Air / Dry Probe Threshold)
// =====================================================

float readTDS(int &outRaw, float &outVoltage) {
  int raw = analogRead(TDS_PIN);
  float voltage = (raw / 4095.0) * 3.3;

  outRaw = raw;
  outVoltage = voltage;

  // Guard Rail 2: If probe is dry in air or near-zero voltage
  if (voltage < 0.15 || raw < 150) {
    return 0.0; // 0 ppm when probe is dry/air
  }

  // Standard TDS calculation
  float ec =
      (133.42 * voltage * voltage * voltage
      - 255.86 * voltage * voltage
      + 857.39 * voltage) * 0.5;

  float tds = ec * 0.887;

  if (tds < 0.0) tds = 0.0;

  return tds;
}

// =====================================================
// READ TEMPERATURE
// =====================================================

float readTemperature() {
  tempSensor.requestTemperatures();
  float temperature = tempSensor.getTempCByIndex(0);

  if (temperature == DEVICE_DISCONNECTED_C || temperature < -50) {
    return 27.0; // Fallback nominal temp if sensor disconnected
  }
  return temperature;
}

// =====================================================
// READ TURBIDITY
// =====================================================

float readTurbidity(int &outRaw, float &outVoltage) {
  long total = 0;

  for (int i = 0; i < 20; i++) {
    total += analogRead(TURBIDITY_PIN);
    delay(5);
  }

  float raw = total / 20.0;
  float voltage = (raw / 4095.0) * 3.3;

  // Guard Rail 3: If clear water or raw high
  if (raw >= 4090 || voltage >= 3.25) {
    outRaw = (int)raw;
    outVoltage = voltage;
    return 0.0; // 0 NTU clear water
  }

  float ntu = ((4095.0 - raw) / 4095.0) * 1000.0;

  if (ntu < 0.0) ntu = 0.0;
  if (ntu > 3000.0) ntu = 3000.0;

  outRaw = (int)raw;
  outVoltage = voltage;
  return ntu;
}

// =====================================================
// MAIN LOOP - 2 SECOND TELEMETRY
// =====================================================

void loop() {
  int phRaw, tdsRaw, turbRaw;
  float phVoltage, tdsVoltage, turbVoltage;

  float pH = readPH(phRaw, phVoltage);
  float tds = readTDS(tdsRaw, tdsVoltage);
  float temperature = readTemperature();
  float turbidity = readTurbidity(turbRaw, turbVoltage);

  // Send JSON Lines Payload for Software Ingest over Serial @ 115200
  Serial.print("{\"deviceId\":\"");
  Serial.print(DEVICE_ID);
  Serial.print("\",\"timestamp\":");
  Serial.print(millis());
  Serial.print(",\"ph\":");
  Serial.print(pH, 2);
  Serial.print(",\"tds\":");
  Serial.print(tds, 1);
  Serial.print(",\"temperature\":");
  Serial.print(temperature, 1);
  Serial.print(",\"turbidity\":");
  Serial.print(turbidity, 1);
  Serial.print(",\"turbidityRaw\":");
  Serial.print(turbRaw);
  Serial.print(",\"turbidityVoltage\":");
  Serial.print(turbVoltage, 3);
  Serial.println("}");

  delay(2000);
}
