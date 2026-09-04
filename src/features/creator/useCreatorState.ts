import { useMemo, useState } from 'react';
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
import {
  DEFAULT_TIER_ID,
  requireTier,
  tiersInGroup,
  type TierGroupId,
  type TierId,
} from '@/brand/tiers';
import { buildLockup } from '@/core/buildLockup';
import { DEFAULT_LAYOUT_ID, requireLayout, type LayoutId } from '@/core/layouts';
import type { Lockup, LockupSpec, Typeface } from '@/core/types';
import { isString, usePersistentState } from '@/hooks/usePersistentState';

export interface CreatorState {
  readonly group: TierGroupId;
  readonly tierId: TierId;
  readonly languageCode: string;
  readonly layoutId: LayoutId;
  readonly entityName: string;
  readonly descriptor: string;
  readonly colourId: string;
  readonly surfaceId: string;
  readonly includeClearSpace: boolean;
}

export interface CreatorApi extends CreatorState {
  readonly language: LanguageDef;
  readonly tier: ReturnType<typeof requireTier>;
  readonly layout: ReturnType<typeof requireLayout>;
  readonly colourHex: string;
  readonly surfaceHex: string | null;
  readonly spec: LockupSpec;
  readonly lockup: Lockup;
  readonly setGroup: (group: TierGroupId) => void;
  readonly setTierId: (id: TierId) => void;
  readonly setLanguageCode: (code: string) => void;
  readonly setLayoutId: (id: LayoutId) => void;
  readonly setEntityName: (name: string) => void;
  readonly setDescriptor: (value: string) => void;
  readonly setColourId: (id: string) => void;
  readonly setSurfaceId: (id: string) => void;
  readonly setIncludeClearSpace: (value: boolean) => void;
}

function firstTierOf(group: TierGroupId): TierId {
  return tiersInGroup(group)[0]?.id ?? DEFAULT_TIER_ID;
}

export function useCreatorState(
  typeface: Typeface,
  availableLanguages: readonly LanguageDef[],
): CreatorApi {
  const [group, setGroupRaw] = usePersistentState<string>(
    'sid-logo-creator.group.v1',
    'congregations',
    isString,
  );
  const [tierId, setTierId] = usePersistentState<string>(
    'sid-logo-creator.tier.v1',
    DEFAULT_TIER_ID,
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
  const [descriptor, setDescriptor] = useState('');
  const [surfaceId, setSurfaceId] = useState<string>(DEFAULT_SURFACE_ID);
  const [includeClearSpace, setIncludeClearSpace] = useState(false);

  const tier = requireTier(tierId);

  // A language switched off in the Language Lab must not leave the creator
  // stuck on a language it can no longer offer.
  const resolvedLanguageCode = availableLanguages.some((l) => l.code === languageCode)
    ? languageCode
    : DEFAULT_LANGUAGE_CODE;
  const language = requireLanguage(resolvedLanguageCode);

  // Likewise a layout that the current tier does not offer.
  const resolvedLayoutId = (
    tier.layouts.includes(layoutId as LayoutId) ? layoutId : (tier.layouts[0] ?? DEFAULT_LAYOUT_ID)
  ) as LayoutId;
  const layout = requireLayout(resolvedLayoutId);

  const colourHex = getColour(colourId).hex;
  const surfaceHex = PREVIEW_SURFACES.find((s) => s.id === surfaceId)?.hex ?? null;

  const spec = useMemo<LockupSpec>(
    () => ({
      layout: resolvedLayoutId,
      wordmarkLines: wordmarkLines(language),
      entityName: layout.carriesEntityName ? entityName : '',
      descriptor: layout.carriesEntityName && tier.allowsDescriptor ? descriptor : '',
      colour: colourHex,
      includeClearSpace,
      uppercaseEntityName: true,
      locale: language.code,
    }),
    [
      resolvedLayoutId,
      language,
      layout.carriesEntityName,
      entityName,
      tier.allowsDescriptor,
      descriptor,
      colourHex,
      includeClearSpace,
    ],
  );

  const lockup = useMemo(() => buildLockup(spec, typeface), [spec, typeface]);

  return {
    group: group as TierGroupId,
    tierId: tier.id,
    languageCode: resolvedLanguageCode,
    layoutId: resolvedLayoutId,
    entityName,
    descriptor,
    colourId,
    surfaceId,
    includeClearSpace,
    language,
    tier,
    layout,
    colourHex,
    surfaceHex,
    spec,
    lockup,
    setGroup: (next) => {
      setGroupRaw(next);
      if (requireTier(tierId).group !== next) setTierId(firstTierOf(next));
    },
    setTierId: (id) => {
      setTierId(id);
    },
    setLanguageCode,
    setLayoutId: (id) => {
      setLayoutIdRaw(id);
    },
    setEntityName,
    setDescriptor,
    setColourId,
    setSurfaceId,
    setIncludeClearSpace,
  };
}
