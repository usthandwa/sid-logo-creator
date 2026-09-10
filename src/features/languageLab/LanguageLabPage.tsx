import { useMemo, useState } from 'react';
import {
  ACTIVE_LANGUAGES,
  STAGED_LANGUAGES,
  wordmarkLines,
  wordmarkText,
  type LanguageDef,
} from '@/brand/languages';
import { territoryName, UNIONS, unionsForTerritories } from '@/brand/territories';
import { LockupPreview } from '@/components/LockupPreview';
import { buildLockup } from '@/core/buildLockup';
import type { Typeface } from '@/core/types';
import type { Activations } from '@/hooks/useActivations';
import { LabGate } from './LabGate';

interface Props {
  readonly typeface: Typeface;
  readonly activations: Activations;
}

/** The literal "all", or a union id from the territory registry. */
type Filter = string;

export function LanguageLabPage({ typeface, activations }: Props): React.JSX.Element {
  const [unlocked, setUnlocked] = useState(false);
  const [filter, setFilter] = useState<Filter>('all');

  if (!unlocked) {
    return (
      <LabGate
        onUnlock={() => {
          setUnlocked(true);
        }}
      />
    );
  }

  const staged =
    filter === 'all'
      ? STAGED_LANGUAGES
      : STAGED_LANGUAGES.filter((l) =>
          unionsForTerritories(l.territories).some((u) => u.id === filter),
        );

  return (
    <div className="lab">
      <section className="card panel">
        <div className="stack">
          <h2 style={{ fontSize: 'var(--step-2)' }}>Language Lab</h2>
          <p>
            Every language of the SID territory is already built into this tool. The{' '}
            {ACTIVE_LANGUAGES.length} approved languages are offered to everyone. The{' '}
            {STAGED_LANGUAGES.length} below are staged: fully rendered and ready, but held back
            until a union communication director confirms the wording.
          </p>
          <p className="notice notice--warn">
            The staged wordmarks are working drafts prepared from general usage. They are{' '}
            <strong>not</strong> approved denominational renderings. Switching one on here affects
            this browser only — nothing is published to other users.
          </p>
        </div>

        <div className="stack">
          <p className="legend">Filter by union</p>
          <div className="row">
            <FilterChip
              label="All unions"
              active={filter === 'all'}
              onClick={() => {
                setFilter('all');
              }}
            />
            {UNIONS.map((union) => (
              <FilterChip
                key={union.id}
                label={union.name}
                active={filter === union.id}
                onClick={() => {
                  setFilter(union.id);
                }}
              />
            ))}
          </div>
        </div>

        {activations.trialCodes.size > 0 ? (
          <div className="stack">
            <p className="notice">
              {activations.trialCodes.size} staged{' '}
              {activations.trialCodes.size === 1 ? 'language is' : 'languages are'} switched on in
              this browser and appear in the creator.
            </p>
            <div className="row">
              <button
                type="button"
                className="button button--secondary"
                onClick={activations.reset}
              >
                Switch all trials off
              </button>
            </div>
          </div>
        ) : null}
      </section>

      <div className="lab__grid">
        {staged.map((language) => (
          <LanguageCard
            key={language.code}
            language={language}
            typeface={typeface}
            enabled={activations.trialCodes.has(language.code)}
            onToggle={() => {
              activations.toggle(language.code);
            }}
          />
        ))}
      </div>

      <ActivationGuide codes={activations.trialCodes} />
    </div>
  );
}

function FilterChip({
  label,
  active,
  onClick,
}: {
  readonly label: string;
  readonly active: boolean;
  readonly onClick: () => void;
}): React.JSX.Element {
  return (
    <button
      type="button"
      className={active ? 'button' : 'button button--secondary'}
      style={{ fontSize: 'var(--step--1)', padding: 'var(--space-2) var(--space-3)' }}
      aria-pressed={active}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

interface CardProps {
  readonly language: LanguageDef;
  readonly typeface: Typeface;
  readonly enabled: boolean;
  readonly onToggle: () => void;
}

function LanguageCard({ language, typeface, enabled, onToggle }: CardProps): React.JSX.Element {
  const lockup = useMemo(
    () =>
      buildLockup(
        {
          layout: 'lateral',
          primaryLines: wordmarkLines(language),
          secondaryText: '',
          descriptor: '',
          colour: 'currentColor',
          includeClearSpace: false,
          uppercaseSecondary: true,
          locale: language.code,
        },
        typeface,
      ),
    [language, typeface],
  );

  const unions = unionsForTerritories(language.territories);

  return (
    <article className="card lab__card">
      <div className="row" style={{ justifyContent: 'space-between' }}>
        <div>
          <h3 style={{ fontSize: 'var(--step-1)' }}>{language.endonym}</h3>
          <p className="hint">
            {language.englishName} · {language.code}
          </p>
        </div>
        <span className={enabled ? 'tag tag--live' : 'tag tag--draft'}>
          {enabled ? 'On in this browser' : 'Staged'}
        </span>
      </div>

      <div className="lab__preview" style={{ color: 'var(--ink-strong)' }}>
        <LockupPreview
          lockup={lockup}
          colour="currentColor"
          title={`${language.englishName} wordmark`}
        />
      </div>

      <dl className="stack" style={{ margin: 0, fontSize: 'var(--step--1)' }}>
        <div>
          <dt className="hint">Wordmark</dt>
          <dd style={{ margin: 0 }}>{wordmarkText(language)}</dd>
        </div>
        <div>
          <dt className="hint">Territory</dt>
          <dd style={{ margin: 0 }}>
            {language.territories.map(territoryName).join(', ') || 'Not recorded'}
          </dd>
        </div>
        <div>
          <dt className="hint">Approval needed from</dt>
          <dd style={{ margin: 0 }}>
            {unions.map((u) => u.name).join(', ') || 'SID Communication'}
          </dd>
        </div>
      </dl>

      <button
        type="button"
        className={enabled ? 'button button--secondary' : 'button'}
        aria-pressed={enabled}
        onClick={onToggle}
      >
        {enabled ? 'Switch off' : 'Try it in the creator'}
      </button>
    </article>
  );
}

function ActivationGuide({ codes }: { readonly codes: ReadonlySet<string> }): React.JSX.Element {
  const example = [...codes][0] ?? STAGED_LANGUAGES[0]?.code ?? 'af';
  return (
    <section className="card panel">
      <h3 style={{ fontSize: 'var(--step-1)' }}>Publishing a language to everyone</h3>
      <p>
        A trial activation lives in this browser. To offer a language to every church in the
        division, the wording has to be confirmed and then committed to the repository. It is a
        four-line change to one file.
      </p>
      <ol className="stack" style={{ paddingInlineStart: '1.2em', margin: 0 }}>
        <li>
          Preview the lockup above and check it against the union&rsquo;s own published usage.
        </li>
        <li>Get the wording confirmed in writing by the union communication director.</li>
        <li>
          Edit <code>src/brand/languages.ts</code> as below and open a pull request.
        </li>
        <li>Merge. The language appears for everyone on the next deploy.</li>
      </ol>
      <pre className="code">
        <code>{`// src/brand/languages.ts — the entry for "${example}"
status: 'staged',            →  status: 'active',
approval: DRAFT,             →  approval: {
                                  verified: true,
                                  approvedBy: 'Name, Union Communication Director',
                                  approvedOn: '${new Date().toISOString().slice(0, 10)}',
                                },`}</code>
      </pre>
      <p className="hint">
        No artwork, layout or build changes are needed. The lockup engine composes every language
        from the same symbol and the same construction ratios.
      </p>
    </section>
  );
}
