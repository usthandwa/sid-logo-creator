import { MINIMUM_PRINT_WIDTH_MM, MINIMUM_SCREEN_WIDTH_PX } from '@/brand/constructionRules';
import { wordmarkText, type LanguageDef } from '@/brand/languages';
import { PREVIEW_SURFACES } from '@/brand/palette';
import { TIER_GROUPS, tiersInGroup, type TierId } from '@/brand/tiers';
import { ColourPicker } from '@/components/ColourPicker';
import {
  ChoiceGroup,
  Fieldset,
  LateralGlyph,
  StackedGlyph,
  TextField,
  type Choice,
} from '@/components/controls';
import { LockupPreview } from '@/components/LockupPreview';
import { round } from '@/core/geometry';
import { requireLayout, type LayoutId } from '@/core/layouts';
import type { Typeface } from '@/core/types';
import { DownloadPanel } from './DownloadPanel';
import { useCreatorState } from './useCreatorState';

const LAYOUT_GLYPHS: Record<LayoutId, React.JSX.Element> = {
  lateral: <LateralGlyph />,
  stacked: <StackedGlyph />,
};

interface Props {
  readonly typeface: Typeface;
  readonly languages: readonly LanguageDef[];
}

export function CreatorPage({ typeface, languages }: Props): React.JSX.Element {
  const state = useCreatorState(typeface, languages);
  const tiers = tiersInGroup(state.group);

  const denomination = wordmarkText(state.language);
  const title = state.entityName.trim()
    ? `${state.entityName.trim()} — ${denomination}`
    : denomination;

  return (
    <div className="creator">
      <section className="card panel" aria-label="Logo options">
        <div
          id="walkthrough-entity-type"
          className="tabs"
          role="tablist"
          aria-label="Kind of entity"
        >
          {TIER_GROUPS.map((group) => (
            <button
              key={group.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={group.id === state.group}
              onClick={() => {
                state.setGroup(group.id);
              }}
            >
              {group.label}
            </button>
          ))}
        </div>

        {tiers.length > 1 ? (
          <Fieldset legend="Entity type" hint={state.tier.help}>
            <ChoiceGroup
              label="Entity type"
              value={state.tierId}
              choices={tiers.map((t): Choice<TierId> => ({ id: t.id, label: t.label }))}
              onChange={state.setTierId}
            />
          </Fieldset>
        ) : null}

        <Fieldset
          id="walkthrough-language"
          legend="Language"
          hint={
            state.language.approval.verified
              ? undefined
              : 'This wording is a draft awaiting approval. Do not publish artwork made with it.'
          }
        >
          <ChoiceGroup
            label="Language"
            value={state.languageCode}
            choices={languages.map((l) => ({ id: l.code, label: l.endonym }))}
            onChange={state.setLanguageCode}
          />
        </Fieldset>

        <Fieldset id="walkthrough-layout" legend="Layout" hint={state.layout.help}>
          <ChoiceGroup
            label="Layout"
            value={state.layoutId}
            choices={state.tier.layouts.map((id): Choice<LayoutId> => ({
              id,
              label: requireLayout(id).label,
              glyph: LAYOUT_GLYPHS[id],
            }))}
            onChange={state.setLayoutId}
          />
        </Fieldset>

        {state.layout.carriesEntityName ? (
          <>
            <div id="walkthrough-entity-name">
              <TextField
                id="entity-name"
                label="Entity name"
                value={state.entityName}
                placeholder={state.tier.namePlaceholder}
                hint="Type the official name. Leave it blank for the base logo with no entity name."
                onChange={state.setEntityName}
              />
            </div>
            {state.tier.allowsDescriptor ? (
              <TextField
                id="descriptor"
                label="Department or descriptor"
                value={state.descriptor}
                placeholder={state.tier.descriptorPlaceholder ?? ''}
                hint="Optional. Sets a smaller second line beneath the name."
                onChange={state.setDescriptor}
              />
            ) : null}
          </>
        ) : null}

        <Fieldset id="walkthrough-color" legend="Logo colour">
          <ColourPicker value={state.colourId} onChange={state.setColourId} />
        </Fieldset>

        <Fieldset
          id="walkthrough-background"
          legend="Preview background"
          hint="Changes the surface behind the preview only. It is never part of the downloaded file."
        >
          <ChoiceGroup
            label="Preview background"
            value={state.surfaceId}
            choices={PREVIEW_SURFACES.map((s) => ({ id: s.id, label: s.name }))}
            onChange={state.setSurfaceId}
          />
        </Fieldset>

        <Fieldset
          legend="Construction guides"
          hint="Shows the symbol box, the baselines the type is set on, and the clear-space boundary. Preview only — never part of the downloaded file."
        >
          <ChoiceGroup
            label="Construction guides"
            value={state.showGuides ? 'on' : 'off'}
            choices={[
              { id: 'off', label: 'Hide' },
              { id: 'on', label: 'Show' },
            ]}
            onChange={(value) => {
              state.setShowGuides(value === 'on');
            }}
          />
        </Fieldset>

        <Fieldset
          id="walkthrough-clear-space"
          legend="Clear space"
          hint={`Adds the required clear space — twice the height of the lowercase letters — inside the file, so the artwork cannot be crowded when it is placed.`}
        >
          <ChoiceGroup
            label="Clear space"
            value={state.includeClearSpace ? 'on' : 'off'}
            choices={[
              { id: 'off', label: 'Crop tight' },
              { id: 'on', label: 'Include clear space' },
            ]}
            onChange={(value) => {
              state.setIncludeClearSpace(value === 'on');
            }}
          />
        </Fieldset>
      </section>

      <section className="card stage creator__stage" aria-label="Preview and download">
        <p className="legend">Preview</p>
        <div
          className={`stage__surface${state.surfaceHex === null ? ' stage__surface--checker' : ''}`}
          style={state.surfaceHex ? { background: state.surfaceHex } : undefined}
        >
          <LockupPreview
            className="stage__artwork"
            lockup={state.lockup}
            colour={state.colourHex}
            title={title}
            showGuides={state.showGuides}
          />
        </div>

        <div className="stage__meta">
          <span>
            Proportions {round(state.lockup.viewBox.width / state.lockup.viewBox.height, 2)} : 1
          </span>
          <span>
            Never reproduce below {MINIMUM_PRINT_WIDTH_MM} mm wide in print, or{' '}
            {MINIMUM_SCREEN_WIDTH_PX} px on screen.
          </span>
        </div>

        {state.lockup.notes.map((note) => (
          <p key={note} className="notice">
            {note}
          </p>
        ))}

        {state.language.approval.verified ? null : (
          <p className="notice notice--warn">
            <strong>{state.language.englishName} is a draft.</strong> The wording has not been
            confirmed by a union communication director. Use it to review, not to publish.
          </p>
        )}

        <div id="walkthrough-download">
          <DownloadPanel
            lockup={state.lockup}
            colourHex={state.colourHex}
            colourId={state.colourId}
            entityName={state.entityName}
            languageCode={state.languageCode}
            layoutId={state.layoutId}
            title={title}
          />
        </div>
      </section>
    </div>
  );
}
