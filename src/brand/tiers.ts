/**
 * Entity tier registry.
 *
 * A tier is a kind of denominational entity. It decides which fields the
 * creator asks for, which layouts make sense, and how the entity name is set.
 *
 * Adding a tier is one entry here plus, if it needs new wording, a label in
 * each language's `tierLabels` in ./languages.ts.
 */

import type { LayoutId } from '@/core/layouts';

export type TierId =
  | 'church'
  | 'company'
  | 'conference'
  | 'field'
  | 'mission'
  | 'union'
  | 'division'
  | 'institution'
  | 'department'
  | 'ministry'
  | 'media';

export interface TierDef {
  readonly id: TierId;
  /** Short label for the tab or selector. */
  readonly label: string;
  /** One line explaining who this tier is for. */
  readonly help: string;
  /** Placeholder shown in the entity-name field. */
  readonly namePlaceholder: string;
  /** Layouts offered for this tier, in the order they should appear. */
  readonly layouts: readonly LayoutId[];
  /**
   * True when the tier may carry a second, smaller line under the entity
   * name — a department, ministry or descriptor.
   */
  readonly allowsDescriptor: boolean;
  /** Placeholder for the descriptor field. */
  readonly descriptorPlaceholder?: string;
  /** Groups the tiers into the tabs the creator shows. */
  readonly group: 'congregations' | 'administration' | 'entities';
}

export const TIERS: readonly TierDef[] = [
  {
    id: 'church',
    label: 'Church',
    help: 'An organised local congregation.',
    namePlaceholder: 'e.g. Rosettenville',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: false,
    group: 'congregations',
  },
  {
    id: 'company',
    label: 'Company',
    help: 'A company or group not yet organised as a church.',
    namePlaceholder: 'e.g. Kwa-Thema Central',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: false,
    group: 'congregations',
  },
  {
    id: 'conference',
    label: 'Conference',
    help: 'An organised conference within a union.',
    namePlaceholder: 'e.g. Northern Conference',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Stewardship',
    group: 'administration',
  },
  {
    id: 'field',
    label: 'Field',
    help: 'A field operating under a union or conference.',
    namePlaceholder: 'e.g. Limpopo Field',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Youth Ministries',
    group: 'administration',
  },
  {
    id: 'mission',
    label: 'Mission',
    help: 'A mission operating under a union or the division.',
    namePlaceholder: 'e.g. São Tomé and Príncipe Mission',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Communication',
    group: 'administration',
  },
  {
    id: 'union',
    label: 'Union',
    help: 'A union conference or union mission.',
    namePlaceholder: 'e.g. Zimbabwe East Union Conference',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Publishing',
    group: 'administration',
  },
  {
    id: 'division',
    label: 'Division',
    help: 'The division office and its directorates.',
    namePlaceholder: 'e.g. Southern Africa-Indian Ocean Division',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Communication',
    group: 'administration',
  },
  {
    id: 'institution',
    label: 'Institution',
    help: 'A school, university, hospital, clinic or publishing house.',
    namePlaceholder: 'e.g. Solusi University',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Faculty of Theology',
    group: 'entities',
  },
  {
    id: 'department',
    label: 'Department',
    help: 'A departmental lockup for an office within an entity.',
    namePlaceholder: 'e.g. Southern Africa-Indian Ocean Division',
    layouts: ['lateral', 'stacked'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Family Ministries',
    group: 'entities',
  },
  {
    id: 'ministry',
    label: 'Ministry',
    help: 'A recognised ministry, association or federation.',
    namePlaceholder: 'e.g. Adventist Muslim Relations',
    layouts: ['lateral', 'stacked'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Southern Africa-Indian Ocean Division',
    group: 'entities',
  },
  {
    id: 'media',
    label: 'Media',
    help: 'A division media entity or broadcast service.',
    namePlaceholder: 'e.g. Adventist World Radio',
    layouts: ['lateral', 'stacked', 'symbol'],
    allowsDescriptor: true,
    descriptorPlaceholder: 'e.g. Southern Africa-Indian Ocean Division',
    group: 'entities',
  },
];

export const TIER_GROUPS = [
  { id: 'congregations', label: 'Churches & companies' },
  { id: 'administration', label: 'Conferences & unions' },
  { id: 'entities', label: 'Institutions & departments' },
] as const;

export type TierGroupId = (typeof TIER_GROUPS)[number]['id'];

export const DEFAULT_TIER_ID: TierId = 'church';

const tierIndex = new Map(TIERS.map((t) => [t.id, t]));

export function requireTier(id: string): TierDef {
  const found = tierIndex.get(id as TierId);
  if (found) return found;
  const fallback = tierIndex.get(DEFAULT_TIER_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Tier registry is missing its default tier.');
  return fallback;
}

export function tiersInGroup(group: TierGroupId): readonly TierDef[] {
  return TIERS.filter((t) => t.group === group);
}
