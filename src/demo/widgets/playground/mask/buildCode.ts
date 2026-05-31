import { DEFAULT_GHOST_CHAR, DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import {
  buildMaskCodeTab,
  ghostOverlayJsx,
  type HookArg,
  type ImportSpec,
  type MaskTabOpts,
  numericInput,
} from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

function parsePrefixAliases(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function collectUseMaskArgs(mask: string, placeholderChar: string, state: OptionsState, withGhost: boolean): HookArg[] {
  const args: HookArg[] = [{ key: 'mask', value: mask }];

  const prefixAliases = state.prefixAliases as StrOptionState | undefined;
  if (prefixAliases?.enabled) {
    const prefixes = parsePrefixAliases(prefixAliases.value);
    if (prefixes.length > 0) {
      args.push({ key: 'prefixAliases', value: prefixes });
    }
  }

  if (placeholderChar && placeholderChar !== DEFAULT_PLACEHOLDER_CHAR) {
    args.push({ key: 'placeholderChar', value: placeholderChar });
  }

  if (state.activateOnFocus?.enabled) args.push({ key: 'activateOnFocus', value: true });
  if (state.deactivateOnEmptyBlur?.enabled) args.push({ key: 'deactivateOnEmptyBlur', value: true });
  if (state.trimMaskTail?.enabled) args.push({ key: 'trimMaskTail', value: true });

  if (withGhost) {
    const ghostChar = (state.ghostChar as StrOptionState | undefined)?.value || DEFAULT_GHOST_CHAR;
    args.push({ key: 'ghostChar', value: ghostChar });
  }

  if (state.alwaysActive?.enabled) args.push({ key: 'alwaysActive', value: true });

  return args;
}

export function buildUseMaskTab(mask: string, placeholderChar: string, state: OptionsState) {
  const withGhost = state.ghostChar?.enabled ?? false;

  const extraImports: ImportSpec[] = withGhost
    ? [{ from: './CustomInput.module.scss', default: 'styles', isStyle: true }]
    : [];

  const tabOpts: MaskTabOpts = {
    componentName: 'CustomInput',
    hookOptions: collectUseMaskArgs(mask, placeholderChar, state, withGhost),
    jsx: withGhost ? ghostOverlayJsx() : numericInput(),
    destructure: withGhost ? '{ props, ghostValue }' : '{ props }',
    extraImports,
  };

  return buildMaskCodeTab('tsx', tabOpts);
}
