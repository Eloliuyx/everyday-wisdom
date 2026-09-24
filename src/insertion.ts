import type { Change, InsertPosition, WisdomEntry } from './model';
import { checksum, END, frontmatterEnd, scanBlocks } from './markers';

export function reflectionBody(entry: WisdomEntry, eol = '\n'): string {
  let body = `> [!note] ${entry.title}${eol}> ${entry.body}`;
  if (entry.question) body += `${eol}>${eol}> *${entry.question}*`;
  return body;
}

export function renderBlock(entry: WisdomEntry, eol = '\n'): string {
  const body = reflectionBody(entry, eol);
  return `<!-- everyday-wisdom:start:${entry.date}:v1:${checksum(body)} -->${eol}${body}${eol}${END}`;
}

export function insertReflection(text: string, entry: WisdomEntry, position: InsertPosition): Change {
  const scan = scanBlocks(text);
  if (scan.unsafe) return { text, status: 'unsafe', blocks: 0 };
  if (scan.blocks.length) return { text, status: 'existing', blocks: 0 };
  const eol = text.includes('\r\n') ? '\r\n' : '\n';
  const offset = position === 'bottom' ? text.length : frontmatterEnd(text);
  if (offset === null) return { text, status: 'unsafe', blocks: 0 };
  const prefix = text.slice(0, offset);
  const suffix = text.slice(offset);
  const before = !prefix || prefix === '\uFEFF' || prefix.endsWith(eol + eol) ? '' : prefix.endsWith(eol) ? eol : eol + eol;
  const after = suffix ? (suffix.startsWith(eol) ? eol : eol + eol) : eol;
  return { text: prefix + before + renderBlock(entry, eol) + after + suffix, status: 'inserted', blocks: 1 };
}

export function removeReflections(text: string): Change {
  const scan = scanBlocks(text);
  if (scan.unsafe) return { text, status: 'unsafe', blocks: 0 };
  const removable = scan.blocks.filter(block => !block.edited);
  if (!removable.length) return { text, status: scan.blocks.length ? 'edited' : 'absent', blocks: 0 };
  let result = text;
  for (const block of [...removable].reverse()) result = result.slice(0, block.start) + result.slice(block.end);
  return { text: result, status: 'removed', blocks: removable.length, preserved: scan.blocks.length - removable.length };
}
