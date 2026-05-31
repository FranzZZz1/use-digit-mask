import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { renderToString } from 'react-dom/server';
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';
import { PHONE_MASK } from '../constants';

import { ControlledInput, getInput, TestInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

// Тесты фиксируют ожидаемое поведение: хук должен вызывать onChange,
// когда переданное value не совпадает с отформатированным результатом.
// Сценарий: бэк возвращает цифры без маски, хук должен немедленно
// сообщить родителю о форматированной версии, иначе родительский state
// расходится с тем, что видит пользователь в поле.

describe('Внешнее value требует форматирования', () => {
  it('onChange вызывается при маунте, если value пришло без маски', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##/##/####" value="01012024" onChange={spy} />);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('01/01/2024', expect.any(Object));
  });

  it('инпут показывает отформатированное значение даже если onChange ещё не вызван', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##/##/####" value="01012024" onChange={spy} />);
    expect(getInput().value).toBe('01/01/2024');
  });

  it('onChange вызывается когда value prop обновляется до неформатированного значения', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="##/##/####" value="" onChange={spy} />);
    spy.mockClear();
    rerender(<ControlledInput mask="##/##/####" value="31122024" onChange={spy} />);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('31/12/2024', expect.any(Object));
  });

  it('onChange не вызывается при маунте, если value уже отформатировано', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##/##/####" value="01/01/2024" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('onChange не вызывается при маунте с пустым value', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##/##/####" value="" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });

  it('parent state синхронизируется с форматированным значением через onChange', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<TestInput mask="##/##/####" initialValue="01012024" onChangeSpy={spy} />);
    expect(spy).toHaveBeenCalledWith('01/01/2024', expect.any(Object));
    expect(getInput().value).toBe('01/01/2024');
  });

  it('onChange вызывается с корректными parsedValues при форматировании внешнего value', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    render(<ControlledInput mask="##-##" value="1234" onChange={spy} />);
    expect(spy).toHaveBeenCalledWith(
      '12-34',
      expect.objectContaining<Partial<ParsedValues>>({
        rawWithoutPrefix: '1234',
        formattedWithPrefix: '12-34',
        isMaskCompleted: true,
      }),
    );
  });

  it('SSR (M3): первый рендер сразу содержит отформатированное значение (lazy init)', () => {
    const html = renderToString(<ControlledInput mask="##/##/####" value="01012024" onChange={() => {}} />);
    expect(html).toContain('01/01/2024');
  });

  it('SSR: alwaysActive рендерит шаблон маски на сервере', () => {
    const html = renderToString(<ControlledInput alwaysActive mask={PHONE_MASK} value="" onChange={() => {}} />);
    expect(html).toContain('+7 (___) ___-__-__');
  });

  it('SSR→hydrate: нет рассогласования гидрации (значение стабильно client/server)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const element = <ControlledInput mask="##/##/####" value="01012024" onChange={() => {}} />;
    const html = renderToString(element);

    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    act(() => {
      hydrateRoot(container, element);
    });

    expect(errorSpy).not.toHaveBeenCalled();
    expect(container.querySelector('input')?.value).toBe('01/01/2024');

    container.remove();
  });

  it('onChange не вызывается повторно при ре-рендере с тем же value', () => {
    const spy = vi.fn<(value: string, parsed: ParsedValues) => void>();
    const { rerender } = render(<ControlledInput mask="##/##/####" value="01012024" onChange={spy} />);
    spy.mockClear();
    rerender(<ControlledInput mask="##/##/####" value="01012024" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });
});
