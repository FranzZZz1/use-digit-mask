import { memo, useMemo } from 'react';
import { Outlet, useMatches } from 'react-router-dom';
import cx from 'clsx';

import { type TocEntry, useLang } from '@/shared/i18n';
import { useDocsUI } from '@/shared/lib';
import { DocsNavContext } from '@/shared/ui/doc/docsNavContext';
import { PageWithBanner } from '@/shared/ui/PageWithBanner';
import { HOOKS, MobileNav, useTocHighlight } from '@/widgets/docs-layout';

import { HookNavList } from '../HookNavList/HookNavList';
import { TocNavList } from '../TocNavList/TocNavList';

import styles from './DocsLayout.module.scss';

const SidebarNav = memo(
  ({ currentPath, isBannerActive }: { currentPath: string | undefined; isBannerActive: boolean }) => {
    const { t } = useLang();

    return (
      <nav className={cx(styles.sidebar__nav, isBannerActive && styles['sidebar__nav--offset'])}>
        <p className={styles.sidebar__group}>{t.sections.Hooks}</p>
        <HookNavList
          currentPath={currentPath}
          linkClass={styles.sidebar__link}
          activeLinkClass={styles['sidebar__link--active']}
        />
      </nav>
    );
  },
);

const TocNav = memo(
  ({
    toc,
    isBannerActive,
    activeId,
    scrollToId,
  }: {
    toc: TocEntry[];
    isBannerActive: boolean;
    activeId: string;
    scrollToId: (id: string) => void;
  }) => {
    const { t } = useLang();

    if (!toc.length) return null;

    return (
      <nav className={cx(styles.toc__nav, isBannerActive && styles['toc__nav--offset'])}>
        <p className={styles.toc__title}>{t.sections.onThisPage}</p>
        <TocNavList
          toc={toc}
          activeId={activeId}
          linkClass={styles.toc__link}
          activeLinkClass={styles['toc__link--active']}
          onScrollTo={scrollToId}
        />
      </nav>
    );
  },
);

export function DocsLayout() {
  const { t } = useLang();
  const matches = useMatches();
  const currentPath = matches[matches.length - 1]?.pathname;
  const handle = matches[matches.length - 1]?.handle as { hook?: keyof typeof t.toc } | undefined;

  const hookKey = handle?.hook;
  const toc = useMemo<TocEntry[]>(() => (hookKey ? (t.toc[hookKey] ?? []) : []), [hookKey, t]);

  const tocIds = useMemo(() => toc.map((item) => item.id), [toc]);
  const { activeId, scrollToId } = useTocHighlight(tocIds);

  const backTo = useDocsUI((s) => s.backTo);

  const hookLabel = HOOKS.find((h) => h.path === currentPath)?.label ?? '';
  const docsNavValue = useMemo(() => ({ hookLabel }), [hookLabel]);

  return (
    <DocsNavContext.Provider value={docsNavValue}>
      <PageWithBanner className={styles.page}>
        <div className={styles.layout}>
          <aside className={styles.sidebar}>
            <SidebarNav currentPath={currentPath} isBannerActive={!!backTo} />
          </aside>

          <main className={styles.content}>
            <Outlet />
          </main>

          <aside className={styles.toc}>
            <TocNav toc={toc} isBannerActive={!!backTo} activeId={activeId} scrollToId={scrollToId} />
          </aside>
        </div>

        <MobileNav currentPath={currentPath} toc={toc} activeId={activeId} scrollToId={scrollToId} />
      </PageWithBanner>
    </DocsNavContext.Provider>
  );
}
