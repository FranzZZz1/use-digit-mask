import React, { useRef } from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useCountrySelect } from 'use-digit-mask';
import { describe, expect, it, vi } from 'vitest';

import { CountrySelectTest, PLANS } from './_helpers';

describe('useCountrySelect - select()', () => {
  it('select() вызывает onSelect с выбранным форматом', () => {
    const onSelect = vi.fn();
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect }));
    act(() => {
      result.current.toggle();
    });

    const ru = PLANS.find((p) => p.id === 'RU')!;
    act(() => {
      result.current.select(ru);
    });
    expect(onSelect).toHaveBeenCalledWith(ru);
  });

  it('select() закрывает дропдаун', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: vi.fn() }));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);

    act(() => {
      result.current.select(PLANS[0]);
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('select() сбрасывает поисковый запрос', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: vi.fn() }));
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.setQuery('ger');
    });
    expect(result.current.query).toBe('ger');

    act(() => {
      result.current.select(PLANS[0]);
    });
    expect(result.current.query).toBe('');
  });

  it('клик по элементу в DOM закрывает дропдаун', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: vi.fn() }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('item-RU'));
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });
});

describe('useCountrySelect - inputRef фокус после выбора', () => {
  it('после select() фокус возвращается на inputRef', () => {
    function WithFocus() {
      const inputRef = useRef<HTMLInputElement>(null);
      const hook = useCountrySelect({ allPlans: PLANS, onSelect: vi.fn(), inputRef });
      return (
        <div ref={hook.containerRef}>
          <button type="button" aria-label="Toggle" data-testid="trigger" onClick={hook.toggle} />
          {hook.isOpen && (
            <ul data-testid="dropdown">
              {hook.items.map((p) => (
                <li key={p.id}>
                  <button
                    type="button"
                    aria-label={p.label ?? p.id ?? p.cc}
                    data-testid={`item-${p.id}`}
                    onClick={() => {
                      hook.select(p);
                    }}
                  />
                </li>
              ))}
            </ul>
          )}
          <input ref={inputRef} data-testid="phone-input" />
        </div>
      );
    }

    render(<WithFocus />);
    const phoneInput = screen.getByTestId('phone-input');
    const focusSpy = vi.spyOn(phoneInput, 'focus');

    fireEvent.click(screen.getByTestId('trigger'));
    fireEvent.click(screen.getByTestId('item-US'));

    expect(focusSpy).toHaveBeenCalledTimes(1);
  });
});
