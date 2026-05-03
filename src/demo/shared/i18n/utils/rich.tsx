import { type ReactNode } from 'react';

import { DocScrollLink } from '@/shared/ui/doc/DocScrollLink';

export function rich(text: string, codeClass?: string, linkClass?: string): ReactNode[] {
  const parts = text.split(/(\|[^|]+\||\*\*[^*]+\*\*|\[[^\]]+\]\([^)]+\))/);

  const result: ReactNode[] = [];

  parts.forEach((seg, i) => {
    if (!seg) return;

    if (seg.startsWith('|') && seg.endsWith('|')) {
      result.push(
        // eslint-disable-next-line react/no-array-index-key
        <code key={`c${i}`} className={codeClass}>
          {seg.slice(1, -1)}
        </code>,
      );
      return;
    }

    if (seg.startsWith('**') && seg.endsWith('**')) {
      // eslint-disable-next-line react/no-array-index-key
      result.push(<strong key={`b${i}`}>{seg.slice(2, -2)}</strong>);
      return;
    }

    if (seg.startsWith('[') && seg.includes('](')) {
      const splitAt = seg.indexOf('](');
      const innerText = seg.slice(1, splitAt);
      const href = seg.slice(splitAt + 2, -1);
      const inner = rich(innerText, codeClass);
      result.push(
        // eslint-disable-next-line react/no-array-index-key
        <DocScrollLink key={`l${i}`} href={href} className={linkClass}>
          {inner}
        </DocScrollLink>,
      );
      return;
    }

    result.push(seg);
  });

  return result;
}
