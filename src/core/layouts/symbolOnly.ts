/**
 * Symbol-only construction — the church symbol with no wordmark.
 *
 * Permitted where the denomination has already been named on the same
 * surface: a profile picture beside the entity's name, an app icon, a
 * favicon, a pattern. Never as a standalone identity.
 */

import { CONSTRUCTION, SYMBOL_UNITS } from '@/brand/constructionRules';
import { padBox, symbolPaths } from '../geometry';
import type { LayoutFn } from '../types';

export const symbolOnly: LayoutFn = (spec, typeface) => {
  const symbol = symbolPaths(0, 0, SYMBOL_UNITS);
  const clearSpace =
    CONSTRUCTION.clearSpaceXHeights * typeface.xHeight * CONSTRUCTION.wordmarkSize * SYMBOL_UNITS;

  return {
    viewBox: spec.includeClearSpace ? padBox(symbol.box, clearSpace) : symbol.box,
    contentBox: symbol.box,
    paths: symbol.paths,
    notes: [
      'The symbol may stand alone only where the entity is already named on the same surface.',
    ],
  };
};
