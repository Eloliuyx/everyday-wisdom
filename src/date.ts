import { normalizePath } from 'obsidian';
import { moment } from './clock';

const MONTH_DAYS = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

export function validDateKey(key: string): boolean {
  if (!/^\d{2}-\d{2}$/.test(key)) return false;
  const month = Number(key.slice(0, 2));
  const day = Number(key.slice(3));
  return month >= 1 && month <= 12 && day >= 1 && day <= (MONTH_DAYS[month - 1] ?? 0);
}

export function validISODate(date: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false;
  const year = Number(date.slice(0, 4));
  if (year < 1 || !validDateKey(date.slice(5))) return false;
  return date.slice(5) !== '02-29' || (year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0));
}

export function calendarKeys(): string[] {
  return MONTH_DAYS.flatMap((days, month) => Array.from({ length: days }, (_, day) =>
    `${String(month + 1).padStart(2, '0')}-${String(day + 1).padStart(2, '0')}`));
}

export interface DailyConfig { folder: string; format: string }

/** Only a complete path that round-trips through the configured format is a daily note. */
export function dateFromPath(path: string, config: DailyConfig): string | null {
  if (!path.endsWith('.md')) return null;
  const folder = normalizePath(config.folder).replace(/^\/+|\/+$/g, '');
  const prefix = folder ? `${folder}/` : '';
  if (!path.startsWith(prefix)) return null;
  const relative = path.slice(prefix.length, -3);
  const format = config.format || 'YYYY-MM-DD';
  const parsed = moment(relative, format, true);
  if (!parsed.isValid() || parsed.format(format) !== relative) return null;
  // Inspect parsed fields, including localized tokens, rather than guessing from format letters.
  // Year-less or month-only names must never silently borrow missing fields from today.
  const flags = parsed.parsingFlags();
  if (flags.parsedDateParts?.[0] == null || flags.parsedDateParts?.[1] == null || flags.parsedDateParts?.[2] == null) return null;
  const iso = parsed.format('YYYY-MM-DD');
  return validISODate(iso) ? iso : null;
}

export function inDateRange(date: string, from: string | null, to: string | null): boolean {
  return (!from || date >= from) && (!to || date <= to);
}
