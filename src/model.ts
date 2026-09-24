export interface WisdomEntry {
  date: string;
  title: string;
  body: string;
  question: string | null;
}

export type InsertPosition = 'after-frontmatter' | 'bottom';
export interface WisdomSettings {
  automatic: boolean;
  position: InsertPosition;
}
export const DEFAULT_SETTINGS: WisdomSettings = { automatic: true, position: 'after-frontmatter' };

export function readSettings(data: unknown): WisdomSettings {
  const value = data && typeof data === 'object' ? data as Record<string, unknown> : {};
  return {
    automatic: typeof value.automatic === 'boolean' ? value.automatic : true,
    position: value.position === 'bottom' ? 'bottom' : 'after-frontmatter',
  };
}

export type ChangeStatus = 'inserted' | 'removed' | 'existing' | 'absent' | 'edited' | 'unsafe' | 'changed' | 'unavailable';
export interface Change {
  text: string;
  status: ChangeStatus;
  blocks: number;
  preserved?: number;
}
