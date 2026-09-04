import { useCallback, useState } from 'react';

/**
 * State that survives a reload, for the small conveniences a user would
 * resent re-picking: their tier, language and last colour.
 *
 * Every access is guarded — private windows, blocked site data and embedded
 * previews all make `localStorage` throw rather than return null.
 */
export function usePersistentState<T>(
  key: string,
  initial: T,
  isValid: (value: unknown) => value is T,
): readonly [T, (value: T) => void] {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw === null) return initial;
      const parsed: unknown = JSON.parse(raw);
      return isValid(parsed) ? parsed : initial;
    } catch {
      return initial;
    }
  });

  const set = useCallback(
    (next: T) => {
      setValue(next);
      try {
        window.localStorage.setItem(key, JSON.stringify(next));
      } catch {
        // Storage is unavailable; the choice simply will not be remembered.
      }
    },
    [key],
  );

  return [value, set] as const;
}

export const isString = (value: unknown): value is string => typeof value === 'string';
