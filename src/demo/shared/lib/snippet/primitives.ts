export type CodeTab = {
  label: string;
  code: string;
  jsVariant?: string;
  lang?: string;
};

export function dedent(strings: TemplateStringsArray, ...values: unknown[]): string {
  const literalLines = strings.join('').split('\n');
  const nonEmpty = literalLines.filter((l) => l.trim().length > 0);
  const indent = nonEmpty.length === 0 ? 0 : Math.min(...nonEmpty.map((l) => l.match(/^[ \t]*/)?.[0].length ?? 0));

  const raw = strings.reduce((acc, str, i) => acc + String(values[i - 1] ?? '') + str, '');
  return raw
    .replace(/^\n/, '')
    .split('\n')
    .map((l) => l.slice(Math.min(indent, l.match(/^[ \t]*/)?.[0].length ?? 0)))
    .join('\n')
    .replace(/\n[ \t]*$/, '');
}

export function createCodeTab(label: string, code: string, lang?: string): CodeTab {
  return lang ? { label, code, lang } : { label, code };
}

export function getTabCode(tab: CodeTab, syntax: 'ts' | 'js'): string {
  return syntax === 'js' && tab.jsVariant !== undefined ? tab.jsVariant : tab.code;
}

export function indentLines(str: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((l) => (l.length > 0 ? `${pad}${l}` : l))
    .join('\n');
}
