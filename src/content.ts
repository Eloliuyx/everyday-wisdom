import dataset from './content/wisdom.json';
import { validISODate } from './date';
import type { WisdomEntry } from './model';

export const CONTENT_VERSION = dataset.version;
export const ENTRIES: readonly WisdomEntry[] = dataset.entries;
const byDate = new Map(ENTRIES.map(entry => [entry.date, entry]));

export function entryForDate(isoDate: string): WisdomEntry | null {
  return validISODate(isoDate) ? byDate.get(isoDate.slice(5)) ?? null : null;
}
