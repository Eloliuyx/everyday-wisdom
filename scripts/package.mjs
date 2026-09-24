import { copyFile, mkdir, readFile, rm, utimes, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const pkg = JSON.parse(await readFile(path.join(root, 'package.json'), 'utf8'));
const versions = JSON.parse(await readFile(path.join(root, 'versions.json'), 'utf8'));
assert.equal(manifest.id, 'everyday-wisdom');
assert.equal(manifest.version, pkg.version);
assert.equal(versions[manifest.version], manifest.minAppVersion);
assert.match(manifest.version, /^\d+\.\d+\.\d+$/);
const dist = path.join(root, 'dist');
await rm(dist, { recursive: true, force: true });
const folder = path.join(dist, manifest.id);
await mkdir(folder, { recursive: true });
const files = ['main.js', 'manifest.json', 'styles.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md'];
for (const name of files) {
  await copyFile(path.join(root, name), path.join(folder, name));
  await utimes(path.join(folder, name), 946684800, 946684800);
}
await utimes(folder, 946684800, 946684800);
const zipName = `${manifest.id}-${manifest.version}.zip`;
execFileSync('zip', ['-X', '-q', path.join(dist, zipName), ...files.map(name => `${manifest.id}/${name}`)], {
  cwd: dist, env: { ...process.env, TZ: 'UTC' },
});
for (const name of files) await copyFile(path.join(folder, name), path.join(dist, name));
const hashes = [];
for (const name of [...files, zipName]) {
  const data = await readFile(path.join(dist, name));
  hashes.push(`${createHash('sha256').update(data).digest('hex')}  ${name}`);
}
await writeFile(path.join(dist, 'SHA256SUMS.txt'), hashes.join('\n') + '\n');
console.log(`Install package ready: dist/${zipName}. Public release gates: docs/RELEASE_READINESS.md.`);
