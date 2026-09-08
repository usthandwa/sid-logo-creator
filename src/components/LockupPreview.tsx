import { round, unionBoxes } from '@/core/geometry';
import type { Lockup } from '@/core/types';

interface Props {
  readonly lockup: Lockup;
  readonly colour: string;
  readonly title: string;
  readonly className?: string;
  /**
   * Draw the construction lines over the artwork. Preview only: guides are
   * never part of `lockup.paths`, which is all the exporters serialise.
   */
  readonly showGuides?: boolean;
}

/** Cyan, as the published construction diagrams use. Fixed in both themes. */
const GUIDE_COLOUR = '#12b5cb';

/**
 * Renders the engine's output directly. The preview and the download are
 * generated from the same geometry, so what is on screen is what arrives in
 * the file.
 */
export function LockupPreview({
  lockup,
  colour,
  title,
  className,
  showGuides = false,
}: Props): React.JSX.Element {
  const guides = showGuides ? lockup.guides : undefined;

  // Clear space sits outside a tightly cropped viewBox, so the preview widens
  // its own view to show it. The lockup's own geometry is untouched.
  const view = guides ? unionBoxes([lockup.viewBox, guides.clearSpace]) : lockup.viewBox;
  const { x, y, width, height } = view;

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
      {guides ? (
        <g
          fill="none"
          stroke={GUIDE_COLOUR}
          strokeWidth={1}
          vectorEffect="non-scaling-stroke"
          pointerEvents="none"
          aria-hidden="true"
        >
          <rect
            x={round(guides.clearSpace.x, 3)}
            y={round(guides.clearSpace.y, 3)}
            width={round(guides.clearSpace.width, 3)}
            height={round(guides.clearSpace.height, 3)}
            strokeDasharray="8 6"
          />
          <rect
            x={round(guides.symbol.x, 3)}
            y={round(guides.symbol.y, 3)}
            width={round(guides.symbol.width, 3)}
            height={round(guides.symbol.height, 3)}
          />
          {guides.wordmarkBaselines.map((baseline) => (
            <line
              key={`w${String(baseline)}`}
              x1={round(x, 3)}
              x2={round(x + width, 3)}
              y1={round(baseline, 3)}
              y2={round(baseline, 3)}
            />
          ))}
          {guides.identifierBaselines.map((baseline) => (
            <line
              key={`i${String(baseline)}`}
              x1={round(x, 3)}
              x2={round(x + width, 3)}
              y1={round(baseline, 3)}
              y2={round(baseline, 3)}
              strokeDasharray="4 4"
            />
          ))}
          <line
            x1={round(guides.wordmarkX, 3)}
            x2={round(guides.wordmarkX, 3)}
            y1={round(y, 3)}
            y2={round(y + height, 3)}
          />
          {guides.centreX === undefined ? null : (
            <line
              x1={round(guides.centreX, 3)}
              x2={round(guides.centreX, 3)}
              y1={round(y, 3)}
              y2={round(y + height, 3)}
              strokeDasharray="4 4"
            />
          )}
        </g>
      ) : null}
    </svg>
  );
}
