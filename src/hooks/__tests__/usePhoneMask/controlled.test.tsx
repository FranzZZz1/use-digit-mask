import React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { ControlledPhone, getInput } from './_helpers';

describe('usePhoneMask - контролируемый режим (value prop)', () => {
  it('внешнее значение отображается корректно', () => {
    const noop = () => {};
    render(<ControlledPhone value="+7 (999) 123-45-67" onChange={noop} />);
    expect(getInput().value).toBe('+7 (999) 123-45-67');
  });

  it('внешний сброс value="" очищает поле', () => {
    const noop = () => {};
    const { rerender } = render(<ControlledPhone value="+7 (999) 123-45-67" onChange={noop} />);
    expect(getInput().value).toBe('+7 (999) 123-45-67');

    rerender(<ControlledPhone value="" onChange={noop} />);
    expect(getInput().value).toBe('');
  });
});
