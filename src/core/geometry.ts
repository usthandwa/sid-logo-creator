/**
 * Geometry helpers shared by every layout.
 *
 * Nothing here knows about a particular lockup shape; the layouts compose
 * these pieces. Keeping them separate is what lets a new layout be a small
 * file rather than a rewrite.
 */

import { CHURCH_SYMBOL, SYMBOL_ASPECT_RATIO } from '@/brand/symbol';
import type { Box, DrawablePath, Typeface } from './types';

/** The symbol drawn at a given height, positioned at (x, y). */
export function symbolPaths(
  x: number,
  y: number,
  height: number,
): {
  paths: readonly DrawablePath[];
  box: Box;
} {
  const scale = height / CHURCH_SYMBOL.viewBox.height;
  const transform = `translate(${round(x)} ${round(y)}) scale(${round(scale, 6)})`;
  return {
    paths: CHURCH_SYMBOL.paths.map((d) => ({ d, transform })),
    box: { x, y, width: height * SYMBOL_ASPECT_RATIO, height },
  };
}

export interface FittedText {
  readonly lines: readonly string[];
  readonly size: number;
  readonly width: number;
}

export interface FitOptions {
  readonly maxWidth: number;
  readonly nominalSize: number;
  readonly maxLines: number;
  /** Smallest acceptable size, as a fraction of the nominal size. */
  readonly minScale?: number;
  /**
   * Reduce a single line toward `minScale` before breaking it.
   *
   * adventist.design describes long secondary type as being *reduced* — "if
   * the secondary type is very long, it can be reduced to a minimum of 50% of
   * the x-height" — and never as wrapping. The entity identifier therefore
   * sets this; the wordmark, whose line breaks are authored per language, does
   * not.
   */
  readonly preferSingleLine?: boolean;
}

const DEFAULT_MIN_SCALE = 0.62;

/**
 * Fits a single string into at most `maxLines` lines within `maxWidth`.
 *
 * Two orders are available. By default a string wraps at full size before it
 * is allowed to shrink, because small type is harder to read than two lines.
 * With `preferSingleLine` the order inverts, matching how the identity
 * guidelines describe secondary type.
 */
export function fitText(
  text: string,
  typeface: Typeface,
  {
    maxWidth,
    nominalSize,
    maxLines,
    minScale = DEFAULT_MIN_SCALE,
    preferSingleLine = false,
  }: FitOptions,
): FittedText {
  const trimmed = text.trim().replace(/\s+/g, ' ');
  if (!trimmed) return { lines: [], size: nominalSize, width: 0 };

  const singleWidth = typeface.measureWidth(trimmed, nominalSize);
  if (singleWidth <= maxWidth) return { lines: [trimmed], size: nominalSize, width: singleWidth };

  if (preferSingleLine) {
    const scale = maxWidth / singleWidth;
    if (scale >= minScale) {
      const size = nominalSize * scale;
      return { lines: [trimmed], size, width: typeface.measureWidth(trimmed, size) };
    }
  }

  for (let lineCount = 2; lineCount <= maxLines; lineCount += 1) {
    const lines = balanceLines(trimmed, typeface, nominalSize, lineCount);
    const width = widestLine(lines, typeface, nominalSize);
    if (width <= maxWidth) return { lines, size: nominalSize, width };
  }

  // Still too wide at the most generous wrap: shrink to fit, with a floor.
  const lines = balanceLines(trimmed, typeface, nominalSize, maxLines);
  const naturalWidth = widestLine(lines, typeface, nominalSize);
  const scale = Math.max(minScale, maxWidth / naturalWidth);
  const size = nominalSize * scale;
  return { lines, size, width: widestLine(lines, typeface, size) };
}

function widestLine(lines: readonly string[], typeface: Typeface, size: number): number {
  return lines.reduce((max, line) => Math.max(max, typeface.measureWidth(line, size)), 0);
}

/**
 * Splits `text` into exactly `lineCount` lines, choosing the break points that
 * make the lines most even. Greedy wrapping leaves a long first line and a
 * stub second one, which reads badly under a symbol.
 */
function balanceLines(
  text: string,
  typeface: Typeface,
  size: number,
  lineCount: number,
): readonly string[] {
  const words = text.split(' ');
  if (lineCount <= 1 || words.length <= 1) return [text];
  const effective = Math.min(lineCount, words.length);
  if (effective <= 1) return [text];

  const widths = words.map((w) => typeface.measureWidth(w, size));
  const spaceWidth = typeface.measureWidth(' ', size);

  // Exhaustive for two lines, which is every case the lockups use; falls back
  // to an even-mass split for more.
  if (effective === 2) {
    let bestAt = 1;
    let bestDelta = Number.POSITIVE_INFINITY;
    for (let at = 1; at < words.length; at += 1) {
      const left = lineWidth(widths, spaceWidth, 0, at);
      const right = lineWidth(widths, spaceWidth, at, words.length);
      const delta = Math.abs(left - right);
      if (delta < bestDelta) {
        bestDelta = delta;
        bestAt = at;
      }
    }
    return [words.slice(0, bestAt).join(' '), words.slice(bestAt).join(' ')];
  }

  const total = lineWidth(widths, spaceWidth, 0, words.length);
  const target = total / effective;
  const lines: string[] = [];
  let start = 0;
  for (let line = 0; line < effective - 1; line += 1) {
    let at = start + 1;
    while (
      at < words.length - (effective - line - 2) &&
      lineWidth(widths, spaceWidth, start, at + 1) <= target
    ) {
      at += 1;
    }
    lines.push(words.slice(start, at).join(' '));
    start = at;
  }
  lines.push(words.slice(start).join(' '));
  return lines;
}

function lineWidth(
  widths: readonly number[],
  spaceWidth: number,
  from: number,
  to: number,
): number {
  let sum = 0;
  for (let i = from; i < to; i += 1) sum += widths[i] ?? 0;
  return sum + spaceWidth * Math.max(0, to - from - 1);
}

/** Smallest box containing all the given boxes. */
export function unionBoxes(boxes: readonly Box[]): Box {
  if (boxes.length === 0) return { x: 0, y: 0, width: 0, height: 0 };
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  for (const b of boxes) {
    minX = Math.min(minX, b.x);
    minY = Math.min(minY, b.y);
    maxX = Math.max(maxX, b.x + b.width);
    maxY = Math.max(maxY, b.y + b.height);
  }
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY };
}

export function padBox(box: Box, padding: number): Box {
  return {
    x: box.x - padding,
    y: box.y - padding,
    width: box.width + padding * 2,
    height: box.height + padding * 2,
  };
}

export function round(value: number, places = 2): number {
  const factor = 10 ** places;
  return Math.round(value * factor) / factor;
}

export function applyCase(text: string, uppercase: boolean, locale: string): string {
  return uppercase ? text.toLocaleUpperCase(locale) : text;
}
