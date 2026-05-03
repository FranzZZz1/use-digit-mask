import { type Translation } from '@/shared/i18n';
import { type CodeTab } from '@/shared/ui/CodeModal';

export type { CodeTab };
export type CodeComments = Translation['demo']['codeComments'];

export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  const raw = strings.reduce((acc, str, i) => acc + String(values[i - 1] ?? '') + str, '');
  const lines = raw.replace(/^\n/, '').split('\n');
  const indent = lines
    .filter((l) => l.trim().length > 0)
    .reduce((min, l) => Math.min(min, l.match(/^[ \t]*/)?.[0].length ?? 0), Infinity);
  return lines
    .map((l) => l.slice(indent))
    .join('\n')
    .replace(/\n[ \t]*$/, '');
}

export function tab(label: string, code: string): CodeTab {
  return { label, code };
}

export function numericInput(placeholder: string): string {
  return `    <input
      {...props}
      type="text"
      inputMode="numeric"
      placeholder="${placeholder}"
    />`;
}

type MaskTabOpts = {
  componentName: string;
  hookOptions: string[];
  jsx: string;
  hook?: string;
  destructure?: string;
  extraImports?: string;
};

function joinOpts(lines: string[]): string {
  return lines.map((l) => `    ${l}`).join('\n');
}

export function basicMaskTab(label: string, opts: MaskTabOpts): CodeTab {
  const { componentName, hookOptions, jsx, hook = 'useMask', destructure = '{ props }', extraImports } = opts;
  const imports = [
    "import { useState } from 'react';",
    ...(extraImports ? [extraImports] : []),
    `import { ${hook} } from 'use-digit-mask';`,
  ].join('\n');

  return tab(
    label,
    `${imports}

function ${componentName}() {
  const [value, setValue] = useState('');

  const ${destructure} = ${hook}({
${joinOpts(hookOptions)}
    value,
    onChange: setValue,
  });

  return (
${jsx}
  );
}`,
  );
}

export function rhfMaskTab(label: string, opts: MaskTabOpts & { fieldName: string }): CodeTab {
  const {
    componentName,
    hookOptions,
    jsx,
    hook = 'useMask',
    destructure = '{ props }',
    extraImports,
    fieldName,
  } = opts;
  const inputComp = `${componentName}Input`;
  const formComp = `${componentName}Form`;

  const imports = [
    "import { useController, useForm } from 'react-hook-form';",
    ...(extraImports ? [extraImports] : []),
    `import { ${hook} } from 'use-digit-mask';`,
  ].join('\n');

  return tab(
    label,
    `${imports}

function ${inputComp}({ control }) {
  const { field } = useController({
    name: '${fieldName}',
    control,
    defaultValue: '',
  });

  const ${destructure} = ${hook}({
${joinOpts(hookOptions)}
    value: field.value,
    onChange: field.onChange,
  });

  return (
${jsx}
  );
}

function ${formComp}() {
  const { control, handleSubmit } = useForm();

  return (
    <form onSubmit={handleSubmit(console.log)}>
      <${inputComp} control={control} />
      <button type="submit">Submit</button>
    </form>
  );
}`,
  );
}
