import { useCallback, useEffect, useRef, useState } from 'react';

export function useCopyToClipboard(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback((text: string) => {
    const handleSuccess = () => {
      setCopied(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, 1800);
    };

    if (navigator.clipboard) {
      navigator.clipboard
        .writeText(text)
        .then(handleSuccess)
        .catch(() => {});
      return;
    }

    try {
      const el = document.createElement('textarea');
      el.value = text;
      el.style.cssText = 'position:fixed;opacity:0';
      document.body.appendChild(el);
      el.select();
      document.execCommand('copy');
      document.body.removeChild(el);
      handleSuccess();
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  return { copied, copy };
}
