import { useCallback, useEffect, useRef, useState } from 'react';

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

export function useTocHighlight(ids: string[]): { activeId: string; scrollToId: (id: string) => void } {
  const [activeId, setActiveId] = useState(ids[0] ?? '');
  const lockedRef = useRef(false);
  const highlightRafRef = useRef<number | null>(null);
  const pollRafRef = useRef<number | null>(null);
  const idsRef = useRef(ids);

  useEffect(() => {
    idsRef.current = ids;
  }, [ids]);

  useEffect(() => {
    if (!ids.length) return undefined;

    setActiveId(ids[0] ?? '');
    lockedRef.current = false;

    const handleScroll = () => {
      if (lockedRef.current) return;
      if (highlightRafRef.current !== null) return;
      highlightRafRef.current = requestAnimationFrame(() => {
        highlightRafRef.current = null;
        setActiveId(getActiveId(idsRef.current));
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
  }, [ids]);

  const scrollToId = useCallback((id: string) => {
    lockedRef.current = true;
    setActiveId(id);
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
          setActiveId(getActiveId(idsRef.current));
          return;
        }
      } else {
        stableFrames = 0;
        prev = cur;
      }

      pollRafRef.current = requestAnimationFrame(poll);
    };

    pollRafRef.current = requestAnimationFrame(poll);
  }, []);

  return { activeId, scrollToId };
}
