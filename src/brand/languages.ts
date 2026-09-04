/**
 * Language registry.
 *
 * ─── How this file works ────────────────────────────────────────────────────
 * Every language the tool can ever produce a lockup in is listed here exactly
 * once. `status` decides who sees it:
 *
 *   'active'  — offered to everyone in the main creator.
 *   'staged'  — held behind the Language Lab (see src/features/languageLab).
 *               Fully renderable and previewable, but not offered publicly
 *               until SID Communication has approved the wording.
 *
 * ─── Activating a language ──────────────────────────────────────────────────
 * 1. Open the Language Lab, preview the lockup, and check it against the
 *    union's own published usage.
 * 2. Get the wording confirmed in writing by the union communication director.
 * 3. Change `status` to 'active' and `approval.verified` to true in this file,
 *    recording who approved it and when.
 * 4. Open a pull request. That is the whole change — no artwork, no layout
 *    work, no build configuration.
 *
 * ─── Adding a language that is not listed ───────────────────────────────────
 * Append an entry. `wordmark` is the denomination name split into the lines it
 * should set on; keep it to two lines wherever the language allows, because
 * that is what the construction ratios are built around.
 *
 * IMPORTANT: the staged wordmarks below are working drafts prepared from
 * general usage, NOT approved denominational renderings. They are marked
 * `verified: false` for that reason and must not be published until a union
 * communication director has confirmed the wording.
 */

import type { TierId } from './tiers';

export type LanguageStatus = 'active' | 'staged';

export interface LanguageApproval {
  /** True only once a union communication director has confirmed the wording. */
  readonly verified: boolean;
  /** Name or office that confirmed it. */
  readonly approvedBy?: string;
  /** ISO date of confirmation. */
  readonly approvedOn?: string;
  readonly note?: string;
}

export interface LanguageDef {
  /** BCP-47 tag. Used in filenames, URLs and saved presets. */
  readonly code: string;
  /** The language's name in the language itself. */
  readonly endonym: string;
  /** The language's name in English, for administrative screens. */
  readonly englishName: string;
  readonly status: LanguageStatus;
  readonly direction: 'ltr' | 'rtl';
  /**
   * The denomination name, split into the lines it sets on.
   * The registered-trademark mark is added by the renderer, not typed here —
   * `registeredMarkAfter` says which word it follows.
   */
  readonly wordmark: readonly string[];
  /**
   * Word in `wordmark` that the ® follows. adventist.design requires the mark
   * after "Adventist" in English. Omit where the mark is not used.
   */
  readonly registeredMarkAfter?: string;
  /** Entity-type words, used for the descriptor line under an entity name. */
  readonly tierLabels?: Partial<Record<TierId, string>>;
  /** ISO 3166-1 alpha-2 codes of SID territories where the language is used. */
  readonly territories: readonly string[];
  readonly approval: LanguageApproval;
}

/* ────────────────────────────────────────────────────────────────────────────
 * Active languages
 *
 * The four working languages carried over from the reference implementation.
 * English, Portuguese and French are SID's administrative languages; Spanish
 * is retained for cross-division and General Conference material.
 * ──────────────────────────────────────────────────────────────────────────── */

const ACTIVE: readonly LanguageDef[] = [
  {
    code: 'en',
    endonym: 'English',
    englishName: 'English',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Seventh-day', 'Adventist Church'],
    registeredMarkAfter: 'Adventist',
    tierLabels: {
      church: 'Church',
      company: 'Company',
      conference: 'Conference',
      field: 'Field',
      mission: 'Mission',
      union: 'Union',
      division: 'Division',
      institution: 'Institution',
      department: 'Department',
      ministry: 'Ministry',
      media: 'Media',
    },
    territories: ['BW', 'LS', 'MW', 'MU', 'NA', 'SC', 'ZA', 'SZ', 'ZM', 'ZW', 'SH'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
      note: 'The ® is required after “Adventist” in English.',
    },
  },
  {
    code: 'pt',
    endonym: 'Português',
    englishName: 'Portuguese',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Igreja Adventista', 'do Sétimo Dia'],
    tierLabels: {
      church: 'Igreja',
      company: 'Congregação',
      conference: 'Associação',
      field: 'Campo',
      mission: 'Missão',
      union: 'União',
      division: 'Divisão',
      institution: 'Instituição',
      department: 'Departamento',
      ministry: 'Ministério',
      media: 'Comunicação',
    },
    territories: ['AO', 'MZ', 'ST'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
    },
  },
  {
    code: 'fr',
    endonym: 'Français',
    englishName: 'French',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Église Adventiste', 'du Septième Jour'],
    tierLabels: {
      church: 'Église',
      company: 'Groupe',
      conference: 'Fédération',
      field: 'Champ',
      mission: 'Mission',
      union: 'Union',
      division: 'Division',
      institution: 'Institution',
      department: 'Département',
      ministry: 'Ministère',
      media: 'Communication',
    },
    territories: ['MG', 'MU', 'RE', 'YT', 'KM', 'SC'],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
    },
  },
  {
    code: 'es',
    endonym: 'Español',
    englishName: 'Spanish',
    status: 'active',
    direction: 'ltr',
    wordmark: ['Iglesia Adventista', 'del Séptimo Día'],
    tierLabels: {
      church: 'Iglesia',
      company: 'Grupo',
      conference: 'Asociación',
      field: 'Campo',
      mission: 'Misión',
      union: 'Unión',
      division: 'División',
      institution: 'Institución',
      department: 'Departamento',
      ministry: 'Ministerio',
      media: 'Comunicación',
    },
    territories: [],
    approval: {
      verified: true,
      approvedBy: 'General Conference identity guidelines',
      approvedOn: '2017-04-01',
      note: 'Retained for General Conference and inter-division material.',
    },
  },
];

/* ────────────────────────────────────────────────────────────────────────────
 * Staged languages — every other language of the SID territory
 *
 * Grouped by union so a communication director can verify their own set.
 * All are `verified: false` until confirmed. Do not activate without approval.
 * ──────────────────────────────────────────────────────────────────────────── */

const DRAFT: LanguageApproval = {
  verified: false,
  note: 'Working draft. Requires confirmation by the union communication director before activation.',
};

function staged(
  code: string,
  endonym: string,
  englishName: string,
  wordmark: readonly string[],
  territories: readonly string[],
  tierLabels?: Partial<Record<TierId, string>>,
): LanguageDef {
  return {
    code,
    endonym,
    englishName,
    status: 'staged',
    direction: 'ltr',
    wordmark,
    territories,
    approval: DRAFT,
    ...(tierLabels ? { tierLabels } : {}),
  };
}

const STAGED: readonly LanguageDef[] = [
  // ── South Africa Union Conference ────────────────────────────────────────
  staged('af', 'Afrikaans', 'Afrikaans', ['Sewendedag-', 'Adventistekerk'], ['ZA', 'NA'], {
    church: 'Kerk',
    conference: 'Konferensie',
    union: 'Unie',
  }),
  staged('zu', 'isiZulu', 'Zulu', ['Isonto lamaSeventh-day', 'Adventist'], ['ZA', 'SZ'], {
    church: 'Isonto',
  }),
  staged('xh', 'isiXhosa', 'Xhosa', ['ICawe yamaSeventh-day', 'Adventist'], ['ZA'], {
    church: 'ICawe',
  }),
  staged(
    'nso',
    'Sepedi',
    'Northern Sotho',
    ['Kereke ya Baadventiste', 'ba Letšatši la Bošupa'],
    ['ZA'],
    {
      church: 'Kereke',
    },
  ),
  staged(
    'st',
    'Sesotho',
    'Southern Sotho',
    ['Kereke ya Baadventiste', 'ba Letsatsi la Bosupa'],
    ['ZA', 'LS'],
    {
      church: 'Kereke',
    },
  ),
  staged(
    'tn',
    'Setswana',
    'Tswana',
    ['Kereke ya Baadventiste', 'ba Letsatsi la Bosupa'],
    ['ZA', 'BW'],
    {
      church: 'Kereke',
    },
  ),
  staged(
    'ts',
    'Xitsonga',
    'Tsonga',
    ['Kereke ya Vaadventista', 'va Siku ra Vunkombo'],
    ['ZA', 'MZ'],
    {
      church: 'Kereke',
    },
  ),
  staged('ve', 'Tshivenḓa', 'Venda', ['Kereke ya Vhaadventista', 'vha Ḓuvha ḽa Vhusumbe'], ['ZA'], {
    church: 'Kereke',
  }),
  staged('ss', 'siSwati', 'Swati', ['LiBandla lemaSeventh-day', 'Adventist'], ['SZ', 'ZA'], {
    church: 'LiBandla',
  }),
  staged('nr', 'isiNdebele', 'Southern Ndebele', ['IBandla lamaSeventh-day', 'Adventist'], ['ZA'], {
    church: 'IBandla',
  }),

  // ── Zimbabwe (Central, East and West Union Conferences) ──────────────────
  staged('sn', 'chiShona', 'Shona', ['Chechi yeVaAdventista', 'veZuva reChinomwe'], ['ZW'], {
    church: 'Chechi',
    conference: 'Danho',
  }),
  staged('nd', 'isiNdebele', 'Northern Ndebele', ['IBandla lamaSeventh-day', 'Adventist'], ['ZW'], {
    church: 'IBandla',
  }),
  staged('ndc', 'chiNdau', 'Ndau', ['Chechi yeVaAdventista', 'veZuva reChinomwe'], ['ZW', 'MZ']),

  // ── Malawi Union Conference ──────────────────────────────────────────────
  staged(
    'ny',
    'Chichewa',
    'Chichewa / Nyanja',
    ['Mpingo wa Adventist wa', 'Tsiku Lachisanu ndi Chiwiri'],
    ['MW', 'ZM', 'MZ'],
    {
      church: 'Mpingo',
    },
  ),
  staged(
    'tum',
    'chiTumbuka',
    'Tumbuka',
    ['Mpingo wa Adventist wa', 'Zuŵa Lachinkhondi na Chiŵiri'],
    ['MW', 'ZM'],
  ),
  staged(
    'yao',
    'Chiyao',
    'Yao',
    ['Mpingo wa Adventist wa', 'Lisiku Lyacisano ni Liŵili'],
    ['MW', 'MZ'],
  ),

  // ── Northern and Southern Zambia Union Conferences ───────────────────────
  staged(
    'bem',
    'Ichibemba',
    'Bemba',
    ['Icalici ca BaAdventist', 'aba Bushiku bwa Cinelubali'],
    ['ZM'],
    {
      church: 'Icalici',
    },
  ),
  staged(
    'toi',
    'Chitonga',
    'Tonga (Zambia)',
    ['Mbungano ya BaAdventist', 'ba Buzuba bwa Chilombwe'],
    ['ZM', 'ZW'],
  ),
  staged('loz', 'Silozi', 'Lozi', ['Keleke ya Ma-Adventist', 'a Lizazi la Bu 7'], ['ZM']),
  staged(
    'lue',
    'Chiluvale',
    'Luvale',
    ['Chachi ya VaAdventist', 'ya Likumbi lya Chitanu na Chivali'],
    ['ZM'],
  ),
  staged(
    'kqn',
    'Kikaonde',
    'Kaonde',
    ['Kipwilo kya BaAdventist', 'ba Juba ja Butanu na Bubiji'],
    ['ZM'],
  ),
  staged('lun', 'Chilunda', 'Lunda', ['Chechi yawaAdventist', 'ya Ifuku daMuchiyedi'], ['ZM']),

  // ── Mozambique Union Mission ─────────────────────────────────────────────
  staged('seh', 'Sena', 'Sena', ['Mpingo wa Adventista', 'wa Ntsiku Yacinomwe'], ['MZ']),
  staged(
    'vmw',
    'Emakhuwa',
    'Makhuwa',
    ['Ekerexa ya Adventista', 'ya Nihiku Natthanu na Nnli'],
    ['MZ'],
  ),
  staged('ngl', 'Elomwe', 'Lomwe', ['Ekerexa ya Adventista', 'ya Nihiku Na Sabadu'], ['MZ', 'MW']),
  staged(
    'tso',
    'Xichangana',
    'Changana',
    ['Kereke ya Vaadventista', 'va Siku ra Vunkombo'],
    ['MZ'],
  ),

  // ── North-Eastern and South-Western Angola Union Missions ────────────────
  staged('umb', 'Umbundu', 'Umbundu', ['Ongeleja Yavaadventista', 'Yeteke Liepandu'], ['AO']),
  staged(
    'kmb',
    'Kimbundu',
    'Kimbundu',
    ['Ngeleja ya Adventista', 'ya Kizuwa kya Sambwadi'],
    ['AO'],
  ),
  staged(
    'kg',
    'Kikongo',
    'Kikongo',
    ['Dibundu dya Adventista', 'dya Lumbu kya Nsambwadi'],
    ['AO', 'ST'],
  ),
  staged('cjk', 'Chokwe', 'Chokwe', ['Chachi ya Adventista', 'ya Tangwa lya Sambwadi'], ['AO']),

  // ── Botswana Union Conference ────────────────────────────────────────────
  staged('kck', 'Ikalanga', 'Kalanga', ['Cece yeBaAdventista', 'yeZuba reCinomwe'], ['BW', 'ZW']),

  // ── Indian Ocean Union Conference ────────────────────────────────────────
  staged(
    'mg',
    'Malagasy',
    'Malagasy',
    ['Fiangonana Advantista', 'Mitandrina ny Andro Fahafito'],
    ['MG'],
    {
      church: 'Fiangonana',
    },
  ),
  staged('mfe', 'Kreol Morisien', 'Mauritian Creole', ['Legliz Adventis', 'Setiem Zour'], ['MU']),
  staged('crs', 'Kreol Seselwa', 'Seychellois Creole', ['Legliz Adventis', 'Setyenm Zour'], ['SC']),
  staged('rcf', 'Kréol Rénioné', 'Réunion Creole', ['Légliz Advantis', 'Sétyèm Zour'], ['RE']),
  staged(
    'zdj',
    'Shikomori',
    'Comorian',
    ['Ngariya ya Waadventista', 'wa Mfumo wa Saba'],
    ['KM', 'YT'],
  ),
  staged('sw', 'Kiswahili', 'Swahili', ['Kanisa la Waadventista', 'Wasabato'], ['KM', 'YT'], {
    church: 'Kanisa',
  }),

  // ── Namibia (South Africa Union Conference territory) ────────────────────
  staged('ng', 'Oshiwambo', 'Oshiwambo', ['Ongeleka yOvaadventist', 'vEfiku etiheyali'], ['NA']),
  staged(
    'hz',
    'Otjiherero',
    'Herero',
    ['Ongeleka yOvaadventiste', 'vOeyuva oritjahambombari'],
    ['NA'],
  ),
];

export const LANGUAGES: readonly LanguageDef[] = [...ACTIVE, ...STAGED];

const languageIndex = new Map(LANGUAGES.map((l) => [l.code, l]));

export const ACTIVE_LANGUAGES = LANGUAGES.filter((l) => l.status === 'active');
export const STAGED_LANGUAGES = LANGUAGES.filter((l) => l.status === 'staged');

export const DEFAULT_LANGUAGE_CODE = 'en';

export function getLanguage(code: string): LanguageDef | undefined {
  return languageIndex.get(code);
}

export function requireLanguage(code: string): LanguageDef {
  const found = languageIndex.get(code);
  if (found) return found;
  const fallback = languageIndex.get(DEFAULT_LANGUAGE_CODE);
  /* c8 ignore next */
  if (!fallback) throw new Error('Language registry is missing its default language.');
  return fallback;
}

/**
 * The denomination name on one line, for headings, filenames and alt text.
 * A line ending in a hyphen is a word broken across the two lines, so it joins
 * without a space: "Sewendedag-" + "Adventistekerk".
 */
export function wordmarkText(language: LanguageDef): string {
  return language.wordmark.reduce(
    (text, line, index) =>
      index === 0 ? line : text.endsWith('-') ? text + line : `${text} ${line}`,
    '',
  );
}

/**
 * The wordmark lines with the registered-trademark mark inserted.
 * Kept separate from the registry so the raw wording stays easy to review.
 */
export function wordmarkLines(language: LanguageDef): readonly string[] {
  const mark = language.registeredMarkAfter;
  if (!mark) return language.wordmark;
  return language.wordmark.map((line) =>
    line.includes(mark) ? line.replace(mark, `${mark}®`) : line,
  );
}
