import { access, copyFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const target = path.join(root, 'test-vault');
try { await access(target); throw new Error('test-vault already exists; keep it intact or move it before generating another.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await access(path.join(root, 'dist', 'main.js'));
const plugin = path.join(target, '.obsidian', 'plugins', 'everyday-wisdom');
await mkdir(plugin, { recursive: true });
await mkdir(path.join(target, 'Daily'));
await mkdir(path.join(target, 'Templates'));
const json = (name, value) => writeFile(path.join(target, '.obsidian', name), JSON.stringify(value, null, 2) + '\n');
await json('core-plugins.json', ['file-explorer', 'global-search', 'switcher', 'backlink', 'outgoing-link', 'tag-pane', 'page-preview', 'daily-notes', 'templates', 'command-palette', 'editor-status', 'bookmarks', 'outline', 'word-count', 'file-recovery']);
await json('community-plugins.json', ['everyday-wisdom']);
await json('daily-notes.json', { folder: 'Daily', format: 'YYYY-MM-DD', template: 'Templates/Daily' });
await json('templates.json', { folder: 'Templates' });
await json('app.json', { livePreview: true });
for (const name of ['main.js', 'manifest.json', 'styles.css', 'LICENSE', 'THIRD_PARTY_NOTICES.md'])
  await copyFile(path.join(root, 'dist', name), path.join(plugin, name));
await writeFile(path.join(target, 'Templates', 'Daily.md'), '---\ntags:\n  - journal\n---\n\n# {{date:YYYY-MM-DD}}\n\n## Notes\n\nMy writing stays here.\n');
await writeFile(path.join(target, 'Daily', '2024-02-29.md'), '# Leap-day note\n\nKeep this original writing.\n');
await writeFile(path.join(target, 'Daily', '2025-03-01.md'), '# Historical note\n\nOpening this note should not insert anything automatically.\n');
await writeFile(path.join(target, 'README.md'), '# Everyday Wisdom — test vault\n\nThis vault contains test notes only. Open this folder as a vault in Obsidian, then enable the bundled Everyday Wisdom community plugin if prompted. Daily notes is already configured.\n\n1. Create today’s daily note: expect one reflection below the properties.\n2. Reopen it: expect no duplicate.\n3. Open Daily/2025-03-01: expect no automatic change. Use the insert command; expect March 1.\n4. Use Fill missing reflections with All existing daily notes, preview, then confirm. No missing dates should be created.\n5. Edit text inside one reflection, then use Remove generated reflections. The edited block and all personal writing should remain. Automatic insertion should turn off by default.\n\nFull test matrix: the parent repository’s docs/TESTING.md.\n');
console.log(`Prepared isolated vault: ${target}. Open it manually in Obsidian; no existing vault was changed.`);
