import { createHashRouter } from 'react-router-dom';

import { DemoPage } from '../pages/DemoPage';

export const router = createHashRouter([
  {
    path: '/',
    element: <DemoPage />,
  },
]);
