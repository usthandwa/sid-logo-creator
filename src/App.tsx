import { useState } from 'react';
import { CHURCH_SYMBOL } from '@/brand/symbol';
import { CreatorPage } from '@/features/creator/CreatorPage';
import { LanguageLabPage } from '@/features/languageLab/LanguageLabPage';
import { useActivations } from '@/hooks/useActivations';
import { useTypeface } from '@/hooks/useTypeface';
import { useWalkthrough } from '@/hooks/useWalkthrough';
import { InstallPrompt } from '@/components/InstallPrompt';
import { Walkthrough } from '@/components/Walkthrough';

type View = 'creator' | 'lab';

export function App(): React.JSX.Element {
  const [view, setView] = useState<View>('creator');
  const typefaceState = useTypeface();
  const activations = useActivations();
  const walkthrough = useWalkthrough();

  return (
    <div className="app">
      <header className="app__masthead">
        <div className="masthead">
          <div className="masthead__brand">
            <MastheadMark />
            <div>
              <span className="masthead__eyebrow">Southern Africa-Indian Ocean Division</span>
              <h1 className="masthead__title">Adventist Logo Creator</h1>
            </div>
          </div>
          <nav className="masthead__nav" aria-label="Sections">
            <button
              type="button"
              className={view === 'creator' ? 'button' : 'button button--ghost'}
              aria-current={view === 'creator' ? 'page' : undefined}
              onClick={() => {
                setView('creator');
              }}
            >
              Create
            </button>
            <button
              type="button"
              className={view === 'lab' ? 'button' : 'button button--ghost'}
              aria-current={view === 'lab' ? 'page' : undefined}
              onClick={() => {
                setView('lab');
              }}
            >
              Language Lab
            </button>
            <button
              type="button"
              className="button button--ghost"
              onClick={() => {
                walkthrough.startWalkthrough();
              }}
              title="Restart the guided tutorial"
              aria-label="Help - restart tutorial"
            >
              ?
            </button>
          </nav>
        </div>
      </header>

      <main className="app__main">
        {typefaceState.status === 'loading' ? (
          <p className="notice" role="status">
            Loading the Advent Sans brand typeface…
          </p>
        ) : null}

        {typefaceState.status === 'error' ? (
          <div className="card panel" role="alert">
            <h2 style={{ fontSize: 'var(--step-1)' }}>The brand typeface could not be loaded</h2>
            <p>{typefaceState.message}</p>
            <p className="hint">
              The tool will not fall back to another font. A lockup set in the wrong typeface is not
              official artwork, so it is better to stop here. Reload the page; if it keeps failing,
              tell SID Communication which network you are on.
            </p>
          </div>
        ) : null}

        {typefaceState.status === 'ready' && view === 'creator' ? (
          <CreatorPage typeface={typefaceState.typeface} languages={activations.available} />
        ) : null}

        {typefaceState.status === 'ready' && view === 'lab' ? (
          <LanguageLabPage typeface={typefaceState.typeface} activations={activations} />
        ) : null}
      </main>

      <InstallPrompt />

      <Walkthrough
        isActive={walkthrough.isActive}
        currentStep={walkthrough.currentStep}
        onNext={walkthrough.nextStep}
        onSkip={walkthrough.skipWalkthrough}
      />

      <footer className="app__footer">
        <p>
          Official artwork of the Seventh-day Adventist Church. Construction and usage follow the
          General Conference identity system at{' '}
          <a href="https://www.adventist.design" rel="noreferrer noopener" target="_blank">
            adventist.design
          </a>
          .
        </p>
        <p>SID Communication · {new Date().getFullYear()}</p>
      </footer>
    </div>
  );
}

function MastheadMark(): React.JSX.Element {
  const { width, height } = CHURCH_SYMBOL.viewBox;
  return (
    <svg
      className="masthead__mark"
      viewBox={`0 0 ${String(width)} ${String(height)}`}
      aria-hidden="true"
      focusable="false"
    >
      <g fill="currentColor" fillRule="nonzero">
        {CHURCH_SYMBOL.paths.map((d, index) => (
          <path key={index} d={d} />
        ))}
      </g>
    </svg>
  );
}
