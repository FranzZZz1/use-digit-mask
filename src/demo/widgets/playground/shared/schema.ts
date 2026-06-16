import { DEFAULT_GHOST_CHAR } from '@/shared/lib';
import { type OptionSchema } from '@/shared/ui/Playground';

export const ENTRY_OVERWRITE: OptionSchema[number] = { type: 'bool', key: 'overwrite' };

export const ENTRY_GHOST_CHAR: OptionSchema[number] = {
  type: 'str',
  key: 'ghostChar',
  placeholder: DEFAULT_GHOST_CHAR,
  maxLength: 1,
  defaultValue: DEFAULT_GHOST_CHAR,
  fallback: DEFAULT_GHOST_CHAR,
};

export const ENTRY_GHOST_ONLY_WHEN_RESOLVED: OptionSchema[number] = {
  type: 'bool',
  key: 'ghostOnlyWhenResolved',
  requiresParent: 'ghostChar',
};

export type OverwriteOption = { overwrite?: boolean };
export type GhostCharOption = { ghostChar?: string };
export type GhostOnlyWhenResolvedOption = { ghostOnlyWhenResolved?: boolean };
export type GhostOptions = GhostCharOption & GhostOnlyWhenResolvedOption;
