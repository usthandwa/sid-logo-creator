/**
 * Layout registry.
 *
 * A layout is a pure function from a spec and a typeface to geometry. Adding
 * one means writing that function, importing it here and adding a descriptor
 * to `LAYOUTS`; the UI, the exporters and the tier registry pick it up with no
 * further changes.
 */

import type { LayoutFn } from '../types';
import { lateral } from './lateral';
import { stacked } from './stacked';
import { symbolOnly } from './symbolOnly';

export type LayoutId = 'lateral' | 'stacked' | 'symbol';

export interface LayoutDef {
  readonly id: LayoutId;
  readonly label: string;
  readonly help: string;
  readonly build: LayoutFn;
  /** True when the layout renders the entity name. */
  readonly carriesEntityName: boolean;
}

export const LAYOUTS: readonly LayoutDef[] = [
  {
    id: 'lateral',
    label: 'Horizontal',
    help: 'Symbol beside the name. The preferred, reading-aligned lockup.',
    build: lateral,
    carriesEntityName: true,
  },
  {
    id: 'stacked',
    label: 'Vertical',
    help: 'Symbol above the name, centred. For narrow spaces.',
    build: stacked,
    carriesEntityName: true,
  },
  {
    id: 'symbol',
    label: 'Symbol only',
    help: 'The church symbol alone, for avatars and icons.',
    build: symbolOnly,
    carriesEntityName: false,
  },
];

export const DEFAULT_LAYOUT_ID: LayoutId = 'lateral';

const layoutIndex = new Map(LAYOUTS.map((l) => [l.id, l]));

export function requireLayout(id: string): LayoutDef {
  const found = layoutIndex.get(id as LayoutId);
  if (found) return found;
  const fallback = layoutIndex.get(DEFAULT_LAYOUT_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Layout registry is missing its default layout.');
  return fallback;
}
