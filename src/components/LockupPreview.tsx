import { round } from '@/core/geometry';
import type { Lockup } from '@/core/types';

interface Props {
  readonly lockup: Lockup;
  readonly colour: string;
  readonly title: string;
  readonly className?: string;
}

/**
 * Renders the engine's output directly. The preview and the download are
 * generated from the same geometry, so what is on screen is what arrives in
 * the file.
 */
export function LockupPreview({ lockup, colour, title, className }: Props): React.JSX.Element {
  const { x, y, width, height } = lockup.viewBox;
  return (
    <svg
      className={className}
      viewBox={`${String(round(x, 3))} ${String(round(y, 3))} ${String(round(width, 3))} ${String(
        round(height, 3),
      )}`}
      role="img"
      aria-label={title}
      preserveAspectRatio="xMidYMid meet"
    >
      <title>{title}</title>
      <g fill={colour} fillRule="nonzero">
        {lockup.paths.map((path, index) => (
          // Paths are positional geometry with no identity of their own; the
          // index is the only stable key and the list is regenerated wholesale.
          <path key={index} d={path.d} transform={path.transform} />
        ))}
      </g>
    </svg>
  );
}
