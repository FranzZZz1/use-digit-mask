import { useEffect, useRef, useState } from 'react';

export function useDebounced<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timerRef.current !== null) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setDebounced(value);
      timerRef.current = null;
    }, delay);
    return () => {
      if (timerRef.current !== null) clearTimeout(timerRef.current);
    };
  }, [value, delay]);

  return debounced;
}
