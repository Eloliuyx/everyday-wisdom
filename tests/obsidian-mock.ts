import moment from 'moment';
import { StateEffect, StateField } from '@codemirror/state';
export { moment };
export const previewMode = StateEffect.define<boolean>();
export const editorLivePreviewField = StateField.define<boolean>({
  create: () => false,
  update: (value, transaction) => {
    for (const effect of transaction.effects) if (effect.is(previewMode)) return effect.value;
    return value;
  },
});
export class TFile { path = ''; }
export class MarkdownView { constructor(..._args: unknown[]) {} }
export class Notice { constructor(..._args: unknown[]) {} }
export class Plugin {
  app: unknown;
  constructor(app: unknown) { this.app = app; }
  async loadData() { return null; }
  async saveData(_data: unknown) {}
  addSettingTab(_tab: unknown) {}
  addCommand(_command: unknown) {}
  registerEvent(_ref: unknown) {}
  registerInterval(_id: unknown) {}
  registerEditorExtension(_extension: unknown) {}
}
export function normalizePath(path: string): string { return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, ''); }
