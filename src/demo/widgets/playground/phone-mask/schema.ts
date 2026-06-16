import { type OptionSchema } from '@/shared/ui/Playground';

import {
  ENTRY_GHOST_CHAR,
  ENTRY_GHOST_ONLY_WHEN_RESOLVED,
  ENTRY_OVERWRITE,
  type GhostOptions,
  type OverwriteOption,
} from '../shared/schema';

export const USEPHONE_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail', alwaysSerialize: true },
  ENTRY_OVERWRITE,
  { type: 'divider' },
  ENTRY_GHOST_CHAR,
  ENTRY_GHOST_ONLY_WHEN_RESOLVED,
];

export type UsePhoneMaskOptions = OverwriteOption &
  GhostOptions & {
    trimMaskTail?: boolean;
    placeholderChar?: string;
  };
