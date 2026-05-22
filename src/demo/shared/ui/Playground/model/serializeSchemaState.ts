import { type OptionSchema, type OptionsState, type StrOptionState } from './types';

export function serializeSchemaState<T extends Record<string, unknown>>(
  schema: OptionSchema,
  state: OptionsState,
): Partial<T> {
  return schema.reduce<Record<string, unknown>>((acc, def) => {
    if (def.type === 'divider') return acc;

    const fieldState = state[def.key];

    if (def.type === 'bool') {
      if (fieldState?.enabled) {
        acc[def.key] = true;
      } else if (def.alwaysSerialize) {
        acc[def.key] = false;
      }
    } else if (def.type === 'str') {
      if (!fieldState?.enabled) return acc;
      const raw = (fieldState as StrOptionState).value;
      const transformed = def.transform ? def.transform(raw) : raw;
      const value = transformed != null && transformed !== '' ? transformed : def.fallback;
      if (value != null && value !== '') acc[def.key] = value;
    }

    return acc;
  }, {}) as Partial<T>;
}
