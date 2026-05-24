import { type ComponentProps, type ReactNode } from 'react';

import { FieldParsedValues } from '@/shared/ui/FieldParsedValues';

import styles from './FieldLayout.module.scss';

type FieldParsedValuesProps = ComponentProps<typeof FieldParsedValues>;

type FieldLayoutProps = FieldParsedValuesProps & {
  children: ReactNode;
};

export function FieldLayout({ children, ...parsedProps }: FieldLayoutProps) {
  return (
    <div className={styles.root}>
      {children}
      <FieldParsedValues {...parsedProps} />
    </div>
  );
}

export function FieldInputWrapper({ children }: { children: ReactNode }) {
  return <div className={styles['input__wrapper']}>{children}</div>;
}

export function MaskHint({ children }: { children: ReactNode }) {
  return <span className={styles['mask__hint']}>{children}</span>;
}
