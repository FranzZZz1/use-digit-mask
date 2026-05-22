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

export function tab(label: string, code: string, lang?: string): CodeTab {
  return lang ? { label, code, lang } : { label, code };
}

export function indentLines(str: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((l) => (l ? `${pad}${l}` : l))
    .join('\n');
}

export function numericInput(placeholder?: string): string {
  const placeholderAttr = placeholder ? `\n  placeholder="${placeholder}"` : '';
  return `<input
  {...props}
  type="text"
  inputMode="numeric"${placeholderAttr}
/>`;
}

export const GHOST_SCSS = dedent`
  .wrapper {
    position: relative;
  }

  .overlay {
    pointer-events: none;
    user-select: none;

    position: absolute;
    z-index: 2;
    inset: 0;

    overflow: hidden;
    display: flex;
    align-items: center;

    padding: 0 12px;

    font-size: inherit;
    white-space: pre;
  }

  .overlay__filled {
    color: transparent;
  }

  .overlay__empty {
    color: rgb(128 128 128 / 50%);
  }
`;

export function ghostOverlayJsx(placeholder?: string, extraCondition?: string): string {
  const placeholderAttr = placeholder ? `\n        placeholder="${placeholder}"` : '';
  const condition = extraCondition ? `${extraCondition} && ghostValue` : 'ghostValue';
  return dedent`
    <div className={styles.wrapper}>
      <input
        {...props}
        type="text"
        inputMode="numeric"${placeholderAttr}
      />
      {${condition} && (
        <span aria-hidden="true" className={styles.overlay}>
          <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
          <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
        </span>
      )}
    </div>
  `;
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

function buildImportBlock(lines: string[]): string {
  const CSS_RE = /\.s?css['"]/;
  const DIGIT_MASK_RE = /from\s+'use-digit-mask'/;

  const digitMaskSymbols: string[] = [];
  const styleLines: string[] = [];
  const otherLines: string[] = [];

  lines
    .map((l) => l.trim())
    .filter(Boolean)
    .forEach((line) => {
      if (DIGIT_MASK_RE.test(line)) {
        const match = /import\s*\{([^}]+)\}/.exec(line);
        if (match) {
          digitMaskSymbols.push(
            ...match[1]
              .split(',')
              .map((s) => s.trim())
              .filter(Boolean),
          );
        }
      } else if (CSS_RE.test(line)) {
        styleLines.push(line);
      } else {
        otherLines.push(line);
      }
    });

  const hookImport = `import { ${[...new Set(digitMaskSymbols)].join(', ')} } from 'use-digit-mask';`;
  const mainBlock = [...otherLines, hookImport].join('\n');

  return styleLines.length > 0 ? `${mainBlock}\n\n${styleLines.join('\n')}` : mainBlock;
}

export function basicMaskTab(label: string, opts: MaskTabOpts): CodeTab {
  const { componentName, hookOptions, jsx, hook = 'useMask', destructure = '{ props }', extraImports } = opts;

  function build(ts: boolean): string {
    const imports = buildImportBlock([
      "import { useState } from 'react';",
      ...(extraImports ? extraImports.split('\n').filter(Boolean) : []),
      `import { ${hook} } from 'use-digit-mask';`,
    ]);

    const optsBlock = hookOptions.length > 0 ? `${joinOpts(hookOptions)}\n` : '';

    return `${imports}

function ${componentName}() {
  const [value, setValue] = useState${ts ? '<string>' : ''}('');

  const ${destructure} = ${hook}({
${optsBlock}    value,
    onChange: setValue,
  });

  return (
${indentLines(jsx, 4)}
  );
}`;
  }

  return { label, code: build(true), codeJs: build(false) };
}

type TabWithJsVariant = { label: string; code: string; lang: string; hasJsVariant: boolean };

export function withGhostScssTab(tabs: TabWithJsVariant[], hasGhost: boolean): TabWithJsVariant[] {
  return hasGhost ? [...tabs, { label: 'scss', code: GHOST_SCSS, lang: 'scss', hasJsVariant: false }] : tabs;
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
  const formType = `${componentName}Values`;

  function build(ts: boolean): string {
    const imports = buildImportBlock([
      `import { useController, useForm${ts ? ', type Control' : ''} } from 'react-hook-form';`,
      ...(extraImports ? extraImports.split('\n').filter(Boolean) : []),
      `import { ${hook} } from 'use-digit-mask';`,
    ]);

    const optsBlock = hookOptions.length > 0 ? `${joinOpts(hookOptions)}\n` : '';
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

  const ${destructure} = ${hook}({
${optsBlock}    value: field.value,
    onChange: field.onChange,
  });

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

  return { label, code: build(true), codeJs: build(false) };
}
