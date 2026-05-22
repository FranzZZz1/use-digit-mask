import { cloneElement, type ReactElement, type ReactNode } from 'react';

export const ConditionalWrap = <T extends boolean | string | null | undefined>({
  condition,
  wrapIn,
  children,
  fallbackWrap = undefined,
}: {
  condition: T;
  wrapIn: ReactElement;
  children?: ReactNode;
  fallbackWrap?: ReactElement;
}): ReactNode => {
  if (condition) return cloneElement(wrapIn, {}, children);

  return fallbackWrap ? cloneElement(fallbackWrap, {}, children) : children;
};
