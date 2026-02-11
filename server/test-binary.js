import { spawn } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const binaryPath = path.resolve(__dirname, '../sldl');

console.log('🧪 Testing sldl binary execution from Node.js');
console.log('================================================');
console.log('Binary path:', binaryPath);
console.log('');

const proc = spawn(binaryPath, ['--version']);

let hasOutput = false;

proc.stdout.on('data', (data) => {
  hasOutput = true;
  console.log('✅ STDOUT:', data.toString());
});

proc.stderr.on('data', (data) => {
  hasOutput = true;
  console.log('⚠️  STDERR:', data.toString());
});

proc.on('exit', (code, signal) => {
  console.log('');
  console.log('Exit code:', code);
  console.log('Signal:', signal);
  console.log('');
  
  if (signal === 'SIGKILL') {
    console.error('❌ BINARY WAS KILLED BY macOS!');
    console.error('');
    console.error('This means macOS Gatekeeper is blocking the binary.');
    console.error('');
    console.error('Solutions:');
    console.error('  1. Open System Settings → Privacy & Security');
    console.error('  2. Look for message about "sldl" being blocked');
    console.error('  3. Click "Open Anyway" or "Allow Anyway"');
    console.error('  4. Run this test again');
    console.error('');
    console.error('OR build sldl from source:');
    console.error('  git clone https://github.com/fiso64/slsk-batchdl');
    console.error('  cd slsk-batchdl && dotnet build -c Release');
    process.exit(1);
  } else if (code === 0 && hasOutput) {
    console.log('✅ SUCCESS! Binary executed correctly.');
    console.log('');
    console.log('The search functionality should now work.');
    process.exit(0);
  } else if (!hasOutput) {
    console.error('❌ No output received from binary.');
    console.error('The binary may have been blocked silently.');
    process.exit(1);
  } else {
    console.error('❌ Binary failed with exit code:', code);
    process.exit(1);
  }
});

proc.on('error', (err) => {
  console.error('❌ Process spawn error:', err.message);
  process.exit(1);
});

// Timeout after 5 seconds
setTimeout(() => {
  if (!hasOutput) {
    console.error('❌ TIMEOUT: No response from binary after 5 seconds');
    console.error('The binary is likely being blocked by macOS.');
    proc.kill('SIGKILL');
    process.exit(1);
  }
}, 5000);
