import { type OptionSchema } from '@/shared/ui/Playground';

import { ENTRY_GHOST_CHAR, ENTRY_OVERWRITE, type GhostCharOption, type OverwriteOption } from '../shared/schema';

function parseCommaSeparated(v: string): string[] | null {
  const items = v
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return items.length > 0 ? items : null;
}

export const USEMASK_SCHEMA: OptionSchema = [
  { type: 'bool', key: 'trimMaskTail' },
  { type: 'bool', key: 'alwaysActive' },
  { type: 'bool', key: 'activateOnFocus' },
  { type: 'bool', key: 'deactivateOnEmptyBlur', requiresParent: 'activateOnFocus' },
  ENTRY_OVERWRITE,
  { type: 'bool', key: 'bypassMask' },
  { type: 'divider' },
  { type: 'str', key: 'prefixAliases', placeholder: '+7, 8', defaultValue: '+7, 8', transform: parseCommaSeparated },
  ENTRY_GHOST_CHAR,
];

export type UseMaskOptions = OverwriteOption &
  GhostCharOption & {
    prefixAliases?: string[];
    placeholderChar?: string;
    activateOnFocus?: boolean;
    deactivateOnEmptyBlur?: boolean;
    trimMaskTail?: boolean;
    alwaysActive?: boolean;
    bypassMask?: boolean;
  };
