import { describe, expect, test } from 'vitest';
import { EditorState } from '@codemirror/state';
import { editorLivePreviewField } from 'obsidian';
import { previewMode } from './obsidian-mock';
import { hiddenWisdomMarkers } from '../src/editor';
import { renderBlock } from '../src/insertion';
import { entryForDate } from '../src/content';
import { END } from '../src/markers';

const block = renderBlock(entryForDate('2026-09-24')!);
function state(doc: string, preview = true) {
  return EditorState.create({ doc, extensions: [editorLivePreviewField.init(() => preview), hiddenWisdomMarkers] });
}
function hidden(editor: EditorState) {
  const ranges: string[] = [];
  editor.field(hiddenWisdomMarkers).between(0, editor.doc.length, (from, to) => {
    ranges.push(editor.doc.sliceString(from, to));
  });
  return ranges;
}

describe('Live Preview metadata display using real CodeMirror state', () => {
  test('hides only the two marker lines and does not change stored Markdown', () => {
    const doc = '---\ntags: journal\n---\n\n' + block + '\n\nMy writing';
    const editor = state(doc);
    expect(hidden(editor)).toEqual([block.split('\n')[0] + '\n', END + '\n']);
    expect(editor.doc.toString()).toBe(doc);
  });
  test('source mode reveals metadata; toggling back hides it', () => {
    const source = state(block, false);
    expect(hidden(source)).toEqual([]);
    const preview = source.update({ effects: previewMode.of(true) }).state;
    expect(hidden(preview)).toHaveLength(2);
    expect(hidden(preview.update({ effects: previewMode.of(false) }).state)).toEqual([]);
  });
  test('damaged markers, examples in code, and unrelated comments stay visible', () => {
    for (const text of [block.replace(END, ''), '```md\n' + block + '\n```', '<!-- Personal comment -->'])
      expect(hidden(state(text))).toEqual([]);
  });
  test('keeps the complete edited reflection visible; only metadata is hidden', () => {
    const edited = block.replace('> [!note]', '> My words\n> [!note]');
    expect(hidden(state(edited))).toEqual([edited.split('\n')[0] + '\n', END]);
  });
  test('updates ranges when writing before a block and reveals a broken end marker', () => {
    const before = state(block);
    const moved = before.update({ changes: { from: 0, insert: 'Personal writing\n' } }).state;
    expect(hidden(moved)).toHaveLength(2);
    const broken = moved.update({ changes: { from: moved.doc.length - END.length, to: moved.doc.length } }).state;
    expect(hidden(broken)).toEqual([]);
  });
  test('handles BOM and adjacent blocks without replacing their text', () => {
    const doc = '\uFEFF' + block + '\n' + block;
    const editor = state(doc);
    expect(hidden(editor)).toHaveLength(4);
    expect(hidden(editor).join('')).not.toContain('> [!note]');
    expect(editor.doc.toString()).toBe(doc);
  });
});
