import React from 'react';
import { render } from '@testing-library/react';
import { type ParsedValues } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, firePaste, getInput, SpyPhone, UncontrolledPhone } from './_helpers';

describe('usePhoneMask - altPrefix (8 для России)', () => {
  it('ввод "8" сразу отображается в формате altPrefix без промежуточного E164', () => {
    // Проверяет фикс фликеринга: после ввода одного символа значение
    // должно быть уже в правильном формате, а не в E164 (+8_______________)
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('8 (___) ___-__-__');
  });

  it('ввод "8" + цифры номера даёт полный формат 8-xxx-xxx-xx-xx', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    fireChangeAt(input, '89991234567', 11);
    expect(input.value).toBe('8 (999) 123-45-67');
  });

  it('вставка "89991234567" - российский формат через alt-префикс', () => {
    render(<UncontrolledPhone />);
    const input = getInput();
    firePaste(input, '89991234567');
    expect(input.value).toBe('8 (999) 123-45-67');
  });

  it('ввод "8..." не проходит через промежуточный E164 - onChange получает правильный prefix', () => {
    const spy = (value: string, parsed: ParsedValues) => {
      if (value !== '' && parsed.prefix !== '') {
        expect(['8', '']).toContain(parsed.prefix);
      }
    };
    render(<SpyPhone onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    // Тест провалится, если промежуточный onChange вызовется с prefix="+7" или "+8..."
  });
});
