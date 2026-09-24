import { appHasDailyNotesPluginLoaded, getDailyNoteSettings } from 'obsidian-daily-notes-interface';
import { dateFromPath, type DailyConfig } from './date';

export function dailyConfig(): DailyConfig | null {
  try {
    if (!appHasDailyNotesPluginLoaded()) return null;
    const settings = getDailyNoteSettings();
    if (!settings) return null;
    return { folder: settings.folder ?? '', format: settings.format || 'YYYY-MM-DD' };
  } catch {
    return null;
  }
}

export function dailyDate(path: string): string | null {
  const config = dailyConfig();
  return config ? dateFromPath(path, config) : null;
}
