import { useCallback, useMemo } from 'react';
import { LANGUAGES, type LanguageDef } from '@/brand/languages';
import { usePersistentState } from './usePersistentState';

const STORAGE_KEY = 'sid-logo-creator.language-activations.v1';

function isCodeList(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((v) => typeof v === 'string');
}

export interface Activations {
  /** Languages offered in the creator right now, staged trials included. */
  readonly available: readonly LanguageDef[];
  /** Staged languages the current browser has switched on for trial. */
  readonly trialCodes: ReadonlySet<string>;
  readonly toggle: (code: string) => void;
  readonly reset: () => void;
}

/**
 * Local activation of staged languages.
 *
 * A trial activation lives in this browser only. It exists so a communication
 * director can put a draft wordmark in front of a union committee without
 * shipping it to every church in the division first. Making it permanent means
 * changing `status` in the registry and opening a pull request — see the
 * Language Lab.
 */
export function useActivations(): Activations {
  const [codes, setCodes] = usePersistentState<string[]>(STORAGE_KEY, [], isCodeList);

  const trialCodes = useMemo(() => new Set(codes), [codes]);

  const available = useMemo(
    () => LANGUAGES.filter((l) => l.status === 'active' || trialCodes.has(l.code)),
    [trialCodes],
  );

  const toggle = useCallback(
    (code: string) => {
      setCodes(codes.includes(code) ? codes.filter((c) => c !== code) : [...codes, code]);
    },
    [codes, setCodes],
  );

  const reset = useCallback(() => {
    setCodes([]);
  }, [setCodes]);

  return { available, trialCodes, toggle, reset };
}
