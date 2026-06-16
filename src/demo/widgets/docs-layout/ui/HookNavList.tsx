import { NavLink, useLocation } from 'react-router-dom';
import cx from 'clsx';

import { useDocsNavigate } from '@/shared/lib';

import { HOOKS } from '../const/const';

type HookNavListProps = {
  linkClass: string;
  activeLinkClass: string;
  onSamePath?: () => void;
};

export function HookNavList({ onSamePath, linkClass, activeLinkClass }: HookNavListProps) {
  const { pathname } = useLocation();
  const navigate = useDocsNavigate();

  return (
    <>
      {HOOKS.map(({ path, label, examplesPath }) => {
        const isOnThisHook = pathname === path || pathname === examplesPath;
        return (
          <NavLink
            key={path}
            to={path}
            className={({ isActive }) => cx(linkClass, isActive && activeLinkClass)}
            onClick={(e) => {
              e.preventDefault();
              if (isOnThisHook) {
                onSamePath?.();
                window.scrollTo({ top: 0, behavior: 'smooth' });
              } else {
                navigate(path);
              }
            }}
          >
            {label}
          </NavLink>
        );
      })}
    </>
  );
}
