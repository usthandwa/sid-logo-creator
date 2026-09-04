import { useEffect, useState } from 'react';
import { loadBrandTypeface } from '@/core/typeface';
import type { Typeface } from '@/core/types';

export type TypefaceState =
  | { readonly status: 'loading' }
  | { readonly status: 'ready'; readonly typeface: Typeface }
  | { readonly status: 'error'; readonly message: string };

/**
 * Loads Advent Sans once and shares it with every consumer.
 *
 * There is deliberately no system-font fallback: a lockup set in the wrong
 * typeface is not a Seventh-day Adventist lockup, and quietly producing one
 * would be worse than saying the tool cannot run.
 */
export function useTypeface(): TypefaceState {
  const [state, setState] = useState<TypefaceState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;
    loadBrandTypeface()
      .then((typeface) => {
        if (!cancelled) setState({ status: 'ready', typeface });
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        setState({
          status: 'error',
          message: error instanceof Error ? error.message : 'The brand typeface failed to load.',
        });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}
