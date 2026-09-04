import { COLOUR_GROUPS, LOGO_COLOURS, type LogoColour } from '@/brand/palette';
import { CheckGlyph } from './controls';

interface Props {
  readonly value: string;
  readonly onChange: (id: string) => void;
}

/** Relative luminance, for deciding whether a tick reads on a swatch. */
function isLight(hex: string): boolean {
  const value = hex.replace('#', '');
  const full =
    value.length === 3
      ? value
          .split('')
          .map((c) => c + c)
          .join('')
      : value;
  const channels = [0, 2, 4].map((i) => Number.parseInt(full.slice(i, i + 2), 16) / 255);
  const linear = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const [r = 0, g = 0, b = 0] = linear;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b > 0.45;
}

export function ColourPicker({ value, onChange }: Props): React.JSX.Element {
  return (
    <div className="stack">
      {COLOUR_GROUPS.map((group) => {
        const colours = LOGO_COLOURS.filter((c) => c.group === group.id);
        if (colours.length === 0) return null;
        return (
          <div key={group.id} className="stack">
            <p className="hint">{group.label}</p>
            <div className="swatches" role="group" aria-label={`${group.label} colours`}>
              {colours.map((colour) => (
                <Swatch
                  key={colour.id}
                  colour={colour}
                  selected={colour.id === value}
                  onSelect={onChange}
                />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface SwatchProps {
  readonly colour: LogoColour;
  readonly selected: boolean;
  readonly onSelect: (id: string) => void;
}

function Swatch({ colour, selected, onSelect }: SwatchProps): React.JSX.Element {
  const label = colour.pantone ? `${colour.name} — Pantone ${colour.pantone}` : colour.name;
  return (
    <button
      type="button"
      className="swatch"
      style={{
        background: colour.hex,
        ['--check-colour' as string]: isLight(colour.hex) ? '#12100b' : '#ffffff',
      }}
      aria-pressed={selected}
      title={label}
      onClick={() => {
        onSelect(colour.id);
      }}
    >
      <span className="visually-hidden">{label}</span>
      {selected ? (
        <span className="swatch__check" aria-hidden="true">
          <CheckGlyph />
        </span>
      ) : null}
    </button>
  );
}
