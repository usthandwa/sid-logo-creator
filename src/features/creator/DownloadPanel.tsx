import { useCallback, useState } from 'react';
import { PNG_WIDTH_PRESETS, toPngBlob } from '@/core/exportPng';
import { toSvgString } from '@/core/exportSvg';
import { buildFilename } from '@/core/filename';
import type { Lockup } from '@/core/types';

interface Props {
  readonly lockup: Lockup;
  readonly colourHex: string;
  readonly colourId: string;
  readonly entityName: string;
  readonly languageCode: string;
  readonly layoutId: string;
  readonly title: string;
}

type Status =
  | { readonly kind: 'idle' }
  | { readonly kind: 'busy' }
  | { readonly kind: 'error'; readonly message: string };

export function DownloadPanel({
  lockup,
  colourHex,
  colourId,
  entityName,
  languageCode,
  layoutId,
  title,
}: Props): React.JSX.Element {
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const downloadSvg = useCallback(() => {
    const svg = toSvgString(lockup, { colour: colourHex, title });
    saveBlob(
      new Blob([svg], { type: 'image/svg+xml;charset=utf-8' }),
      buildFilename({ entityName, languageCode, layoutId, colourId, extension: 'svg' }),
    );
  }, [lockup, colourHex, title, entityName, languageCode, layoutId, colourId]);

  const downloadPng = useCallback(
    async (width: number) => {
      setStatus({ kind: 'busy' });
      try {
        const blob = await toPngBlob(lockup, { colour: colourHex, title, width });
        saveBlob(
          blob,
          buildFilename({
            entityName,
            languageCode,
            layoutId,
            colourId,
            extension: 'png',
            widthPx: width,
          }),
        );
        setStatus({ kind: 'idle' });
      } catch (error: unknown) {
        setStatus({
          kind: 'error',
          message: error instanceof Error ? error.message : 'The PNG could not be created.',
        });
      }
    },
    [lockup, colourHex, title, entityName, languageCode, layoutId, colourId],
  );

  return (
    <div className="stack">
      <p className="legend">Download</p>
      <button type="button" className="button" onClick={downloadSvg}>
        SVG — vector, for print and design
      </button>
      <div className="downloads">
        {PNG_WIDTH_PRESETS.map((preset) => (
          <button
            key={preset.id}
            type="button"
            className="button button--secondary"
            disabled={status.kind === 'busy'}
            title={preset.help}
            onClick={() => {
              void downloadPng(preset.width);
            }}
          >
            PNG · {preset.width.toLocaleString('en')} px
          </button>
        ))}
      </div>
      <p className="hint">
        PNG files have a transparent background. The SVG carries the type as outlines, so it opens
        correctly on a computer that does not have Advent Sans installed.
      </p>
      <p role="status" aria-live="polite" className="visually-hidden">
        {status.kind === 'busy' ? 'Preparing your download.' : ''}
      </p>
      {status.kind === 'error' ? (
        <p className="notice notice--warn" role="alert">
          {status.message}
        </p>
      ) : null}
    </div>
  );
}

function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  // Revoking immediately can cancel the download in some browsers.
  window.setTimeout(() => {
    URL.revokeObjectURL(url);
  }, 10_000);
}
