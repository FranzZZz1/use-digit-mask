import { useEffect, useRef, useState } from 'react';

const MOBILE_MQ = '(max-width: 768px)';

const ANIMATION_MS = 250;

type Options = {
  /**
   * Minimum fraction of the viewport height (0–1) that must remain
   * for the secondary panel (code) below the preview/controls panel.
   * When set, `--preview-h` is capped to `parentHeight - minCodeFraction * window.innerHeight`.
   * Default: 0 (no cap).
   */
  minCodeFraction?: number;
};

export function usePreviewCollapse({ minCodeFraction = 0 }: Options = {}) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);

  const previewRef = useRef<HTMLDivElement>(null);
  const isAnimatingRef = useRef(false);
  const isFullscreenRef = useRef(false);
  isFullscreenRef.current = isFullscreen;
  const timerRef = useRef<number>(0);

  const clampHeight = (el: HTMLElement, h: number): number => {
    if (minCodeFraction <= 0) return h;
    const parentH = el.parentElement?.getBoundingClientRect().height ?? 0;
    const minCodeH = Math.round(window.innerHeight * minCodeFraction);
    const maxH = parentH > 0 ? Math.max(0, parentH - minCodeH) : h;
    return Math.min(h, maxH);
  };

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return undefined;

    const mq = window.matchMedia(MOBILE_MQ);

    const ro = new ResizeObserver(([entry]) => {
      if (isAnimatingRef.current || isFullscreenRef.current) return;

      if (!mq.matches) {
        el.style.removeProperty('--preview-h');
        return;
      }

      const h = entry.borderBoxSize?.[0]?.blockSize ?? entry.contentRect.height;
      const clamped = clampHeight(el, h);
      if (clamped > 0) el.style.setProperty('--preview-h', `${clamped}px`);
    });

    ro.observe(el);
    return () => {
      ro.disconnect();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [minCodeFraction]);

  useEffect(
    () => () => {
      clearTimeout(timerRef.current);
    },
    [],
  );

  const handleFullscreen = () => {
    const nextIsFullscreen = !isFullscreen;

    isAnimatingRef.current = true;
    setIsAnimating(true);
    setIsFullscreen(nextIsFullscreen);
    clearTimeout(timerRef.current);

    timerRef.current = window.setTimeout(() => {
      isAnimatingRef.current = false;
      setIsAnimating(false);

      if (!nextIsFullscreen) {
        const el = previewRef.current;
        if (el && window.matchMedia(MOBILE_MQ).matches) {
          const h = el.getBoundingClientRect().height;
          const clamped = clampHeight(el, h);
          if (clamped > 0) el.style.setProperty('--preview-h', `${clamped}px`);
        }
      }
    }, ANIMATION_MS);
  };

  return { previewRef, isFullscreen, isAnimating, handleFullscreen };
}
