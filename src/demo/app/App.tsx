import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';

import { LangProvider } from '@/shared/i18n';

import { router } from './router';

export function App() {
  useEffect(() => {
    if ('scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  return (
    <LangProvider>
      <RouterProvider router={router} />
    </LangProvider>
  );
}
