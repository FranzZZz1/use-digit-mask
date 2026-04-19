import styles from './Header.module.scss';

const GITHUB_URL = 'https://github.com/FranzZZz1/use-digit-mask';
const NPM_URL = 'https://www.npmjs.com/package/use-digit-mask';

export function Header() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <span className={styles.logo}>use-digit-mask</span>
        <nav className={styles.nav}>
          <a href={NPM_URL} target="_blank" rel="noreferrer" className={styles.link}>
            npm
          </a>
          <a href={GITHUB_URL} target="_blank" rel="noreferrer" className={styles.link}>
            GitHub
          </a>
        </nav>
      </div>
    </header>
  );
}
