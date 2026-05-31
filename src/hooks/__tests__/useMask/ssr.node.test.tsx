import React from 'react';
import { renderToString } from 'react-dom/server';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { useMask } from '../../useMask';
import { PHONE_MASK } from '../constants';

function Field({ mask, value }: { mask: string; value: string }) {
  const { props } = useMask({ mask, value, onChange: () => {} });
  return <input {...props} />;
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe('SSR (node, без document)', () => {
  it('renderToString содержит отформатированное значение', () => {
    const html = renderToString(<Field mask="##/##/####" value="01012024" />);
    expect(html).toContain('01/01/2024');
  });

  it('renderToString не выводит варнингов React (изоморфный layout-effect)', () => {
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    renderToString(<Field mask={PHONE_MASK} value="9991234567" />);
    expect(errorSpy).not.toHaveBeenCalled();
  });

  it('пустое value не падает и даёт пустой input', () => {
    const html = renderToString(<Field mask="##/##/####" value="" />);
    expect(html).toContain('value=""');
  });
});
