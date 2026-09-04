/**
 * Lateral construction — symbol left, denomination wordmark right, entity
 * identifier beneath. This is the preferred, reading-aligned arrangement.
 */

import { CONSTRUCTION, SYMBOL_UNITS } from '@/brand/constructionRules';
import { padBox, symbolPaths, unionBoxes } from '../geometry';
import type { Box, DrawablePath, LayoutFn } from '../types';
import { buildIdentifierBlock } from './textBlock';

export const lateral: LayoutFn = (spec, typeface) => {
  const symbolHeight = SYMBOL_UNITS;
  const symbol = symbolPaths(0, 0, symbolHeight);

  const wordmarkSize = CONSTRUCTION.wordmarkSize * symbolHeight;
  const lineStep = wordmarkSize * CONSTRUCTION.wordmarkLineHeight;
  const wordmarkX = symbol.box.width + CONSTRUCTION.lateralGap * symbolHeight;

  // The wordmark sits on the symbol's baseline: its last line's baseline is
  // level with the bottom of the symbol.
  const lastBaseline = symbolHeight;
  const lines = spec.wordmarkLines;

  const paths: DrawablePath[] = [...symbol.paths];
  const boxes: Box[] = [symbol.box];

  lines.forEach((line, index) => {
    const baseline = lastBaseline - (lines.length - 1 - index) * lineStep;
    paths.push({ d: typeface.toPathData(line, wordmarkX, baseline, wordmarkSize) });
    boxes.push(typeface.inkBounds(line, wordmarkX, baseline, wordmarkSize));
  });

  const wordmarkWidth = lines.reduce(
    (max, line) => Math.max(max, typeface.measureWidth(line, wordmarkSize)),
    0,
  );

  const identifier = buildIdentifierBlock(spec, typeface, {
    originX: wordmarkX,
    firstBaseline: lastBaseline + CONSTRUCTION.entityBaselineDrop * symbolHeight,
    maxWidth: wordmarkWidth,
    align: 'start',
  });
  paths.push(...identifier.paths);
  if (identifier.paths.length > 0) boxes.push(identifier.box);

  const contentBox = unionBoxes(boxes);
  const clearSpace = CONSTRUCTION.clearSpaceXHeights * typeface.xHeight * wordmarkSize;

  return {
    viewBox: spec.includeClearSpace ? padBox(contentBox, clearSpace) : contentBox,
    contentBox,
    paths,
    notes: identifier.notes,
  };
};
