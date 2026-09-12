import { mkdir, cp, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import core from '../stats-core.js';

const root = fileURLToPath(new URL('../', import.meta.url));
core.validateSnapshot(JSON.parse(await readFile(resolve(root, 'data/leetcode.json'), 'utf8')));
const destination = resolve(root, 'dist');
await mkdir(destination, { recursive: true });
for (const name of ['index.html', 'style.css', 'script.js', 'stats-core.js', 'data', 'assets', '.nojekyll']) {
  await cp(resolve(root, name), resolve(destination, name), { recursive: true });
}
console.log('Página e dados preparados em dist/.');
