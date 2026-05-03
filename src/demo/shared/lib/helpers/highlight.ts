import { createHighlighter, type ThemeInput } from 'shiki';

export const theme: ThemeInput = {
  name: 'custom-theme',
  type: 'dark',
  colors: {
    'editor.background': 'var(--code-background)',
    'editor.foreground': 'var(--code-foreground)',
  },
  tokenColors: [
    {
      scope: ['keyword.control', 'keyword.declaration', 'constant.language.boolean', 'storage.type'],
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
      scope: ['number', 'variable.parameter', 'variable.other.object', 'meta.embedded.expression'],
      settings: { foreground: 'var(--code-parameters-foreground)' },
    },
    {
      scope: [
        'variable.other.readwrite',
        'variable.other.constant',
        'variable.other.constant.object',
        'variable.other.object.property',
        'variable.other.property',
        'support.variable',
        'support.constant',
        'meta.object-literal.key.tsx',
        'meta.jsx.children',
      ],
      settings: { foreground: 'var(--code-foreground)' },
    },
  ],
};

let highlighterPromise: ReturnType<typeof createHighlighter> | null = null;

async function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [theme],
      langs: ['tsx'],
    });
  }
  return highlighterPromise;
}

export async function highlightTsx(code: string): Promise<string> {
  const highlighter = await getHighlighter();

  return highlighter.codeToHtml(code, {
    lang: 'tsx',
    theme: 'custom-theme',
  });
}
