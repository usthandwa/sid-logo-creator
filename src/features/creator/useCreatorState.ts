import { useMemo, useState } from 'react';
import {
  approachesIn,
  composeLockupText,
  DEFAULT_APPROACH_ID,
  DEFAULT_CATEGORY_ID,
  DEFAULT_DEPARTMENT_OPTION_ID,
  requireApproach,
  requireCategory,
  requireDepartmentOption,
  type ApproachId,
  type CategoryId,
  type DepartmentOptionId,
} from '@/brand/entityIdentifiers';
import {
  DEFAULT_LANGUAGE_CODE,
  requireLanguage,
  wordmarkLines,
  type LanguageDef,
} from '@/brand/languages';
import {
  DEFAULT_COLOUR_ID,
  DEFAULT_SURFACE_ID,
  getColour,
  PREVIEW_SURFACES,
} from '@/brand/palette';
import { GRID, grid } from '@/brand/constructionRules';
import { buildLockup } from '@/core/buildLockup';
import { balanceLines } from '@/core/geometry';
import { DEFAULT_LAYOUT_ID, requireLayout, type LayoutId } from '@/core/layouts';
import type { Lockup, LockupSpec, Typeface } from '@/core/types';
import { isString, usePersistentState } from '@/hooks/usePersistentState';

export interface CreatorState {
  readonly category: CategoryId;
  readonly approachId: ApproachId;
  readonly languageCode: string;
  readonly layoutId: LayoutId;
  readonly entityName: string;
  readonly entityType: string;
  readonly departmentName: string;
  readonly departmentOptionId: DepartmentOptionId;
  readonly customAdministrativeForm: string;
  readonly colourId: string;
  readonly surfaceId: string;
  readonly includeClearSpace: boolean;
  readonly showGuides: boolean;
}

export interface CreatorApi extends CreatorState {
  readonly language: LanguageDef;
  readonly approach: ReturnType<typeof requireApproach>;
  readonly departmentOption: ReturnType<typeof requireDepartmentOption>;
  readonly layout: ReturnType<typeof requireLayout>;
  readonly colourHex: string;
  readonly surfaceHex: string | null;
  readonly spec: LockupSpec;
  readonly lockup: Lockup;
  /** Set when the chosen approach needs wording this language has not got. */
  readonly unavailableReason: string | null;
  /** What the selected category covers, in the guidelines' terms. */
  readonly categoryHelp: string;
  /**
   * True when no entity name has been typed. Every approach then produces the
   * same denomination logo, because there is no name to compose against it —
   * correct, but it reads as a dead control unless the UI says so.
   */
  readonly approachInert: boolean;
  /**
   * True when the chosen administrative naming needs linking wording that this
   * language has no approved form for, so the user must supply it.
   */
  readonly needsCustomAdministrativeForm: boolean;
  readonly setCategory: (id: CategoryId) => void;
  readonly setApproachId: (id: ApproachId) => void;
  readonly setLanguageCode: (code: string) => void;
  readonly setLayoutId: (id: LayoutId) => void;
  readonly setEntityName: (name: string) => void;
  readonly setEntityType: (value: string) => void;
  readonly setDepartmentName: (value: string) => void;
  readonly setDepartmentOptionId: (id: DepartmentOptionId) => void;
  readonly setCustomAdministrativeForm: (value: string) => void;
  readonly setColourId: (id: string) => void;
  readonly setSurfaceId: (id: string) => void;
  readonly setIncludeClearSpace: (value: boolean) => void;
  readonly setShowGuides: (value: boolean) => void;
}

function firstApproachOf(category: CategoryId): ApproachId {
  return approachesIn(category)[0]?.id ?? DEFAULT_APPROACH_ID;
}

export function useCreatorState(
  typeface: Typeface,
  availableLanguages: readonly LanguageDef[],
): CreatorApi {
  const [categoryRaw, setCategoryRaw] = usePersistentState<string>(
    'sid-logo-creator.category.v1',
    DEFAULT_CATEGORY_ID,
    isString,
  );
  const [approachId, setApproachId] = usePersistentState<string>(
    'sid-logo-creator.approach.v1',
    DEFAULT_APPROACH_ID,
    isString,
  );
  const [languageCode, setLanguageCode] = usePersistentState<string>(
    'sid-logo-creator.language.v1',
    DEFAULT_LANGUAGE_CODE,
    isString,
  );
  const [colourId, setColourId] = usePersistentState<string>(
    'sid-logo-creator.colour.v1',
    DEFAULT_COLOUR_ID,
    isString,
  );

  const [layoutId, setLayoutIdRaw] = useState<string>(DEFAULT_LAYOUT_ID);
  const [entityName, setEntityName] = useState('');
  const [entityType, setEntityType] = useState('');
  const [departmentName, setDepartmentName] = useState('');
  const [departmentOptionId, setDepartmentOptionId] = useState<string>(
    DEFAULT_DEPARTMENT_OPTION_ID,
  );
  const [customAdministrativeForm, setCustomAdministrativeForm] = useState('');
  const [surfaceId, setSurfaceId] = useState<string>(DEFAULT_SURFACE_ID);
  const [includeClearSpace, setIncludeClearSpace] = useState(false);
  const [showGuides, setShowGuides] = useState(false);

  // Both ids are persisted, so a stale value from an older build must resolve
  // to something real rather than leaving the picker empty.
  const category = requireCategory(categoryRaw);
  const approach = (() => {
    const found = requireApproach(approachId);
    return found.category === category.id ? found : requireApproach(firstApproachOf(category.id));
  })();

  // A language switched off in the Language Lab must not leave the creator
  // stuck on a language it can no longer offer.
  const resolvedLanguageCode = availableLanguages.some((l) => l.code === languageCode)
    ? languageCode
    : DEFAULT_LANGUAGE_CODE;
  const language = requireLanguage(resolvedLanguageCode);

  const layout = requireLayout(layoutId);
  const departmentOption = requireDepartmentOption(departmentOptionId);
  const colourHex = getColour(colourId).hex;
  const surfaceHex = PREVIEW_SURFACES.find((s) => s.id === surfaceId)?.hex ?? null;

  // Some approaches need wording that only exists where it has been approved.
  // With a department named, it is the department option that decides whether
  // the administrative wording is needed at all — options 3 and 4 do without it.
  const needsAdministrativeForm =
    departmentName.trim() && approach.category === 'administrative'
      ? departmentOption.needsAdministrativeForm
      : (approach.needsAdministrativeForm ?? false);
  // The guidelines expect the examples not to translate directly, and ask that
  // the principle be carried across instead — so a language without approved
  // wording is prompted for its own, not refused.
  const needsCustomAdministrativeForm = needsAdministrativeForm && !language.administrativeForms;
  const unavailableReason =
    approach.needsShortForm && !language.denominationShort
      ? `No approved short form of the denomination name exists in ${language.englishName}.`
      : null;

  const spec = useMemo<LockupSpec>(() => {
    const g = grid(typeface.xHeight);
    const lines = wordmarkLines(language);

    // Wrap onto a second line only when one line will not do. The primary is
    // never allowed to shrink — its size is fixed by the grid — so this is a
    // wrap, not a fit. The budget follows the language's own widest authored
    // line, so a long-worded denomination gets a longer measure.
    const budget =
      lines.reduce((max, l) => Math.max(max, typeface.measureWidth(l, g.primarySize)), 0) *
      GRID.primaryRunOn;
    const wrap = (text: string): readonly string[] => {
      if (!text) return [];
      return typeface.measureWidth(text, g.primarySize) <= budget
        ? [text]
        : balanceLines(text, typeface, g.primarySize, 2);
    };

    const { primary, secondary, secondaryAtPrimarySize } = composeLockupText({
      approach,
      departmentOption,
      wordmarkLines: lines,
      denominationShort: language.denominationShort,
      administrativeForms: language.administrativeForms,
      customAdministrativeForm,
      entityName,
      entityType,
      departmentName,
      wrap,
    });

    return {
      layout: layoutId as LayoutId,
      primaryLines: primary,
      secondaryText: secondary,
      secondaryAtPrimarySize,
      descriptor: '',
      colour: colourHex,
      includeClearSpace,
      uppercaseSecondary: false,
      locale: language.code,
    };
  }, [
    typeface,
    layoutId,
    language,
    approach,
    entityName,
    entityType,
    departmentName,
    departmentOption,
    customAdministrativeForm,
    colourHex,
    includeClearSpace,
  ]);

  const lockup = useMemo(() => buildLockup(spec, typeface), [spec, typeface]);

  return {
    category: category.id,
    approachId: approach.id,
    languageCode: resolvedLanguageCode,
    layoutId: layoutId as LayoutId,
    entityName,
    entityType,
    departmentName,
    departmentOptionId: departmentOption.id,
    customAdministrativeForm,
    colourId,
    surfaceId,
    includeClearSpace,
    showGuides,
    language,
    approach,
    departmentOption,
    layout,
    colourHex,
    surfaceHex,
    spec,
    lockup,
    unavailableReason,
    approachInert: entityName.trim() === '',
    needsCustomAdministrativeForm,
    setCategory: (next) => {
      setCategoryRaw(next);
      if (requireApproach(approachId).category !== next) setApproachId(firstApproachOf(next));
    },
    categoryHelp: category.help,
    setApproachId: (id) => {
      setApproachId(id);
    },
    setLanguageCode,
    setLayoutId: (id) => {
      setLayoutIdRaw(id);
    },
    setEntityName,
    setEntityType,
    setDepartmentName,
    setDepartmentOptionId,
    setCustomAdministrativeForm,
    setColourId,
    setSurfaceId,
    setIncludeClearSpace,
    setShowGuides,
  };
}
