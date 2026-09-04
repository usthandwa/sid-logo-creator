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
  /** Denomination name, already split into its lines and carrying any ®. */
  readonly wordmarkLines: readonly string[];
  /** The entity's own name. Empty means the base logo with no entity name. */
  readonly entityName: string;
  /** Optional smaller line under the entity name (department, descriptor). */
  readonly descriptor: string;
  /** Fill colour applied to every path. */
  readonly colour: string;
  /** Set entity names in capitals, as the identity templates do. */
  readonly uppercaseEntityName: boolean;
  /** Locale used for case conversion, so Turkish-style rules stay correct. */
  readonly locale: string;
  /**
   * Whether to reserve the mandatory clear space inside the artwork box.
   * Off by default so the exported file crops tightly, which is what design
   * software expects.
   */
  readonly includeClearSpace: boolean;
}

/** What the engine produced. */
export interface Lockup {
  readonly viewBox: Box;
  /** Bounds of the artwork itself, excluding any clear space. */
  readonly contentBox: Box;
  readonly paths: readonly DrawablePath[];
  /** Diagnostics the UI can surface; never an error condition on its own. */
  readonly notes: readonly string[];
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
