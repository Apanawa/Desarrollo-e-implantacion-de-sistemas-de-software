import { spawn } from 'node:child_process';
import { config } from 'dotenv';

config({ quiet: true });
const commands = [
  ['node_modules/tsx/dist/cli.mjs', 'watch', 'server/index.ts'],
  [
    'node_modules/vite/bin/vite.js',
    '--host',
    '127.0.0.1',
    '--port',
    '3005',
    '--strictPort',
  ],
];
const children = commands.map((args) =>
  spawn(process.execPath, args, { stdio: 'inherit', env: process.env }),
);
let stopping = false;
function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  children.forEach((child) => child.kill('SIGTERM'));
  process.exitCode = code;
}
children.forEach((child) => {
  child.on('error', () => stop(1));
  child.on('exit', (code) => stop(code ?? 0));
});
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
