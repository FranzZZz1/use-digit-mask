import { type ReactNode } from 'react';
import cx from 'clsx';

import { rich, useLang } from '@/shared/i18n';
import { DocLink } from '@/shared/ui/DocLink';

import styles from './ExamplesPage.module.scss';

type Props = {
  docsPath: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function ExamplesPage({ docsPath, title, lead, children }: Props) {
  const { t } = useLang();

  return (
    <article className={styles.doc}>
      <DocLink to={docsPath} variant="back">
        ← {t.nav.docs}
      </DocLink>
      <h1 className={cx(styles.doc__title, styles['doc__title--offset'])}>
        {title} — {t.sections.examples}
      </h1>
      <p className={styles.doc__lead}>{rich(lead, styles.doc__code, styles.doc__link)}</p>

      <div className={styles.grid}>{children}</div>
    </article>
  );
}
