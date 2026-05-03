import { memo, type MouseEvent, useCallback } from 'react';
import cx from 'clsx';

import { type TocEntry } from '@/shared/i18n';

type TocNavListProps = {
  toc: TocEntry[];
  activeId: string;
  onScrollTo: (id: string) => void;
  linkClass: string;
  activeLinkClass: string;
};

type TocNavItemProps = {
  item: TocEntry;
  isActive: boolean;
  onScrollTo: (id: string) => void;
  linkClass: string;
  activeLinkClass: string;
};

const TocNavItem = memo(({ item, isActive, onScrollTo, linkClass, activeLinkClass }: TocNavItemProps) => {
  const handleClick = useCallback(
    (e: MouseEvent<HTMLAnchorElement>) => {
      e.preventDefault();
      onScrollTo(item.id);
    },
    [item.id, onScrollTo],
  );

  return (
    <a href={`#${item.id}`} className={cx(linkClass, isActive && activeLinkClass)} onClick={handleClick}>
      {item.label}
    </a>
  );
});

export function TocNavList({ toc, activeId, onScrollTo, linkClass, activeLinkClass }: TocNavListProps) {
  return (
    <>
      {toc.map((item) => (
        <TocNavItem
          key={item.id}
          item={item}
          isActive={activeId === item.id}
          linkClass={linkClass}
          activeLinkClass={activeLinkClass}
          onScrollTo={onScrollTo}
        />
      ))}
    </>
  );
}
