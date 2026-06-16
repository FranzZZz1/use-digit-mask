import { memo, type MouseEvent, useCallback, useEffect, useRef } from 'react';

import { type TocEntry } from '@/shared/i18n';

type TocNavListProps = {
  toc: TocEntry[];
  onScrollTo: (id: string) => void;
  linkClass: string;
  registerLink: (id: string, el: HTMLAnchorElement) => () => void;
};

type TocNavItemProps = Omit<TocNavListProps, 'toc'> & {
  item: TocEntry;
};

const TocNavItem = memo(({ item, onScrollTo, linkClass, registerLink }: TocNavItemProps) => {
  const ref = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!ref.current) return undefined;
    return registerLink(item.id, ref.current);
  }, [item.id, registerLink]);

  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onScrollTo(item.id);
    },
    [item.id, onScrollTo],
  );

  return (
    <a ref={ref} href={`#${item.id}`} className={linkClass} onClick={handleClick}>
      {item.label}
    </a>
  );
});

export function TocNavList({ toc, onScrollTo, linkClass, registerLink }: TocNavListProps) {
  return (
    <>
      {toc.map((item) => (
        <TocNavItem
          key={item.id}
          item={item}
          linkClass={linkClass}
          registerLink={registerLink}
          onScrollTo={onScrollTo}
        />
      ))}
    </>
  );
}
