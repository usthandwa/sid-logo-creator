import { useState } from 'react';

/**
 * The screen in front of the staged languages.
 *
 * This is a curtain, not a security boundary — the staged wordmarks are in the
 * shipped bundle and always will be, because the tool renders from them. Its
 * job is to make sure that whoever switches an unapproved wordmark on has read
 * why they should not publish it. Treat the access code as a signpost, not a
 * secret.
 */

const DEFAULT_CODE = 'sid-comms';

function expectedCode(): string {
  const configured: unknown = import.meta.env['VITE_LAB_ACCESS_CODE'];
  return typeof configured === 'string' && configured.length > 0 ? configured : DEFAULT_CODE;
}

interface Props {
  readonly onUnlock: () => void;
}

export function LabGate({ onUnlock }: Props): React.JSX.Element {
  const [value, setValue] = useState('');
  const [failed, setFailed] = useState(false);

  function submit(event: React.FormEvent): void {
    event.preventDefault();
    if (value.trim().toLowerCase() === expectedCode().toLowerCase()) {
      onUnlock();
    } else {
      setFailed(true);
    }
  }

  return (
    <section className="card panel" style={{ maxWidth: '38rem', marginInline: 'auto' }}>
      <div className="stack">
        <h2 style={{ fontSize: 'var(--step-2)' }}>Language Lab</h2>
        <p>
          Behind this screen are the languages of the SID territory that are built and rendering,
          but not yet approved for public use — Afrikaans, isiZulu, Shona, Chichewa, Bemba,
          Malagasy, Umbundu, Kreol Morisien and the rest.
        </p>
        <p>
          They are held back because a wordmark carries the name of the church. Wording has to be
          confirmed by the union that will use it before any congregation can put it on a building.
        </p>
      </div>

      <form className="stack" onSubmit={submit}>
        <label className="legend" htmlFor="lab-code">
          Access code
        </label>
        <input
          id="lab-code"
          className="input"
          type="password"
          value={value}
          autoComplete="off"
          aria-describedby="lab-code-hint"
          aria-invalid={failed}
          onChange={(event) => {
            setValue(event.target.value);
            setFailed(false);
          }}
        />
        <p className="hint" id="lab-code-hint">
          Issued by SID Communication. Set for your deployment with the{' '}
          <code>VITE_LAB_ACCESS_CODE</code> build variable.
        </p>
        {failed ? (
          <p className="notice notice--warn" role="alert">
            That code was not recognised.
          </p>
        ) : null}
        <button type="submit" className="button">
          Open the lab
        </button>
      </form>
    </section>
  );
}
