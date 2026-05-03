import { createBrowserRouter, Navigate } from 'react-router-dom';

import { DemoView } from '@/pages/demo';
import { UseCountrySelectDocView } from '@/pages/use-country-select-doc';
import { UseMaskDocView } from '@/pages/use-mask-doc';
import { UsePhoneMaskDocView } from '@/pages/use-phone-mask-doc';
import { PATHS, SEGMENTS } from '@/shared/router';
import { DocsLayout } from '@/widgets/docs-layout';
import { Header } from '@/widgets/header';

function DocsRoot() {
  return (
    <>
      <Header />
      <DocsLayout />
    </>
  );
}

export const router = createBrowserRouter(
  [
    {
      path: PATHS.home,
      element: <DemoView />,
    },
    {
      path: PATHS.docs,
      element: <DocsRoot />,
      children: [
        { index: true, element: <Navigate replace to={SEGMENTS.useMask} /> },
        {
          path: SEGMENTS.useMask,
          element: <UseMaskDocView />,
          handle: { hook: 'useMask' },
        },
        {
          path: SEGMENTS.usePhoneMask,
          element: <UsePhoneMaskDocView />,
          handle: { hook: 'usePhoneMask' },
        },
        {
          path: SEGMENTS.useCountrySelect,
          element: <UseCountrySelectDocView />,
          handle: { hook: 'useCountrySelect' },
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
