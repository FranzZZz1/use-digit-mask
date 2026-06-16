import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';

import { fireChangeAt, firePaste, getInput, TestInput } from './_helpers';

const cardMask = (digits: string) => (digits.startsWith('3') ? '#### ###### #####' : '#### #### #### ####');

describe('динамическая маска (mask как функция)', () => {
  it('начальная маска строится по пустым digits', () => {
    render(<TestInput mask={cardMask} />);
    const input = getInput();
    fireChangeAt(input, '4', 1);
    expect(input.value).toBe('4___ ____ ____ ____');
  });

  it('маска переключается при изменении первой цифры', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    render(<TestInput mask={cardMask} onChangeSpy={spy} />);
    const input = getInput();

    fireChangeAt(input, '3', 1);
    const lastCall = spy.mock.calls[spy.mock.calls.length - 1];
    expect(lastCall[0]).toBe('3___ ______ _____');
  });

  it('Visa/MC — 16 слотов, Amex — 15 слотов', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    render(<TestInput mask={cardMask} onChangeSpy={spy} />);
    const input = getInput();

    fireChangeAt(input, '4111111111111111', 16);
    let last = spy.mock.calls[spy.mock.calls.length - 1];
    expect(last[0]).toBe('4111 1111 1111 1111');
    expect(last[1].isMaskCompleted).toBe(true);

    spy.mockClear();

    fireChangeAt(input, '', 0);
    fireChangeAt(input, '378282246310005', 15);
    last = spy.mock.calls[spy.mock.calls.length - 1];
    expect(last[0]).toBe('3782 822463 10005');
    expect(last[1].isMaskCompleted).toBe(true);
  });

  it('onComplete срабатывает по числу слотов активной маски', () => {
    const onComplete = vi.fn();
    render(<TestInput mask={cardMask} onComplete={onComplete} />);
    const input = getInput();

    fireChangeAt(input, '378282246310005', 15);
    expect(onComplete).toHaveBeenCalledTimes(1);
  });

  it('вставка в пустое поле форматируется по новой маске', () => {
    const spy = vi.fn<(v: string) => void>();
    render(<TestInput mask={cardMask} onChangeSpy={spy} />);
    const input = getInput();

    firePaste(input, '4111111111111111');
    const last = spy.mock.calls[spy.mock.calls.length - 1];
    expect(last[0]).toBe('4111 1111 1111 1111');
  });

  it('строковая маска по-прежнему работает', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    fireChangeAt(input, '01012025', 8);
    expect(input.value).toBe('01/01/2025');
  });
});
