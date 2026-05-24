import { type Translation } from '@/shared/i18n';

import { type HookOption, renderHookOptions } from './hook-args';
import { buildImportBlock, type ImportSpec } from './imports';
import { GHOST_SCSS } from './jsx-fragments';
import { type CodeTab, indentLines } from './primitives';

export type CodeComments = Translation['demo']['codeComments'];

export type MaskTabOpts = {
  componentName: string;
  /** Hook options block. Pass HookArg for typed values, or a raw string for comments / pre-formatted lines. */
  hookOptions: HookOption[];
  jsx: string;
  hook?: string;
  destructure?: string;
  extraImports?: ImportSpec[];
  /** Variable declarations inserted between the hook call and the return statement. */
  extraVars?: string[];
};

export type RhfMaskTabOpts = MaskTabOpts & { fieldName: string };

function buildComponentSource(opts: MaskTabOpts, ts: boolean): string {
  const {
    componentName,
    hookOptions,
    jsx,
    hook: hookName = 'useMask',
    destructure = '{ props }',
    extraImports = [],
    extraVars = [],
  } = opts;

  const imports = buildImportBlock([
    { from: 'react', named: ['useState'] },
    ...extraImports,
    { from: 'use-digit-mask', named: [hookName] },
  ]);

  const optsBlock = hookOptions.length > 0 ? `${renderHookOptions(hookOptions)}\n` : '';
  const extraVarsBlock = extraVars.length > 0 ? `\n\n  ${extraVars.join('\n  ')}` : '';

  return `${imports}

function ${componentName}() {
  const [value, setValue] = useState${ts ? '<string>' : ''}('');

  const ${destructure} = ${hookName}({
${optsBlock}    value,
    onChange: setValue,
  });${extraVarsBlock}

  return (
${indentLines(jsx, 4)}
  );
}`;
}

export function buildMaskCodeTab(label: string, opts: MaskTabOpts): CodeTab {
  return {
    label,
    code: buildComponentSource(opts, true),
    jsVariant: buildComponentSource(opts, false),
  };
}

export function withGhostScssTab(tabs: CodeTab[], hasGhost: boolean, scss: string = GHOST_SCSS): CodeTab[] {
  return hasGhost ? [...tabs, { label: 'scss', code: scss, lang: 'scss' }] : tabs;
}

function buildRhfComponentSource(opts: RhfMaskTabOpts, ts: boolean): string {
  const {
    componentName,
    hookOptions,
    jsx,
    hook: hookName = 'useMask',
    destructure = '{ props }',
    extraImports = [],
    extraVars = [],
    fieldName,
  } = opts;

  const inputComp = `${componentName}Input`;
  const formComp = `${componentName}Form`;
  const formType = `${componentName}Values`;

  const imports = buildImportBlock([
    {
      from: 'react-hook-form',
      named: ts ? ['useController', 'useForm', 'type Control'] : ['useController', 'useForm'],
    },
    ...extraImports,
    { from: 'use-digit-mask', named: [hookName] },
  ]);

  const optsBlock = hookOptions.length > 0 ? `${renderHookOptions(hookOptions)}\n` : '';
  const extraVarsBlock = extraVars.length > 0 ? `\n\n  ${extraVars.join('\n  ')}` : '';
  const typeDecl = ts ? `\ntype ${formType} = { ${fieldName}: string };\n` : '';
  const controlProp = ts ? `{ control }: { control: Control<${formType}> }` : '{ control }';

  return `${imports}
${typeDecl}
function ${inputComp}(${controlProp}) {
  const { field } = useController({
    name: '${fieldName}',
    control,
    defaultValue: '',
  });

  const ${destructure} = ${hookName}({
${optsBlock}    value: field.value,
    onChange: field.onChange,
  });${extraVarsBlock}

  return (
${indentLines(jsx, 4)}
  );
}

function ${formComp}() {
  const { control, handleSubmit } = useForm${ts ? `<${formType}>` : ''}();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <${inputComp} control={control} />
      <button type="submit">Submit</button>
    </form>
  );
}`;
}

export function rhfMaskTab(label: string, opts: RhfMaskTabOpts): CodeTab {
  return {
    label,
    code: buildRhfComponentSource(opts, true),
    jsVariant: buildRhfComponentSource(opts, false),
  };
}
