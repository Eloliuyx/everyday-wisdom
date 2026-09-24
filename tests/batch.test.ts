import { describe, expect, test } from 'vitest';
import { planBatch, runBatch, type Candidate } from '../src/batch';
import { entryForDate } from '../src/content';
import { renderBlock } from '../src/insertion';
import type { Change } from '../src/model';

function store(initial: Record<string, string>) {
  const contents = new Map(Object.entries(initial));
  return {
    contents,
    read: async (path: string) => { if (!contents.has(path)) throw new Error('Missing'); return contents.get(path)!; },
    mutate: async (path: string, action: (value: string) => Change) => {
      if (!contents.has(path)) throw new Error('Missing');
      const result = action(contents.get(path)!);
      contents.set(path, result.text);
      return result;
    },
  };
}

const candidates: Candidate[] = [
  { path: '2024-02-29.md', date: '2024-02-29' },
  { path: '2026-09-24.md', date: '2026-09-24' },
];

describe('batch preview and execution', () => {
  test('fills missing entries, never creates notes and is idempotent', async () => {
    const data = store({ '2024-02-29.md': 'Keep me', '2026-09-24.md': renderBlock(entryForDate('2026-09-24')!) });
    const plan = await planBatch([...candidates, { path: 'missing.md', date: '2026-09-25' }], 'fill', 'after-frontmatter', data.read);
    expect(plan.notes).toHaveLength(1);
    expect(plan.skipped.map(x => x.reason)).toEqual(['existing', 'read-error']);
    const result = await runBatch(plan, data.mutate, () => false);
    expect(result.changed).toBe(1);
    expect(data.contents.get('2024-02-29.md')).toContain('An Extra Square');
    expect(data.contents.get('2024-02-29.md')).toContain('Keep me');
    expect(data.contents.has('missing.md')).toBe(false);
    expect((await planBatch(candidates, 'fill', 'after-frontmatter', data.read)).notes).toHaveLength(0);
  });
  test('protects edits made after preview', async () => {
    const data = store({ '2024-02-29.md': 'Before' });
    const plan = await planBatch(candidates.slice(0, 1), 'fill', 'after-frontmatter', data.read);
    data.contents.set('2024-02-29.md', 'New personal words');
    const result = await runBatch(plan, data.mutate, () => false);
    expect(result.changed).toBe(0);
    expect(result.details[0]?.reason).toBe('changed');
    expect(data.contents.get('2024-02-29.md')).toBe('New personal words');
  });
  test('preserves user-edited blocks and surrounding notes on removal', async () => {
    const first = renderBlock(entryForDate('2024-02-29')!);
    const second = renderBlock(entryForDate('2026-09-24')!).replace('Feedback with a Way Forward', 'My response');
    const data = store({ '2024-02-29.md': 'Before\n' + first + '\nAfter', '2026-09-24.md': second });
    const plan = await planBatch(candidates, 'remove', 'after-frontmatter', data.read);
    expect(plan.skipped[0]?.reason).toBe('edited');
    const result = await runBatch(plan, data.mutate, () => false);
    expect(result.changed).toBe(1);
    expect(data.contents.get('2024-02-29.md')).toBe('Before\nAfter');
    expect(data.contents.get('2026-09-24.md')).toBe(second);
  });
  test('cancellation leaves not-yet-processed notes unchanged', async () => {
    const data = store({ '2024-02-29.md': 'A', '2026-09-24.md': 'B' });
    const plan = await planBatch(candidates, 'fill', 'bottom', data.read);
    let cancelled = false;
    const result = await runBatch(plan, data.mutate, () => cancelled, () => { cancelled = true; });
    expect(result.changed).toBe(1);
    expect(result.unprocessed).toBe(1);
    expect(data.contents.get('2026-09-24.md')).toBe('B');
  });
  test('one write failure does not hide the result for other notes', async () => {
    const data = store({ '2024-02-29.md': 'A', '2026-09-24.md': 'B' });
    const plan = await planBatch(candidates, 'fill', 'bottom', data.read);
    data.contents.delete('2024-02-29.md');
    const result = await runBatch(plan, data.mutate, () => false);
    expect(result.failed).toBe(1);
    expect(result.changed).toBe(1);
    expect(result.unprocessed).toBe(0);
  });
});
