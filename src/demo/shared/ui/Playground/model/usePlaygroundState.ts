import { useState } from 'react';

import { type OptionSchema, type OptionsState } from './types';

function buildInitialState(schema: OptionSchema, initialKey?: string): OptionsState {
  const state = schema.reduce<OptionsState>((acc, def) => {
    if (def.type === 'divider') return acc;
    acc[def.key] =
      def.type === 'str'
        ? { enabled: def.defaultEnabled ?? false, value: def.defaultValue ?? '' }
        : { enabled: def.defaultEnabled ?? false };
    return acc;
  }, {});

  if (initialKey && initialKey in state) {
    state[initialKey] = { ...state[initialKey], enabled: true };

    const def = schema.find((d) => d.type !== 'divider' && d.key === initialKey);
    if (def?.type === 'bool' && def.requiresParent && def.requiresParent in state) {
      state[def.requiresParent] = { ...state[def.requiresParent], enabled: true };
    }
  }

  return state;
}

export type UsePlaygroundStateReturn = {
  state: OptionsState;
  toggle: (key: string) => void;
  setStrValue: (key: string, value: string) => void;
};

export function usePlaygroundState(schema: OptionSchema, initialKey?: string): UsePlaygroundStateReturn {
  const [state, setState] = useState<OptionsState>(() => buildInitialState(schema, initialKey));

  function toggle(key: string) {
    setState((prev) => {
      const opt = prev[key];
      if (!opt) return prev;

      const next = { ...prev, [key]: { ...opt, enabled: !opt.enabled } };

      if (!next[key].enabled) {
        schema.forEach((def) => {
          if (def.type === 'bool' && def.requiresParent === key) {
            next[def.key] = { ...next[def.key], enabled: false };
          }
        });
      }

      return next;
    });
  }

  function setStrValue(key: string, value: string) {
    setState((prev) => {
      const opt = prev[key];
      if (!opt || !('value' in opt)) return prev;
      return { ...prev, [key]: { ...opt, value } };
    });
  }

  return { state, toggle, setStrValue };
}
