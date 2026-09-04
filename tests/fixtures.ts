import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as opentype from 'opentype.js';
import { createTypeface } from '@/core/typeface';
import type { Typeface } from '@/core/types';

// Resolved from the project root: the jsdom test environment does not give
// modules a file: URL, so import.meta.url is not usable here.
const FONT_PATH = resolve(process.cwd(), 'public/fonts/AdventSans-Logo.otf');

let cached: Typeface | null = null;

/**
 * The real Advent Sans, loaded from disk.
 *
 * Tests deliberately use the shipped font rather than a stub: the layout maths
 * depends on real metrics, and a stub with tidy numbers would pass while the
 * lockup was visibly wrong.
 */
export function testTypeface(): Typeface {
  cached ??= createTypeface(opentype.parse(toArrayBuffer(readFileSync(FONT_PATH))), true);
  return cached;
}

function toArrayBuffer(buffer: Buffer): ArrayBuffer {
  const copy = new ArrayBuffer(buffer.byteLength);
  new Uint8Array(copy).set(buffer);
  return copy;
}
