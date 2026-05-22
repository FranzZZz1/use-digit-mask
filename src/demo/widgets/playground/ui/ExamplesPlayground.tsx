import { useState } from 'react';

import { PlaygroundCard } from '@/shared/ui/PlaygroundCard';

import { type PlaygroundId } from '../registry';

import { PlaygroundSwitchModal } from './PlaygroundSwitchModal';

import exStyles from '@/shared/ui/doc/examples.module.scss';

type Props = {
  initialHook: PlaygroundId;
  initialProp: string;
};

export function ExamplesPlayground({ initialHook, initialProp }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <section className={exStyles.card}>
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
