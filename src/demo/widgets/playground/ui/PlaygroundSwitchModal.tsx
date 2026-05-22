import { useState } from 'react';

import { useLang } from '@/shared/i18n';
import { useSyntax } from '@/shared/lib';
import { PlaygroundControls, PlaygroundModal, type PlaygroundSlot } from '@/shared/ui/Playground';
import { VariantSelect } from '@/shared/ui/VariantSelect';

import { useCountrySelectPlaygroundSlot } from '../country-select/slot';
import { useMaskPlaygroundSlot } from '../mask/slot';
import { usePhoneMaskPlaygroundSlot } from '../phone-mask/slot';
import { PLAYGROUND_IDS, PLAYGROUND_INDEX, PLAYGROUND_OPTIONS, type PlaygroundId } from '../registry';

import styles from './PlaygroundSwitchModal.module.scss';

type Props = {
  initialHook: PlaygroundId;
  initialProp: string;
  onClose: () => void;
};

export function PlaygroundSwitchModal({ initialHook, initialProp, onClose }: Props) {
  const { t } = useLang();
  const { isAlternative } = useSyntax();
  const { tooltips } = t.demo.playground;

  const [selectedHook, setSelectedHook] = useState<PlaygroundId>(initialHook);

  const mask = useMaskPlaygroundSlot(initialHook === 'useMask' ? initialProp : '', isAlternative, tooltips);
  const phone = usePhoneMaskPlaygroundSlot(initialHook === 'usePhoneMask' ? initialProp : '', isAlternative, tooltips);
  const country = useCountrySelectPlaygroundSlot(initialHook === 'useCountrySelect' ? initialProp : '');

  const slots: Record<PlaygroundId, PlaygroundSlot> = { useMask: mask, usePhoneMask: phone, useCountrySelect: country };
  const active = slots[selectedHook];

  const titleNode = (
    <div className={styles.title}>
      {'Playground · '}
      <VariantSelect
        options={PLAYGROUND_OPTIONS}
        value={PLAYGROUND_INDEX[selectedHook]}
        onChange={(v) => {
          setSelectedHook(PLAYGROUND_IDS[v]);
        }}
      />
    </div>
  );

  return (
    <PlaygroundModal title={titleNode} tabs={active.tabs} onClose={onClose}>
      <PlaygroundControls
        schema={active.schema}
        state={active.pg.state}
        tooltips={tooltips}
        preview={active.preview}
        primaryFields={active.primaryFields}
        onToggle={active.pg.toggle}
        onStrChange={active.pg.setStrValue}
      />
    </PlaygroundModal>
  );
}
