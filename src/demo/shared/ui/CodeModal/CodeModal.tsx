import { type ReactNode, useEffect, useMemo, useState } from 'react';
import cx from 'clsx';

import { useLang } from '@/shared/i18n';
import { useHighlightedAll } from '@/shared/lib';

import { CodeBlockHeader } from '../CodeBlockHeader';
import { CodePane } from '../CodePane';
import { Modal } from '../Modal';

import styles from './CodeModal.module.scss';

export type CodeTab = {
  label: string;
  code: string;
};

export type CodeModalVariant = {
  label: string;
  code: CodeTab[];
};

type CodeModalProps = {
  title: string;
  tabs: CodeTab[];
  onClose: () => void;
  children?: ReactNode;
  variants?: CodeModalVariant[];
  activeVariantIdx?: number;
  onVariantChange?: (idx: number) => void;
};

export function CodeModal({
  title,
  tabs,
  onClose,
  children,
  variants,
  activeVariantIdx,
  onVariantChange,
}: CodeModalProps) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    setActiveTab(0);
  }, [activeVariantIdx]);

  const codes = useMemo(() => tabs.map((tab) => tab.code), [tabs]);
  const { htmls: allHighlighted, isLoading } = useHighlightedAll(codes);

  const currentCode = tabs[activeTab]?.code ?? '';
  const currentHighlighted = allHighlighted[activeTab] ?? '';
  const lineCount = currentCode.split('\n').length;

  return (
    <Modal onClose={onClose}>
      <CodeBlockHeader
        title={<span className={styles.title}>{title}</span>}
        code={currentCode}
        className={styles.header}
        onClose={onClose}
      />

      <div className={styles.body}>
        <div className={styles.preview}>
          <div className={styles.preview__header}>
            <p className={styles.preview__label}>{t.sections.preview}</p>
            {variants && variants.length > 1 && (
              <div className={styles.preview__variants}>
                {variants.map((v, i) => (
                  <button
                    key={v.label}
                    type="button"
                    className={cx(
                      styles.preview__variant,
                      i === activeVariantIdx && styles['preview__variant--active'],
                    )}
                    onClick={() => {
                      onVariantChange?.(i);
                    }}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            )}
          </div>
          <div className={styles.preview__content}>{children}</div>
        </div>

        <div className={styles.code__panel}>
          {tabs.length > 1 && (
            <div className={styles.tabs} role="tablist">
              {tabs.map((tab, index) => (
                <button
                  key={tab.label}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === index}
                  className={cx(styles.tab, activeTab === index && styles['tab--active'])}
                  onClick={() => {
                    setActiveTab(index);
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          <div className={styles.code__scroll}>
            <CodePane html={currentHighlighted} isLoading={isLoading} lineCount={lineCount} />
          </div>
        </div>
      </div>
    </Modal>
  );
}
