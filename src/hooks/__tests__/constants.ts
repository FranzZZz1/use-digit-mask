import { type PasteStripPrefix } from '../types';

export const PASTE_STRIP_PREFIX = {
  always: 'always',
  overflow: 'overflow',
} as const satisfies Record<PasteStripPrefix, PasteStripPrefix>;

export const PHONE_MASK = '+7 (###) ###-##-##';

export const PHONE_PREFIXES = ['+7', '8'];

export const PHONE_PREFIX_DIGITS = ['7', '8'];
