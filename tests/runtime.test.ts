import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MarkdownView, TFile, type App, type Editor, type WorkspaceLeaf } from 'obsidian';
import EverydayWisdom from '../src/main';
import { entryForDate } from '../src/content';
import { insertReflection } from '../src/insertion';
import { scanBlocks } from '../src/markers';
import manifest from '../manifest.json';

vi.mock('../src/settings', () => ({ WisdomSettingTab: class { update() {} } }));
vi.mock('../src/ui/batch-modal', () => ({ BatchModal: class {} }));
vi.mock('../src/daily-note', () => ({
  dailyDate: (path: string) => /^Daily\/\d{4}-\d{2}-\d{2}\.md$/.test(path) ? path.slice(6, -3) : null,
  dailyConfig: () => ({ folder: 'Daily', format: 'YYYY-MM-DD' }),
}));

function harness() {
  const files = new Map<string, TFile>();
  const disk = new Map<string, string>();
  const vaultEvents = new Map<string, (file: TFile) => void>();
  let open: (file: TFile) => void = () => {};
  let ready: () => void = () => {};
  let active: TFile | null = null;
  let views: MarkdownView[] = [];
  const app = {
    vault: {
      on: (event: string, callback: (file: TFile) => void) => vaultEvents.set(event, callback),
      getFileByPath: (path: string) => files.get(path) ?? null,
      getMarkdownFiles: () => [...files.values()],
      read: async (file: TFile) => disk.get(file.path),
      process: vi.fn(async (file: TFile, update: (text: string) => string) => {
        disk.set(file.path, update(disk.get(file.path) ?? ''));
      }),
    },
    workspace: {
      getActiveFile: () => active,
      getLeavesOfType: () => views.map(view => ({ view })),
      getActiveViewOfType: () => views.find(view => view.file === active) ?? null,
      on: (_event: string, callback: (file: TFile) => void) => { open = callback; },
      onLayoutReady: (callback: () => void) => { ready = callback; },
    },
  };
  const plugin = new EverydayWisdom(app as unknown as App, manifest);
  function note(path: string, text = '') {
    const file = Object.assign(new TFile(), { path });
    files.set(path, file); disk.set(path, text); return file;
  }
  return {
    plugin, disk, app, note,
    create: (file: TFile) => vaultEvents.get('create')?.(file),
    modify: (file: TFile) => vaultEvents.get('modify')?.(file),
    ready: () => ready(),
    open: (file: TFile) => { active = file; open(file); },
    editor: (file: TFile, initial: string) => {
      let value = initial;
      const editor = {
        getValue: () => value,
        offsetToPos: (offset: number) => ({ line: 0, ch: offset }),
        replaceRange: (text: string, from: { ch: number }, to: { ch: number }) => {
          value = value.slice(0, from.ch) + text + value.slice(to.ch);
        },
      };
      const view = Object.assign(new MarkdownView({} as WorkspaceLeaf), { file, editor: editor as unknown as Editor });
      views = [...views, view]; active = file; return editor;
    },
  };
}

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date(2026, 8, 24, 12));
  vi.stubGlobal('window', globalThis);
});
afterEach(() => { vi.clearAllTimers(); vi.useRealTimers(); vi.unstubAllGlobals(); });

describe('plugin event and write integration (mock Obsidian APIs)', () => {
  test('does not fill historical notes on opening or initial vault discovery', async () => {
    const h = harness(); await h.plugin.onload();
    const old = h.note('Daily/2025-01-02.md', 'History');
    h.create(old); h.ready(); h.open(old);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.disk.get(old.path)).toBe('History');
  });
  test('today opens automatically once; a newly created historical note uses its own date', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const today = h.note('Daily/2026-09-24.md');
    h.open(today); h.open(today); h.create(today);
    await vi.advanceTimersByTimeAsync(2_000);
    expect(scanBlocks(h.disk.get(today.path)!).blocks).toHaveLength(1);
    const past = h.note('Daily/2024-02-29.md'); h.create(past);
    await vi.advanceTimersByTimeAsync(600);
    expect(h.disk.get(past.path)).toContain(entryForDate('2024-02-29')!.title);
  });
  test('waits for a core template and recovers a delayed template write in the grace period', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md'); h.create(file);
    await vi.advanceTimersByTimeAsync(200);
    const template = '---\ntags: journal\n---\n# My writing';
    h.disk.set(file.path, template); h.modify(file);
    await vi.advanceTimersByTimeAsync(600);
    expect(h.disk.get(file.path)).toContain('# My writing');
    h.disk.set(file.path, template + '\nLate template'); h.modify(file);
    await vi.advanceTimersByTimeAsync(600);
    expect(scanBlocks(h.disk.get(file.path)!).blocks).toHaveLength(1);
    expect(h.disk.get(file.path)).toContain('Late template');
  });
  test.each(['off', 'bulk', 'unload'])('queued insertion stops for %s', async state => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md', 'Untouched'); h.create(file);
    if (state === 'off') { h.plugin.settings.automatic = false; h.plugin.clearAutomaticTasks(); }
    if (state === 'bulk') h.plugin.setBulkRunning(true);
    if (state === 'unload') h.plugin.onunload();
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.disk.get(file.path)).toBe('Untouched');
  });
  test('serializes competing writes and reads current content inside each transaction', async () => {
    const h = harness(); await h.plugin.onload();
    const file = h.note('Daily/2026-09-24.md', 'Original');
    const transform = (text: string) => insertReflection(text, entryForDate('2026-09-24')!, 'after-frontmatter');
    const outcomes = await Promise.all([h.plugin.mutateNote(file.path, transform), h.plugin.mutateNote(file.path, transform)]);
    expect(outcomes.map(x => x.status)).toEqual(['inserted', 'existing']);
    expect(scanBlocks(h.disk.get(file.path)!).blocks).toHaveLength(1);
  });
  test('uses unsaved editor text and avoids writing a stale disk snapshot', async () => {
    const h = harness(); await h.plugin.onload();
    const file = h.note('Daily/2026-09-24.md', 'Stale disk');
    const editor = h.editor(file, 'Unsaved personal writing');
    await h.plugin.insert(file, true);
    expect(editor.getValue()).toContain('Unsaved personal writing');
    expect(editor.getValue()).not.toContain('Stale disk');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('disagreeing editors are kept untouched', async () => {
    const h = harness(); await h.plugin.onload();
    const file = h.note('Daily/2026-09-24.md', 'Disk');
    const one = h.editor(file, 'First editor'); const two = h.editor(file, 'Second editor');
    await h.plugin.insert(file, true);
    expect(one.getValue()).toBe('First editor'); expect(two.getValue()).toBe('Second editor');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
});
