/**
 * The vocabulary the lockup engine works in.
 *
 * The engine is deliberately free of React, of the DOM and of any brand
 * registry: it takes a spec and a typeface and returns geometry. That is what
 * makes it testable in isolation and reusable from a script, a server or a
 * future native build.
 */

import type { LayoutId } from './layouts';

/** A resolved, ready-to-draw path. Everything the engine emits is a path. */
export interface DrawablePath {
  readonly d: string;
  /** SVG transform applied to this path only. */
  readonly transform?: string;
}

export interface Box {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
}

/** What the user asked for. */
export interface LockupSpec {
  readonly layout: LayoutId;
  /**
   * The primary block, already split into the lines it sets on and carrying any
   * ®. Usually the denomination name; in an administrative lockup it is the
   * entity's own name, with the denomination beneath.
   */
  readonly primaryLines: readonly string[];
  /**
   * The smaller line set beneath the primary block. What it holds depends on
   * the naming approach — a church's name, or the denomination — so it is named
   * for its position rather than its content. Empty means no second line.
   */
  readonly secondaryText: string;
  /**
   * Set the secondary line at primary size instead of the smaller secondary
   * size. It stays a secondary line — beneath the anchored primary block — so
   * the lockup grows downwards rather than lifting the primary off the symbol.
   */
  readonly secondaryAtPrimarySize?: boolean;
  /** Optional third line, smaller again, beneath `secondaryText`. */
  readonly descriptor: string;
  /** Fill colour applied to every path. */
  readonly colour: string;
  /** Set the secondary line in capitals, as the identity templates do. */
  readonly uppercaseSecondary: boolean;
  /** Locale used for case conversion, so Turkish-style rules stay correct. */
  readonly locale: string;
  /**
   * Whether to reserve the mandatory clear space inside the artwork box.
   * Off by default so the exported file crops tightly, which is what design
   * software expects.
   */
  readonly includeClearSpace: boolean;
}

/**
 * The construction lines behind a lockup: where the symbol sits, what the type
 * is aligned to, and where the clear space falls.
 *
 * This is teaching material for the preview, not artwork. It is deliberately
 * kept out of `paths` so that it cannot reach an exported file — see
 * `exportSvg.ts`, which serialises `paths` alone.
 */
export interface LockupGuides {
  /** The symbol's bounding box. */
  readonly symbol: Box;
  /** Baselines of the denomination wordmark, top to bottom. */
  readonly wordmarkBaselines: readonly number[];
  /** Baselines of the entity identifier block, top to bottom. */
  readonly identifierBaselines: readonly number[];
  /** x of the wordmark's alignment origin — the reading-aligned left edge. */
  readonly wordmarkX: number;
  /** The shared centre line. Present only for centred constructions. */
  readonly centreX?: number;
  /**
   * The mandatory clear-space boundary, given whether or not `includeClearSpace`
   * baked it into the viewBox. Always shown, so the rule is visible even when
   * the file is cropped tight.
   */
  readonly clearSpace: Box;
}

/** What the engine produced. */
export interface Lockup {
  readonly viewBox: Box;
  /** Bounds of the artwork itself, excluding any clear space. */
  readonly contentBox: Box;
  readonly paths: readonly DrawablePath[];
  /** Diagnostics the UI can surface; never an error condition on its own. */
  readonly notes: readonly string[];
  /** Construction lines for the preview. Never exported. */
  readonly guides?: LockupGuides;
}

/** Font metrics and glyph outlines, normalised to em units. */
export interface Typeface {
  readonly familyName: string;
  /** True when the real brand font is loaded rather than a system fallback. */
  readonly isBrandFont: boolean;
  /** Cap height as a fraction of the em. */
  readonly capHeight: number;
  /** x-height as a fraction of the em. */
  readonly xHeight: number;
  /** Descender depth (positive) as a fraction of the em. */
  readonly descender: number;
  /** Advance width of `text` at the given size. */
  measureWidth(text: string, size: number): number;
  /** Outline of `text` with its baseline origin at (x, y). */
  toPathData(text: string, x: number, y: number, size: number): string;
  /**
   * Tight bounds of the drawn glyphs, for a baseline origin at (x, y).
   * This is the ink, not the em box, so exports crop exactly.
   */
  inkBounds(text: string, x: number, y: number, size: number): Box;
}

export type LayoutFn = (spec: LockupSpec, typeface: Typeface) => Lockup;
