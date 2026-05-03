import { type PropRow } from '@/entities/prop-def/ui/PropTable/PropTable';
import { type PropDesc } from '@/shared/i18n';

export type PropDef = Omit<PropRow, 'description'>;

export const USE_MASK_PARAMS: PropDef[] = [
  { name: 'mask', type: 'string', required: true },
  { name: 'value', type: 'string', required: true },
  { name: 'onChange', type: '(value: string, parsed: ParsedValues) => void', required: true },
  { name: 'allowedPrefixes', type: 'string[]', default: '[]' },
  { name: 'placeholderChar', type: 'string', default: '"_"' },
  { name: 'normalize', type: '(digits: string) => string', default: 'undefined' },
  { name: 'activateOnFocus', type: 'boolean', default: 'false' },
  { name: 'deactivateOnEmptyBlur', type: 'boolean', default: 'false' },
  { name: 'trimMaskTail', type: 'boolean', default: 'false' },
];

export const USE_MASK_RETURN_PROPS: PropDef[] = [
  { name: 'props.value', type: 'string' },
  { name: 'props.ref', type: 'RefObject<HTMLInputElement>' },
  { name: 'props.onChange', type: 'ChangeEventHandler' },
  { name: 'props.onKeyDown', type: 'KeyboardEventHandler' },
  { name: 'props.onPaste', type: 'ClipboardEventHandler' },
  { name: 'props.onClick / onFocus / onBlur / onMouseDown', type: 'EventHandler' },
  { name: 'api.formatDigits', type: '(digits: string) => { text: string; digits: string }' },
  { name: 'api.getParsedValues', type: '(formatted?: string) => ParsedValues' },
];

export const USE_MASK_PARSED_VALUES: PropDef[] = [
  { name: 'prefix', type: 'string' },
  { name: 'rawWithPrefix', type: 'string' },
  { name: 'rawWithoutPrefix', type: 'string' },
  { name: 'formattedWithPrefix', type: 'string' },
  { name: 'formattedWithoutPrefix', type: 'string' },
  { name: 'formattedWithoutPlaceholderChars', type: 'string' },
  { name: 'isMaskCompleted', type: 'boolean' },
];

export function buildRows(defs: PropDef[], descs: PropDesc): PropRow[] {
  return defs.map((def) => ({ ...def, description: descs[def.name] ?? '' }));
}
