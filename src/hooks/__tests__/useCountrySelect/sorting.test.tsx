import { act, renderHook } from '@testing-library/react';
import { useCountrySelect } from 'use-digit-mask';
import { describe, expect, it, vi } from 'vitest';

import { makeCandidate, PLANS } from './_helpers';

const noop = vi.fn();

describe('useCountrySelect - currentPlan', () => {
  it('currentId совпадает с форматом -> возвращает currentPlan', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'RU' }));
    expect(result.current.currentPlan?.id).toBe('RU');
  });

  it('currentId=null -> currentPlan=undefined', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: null }));
    expect(result.current.currentPlan).toBeUndefined();
  });

  it('currentId не совпадает ни с одним форматом -> currentPlan=undefined', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'XX' }));
    expect(result.current.currentPlan).toBeUndefined();
  });
});

describe('useCountrySelect - сортировка без опций', () => {
  it('без priorityIds и candidates -> естественный порядок, dividerAfter=-1', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    expect(result.current.items.map((p) => p.id)).toEqual(['US', 'GB', 'RU', 'DE', 'FR']);
    expect(result.current.dividerAfter).toBe(-1);
  });
});

describe('useCountrySelect - priorityIds (динамический режим)', () => {
  it('currentId=null + priorityIds -> приоритетные форматы всплывают наверх', () => {
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: null, priorityIds: ['RU', 'US'] }),
    );
    const ids = result.current.items.map((p) => p.id);
    expect(ids[0]).toBe('RU');
    expect(ids[1]).toBe('US');
    expect(result.current.dividerAfter).toBe(2);
  });

  it('порядок в items соответствует порядку priorityIds, а не allPlans', () => {
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: null, priorityIds: ['FR', 'DE', 'GB'] }),
    );
    const ids = result.current.items.slice(0, 3).map((p) => p.id);
    expect(ids).toEqual(['FR', 'DE', 'GB']);
  });

  it('currentId не null, нет кандидатов -> pins не всплывают, dividerAfter=-1', () => {
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'US', priorityIds: ['RU', 'GB'] }),
    );
    expect(result.current.dividerAfter).toBe(-1);
    expect(result.current.items[0].id).toBe('US');
  });
});

describe('useCountrySelect - candidates (множественная неопределённость)', () => {
  it('2 кандидата -> всплывают наверх, dividerAfter=2', () => {
    const candidates = [makeCandidate('RU', '7'), makeCandidate('DE', '49')];
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'RU', candidates }),
    );
    const ids = result.current.items.slice(0, 2).map((p) => p.id);
    expect(ids).toContain('RU');
    expect(ids).toContain('DE');
    expect(result.current.dividerAfter).toBe(2);
  });

  it('1 кандидат -> не всплывает (нет неопределённости), dividerAfter=-1', () => {
    const candidates = [makeCandidate('RU', '7')];
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'RU', candidates }),
    );
    expect(result.current.dividerAfter).toBe(-1);
  });

  it('0 кандидатов -> dividerAfter=-1', () => {
    const { result } = renderHook(() =>
      useCountrySelect({ allPlans: PLANS, onSelect: noop, currentId: 'US', candidates: [] }),
    );
    expect(result.current.dividerAfter).toBe(-1);
  });
});

describe('useCountrySelect - stickyPins', () => {
  it('stickyPins=true -> priorityIds закреплены даже при не-null currentId', () => {
    const { result } = renderHook(() =>
      useCountrySelect({
        allPlans: PLANS,
        onSelect: noop,
        currentId: 'US',
        priorityIds: ['GB', 'FR'],
        stickyPins: true,
      }),
    );
    const ids = result.current.items.map((p) => p.id);
    expect(ids[0]).toBe('GB');
    expect(ids[1]).toBe('FR');
    expect(result.current.dividerAfter).toBe(2);
  });

  it('stickyPins=true + 2 кандидата не в pins -> всплывают сразу после pins', () => {
    const candidates = [makeCandidate('RU', '7'), makeCandidate('DE', '49')];
    const { result } = renderHook(() =>
      useCountrySelect({
        allPlans: PLANS,
        onSelect: noop,
        currentId: 'RU',
        priorityIds: ['US', 'GB'],
        stickyPins: true,
        candidates,
      }),
    );
    const ids = result.current.items.map((p) => p.id);
    // Pins: US, GB -> затем кандидаты RU, DE -> остальные
    expect(ids[0]).toBe('US');
    expect(ids[1]).toBe('GB');
    expect(ids).toContain('RU');
    expect(ids).toContain('DE');
    // Кандидаты должны идти сразу после pins (индексы 2 и 3)
    expect(ids.slice(2, 4)).toContain('RU');
    expect(ids.slice(2, 4)).toContain('DE');
    expect(result.current.dividerAfter).toBe(2);
  });

  it('stickyPins=true + кандидат уже в pins -> не дублируется', () => {
    const candidates = [makeCandidate('US', '1'), makeCandidate('RU', '7')];
    const { result } = renderHook(() =>
      useCountrySelect({
        allPlans: PLANS,
        onSelect: noop,
        currentId: 'US',
        priorityIds: ['US', 'GB'],
        stickyPins: true,
        candidates,
      }),
    );
    const ids = result.current.items.map((p) => p.id);
    // US должен встречаться только один раз
    expect(ids.filter((id) => id === 'US')).toHaveLength(1);
  });
});

describe('useCountrySelect - disableSort', () => {
  it('disableSort=true -> всегда естественный порядок, dividerAfter=-1', () => {
    const candidates = [makeCandidate('RU', '7'), makeCandidate('DE', '49')];
    const { result } = renderHook(() =>
      useCountrySelect({
        allPlans: PLANS,
        onSelect: noop,
        currentId: null,
        priorityIds: ['GB', 'FR'],
        candidates,
        disableSort: true,
      }),
    );
    expect(result.current.items.map((p) => p.id)).toEqual(['US', 'GB', 'RU', 'DE', 'FR']);
    expect(result.current.dividerAfter).toBe(-1);
  });

  it('disableSort=true, но поиск всё равно фильтрует', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop, disableSort: true }));
    act(() => {
      result.current.setQuery('ger');
    });
    expect(result.current.items.map((p) => p.id)).toEqual(['DE']);
  });
});
