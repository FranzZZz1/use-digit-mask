import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';

import { type ParsedValues, type UseMaskProps } from '../../types';
import { useMask } from '../../useMask';
import { PHONE_MASK, PHONE_PREFIXES } from '../constants';

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

export function fireKey(
  input: HTMLInputElement,
  key: string,
  modifiers: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean } = {},
): void {
  const code = key.length === 1 ? `Key${key.toUpperCase()}` : key;
  fireEvent.keyDown(input, { key, code, ...modifiers });
}

export function placeCaret(input: HTMLInputElement, start: number, end: number = start): void {
  input.setSelectionRange(start, end);
}

type FixedMaskProps = Omit<TestInputProps, 'mask' | 'allowedPrefixes' | 'prefixAliases'>;

export function RussiaPhone(props: FixedMaskProps) {
  return <TestInput mask={PHONE_MASK} allowedPrefixes={PHONE_PREFIXES} {...props} />;
}

export const US_MASK = '+1 (###) ###-####';
export const US_PREFIXES = ['+1'];

export function UsPhone(props: FixedMaskProps) {
  return <TestInput mask={US_MASK} allowedPrefixes={US_PREFIXES} {...props} />;
}

export const UK_MASK = '+44 #### ######';
export const UK_PREFIXES = ['+44'];

export function UkPhone(props: FixedMaskProps) {
  return <TestInput mask={UK_MASK} allowedPrefixes={UK_PREFIXES} {...props} />;
}

export const PREFIXLESS_MASK = '##########';

export function PrefixlessPhone(props: FixedMaskProps) {
  return <TestInput mask={PREFIXLESS_MASK} allowedPrefixes={PHONE_PREFIXES} {...props} />;
}

export function AsyncControlledInput({ initialValue = '', onChangeSpy = undefined, ...maskProps }: TestInputProps) {
  const [value, setValue] = useState(initialValue);

  const { props } = useMask({
    ...maskProps,
    value,
    onChange(next: string, parsed: ParsedValues) {
      setTimeout(() => {
        setValue(next);
        onChangeSpy?.(next, parsed);
      }, 0);
    },
  });

  return <input {...props} data-testid="input" />;
}
