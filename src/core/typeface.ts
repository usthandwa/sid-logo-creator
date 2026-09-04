/**
 * Typeface loading.
 *
 * The brand typeface is Advent Sans (Logo cut) — the General Conference's
 * custom face, built on Noto Sans and published under the SIL Open Font
 * License 1.1. It is what entity names and denomination wordmarks must be set
 * in. See https://www.adventist.design/global-elements/advent-sans/.
 *
 * Text is converted to outlines before it ever leaves this application, so a
 * downloaded SVG carries no font dependency and renders identically on a
 * machine that has never seen Advent Sans.
 */

import type { Font } from 'opentype.js';
import type { Typeface } from './types';

export const BRAND_FONT_URL = `${import.meta.env.BASE_URL}fonts/AdventSans-Logo.otf`;

/**
 * Metrics fall back to the published Noto Sans values when a face does not
 * declare them, which is safe because Advent Sans inherits Noto Sans metrics.
 */
const NOTO_CAP_HEIGHT = 0.714;
const NOTO_X_HEIGHT = 0.536;
const NOTO_DESCENDER = 0.293;

function ratio(value: number | undefined, unitsPerEm: number, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value) || value === 0) return fallback;
  return Math.abs(value) / unitsPerEm;
}

/** Reads a metric from the OS/2 table without assuming it is present. */
function os2(font: Font, key: 'sCapHeight' | 'sxHeight'): number | undefined {
  const tables = font.tables as Record<string, Record<string, unknown> | undefined>;
  const value = tables['os2']?.[key];
  return typeof value === 'number' ? value : undefined;
}

export function createTypeface(font: Font, isBrandFont: boolean): Typeface {
  const unitsPerEm = font.unitsPerEm || 1000;

  return {
    familyName: font.names.fontFamily?.['en'] ?? 'Advent Sans',
    isBrandFont,
    capHeight: ratio(os2(font, 'sCapHeight'), unitsPerEm, NOTO_CAP_HEIGHT),
    xHeight: ratio(os2(font, 'sxHeight'), unitsPerEm, NOTO_X_HEIGHT),
    descender: ratio(font.descender, unitsPerEm, NOTO_DESCENDER),

    measureWidth(text, size) {
      if (!text) return 0;
      return font.getAdvanceWidth(text, size);
    },

    toPathData(text, x, y, size) {
      if (!text) return '';
      // Two decimals is well below a printer's resolution at any realistic
      // reproduction size, and keeps exported files small.
      return font.getPath(text, x, y, size).toPathData(2);
    },

    inkBounds(text, x, y, size) {
      if (!text) return { x, y, width: 0, height: 0 };
      const box = font.getPath(text, x, y, size).getBoundingBox();
      return {
        x: box.x1,
        y: box.y1,
        width: box.x2 - box.x1,
        height: box.y2 - box.y1,
      };
    },
  };
}

let cached: Promise<Typeface> | null = null;

/**
 * Loads the brand typeface once per session. The service worker precaches the
 * font file, so this resolves offline after the first visit.
 */
export function loadBrandTypeface(url: string = BRAND_FONT_URL): Promise<Typeface> {
  cached ??= (async () => {
    const opentype = await import('opentype.js');
    const response = await fetch(url);
    if (!response.ok) {
      throw new TypefaceUnavailableError(
        `The brand typeface could not be loaded (HTTP ${String(response.status)}).`,
      );
    }
    const buffer = await response.arrayBuffer();
    return createTypeface(opentype.parse(buffer), true);
  })();
  return cached;
}

/** Test seam. */
export function __resetTypefaceCache(): void {
  cached = null;
}

export class TypefaceUnavailableError extends Error {
  override name = 'TypefaceUnavailableError';
}
