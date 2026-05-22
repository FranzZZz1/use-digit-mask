import { DEFAULT_GHOST_CHAR, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import { basicMaskTab, ghostOverlayJsx, numericInput } from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

export { GHOST_SCSS } from '@/shared/lib/snippetUtils';

function parseAllowedPrefixesLocal(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function buildHookOptions(mask: string, placeholderChar: string, state: OptionsState, withGhost: boolean): string[] {
  const lines: string[] = [`mask: '${mask}',`];

  const allowedPrefixes = state.allowedPrefixes as StrOptionState | undefined;
  if (allowedPrefixes?.enabled) {
    const prefixes = parseAllowedPrefixesLocal(allowedPrefixes.value);
    if (prefixes.length > 0) {
      lines.push(`allowedPrefixes: [${prefixes.map((p) => `'${p}'`).join(', ')}],`);
    }
  }
  if (placeholderChar && placeholderChar !== DEFAULT_PLACEHOLDER_CHAR) {
    lines.push(`placeholderChar: '${placeholderChar}',`);
  }
  if (state.activateOnFocus?.enabled) lines.push('activateOnFocus: true,');
  if (state.deactivateOnEmptyBlur?.enabled) lines.push('deactivateOnEmptyBlur: true,');
  if (state.trimMaskTail?.enabled) lines.push('trimMaskTail: true,');
  const ghostChar = state.ghostChar as StrOptionState | undefined;
  if (withGhost) lines.push(`ghostChar: '${ghostChar?.value || DEFAULT_GHOST_CHAR}',`);
  if (state.alwaysActive?.enabled) lines.push('alwaysActive: true,');

  return lines;
}

export function buildUseMaskCode(
  mask: string,
  placeholderChar: string,
  state: OptionsState,
  isAlternative: boolean,
): string {
  const withGhost = state.ghostChar?.enabled ?? false;

  const codeTab = basicMaskTab('tsx', {
    componentName: 'CustomInput',
    hookOptions: buildHookOptions(mask, placeholderChar, state, withGhost),
    jsx: withGhost ? ghostOverlayJsx() : numericInput(),
    destructure: withGhost ? '{ props, ghostValue }' : '{ props }',
    extraImports: withGhost ? "import styles from './CustomInput.module.scss';" : undefined,
  });

  return !isAlternative ? codeTab.code : (codeTab.codeJs ?? codeTab.code);
}
