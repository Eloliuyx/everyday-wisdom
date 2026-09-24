import { PluginSettingTab, type Setting, type SettingDefinitionItem } from 'obsidian';
import type EverydayWisdom from './main';
import { BatchModal } from './ui/batch-modal';

const INTRODUCTION = 'Everyday Wisdom adds a short daily reflection to your Daily Notes. Each of its 366 reflections is assigned to a fixed calendar date. Everything works offline, with no account required.';

export class WisdomSettingTab extends PluginSettingTab {
  constructor(private readonly wisdom: EverydayWisdom) {
    super(wisdom.app, wisdom);
    this.icon = 'book-open';
  }

  getSettingDefinitions(): SettingDefinitionItem[] {
    return [
      {
        type: 'group', cls: 'everyday-wisdom-intro-group',
        items: [{
          name: '',
          searchable: false,
          render: (setting: Setting): void => {
            setting.setClass('everyday-wisdom-intro');
            setting.settingEl.empty();
            setting.settingEl.createEl('p', { text: INTRODUCTION });
          },
        }],
      },
      { type: 'group', items: this.noteSettings() },
      {
        type: 'group', cls: 'everyday-wisdom-support-group',
        items: [{
          name: 'Support development',
          desc: 'Open the author’s Ko-fi page to support the plugin.',
          aliases: ['Feed the Markhor', 'Ko-fi', 'donate', '赞助', '支持开发'],
          render: (setting: Setting): void => this.renderSupport(setting),
        }],
      },
    ];
  }

  private noteSettings() {
    return [
      {
        name: 'Automatic insertion',
        desc: 'Add a reflection to daily notes created while this is on. Existing notes stay unchanged; use backfill to fill them.',
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
        name: 'Backfill', desc: 'Add missing reflections to existing daily notes. Preview a date range before applying.',
        aliases: ['Fill missing reflections', '补齐', '补填', '历史日记'],
        action: () => new BatchModal(this.wisdom, 'fill').open(),
        disabled: () => this.wisdom.bulkRunning,
      },
      {
        name: 'Deletion', desc: 'Remove reflections added by this plugin. Your notes and edited reflections are kept. Preview before applying.',
        aliases: ['Remove generated reflections', 'delete', '删除', '清理'],
        action: () => new BatchModal(this.wisdom, 'remove').open(),
        disabled: () => this.wisdom.bulkRunning,
      },
      {
        name: 'Help and feedback', desc: 'Open the project on GitHub. No note content is sent.',
        action: () => window.open('https://github.com/Eloliuyx/everyday-wisdom', '_blank', 'noopener,noreferrer'),
      },
    ] satisfies SettingDefinitionItem[];
  }

  private renderSupport(setting: Setting): void {
    setting.setClass('everyday-wisdom-support');
    const container = setting.controlEl.createDiv({ cls: 'ko-fi-button-container' });
    const button = container.createEl('button', { text: 'Feed the Markhor 🦌🪽', cls: 'ko-fi-button' });
    button.onclick = () => { window.open('https://ko-fi.com/flyingmarkhor', '_blank', 'noopener,noreferrer'); };
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
