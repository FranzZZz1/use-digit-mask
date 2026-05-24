import { useEffect, useState } from 'react';

import { highlightCode } from '../helpers/highlight';

export function useHighlighted(code: string, lang: string = 'tsx'): { html: string; isLoading: boolean } {
  const [html, setHtml] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    highlightCode(code, lang)
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
  }, [code, lang]);

  return { html, isLoading };
}

export function useHighlightedAll(tabs: { code: string; lang?: string }[]): {
  htmls: string[];
  isLoading: boolean;
} {
  const [htmls, setHtmls] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setIsLoading(true);

    Promise.all(tabs.map(async ({ code, lang }) => highlightCode(code, lang ?? 'tsx')))
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [JSON.stringify(tabs)]);

  return { htmls, isLoading };
}
