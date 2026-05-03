import { type CSSProperties, type ReactNode, useState } from 'react';

import { useDocsScrollRestoration, useDocsUI } from '@/shared/lib';
import { BackBanner } from '@/shared/ui/BackBanner';

type Props = {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
};

export function PageWithBanner({ className, style, children }: Props) {
  useDocsScrollRestoration();

  const backTo = useDocsUI((s) => s.backTo);
  const setBackTo = useDocsUI((s) => s.setBackTo);
  const [isClosing, setIsClosing] = useState(false);

  const handleClosed = () => {
    setBackTo(null);
    setIsClosing(false);

    const usr = (window.history.state as Record<string, unknown>)?.usr;
    window.history.replaceState(
      { ...window.history.state, usr: { ...(typeof usr === 'object' ? usr : {}), backTo: null } },
      '',
    );
  };

  const bannerStyle: CSSProperties | undefined = backTo
    ? ({ '--sticky-top': 'calc(var(--header-height) + var(--banner-height))' } as CSSProperties)
    : undefined;

  return (
    <div className={className} style={backTo ? { ...bannerStyle, ...style } : style}>
      {backTo && (
        <BackBanner
          isClosing={isClosing}
          backTo={backTo}
          onDismiss={() => {
            setIsClosing(true);
          }}
          onClosed={handleClosed}
        />
      )}
      {children}
    </div>
  );
}
