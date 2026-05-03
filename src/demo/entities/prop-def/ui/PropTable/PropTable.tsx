import { type ReactNode } from 'react';

import { rich } from '@/shared/i18n';
import { DocScrollLink } from '@/shared/ui/doc/DocScrollLink';

import styles from './PropTable.module.scss';

export type PropRow = {
  name: string;
  type: string;
  description: string;
  default?: string;
  required?: boolean;
};

type PropTableProps = {
  rows: PropRow[];
  typeLinks?: Record<string, string>;
};

function renderType(type: string, typeLinks: Record<string, string>): ReactNode {
  const keys = Object.keys(typeLinks);
  if (!keys.length) return type;

  const escaped = keys.map((k) => k.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const parts = type.split(new RegExp(`(\\b(?:${escaped.join('|')})\\b)`));

  return (
    <>
      {parts.map((part, i) => {
        const href = typeLinks[part];
        if (!href) return part;
        return (
          // eslint-disable-next-line react/no-array-index-key
          <DocScrollLink key={i} href={href} className={styles['prop__type-link']}>
            {part}
          </DocScrollLink>
        );
      })}
    </>
  );
}

export function PropTable({ rows, typeLinks }: PropTableProps) {
  return (
    <div className={styles.wrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th className={styles.th}>Prop</th>
            <th className={styles.th}>Type</th>
            <th className={styles.th}>Default</th>
            <th className={styles.th}>Description</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.name} className={styles.tr}>
              <td className={styles.td}>
                <code className={styles.prop__name}>{row.name}</code>
                {row.required && <span className={styles.required}>*</span>}
              </td>
              <td className={styles.td}>
                <code className={styles.prop__type}>{typeLinks ? renderType(row.type, typeLinks) : row.type}</code>
              </td>
              <td className={styles.td}>
                {row.default ? (
                  <code className={styles.prop__default}>{row.default}</code>
                ) : (
                  <span className={styles.dash}>—</span>
                )}
              </td>
              <td className={styles.td__desc}>{rich(row.description, styles.desc__code, styles.desc__link)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
