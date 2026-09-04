/**
 * The entity-identifier block: an entity name, optionally with a smaller
 * descriptor line beneath it.
 *
 * Shared by every layout so the two constructions cannot drift apart.
 */

import { CONSTRUCTION, SYMBOL_UNITS } from '@/brand/constructionRules';
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
  readonly notes: readonly string[];
}

const EMPTY: IdentifierBlock = {
  paths: [],
  box: { x: 0, y: 0, width: 0, height: 0 },
  lastBaseline: 0,
  notes: [],
};

export function buildIdentifierBlock(
  spec: LockupSpec,
  typeface: Typeface,
  options: IdentifierBlockOptions,
): IdentifierBlock {
  const name = applyCase(spec.entityName.trim(), spec.uppercaseEntityName, spec.locale);
  const descriptor = applyCase(spec.descriptor.trim(), spec.uppercaseEntityName, spec.locale);
  if (!name && !descriptor) return { ...EMPTY, lastBaseline: options.firstBaseline };

  const nominal = CONSTRUCTION.entitySize * SYMBOL_UNITS;
  const paths: DrawablePath[] = [];
  const boxes: Box[] = [];
  const notes: string[] = [];
  let baseline = options.firstBaseline;

  if (name) {
    const fitted = fitText(name, typeface, {
      maxWidth: options.maxWidth,
      nominalSize: nominal,
      maxLines: 2,
    });
    if (fitted.size < nominal - 0.01) {
      notes.push('The entity name was reduced to fit the lockup width.');
    }
    if (fitted.lines.length > 1) {
      notes.push('The entity name wraps onto two lines.');
    }
    for (const [index, line] of fitted.lines.entries()) {
      const lineBaseline = baseline + index * fitted.size * CONSTRUCTION.entityLineHeight;
      const x = alignX(line, typeface, fitted.size, options);
      paths.push({ d: typeface.toPathData(line, x, lineBaseline, fitted.size) });
      boxes.push(typeface.inkBounds(line, x, lineBaseline, fitted.size));
    }
    baseline += (fitted.lines.length - 1) * fitted.size * CONSTRUCTION.entityLineHeight;

    if (descriptor) {
      const descriptorSize = fitted.size * CONSTRUCTION.descriptorSize;
      const fittedDescriptor = fitText(descriptor, typeface, {
        maxWidth: options.maxWidth,
        nominalSize: descriptorSize,
        maxLines: 2,
      });
      for (const [index, line] of fittedDescriptor.lines.entries()) {
        baseline +=
          index === 0
            ? fitted.size * CONSTRUCTION.entityLineHeight
            : fittedDescriptor.size * CONSTRUCTION.entityLineHeight;
        const x = alignX(line, typeface, fittedDescriptor.size, options);
        paths.push({ d: typeface.toPathData(line, x, baseline, fittedDescriptor.size) });
        boxes.push(typeface.inkBounds(line, x, baseline, fittedDescriptor.size));
      }
    }
  } else if (descriptor) {
    // A descriptor with no entity name is set at entity size, not reduced.
    const fitted = fitText(descriptor, typeface, {
      maxWidth: options.maxWidth,
      nominalSize: nominal,
      maxLines: 2,
    });
    for (const [index, line] of fitted.lines.entries()) {
      const lineBaseline = baseline + index * fitted.size * CONSTRUCTION.entityLineHeight;
      const x = alignX(line, typeface, fitted.size, options);
      paths.push({ d: typeface.toPathData(line, x, lineBaseline, fitted.size) });
      boxes.push(typeface.inkBounds(line, x, lineBaseline, fitted.size));
    }
    baseline += (fitted.lines.length - 1) * fitted.size * CONSTRUCTION.entityLineHeight;
  }

  return { paths, box: unionBoxes(boxes), lastBaseline: baseline, notes };
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
