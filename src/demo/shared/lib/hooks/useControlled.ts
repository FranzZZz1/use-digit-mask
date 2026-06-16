import { useState } from 'react';

/**
 * Поддержка controlled / uncontrolled режима.
 *
 * - Controlled: `externalValue !== undefined` — возвращает его как есть,
 *   `setValue` — no-op (обновление значения — ответственность родителя).
 * - Uncontrolled: хук управляет внутренним состоянием самостоятельно.
 *
 * @param externalValue Значение из пропсов (или `undefined` в uncontrolled).
 * @param defaultValue  Начальное значение для внутреннего состояния.
 */
export function useControlled<T>(externalValue: T | undefined, defaultValue: T) {
  const [valueState, setValueState] = useState(defaultValue);
  const isControlled = externalValue !== undefined;
  const value = isControlled ? externalValue : valueState;
  const setValue: (v: T) => void = isControlled ? () => {} : setValueState;

  return [value, setValue] as const;
}
