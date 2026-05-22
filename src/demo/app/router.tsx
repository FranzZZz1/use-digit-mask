import { createBrowserRouter, Navigate } from 'react-router-dom';

import { ChangelogView } from '@/pages/changelog';
import { DemoView } from '@/pages/demo';
import { UseCountrySelectDocView } from '@/pages/use-country-select-doc';
import { UseCountrySelectExamplesView } from '@/pages/use-country-select-examples';
import { UseMaskDocView } from '@/pages/use-mask-doc';
import { UseMaskExamplesView } from '@/pages/use-mask-examples';
import { UsePhoneMaskDocView } from '@/pages/use-phone-mask-doc';
import { UsePhoneMaskExamplesView } from '@/pages/use-phone-mask-examples';
import { PATHS, SEGMENTS } from '@/shared/router';
import { DocsLayout } from '@/widgets/docs-layout';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

function DocsRoot() {
  return (
    <>
      <Header />
      <DocsLayout />
      <Footer mobileNavOffset />
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
      path: PATHS.changelog,
      element: <ChangelogView />,
    },
    {
      path: PATHS.docs,
      element: <DocsRoot />,
      children: [
        { index: true, element: <Navigate replace to={SEGMENTS.useMask} /> },
        {
          path: SEGMENTS.useMask,
          children: [
            { index: true, element: <UseMaskDocView />, handle: { hook: 'useMask' } },
            { path: SEGMENTS.examples, element: <UseMaskExamplesView /> },
          ],
        },
        {
          path: SEGMENTS.usePhoneMask,
          children: [
            { index: true, element: <UsePhoneMaskDocView />, handle: { hook: 'usePhoneMask' } },
            { path: SEGMENTS.examples, element: <UsePhoneMaskExamplesView /> },
          ],
        },
        {
          path: SEGMENTS.useCountrySelect,
          children: [
            { index: true, element: <UseCountrySelectDocView />, handle: { hook: 'useCountrySelect' } },
            { path: SEGMENTS.examples, element: <UseCountrySelectExamplesView /> },
          ],
        },
      ],
    },
  ],
  { basename: import.meta.env.BASE_URL },
);
