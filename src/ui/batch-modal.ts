import { ButtonComponent, Modal, Notice, Setting } from 'obsidian';
import { moment } from '../clock';
import type EverydayWisdom from '../main';
import { planBatch, runBatch, type BatchKind, type BatchPlan } from '../batch';
import { validISODate } from '../date';
import { dailyDate } from '../daily-note';

const REASONS: Record<string, string> = {
  existing: 'Already has a reflection', absent: 'No generated reflection', edited: 'Edited block kept',
  unsafe: 'Unclear markers or properties', changed: 'Changed since preview', unavailable: 'Note unavailable',
  'read-error': 'Could not read', 'write-error': 'Could not write',
};

export class BatchModal extends Modal {
  private from = moment().startOf('year').format('YYYY-MM-DD');
  private to = moment().format('YYYY-MM-DD');
  private all = false;
  private disableAutomatic = true;
  private cancelled = false;
  private closed = false;
  private plan: BatchPlan | null = null;
  private working = false;
  private message: HTMLElement | null = null;

  constructor(private readonly wisdom: EverydayWisdom, private readonly kind: BatchKind) {
    super(wisdom.app);
  }

  onOpen(): void {
    this.setTitle(this.kind === 'fill' ? 'Backfill' : 'Deletion');
    this.contentEl.addClass('everyday-wisdom-modal');
    if (this.wisdom.bulkRunning) {
      this.contentEl.createEl('p', { text: 'Another operation is already running. Please wait for it to finish.' });
      new ButtonComponent(this.contentEl).setButtonText('Close').onClick(() => this.close());
      return;
    }
    this.showRange();
  }

  onClose(): void {
    this.closed = true;
    this.cancelled = true;
    this.contentEl.empty();
  }

  private showRange(): void {
    this.contentEl.empty();
    this.contentEl.createEl('p', { text: this.kind === 'fill'
      ? 'Choose existing daily notes to preview. Missing dates will not create new notes.'
      : 'Only unchanged Everyday Wisdom blocks will be removed. Edited blocks and personal writing are kept.' });
    const fromSetting = new Setting(this.contentEl).setName('From').addText(text => {
      text.inputEl.type = 'date';
      text.inputEl.setAttribute('aria-label', 'From date');
      text.setValue(this.from).onChange(value => { this.from = value; });
    });
    const toSetting = new Setting(this.contentEl).setName('Through').addText(text => {
      text.inputEl.type = 'date';
      text.inputEl.setAttribute('aria-label', 'Through date');
      text.setValue(this.to).onChange(value => { this.to = value; });
    });
    new Setting(this.contentEl).setName('All existing daily notes').addToggle(toggle => toggle.setValue(this.all).onChange(value => {
      this.all = value;
      fromSetting.setDisabled(value);
      toSetting.setDisabled(value);
    }));
    if (this.kind === 'remove') {
      new Setting(this.contentEl).setName('Also turn off automatic insertion')
        .setDesc('Stop adding reflections to new daily notes. Existing notes are not automatically refilled.').addToggle(toggle =>
          toggle.setValue(this.disableAutomatic).onChange(value => { this.disableAutomatic = value; }));
    }
    this.message = this.contentEl.createEl('p', { attr: { role: 'status', 'aria-live': 'polite' } });
    const buttons = this.contentEl.createDiv({ cls: 'everyday-wisdom-actions' });
    new ButtonComponent(buttons).setButtonText('Cancel').onClick(() => this.close());
    new ButtonComponent(buttons).setButtonText('Preview').setCta().onClick(() => { void this.preview(); });
  }

  private async preview(): Promise<void> {
    if (this.working || this.closed) return;
    if (!this.all && (!validISODate(this.from) || !validISODate(this.to) || this.from > this.to)) {
      this.message?.setText('Choose a valid date range with the first date no later than the last.');
      return;
    }
    this.working = true;
    this.message?.setText('Reading existing daily notes…');
    try {
      const candidates = this.wisdom.candidates(this.all ? null : this.from, this.all ? null : this.to);
      let reads = 0;
      const plan = await planBatch(candidates, this.kind, this.wisdom.settings.position, async path => {
        if (++reads % 25 === 0) await new Promise<void>(resolve => window.setTimeout(resolve, 0));
        return this.wisdom.readNote(path);
      }, () => this.cancelled || this.wisdom.stopped);
      if (this.closed || plan.cancelled) return;
      this.plan = plan;
      this.showPreview();
    } catch (error) {
      this.message?.setText(error instanceof Error ? error.message : 'Could not prepare a preview. No notes were changed.');
    } finally { this.working = false; }
  }

  private showPreview(): void {
    if (!this.plan) return;
    const { notes, skipped } = this.plan;
    this.contentEl.empty();
    this.contentEl.createEl('p', { text: `${notes.length} notes will be updated. ${skipped.length} notes will be kept as they are.` });
    if (this.kind === 'remove') this.contentEl.createEl('p', { text: this.disableAutomatic
      ? 'Automatic insertion will be turned off when you confirm.'
      : 'Automatic insertion will stay on for new daily notes. Existing notes will not be refilled.' });
    if (notes.length) {
      const list = this.contentEl.createEl('ul', { cls: 'everyday-wisdom-file-list' });
      for (const note of notes.slice(0, 20)) list.createEl('li', { text: note.path });
      if (notes.length > 20) list.createEl('li', { text: `And ${notes.length - 20} more notes.` });
    }
    if (skipped.length) {
      const details = this.contentEl.createEl('details');
      details.createEl('summary', { text: 'Notes kept unchanged' });
      const list = details.createEl('ul', { cls: 'everyday-wisdom-file-list' });
      for (const note of skipped.slice(0, 100)) list.createEl('li', { text: `${note.path}: ${REASONS[note.reason] ?? note.reason}` });
      if (skipped.length > 100) list.createEl('li', { text: `${skipped.length - 100} more notes were kept unchanged.` });
    }
    this.contentEl.createEl('p', { text: 'If a note changes after this preview, it will be skipped.' });
    const buttons = this.contentEl.createDiv({ cls: 'everyday-wisdom-actions' });
    new ButtonComponent(buttons).setButtonText('Back').onClick(() => { this.plan = null; this.showRange(); });
    new ButtonComponent(buttons).setButtonText('Cancel').onClick(() => this.close());
    if (notes.length || (this.kind === 'remove' && this.disableAutomatic && this.wisdom.settings.automatic)) {
      new ButtonComponent(buttons).setButtonText(this.kind === 'fill' ? 'Backfill' : 'Delete reflections')
        .setCta().onClick(() => { void this.execute(); });
    }
  }

  private async execute(): Promise<void> {
    if (!this.plan || this.working || this.wisdom.bulkRunning || this.closed) return;
    const plan = this.plan;
    this.working = true;
    this.wisdom.setBulkRunning(true);
    this.contentEl.empty();
    this.message = this.contentEl.createEl('p', { text: 'Preparing…', attr: { role: 'status', 'aria-live': 'polite' } });
    new ButtonComponent(this.contentEl).setButtonText('Stop after this note').onClick(() => { this.cancelled = true; });
    try {
      if (this.kind === 'remove' && this.disableAutomatic) {
        this.wisdom.settings.automatic = false;
        await this.wisdom.saveSettings();
      }
      const expectedDates = new Map(plan.notes.map(note => [note.path, note.date]));
      const result = await runBatch(plan, async (path, change) => {
        await new Promise<void>(resolve => window.setTimeout(resolve, 0));
        return this.wisdom.mutateNote(path, text => {
          if (this.cancelled || this.wisdom.stopped) return { text, status: 'unavailable', blocks: 0 };
          if (dailyDate(path) !== expectedDates.get(path)) return { text, status: 'changed', blocks: 0 };
          return change(text);
        });
      }, () => this.cancelled || this.wisdom.stopped, (finished, total) => {
        if (!this.closed) this.message?.setText(`Processed ${finished} of ${total} notes.`);
      });
      const summary = `${result.changed} updated, ${result.skipped} skipped, ${result.failed} failed, ${result.unprocessed} not processed.`;
      if (this.closed) { new Notice(summary); return; }
      this.contentEl.empty();
      this.contentEl.createEl('p', { text: summary, attr: { role: 'status' } });
      if (this.kind === 'remove' && this.disableAutomatic) this.contentEl.createEl('p', { text: 'Automatic insertion is off. You can turn it on again in settings.' });
      if (result.details.length) {
        const details = this.contentEl.createEl('details');
        details.createEl('summary', { text: 'View details' });
        const list = details.createEl('ul', { cls: 'everyday-wisdom-file-list' });
        for (const row of result.details.slice(0, 100)) list.createEl('li', { text: `${row.path}: ${REASONS[row.reason] ?? row.reason}` });
      }
      new ButtonComponent(this.contentEl).setButtonText('Done').setCta().onClick(() => this.close());
    } catch {
      if (!this.closed) {
        this.message?.setText('The operation stopped. Completed changes remain; reopen the preview before trying again.');
        new ButtonComponent(this.contentEl).setButtonText('Close').onClick(() => this.close());
      }
    } finally {
      this.working = false;
      this.wisdom.setBulkRunning(false);
    }
  }
}
