import { type ReactNode } from 'react';

import { PlaygroundHint } from '@/shared/ui/Playground';

import styles from './PlaygroundControls.module.scss';

type Props = {
  name: string;
  tooltip?: string;
  children?: ReactNode;
};

export function PlaygroundField({ name, tooltip, children }: Props) {
  return (
    <div className={styles.field}>
      <span className={styles.field__name}>{name}</span>
      {tooltip && <PlaygroundHint tooltip={tooltip} />}
      {children}
    </div>
  );
}
