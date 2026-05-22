import { type ReactNode } from 'react';

import { type OptionSchema } from './types';
import { type UsePlaygroundStateReturn } from './usePlaygroundState';

export type PlaygroundTab = {
  label: string;
  code: string;
  lang: string;
  hasJsVariant: boolean;
};

export type PlaygroundSlot = {
  pg: UsePlaygroundStateReturn;
  schema: OptionSchema;
  tabs: PlaygroundTab[];
  preview: ReactNode;
  primaryFields?: ReactNode;
};
