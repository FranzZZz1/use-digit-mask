import { type MouseEvent, type ReactNode } from 'react';

import { useAppLocation, useDocsNavigate } from '@/shared/lib';

import { useDocsNav } from './docsNavContext';

type Props = {
  href: string;
  children: ReactNode;
  className?: string;
};

export function DocScrollLink({ href, className, children }: Props) {
  const navigate = useDocsNavigate();
  const location = useAppLocation();
  const { hookLabel } = useDocsNav();

  if (href.startsWith('http')) {
    return (
      <a href={href} className={className} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  }

  const handleClick = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();

    if (href.startsWith('http')) return;

    if (href.startsWith('#')) {
      document.getElementById(href.slice(1))?.scrollIntoView({ behavior: 'smooth' });
      return;
    }

    const hashIndex = href.indexOf('#');

    if (hashIndex !== -1) {
      const path = href.slice(0, hashIndex);
      const anchor = href.slice(hashIndex + 1);

      if (path === location.pathname) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: 'smooth' });
      } else {
        const sectionId = e.currentTarget.closest('section[id]')?.id ?? '';

        const backTo = hookLabel ? { path: location.pathname, sectionId, hookLabel } : undefined;

        navigate(path, {
          scrollTo: anchor,
          backTo,
        });
      }

      return;
    }

    navigate(href);
  };

  return (
    <a href={href} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
