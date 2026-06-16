import React from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { flushRaf } from '../../../test-setup';
import { type ParsedValues } from '../../types';
import { PHONE_MASK } from '../constants';

import { ControlledInput, fireChangeAt, firePaste, getInput, TestInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Edge cases', () => {
  it('маска только из цифровых слотов (без разделителей)', () => {
    render(<TestInput mask="######" />);
    const input = getInput();
    fireChangeAt(input, '123456', 6);
    expect(input.value).toBe('123456');
  });

  it('маска только из одного слота', () => {
    render(<TestInput mask="#" />);
    const input = getInput();
    fireChangeAt(input, '5', 1);
    expect(input.value).toBe('5');
  });

  it('маска с несколькими видами разделителей', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    fireChangeAt(input, '31122024', 8);
    expect(input.value).toBe('31/12/2024');
  });

  it('вставка пустой строки не меняет значение', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    firePaste(input, '');
    expect(input.value).toBe('12__');
  });

  it('onChange вызывается при изменении значения', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '1', 1);
    expect(spy).toHaveBeenCalledWith('1___', expect.any(Object));
  });

  it('onChange не вызывается когда ввод идентичен (нет смены значения через external value)', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="####" value="12__" onChange={spy} />);
    rerender(<ControlledInput mask="####" value="12__" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('onChange не вызывается если ввод не меняет значение (маска полная)', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="####" initialValue="1234" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '12345', 5);
    expect(spy).not.toHaveBeenCalled();
  });

  it('composition-события не мешают вводу (обработчики не нужны)', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireEvent.compositionStart(input);
    fireChangeAt(input, '1234', 4);
    expect(input.value).toBe('1234');
    fireEvent.compositionEnd(input);
  });

  it('initialValue правильно рендерится при маунте', () => {
    render(<TestInput mask="##-##" initialValue="12-34" />);
    expect(getInput().value).toBe('12-34');
  });

  it('выделение всего значения и недопустимый символ откатывают ввод без очистки', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask={PHONE_MASK} prefixAliases={['+7', '8']} initialValue="983" onChangeSpy={spy} />);
    const input = getInput();
    expect(input.value).toBe('+7 (983) ___-__-__');
    spy.mockClear();

    fireChangeAt(input, 'x', 1);

    expect(input.value).toBe('+7 (983) ___-__-__');
    expect(spy).not.toHaveBeenCalled();

    flushRaf();
    expect(input.selectionStart).toBe(7);
  });

  it('выделение префикса с цифрами и недопустимый символ — откат без очистки (граница префикса)', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask={PHONE_MASK} prefixAliases={['+7', '8']} initialValue="983" onChangeSpy={spy} />);
    const input = getInput();
    expect(input.value).toBe('+7 (983) ___-__-__');
    spy.mockClear();

    // выделено "+7 (983", введена буква "x" -> "x) ___-__-__"
    fireChangeAt(input, 'x) ___-__-__', 1);

    expect(input.value).toBe('+7 (983) ___-__-__');
    expect(spy).not.toHaveBeenCalled();
  });

  it('выделение цифр и литералов после префикса и недопустимый символ — откат без очистки', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask={PHONE_MASK} prefixAliases={['+7', '8']} initialValue="983" onChangeSpy={spy} />);
    const input = getInput();
    expect(input.value).toBe('+7 (983) ___-__-__');
    spy.mockClear();

    // выделено "983) ___", введена буква "x" -> "+7 (x-__-__"
    fireChangeAt(input, '+7 (x-__-__', 5);

    expect(input.value).toBe('+7 (983) ___-__-__');
    expect(spy).not.toHaveBeenCalled();
  });
});
