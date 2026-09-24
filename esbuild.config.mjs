import esbuild from 'esbuild';
import { builtinModules } from 'node:module';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const helperLicense = await readFile(new URL('./node_modules/obsidian-daily-notes-interface/LICENSE', import.meta.url), 'utf8');

const options = {
  entryPoints: ['src/main.ts'], bundle: true, format: 'cjs', target: 'es2020',
  external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', ...builtinModules, ...builtinModules.map(n => `node:${n}`)],
  outfile: 'main.js', sourcemap: false, minify: true, treeShaking: true, metafile: true,
  banner: { js: `/* Everyday Wisdom. Content edition 0.4. See LICENSE.\nBundled obsidian-daily-notes-interface:\n${helperLicense}*/` },
};
if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  const result = await esbuild.build(options);
  const externalImports = Object.values(result.metafile.outputs).flatMap(output => output.imports).filter(item => item.external);
  assert.ok(externalImports.every(item => item.path === 'obsidian'), 'Runtime bundle must only require Obsidian, with no Node/Electron dependencies.');
}
