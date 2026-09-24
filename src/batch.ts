import { entryForDate } from './content';
import { checksum } from './markers';
import { insertReflection, removeReflections } from './insertion';
import type { Change, ChangeStatus, InsertPosition } from './model';

export type BatchKind = 'fill' | 'remove';
export interface Candidate { path: string; date: string }
export interface PlannedNote extends Candidate { fingerprint: string; blocks: number }
export interface SkippedNote { path: string; reason: ChangeStatus | 'read-error' }
export interface BatchPlan {
  kind: BatchKind;
  position: InsertPosition;
  notes: PlannedNote[];
  skipped: SkippedNote[];
  cancelled: boolean;
}

export function transform(text: string, candidate: Candidate, kind: BatchKind, position: InsertPosition): Change {
  if (kind === 'remove') return removeReflections(text);
  const entry = entryForDate(candidate.date);
  return entry ? insertReflection(text, entry, position) : { text, status: 'unavailable', blocks: 0 };
}

export async function planBatch(
  candidates: Candidate[], kind: BatchKind, position: InsertPosition,
  read: (path: string) => Promise<string>, cancelled: () => boolean = () => false,
): Promise<BatchPlan> {
  const plan: BatchPlan = { kind, position, notes: [], skipped: [], cancelled: false };
  for (const candidate of candidates) {
    if (cancelled()) { plan.cancelled = true; break; }
    try {
      const text = await read(candidate.path);
      const change = transform(text, candidate, kind, position);
      // A mixed edited/unedited note is preserved in full, making the preview easy to trust.
      if (change.preserved) plan.skipped.push({ path: candidate.path, reason: 'edited' });
      else if (change.status === 'inserted' || change.status === 'removed') {
        plan.notes.push({ ...candidate, fingerprint: checksum(text), blocks: change.blocks });
      } else plan.skipped.push({ path: candidate.path, reason: change.status });
    } catch {
      plan.skipped.push({ path: candidate.path, reason: 'read-error' });
    }
  }
  return plan;
}

export interface BatchResults {
  changed: number; blocks: number; skipped: number; failed: number; unprocessed: number;
  details: Array<{ path: string; reason: string }>;
}

export async function runBatch(
  plan: BatchPlan,
  mutate: (path: string, change: (text: string) => Change) => Promise<Change>,
  cancelled: () => boolean,
  progress: (finished: number, total: number) => void = () => undefined,
): Promise<BatchResults> {
  const result: BatchResults = {
    changed: 0, blocks: 0, skipped: plan.skipped.length, failed: 0,
    unprocessed: plan.notes.length, details: [...plan.skipped],
  };
  if (plan.cancelled) return result;
  let finished = 0;
  for (const note of plan.notes) {
    if (cancelled()) break;
    try {
      const change = await mutate(note.path, text => {
        if (checksum(text) !== note.fingerprint) return { text, status: 'changed', blocks: 0 };
        return transform(text, note, plan.kind, plan.position);
      });
      if (change.status === 'inserted' || change.status === 'removed') {
        result.changed++;
        result.blocks += change.blocks;
      } else {
        result.skipped++;
        result.details.push({ path: note.path, reason: change.status });
      }
    } catch {
      result.failed++;
      result.details.push({ path: note.path, reason: 'write-error' });
    }
    finished++;
    result.unprocessed--;
    progress(finished, plan.notes.length);
  }
  return result;
}
