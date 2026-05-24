export type ImportSpec = {
  from: string;
  named?: string[];
  default?: string;
  /** When true, rendered after a blank line at the bottom of the import block. */
  isStyle?: boolean;
};

function renderImportLine({ from, named, default: def }: ImportSpec): string {
  const parts: string[] = [];
  if (def) parts.push(def);
  if (named?.length) parts.push(`{ ${named.join(', ')} }`);
  return `import ${parts.join(', ')} from '${from}';`;
}

/**
 * Merges specs with the same `from` source, deduplicating named imports.
 * Insertion order is preserved so the output is deterministic.
 * Style imports are separated by a blank line at the end.
 */
export function buildImportBlock(specs: ImportSpec[]): string {
  const merged = specs.reduce((map, spec) => {
    const existing = map.get(spec.from);
    map.set(
      spec.from,
      existing
        ? {
            ...existing,
            named: [...new Set([...(existing.named ?? []), ...(spec.named ?? [])])],
            default: existing.default ?? spec.default,
          }
        : { ...spec },
    );
    return map;
  }, new Map<string, ImportSpec>());

  const mainLines: string[] = [];
  const styleLines: string[] = [];
  [...merged.values()].forEach((spec) => (spec.isStyle ? styleLines : mainLines).push(renderImportLine(spec)));

  return styleLines.length > 0 ? `${mainLines.join('\n')}\n\n${styleLines.join('\n')}` : mainLines.join('\n');
}
