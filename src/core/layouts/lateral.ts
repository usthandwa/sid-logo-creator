/**
 * Lateral construction — symbol left, denomination wordmark right, entity
 * identifier beneath. This is the preferred, reading-aligned arrangement.
 */

import { GRID, grid, SYMBOL_UNITS } from '@/brand/constructionRules';
import { padBox, symbolPaths, unionBoxes } from '../geometry';
import type { Box, DrawablePath, LayoutFn } from '../types';
import { buildIdentifierBlock } from './textBlock';

export const lateral: LayoutFn = (spec, typeface) => {
  const g = grid(typeface.xHeight);
  const symbolHeight = SYMBOL_UNITS;
  const symbol = symbolPaths(0, 0, symbolHeight);

  const wordmarkX = symbol.box.width + g.lateralGap;

  // The wordmark sits on the symbol's baseline: its last line's baseline is
  // level with the bottom of the symbol. Measured at exactly 0 in all four
  // published church logos.
  const lastBaseline = symbolHeight;
  const lines = spec.primaryLines;

  const paths: DrawablePath[] = [...symbol.paths];
  const boxes: Box[] = [symbol.box];
  const wordmarkBaselines: number[] = [];

  lines.forEach((line, index) => {
    const baseline = lastBaseline - (lines.length - 1 - index) * g.primaryLineStep;
    paths.push({ d: typeface.toPathData(line, wordmarkX, baseline, g.primarySize) });
    boxes.push(typeface.inkBounds(line, wordmarkX, baseline, g.primarySize));
    wordmarkBaselines.push(baseline);
  });

  const wordmarkWidth = lines.reduce(
    (max, line) => Math.max(max, typeface.measureWidth(line, g.primarySize)),
    0,
  );

  // The identifier is not confined to the wordmark: in the published artwork
  // it runs past the wordmark's right edge and sets the lockup's width itself.
  const identifier = buildIdentifierBlock(spec, typeface, {
    originX: wordmarkX,
    firstBaseline: lastBaseline + g.secondaryDrop,
    maxWidth: wordmarkWidth * GRID.secondaryRunOn,
    align: 'start',
  });
  paths.push(...identifier.paths);
  if (identifier.paths.length > 0) boxes.push(identifier.box);

  const contentBox = unionBoxes(boxes);

  return {
    viewBox: spec.includeClearSpace ? padBox(contentBox, g.clearSpace) : contentBox,
    contentBox,
    paths,
    notes: identifier.notes,
    guides: {
      symbol: symbol.box,
      wordmarkBaselines,
      identifierBaselines: identifier.baselines,
      wordmarkX,
      clearSpace: padBox(contentBox, g.clearSpace),
    },
  };
};
