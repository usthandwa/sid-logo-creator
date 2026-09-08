/**
 * Lockup construction constants.
 *
 * Every measurement is expressed in **symbol units**: the symbol is exactly
 * `SYMBOL_UNITS` tall, and all other dimensions are stated relative to that.
 * Scaling the lockup therefore means scaling one number.
 *
 * The ratios were derived by measuring official Seventh-day Adventist entity
 * artwork produced with the General Conference identity templates, and are
 * consistent across both the lateral and stacked constructions (the two
 * constructions agree to within 0.5%, which is what confirms the system).
 *
 * See docs/BRAND.md for the derivation and the source measurements.
 * Reference: https://www.adventist.design/using-the-system/entity-identifiers/
 */

/** Height of the church symbol in the internal coordinate system. */
export const SYMBOL_UNITS = 1000;

export const CONSTRUCTION = {
  /**
   * Denomination wordmark ("Seventh-day Adventist® Church") type size,
   * as a fraction of symbol height.
   */
  wordmarkSize: 0.529,

  /** Baseline-to-baseline distance of the wordmark, in em of the wordmark size. */
  wordmarkLineHeight: 1.0045,

  /**
   * Secondary type — the entity identifier — as a fraction of the primary
   * type's x-height. adventist.design: "The maximum size for secondary type is
   * 75% the x-height of the primary type."
   *
   * This replaces a directly measured 0.211 of symbol height. The two agree to
   * 0.75%, which is what confirms the rule rather than the measurement.
   */
  secondarySize: 0.75,

  /**
   * Floor for secondary type once the line is long, as a fraction of the
   * primary x-height. adventist.design: "If the secondary type is very long,
   * it can be reduced to a minimum of 50% of the x-height."
   */
  secondaryMinSize: 0.5,

  /**
   * How far the secondary line may run past the wordmark before it is reduced,
   * as a multiple of the wordmark's width.
   *
   * The secondary line is not confined to the wordmark: in the published
   * clear-space reference the entity identifier runs to about 1.47× the
   * wordmark width on a single line, and it — not the wordmark — sets the
   * lockup's width and its clear-space boundary.
   */
  secondaryRunOn: 1.5,

  /** Entity-descriptor (department / entity type) size, in em of the entity size. */
  descriptorSize: 0.75,

  /**
   * Drop from the wordmark's last baseline to the entity name's first
   * baseline, as a fraction of symbol height.
   */
  entityBaselineDrop: 0.504,

  /** Baseline-to-baseline distance within the entity block, in em of entity size. */
  entityLineHeight: 1.2,

  /** Horizontal gap between symbol and wordmark (lateral), as a fraction of symbol height. */
  lateralGap: 0.264,

  /** Vertical gap between symbol baseline and wordmark cap height (stacked). */
  stackedGap: 0.29,

  /**
   * Minimum clear space around the finished lockup, as a multiple of the
   * wordmark's x-height. adventist.design specifies two times the height of
   * the lowercase letters.
   */
  clearSpaceXHeights: 2,
} as const;

export type ConstructionRules = typeof CONSTRUCTION;

/**
 * Size of the secondary type, given the primary type's x-height ratio and the
 * size the primary is set at.
 *
 * This depends on the loaded font's x-height, so it cannot be a constant the
 * way the other ratios are — it is read from the face's OS/2 table.
 */
export function secondaryTypeSize(xHeight: number, primarySize: number): number {
  return CONSTRUCTION.secondarySize * xHeight * primarySize;
}

/**
 * Smallest permitted secondary size as a fraction of its nominal size — the
 * 50% floor expressed against the 75% nominal.
 */
export const SECONDARY_MIN_SCALE = CONSTRUCTION.secondaryMinSize / CONSTRUCTION.secondarySize;

/**
 * Minimum reproduction width, in millimetres, for print. Below this the
 * symbol's interior counters close up.
 */
export const MINIMUM_PRINT_WIDTH_MM = 25;

/** Minimum reproduction width, in CSS pixels, for screen. */
export const MINIMUM_SCREEN_WIDTH_PX = 96;
