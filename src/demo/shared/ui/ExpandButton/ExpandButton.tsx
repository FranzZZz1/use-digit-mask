import CollapseIcon from '@/shared/assets/icons/CollapseIcon.svg?react';
import ExpandIcon from '@/shared/assets/icons/ExpandIcon.svg?react';
import { useLang } from '@/shared/i18n';

type Props = {
  isFullscreen: boolean;
  onClick: () => void;
  className?: string;
};

export function ExpandButton({ isFullscreen, className, onClick }: Props) {
  const { t } = useLang();
  return (
    <button
      type="button"
      className={className}
      aria-label={isFullscreen ? t.code.collapse : t.code.expand}
      onClick={onClick}
    >
      {isFullscreen ? <CollapseIcon aria-hidden="true" /> : <ExpandIcon aria-hidden="true" />}
    </button>
  );
}
