/**
 * The entity-identifier block: an entity name, optionally with a smaller
 * descriptor line beneath it.
 *
 * Shared by every layout so the two constructions cannot drift apart.
 */

import { GRID, grid } from '@/brand/constructionRules';
import { applyCase, fitText, unionBoxes } from '../geometry';
import type { Box, DrawablePath, LockupSpec, Typeface } from '../types';

export type Alignment = 'start' | 'middle';

export interface IdentifierBlockOptions {
  /** x of the alignment origin: the left edge, or the centre line. */
  readonly originX: number;
  /** Baseline of the first line of the entity name. */
  readonly firstBaseline: number;
  /** Width the block must fit inside. */
  readonly maxWidth: number;
  readonly align: Alignment;
}

export interface IdentifierBlock {
  readonly paths: readonly DrawablePath[];
  readonly box: Box;
  /** Baseline of the last line drawn, so a caller can continue below it. */
  readonly lastBaseline: number;
  /** Every baseline drawn, top to bottom, for the construction guides. */
  readonly baselines: readonly number[];
  readonly notes: readonly string[];
}

const EMPTY: IdentifierBlock = {
  paths: [],
  box: { x: 0, y: 0, width: 0, height: 0 },
  lastBaseline: 0,
  baselines: [],
  notes: [],
};

export function buildIdentifierBlock(
  spec: LockupSpec,
  typeface: Typeface,
  options: IdentifierBlockOptions,
): IdentifierBlock {
  const name = applyCase(spec.secondaryText.trim(), spec.uppercaseSecondary, spec.locale);
  const descriptor = applyCase(spec.descriptor.trim(), spec.uppercaseSecondary, spec.locale);
  if (!name && !descriptor) return { ...EMPTY, lastBaseline: options.firstBaseline };

  const g = grid(typeface.xHeight);
  const nominal = spec.secondaryAtPrimarySize ? g.primarySize : g.secondarySize;
  /**
   * Leading follows the type size rather than sitting at a fixed distance. The
   * grid states the step against nominal secondary type; a line reduced toward
   * the floor would otherwise keep the full step and end up with half again as
   * much leading as the design calls for.
   */
  const leading = (size: number) => size * (GRID.secondaryLineStep / GRID.secondarySize);
  const paths: DrawablePath[] = [];
  const boxes: Box[] = [];
  const notes: string[] = [];
  const baselines: number[] = [];
  let baseline = options.firstBaseline;

  if (name) {
    const fitted = fitText(name, typeface, {
      maxWidth: options.maxWidth,
      nominalSize: nominal,
      maxLines: 2,
      minScale: g.secondaryMinScale,
      preferSingleLine: true,
    });
    if (fitted.size < nominal - 0.01) {
      notes.push('The second line was reduced to fit, within the permitted range.');
    }
    if (fitted.lines.length > 1) {
      notes.push('The second line wraps onto two lines.');
    }
    for (const [index, line] of fitted.lines.entries()) {
      const lineBaseline = baseline + index * leading(fitted.size);
      const x = alignX(line, typeface, fitted.size, options);
      paths.push({ d: typeface.toPathData(line, x, lineBaseline, fitted.size) });
      boxes.push(typeface.inkBounds(line, x, lineBaseline, fitted.size));
      baselines.push(lineBaseline);
    }
    baseline += (fitted.lines.length - 1) * leading(fitted.size);

    if (descriptor) {
      const descriptorSize = fitted.size * GRID.descriptorSize;
      const fittedDescriptor = fitText(descriptor, typeface, {
        maxWidth: options.maxWidth,
        nominalSize: descriptorSize,
        maxLines: 2,
        minScale: g.secondaryMinScale,
        preferSingleLine: true,
      });
      for (const [index, line] of fittedDescriptor.lines.entries()) {
        // The step down to the descriptor is set by the line above it; steps
        // between its own lines are set by the descriptor's smaller size.
        baseline += leading(index === 0 ? fitted.size : fittedDescriptor.size);
        const x = alignX(line, typeface, fittedDescriptor.size, options);
        paths.push({ d: typeface.toPathData(line, x, baseline, fittedDescriptor.size) });
        boxes.push(typeface.inkBounds(line, x, baseline, fittedDescriptor.size));
        baselines.push(baseline);
      }
    }
  } else if (descriptor) {
    // A descriptor with no line above it is set at the full secondary size,
    // not reduced.
    const fitted = fitText(descriptor, typeface, {
      maxWidth: options.maxWidth,
      nominalSize: nominal,
      maxLines: 2,
      minScale: g.secondaryMinScale,
      preferSingleLine: true,
    });
    for (const [index, line] of fitted.lines.entries()) {
      const lineBaseline = baseline + index * leading(fitted.size);
      const x = alignX(line, typeface, fitted.size, options);
      paths.push({ d: typeface.toPathData(line, x, lineBaseline, fitted.size) });
      boxes.push(typeface.inkBounds(line, x, lineBaseline, fitted.size));
      baselines.push(lineBaseline);
    }
    baseline += (fitted.lines.length - 1) * leading(fitted.size);
  }

  return { paths, box: unionBoxes(boxes), lastBaseline: baseline, baselines, notes };
}

function alignX(
  line: string,
  typeface: Typeface,
  size: number,
  { originX, align }: IdentifierBlockOptions,
): number {
  if (align === 'start') return originX;
  return originX - typeface.measureWidth(line, size) / 2;
}
