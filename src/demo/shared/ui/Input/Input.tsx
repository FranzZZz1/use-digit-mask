import { type DetailedHTMLProps, type InputHTMLAttributes } from 'react';
import cx from 'clsx';

import styles from './Input.module.scss';

type InputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement> & {
  className?: string;
};

export function Input({ className = '', ...props }: InputProps) {
  return <input {...props} className={cx(styles.input, className)} />;
}
