import { useCallback, useEffect, useRef, useState } from 'react';

import { highlightTsx } from '@/shared/lib';

export function useCopyToClipboard(): { copied: boolean; copy: (text: string) => void } {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const copy = useCallback((text: string) => {
    navigator.clipboard
      .writeText(text)
      .then(() => {
        setCopied(true);
        clearTimeout(timerRef.current);
        timerRef.current = setTimeout(() => {
          setCopied(false);
        }, 1800);
      })
      .catch(() => {});
  }, []);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  return { copied, copy };
}

export function useHighlighted(code: string): { html: string; isLoading: boolean } {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    highlightTsx(code)
      .then((result) => {
        if (mounted) {
          setHtml(result);
          setIsLoading(false);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
  }, [code]);

  return { html, isLoading };
}

export function useHighlightedAll(codes: string[]): { htmls: string[]; isLoading: boolean } {
  const [htmls, setHtmls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all(codes.map(async (c) => highlightTsx(c)))
      .then((results) => {
        if (mounted) {
          setHtmls(results);
          setIsLoading(false);
        }
      })
      .catch(() => {});

    return () => {
      mounted = false;
    };
    // Serialised to avoid re-running when a new array with identical strings is passed
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(codes)]);

  return { htmls, isLoading };
}
