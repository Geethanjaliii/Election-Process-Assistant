import { spawnSync } from 'node:child_process';
import { createRequire } from 'node:module';
import path from 'node:path';

const require = createRequire(import.meta.url);

function run(command, args) {
  const result = spawnSync(process.execPath, [require.resolve(command), ...args], {
    stdio: 'inherit',
  });

  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

run('typescript/bin/tsc', ['-b']);

const viteEntry = require.resolve('vite');
const viteRoot = path.resolve(path.dirname(viteEntry), '..', '..');
const viteBin = path.join(viteRoot, 'bin', 'vite.js');

const viteResult = spawnSync(process.execPath, [viteBin, 'build'], {
  stdio: 'inherit',
});

if (viteResult.status !== 0) {
  process.exit(viteResult.status ?? 1);
}