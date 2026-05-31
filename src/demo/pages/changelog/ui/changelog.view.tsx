import { useState } from 'react';
import cx from 'clsx';

import { type ChangeType } from '@/shared/config';
import { rich, useLang } from '@/shared/i18n';
import { VariantSelect } from '@/shared/ui/VariantSelect/VariantSelect';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

import styles from './changelog.module.scss';
import docStyles from '@/shared/ui/doc/doc.module.scss';

function formatDate(isoDate: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(isoDate));
}

export function ChangelogView() {
  const { t, lang } = useLang();
  const cl = t.changelog;
  const [selectedIndex, setSelectedIndex] = useState(0);

  const versionOptions = cl.entries.map((entry, i) => ({ label: `v${entry.version}`, value: i }));
  const entry = cl.entries[selectedIndex];

  const badgeLabel: Record<ChangeType, string> = {
    added: cl.added,
    changed: cl.changed,
    fixed: cl.fixed,
    breaking: cl.breaking,
    tradeoff: cl.tradeoff,
  };

  return (
    <div className={styles.page}>
      <Header />

      <main className={styles.main}>
        <article className={cx(docStyles.doc, styles.content)}>
          <h1 className={cx(docStyles.doc__title, docStyles['doc__title--offset'])}>{cl.title}</h1>
          <p className={docStyles.doc__lead}>{rich(cl.lead, docStyles.doc__code, docStyles.doc__link)}</p>

          <div className={styles.version__bar}>
            <VariantSelect options={versionOptions} value={selectedIndex} onChange={setSelectedIndex} />
            <span className={styles.version__date}>{formatDate(entry.date, lang)}</span>
          </div>

          <section className={docStyles.doc__section}>
            {entry.sections.map((section) => (
              <div key={section.type} className={styles.group}>
                <span className={cx(styles.badge, styles[`badge--${section.type}`])}>{badgeLabel[section.type]}</span>
                <ul className={styles.list}>
                  {section.items.map((item, i) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <li key={i} className={styles.item}>
                      {rich(item, docStyles.doc__code, docStyles.doc__link)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
