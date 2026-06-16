import { DEFAULT_PLACEHOLDER_CHAR } from '@/shared/lib';
import {
  buildMaskCodeTab,
  ghostOverlayJsx,
  type HookArg,
  type ImportSpec,
  type MaskTabOpts,
  numericInput,
  rawCode,
} from '@/shared/lib/snippetUtils';
import { type OptionsState, type StrOptionState } from '@/shared/ui/Playground';

import { pushBoolArg, readGhostState } from '../shared/buildCode';

export type BlockConstraintRecord = Record<string, { min?: number; max?: number } | null>;

function serializeBlocksArg(blocks: BlockConstraintRecord): HookArg {
  const lines = Object.entries(blocks).map(([key, c]) => {
    if (c === null) return `      ${key}: null`;
    const parts: string[] = [];
    if (c.min !== undefined) parts.push(`min: ${c.min}`);
    if (c.max !== undefined) parts.push(`max: ${c.max}`);
    return `      ${key}: { ${parts.join(', ')} }`;
  });
  return { key: 'blocks', value: rawCode(`{\n${lines.join(',\n')}\n    }`) };
}

function parsePrefixAliases(str: string): string[] {
  return str
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function collectUseMaskArgs(
  mask: string,
  placeholderChar: string,
  state: OptionsState,
  withGhost: boolean,
  ghostCharValue: string,
  blocks?: BlockConstraintRecord,
): HookArg[] {
  const args: HookArg[] = [{ key: 'mask', value: mask }];

  if (blocks && Object.keys(blocks).length > 0) {
    args.push(serializeBlocksArg(blocks));
  }

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

  pushBoolArg(args, state, 'activateOnFocus');
  pushBoolArg(args, state, 'deactivateOnEmptyBlur');
  pushBoolArg(args, state, 'trimMaskTail');
  pushBoolArg(args, state, 'overwrite');
  pushBoolArg(args, state, 'bypassMask');

  if (withGhost) {
    args.push({ key: 'ghostChar', value: ghostCharValue });
  }

  pushBoolArg(args, state, 'alwaysActive');

  return args;
}

export function buildUseMaskTab(
  mask: string,
  placeholderChar: string,
  state: OptionsState,
  blocks?: BlockConstraintRecord,
) {
  const { withGhost, ghostCharValue } = readGhostState(state);

  const extraImports: ImportSpec[] = withGhost
    ? [{ from: './CustomInput.module.scss', default: 'styles', isStyle: true }]
    : [];

  const tabOpts: MaskTabOpts = {
    componentName: 'CustomInput',
    hookOptions: collectUseMaskArgs(mask, placeholderChar, state, withGhost, ghostCharValue, blocks),
    jsx: withGhost ? ghostOverlayJsx() : numericInput(),
    destructure: withGhost ? '{ props, ghostValue }' : '{ props }',
    extraImports,
  };

  return buildMaskCodeTab('tsx', tabOpts);
}
