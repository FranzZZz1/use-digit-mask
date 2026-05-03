import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { type ParsedValues, useMask, type UseMaskProps } from '../../useMask';

export type TestInputProps = Omit<UseMaskProps, 'value' | 'onChange'> & {
  initialValue?: string;
  onChangeSpy?: (value: string, parsed: ParsedValues) => void;
};

export function TestInput({ initialValue = '', onChangeSpy = undefined, ...maskProps }: TestInputProps) {
  const [value, setValue] = useState(initialValue);
  const { props } = useMask({
    ...maskProps,
    value,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChangeSpy?.(next, parsed);
    },
  });
  return <input {...props} data-testid="input" type="text" inputMode="numeric" />;
}

export type ControlledInputProps = UseMaskProps & { testId?: string };

export function ControlledInput({ testId = 'input', ...maskProps }: ControlledInputProps) {
  const { props } = useMask(maskProps);
  return <input {...props} data-testid={testId} type="text" />;
}

export function getInput(): HTMLInputElement {
  return screen.getByTestId('input');
}

export function fireChangeAt(inputEl: HTMLInputElement, newValue: string, cursorPos: number): void {
  const el = inputEl;

  Object.defineProperty(el, 'selectionStart', { configurable: true, get: () => cursorPos });
  Object.defineProperty(el, 'selectionEnd', { configurable: true, get: () => cursorPos });
  fireEvent.change(el, { target: { value: newValue } });
  delete (el as unknown as Record<string, unknown>).selectionStart;
  delete (el as unknown as Record<string, unknown>).selectionEnd;
}

export function firePaste(input: HTMLInputElement, text: string): void {
  fireEvent.paste(input, { clipboardData: { getData: () => text } });
}

export function fireKey(input: HTMLInputElement, key: string): void {
  fireEvent.keyDown(input, { key });
}

export function placeCaret(input: HTMLInputElement, start: number, end: number = start): void {
  input.setSelectionRange(start, end);
}
