import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';
import { PHONE_PREFIXES } from '../constants';

import { fireChangeAt, firePaste, getInput, placeCaret, TestInput } from './_helpers';

const MASK = '##########';
const PREFIXES = PHONE_PREFIXES;

describe('Маска без литерального префикса + allowedPrefixes', () => {
  it('ввод "8" первым символом идёт в тело, а не проглатывается активацией', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('8_________');
  });

  it('вставка "+79991234567" срезает код страны (strip-on-paste работает)', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+79991234567');
    expect(input.value).toBe('9991234567');
  });

  it('вставка одиночного "8" (digit-only prefix) идёт в тело, не активирует впустую', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('8_________');
  });

  it('parsed: prefix пуст и rawWithPrefix не дублирует ведущую "8"', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} onChangeSpy={spy} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8123456789');
    expect(input.value).toBe('8123456789');

    const [, parsed] = spy.mock.calls[spy.mock.calls.length - 1];
    expect(parsed.prefix).toBe('');
    expect(parsed.rawWithoutPrefix).toBe('8123456789');
    expect(parsed.rawWithPrefix).toBe('8123456789');
    expect(parsed.rawWithPrefix).toBe(parsed.prefix + parsed.rawWithoutPrefix);
  });
});
