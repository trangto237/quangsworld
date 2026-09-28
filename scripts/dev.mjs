// Runs both apps: kid on http://localhost:5173 and parent proxied at http://localhost:5173/parent/
import { spawn } from 'node:child_process';

const procs = ['@atlas/parent', '@atlas/kid'].map((name) =>
  spawn('pnpm', ['--filter', name, 'dev'], { stdio: 'inherit', shell: process.platform === 'win32' }),
);
console.log('\n  🧭 Kid app:    http://localhost:5173/\n  📊 Parent app: http://localhost:5173/parent/\n');
const stop = () => procs.forEach((p) => p.kill());
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
procs.forEach((p) => p.on('exit', (code) => code && (stop(), process.exit(code))));
