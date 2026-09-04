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

  /** Entity-name type size, as a fraction of symbol height. */
  entitySize: 0.211,

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
 * Minimum reproduction width, in millimetres, for print. Below this the
 * symbol's interior counters close up.
 */
export const MINIMUM_PRINT_WIDTH_MM = 25;

/** Minimum reproduction width, in CSS pixels, for screen. */
export const MINIMUM_SCREEN_WIDTH_PX = 96;
