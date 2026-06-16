import { type ReactNode } from 'react';

import { useLang } from '@/shared/i18n';
import { DocLink } from '@/shared/ui/DocLink';

import styles from '../demo.module.scss';

type Props = {
  id: string;
  title: string;
  desc: string;
  children: ReactNode;
  docTo?: string;
  moreTo?: string;
};

export function DemoSection({ id, title, desc, docTo, moreTo, children }: Props) {
  const { t } = useLang();

  return (
    <section id={id} className={styles.section}>
      <div className={styles.section__header}>
        <h2 className={styles.section__title}>{title}</h2>
        {docTo && <DocLink to={docTo}>{t.nav.docs} →</DocLink>}
      </div>
      <p className={styles.section__desc}>{desc}</p>
      <div className={styles.grid}>{children}</div>
      {moreTo && (
        <DocLink to={moreTo} variant="more">
          {t.nav.allExamples} →
        </DocLink>
      )}
    </section>
  );
}
