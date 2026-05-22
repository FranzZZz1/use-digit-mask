import { type ReactNode } from 'react';
import cx from 'clsx';

import { rich, useLang } from '@/shared/i18n';
import { DocLink } from '@/shared/ui/DocLink';

import docStyles from '@/shared/ui/doc/doc.module.scss';
import exStyles from '@/shared/ui/doc/examples.module.scss';

type Props = {
  docsPath: string;
  title: string;
  lead: string;
  children: ReactNode;
};

export function ExamplesPage({ docsPath, title, lead, children }: Props) {
  const { t } = useLang();

  return (
    <article className={docStyles.doc}>
      <DocLink to={docsPath} variant="back">
        ← {t.nav.docs}
      </DocLink>
      <h1 className={cx(docStyles.doc__title, docStyles['doc__title--offset'])}>
        {title} — {t.sections.examples}
      </h1>
      <p className={docStyles.doc__lead}>{rich(lead, docStyles.doc__code, docStyles.doc__link)}</p>

      <div className={exStyles.grid}>{children}</div>
    </article>
  );
}
