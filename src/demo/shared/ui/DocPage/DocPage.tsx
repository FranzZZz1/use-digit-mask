import { type ReactNode } from 'react';

import { type PropRow, PropTable } from '@/entities/prop-def';
import { rich, useLang } from '@/shared/i18n';
import { type CodeTab } from '@/shared/lib/snippetUtils';
import { SECTION_IDS } from '@/shared/router';
import { DocCodeBlock } from '@/shared/ui/DocCodeBlock/DocCodeBlock';
import { DocLink } from '@/shared/ui/DocLink';

import styles from './DocPage.module.scss';

export type DocSnippet = { tabs: CodeTab[]; label?: string };

export type DocSection = {
  id: string;
  heading: string;
  intro?: string;
  rows?: PropRow[];
  typeLinks?: Record<string, string>;
  snippets?: DocSnippet[];
  children?: ReactNode;
  onPropClick?: (name: string) => void;
};

type Props = {
  title: string;
  lead: string;
  overview: string[];
  sections: DocSection[];
  examplesPath?: string;
};

export function DocPage({ title, lead, overview, sections, examplesPath }: Props) {
  const { t } = useLang();

  return (
    <article className={styles.doc}>
      <div className={styles.doc__title_row}>
        <h1 className={styles.doc__title}>{title}</h1>
        {examplesPath && <DocLink to={examplesPath}>{t.sections.examples} →</DocLink>}
      </div>
      <p className={styles.doc__lead}>{rich(lead, styles.doc__code, styles.doc__link)}</p>

      <section id={SECTION_IDS.overview} className={styles.doc__section}>
        <h2 className={styles.doc__heading}>{t.sections.overview}</h2>
        {overview.map((p, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <p key={i} className={styles.doc__text}>
            {rich(p, styles.doc__code, styles.doc__link)}
          </p>
        ))}
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className={styles.doc__section}>
          <h2 className={styles.doc__heading}>{section.heading}</h2>
          {section.intro && (
            <p className={styles.doc__text}>{rich(section.intro, styles.doc__code, styles.doc__link)}</p>
          )}
          {section.snippets?.map((s, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <DocCodeBlock key={i} tabs={s.tabs} label={s.label} />
          ))}
          {section.rows && (
            <PropTable rows={section.rows} typeLinks={section.typeLinks} onPropClick={section.onPropClick} />
          )}
          {section.children}
        </section>
      ))}
    </article>
  );
}
