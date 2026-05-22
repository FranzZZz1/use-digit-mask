import { createHighlighter, type ShikiTransformer, type ThemeInput } from 'shiki';

export const theme: ThemeInput = {
  name: 'custom-theme',
  type: 'dark',
  colors: {
    'editor.background': 'var(--code-background)',
    'editor.foreground': 'var(--code-foreground)',
  },
  tokenColors: [
    {
      scope: [
        'keyword.control',
        'keyword.declaration',
        'constant.language.boolean',
        'constant.language.null',
        'constant.language.undefined',
        'storage.type',
        'support.type.primitive.tsx',
        'support.type.primitive.ts',
        'support.type.builtin.ts',
      ],
      settings: {
        foreground: 'var(--code-keyword-foreground)',
      },
    },
    {
      scope: ['string', 'punctuation.definition.string.begin.tsx', 'punctuation.definition.string.end.tsx'],
      settings: { foreground: 'var(--code-string-foreground)' },
    },
    {
      scope: [
        'keyword',
        'storage.type.function.arrow.tsx',
        'punctuation',
        'meta.brace.square.tsx',
        'meta.brace.round.tsx',
        'keyword.operator.assignment.tsx',
      ],
      settings: { foreground: 'var(--code-braces-foreground)' },
    },
    {
      scope: ['entity.other.attribute-name'],
      settings: {
        foreground: 'var(--code-attributes-foreground)',
      },
    },
    {
      scope: ['entity.name.tag'],
      settings: {
        foreground: 'var(--code-tags-foreground)',
      },
    },
    {
      scope: ['comment', 'comment punctuation.definition.comment'],
      settings: {
        foreground: 'var(--code-comments-foreground)',
        fontStyle: 'italic',
      },
    },
    {
      scope: ['entity.name.function', 'entity.name.function.tsx'],
      settings: {
        foreground: 'var(--code-functions-foreground)',
      },
    },
    {
      scope: ['entity.name.type', 'entity.name.type.tsx', 'entity.name.type.ts'],
      settings: { foreground: 'var(--code-type-foreground)' },
    },
    {
      scope: ['number', 'variable.parameter', 'constant.numeric.css'],
      settings: { foreground: 'var(--code-parameters-foreground)' },
    },
    {
      scope: [
        'variable.other.readwrite',
        'variable.other.constant',
        'variable.other.constant.object',
        'variable.other.object',
        'variable.other.object.property',
        'variable.other.property',
        'support.variable',
        'support.constant',
        'meta.object-literal.key.tsx',
        'meta.jsx.children',
      ],
      settings: { foreground: 'var(--code-foreground)' },
    },
    {
      scope: ['entity.other.attribute-name.class.css', 'entity.name.tag.reference.scss'],
      settings: { foreground: 'var(--code-attributes-foreground)' },
    },
    {
      scope: ['support.type.property-name.css', 'support.type.property-name.scss'],
      settings: { foreground: 'var(--code-css-property-foreground)' },
    },
    {
      scope: ['support.constant.property-value.css', 'support.constant.property-value.scss'],
      settings: { foreground: 'var(--code-parameters-foreground)' },
    },
    {
      scope: [
        'support.function.misc.scss',
        'support.function.misc.css',
        'support.function.color.css',
        'support.function.var.css',
      ],
      settings: { foreground: 'var(--code-functions-foreground)' },
    },
    {
      scope: ['variable.scss', 'variable.css'],
      settings: { foreground: 'var(--code-attributes-foreground)' },
    },
  ],
};

type SpanNode = Parameters<NonNullable<ShikiTransformer['span']>>[0];

// Перекраска хуков и setter'ов стейтов
const hookSetterTransformer: ShikiTransformer = {
  name: 'hook-setter-tokens',
  span(hast: SpanNode) {
    const [child] = hast.children;
    if (!child || child.type !== 'text') return;
    const text = (child as { type: 'text'; value: string }).value.trim();
    const { properties } = hast;
    if (/^use[A-Z]/.test(text)) {
      (properties as Record<string, string>).style = 'color: var(--code-attributes-foreground)';
    } else if (/^set[A-Z]/.test(text)) {
      (properties as Record<string, string>).style = 'color: var(--code-functions-foreground)';
    }
  },
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme],
      langs: ['tsx', 'scss'],
    });
  }
  return highlighterPromise;
}

export async function highlightCode(code: string, lang: string = 'tsx'): Promise<string> {
  const highlighter = await getHighlighter();
  return highlighter.codeToHtml(code, { lang, theme: 'custom-theme', transformers: [hookSetterTransformer] });
}

export async function highlightTsx(code: string): Promise<string> {
  return highlightCode(code, 'tsx');
}
