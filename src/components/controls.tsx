import type { ReactNode } from 'react';

interface FieldsetProps {
  readonly id?: string | undefined;
  readonly legend: string;
  readonly hint?: string | undefined;
  readonly children: ReactNode;
}

export function Fieldset({ id, legend, hint, children }: FieldsetProps): React.JSX.Element {
  return (
    <fieldset id={id} className="fieldset">
      <legend className="legend">{legend}</legend>
      {children}
      {hint ? <p className="hint">{hint}</p> : null}
    </fieldset>
  );
}

export interface Choice<T extends string> {
  readonly id: T;
  readonly label: string;
  readonly glyph?: ReactNode;
}

interface ChoiceGroupProps<T extends string> {
  readonly label: string;
  readonly choices: readonly Choice<T>[];
  readonly value: T;
  readonly onChange: (value: T) => void;
}

/**
 * A radio group built from buttons so it can carry glyphs, styled with
 * `aria-checked` rather than a hidden input. Arrow keys move between options,
 * which is what a radio group is expected to do.
 */
export function ChoiceGroup<T extends string>({
  label,
  choices,
  value,
  onChange,
}: ChoiceGroupProps<T>): React.JSX.Element {
  function onKeyDown(event: React.KeyboardEvent<HTMLDivElement>): void {
    const keys = ['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp'];
    if (!keys.includes(event.key)) return;
    event.preventDefault();
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1;
    const index = choices.findIndex((c) => c.id === value);
    const next = choices[(index + step + choices.length) % choices.length];
    if (next) onChange(next.id);
  }

  return (
    <div className="choices" role="radiogroup" aria-label={label} onKeyDown={onKeyDown}>
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          role="radio"
          aria-checked={choice.id === value}
          tabIndex={choice.id === value ? 0 : -1}
          className="choice"
          onClick={() => {
            onChange(choice.id);
          }}
        >
          {choice.glyph}
          {choice.label}
        </button>
      ))}
    </div>
  );
}

interface TextFieldProps {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly placeholder: string;
  readonly hint?: string | undefined;
  readonly maxLength?: number | undefined;
  readonly onChange: (value: string) => void;
}

export function TextField({
  id,
  label,
  value,
  placeholder,
  hint,
  maxLength = 90,
  onChange,
}: TextFieldProps): React.JSX.Element {
  const hintId = `${id}-hint`;
  return (
    <div className="field">
      <label className="legend" htmlFor={id}>
        {label}
      </label>
      <input
        id={id}
        className="input"
        type="text"
        value={value}
        placeholder={placeholder}
        maxLength={maxLength}
        autoComplete="off"
        spellCheck={false}
        aria-describedby={hint ? hintId : undefined}
        onChange={(event) => {
          onChange(event.target.value);
        }}
      />
      {hint ? (
        <p className="hint" id={hintId}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

export function CheckGlyph(): React.JSX.Element {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
      <path
        d="M3.5 8.5 6.5 11.5 12.5 4.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function LateralGlyph(): React.JSX.Element {
  return (
    <svg className="choice__glyph" width="34" height="18" viewBox="0 0 34 18" aria-hidden="true">
      <rect x="0" y="2" width="12" height="14" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="16" y="4" width="18" height="3" rx="1.5" fill="currentColor" />
      <rect x="16" y="9.5" width="14" height="3" rx="1.5" fill="currentColor" opacity="0.6" />
    </svg>
  );
}

export function StackedGlyph(): React.JSX.Element {
  return (
    <svg className="choice__glyph" width="34" height="18" viewBox="0 0 34 18" aria-hidden="true">
      <rect x="11" y="0" width="12" height="9" rx="1.5" fill="currentColor" opacity="0.85" />
      <rect x="6" y="11" width="22" height="3" rx="1.5" fill="currentColor" />
      <rect x="10" y="15.5" width="14" height="2.5" rx="1.25" fill="currentColor" opacity="0.6" />
    </svg>
  );
}
