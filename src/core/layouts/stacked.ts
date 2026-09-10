/**
 * Stacked construction — symbol centred above the denomination wordmark, with
 * the entity identifier centred beneath. Use where the lateral lockup is too
 * wide: narrow signage, portrait covers, and the avatar and profile-image role
 * SID's own guidance gives the centred variant.
 */

import { GRID, grid, SYMBOL_UNITS } from '@/brand/constructionRules';
import { padBox, symbolPaths, unionBoxes } from '../geometry';
import type { Box, DrawablePath, LayoutFn } from '../types';
import { buildIdentifierBlock } from './textBlock';

export const stacked: LayoutFn = (spec, typeface) => {
  const g = grid(typeface.xHeight);
  const symbolHeight = SYMBOL_UNITS;
  const lines = spec.primaryLines;

  const wordmarkWidth = lines.reduce(
    (max, line) => Math.max(max, typeface.measureWidth(line, g.primarySize)),
    0,
  );

  // The centre line is set by whichever of symbol or wordmark is wider.
  const symbolWidth = symbolPaths(0, 0, symbolHeight).box.width;
  const centreX = Math.max(symbolWidth, wordmarkWidth) / 2;

  const symbol = symbolPaths(centreX - symbolWidth / 2, 0, symbolHeight);

  // First wordmark line's cap height sits `stackedGap` below the symbol.
  const firstBaseline = symbolHeight + g.stackedGap + typeface.capHeight * g.primarySize;

  const paths: DrawablePath[] = [...symbol.paths];
  const boxes: Box[] = [symbol.box];
  const wordmarkBaselines: number[] = [];

  lines.forEach((line, index) => {
    const baseline = firstBaseline + index * g.primaryLineStep;
    const x = centreX - typeface.measureWidth(line, g.primarySize) / 2;
    paths.push({ d: typeface.toPathData(line, x, baseline, g.primarySize) });
    boxes.push(typeface.inkBounds(line, x, baseline, g.primarySize));
    wordmarkBaselines.push(baseline);
  });

  const wordmarkLastBaseline = firstBaseline + (lines.length - 1) * g.primaryLineStep;

  // As in the lateral construction, the identifier may run wider than the
  // wordmark and set the lockup's width itself.
  const identifier = buildIdentifierBlock(spec, typeface, {
    originX: centreX,
    firstBaseline: wordmarkLastBaseline + g.secondaryDrop,
    maxWidth: Math.max(wordmarkWidth, symbolWidth) * GRID.secondaryRunOn,
    align: 'middle',
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
      wordmarkX: centreX - wordmarkWidth / 2,
      centreX,
      clearSpace: padBox(contentBox, g.clearSpace),
    },
  };
};
