/**
 * SVG serialisation.
 *
 * Every glyph is already an outline by the time it reaches here, so the file
 * this produces is self-contained: it opens identically in Illustrator,
 * Affinity, Inkscape, Figma and a browser, on a machine with no brand font
 * installed.
 */

import { round } from './geometry';
import type { Lockup } from './types';

export interface SvgOptions {
  readonly colour: string;
  /** Written into the file as a comment and the <title>. */
  readonly title: string;
  /** Optional solid background. Omit for transparency. */
  readonly background?: string;
}

export function toSvgString(lockup: Lockup, options: SvgOptions): string {
  const { x, y, width, height } = lockup.viewBox;
  const viewBox = [round(x, 3), round(y, 3), round(width, 3), round(height, 3)].join(' ');

  const background = options.background
    ? `\n  <rect x="${round(x, 3)}" y="${round(y, 3)}" width="${round(width, 3)}" height="${round(
        height,
        3,
      )}" fill="${escapeAttribute(options.background)}"/>`
    : '';

  const paths = lockup.paths
    .filter((p) => p.d)
    .map((p) => {
      const transform = p.transform ? ` transform="${escapeAttribute(p.transform)}"` : '';
      return `    <path d="${p.d}"${transform}/>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- ${escapeComment(options.title)} -->
<!-- Official Seventh-day Adventist artwork. Reproduce as supplied: do not
     recolour parts of the symbol, redraw it, stretch it, or reset the type.
     Construction and clear-space rules: https://www.adventist.design -->
<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${round(
    width,
    3,
  )}" height="${round(height, 3)}" role="img" aria-label="${escapeAttribute(options.title)}">
  <title>${escapeText(options.title)}</title>${background}
  <g fill="${escapeAttribute(options.colour)}" fill-rule="nonzero">
${paths}
  </g>
</svg>
`;
}

function escapeText(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function escapeAttribute(value: string): string {
  return escapeText(value).replace(/"/g, '&quot;');
}

function escapeComment(value: string): string {
  return value.replace(/--+/g, '–');
}
