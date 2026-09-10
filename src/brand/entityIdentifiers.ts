/**
 * Entity identifiers — the naming approaches the identity system defines.
 *
 * This replaces an "entity type" registry that listed nine kinds of entity
 * (church, conference, union, institution, ministry…) but drew all nine
 * identically. The kind of entity never changed the artwork; what changes it is
 * **how the name is composed against the denomination**, which is what
 * adventist.design actually specifies.
 *
 * Reference: https://www.adventist.design/using-the-system/entity-identifiers/
 */

/**
 * The two kinds of entity the guidelines separate.
 *
 * For public-facing entities the guidance is recommendation; for administrative
 * entities it is a requirement.
 */
export type CategoryId = 'church' | 'administrative';

export interface CategoryDef {
  readonly id: CategoryId;
  readonly label: string;
  readonly help: string;
  /** Examples, in the guidelines' own terms. */
  readonly examples: string;
}

export const CATEGORIES: readonly CategoryDef[] = [
  {
    id: 'church',
    label: 'Church',
    help: 'Public-facing entities — churches, schools, hospitals, ministries. The guidance here is recommendation, aimed at helping people recognise the entity as Seventh-day Adventist.',
    examples: 'Local churches, schools, hospitals, ministries, community organisations.',
  },
  {
    id: 'administrative',
    label: 'Administrative',
    help: 'Requirements, not recommendations. The naming shows the entity is part of the church rather than the other way round.',
    examples: 'Departments, offices, support services, internal functions.',
  },
];

/**
 * The acceptability key the guidelines mark every example with.
 *
 * These are not style preferences: an `unacceptable` application breaks the
 * system rather than merely departing from taste.
 */
export type Acceptability = 'preferred' | 'acceptable' | 'unacceptable';

export const ACCEPTABILITY_MARK: Record<Acceptability, string> = {
  preferred: '✓',
  acceptable: '!',
  unacceptable: '✕',
};

export const ACCEPTABILITY_LABEL: Record<Acceptability, string> = {
  preferred: 'Preferred',
  acceptable: 'Acceptable, not preferred',
  unacceptable: 'Do not use',
};

/** Which text is set at primary size, and which drops to secondary. */
export type ApproachId =
  | 'equal-size'
  | 'smaller-size'
  | 'adventist-only'
  | 'no-denomination'
  | 'of-adventists'
  | 'of-the-church';

export interface ApproachDef {
  readonly id: ApproachId;
  readonly category: CategoryId;
  readonly label: string;
  /** The guidelines' own rationale, kept close to the source wording. */
  readonly help: string;
  readonly acceptability: Acceptability;
  /** Shown as a miniature of the resulting lockup. */
  readonly shape: readonly string[];
  /**
   * True when the entity name sets at the same size as the denomination above
   * it, rather than dropping to the smaller secondary line.
   */
  readonly nameAtPrimarySize: boolean;
  /** True when the approach needs the shortened "Adventist" form. */
  readonly needsShortForm?: boolean;
  /** True when the approach needs the administrative "of …" wording. */
  readonly needsAdministrativeForm?: boolean;
}

export const APPROACHES: readonly ApproachDef[] = [
  {
    id: 'equal-size',
    category: 'church',
    label: 'Name at the same size',
    help: 'The clearest indication that the entity is Seventh-day Adventist, and that the church is defined by the local setting. Of all the options this aids recognition of the wider church most effectively.',
    acceptability: 'preferred',
    shape: ['Seventh-day Adventist Church', 'Entity Name'],
    nameAtPrimarySize: true,
  },
  {
    id: 'smaller-size',
    category: 'church',
    label: 'Name smaller, beneath',
    help: 'A clear indication the entity is Seventh-day Adventist, and the standard entity identifier. Setting the name smaller than the denomination aids recognition of the wider church, though it distinguishes the entity itself less strongly.',
    acceptability: 'acceptable',
    shape: ['Seventh-day Adventist Church', 'entity name'],
    nameAtPrimarySize: false,
  },
  {
    id: 'adventist-only',
    category: 'church',
    label: 'Only “Adventist” in the name',
    help: 'An elegant way to handle what can be a lengthy name. “Adventist” has long been an acceptable shortening, though it does not aid recognition as well as the fuller forms.',
    acceptability: 'acceptable',
    shape: ['Entity Name Adventist Entity Type'],
    nameAtPrimarySize: true,
    needsShortForm: true,
  },
  {
    id: 'no-denomination',
    category: 'church',
    label: 'No part of the denomination name',
    help: 'The least indication that the entity is Seventh-day Adventist, and the least effective at aiding recognition. Where this is chosen for mission reasons, add “a Seventh-day Adventist [entity type]” elsewhere on the material.',
    acceptability: 'acceptable',
    shape: ['Entity Name'],
    nameAtPrimarySize: false,
  },
  {
    id: 'of-adventists',
    category: 'administrative',
    label: '“of Seventh-day Adventists”',
    help: 'The preferred convention. Naming the entity first, then how it is part of the church, shifts the perception from a church that is its administrative entities to one supported by them — and presents them as entities of the people rather than of the organisation.',
    acceptability: 'preferred',
    shape: ['Entity Name', 'of Seventh-day Adventists'],
    nameAtPrimarySize: true,
    needsAdministrativeForm: true,
  },
  {
    id: 'of-the-church',
    category: 'administrative',
    label: '“of the Seventh-day Adventist Church”',
    help: 'Acceptable and appropriate where language or length require it, but it associates “church” with an administrative entity rather than with a local body of believers.',
    acceptability: 'acceptable',
    shape: ['Entity Name', 'of the Seventh-day Adventist Church'],
    nameAtPrimarySize: true,
    needsAdministrativeForm: true,
  },
];

/**
 * Department name options.
 *
 * A second axis, inside the administrative category: once a department is named
 * as well as its parent entity, the guidelines give four ways to combine them.
 * They differ in how clearly the department's place in the structure reads to
 * someone outside it — the first two work externally, the last two do not.
 */
export type DepartmentOptionId = 'hierarchy' | 'level' | 'internal' | 'compact';

export interface DepartmentOptionDef {
  readonly id: DepartmentOptionId;
  readonly label: string;
  readonly help: string;
  readonly acceptability: Acceptability;
  /** True where the option needs the administrative "of …" wording. */
  readonly needsAdministrativeForm: boolean;
  /**
   * The lines the option sets, top to bottom, with empty entries dropped.
   * `form` is the language's administrative wording, empty where it has none.
   */
  compose(parent: string, department: string, form: string): readonly string[];
}

export const DEPARTMENT_OPTIONS: readonly DepartmentOptionDef[] = [
  {
    id: 'hierarchy',
    label: 'Entity, then department',
    help: 'Communicates externally, and to other administrative levels, which entity the department belongs to. The most explicit about reporting structure.',
    acceptability: 'preferred',
    needsAdministrativeForm: true,
    compose: (parent, department, form) => [parent, department, form],
  },
  {
    id: 'level',
    label: 'Entity and department on one line',
    help: 'Also communicates externally and to other administrative levels, more compactly, though the department reads as part of a longer name rather than as its own line.',
    acceptability: 'acceptable',
    needsAdministrativeForm: true,
    compose: (parent, department, form) => [[parent, department].filter(Boolean).join(' '), form],
  },
  {
    id: 'internal',
    label: 'Department, then entity',
    help: 'Clear internally and to other administrative levels, but not a good option for public-facing material: the department leads, so the entity reads as a qualifier.',
    acceptability: 'acceptable',
    needsAdministrativeForm: false,
    compose: (parent, department) => [department, parent ? `of ${parent}` : ''],
  },
  {
    id: 'compact',
    label: 'Department and entity, no linking word',
    help: 'Clear internally, but depending on the department this is likely to cause confusion at other administrative levels, and is certainly not the best option for public-facing material.',
    acceptability: 'acceptable',
    needsAdministrativeForm: false,
    compose: (parent, department) => [department, parent],
  },
];

export const DEFAULT_DEPARTMENT_OPTION_ID: DepartmentOptionId = 'hierarchy';

const departmentIndex = new Map(DEPARTMENT_OPTIONS.map((d) => [d.id, d]));

export function requireDepartmentOption(id: string): DepartmentOptionDef {
  const found = departmentIndex.get(id as DepartmentOptionId);
  if (found) return found;
  const fallback = departmentIndex.get(DEFAULT_DEPARTMENT_OPTION_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Department option registry is missing its default.');
  return fallback;
}

export interface ComposeInput {
  readonly approach: ApproachDef;
  readonly departmentOption: DepartmentOptionDef;
  /** The denomination's authored lines, carrying any ®. */
  readonly wordmarkLines: readonly string[];
  readonly denominationShort?: string | undefined;
  readonly administrativeForms?: readonly [string, string] | undefined;
  /**
   * Linking wording supplied by the user, for a language that has no approved
   * form of its own.
   *
   * The guidelines expect this: "the previous examples may not translate
   * directly across languages, so the principle to keep in mind is shifting
   * away from a perception the church is the entities that support it to a
   * perception that the church is supported by those entities." Refusing to set
   * the lockup at all would enforce the example rather than the principle.
   */
  readonly customAdministrativeForm?: string | undefined;
  readonly entityName: string;
  readonly entityType: string;
  readonly departmentName: string;
  /**
   * Breaks a composed line onto a second where it will not fit. Injected
   * because measurement needs a typeface, which this registry has no business
   * knowing about.
   */
  readonly wrap: (text: string) => readonly string[];
}

export interface ComposedText {
  /** Lines set at primary size, top to bottom. */
  readonly primary: readonly string[];
  /** The line beneath them, empty where there is none. */
  readonly secondary: string;
  /**
   * True when that line sets at primary size rather than the smaller secondary.
   *
   * It stays a *secondary* line either way. The primary block is anchored to the
   * symbol — the lateral construction levels its last baseline with the symbol's
   * bottom — so adding the name to it would push the denomination up off its
   * anchor. Sizing the line up leaves the denomination where the artwork puts it
   * and grows the lockup downwards, which is what the published logos do.
   */
  readonly secondaryAtPrimarySize: boolean;
}

/**
 * Decides what text goes where, given a naming approach.
 *
 * The ordering rule: a **church** sets the denomination on top with its own
 * name beneath, as the published artwork does. An **administrative** entity is
 * the other way round — its own name leads, and the "of …" form sets beneath.
 *
 * Where a language has no approved wording for the chosen approach, the name is
 * still set, using the composition that needs no such wording. Dropping it and
 * showing the bare denomination logo would silently discard what was typed.
 */
export function composeLockupText(input: ComposeInput): ComposedText {
  const { approach, departmentOption, wordmarkLines, wrap } = input;
  const name = input.entityName.trim().replace(/\s+/g, ' ');
  const type = input.entityType.trim().replace(/\s+/g, ' ');
  const department = input.departmentName.trim().replace(/\s+/g, ' ');

  const bare = (primary: readonly string[]): ComposedText => ({
    primary,
    secondary: '',
    secondaryAtPrimarySize: false,
  });

  if (!name) return bare(wordmarkLines);

  const administrativeForm =
    approach.id === 'of-adventists' || approach.id === 'of-the-church'
      ? (input.administrativeForms?.[approach.id === 'of-adventists' ? 0 : 1] ??
        input.customAdministrativeForm?.trim().replace(/\s+/g, ' ') ??
        '')
      : '';

  if (department && approach.category === 'administrative') {
    return bare(
      departmentOption
        .compose(name, department, administrativeForm)
        .filter(Boolean)
        .flatMap((line) => wrap(line)),
    );
  }

  if (administrativeForm) return bare([...wrap(name), administrativeForm]);

  if (approach.id === 'adventist-only' && input.denominationShort) {
    return bare(wrap([name, input.denominationShort, type].filter(Boolean).join(' ')));
  }

  if (approach.id === 'no-denomination') return bare(wrap(name));

  // Church: the denomination keeps its anchored position and the name sets
  // beneath it, at primary size or the smaller one as the approach decides.
  return {
    primary: wordmarkLines,
    secondary: name,
    secondaryAtPrimarySize: approach.nameAtPrimarySize,
  };
}

export const DEFAULT_CATEGORY_ID: CategoryId = 'church';
export const DEFAULT_APPROACH_ID: ApproachId = 'equal-size';

const categoryIndex = new Map(CATEGORIES.map((c) => [c.id, c]));

/**
 * Resolves a category id, falling back to the default.
 *
 * The id is persisted in the browser, so a renamed or removed category must not
 * strand someone on a value that no longer resolves to any approach.
 */
export function requireCategory(id: string): CategoryDef {
  const found = categoryIndex.get(id as CategoryId);
  if (found) return found;
  const fallback = categoryIndex.get(DEFAULT_CATEGORY_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Category registry is missing its default.');
  return fallback;
}

const approachIndex = new Map(APPROACHES.map((a) => [a.id, a]));

export function requireApproach(id: string): ApproachDef {
  const found = approachIndex.get(id as ApproachId);
  if (found) return found;
  const fallback = approachIndex.get(DEFAULT_APPROACH_ID);
  /* c8 ignore next */
  if (!fallback) throw new Error('Approach registry is missing its default.');
  return fallback;
}

export function approachesIn(category: CategoryId): readonly ApproachDef[] {
  return APPROACHES.filter((a) => a.category === category);
}
