import { memo, useMemo } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import cx from 'clsx';

import { type TocEntry, useLang } from '@/shared/i18n';
import { useDocsUI } from '@/shared/lib';
import { DocsNavContext } from '@/shared/lib/context/docsNavContext';
import { SEGMENTS } from '@/shared/router';
import { PageWithBanner } from '@/shared/ui/PageWithBanner';
import { HOOKS } from '@/widgets/docs-layout';

import { useTocHighlight } from '../../hooks/useTocHighlight';
import { HookNavList } from '../HookNavList';
import { MobileNav } from '../MobileNav/MobileNav';
import { TocNavList } from '../TocNavList';

import styles from './DocsLayout.module.scss';

const SidebarNav = memo(({ isBannerActive }: { isBannerActive: boolean }) => {
  const { t } = useLang();

  return (
    <nav className={cx(styles.sidebar__nav, isBannerActive && styles['sidebar__nav--offset'])}>
      <p className={styles.sidebar__group}>{t.sections.Hooks}</p>
      <HookNavList linkClass={styles.sidebar__link} activeLinkClass={styles['sidebar__link--active']} />
    </nav>
  );
});

const TocNav = memo(
  ({
    toc,
    isBannerActive,
    registerLink,
    scrollToId,
  }: {
    toc: TocEntry[];
    isBannerActive: boolean;
    registerLink: (id: string, el: HTMLAnchorElement) => () => void;
    scrollToId: (id: string) => void;
  }) => {
    const { t } = useLang();

    if (!toc.length) return null;

    return (
      <nav className={cx(styles.toc__nav, isBannerActive && styles['toc__nav--offset'])}>
        <p className={styles.toc__title}>{t.sections.onThisPage}</p>
        <TocNavList toc={toc} linkClass={styles.toc__link} registerLink={registerLink} onScrollTo={scrollToId} />
      </nav>
    );
  },
);

export function DocsLayout() {
  const { t } = useLang();
  const matches = useMatches();
  const lastMatch = matches[matches.length - 1];
  const currentPath = (lastMatch?.pathname ?? '').replace(/\/$/, '');
  const handle = lastMatch?.handle as { hook?: keyof typeof t.toc } | undefined;

  const hookKey = handle?.hook;
  const toc = useMemo<TocEntry[]>(() => (hookKey ? (t.toc[hookKey] ?? []) : []), [hookKey, t]);

  const tocIds = useMemo(() => toc.map((item) => item.id), [toc]);
  const { scrollToId, registerLink } = useTocHighlight(tocIds);

  const backTo = useDocsUI((s) => s.backTo);

  const hookLabel = HOOKS.find((h) => h.path === currentPath || h.examplesPath === currentPath)?.label ?? '';
  const docsNavValue = useMemo(() => ({ hookLabel }), [hookLabel]);

  return (
    <DocsNavContext.Provider value={docsNavValue}>
      <PageWithBanner className={styles.page}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <SidebarNav isBannerActive={!!backTo} />
          </aside>

          <main
            className={cx(
              styles.content,
              currentPath.endsWith(SEGMENTS.examples) ? styles['content--examples'] : styles['content--docs'],
            )}
          >
            <Outlet />
          </main>

          <aside className={styles.toc}>
            <TocNav toc={toc} isBannerActive={!!backTo} registerLink={registerLink} scrollToId={scrollToId} />
          </aside>
        </div>

        <MobileNav currentPath={currentPath} toc={toc} registerLink={registerLink} scrollToId={scrollToId} />
      </PageWithBanner>
    </DocsNavContext.Provider>
  );
}
