import { useEffect, useRef, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import cx from 'clsx';

import { GITHUB_URL, NPM_URL } from '@/shared/config';
import { type Lang, useLang } from '@/shared/i18n';
import { useOutsideClose } from '@/shared/lib';

import styles from './Header.module.scss';

const LANGS: Lang[] = ['en', 'ru'];

export function Header() {
  const { t, lang, setLang } = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const location = useLocation();

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  useOutsideClose(menuOpen, () => { setMenuOpen(false); }, [headerRef]);

  return (
    <header ref={headerRef} className={styles.header}>
      <div className={styles.inner}>
        <NavLink to="/" className={styles.logo}>
          use-digit-mask
        </NavLink>

        <button
          type="button"
          className={styles['menu-btn']}
          aria-label={menuOpen ? t.nav.closeMenu : t.nav.openMenu}
          aria-expanded={menuOpen}
          aria-haspopup="true"
          onClick={() => {
            setMenuOpen((prev) => !prev);
          }}
        >
          <span className={cx(styles['menu-btn__icon'], menuOpen && styles['menu-btn__icon--open'])} />
        </button>

        <nav className={cx(styles.nav, menuOpen && styles['nav--open'])}>
          <NavLink to="/docs" className={({ isActive }) => cx(styles.link, isActive && styles['link--active'])}>
            {t.nav.docs}
          </NavLink>
          <a
            href={NPM_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            npm
          </a>
          <a
            href={GITHUB_URL}
            target="_blank"
            rel="noreferrer"
            className={styles.link}
            onClick={() => {
              setMenuOpen(false);
            }}
          >
            GitHub
          </a>
          <div className={styles['lang-switch']}>
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                className={cx(styles['lang-switch__btn'], lang === l && styles['lang-switch__btn--active'])}
                onClick={() => {
                  setLang(l);
                }}
              >
                {l.toUpperCase()}
              </button>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
