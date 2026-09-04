import { useEffect, useState } from 'react';

/**
 * Offers to install the tool as an app.
 *
 * Chromium browsers fire `beforeinstallprompt` and let the page trigger the
 * install dialogue. Safari and Firefox do not, so nothing is shown there
 * rather than a button that would do nothing.
 */

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  readonly userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

const DISMISSED_KEY = 'sid-logo-creator.install-dismissed.v1';

export function InstallPrompt(): React.JSX.Element | null {
  const [event, setEvent] = useState<BeforeInstallPromptEvent | null>(null);
  const [hidden, setHidden] = useState(() => {
    try {
      return window.localStorage.getItem(DISMISSED_KEY) === '1';
    } catch {
      return false;
    }
  });

  useEffect(() => {
    function onPrompt(e: Event): void {
      e.preventDefault();
      setEvent(e as BeforeInstallPromptEvent);
    }
    function onInstalled(): void {
      setEvent(null);
    }
    window.addEventListener('beforeinstallprompt', onPrompt);
    window.addEventListener('appinstalled', onInstalled);
    return () => {
      window.removeEventListener('beforeinstallprompt', onPrompt);
      window.removeEventListener('appinstalled', onInstalled);
    };
  }, []);

  if (!event || hidden) return null;

  function dismiss(): void {
    setHidden(true);
    try {
      window.localStorage.setItem(DISMISSED_KEY, '1');
    } catch {
      // Nothing to do; the prompt will simply return next visit.
    }
  }

  return (
    <div
      className="card panel"
      style={{
        position: 'fixed',
        insetInline: 'var(--space-4)',
        bottom: 'var(--space-4)',
        maxWidth: '26rem',
        marginInline: 'auto',
        zIndex: 10,
        gap: 'var(--space-3)',
      }}
      role="region"
      aria-label="Install this app"
    >
      <p>
        <strong>Install the logo creator</strong>
        <br />
        It opens like an app and keeps working without a connection — useful where bandwidth is
        expensive.
      </p>
      <div className="row">
        <button
          type="button"
          className="button"
          onClick={() => {
            void event
              .prompt()
              .then(() => event.userChoice)
              .finally(() => {
                setEvent(null);
              });
          }}
        >
          Install
        </button>
        <button type="button" className="button button--ghost" onClick={dismiss}>
          Not now
        </button>
      </div>
    </div>
  );
}
