/**
 * The single entry point into the lockup engine.
 */

import { requireLayout } from './layouts';
import type { Lockup, LockupSpec, Typeface } from './types';

export function buildLockup(spec: LockupSpec, typeface: Typeface): Lockup {
  return requireLayout(spec.layout).build(spec, typeface);
}
