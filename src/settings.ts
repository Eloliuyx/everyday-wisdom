import { PluginSettingTab, type SettingDefinitionItem } from 'obsidian';
import type EverydayWisdom from './main';
import { BatchModal } from './ui/batch-modal';

export class WisdomSettingTab extends PluginSettingTab {
  constructor(private readonly wisdom: EverydayWisdom) {
    super(wisdom.app, wisdom);
    this.icon = 'book-open';
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        name: 'Automatic insertion',
        desc: 'Add a reflection to new daily notes and when opening today’s note. Historical notes are only filled on request.',
        control: { type: 'toggle', key: 'automatic', defaultValue: true },
      },
      {
        name: 'Insert position',
        desc: 'Existing reflections stay where they are.',
        control: {
          type: 'dropdown', key: 'position', defaultValue: 'after-frontmatter',
          options: { 'after-frontmatter': 'After properties, before the note', bottom: 'At the end of the note' },
        },
      },
      {
        name: 'Fill missing reflections', desc: 'Preview a date range of existing daily notes before making changes.',
        action: () => new BatchModal(this.wisdom, 'fill').open(),
        disabled: () => this.wisdom.bulkRunning,
      },
      {
        name: 'Remove generated reflections', desc: 'Preview marked reflections. Edited or damaged blocks are kept.',
        action: () => new BatchModal(this.wisdom, 'remove').open(),
        disabled: () => this.wisdom.bulkRunning,
      },
      {
        name: 'About this edition',
        desc: '366 original reflections. English edition 0.4. Everything works offline; no account or tracking.',
      },
      {
        name: 'Help and feedback', desc: 'Open the project on GitHub. No note content is sent.',
        action: () => window.open('https://github.com/Eloliuyx/everyday-wisdom', '_blank', 'noopener,noreferrer'),
      },
    ];
  }

  getControlValue(key: string): unknown {
    if (key === 'automatic') return this.wisdom.settings.automatic;
    if (key === 'position') return this.wisdom.settings.position;
    return undefined;
  }

  async setControlValue(key: string, value: unknown): Promise<void> {
    if (key === 'automatic' && typeof value === 'boolean') this.wisdom.settings.automatic = value;
    if (key === 'position' && (value === 'bottom' || value === 'after-frontmatter')) this.wisdom.settings.position = value;
    if (!this.wisdom.settings.automatic) this.wisdom.clearAutomaticTasks();
    await this.wisdom.saveSettings();
  }
}
