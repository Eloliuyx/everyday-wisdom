import { describe, expect, test } from 'vitest';
import { ENTRIES, entryForDate } from '../src/content';
import { calendarKeys, dateFromPath, inDateRange, validISODate } from '../src/date';
import { insertReflection, reflectionBody, removeReflections, renderBlock } from '../src/insertion';
import { checksum, END, scanBlocks } from '../src/markers';
import { readSettings } from '../src/model';

const entry = entryForDate('2026-09-24')!;
const insert = (text: string) => insertReflection(text, entry, 'after-frontmatter');

describe('shipped content', () => {
  test('exactly one entry for every calendar date, including February 29', () => {
    expect(ENTRIES.map(x => x.date)).toEqual(calendarKeys());
    expect(new Set(ENTRIES.map(x => x.title)).size).toBe(366);
    expect(ENTRIES.filter(x => x.question === null)).toHaveLength(64);
    for (const item of ENTRIES) {
      expect(item.title.trim()).not.toBe('');
      expect(item.body.trim()).not.toBe('');
      expect(item.question === null || item.question.endsWith('?')).toBe(true);
    }
  });
  test('same date across years and March 1 unchanged by leap years', () => {
    for (const date of ['01-01', '03-01', '09-23', '12-31']) {
      expect(entryForDate(`2023-${date}`)).toBe(entryForDate(`2024-${date}`));
    }
    expect(entryForDate('2000-02-29')?.date).toBe('02-29');
    expect(entryForDate('1900-02-29')).toBeNull();
    expect(entryForDate('2025-02-29')).toBeNull();
    expect(entryForDate('2026-04-31')).toBeNull();
  });
  test('omits every empty prompt, never printing null or an empty label', () => {
    for (const item of ENTRIES.filter(x => x.question === null)) {
      expect(reflectionBody(item).split('\n')).toHaveLength(2);
      expect(reflectionBody(item)).not.toMatch(/null|Contemplate:/);
    }
  });
});

describe('daily note identification', () => {
  test.each([
    ['Daily/2026-09-24.md', 'Daily', 'YYYY-MM-DD', '2026-09-24'],
    ['2024-02-29.md', '', 'YYYY-MM-DD', '2024-02-29'],
    ['Journal/2026/September/2026-Sep-24.md', 'Journal', 'YYYY/MMMM/YYYY-MMM-DD', '2026-09-24'],
    ['Daily/24 September 2026.md', 'Daily', 'D MMMM YYYY', '2026-09-24'],
    ['Daily/2026/09/24.md', 'Daily/', 'YYYY/MM/DD', '2026-09-24'],
    ['Daily/Journal 09/24/2026.md', 'Daily', '[Journal ]L', '2026-09-24'],
    ['Daily/2026-01-24.md', 'Daily', 'YYYY-[01]-DD', null],
    ['Daily/2026-09.md', 'Daily', 'YYYY-MM', null],
    ['Daily/09-24.md', 'Daily', 'MM-DD', null],
    ['Daily/2026-02-29.md', 'Daily', 'YYYY-MM-DD', null],
    ['Daily/2026-09-24 draft.md', 'Daily', 'YYYY-MM-DD', null],
    ['Daily-other/2026-09-24.md', 'Daily', 'YYYY-MM-DD', null],
    ['Projects/2026-09-24.md', 'Daily', 'YYYY-MM-DD', null],
    ['Daily/nested/2026-09-24.md', 'Daily', 'YYYY-MM-DD', null],
  ])('recognizes %s with %s / %s', (path, folder, format, expected) => {
    expect(dateFromPath(path, { folder, format })).toBe(expected);
  });
  test('date ranges are inclusive and do not parse through UTC', () => {
    expect(inDateRange('2026-09-24', '2026-09-24', '2026-09-24')).toBe(true);
    expect(inDateRange('2026-09-25', null, '2026-09-24')).toBe(false);
    expect(validISODate('2026-09-24T00:00:00Z')).toBe(false);
  });
});

describe('insertion and removal', () => {
  test('inserts correct text only once, even after visible editing', () => {
    const original = '# My day\n\nPersonal words.';
    const first = insert(original);
    expect(first.status).toBe('inserted');
    expect(first.text).toContain(reflectionBody(entry));
    expect(first.text.endsWith(original)).toBe(true);
    expect(insert(first.text)).toEqual({ text: first.text, status: 'existing', blocks: 0 });
    const edited = first.text.replace(entry.title, 'My own title');
    expect(insert(edited).status).toBe('existing');
    expect(removeReflections(edited).text).toBe(edited);
    expect(removeReflections(edited).status).toBe('edited');
  });
  test('preserves properties, BOM, newline style, and surrounding text', () => {
    const properties = '\uFEFF---\r\ntags:\r\n  - private\r\n---\r\n';
    const body = '\r\n# My day\r\n\r\nKeep these words exactly.\r\n';
    const first = insert(properties + body);
    expect(first.text.startsWith(properties)).toBe(true);
    expect(first.text.endsWith(body)).toBe(true);
    expect(first.text.replace(/\r\n/g, '')).not.toContain('\n');
    expect(scanBlocks(first.text).blocks[0]?.edited).toBe(false);
    const removed = removeReflections(first.text);
    expect(removed.status).toBe('removed');
    expect(removed.text.startsWith(properties)).toBe(true);
    expect(removed.text.endsWith(body)).toBe(true);
  });
  test('inserts at bottom without replacing user text and retains unrelated callouts', () => {
    const before = '> [!tip] Today\n> Personal writing\n\nMusic\n';
    const added = insertReflection(before, entry, 'bottom');
    expect(added.text.startsWith(before)).toBe(true);
    expect(removeReflections(added.text).text.startsWith(before)).toBe(true);
  });
  test('empty notes and notes with only properties work', () => {
    expect(insert('').status).toBe('inserted');
    expect(insert('---\na: b\n---').status).toBe('inserted');
    expect(insert('---\na: b').status).toBe('unsafe');
  });
  test('a BOM without properties remains idempotent and is kept on removal', () => {
    const first = insert('\uFEFFMy original writing');
    expect(first.text.startsWith('\uFEFF<!-- everyday-wisdom:')).toBe(true);
    expect(insert(first.text).status).toBe('existing');
    expect(removeReflections(first.text).status).toBe('removed');
    expect(removeReflections(first.text).text).toBe('\uFEFF\nMy original writing');
  });
  test('malformed or nested markers fail closed', () => {
    for (const text of [END, renderBlock(entry).replace(END, ''), '<!-- everyday-wisdom:start:09-24 -->',
      renderBlock(entry).replace(END, renderBlock(entry) + '\n' + END)]) {
      expect(insert(text).status).toBe('unsafe');
      expect(removeReflections(text)).toEqual({ text, status: 'unsafe', blocks: 0 });
    }
  });
  test('ignores code, quoted examples and marker strings in properties', () => {
    const block = renderBlock(entry);
    const code = '```md\n' + block + '\n```\n';
    const quoted = block.split('\n').map(line => '> ' + line).join('\n');
    const yaml = '---\nexample: |\n  ' + block.split('\n').join('\n  ') + '\n---\n';
    for (const text of [code, quoted, yaml, '~~~~markdown\n' + block + '\n~~~~\n']) {
      expect(scanBlocks(text)).toEqual({ blocks: [], unsafe: false });
      expect(removeReflections(text).text).toBe(text);
      expect(insert(text).status).toBe('inserted');
    }
  });
  test('line-ending normalization is safe and user answers are detected', () => {
    const block = renderBlock(entry);
    expect(checksum('a\r\nb')).toBe(checksum('a\nb'));
    expect(removeReflections(block.replace(/\n/g, '\r\n')).status).toBe('removed');
    expect(removeReflections(block.replace(END, 'My answer\n' + END)).status).toBe('edited');
  });
  test('removes valid duplicate blocks, preserving the text between them', () => {
    const text = `Before\n${renderBlock(entry)}\n\nMy writing\n\n${renderBlock(entry)}\nAfter`;
    const result = removeReflections(text);
    expect(result.blocks).toBe(2);
    expect(result.text).toBe('Before\n\nMy writing\n\nAfter');
  });
  test('sanitizes malformed stored preferences', () => {
    expect(readSettings(null)).toEqual({ automatic: true, position: 'after-frontmatter' });
    expect(readSettings({ automatic: false, position: 'bottom', arbitrary: true })).toEqual({ automatic: false, position: 'bottom' });
    expect(readSettings({ automatic: 'yes', position: 'unsafe' })).toEqual({ automatic: true, position: 'after-frontmatter' });
  });
});
