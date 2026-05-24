import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import cx from 'clsx';

import styles from './Toast.module.scss';

type ToastProps = {
  message: string;
  onDone: () => void;
};

export function Toast({ message, onDone }: ToastProps) {
  const [visible, setVisible] = useState(false);
  const onDoneRef = useRef(onDone);
  onDoneRef.current = onDone;

  useEffect(() => {
    const showId = requestAnimationFrame(() => {
      setVisible(true);
    });
    const hideId = window.setTimeout(() => {
      setVisible(false);
    }, 1800);
    const doneId = window.setTimeout(() => {
      onDoneRef.current();
    }, 2100);

    return () => {
      cancelAnimationFrame(showId);
      clearTimeout(hideId);
      clearTimeout(doneId);
    };
  }, []);

  return createPortal(
    <div role="status" aria-live="polite" className={cx(styles.toast, visible && styles['toast--visible'])}>
      {message}
    </div>,
    document.body,
  );
}
