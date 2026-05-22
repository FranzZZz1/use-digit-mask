import { type ReactNode } from 'react';
import cx from 'clsx';

import { useDocsNavigate } from '@/shared/lib';

import styles from './DocLink.module.scss';

type Variant = 'forward' | 'back' | 'more';

type Props = {
  to: string;
  children: ReactNode;
  variant?: Variant;
};

export function DocLink({ to, children, variant = 'forward' }: Props) {
  const navigate = useDocsNavigate();

  return (
    <a
      href={to}
      className={cx(styles.link, styles[`link--${variant}`])}
      onClick={(e) => {
        e.preventDefault();
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
