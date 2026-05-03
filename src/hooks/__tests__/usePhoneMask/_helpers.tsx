import React, { useState } from 'react';
import { fireEvent, screen } from '@testing-library/react';
import { type ParsedValues, usePhoneMask, type UsePhoneMaskProps } from 'use-digit-mask';

// onChange опционален — компонент управляет value самостоятельно
type UncontrolledPhoneProps = Omit<UsePhoneMaskProps, 'value' | 'onChange'> & {
  onChange?: UsePhoneMaskProps['onChange'];
};

export function UncontrolledPhone({ onChange = undefined, ...props }: UncontrolledPhoneProps) {
  const [value, setValue] = useState('');
  const { props: inputProps } = usePhoneMask({
    ...props,
    value,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChange?.(next, parsed);
    },
  });
  return <input {...inputProps} data-testid="phone" type="tel" />;
}

export function ControlledPhone({ testId = 'phone', ...rest }: UsePhoneMaskProps & { testId?: string }) {
  const { props: inputProps } = usePhoneMask(rest);
  return <input {...inputProps} data-testid={testId} type="tel" />;
}

type SpyPhoneProps = Omit<UsePhoneMaskProps, 'value' | 'onChange'> & {
  onChangeSpy?: (value: string, parsed: ParsedValues) => void;
};

export function SpyPhone({ onChangeSpy = undefined, ...rest }: SpyPhoneProps) {
  const [value, setValue] = useState('');
  const { props: inputProps } = usePhoneMask({
    ...rest,
    value,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChangeSpy?.(next, parsed);
    },
  });
  return <input {...inputProps} data-testid="phone" type="tel" />;
}

export function CandidatePhone({ onChangeSpy = undefined }: { onChangeSpy?: (v: string, p: ParsedValues) => void }) {
  const [value, setValue] = useState('');
  const {
    props: inputProps,
    candidates,
    selectCandidate,
  } = usePhoneMask({
    value,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChangeSpy?.(next, parsed);
    },
  });
  return (
    <div>
      <input {...inputProps} data-testid="phone" type="tel" />
      {candidates.map((c) => (
        <button
          key={`${c.id}-${c.prefixDigits}`}
          data-testid={`candidate-${c.prefixDigits}`}
          type="button"
          onClick={() => {
            selectCandidate(c);
          }}
        >
          {c.label} {c.prefix}
        </button>
      ))}
    </div>
  );
}

export function getInput(): HTMLInputElement {
  const el = screen.getByTestId('phone');
  if (!(el instanceof HTMLInputElement)) throw new Error('Expected input element');
  return el;
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
