import { useState } from 'react';

import { PlaygroundCard } from '@/shared/ui/PlaygroundCard';
import { PlaygroundSwitchModal } from '@/widgets/playground';

import { type PlaygroundId } from '../registry';

import styles from './ExamplesPlayground.module.scss';

type Props = {
  initialHook: PlaygroundId;
  initialProp: string;
};

export function ExamplesPlayground({ initialHook, initialProp }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className={styles.card}>
      <PlaygroundCard
        onOpen={() => {
          setOpen(true);
        }}
      />
      {open && (
        <PlaygroundSwitchModal
          initialHook={initialHook}
          initialProp={initialProp}
          onClose={() => {
            setOpen(false);
          }}
        />
      )}
    </section>
  );
}
