import { type PropControl, type PropRow } from '@/entities/prop-def/ui/PropTable/PropTable';
import { type PropDesc } from '@/shared/i18n';
import { DEFAULT_MASK } from '@/shared/lib';

export type PropDef = Omit<PropRow, 'description'>;

const bool: PropControl = { kind: 'boolean' };
const str = (placeholder?: string, maxLength?: number): PropControl => ({ kind: 'string', placeholder, maxLength });
const arr = (placeholder?: string): PropControl => ({ kind: 'stringArray', placeholder });
const blocks: PropControl = { kind: 'blocks' };

export const USE_MASK_PARAMS: PropDef[] = [
  { name: 'mask', type: 'string | ((digits: string) => string)', required: true, control: str(DEFAULT_MASK) },
  { name: 'value', type: 'string', required: true },
  { name: 'onChange', type: '(value: string, parsed: ParsedValues) => void', required: true },
  { name: 'onComplete', type: '(parsed: ParsedValues) => void', default: 'undefined' },
  { name: 'blocks', type: 'Block[] | Record<string, NamedBlock>', default: 'undefined', control: blocks },
  { name: 'overwrite', type: 'boolean', default: 'false', control: bool },
  { name: 'prefixAliases', type: 'string[]', default: '[]', control: arr('+7, 8') },
  { name: 'placeholderChar', type: 'string', default: '"_"', control: str('_', 1) },
  { name: 'inputMode', type: '"numeric" | "tel" | "decimal" | "none" | "text"', default: '"numeric"' },
  { name: 'bypassMask', type: 'boolean | ((value: string) => boolean)', default: 'false', control: bool },
  { name: 'normalize', type: '(digits: string, blockValues: string[]) => string', default: 'undefined' },
  { name: 'activateOnFocus', type: 'boolean', default: 'false', control: bool },
  { name: 'deactivateOnEmptyBlur', type: 'boolean', default: 'false', control: bool },
  { name: 'trimMaskTail', type: 'boolean', default: 'false', control: bool },
  { name: 'ghostChar', type: 'string', default: 'placeholderChar', control: str('·', 1) },
  { name: 'alwaysActive', type: 'boolean', default: 'false', control: bool },
  { name: 'historyLimit', type: 'number', default: '100' },
  { name: 'pasteStripPrefix', type: '"overflow" | "always"', default: '"overflow"' },
];

export const USE_MASK_RETURN_PROPS: PropDef[] = [
  { name: 'ghostValue', type: 'string' },
  { name: 'props.value', type: 'string' },
  { name: 'props.ref', type: 'RefObject<HTMLInputElement>' },
  { name: 'props.onChange', type: 'ChangeEventHandler' },
  { name: 'props.onKeyDown', type: 'KeyboardEventHandler' },
  { name: 'props.onPaste', type: 'ClipboardEventHandler' },
  { name: 'props.onClick / onFocus / onBlur / onMouseDown', type: 'EventHandler' },
  { name: 'api.formatDigits', type: '(digits: string) => { text: string; digits: string }' },
  { name: 'api.getParsedValues', type: '(formatted?: string) => ParsedValues' },
  { name: 'api.undo', type: '() => void' },
  { name: 'api.redo', type: '() => void' },
  { name: 'api.canUndo', type: 'boolean' },
  { name: 'api.canRedo', type: 'boolean' },
];

export const USE_MASK_PARSED_VALUES: PropDef[] = [
  { name: 'prefix', type: 'string' },
  { name: 'rawWithPrefix', type: 'string' },
  { name: 'rawWithoutPrefix', type: 'string' },
  { name: 'formattedWithPrefix', type: 'string' },
  { name: 'formattedWithoutPrefix', type: 'string' },
  { name: 'formattedWithoutPlaceholderChars', type: 'string' },
  { name: 'isMaskCompleted', type: 'boolean' },
  { name: 'blockValues', type: 'string[]' },
  { name: 'namedBlockValues', type: 'Record<string, string>' },
];

export function buildRows(defs: PropDef[], descs: PropDesc): PropRow[] {
  return defs.map((def) => ({ ...def, description: descs[def.name] ?? '' }));
}
