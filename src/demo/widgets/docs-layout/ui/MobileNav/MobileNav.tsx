import { memo, useCallback, useEffect, useRef, useState } from 'react';
import cx from 'clsx';

import { type TocEntry, useLang } from '@/shared/i18n';
import { useOutsideClose } from '@/shared/lib';
import { HOOKS } from '@/widgets/docs-layout/const/const';

import { HookNavList } from '../HookNavList/HookNavList';
import { TocNavList } from '../TocNavList/TocNavList';

import styles from './MobileNav.module.scss';

type MobileNavProps = {
  currentPath: string | undefined;
  toc: TocEntry[];
  activeId: string;
  scrollToId: (id: string) => void;
};

export const MobileNav = memo(({ currentPath, toc, activeId, scrollToId }: MobileNavProps) => {
  const { t } = useLang();
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const close = useCallback(() => {
    setIsOpen(false);
  }, []);
  const toggle = useCallback(() => {
    setIsOpen((v) => !v);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [currentPath]);

  useOutsideClose(isOpen, close, [panelRef, toggleRef]);

  const handleScrollTo = useCallback(
    (id: string) => {
      close();
      scrollToId(id);
    },
    [close, scrollToId],
  );

  const currentHookLabel = HOOKS.find((h) => h.path === currentPath)?.label ?? 'Docs';

  return (
    <>
      <div
        className={cx(styles['mobile-nav__backdrop'], isOpen && styles['mobile-nav__backdrop--open'])}
        onClick={close}
      />
      <div className={styles['mobile-nav']}>
        <div
          ref={panelRef}
          className={cx(styles['mobile-nav__panel'], isOpen && styles['mobile-nav__panel--open'])}
        >
          <div className={styles['mobile-nav__section']}>
            <p className={styles['mobile-nav__section-title']}>Hooks</p>
            <HookNavList
              currentPath={currentPath}
              linkClass={styles['mobile-nav__link']}
              activeLinkClass={styles['mobile-nav__link--active']}
              onSamePath={close}
            />
          </div>

          {toc.length > 0 && (
            <>
              <div className={styles['mobile-nav__divider']} />
              <div className={styles['mobile-nav__section']}>
                <p className={styles['mobile-nav__section-title']}>{t.sections.onThisPage}</p>
                <TocNavList
                  toc={toc}
                  activeId={activeId}
                  linkClass={styles['mobile-nav__toc-link']}
                  activeLinkClass={styles['mobile-nav__toc-link--active']}
                  onScrollTo={handleScrollTo}
                />
              </div>
            </>
          )}
        </div>

        <button
          ref={toggleRef}
          type="button"
          className={cx(styles['mobile-nav__toggle'], isOpen && styles['mobile-nav__toggle--open'])}
          aria-expanded={isOpen}
          aria-label="Navigation"
          onClick={toggle}
        >
          <span className={styles['mobile-nav__toggle-icon']}>{isOpen ? '✕' : '≡'}</span>
          <span className={styles['mobile-nav__toggle-label']}>{currentHookLabel}</span>
          <span
            className={cx(styles['mobile-nav__toggle-chevron'], isOpen && styles['mobile-nav__toggle-chevron--up'])}
          >
            ▲
          </span>
        </button>
      </div>
    </>
  );
});
