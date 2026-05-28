import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { fireChangeAt, getInput, TestInput } from './_helpers';

const MASK = '+7 (###) ###-##-##';
const PREFIXES = ['+7', '8'];

/**
 * На Android вставка из буфера не генерирует событие paste - вместо этого
 * IME вставляет текст как обычный onChange. handlePaste при этом не вызывается,
 * и логика срезания префикса в useMask должна работать через handleChange.
 */
describe('Android IME paste - срезание allowed-префикса через onChange', () => {
  it('вставка числа с alt-префиксом "8" - "8" срезается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    // Активируем маску (первый символ '7' запускает shouldActivate)
    fireChangeAt(input, '7', 1);
    // Android вставляет полный номер с alt-prefix '8' (11 цифр > maxDigits=10)
    // stripVisiblePrefix не знает про '8', поэтому без фикса '8' утекает в body
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('вставка числа с удвоенным "+7"-префиксом - лишняя "7" срезается', () => {
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    // Android вставил "+7 (983) 120-48-97" в поле, которое уже показывает "+7 (...)",
    // курсор стоял в начале - e.target.value содержит двойной "+7"-префикс.
    // extractDigits → '779831204897'; stripVisiblePrefix срезает один '7' →
    // fullDigits = '79831204897' (11 > 10); фикс срезает второй '7'
    fireChangeAt(input, '779831204897', 12);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});

describe('Android IME paste - guard rails: strip не происходит', () => {
  it('allowedPrefixes=[] - alt-префикс "8" не срезается', () => {
    // Без allowedPrefixes allowedPrefixesDigits = [] → shouldStripPrefix = false
    render(<TestInput alwaysActive mask={MASK} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('ровно maxDigits цифр с allowed-префиксным началом - strip не происходит', () => {
    // fullDigits.length === maxDigits (не строго больше) → shouldStripPrefix = false;
    // пользователь мог намеренно набрать номер, начинающийся с '8'
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '8983120489', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('число не начинается с ни одного allowed-prefix - strip не происходит', () => {
    // '12345678901' не startsWith '7' или '8' → shouldStripPrefix = false
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    fireChangeAt(input, '12345678901', 11);
    expect(input.value).toBe('+7 (123) 456-78-90');
  });

  it('guard: ввод цифры совпадающей с alt-prefix в середину полной маски — strip не происходит', () => {
    // Пользователь вводит '8' в первый слот заполненной маски '+7 (983) 120-48-97'.
    // e.target.value = '+7 (8983) 120-48-97' → fullDigits = '89831204897' (11 > 10, starts with '8').
    // Без проверки cursor — стрип срабатывал бы и откатывал маску к старому значению.
    // С проверкой digitsLeft (= 2) <= strippedCandidate.length (= 10) — strip не происходит.
    render(<TestInput mask={MASK} allowedPrefixes={PREFIXES} initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    // cursor=6: после вставки '8' на позицию 5 (первый слот), курсор сдвигается на 6
    fireChangeAt(input, '+7 (8983) 120-48-97', 6);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });
});

describe('iOS autofill / password manager / другие источники без paste-события', () => {
  it('iOS autofill форматированного номера — stripVisiblePrefix достаточно, fix не задействуется', () => {
    // iOS Contacts вставляет уже отформатированный номер '+7 (983) 120-48-97'.
    // extractCleanDigits стрипает видимый '7' → 10 цифр = maxDigits → условие
    // fullDigits.length > maxDigits ложно, ветка фикса не достигается.
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '+7 (983) 120-48-97', 18);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('iOS autofill raw-цифр "79831204897" — stripVisiblePrefix справляется без фикса', () => {
    // Raw digits: extractCleanDigits стрипает ведущую '7' → 10 = maxDigits → без фикса.
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '79831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('password manager с cursor ровно на strippedCandidate.length — мягкая деградация', () => {
    // Если курсор оказался на позиции 10 (= strippedCandidate.length, не строго больше),
    // digitsLeft > strippedLen = false → strip не срабатывает.
    // Результат некорректный (+7 (898)...), но поле остаётся в валидном состоянии.
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 10);
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('WebView / password manager на desktop — курсор в конце, strip срабатывает', () => {
    // Те же условия что и Android, но источник другой (Electron WebView, 1Password desktop).
    // Курсор в конце вставленной строки → strip отрабатывает корректно.
    render(<TestInput alwaysActive mask={MASK} allowedPrefixes={PREFIXES} />);
    const input = getInput();
    fireChangeAt(input, '89831204897', 11);
    expect(input.value).toBe('+7 (983) 120-48-97');
  });
});
