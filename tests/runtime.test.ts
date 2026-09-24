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
    plugin, disk, app, note,
    create: (file: TFile) => vaultEvents.get('create')?.(file),
    modify: (file: TFile) => vaultEvents.get('modify')?.(file),
    ready: () => ready(),
    open: (file: TFile) => { active = file; workspaceEvents.get('file-open')?.(file); },
    editorMenu: (info: { file: TFile | null }, editor: ReturnType<typeof makeEditor>) => {
      const actions: Array<() => Promise<void>> = [];
      const item = {
        setTitle: (_text: string) => item,
        setIcon: (_icon: string) => item,
        onClick: (callback: () => Promise<void>) => { actions.push(callback); return item; },
      };
      workspaceEvents.get('editor-menu')?.({ addItem: (callback: (item: unknown) => void) => callback(item) }, editor, info);
      return actions;
    },
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
  test('editor menu targets the clicked editor and its unsaved content, not another active note', async () => {
    const h = harness(); await h.plugin.onload(); h.ready(); h.plugin.settings.automatic = false;
    const target = h.note('Daily/2024-02-29.md', 'Stale disk content');
    const other = h.note('Daily/2025-03-01.md', 'Other note');
    const otherEditor = h.editor(other, 'Unsaved other note');
    const editor = makeEditor('Unsaved target note');
    const actions = h.editorMenu({ file: target }, editor);
    expect(actions).toHaveLength(1);
    expect(editor.getValue()).toBe('Unsaved target note'); // Opening the menu never writes.
    await actions[0]!();
    await actions[0]!();
    expect(editor.getValue()).toContain(entryForDate('2024-02-29')!.title);
    expect(editor.getValue()).toContain('Unsaved target note');
    expect(scanBlocks(editor.getValue()).blocks).toHaveLength(1);
    expect(otherEditor.getValue()).toBe('Unsaved other note');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('editor-menu action stops if its editor has switched files before the click', async () => {
    const h = harness(); await h.plugin.onload(); h.plugin.settings.automatic = false;
    const first = h.note('Daily/2024-02-29.md', 'First');
    const second = h.note('Daily/2025-03-01.md', 'Second');
    const info = { file: first };
    const editor = makeEditor('Current writing');
    const actions = h.editorMenu(info, editor);
    info.file = second;
    await actions[0]!();
    expect(editor.getValue()).toBe('Current writing');
    expect(h.app.vault.process).not.toHaveBeenCalled();
  });
  test('editor-menu action is omitted for non-daily notes, batches, or an unloaded plugin', async () => {
    const h = harness(); await h.plugin.onload();
    const editor = makeEditor('Keep me');
    const daily = h.note('Daily/2024-02-29.md');
    expect(h.editorMenu({ file: null }, editor)).toHaveLength(0);
    expect(h.editorMenu({ file: h.note('Projects/2024-02-29.md') }, editor)).toHaveLength(0);
    h.plugin.setBulkRunning(true);
    expect(h.editorMenu({ file: daily }, editor)).toHaveLength(0);
    h.plugin.setBulkRunning(false); h.plugin.onunload();
    expect(h.editorMenu({ file: daily }, editor)).toHaveLength(0);
  });
});
