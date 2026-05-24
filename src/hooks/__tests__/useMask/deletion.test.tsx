import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, fireKey, getInput, placeCaret, TestInput } from './_helpers';

describe('Backspace', () => {
  it('удаляет последнюю цифру', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    placeCaret(input, 2);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1___');
  });

  it('удаляет цифру в середине (cursor после 3-й цифры)', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 3);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1245 678_');
  });

  it('удаляет диапазон выделения', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 1, 4);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1567 8___');
  });

  it('в начале маски (isMaskActive=false через initialValue) — не меняет значение', () => {
    render(<TestInput mask="####" initialValue="12__" />);
    const input = getInput();
    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('12__');
  });

  it('в начале активной маски с цифрами (маска без префикса) — не сбрасывает значение', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '4', 1);
    expect(input.value).toBe('4___ ____ ____ ____');
    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('4___ ____ ____ ____');
  });

  it('перед первым слотом (позиция prefixLength) с цифрами — не сбрасывает значение', () => {
    const MASK = '+7 (###) ###-##-##';
    render(<TestInput mask={MASK} allowedPrefixes={['+7', '8']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (9__) ___-__-__', 5);
    expect(input.value).toBe('+7 (9__) ___-__-__');
    placeCaret(input, 4); // prefixLength = 4 для "+7 ("
    fireKey(input, 'Backspace');
    expect(input.value).toBe('+7 (9__) ___-__-__');
  });

  it('в начале активной маски без цифр — деактивирует (корректное поведение не сломано)', () => {
    render(<TestInput mask="+7 (###) ###-##-##" allowedPrefixes={['+7', '8']} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    expect(input.value).toBe('+7 (___) ___-__-__');
    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('');
  });

  it('alwaysActive + backspace в начале — маска остаётся, значение не меняется', () => {
    render(<TestInput alwaysActive mask="####" />);
    const input = getInput();
    fireChangeAt(input, '1___', 1);
    expect(input.value).toBe('1___');
    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1___');
  });

  it('на пустой маске - не падает', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('');
  });

  it('backspace через разделитель - удаляет предыдущую цифру', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5___" />);
    const input = getInput();
    placeCaret(input, 5);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1235 ____');
  });

  it('backspace полностью очищает маску', () => {
    render(<TestInput mask="##" initialValue="12" />);
    const input = getInput();
    placeCaret(input, 2);
    fireKey(input, 'Backspace');
    expect(input.value).toBe('1_');
    fireKey(input, 'Backspace');
    expect(input.value).toBe('');
  });
});

describe('Delete', () => {
  it('удаляет цифру вперёд', () => {
    render(<TestInput mask="####" initialValue="1234" />);
    const input = getInput();
    placeCaret(input, 1);
    fireKey(input, 'Delete');
    expect(input.value).toBe('134_');
  });

  it('в конце заполненной маски - ничего не меняет', () => {
    render(<TestInput mask="####" initialValue="1234" />);
    const input = getInput();
    placeCaret(input, 4);
    fireKey(input, 'Delete');
    expect(input.value).toBe('1234');
  });

  it('удаляет выделение', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 5, 9);
    fireKey(input, 'Delete');
    expect(input.value).toBe('1234 ____');
  });

  it('на пустой маске - не падает', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    fireKey(input, 'Delete');
    expect(input.value).toBe('');
  });
});
