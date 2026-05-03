import React from 'react';
import { render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../useMask';

import { ControlledInput, fireChangeAt, getInput, TestInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('ParsedValues', () => {
  it('prefix корректен для маски без allowedPrefixes', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="#### #### #### ####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.prefix).toBe('');
  });

  it('prefix корректен для телефонной маски', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (9__) ___-__-__', 5);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.prefix).toBe('+7');
  });

  it('rawWithoutPrefix содержит только цифры без префикса', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (9991234567)', 16);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.rawWithoutPrefix).toBe('9991234567');
  });

  it('isMaskCompleted = true когда все слоты заполнены', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.isMaskCompleted).toBe(true);
  });

  it('isMaskCompleted = false когда не все слоты заполнены', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.isMaskCompleted).toBe(false);
  });

  it('isMaskCompleted = true для trimMaskTail по количеству цифр', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput trimMaskTail mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.isMaskCompleted).toBe(true);
  });

  it('formattedWithoutPlaceholderChars обрезает по последней цифре', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '12__', 2);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.formattedWithoutPlaceholderChars).toBe('12');
  });

  it('rawWithPrefix = prefix + rawWithoutPrefix', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="+7 (###) ###-##-##" allowedPrefixes={['+7']} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (9991234567)', 16);
    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.rawWithPrefix).toBe(parsed.prefix + parsed.rawWithoutPrefix);
  });
});

describe('Внешнее значение (controlled)', () => {
  it('изменение value снаружи обновляет инпут', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="####" value="12__" onChange={spy} />);
    expect(getInput().value).toBe('12__');

    rerender(<ControlledInput mask="####" value="1234" onChange={spy} />);
    expect(getInput().value).toBe('1234');
  });

  it('внешний сброс value в "" очищает инпут', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="####" value="1234" onChange={spy} />);
    expect(getInput().value).toBe('1234');

    rerender(<ControlledInput mask="####" value="" onChange={spy} />);
    expect(getInput().value).toBe('');
  });

  it('внешний value с цифрами отображается в маске', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##/##/####" value="01/01/2025" onChange={spy} />);
    expect(getInput().value).toBe('01/01/2025');
  });

  it('внешний value с лишними цифрами обрезается', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="####" value="1234567" onChange={spy} />);
    expect(getInput().value).toBe('1234');
  });

  it('смена маски - значение пересчитывается', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="##" value="12" onChange={spy} />);
    expect(getInput().value).toBe('12');

    rerender(<ControlledInput mask="##-##" value="12" onChange={spy} />);
    expect(getInput().value).toBe('12-__');
  });
});
