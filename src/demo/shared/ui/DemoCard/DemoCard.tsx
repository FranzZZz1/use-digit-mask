import { type ReactNode, useState } from 'react';
import cx from 'clsx';

import CodeIcon from '@/shared/assets/icons/code.svg?react';

import { CodeModal, type CodeTab } from '../CodeModal';
import { VariantSelect } from '../VariantSelect';

import styles from './DemoCard.module.scss';

export type DemoCardVariant = {
  label: string;
  component: ReactNode;
  code: CodeTab[];
  badge?: string;
};

type DemoCardProps = {
  title: string;
  children?: ReactNode;
  description?: string;
  code?: CodeTab[];
  variants?: DemoCardVariant[];
};

export function DemoCard({ title, description, code, children, variants }: DemoCardProps) {
  const [showCode, setShowCode] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);

  const activeVariant = variants?.[activeIdx];
  const activeCode = activeVariant?.code ?? code;
  const activeComponent = activeVariant?.component ?? children;

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <h3 className={styles.title}>{title}</h3>

        {(variants || activeCode) && (
          <div className={styles.header__actions}>
            {variants && (
              <>
                <div className={styles.variants}>
                  {variants.map((v, i) => (
                    <button
                      key={v.label}
                      type="button"
                      className={cx(styles.variant__btn, i === activeIdx && styles['variant__btn--active'])}
                      onClick={() => {
                        setActiveIdx(i);
                      }}
                    >
                      {v.label}
                    </button>
                  ))}
                </div>

                <div className={styles.variants__select}>
                  <VariantSelect
                    options={variants.map((v, i) => ({ label: v.label, value: i }))}
                    value={activeIdx}
                    onChange={setActiveIdx}
                  />
                </div>
              </>
            )}

            {activeCode && (
              <button
                type="button"
                className={styles.code__btn}
                title="Show code"
                aria-label="Show code example"
                onClick={() => {
                  setShowCode(true);
                }}
              >
                <CodeIcon width={14} />
              </button>
            )}
          </div>
        )}

        {description && <p className={styles.description}>{description}</p>}
      </div>

      <div className={styles.preview}>
        {activeComponent}
        {activeVariant?.badge && <p className={styles.preview__badge}>{activeVariant.badge}</p>}
      </div>

      {showCode && activeCode && (
        <CodeModal
          title={title}
          tabs={activeCode}
          variants={variants}
          activeVariantIdx={activeIdx}
          onClose={() => {
            setShowCode(false);
          }}
          onVariantChange={setActiveIdx}
        >
          {activeComponent}
        </CodeModal>
      )}
    </div>
  );
}
