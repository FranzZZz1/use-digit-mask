import { type ReactNode, useState } from 'react';

import { CodeModal } from '../CodeModal';

import styles from './DemoCard.module.scss';

import CodeIcon from '@/assets/icons/code.svg?react';

type DemoCardProps = {
  title: string;
  children: ReactNode;
  description?: string;
  code?: string;
};

export function DemoCard({ title, description, code, children }: DemoCardProps) {
  const [showCode, setShowCode] = useState(false);

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.meta}>
          <h3 className={styles.title}>{title}</h3>
          {description && <p className={styles.description}>{description}</p>}
        </div>

        {code && (
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

      {children}

      {showCode && code && (
        <CodeModal
          title={title}
          code={code}
          onClose={() => {
            setShowCode(false);
          }}
        >
          {children}
        </CodeModal>
      )}
    </div>
  );
}
