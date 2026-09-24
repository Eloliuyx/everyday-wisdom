import esbuild from 'esbuild';
import { builtinModules } from 'node:module';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const notices = (await readFile(new URL('./THIRD_PARTY_NOTICES.md', import.meta.url), 'utf8')).replace(/\*\//g, '* /');
const license = (await readFile(new URL('./LICENSE', import.meta.url), 'utf8')).replace(/\*\//g, '* /');

const options = {
  entryPoints: ['src/main.ts'], bundle: true, format: 'cjs', target: 'es2020',
  external: ['obsidian', 'electron', '@codemirror/*', '@lezer/*', ...builtinModules, ...builtinModules.map(n => `node:${n}`)],
  outfile: 'main.js', sourcemap: false, minify: true, treeShaking: true, metafile: true,
  banner: { js: `/* Everyday Wisdom. Content edition 0.4.\n${license}\n${notices}*/` },
};
if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  const result = await esbuild.build(options);
  const externalImports = Object.values(result.metafile.outputs).flatMap(output => output.imports).filter(item => item.external);
  const hostModules = new Set(['obsidian', '@codemirror/state', '@codemirror/view']);
  assert.ok(externalImports.every(item => hostModules.has(item.path)), 'Runtime imports must be host-provided Obsidian/CodeMirror APIs, with no Node/Electron dependencies.');
}
