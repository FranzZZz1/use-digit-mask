import { Tooltip } from 'react-tooltip';

import InfoIcon from '@/shared/assets/icons/InfoIcon.svg?react';

import 'react-tooltip/dist/react-tooltip.css';
import styles from './PlaygroundTooltip.module.scss';

type HintProps = { tooltip: string };

export function PlaygroundHint({ tooltip }: HintProps) {
  return (
    <span className={styles.hint} data-tooltip-id="pg-hint-tip" data-tooltip-content={tooltip}>
      <InfoIcon aria-hidden="true" />
    </span>
  );
}

export function PlaygroundTooltip() {
  return (
    <Tooltip
      noArrow
      className="pg-tooltip"
      id="pg-hint-tip"
      openEvents={{ mouseenter: true, focus: true, click: true }}
      globalCloseEvents={{ escape: true, scroll: true, clickOutsideAnchor: true }}
    />
  );
}
