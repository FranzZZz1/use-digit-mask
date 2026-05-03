import React from 'react';
import { act, fireEvent, render, renderHook, screen } from '@testing-library/react';
import { useCountrySelect } from 'use-digit-mask';
import { describe, expect, it, vi } from 'vitest';

import { CountrySelectTest, PLANS } from './_helpers';

const noop = vi.fn();

describe('useCountrySelect - состояние открытия', () => {
  it('isOpen изначально false', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    expect(result.current.isOpen).toBe(false);
  });

  it('toggle() открывает дропдаун', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(true);
  });

  it('повторный toggle() закрывает дропдаун', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.toggle();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('close() закрывает дропдаун', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.close();
    });
    expect(result.current.isOpen).toBe(false);
  });

  it('close() сбрасывает поисковый запрос', () => {
    const { result } = renderHook(() => useCountrySelect({ allPlans: PLANS, onSelect: noop }));
    act(() => {
      result.current.toggle();
    });
    act(() => {
      result.current.setQuery('ger');
    });
    expect(result.current.query).toBe('ger');

    act(() => {
      result.current.close();
    });
    expect(result.current.query).toBe('');
  });
});

describe('useCountrySelect - закрытие по Escape', () => {
  it('Escape закрывает открытый дропдаун', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: noop }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  it('Escape не закрывает когда noInternalListeners=true', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: noop, noInternalListeners: true }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.keyDown(document, { key: 'Escape' });
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });
});

describe('useCountrySelect - закрытие по клику вне', () => {
  it('mousedown вне containerRef закрывает дропдаун', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: noop }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.queryByTestId('dropdown')).not.toBeInTheDocument();
  });

  it('mousedown внутри containerRef не закрывает дропдаун', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: noop }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('container'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });

  it('mousedown вне не закрывает когда noInternalListeners=true', () => {
    render(<CountrySelectTest props={{ allPlans: PLANS, onSelect: noop, noInternalListeners: true }} />);
    fireEvent.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();

    fireEvent.mouseDown(screen.getByTestId('outside'));
    expect(screen.getByTestId('dropdown')).toBeInTheDocument();
  });
});
