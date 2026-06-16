import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { type ParsedValues, usePhoneMask } from 'use-digit-mask';
import { describe, expect, it, vi } from 'vitest';

import { fireChangeAt, getInput, UncontrolledPhone } from './_helpers';

function ControlledCountryPhone({
  country = undefined,
  onChangeSpy = undefined,
}: {
  country?: string;
  onChangeSpy?: (value: string, parsed: ParsedValues) => void;
}) {
  const [value, setValue] = useState('');
  const { props } = usePhoneMask({
    value,
    country,
    onChange(next: string, parsed: ParsedValues) {
      setValue(next);
      onChangeSpy?.(next, parsed);
    },
  });
  return <input {...props} data-testid="phone" type="tel" />;
}

function ResettablePhone({ country = undefined }: { country?: string }) {
  const [value, setValue] = useState('');
  const { props } = usePhoneMask({
    value,
    country,
    onChange: (next) => {
      setValue(next);
    },
  });
  return (
    <>
      <input {...props} data-testid="phone" type="tel" />
      <button
        data-testid="reset"
        type="button"
        onClick={() => {
          setValue('');
        }}
      >
        Reset
      </button>
    </>
  );
}

describe('usePhoneMask - country', () => {
  describe('маунт', () => {
    it('country="RU" — поле заполнено российским префиксом', () => {
      render(<UncontrolledPhone country="RU" />);
      expect(getInput().value).toBe('+7 (___) ___-__-__');
    });

    it('country="US" — поле заполнено американским префиксом', () => {
      render(<UncontrolledPhone country="US" />);
      expect(getInput().value).toBe('+1 (___) ___-____');
    });

    it('без country — поле пустое', () => {
      render(<UncontrolledPhone />);
      expect(getInput().value).toBe('');
    });

    it('неизвестный country — поле пустое', () => {
      render(<UncontrolledPhone country="ZZ" />);
      expect(getInput().value).toBe('');
    });
  });

  describe('взаимодействие после prefill', () => {
    it('после country="RU" можно набрать полный номер', () => {
      render(<UncontrolledPhone country="RU" />);
      const input = getInput();
      fireChangeAt(input, '79991234567', 18);
      expect(input.value).toBe('+7 (999) 123-45-67');
    });

    it('пользователь сбросил поле — prefix не возвращается пока country не изменился', () => {
      render(<ResettablePhone country="RU" />);
      expect(getInput().value).toBe('+7 (___) ___-__-__');

      fireEvent.click(document.querySelector('[data-testid="reset"]')!);
      expect(getInput().value).toBe('');
    });
  });

  describe('смена country', () => {
    it('country меняется при несовместимом теле — старые цифры сбрасываются', () => {
      const { rerender } = render(<UncontrolledPhone country="RU" />);
      expect(getInput().value).toBe('+7 (___) ___-__-__');

      rerender(<UncontrolledPhone country="US" />);
      expect(getInput().value).toBe('+1 (___) ___-____');
    });

    it('country меняется при совместимом теле — цифры тела сохраняются', () => {
      // US и CA используют одинаковый cc=1, тело переносится
      const { rerender } = render(<UncontrolledPhone country="US" />);
      const input = getInput();
      fireChangeAt(input, '12025551234', 15);
      expect(input.value).toBe('+1 (202) 555-1234');

      rerender(<UncontrolledPhone country="CA" />);
      expect(input.value).toBe('+1 (202) 555-1234');
    });

    it('country меняется при несовместимом теле — тело сбрасывается, остаётся только новый префикс', () => {
      const { rerender } = render(<UncontrolledPhone country="US" />);
      const input = getInput();
      fireChangeAt(input, '12025551234', 15);
      expect(input.value).toBe('+1 (202) 555-1234');

      rerender(<UncontrolledPhone country="RU" />);
      expect(input.value).toBe('+7 (___) ___-__-__');
    });
  });

  describe('контролируемый режим', () => {
    it('country="RU" при value="" — onChange вызывается с российским префиксом на маунте', () => {
      const spy = vi.fn();
      render(<ControlledCountryPhone country="RU" onChangeSpy={spy} />);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toBe('+7 (___) ___-__-__');
    });

    it('country меняется — onChange вызывается с новым префиксом', () => {
      const spy = vi.fn();
      const { rerender } = render(<ControlledCountryPhone country="RU" onChangeSpy={spy} />);
      spy.mockClear();

      rerender(<ControlledCountryPhone country="US" onChangeSpy={spy} />);
      expect(spy).toHaveBeenCalledOnce();
      expect(spy.mock.calls[0][0]).toBe('+1 (___) ___-____');
    });

    it('onChange при country получает корректный prefix в ParsedValues', () => {
      const spy = vi.fn();
      render(<ControlledCountryPhone country="RU" onChangeSpy={spy} />);
      const parsed: ParsedValues = spy.mock.calls[0][1];
      expect(parsed.prefix).toBe('+7');
    });
  });
});
