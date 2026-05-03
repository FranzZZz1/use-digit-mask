import { act, renderHook } from '@testing-library/react';
import { useCountrySelect } from 'use-digit-mask';
import { describe, expect, it, vi } from 'vitest';

import { PLANS } from './_helpers';

const noop = vi.fn();

describe('useCountrySelect - поиск', () => {
  it('пустой запрос -> возвращает все планы в idle-порядке', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    expect(result.current.items).toHaveLength(PLANS.length);
  });

  it('запрос по label (частичное совпадение) -> фильтрует список', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('united');
    });
    const ids = result.current.items.map((p) => p.id);
    expect(ids).toContain('US');
    expect(ids).toContain('GB');
    expect(ids).not.toContain('RU');
    expect(ids).not.toContain('DE');
  });

  it('поиск нечувствителен к регистру', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('GERMANY');
    });
    expect(result.current.items.map((p) => p.id)).toEqual(['DE']);
  });

  it('запрос по dial code (+44) -> фильтрует по cc', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('+44');
    });
    expect(result.current.items.map((p) => p.id)).toEqual(['GB']);
  });

  it('запрос по cc без плюса ("44") -> фильтрует по "+cc"', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('44');
    });
    const ids = result.current.items.map((p) => p.id);
    expect(ids).toContain('GB');
  });

  it('несуществующий запрос -> пустой список', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('zzznomatch');
    });
    expect(result.current.items).toHaveLength(0);
  });

  it('во время поиска dividerAfter=-1 (даже с priorityIds)', () => {
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: null, priorityIds: ['US', 'GB'] }),
    );
    act(() => {
      result.current.setQuery('ru');
    });
    expect(result.current.dividerAfter).toBe(-1);
  });

  it('close() сбрасывает query и возвращает полный список', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('ger');
    });
    expect(result.current.items).toHaveLength(1);

    act(() => {
      result.current.close();
    });
    expect(result.current.query).toBe('');
    expect(result.current.items).toHaveLength(PLANS.length);
  });

  it('пробелы в начале/конце запроса обрезаются', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.setQuery('  germany  ');
    });
    expect(result.current.items.map((p) => p.id)).toEqual(['DE']);
  });
});
