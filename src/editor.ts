import { RangeSetBuilder, StateField, type EditorState } from '@codemirror/state';
import { Decoration, EditorView, type DecorationSet } from '@codemirror/view';
import { editorLivePreviewField } from 'obsidian';
import { PREFIX, scanBlocks } from './markers';

/** Hide only paired metadata lines in Live Preview; never change note content. */
function markerDecorations(state: EditorState): DecorationSet {
  if (!state.field(editorLivePreviewField, false)) return Decoration.none;
  const text = state.doc.toString();
  if (!text.includes(PREFIX)) return Decoration.none;
  const scan = scanBlocks(text);
  // Broken markers stay visible so the user can inspect and repair them.
  if (scan.unsafe) return Decoration.none;
  const builder = new RangeSetBuilder<Decoration>();
  for (const block of scan.blocks) {
    const opening = state.doc.lineAt(block.start);
    const closing = state.doc.lineAt(block.end > 0 && text[block.end - 1] === '\n' ? block.end - 1 : block.end);
    for (const line of [opening, closing]) {
      const end = line.to < state.doc.length ? line.to + 1 : line.to;
      builder.add(line.from, end, Decoration.replace({ block: true, inclusive: false }));
    }
  }
  return builder.finish();
}

export const hiddenWisdomMarkers = StateField.define<DecorationSet>({
  create: markerDecorations,
  update(value, transaction) {
    const modeChanged = transaction.startState.field(editorLivePreviewField, false)
      !== transaction.state.field(editorLivePreviewField, false);
    return transaction.docChanged || modeChanged ? markerDecorations(transaction.state) : value;
  },
  provide: field => [
    EditorView.decorations.from(field),
    EditorView.atomicRanges.of(view => view.state.field(field)),
  ],
});
