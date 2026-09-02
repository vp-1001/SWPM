import { SerialPort } from 'serialport';
import { ReadlineParser } from '@serialport/parser-readline';

console.log('--- ATTEMPTING DIRECT READ FROM COM5 AT 115200 BAUD ---');

const port = new SerialPort({
  path: 'COM5',
  baudRate: 115200,
});

const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.on('open', () => {
  console.log('✅ Connected to COM5. Listening for raw serial output for 10 seconds...');
});

port.on('error', (err) => {
  console.error('❌ COM5 Error:', err.message);
});

parser.on('data', (line) => {
  console.log('RAW ESP32 LINE ->', line.trim());
});

setTimeout(() => {
  console.log('--- FINISHED READING TEST FROM COM5 ---');
  port.close();
  process.exit(0);
}, 10000);
