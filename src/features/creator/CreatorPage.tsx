import { MINIMUM_PRINT_WIDTH_MM, MINIMUM_SCREEN_WIDTH_PX } from '@/brand/constructionRules';
import {
  ACCEPTABILITY_LABEL,
  ACCEPTABILITY_MARK,
  approachesIn,
  CATEGORIES,
  DEPARTMENT_OPTIONS,
  type ApproachId,
  type DepartmentOptionId,
} from '@/brand/entityIdentifiers';
import { wordmarkText, type LanguageDef } from '@/brand/languages';
import { PREVIEW_SURFACES } from '@/brand/palette';
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
import { LAYOUTS, type LayoutId } from '@/core/layouts';
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
  const approaches = approachesIn(state.category);

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
          {CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              role="tab"
              className="tab"
              aria-selected={category.id === state.category}
              onClick={() => {
                state.setCategory(category.id);
              }}
            >
              {category.label}
            </button>
          ))}
        </div>

        <p className="hint">{state.categoryHelp}</p>

        <Fieldset
          legend="Naming approach"
          hint={
            state.approachInert
              ? 'Type an entity name below to use these. Without a name there is nothing to compose against the denomination, so every approach gives the same logo.'
              : `${ACCEPTABILITY_LABEL[state.approach.acceptability]} — ${state.approach.help}`
          }
        >
          <ChoiceGroup
            label="Naming approach"
            value={state.approachId}
            choices={approaches.map(
              (a): Choice<ApproachId> => ({
                id: a.id,
                label: `${ACCEPTABILITY_MARK[a.acceptability]}  ${a.label}`,
              }),
            )}
            onChange={state.setApproachId}
          />
        </Fieldset>

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

        <Fieldset id="walkthrough-layout" legend="Version" hint={state.layout.help}>
          <ChoiceGroup
            label="Version"
            value={state.layoutId}
            choices={LAYOUTS.map(
              (l): Choice<LayoutId> => ({
                id: l.id,
                label: l.label,
                glyph: LAYOUT_GLYPHS[l.id],
              }),
            )}
            onChange={state.setLayoutId}
          />
        </Fieldset>

        <div id="walkthrough-entity-name">
          <TextField
            id="entity-name"
            label="Entity name"
            value={state.entityName}
            placeholder="e.g. Rosettenville"
            hint="Type the official name. Leave it blank for the denomination logo with no entity name."
            onChange={state.setEntityName}
          />
        </div>

        {state.category === 'administrative' ? (
          <>
            <TextField
              id="department-name"
              label="Department name"
              value={state.departmentName}
              placeholder="e.g. Family Ministries"
              hint="Optional. Names a department within the entity above."
              onChange={state.setDepartmentName}
            />
            {state.departmentName.trim() ? (
              <Fieldset
                legend="Department naming"
                hint={`${ACCEPTABILITY_LABEL[state.departmentOption.acceptability]} — ${state.departmentOption.help}`}
              >
                <ChoiceGroup
                  label="Department naming"
                  value={state.departmentOptionId}
                  choices={DEPARTMENT_OPTIONS.map(
                    (d): Choice<DepartmentOptionId> => ({
                      id: d.id,
                      label: `${ACCEPTABILITY_MARK[d.acceptability]}  ${d.label}`,
                    }),
                  )}
                  onChange={state.setDepartmentOptionId}
                />
              </Fieldset>
            ) : null}
            {state.needsCustomAdministrativeForm ? (
              <TextField
                id="administrative-form"
                label={`Linking line in ${state.language.endonym}`}
                value={state.customAdministrativeForm}
                placeholder="e.g. da Igreja Adventista do Sétimo Dia"
                hint="The English wording does not translate directly. Carry the principle instead: name the entity first, then say how it is part of the church — so the church reads as supported by its entities, not composed of them."
                onChange={state.setCustomAdministrativeForm}
              />
            ) : null}
          </>
        ) : null}

        {state.approach.needsShortForm ? (
          <TextField
            id="entity-type"
            label="Entity type"
            value={state.entityType}
            placeholder="e.g. Academy"
            hint="Completes the name, as in “Lincoln Adventist Academy”."
            onChange={state.setEntityType}
          />
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

        {state.unavailableReason && !state.approachInert ? (
          <p className="notice notice--warn">
            <strong>This approach is not available in {state.language.endonym}.</strong>{' '}
            {state.unavailableReason} The denomination logo is shown instead.
          </p>
        ) : null}

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
