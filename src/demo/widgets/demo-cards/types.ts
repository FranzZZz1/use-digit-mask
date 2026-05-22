import { type ReactNode } from 'react';

import { type CodeTab } from '@/shared/ui/CodeModal';
import { type DemoCardVariant } from '@/shared/ui/DemoCard';

export type DemoCardConfig = {
  id: string;
  title: string;
  description?: string;
  component?: ReactNode;
  code?: CodeTab[];
  variants?: DemoCardVariant[];
};
