import cx from 'clsx';

import { GITHUB_URL, NPM_URL } from '@/shared/config';

import styles from './Footer.module.scss';

type Props = {
  mobileNavOffset?: boolean;
};

export function Footer({ mobileNavOffset }: Props) {
  return (
    <footer className={cx(styles.footer, mobileNavOffset && styles['footer--mobile-nav-offset'])}>
      <p>
        ISC License ·{' '}
        <a href={GITHUB_URL} target="_blank" rel="noreferrer">
          GitHub
        </a>{' '}
        ·{' '}
        <a href={NPM_URL} target="_blank" rel="noreferrer">
          npm
        </a>
      </p>
    </footer>
  );
}
