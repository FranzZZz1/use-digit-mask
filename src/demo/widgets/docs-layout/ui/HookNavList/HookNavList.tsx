import cx from 'clsx';

import { useHookNavHandlers } from '@/shared/lib';

import { HOOKS } from '../../const/const';

type HookNavListProps = {
  currentPath: string | undefined;
  linkClass: string;
  activeLinkClass: string;
  onSamePath?: () => void;
};

export function HookNavList({ currentPath, onSamePath, linkClass, activeLinkClass }: HookNavListProps) {
  const handlers = useHookNavHandlers(currentPath, onSamePath);

  return (
    <>
      {HOOKS.map(({ path, label }, i) => (
        <a
          key={path}
          href={path}
          className={cx(linkClass, path === currentPath && activeLinkClass)}
          onClick={handlers[i]}
        >
          {label}
        </a>
      ))}
    </>
  );
}
