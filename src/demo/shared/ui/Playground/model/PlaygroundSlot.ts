import { type ReactNode } from 'react';

import { type CodeTab } from '@/shared/lib/snippetUtils';

import { type OptionSchema } from './types';
import { type UsePlaygroundStateReturn } from './usePlaygroundState';

export type PlaygroundSlot = {
  pg: UsePlaygroundStateReturn;
  schema: OptionSchema;
  tabs: CodeTab[];
  preview: ReactNode;
  primaryFields?: ReactNode;
};
