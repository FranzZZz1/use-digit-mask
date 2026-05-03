// eslint-disable-next-line import/no-unassigned-import
import '@testing-library/jest-dom/vitest';

type RafEntry = { id: number; cb: FrameRequestCallback };
const rafQueue: RafEntry[] = [];
let rafCounter = 0;

Object.defineProperty(globalThis, 'requestAnimationFrame', {
  writable: true,
  value: (cb: FrameRequestCallback): number => {
    // eslint-disable-next-line no-plusplus
    const id = ++rafCounter;
    rafQueue.push({ id, cb });
    return id;
  },
});

Object.defineProperty(globalThis, 'cancelAnimationFrame', {
  writable: true,
  value: (id: number): void => {
    const idx = rafQueue.findIndex((e) => e.id === id);
    if (idx !== -1) rafQueue.splice(idx, 1);
  },
});

export function flushRaf(): void {
  const entries = rafQueue.splice(0);
  entries.forEach(({ cb }) => {
    cb(0);
  });
}
