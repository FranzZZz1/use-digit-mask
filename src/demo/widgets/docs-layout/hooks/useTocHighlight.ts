import { useCallback, useEffect, useRef } from 'react';

function getActiveId(ids: string[]): string {
  const { scrollTop, scrollHeight, clientHeight } = document.documentElement;

  if (scrollTop + clientHeight >= scrollHeight - 8) {
    return ids[ids.length - 1] ?? '';
  }

  const threshold = scrollTop + clientHeight * 0.25;
  let result = ids[0] ?? '';

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    if (top <= threshold) result = id;
  });

  return result;
}

const ACTIVE_ATTR = 'data-toc-active';

export function useTocHighlight(ids: string[]): {
  scrollToId: (id: string) => void;
  registerLink: (id: string, el: HTMLAnchorElement) => () => void;
} {
  const linksRef = useRef<Map<string, Set<HTMLAnchorElement>>>(new Map());
  const activeIdRef = useRef<string>(ids[0] ?? '');
  const lockedRef = useRef(false);
  const highlightRafRef = useRef<number | null>(null);
  const pollRafRef = useRef<number | null>(null);
  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  const clearAll = useCallback(() => {
    linksRef.current.forEach((set) => {
      set.forEach((el) => {
        el.removeAttribute(ACTIVE_ATTR);
      });
    });
  }, []);

  const applyActive = useCallback((id: string) => {
    const prev = activeIdRef.current;
    if (prev === id) return;
    linksRef.current.get(prev)?.forEach((el) => {
      el.removeAttribute(ACTIVE_ATTR);
    });
    linksRef.current.get(id)?.forEach((el) => {
      el.setAttribute(ACTIVE_ATTR, '');
    });
    activeIdRef.current = id;
  }, []);

  useEffect(() => {
    if (!ids.length) return undefined;

    lockedRef.current = false;
    clearAll();
    activeIdRef.current = '';
    applyActive(ids[0] ?? '');

    const handleScroll = () => {
      if (lockedRef.current) return;
      if (highlightRafRef.current !== null) return;
      highlightRafRef.current = requestAnimationFrame(() => {
        highlightRafRef.current = null;
        applyActive(getActiveId(idsRef.current));
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (highlightRafRef.current !== null) {
        cancelAnimationFrame(highlightRafRef.current);
        highlightRafRef.current = null;
      }
    };
  }, [ids, clearAll, applyActive]);

  const registerLink = useCallback((id: string, el: HTMLAnchorElement): (() => void) => {
    const set = linksRef.current.get(id) ?? new Set<HTMLAnchorElement>();
    linksRef.current.set(id, set);
    set.add(el);
    if (activeIdRef.current === id) el.setAttribute(ACTIVE_ATTR, '');
    return () => {
      set.delete(el);
    };
  }, []);

  const scrollToId = useCallback(
    (id: string) => {
      lockedRef.current = true;
      applyActive(id);
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });

      if (pollRafRef.current !== null) cancelAnimationFrame(pollRafRef.current);

      let prev = window.scrollY;
      let stableFrames = 0;

      const poll = () => {
        const cur = window.scrollY;

        if (cur === prev) {
          stableFrames += 1;
          if (stableFrames >= 5) {
            pollRafRef.current = null;
            lockedRef.current = false;
            applyActive(getActiveId(idsRef.current));
            return;
          }
        } else {
          stableFrames = 0;
          prev = cur;
        }

        pollRafRef.current = requestAnimationFrame(poll);
      };

      pollRafRef.current = requestAnimationFrame(poll);
    },
    [applyActive],
  );

  return { scrollToId, registerLink };
}
