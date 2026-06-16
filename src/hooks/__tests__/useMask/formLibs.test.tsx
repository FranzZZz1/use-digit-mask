import React, { useState } from 'react';
import { fireEvent, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { type ParsedValues } from '../../types';
import { useMask } from '../../useMask';

import { fireChangeAt, getInput } from './_helpers';

afterEach(() => {
  vi.restoreAllMocks();
});

type RhfFieldProps = {
  value: string;
  onChange: (value: string, parsed: ParsedValues) => void;
  onBlur?: () => void;
};

function RhfLikeField({ value: fieldValue, onChange: onFieldChange, onBlur: onFieldBlur = undefined }: RhfFieldProps) {
  const { props } = useMask({
    mask: '##/##/####',
    value: fieldValue,
    onChange: onFieldChange,
  });
  return (
    <input
      {...props}
      data-testid="input"
      type="text"
      onBlur={() => {
        props.onBlur?.();
        onFieldBlur?.();
      }}
    />
  );
}

describe('RHF Controller — совместимость', () => {
  it('onChange(value, parsed): первый аргумент — форматированная строка, которую хранит RHF', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    render(<RhfLikeField value="" onChange={spy} />);
    const input = getInput();
    fireChangeAt(input, '0101', 4);
    expect(spy).toHaveBeenLastCalledWith('01/01/____', expect.any(Object));
  });

  it('props содержит onBlur — RHF помечает поле touched при потере фокуса', () => {
    const onFieldBlur = vi.fn();
    render(<RhfLikeField value="" onChange={() => {}} onBlur={onFieldBlur} />);
    fireEvent.blur(getInput());
    expect(onFieldBlur).toHaveBeenCalledOnce();
  });

  it('props.ref прикреплён к HTMLInputElement — RHF использует для setFocus/validate', () => {
    const capturedRefs: React.RefObject<HTMLInputElement>[] = [];
    function WithRef() {
      const { props } = useMask({ mask: '##/##/####', value: '', onChange: () => {} });
      capturedRefs.push(props.ref as React.RefObject<HTMLInputElement>);
      return <input {...props} data-testid="input" />;
    }
    render(<WithRef />);
    expect(capturedRefs[0]?.current).toBeInstanceOf(HTMLInputElement);
  });

  it('reset(): программная смена value форматирует и вызывает onChange — RHF синхронизирует store', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    const { rerender } = render(<RhfLikeField value="" onChange={spy} />);
    spy.mockClear();
    rerender(<RhfLikeField value="01012024" onChange={spy} />);
    expect(spy).toHaveBeenCalledOnce();
    expect(spy).toHaveBeenCalledWith('01/01/2024', expect.any(Object));
  });

  it('данные с бэка (без маски) при маунте: onChange вызывается сразу, RHF получает форматированное значение', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    render(<RhfLikeField value="31122025" onChange={spy} />);
    expect(spy).toHaveBeenCalledWith('31/12/2025', expect.any(Object));
    expect(getInput().value).toBe('31/12/2025');
  });

  it('если value уже форматировано — onChange при маунте не вызывается, лишних setState нет', () => {
    const spy = vi.fn<(v: string, p: ParsedValues) => void>();
    render(<RhfLikeField value="31/12/2025" onChange={spy} />);
    expect(spy).not.toHaveBeenCalled();
  });
});

type FormikFieldProps = {
  formValues: { date: string };
  setFieldValue: (name: string, value: string) => void;
};

function FormikLikeField({ formValues, setFieldValue }: FormikFieldProps) {
  const { props } = useMask({
    mask: '##/##/####',
    value: formValues.date,
    onChange: (val: string) => {
      setFieldValue('date', val);
    },
  });
  return <input {...props} data-testid="input" type="text" />;
}

describe('Formik — setFieldValue', () => {
  it('ввод вызывает setFieldValue с форматированным значением', () => {
    const formValues = { date: '' };
    const setFieldValue = vi.fn<(n: string, v: string) => void>((name, val) => {
      formValues[name as 'date'] = val;
    });
    render(<FormikLikeField formValues={formValues} setFieldValue={setFieldValue} />);
    const input = getInput();
    fireChangeAt(input, '1234', 4);
    expect(setFieldValue).toHaveBeenLastCalledWith('date', '12/34/____');
  });

  it('initialValues с неформатированным значением (данные с бэка) форматируются и синхронизируются', () => {
    const setFieldValue = vi.fn<(n: string, v: string) => void>();
    const { rerender } = render(<FormikLikeField formValues={{ date: '' }} setFieldValue={setFieldValue} />);
    setFieldValue.mockClear();
    rerender(<FormikLikeField formValues={{ date: '01012024' }} setFieldValue={setFieldValue} />);
    expect(setFieldValue).toHaveBeenCalledWith('date', '01/01/2024');
  });
});

function ZodLikeField({
  initialValue = '',
  onValidate,
}: {
  onValidate: (parsed: ParsedValues) => void;
  initialValue?: string;
}) {
  const [value, setValue] = useState(initialValue);
  const { props } = useMask({
    mask: '##/##/####',
    value,
    onChange(val: string, parsed: ParsedValues) {
      setValue(val);
      onValidate(parsed);
    },
  });
  return <input {...props} data-testid="input" type="text" />;
}

describe('Zod — parsedValues как источник для схем', () => {
  it('rawWithoutPrefix содержит только цифры — проходит z.string().regex(/^\\d*$/)', () => {
    const captured: ParsedValues[] = [];
    render(<ZodLikeField initialValue="01012024" onValidate={(p) => captured.push(p)} />);
    expect(captured.at(-1)?.rawWithoutPrefix).toMatch(/^\d*$/);
  });

  it('isMaskCompleted === true при полном вводе — refinement-гейт в zod superRefine', () => {
    const parsedList: ParsedValues[] = [];
    render(<ZodLikeField onValidate={(p) => parsedList.push(p)} />);
    const input = getInput();
    fireChangeAt(input, '01012024', 8);
    expect(parsedList.at(-1)?.isMaskCompleted).toBe(true);
  });

  it('isMaskCompleted === false при частичном вводе — superRefine добавляет ошибку', () => {
    const parsedList: ParsedValues[] = [];
    render(<ZodLikeField onValidate={(p) => parsedList.push(p)} />);
    const input = getInput();
    fireChangeAt(input, '0101', 4);
    expect(parsedList.at(-1)?.isMaskCompleted).toBe(false);
  });

  it('formattedWithoutPlaceholderChars обрезается по последней введённой цифре — удобно для display', () => {
    const captured: ParsedValues[] = [];
    render(<ZodLikeField onValidate={(p) => captured.push(p)} />);
    const input = getInput();
    fireChangeAt(input, '0101', 4);
    expect(captured.at(-1)?.formattedWithoutPlaceholderChars).toBe('01/01');
  });

  it('rawWithPrefix содержит цифры префикса + тело — правильное значение для сохранения в БД', () => {
    const captured: ParsedValues[] = [];
    render(<ZodLikeField initialValue="01012024" onValidate={(p) => captured.push(p)} />);
    expect(captured.at(-1)?.rawWithPrefix).toBe('01012024');
    expect(captured.at(-1)?.rawWithoutPrefix).toBe('01012024');
  });
});
