import { useState } from 'react';
import cx from 'clsx';

import { type ChangeType } from '@/shared/config';
import { rich, useLang } from '@/shared/i18n';
import { VariantSelect } from '@/shared/ui/VariantSelect/VariantSelect';
import { Footer } from '@/widgets/footer';
import { Header } from '@/widgets/header';

import styles from './changelog.module.scss';

function formatDate(isoDate: string, lang: string): string {
  return new Intl.DateTimeFormat(lang, { dateStyle: 'long' }).format(new Date(isoDate));
}

const SECTION_ORDER: ChangeType[] = ['added', 'fixed', 'changed', 'breaking', 'tradeoff'];
const HOOK_PREFIX = /^\|([A-Za-z]\w*)\|:\s*/;

type HookGroup = { hook: string | null; items: string[] };

function groupItemsByHook(items: string[]): HookGroup[] {
  const groups: HookGroup[] = [];

  items.forEach((item) => {
    const match = item.match(HOOK_PREFIX);
    const hook = match ? match[1] : null;
    const text = match ? item.slice(match[0].length) : item;

    const existing = groups.find((g) => g.hook === hook);
    if (existing) {
      existing.items.push(text);
    } else {
      groups.push({ hook, items: [text] });
    }
  });

  return groups;
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
        <article className={cx(styles.doc, styles.content)}>
          <h1 className={cx(styles.doc__title, styles['doc__title--offset'])}>{cl.title}</h1>
          <p className={styles.doc__lead}>{rich(cl.lead, styles.doc__code, styles.doc__link)}</p>

          <div className={styles.version__bar}>
            <VariantSelect options={versionOptions} value={selectedIndex} onChange={setSelectedIndex} />
            <span className={styles.version__date}>{formatDate(entry.date, lang)}</span>
          </div>

          <section className={styles.doc__section}>
            {[...entry.sections]
              .sort((a, b) => SECTION_ORDER.indexOf(a.type) - SECTION_ORDER.indexOf(b.type))
              .map((section) => (
                <div key={section.type} className={styles.group}>
                  <span className={cx(styles.badge, styles[`badge--${section.type}`])}>{badgeLabel[section.type]}</span>
                  {groupItemsByHook(section.items).map((group, gi) => (
                    // eslint-disable-next-line react/no-array-index-key
                    <div key={gi} className={styles.subgroup}>
                      {group.hook && <code className={cx(styles.doc__code, styles.subgroup__hook)}>{group.hook}</code>}
                      <ul className={styles.list}>
                        {group.items.map((item, i) => (
                          // eslint-disable-next-line react/no-array-index-key
                          <li key={i} className={styles.item}>
                            {rich(item, styles.doc__code, styles.doc__link)}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
          </section>
        </article>
      </main>

      <Footer />
    </div>
  );
}
