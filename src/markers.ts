import { validDateKey } from './date';

export const PREFIX = '<!-- everyday-wisdom:';
export const END = '<!-- everyday-wisdom:end -->';

/** An edit checksum, not a security boundary. Normalize line endings for cross-device sync. */
export function checksum(value: string): string {
  let hash = 0xcbf29ce484222325n;
  for (const char of value.replace(/\r\n/g, '\n')) {
    hash ^= BigInt(char.codePointAt(0) ?? 0);
    hash = BigInt.asUintN(64, hash * 0x100000001b3n);
  }
  return hash.toString(16).padStart(16, '0');
}

interface Line { text: string; start: number; end: number }
export function linesOf(text: string): Line[] {
  const result: Line[] = [];
  let offset = 0;
  for (const raw of text.match(/[^\n]*(?:\n|$)/g) ?? []) {
    if (!raw) continue;
    result.push({ text: raw.replace(/\r?\n$/, ''), start: offset, end: offset + raw.length });
    offset += raw.length;
  }
  return result;
}

export function frontmatterEnd(text: string): number | null {
  const bom = text.startsWith('\uFEFF') ? 1 : 0;
  const lines = linesOf(text.slice(bom));
  if (lines[0]?.text !== '---') return bom;
  for (let index = 1; index < lines.length; index++) {
    const line = lines[index];
    if (line && (line.text === '---' || line.text === '...')) return bom + line.end;
  }
  return null;
}

export interface MarkedBlock { start: number; end: number; date: string; edited: boolean }
export interface Scan { blocks: MarkedBlock[]; unsafe: boolean }

/** Ignore quoted/indented examples, fenced code, and YAML. Fail closed on malformed markers. */
export function scanBlocks(text: string): Scan {
  const boundary = frontmatterEnd(text);
  if (boundary === null) return { blocks: [], unsafe: true };
  const blocks: MarkedBlock[] = [];
  let fence: { character: string; length: number } | null = null;
  let start: { line: Line; date: string; hash: string } | null = null;
  let unsafe = false;
  for (const relative of linesOf(text.slice(boundary))) {
    const line = { ...relative, start: relative.start + boundary, end: relative.end + boundary };
    const delimiter = /^ {0,3}(`{3,}|~{3,})(.*)$/.exec(line.text);
    if (fence) {
      if (delimiter?.[1]?.[0] === fence.character && delimiter[1].length >= fence.length && !delimiter[2]?.trim()) fence = null;
      continue;
    }
    if (delimiter?.[1]) {
      fence = { character: delimiter[1][0] ?? '`', length: delimiter[1].length };
      continue;
    }
    if (!line.text.startsWith(PREFIX)) continue;
    const open = /^<!-- everyday-wisdom:start:(\d{2}-\d{2}):v1:([a-f0-9]{16}) -->$/.exec(line.text);
    if (open?.[1] && open[2] && validDateKey(open[1])) {
      if (start) unsafe = true;
      start = { line, date: open[1], hash: open[2] };
    } else if (line.text === END && start) {
      const payload = text.slice(start.line.end, line.start).replace(/\r?\n$/, '');
      blocks.push({ start: start.line.start, end: line.end, date: start.date, edited: checksum(payload) !== start.hash });
      start = null;
    } else {
      unsafe = true;
    }
  }
  return { blocks, unsafe: unsafe || start !== null };
}
