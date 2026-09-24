import moment from 'moment';
export { moment };
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
}
export function normalizePath(path: string): string { return path.replace(/\\/g, '/').replace(/\/{2,}/g, '/').replace(/^\/|\/$/g, ''); }
