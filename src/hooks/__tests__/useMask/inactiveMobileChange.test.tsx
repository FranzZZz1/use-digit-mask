import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASTE_STRIP_PREFIX } from '../constants';

import { fireChangeAt, getInput, PrefixlessPhone, TestInput, UkPhone, UsPhone } from './_helpers';

describe('Inactive onChange — США "+1 (###) ###-####"', () => {
  it('cursor=4 ≤ prefixLength=4, нет overflow — весь ввод "1234" идёт в тело', () => {
    render(<UsPhone />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    expect(input.value).toBe('+1 (123) 4__-____');
  });

  it('cursor=3 ≤ prefixLength=4, нет overflow — "234" без стрипа', () => {
    render(<UsPhone />);
    const input = getInput();
    fireChangeAt(input, '234', 3);
    expect(input.value).toBe('+1 (234) ___-____');
  });

  it('cursor=4 ≤ prefixLength=4, overflow — "1" стрипается', () => {
    render(<UsPhone />);
    const input = getInput();
    fireChangeAt(input, '12024567890', 4);
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('cursor=11 > prefixLength=4, overflow — "1" стрипается', () => {
    render(<UsPhone />);
    const input = getInput();
    fireChangeAt(input, '12024567890', 11);
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('ровно maxDigits=10 с prefix "1" — не стрипается (overflow mode)', () => {
    render(<UsPhone />);
    const input = getInput();
    fireChangeAt(input, '1234567890', 10);
    expect(input.value).toBe('+1 (123) 456-7890');
  });

  it('pasteStripPrefix="always", ровно maxDigits=10 — "1" стрипается', () => {
    render(<UsPhone pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '1234567890', 10);
    expect(input.value).toBe('+1 (234) 567-890_');
  });

  it('cursor не влияет на результат — cursor=2 и cursor=11 дают одно', () => {
    render(<UsPhone />);
    const a = getInput();
    fireChangeAt(a, '12024567890', 2);
    const resultA = a.value;

    render(<UsPhone />);
    const allInputs = document.querySelectorAll('[data-testid="input"]');
    const b = allInputs[allInputs.length - 1] as HTMLInputElement;
    fireChangeAt(b, '12024567890', 11);
    expect(b.value).toBe(resultA);
  });
});

describe('Inactive onChange — Великобритания "+44 #### ######" (двузначный prefix)', () => {
  it('cursor=4 ≤ prefixLength=4, нет overflow — "4412" идёт в тело без стрипа', () => {
    render(<UkPhone />);
    const input = getInput();
    fireChangeAt(input, '4412', 4);
    expect(input.value).toBe('+44 4412 ______');
  });

  it('cursor=3 ≤ prefixLength=4, нет overflow — "441" без стрипа', () => {
    render(<UkPhone />);
    const input = getInput();
    fireChangeAt(input, '441', 3);
    expect(input.value).toBe('+44 441_ ______');
  });

  it('ровно maxDigits=10 с prefix "44" — не стрипается (overflow mode)', () => {
    render(<UkPhone />);
    const input = getInput();
    fireChangeAt(input, '4412345678', 10);
    expect(input.value).toBe('+44 4412 345678');
  });

  it('overflow (12 цифр с "44") — "44" стрипается', () => {
    render(<UkPhone />);
    const input = getInput();
    fireChangeAt(input, '441234567890', 12);
    expect(input.value).toBe('+44 1234 567890');
  });

  it('cursor=4 ≤ prefixLength=4, overflow — "44" стрипается', () => {
    render(<UkPhone />);
    const input = getInput();
    fireChangeAt(input, '441234567890', 4);
    expect(input.value).toBe('+44 1234 567890');
  });

  it('pasteStripPrefix="always", ровно maxDigits=10 — "44" стрипается', () => {
    render(<UkPhone pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '4412345678', 10);
    expect(input.value).toBe('+44 1234 5678__');
  });
});

const LONG_PREFIX_MASK = '+7   ###-###-##-##';
const LONG_PREFIX_PREFIXES = ['+7', '8'];

describe('Inactive onChange — удлинённый префикс "+7   ###-###-##-##" (prefixLength=5)', () => {
  it('cursor=5 ≤ prefixLength=5 — все цифры "120" попадают в тело', () => {
    render(<TestInput mask={LONG_PREFIX_MASK} allowedPrefixes={LONG_PREFIX_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '120', 3);
    expect(input.value).toBe('+7   120-___-__-__');
  });

  it('overflow "89001234567" — "8" стрипается', () => {
    render(<TestInput mask={LONG_PREFIX_MASK} allowedPrefixes={LONG_PREFIX_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89001234567', 11);
    expect(input.value).toBe('+7   900-123-45-67');
  });
});

const DENSE_MASK = '+7-###-###-##-##';
const DENSE_PREFIXES = ['+7', '8'];

describe('Inactive onChange — дефисы в теле маски "+7-###-###-##-##"', () => {
  it('cursor=3 ≤ prefixLength=3 ("+ 7-") — "120" попадает в тело', () => {
    render(<TestInput mask={DENSE_MASK} allowedPrefixes={DENSE_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '120', 3);
    expect(input.value).toBe('+7-120-___-__-__');
  });

  it('overflow "89001234567" — "8" стрипается', () => {
    render(<TestInput mask={DENSE_MASK} allowedPrefixes={DENSE_PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89001234567', 11);
    expect(input.value).toBe('+7-900-123-45-67');
  });
});

describe('Inactive onChange — маска без префикса "##########"', () => {
  it('overflow: "79001234567" (11 цифр) — "7" стрипается', () => {
    render(<PrefixlessPhone />);
    const input = getInput();
    fireChangeAt(input, '79001234567', 11);
    expect(input.value).toBe('9001234567');
  });

  it('overflow: "89001234567" (11 цифр) — "8" стрипается', () => {
    render(<PrefixlessPhone />);
    const input = getInput();
    fireChangeAt(input, '89001234567', 11);
    expect(input.value).toBe('9001234567');
  });

  it('ровно maxDigits=10 с prefix "7" — НЕ стрипается (overflow mode)', () => {
    render(<PrefixlessPhone />);
    const input = getInput();
    fireChangeAt(input, '7900123456', 10);
    expect(input.value).toBe('7900123456');
  });

  it('однозначная "8" — НЕ стрипается, идёт в тело', () => {
    render(<PrefixlessPhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('8_________');
  });

  it('pasteStripPrefix="always", ровно maxDigits=10 с "7" — стрипается', () => {
    render(<PrefixlessPhone pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    fireChangeAt(input, '7900123456', 10);
    expect(input.value).toBe('900123456_');
  });
});
