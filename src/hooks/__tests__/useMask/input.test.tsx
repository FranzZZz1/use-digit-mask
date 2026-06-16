import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PHONE_MASK } from '../constants';

import { fireChangeAt, getInput, RussiaPhone, TestInput, UkPhone, UsPhone } from './_helpers';

describe('Базовый ввод', () => {
  it('пустая маска - инпут пуст', () => {
    render(<TestInput mask="#### #### #### ####" />);
    expect(getInput().value).toBe('');
  });

  it('первый символ отображается в первом слоте', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1', 1);
    expect(input.value).toBe('1___ ____ ____ ____');
  });

  it('заполнение всех 16 цифр', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(input.value).toBe('1234 5678 9012 3456');
  });

  it('лишние цифры обрезаются до maxDigits', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    fireChangeAt(input, '123456789', 9);
    expect(input.value).toBe('12/34/5678');
  });

  it('нецифровые символы игнорируются', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'abc', 3);
    expect(input.value).toBe('');
  });

  it('нецифровые символы внутри строки фильтруются', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'a1b2', 4);
    expect(input.value).toBe('12__');
  });

  it('кастомный placeholderChar', () => {
    render(<TestInput mask="##-##" placeholderChar="*" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12-**');
  });

  it('пустой placeholderChar - плейсхолдер не показывается', () => {
    render(<TestInput mask="##/##" placeholderChar="" />);
    const input = getInput();
    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12/');
  });
});

describe('Ввод в середину заполненной маски', () => {
  it('вставка цифры в середину - последняя цифра вытесняется', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    fireChangeAt(input, '1234567890123456', 16);
    expect(input.value).toBe('1234 5678 9012 3456');

    fireChangeAt(input, '1234 59678 9012 3456', 7);
    expect(input.value).toBe('1234 5967 8901 2345');
  });

  it('вставка в начало - первые цифры сдвигаются', () => {
    render(<TestInput mask="####" initialValue="1234" />);
    const input = getInput();
    fireChangeAt(input, '91234', 1);
    expect(input.value).toBe('9123');
  });

  it('вставка перед разделителем', () => {
    render(<TestInput mask="## ## ##" initialValue="12 34 56" />);
    const input = getInput();
    fireChangeAt(input, '129 34 56', 3);
    expect(input.value).toBe('12 93 45');
  });

  it('вставка в маску с 1 свободным слотом', () => {
    render(<TestInput mask="####" initialValue="123_" />);
    const input = getInput();
    fireChangeAt(input, '1293', 3);
    expect(input.value).toBe('1293');
  });
});

describe('Ввод в зону префикса (курсор перед буквальной цифрой)', () => {
  it('ввод перед буквальной цифрой префикса — в тело попадает только введённая цифра', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '+57 (___) ___-__-__', 2);
    expect(input.value).toBe('+7 (5__) ___-__-__');
  });

  it('ввод перед самым первым символом префикса (позиция 0) — цифра идёт в первый слот', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '5+7 (___) ___-__-__', 1);
    expect(input.value).toBe('+7 (5__) ___-__-__');
  });

  it('ввод в префикс при существующих цифрах — вставляется в начало тела, не дублирует префикс', () => {
    render(<TestInput mask={PHONE_MASK} initialValue="9" />);
    const input = getInput();
    fireChangeAt(input, '+57 (9__) ___-__-__', 2);
    expect(input.value).toBe('+7 (59_) ___-__-__');
  });

  it('ввод в префикс при нескольких цифрах — цифра вставляется в начало тела', () => {
    render(<TestInput mask={PHONE_MASK} initialValue="34" />);
    const input = getInput();
    fireChangeAt(input, '5+7 (34_) ___-__-__', 1);
    expect(input.value).toBe('+7 (534) ___-__-__');
  });

  it('не-цифра в зоне префикса — значение не меняется', () => {
    render(<TestInput alwaysActive mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '+a7 (___) ___-__-__', 2);
    expect(input.value).toBe('+7 (___) ___-__-__');
  });
});

describe('Ввод в зону префикса — США "+1 (###) ###-####"', () => {
  it('cursor=3 ≤ prefixLength=4 — цифра идёт в первый слот тела', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+15 (___) ___-____', 3);
    expect(input.value).toBe('+1 (5__) ___-____');
  });

  it('cursor=1 (перед первым символом) — цифра идёт в первый слот', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '5+1 (___) ___-____', 1);
    expect(input.value).toBe('+1 (5__) ___-____');
  });

  it('clear: входная строка является началом visiblePrefix — поле очищается', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+1 ', 3);
    expect(input.value).toBe('+1 (___) ___-____');
  });

  it('не-цифра в зоне префикса — значение не меняется', () => {
    render(<UsPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+a1 (___) ___-____', 2);
    expect(input.value).toBe('+1 (___) ___-____');
  });

  it('с существующими цифрами — новая цифра встаёт в начало тела', () => {
    render(<UsPhone initialValue="+1 (234) 567-8901" />);
    const input = getInput();
    fireChangeAt(input, '+51 (234) 567-8901', 2);
    expect(input.value).toBe('+1 (523) 456-7890');
  });
});

describe('Ввод в зону префикса — Великобритания "+44 #### ######" (двузначный cc)', () => {
  it('cursor=3 ≤ prefixLength=4 — цифра идёт в первый слот тела', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+454 ____ ______', 3);
    expect(input.value).toBe('+44 5___ ______');
  });

  it('cursor=4 = prefixLength (граница) — цифра идёт в первый слот', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+445 ____ ______', 4);
    expect(input.value).toBe('+44 5___ ______');
  });

  it('clear: часть двузначного префикса "+4" — поле очищается до шаблона', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+4', 2);
    expect(input.value).toBe('+44 ____ ______');
  });

  it('не-цифра в зоне двузначного префикса — значение не меняется', () => {
    render(<UkPhone alwaysActive />);
    const input = getInput();
    fireChangeAt(input, '+4a4 ____ ______', 3);
    expect(input.value).toBe('+44 ____ ______');
  });

  it('с существующими цифрами — новая цифра встаёт в начало тела', () => {
    render(<UkPhone initialValue="+44 1234 567890" />);
    const input = getInput();
    fireChangeAt(input, '+454 1234 567890', 3);
    expect(input.value).toBe('+44 5123 456789');
  });
});

describe('trimMaskTail + префикс-маска', () => {
  it('пустое неактивное поле — показывает ""', () => {
    render(<RussiaPhone trimMaskTail />);
    expect(getInput().value).toBe('');
  });

  it('alwaysActive, пустое поле — показывает только visiblePrefix', () => {
    render(<RussiaPhone alwaysActive trimMaskTail />);
    expect(getInput().value).toBe('+7 (');
  });

  it('1 цифра — prefix + одна цифра, без плейсхолдеров', () => {
    render(<RussiaPhone trimMaskTail />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '+7 (9__) ___-__-__', 5);
    expect(input.value).toBe('+7 (9');
  });

  it('частичное заполнение — обрезается по последнему заполненному слоту', () => {
    render(<RussiaPhone trimMaskTail />);
    const input = getInput();
    fireChangeAt(input, '999123', 6);
    expect(input.value).toBe('+7 (999) 123');
  });

  it('полная маска — нет хвостовых плейсхолдеров', () => {
    render(<RussiaPhone trimMaskTail />);
    const input = getInput();
    fireChangeAt(input, '79991234567', 11);
    expect(input.value).toBe('+7 (999) 123-45-67');
  });
});
