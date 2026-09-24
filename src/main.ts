import { MarkdownView, Plugin, TFile } from 'obsidian';
import { entryForDate } from './content';
import { dailyConfig, dailyDate } from './daily-note';
import { dateFromPath, inDateRange } from './date';
import { insertReflection } from './insertion';
import { DEFAULT_SETTINGS, readSettings, type Change, type WisdomSettings } from './model';
import { WisdomSettingTab } from './settings';
import { BatchModal } from './ui/batch-modal';
import type { Candidate } from './batch';
import { hiddenWisdomMarkers } from './editor';

export default class EverydayWisdom extends Plugin {
  settings: WisdomSettings = { ...DEFAULT_SETTINGS };
  bulkRunning = false;
  stopped = true;
  private ready = false;
  private readonly queues = new Map<string, Promise<unknown>>();
  private readonly automaticTimers = new Map<string, number>();
  private readonly newFiles = new Map<string, number>();
  private settingTab: WisdomSettingTab | null = null;

  async onload(): Promise<void> {
    this.settings = readSettings(await this.loadData());
    this.ready = false;
    this.stopped = false;
    this.registerEditorExtension(hiddenWisdomMarkers);
    this.settingTab = new WisdomSettingTab(this);
    this.addSettingTab(this.settingTab);
    this.addCommand({ id: 'fill-missing', name: 'Backfill', callback: () => new BatchModal(this, 'fill').open() });
    this.addCommand({ id: 'remove-generated', name: 'Deletion', callback: () => new BatchModal(this, 'remove').open() });
    this.registerInterval(window.setInterval(() => {
      for (const [path, expires] of this.newFiles) if (expires <= Date.now()) this.newFiles.delete(path);
    }, 10_000));
    this.registerEvent(this.app.vault.on('create', file => {
      if (!this.ready || !(file instanceof TFile) || !dailyDate(file.path) || !this.settings.automatic) return;
      this.newFiles.set(file.path, Date.now() + 10_000);
      this.schedule(file);
    }));
    this.registerEvent(this.app.vault.on('modify', file => {
      if (!(file instanceof TFile)) return;
      if ((this.newFiles.get(file.path) ?? 0) > Date.now()) this.schedule(file);
      else this.newFiles.delete(file.path);
    }));
    this.app.workspace.onLayoutReady(() => {
      if (this.stopped) return;
      this.ready = true;
    });
  }

  async saveSettings(): Promise<void> { await this.saveData(this.settings); this.settingTab?.update(); }

  setBulkRunning(running: boolean): void {
    this.bulkRunning = running;
    if (running) this.clearAutomaticTasks();
    this.settingTab?.update();
  }

  clearAutomaticTasks(): void {
    for (const timer of this.automaticTimers.values()) window.clearTimeout(timer);
    this.automaticTimers.clear();
    this.newFiles.clear();
  }

  onunload(): void {
    this.stopped = true;
    this.clearAutomaticTasks();
  }

  private schedule(file: TFile): void {
    if (!this.ready || this.stopped || !this.settings.automatic || this.bulkRunning) return;
    const old = this.automaticTimers.get(file.path);
    if (old !== undefined) window.clearTimeout(old);
    const timer = window.setTimeout(() => {
      this.automaticTimers.delete(file.path);
      if (!this.stopped && this.settings.automatic && !this.bulkRunning) void this.insertIntoNewNote(file);
    }, 500);
    this.automaticTimers.set(file.path, timer);
  }

  private openEditor(path: string): MarkdownView | null {
    const views = this.app.workspace.getLeavesOfType('markdown')
      .map(leaf => leaf.view).filter((view): view is MarkdownView => view instanceof MarkdownView && view.file?.path === path);
    const active = this.app.workspace.getActiveViewOfType(MarkdownView);
    const chosen = active?.file?.path === path ? active : views[0];
    if (!chosen) return null;
    if (views.some(view => view.editor.getValue() !== chosen.editor.getValue())) throw new Error('Open views have different content.');
    return chosen;
  }

  async readNote(path: string): Promise<string> {
    const editor = this.openEditor(path)?.editor;
    if (editor) return editor.getValue();
    const file = this.app.vault.getFileByPath(path);
    if (!file) throw new Error('Note no longer exists.');
    return this.app.vault.read(file);
  }

  async mutateNote(path: string, transform: (text: string) => Change): Promise<Change> {
    const previous = this.queues.get(path) ?? Promise.resolve();
    const operation = previous.catch(() => undefined).then(async () => {
      if (this.stopped) return { text: '', status: 'unavailable', blocks: 0 } satisfies Change;
      const file = this.app.vault.getFileByPath(path);
      if (!file) return { text: '', status: 'unavailable', blocks: 0 } satisfies Change;
      const editor = this.openEditor(path)?.editor;
      if (editor) {
        const before = editor.getValue();
        const change = transform(before);
        if (change.text !== before) {
          let start = 0;
          while (start < before.length && start < change.text.length && before[start] === change.text[start]) start++;
          let end = before.length;
          let newEnd = change.text.length;
          while (end > start && newEnd > start && before[end - 1] === change.text[newEnd - 1]) { end--; newEnd--; }
          editor.replaceRange(change.text.slice(start, newEnd), editor.offsetToPos(start), editor.offsetToPos(end));
        }
        return change;
      }
      let result: Change = { text: '', status: 'unavailable', blocks: 0 };
      await this.app.vault.process(file, text => {
        if (this.stopped) return text;
        result = transform(text);
        return result.text;
      });
      return result;
    });
    this.queues.set(path, operation);
    try { return await operation; }
    finally { if (this.queues.get(path) === operation) this.queues.delete(path); }
  }

  private async insertIntoNewNote(file: TFile): Promise<void> {
    try {
      const date = dailyDate(file.path);
      const entry = date ? entryForDate(date) : null;
      if (!entry) return;
      await this.mutateNote(file.path, text => {
        if (this.bulkRunning || !this.settings.automatic) return { text, status: 'unavailable', blocks: 0 };
        return insertReflection(text, entry, this.settings.position);
      });
    } catch {
      // Keep automatic insertion quiet. Backfill can retry skipped notes after the issue is resolved.
    }
  }

  candidates(from: string | null, to: string | null): Candidate[] {
    const config = dailyConfig();
    if (!config) throw new Error('Enable Daily notes and choose a full calendar date format first.');
    const notes: Candidate[] = [];
    for (const file of this.app.vault.getMarkdownFiles()) {
      const date = dateFromPath(file.path, config);
      if (date && inDateRange(date, from, to)) notes.push({ path: file.path, date });
    }
    return notes.sort((a, b) => a.date.localeCompare(b.date) || a.path.localeCompare(b.path));
  }
}
