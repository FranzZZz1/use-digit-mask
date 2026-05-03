import { type ReactNode } from 'react';

import { type PropRow, PropTable } from '@/entities/prop-def';
import { rich, useLang } from '@/shared/i18n';
import { SECTION_IDS } from '@/shared/router';
import { DocCodeBlock } from '@/shared/ui/DocCodeBlock/DocCodeBlock';

import docStyles from '@/shared/ui/doc/doc.module.scss';

export type DocSnippet = {
  code: string;
  label?: string;
};

export type DocSection = {
  id: string;
  heading: string;
  intro?: string;
  rows?: PropRow[];
  typeLinks?: Record<string, string>;
  snippets?: DocSnippet[];
  children?: ReactNode;
};

type Props = {
  title: string;
  lead: string;
  overview: string[];
  sections: DocSection[];
};

export function DocPage({ title, lead, overview, sections }: Props) {
  const { t } = useLang();

  return (
    <article className={docStyles.doc}>
      <h1 className={docStyles.doc__title}>{title}</h1>
      <p className={docStyles.doc__lead}>{rich(lead, docStyles.doc__code, docStyles.doc__link)}</p>

      <section id={SECTION_IDS.overview} className={docStyles.doc__section}>
        <h2 className={docStyles.doc__heading}>{t.sections.overview}</h2>
        {overview.map((p, i) => (
          // eslint-disable-next-line react/no-array-index-key
          <p key={i} className={docStyles.doc__text}>
            {rich(p, docStyles.doc__code, docStyles.doc__link)}
          </p>
        ))}
      </section>

      {sections.map((section) => (
        <section key={section.id} id={section.id} className={docStyles.doc__section}>
          <h2 className={docStyles.doc__heading}>{section.heading}</h2>
          {section.intro && (
            <p className={docStyles.doc__text}>{rich(section.intro, docStyles.doc__code, docStyles.doc__link)}</p>
          )}
          {section.snippets?.map((s, i) => (
            // eslint-disable-next-line react/no-array-index-key
            <DocCodeBlock key={i} code={s.code} label={s.label} />
          ))}
          {section.rows && <PropTable rows={section.rows} typeLinks={section.typeLinks} />}
          {section.children}
        </section>
      ))}
    </article>
  );
}
