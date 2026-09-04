/**
 * SID territory registry.
 *
 * Used by the Language Lab to group staged languages by the union whose
 * communication director has to approve them, and to explain to a church
 * why a given language is offered.
 *
 * Source: https://sidadventist.org/unions/
 */

export interface UnionDef {
  readonly id: string;
  readonly name: string;
  readonly kind: 'union-conference' | 'union-mission' | 'attached-mission';
  /** ISO 3166-1 alpha-2 codes. */
  readonly territories: readonly string[];
}

export const UNIONS: readonly UnionDef[] = [
  { id: 'buc', name: 'Botswana Union Conference', kind: 'union-conference', territories: ['BW'] },
  {
    id: 'iouc',
    name: 'Indian Ocean Union Conference',
    kind: 'union-conference',
    territories: ['MG', 'MU', 'RE', 'YT', 'KM', 'SC'],
  },
  { id: 'muc', name: 'Malawi Union Conference', kind: 'union-conference', territories: ['MW'] },
  {
    id: 'nzuc',
    name: 'Northern Zambia Union Conference',
    kind: 'union-conference',
    territories: ['ZM'],
  },
  {
    id: 'sauc',
    name: 'South Africa Union Conference',
    kind: 'union-conference',
    territories: ['ZA', 'LS', 'NA', 'SZ', 'SH'],
  },
  {
    id: 'szuc',
    name: 'Southern Zambia Union Conference',
    kind: 'union-conference',
    territories: ['ZM'],
  },
  {
    id: 'zcuc',
    name: 'Zimbabwe Central Union Conference',
    kind: 'union-conference',
    territories: ['ZW'],
  },
  {
    id: 'zeuc',
    name: 'Zimbabwe East Union Conference',
    kind: 'union-conference',
    territories: ['ZW'],
  },
  {
    id: 'zwuc',
    name: 'Zimbabwe West Union Conference',
    kind: 'union-conference',
    territories: ['ZW'],
  },
  { id: 'mum', name: 'Mozambique Union Mission', kind: 'union-mission', territories: ['MZ'] },
  {
    id: 'neaum',
    name: 'North-Eastern Angola Union Mission',
    kind: 'union-mission',
    territories: ['AO'],
  },
  {
    id: 'swaum',
    name: 'South-Western Angola Union Mission',
    kind: 'union-mission',
    territories: ['AO'],
  },
  {
    id: 'stp',
    name: 'São Tomé and Príncipe Mission',
    kind: 'attached-mission',
    territories: ['ST'],
  },
];

export const TERRITORY_NAMES: Readonly<Record<string, string>> = {
  AO: 'Angola',
  BW: 'Botswana',
  KM: 'Comoros',
  LS: 'Lesotho',
  MG: 'Madagascar',
  MU: 'Mauritius',
  MW: 'Malawi',
  MZ: 'Mozambique',
  NA: 'Namibia',
  RE: 'Réunion',
  SC: 'Seychelles',
  SH: 'Saint Helena',
  ST: 'São Tomé and Príncipe',
  SZ: 'Eswatini',
  YT: 'Mayotte',
  ZA: 'South Africa',
  ZM: 'Zambia',
  ZW: 'Zimbabwe',
};

export function territoryName(code: string): string {
  return TERRITORY_NAMES[code] ?? code;
}

/** Unions whose territory includes any of the given country codes. */
export function unionsForTerritories(codes: readonly string[]): readonly UnionDef[] {
  const set = new Set(codes);
  return UNIONS.filter((u) => u.territories.some((t) => set.has(t)));
}
