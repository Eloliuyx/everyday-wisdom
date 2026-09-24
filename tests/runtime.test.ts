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

function makeEditor(initial: string) {
  let value = initial;
  return {
    getValue: () => value,
    offsetToPos: (offset: number) => ({ line: 0, ch: offset }),
    replaceRange: (text: string, from: { ch: number }, to: { ch: number }) => {
      value = value.slice(0, from.ch) + text + value.slice(to.ch);
    },
  };
}

function harness() {
  const files = new Map<string, TFile>();
  const disk = new Map<string, string>();
  const vaultEvents = new Map<string, (file: TFile) => void>();
  const workspaceEvents = new Map<string, (...args: unknown[]) => void>();
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
      on: (event: string, callback: (...args: unknown[]) => void) => workspaceEvents.set(event, callback),
      onLayoutReady: (callback: () => void) => { ready = callback; },
    },
  };
  const plugin = new EverydayWisdom(app as unknown as App, manifest);
  function note(path: string, text = '') {
    const file = Object.assign(new TFile(), { path });
    files.set(path, file); disk.set(path, text); return file;
  }
  return {
    plugin, disk, app, note, workspaceEvents,
    create: (file: TFile) => vaultEvents.get('create')?.(file),
    modify: (file: TFile) => vaultEvents.get('modify')?.(file),
    ready: () => ready(),
    open: (file: TFile) => { active = file; workspaceEvents.get('file-open')?.(file); },
    editor: (file: TFile, initial: string) => {
      const editor = makeEditor(initial);
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
  test.each(['Daily/2025-01-02.md', 'Daily/2026-09-24.md'])('does not fill an existing note on startup or opening: %s', async path => {
    const h = harness();
    const old = h.note(path, 'Existing writing'); h.open(old);
    await h.plugin.onload();
    h.create(old); h.ready(); h.open(old);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.disk.get(old.path)).toBe('Existing writing');
  });
  test('new daily notes receive one reflection despite duplicate create/modify events', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const today = h.note('Daily/2026-09-24.md');
    h.create(today); h.create(today); h.modify(today); h.open(today);
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
    const h = harness(); await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md', 'Stale disk');
    const editor = h.editor(file, 'Unsaved personal writing');
    h.create(file); await vi.advanceTimersByTimeAsync(600);
    expect(editor.getValue()).toContain('Unsaved personal writing');
    expect(editor.getValue()).not.toContain('Stale disk');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('disagreeing editors are kept untouched', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md', 'Disk');
    const one = h.editor(file, 'First editor'); const two = h.editor(file, 'Second editor');
    h.create(file); await vi.advanceTimersByTimeAsync(600);
    expect(one.getValue()).toBe('First editor'); expect(two.getValue()).toBe('Second editor');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('enabling the switch affects only subsequent creations, not notes made while it was off', async () => {
    const h = harness(); await h.plugin.onload(); h.ready(); h.plugin.settings.automatic = false;
    const before = h.note('Daily/2026-09-24.md', 'Made while off'); h.create(before);
    h.plugin.settings.automatic = true;
    h.open(before); h.modify(before);
    const after = h.note('Daily/2026-09-25.md', 'Made while on'); h.create(after);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.disk.get(before.path)).toBe('Made while off');
    expect(h.disk.get(after.path)).toContain(entryForDate('2026-09-25')!.title);
    expect(h.disk.get(after.path)).toContain('Made while on');
  });
  test('the saved off switch is respected on startup', async () => {
    const h = harness();
    vi.spyOn(h.plugin, 'loadData').mockResolvedValue({ automatic: false, position: 'after-frontmatter' });
    await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md', 'Keep me'); h.create(file);
    await vi.advanceTimersByTimeAsync(1_000);
    expect(h.disk.get(file.path)).toBe('Keep me');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('turning off preserves existing reflections and leaves subsequent creations alone', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const first = h.note('Daily/2026-09-24.md', 'First'); h.create(first);
    await vi.advanceTimersByTimeAsync(600);
    const saved = h.disk.get(first.path);
    h.plugin.settings.automatic = false; h.plugin.clearAutomaticTasks();
    const second = h.note('Daily/2026-09-25.md', 'Second'); h.create(second); h.open(first);
    await vi.advanceTimersByTimeAsync(600);
    expect(h.disk.get(first.path)).toBe(saved);
    expect(h.disk.get(second.path)).toBe('Second');
  });
  test('does not reinsert into an existing note after cleanup or restarting', async () => {
    const h = harness(); await h.plugin.onload(); h.ready();
    const file = h.note('Daily/2026-09-24.md', 'Keep me'); h.create(file);
    await vi.advanceTimersByTimeAsync(600);
    h.plugin.setBulkRunning(true); h.disk.set(file.path, 'Keep me'); h.plugin.setBulkRunning(false);
    h.open(file); h.modify(file);
    h.plugin.onunload(); await h.plugin.onload(); h.ready(); h.open(file);
    await vi.advanceTimersByTimeAsync(600);
    expect(h.disk.get(file.path)).toBe('Keep me');
  });
  test('registers no single-note insertion command or context menu', async () => {
    const h = harness(); const commands = vi.spyOn(h.plugin, 'addCommand'); await h.plugin.onload();
    expect(commands.mock.calls.map(([command]) => command.id)).toEqual(['fill-missing', 'remove-generated']);
    expect(h.workspaceEvents.has('editor-menu')).toBe(false);
    expect(h.workspaceEvents.has('file-menu')).toBe(false);
  });
});
