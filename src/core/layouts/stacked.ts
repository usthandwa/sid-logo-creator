/**
 * Stacked construction — symbol centred above the denomination wordmark, with
 * the entity identifier centred beneath. Use where the lateral lockup is too
 * wide: narrow signage, app icons in context, portrait covers.
 */

import { CONSTRUCTION, SYMBOL_UNITS } from '@/brand/constructionRules';
import { padBox, symbolPaths, unionBoxes } from '../geometry';
import type { Box, DrawablePath, LayoutFn } from '../types';
import { buildIdentifierBlock } from './textBlock';

export const stacked: LayoutFn = (spec, typeface) => {
  const symbolHeight = SYMBOL_UNITS;
  const wordmarkSize = CONSTRUCTION.wordmarkSize * symbolHeight;
  const lineStep = wordmarkSize * CONSTRUCTION.wordmarkLineHeight;
  const lines = spec.wordmarkLines;

  const wordmarkWidth = lines.reduce(
    (max, line) => Math.max(max, typeface.measureWidth(line, wordmarkSize)),
    0,
  );

  // The centre line is set by whichever of symbol or wordmark is wider.
  const symbolWidth = symbolHeight * (symbolPaths(0, 0, symbolHeight).box.width / symbolHeight);
  const centreX = Math.max(symbolWidth, wordmarkWidth) / 2;

  const symbol = symbolPaths(centreX - symbolWidth / 2, 0, symbolHeight);

  // First wordmark line's cap height sits `stackedGap` below the symbol.
  const firstBaseline =
    symbolHeight + CONSTRUCTION.stackedGap * symbolHeight + typeface.capHeight * wordmarkSize;

  const paths: DrawablePath[] = [...symbol.paths];
  const boxes: Box[] = [symbol.box];

  lines.forEach((line, index) => {
    const baseline = firstBaseline + index * lineStep;
    const x = centreX - typeface.measureWidth(line, wordmarkSize) / 2;
    paths.push({ d: typeface.toPathData(line, x, baseline, wordmarkSize) });
    boxes.push(typeface.inkBounds(line, x, baseline, wordmarkSize));
  });

  const wordmarkLastBaseline = firstBaseline + (lines.length - 1) * lineStep;

  const identifier = buildIdentifierBlock(spec, typeface, {
    originX: centreX,
    firstBaseline: wordmarkLastBaseline + CONSTRUCTION.entityBaselineDrop * symbolHeight,
    maxWidth: Math.max(wordmarkWidth, symbolWidth),
    align: 'middle',
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
