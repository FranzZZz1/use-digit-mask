import React, { useState } from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { flushRaf } from '../../../test-setup';
import { type ParsedValues, type UseMaskProps } from '../../types';
import { useMask } from '../../useMask';
import { PHONE_MASK } from '../constants';

import { ControlledInput, fireChangeAt, fireKey, getInput, TestInput } from './_helpers';

function ParsedValuesProbe({
  initialValue = '',
  ...rest
}: Omit<UseMaskProps, 'value' | 'onChange'> & { initialValue?: string }) {
  const [value, setValue] = useState(initialValue);
  const { props, api } = useMask({ ...rest, value, onChange: setValue });
  const parsed = api.getParsedValues();
  return (
    <input
      {...props}
      data-testid="input"
      data-prefix={parsed.prefix}
      data-raw-with-prefix={parsed.rawWithPrefix}
      data-raw-without-prefix={parsed.rawWithoutPrefix}
      data-formatted-with-prefix={parsed.formattedWithPrefix}
      data-formatted-without-prefix={parsed.formattedWithoutPrefix}
      data-formatted-without-placeholder={parsed.formattedWithoutPlaceholderChars}
      data-completed={String(parsed.isMaskCompleted)}
    />
  );
}

describe('bypassMask: ввод проходит без обработки маски', () => {
  it('значение с буквами отображается как есть', () => {
    render(<ControlledInput bypassMask mask={PHONE_MASK} value="user@mail.com" onChange={() => {}} />);
    expect(getInput().value).toBe('user@mail.com');
  });

  it('onChange получает сырой ввод без извлечения цифр', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask mask={PHONE_MASK} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, 'user@mail.com', 13);
    expect(input.value).toBe('user@mail.com');
    expect(spy).toHaveBeenLastCalledWith('user@mail.com', expect.any(Object));
  });

  it('цифры тоже не форматируются', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask mask={PHONE_MASK} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, '9991234567', 10);
    expect(input.value).toBe('9991234567');
  });

  it('внешний value с буквами не обрезается до цифр', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput bypassMask mask={PHONE_MASK} value="" onChange={spy} />);
    rerender(<ControlledInput bypassMask mask={PHONE_MASK} value="abc123@test.io" onChange={spy} />);
    expect(getInput().value).toBe('abc123@test.io');
  });
});

describe('bypassMask: getParsedValues возвращает сырое значение', () => {
  it('все поля содержат исходную строку, prefix пустой, isMaskCompleted = false', () => {
    render(<ParsedValuesProbe bypassMask mask={PHONE_MASK} initialValue="user@mail.com" />);
    const input = screen.getByTestId('input');
    expect(input.dataset.prefix).toBe('');
    expect(input.dataset.rawWithPrefix).toBe('user@mail.com');
    expect(input.dataset.rawWithoutPrefix).toBe('user@mail.com');
    expect(input.dataset.formattedWithPrefix).toBe('user@mail.com');
    expect(input.dataset.formattedWithoutPrefix).toBe('user@mail.com');
    expect(input.dataset.formattedWithoutPlaceholder).toBe('user@mail.com');
    expect(input.dataset.completed).toBe('false');
  });
});

describe('bypassMask: inputMode', () => {
  it('по умолчанию переключается на "text"', () => {
    render(<ControlledInput bypassMask mask={PHONE_MASK} value="" onChange={() => {}} />);
    expect(getInput().getAttribute('inputmode')).toBe('text');
  });

  it('маска без bypassMask использует "numeric" по умолчанию', () => {
    render(<ControlledInput mask={PHONE_MASK} value="" onChange={() => {}} />);
    expect(getInput().getAttribute('inputmode')).toBe('numeric');
  });

  it('явно заданный inputMode не переопределяется', () => {
    render(<ControlledInput bypassMask mask={PHONE_MASK} value="" inputMode="decimal" onChange={() => {}} />);
    expect(getInput().getAttribute('inputmode')).toBe('decimal');
  });
});

describe('bypassMask: горячие клавиши и paste обрабатываются нативно', () => {
  it('Backspace не перехватывается (preventDefault не вызывается)', () => {
    render(<ControlledInput bypassMask mask={PHONE_MASK} value="abc" onChange={() => {}} />);
    const input = getInput();
    const notPrevented = fireEvent.keyDown(input, { key: 'Backspace', code: 'Backspace' });
    expect(notPrevented).toBe(true);
  });

  it('paste не перехватывается (preventDefault не вызывается)', () => {
    render(<ControlledInput bypassMask mask={PHONE_MASK} value="" onChange={() => {}} />);
    const input = getInput();
    const notPrevented = fireEvent.paste(input, { clipboardData: { getData: () => 'user@mail.com' } });
    expect(notPrevented).toBe(true);
  });
});

describe('bypassMask: вставка и редактирование в произвольной позиции — итоговое значение проходит как есть', () => {
  it('вставка вместо полностью выделенного значения', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask initialValue="9991234567" mask={PHONE_MASK} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, 'user@mail.com', 13);
    expect(input.value).toBe('user@mail.com');
    expect(spy).toHaveBeenLastCalledWith('user@mail.com', expect.any(Object));
  });

  it('вставка вместо части выделенного значения', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask initialValue="999@mail.com" mask={PHONE_MASK} onChangeSpy={spy} />);
    const input = getInput();
    // выделено "999", вставлено "abc" -> "abc@mail.com"
    fireChangeAt(input, 'abc@mail.com', 3);
    expect(input.value).toBe('abc@mail.com');
  });

  it('буква в начале уже введённых цифр', () => {
    render(<TestInput bypassMask initialValue="1234" mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, 'a1234', 1);
    expect(input.value).toBe('a1234');
  });

  it('буква в середине уже введённых цифр', () => {
    render(<TestInput bypassMask initialValue="1234" mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '12x34', 3);
    expect(input.value).toBe('12x34');
  });

  it('буква в конце уже введённых цифр', () => {
    render(<TestInput bypassMask initialValue="1234" mask={PHONE_MASK} />);
    const input = getInput();
    fireChangeAt(input, '1234x', 5);
    expect(input.value).toBe('1234x');
  });

  it('удаление части значения через выделение (как после вставки/Delete)', () => {
    render(<TestInput bypassMask initialValue="abc@mail.com" mask={PHONE_MASK} />);
    const input = getInput();
    // выделено "abc", удалено -> "@mail.com"
    fireChangeAt(input, '@mail.com', 0);
    expect(input.value).toBe('@mail.com');
  });
});

describe('bypassMask: переключение режима', () => {
  it('выключение bypassMask пересчитывает маску из текущего value', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput bypassMask mask="####" value="12" onChange={spy} />);
    expect(getInput().value).toBe('12');

    rerender(<ControlledInput mask="####" value="12" onChange={spy} />);
    expect(getInput().value).toBe('12__');
  });

  it('включение bypassMask показывает value без обработки маски', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="####" value="12__" onChange={spy} />);
    expect(getInput().value).toBe('12__');

    rerender(<ControlledInput bypassMask mask="####" value="12ab" onChange={spy} />);
    expect(getInput().value).toBe('12ab');
  });
});

describe('bypassMask: ghostValue', () => {
  function GhostInput({
    initialValue = '',
    ...rest
  }: Omit<UseMaskProps, 'value' | 'onChange'> & { initialValue?: string }) {
    const [value, setValue] = useState(initialValue);
    const { props, ghostValue } = useMask({ ...rest, value, onChange: setValue });
    return <input {...props} data-testid="input" data-ghost={ghostValue} />;
  }

  it('ghostValue пустой при bypassMask', () => {
    render(<GhostInput bypassMask mask={PHONE_MASK} ghostChar="•" />);
    expect(screen.getByTestId('input').dataset.ghost).toBe('');
  });
});

describe('bypassMask: история и каретка не задействуются', () => {
  it('Ctrl+Z не откатывает значение (undo отключён)', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask mask={PHONE_MASK} onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, 'abc', 3);
    fireChangeAt(input, 'abcd', 4);
    fireKey(input, 'Z', { ctrlKey: true });
    expect(input.value).toBe('abcd');
  });
});

const isEmailLike = (value: string): boolean => /[a-zA-Z@]/.test(value);

describe('bypassMask как функция-предикат "телефон или email"', () => {
  it('первая буква сразу переключает в bypass-режим, символ не теряется', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput bypassMask={isEmailLike} mask="####" onChangeSpy={spy} />);
    const input = getInput();
    fireChangeAt(input, 'u', 1);
    expect(input.value).toBe('u');
    expect(spy).toHaveBeenLastCalledWith('u', expect.any(Object));
  });

  it('продолжение ввода email-адреса проходит без форматирования', () => {
    render(<TestInput bypassMask={isEmailLike} mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'u', 1);
    fireChangeAt(input, 'us', 2);
    fireChangeAt(input, 'us@mail.com', 11);
    expect(input.value).toBe('us@mail.com');
  });

  it('удаление буквы возвращает к маске для оставшихся цифр', () => {
    render(<TestInput bypassMask={isEmailLike} mask="####" />);
    const input = getInput();
    fireChangeAt(input, 'a1', 2);
    expect(input.value).toBe('a1');

    fireChangeAt(input, '1', 1);
    expect(input.value).toBe('1___');
  });

  it('вставка email-текста не перехватывается (preventDefault не вызывается)', () => {
    render(<TestInput bypassMask={isEmailLike} mask={PHONE_MASK} />);
    const input = getInput();
    const notPrevented = fireEvent.paste(input, { clipboardData: { getData: () => 'user@mail.com' } });
    expect(notPrevented).toBe(true);
  });

  it('вставка цифр в маску по-прежнему обрабатывается (preventDefault вызывается)', () => {
    render(<TestInput bypassMask={isEmailLike} mask={PHONE_MASK} />);
    const input = getInput();
    const notPrevented = fireEvent.paste(input, { clipboardData: { getData: () => '9991234567' } });
    expect(notPrevented).toBe(false);
  });

  it('внешний value с буквами проходит как есть, с цифрами — снова форматируется', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput bypassMask={isEmailLike} mask="####" value="" onChange={spy} />);

    rerender(<ControlledInput bypassMask={isEmailLike} mask="####" value="ab" onChange={spy} />);
    expect(getInput().value).toBe('ab');

    rerender(<ControlledInput bypassMask={isEmailLike} mask="####" value="12" onChange={spy} />);
    expect(getInput().value).toBe('12__');
  });

  it('буква в середину уже отформатированного значения — маска убирается, остаются только введённые символы', () => {
    render(<TestInput bypassMask={isEmailLike} mask="####" />);
    const input = getInput();

    fireChangeAt(input, '12', 2);
    expect(input.value).toBe('12__');

    // курсор после "1", вставлена буква "x" -> "1x2__"
    fireChangeAt(input, '1x2__', 2);
    expect(input.value).toBe('1x2');

    // курсор остаётся сразу после вставленной буквы, а не уезжает в конец
    flushRaf();
    expect(input.selectionStart).toBe(2);
  });

  it('удаление буквы из значения с активной маской возвращает корректный формат, а не обрывок маски', () => {
    render(<TestInput bypassMask={isEmailLike} mask={PHONE_MASK} prefixAliases={['+7', '8']} />);
    const input = getInput();

    // вводим "9", "3" -> маска "+7 (93_) ___-__-__"
    fireChangeAt(input, '+79', 3);
    fireChangeAt(input, '+7 (93', 6);
    expect(input.value).toBe('+7 (93_) ___-__-__');

    // вставляем букву "a" после "93" -> маска убирается, остаётся raw "93a"
    fireChangeAt(input, '+7 (93a_) ___-__-__', 7);
    expect(input.value).toBe('93a');

    // стираем "a" (нативный Backspace, т.к. handleKeyDown не перехватывает в bypass-режиме) -> "93"
    fireChangeAt(input, '93', 2);
    expect(input.value).toBe('+7 (93_) ___-__-__');
  });

  // Баг: если поле сразу начинается в bypass-режиме (значение с буквами с самого
  // начала), маска ни разу не активировалась (isMaskActive=false) и digitsRawRef
  // остаётся пустым. При выходе из bypass-режима (буквы стёрли) resolveChange попадает
  // в ветку "первая активация маски" и ставит каретку в конец введённых цифр,
  // игнорируя реальную позицию курсора.
  it('каретка остаётся на месте редактирования, а не уезжает в конец, при выходе из bypass-режима без префикса в маске', () => {
    render(<TestInput bypassMask={isEmailLike} initialValue="ab12" mask="####" />);
    const input = getInput();

    // курсор в начале, стираем "b" -> "12", буквы кончились, маска снова активна
    fireChangeAt(input, 'b12', 0);
    fireChangeAt(input, '12', 0);
    expect(input.value).toBe('12__');

    flushRaf();
    expect(input.selectionStart).toBe(0);
  });

  it('inputMode и ghostValue реагируют на текущее значение', () => {
    function GhostInput(props: UseMaskProps) {
      const { props: inputProps, ghostValue } = useMask(props);
      return <input {...inputProps} data-ghost={ghostValue} data-testid="input" />;
    }

    const { rerender } = render(
      <GhostInput bypassMask={isEmailLike} ghostChar="•" mask="####" value="" onChange={() => {}} />,
    );
    expect(getInput().getAttribute('inputmode')).toBe('numeric');
    expect(screen.getByTestId('input').dataset.ghost).toBe('••••');

    rerender(<GhostInput bypassMask={isEmailLike} ghostChar="•" mask="####" value="ab" onChange={() => {}} />);
    expect(getInput().getAttribute('inputmode')).toBe('text');
    expect(screen.getByTestId('input').dataset.ghost).toBe('');
  });
});
