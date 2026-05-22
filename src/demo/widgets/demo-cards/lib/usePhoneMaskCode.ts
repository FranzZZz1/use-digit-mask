import { type CodeComments, type CodeTab, dedent, rhfMaskTab, tab } from '@/shared/lib/snippetUtils';

const GHOST_PHONE_SCSS = dedent`
  .wrapper {
    position: relative;
  }

  .overlay {
    pointer-events: none;
    user-select: none;

    position: absolute;
    z-index: 2;
    inset: 0;

    overflow: hidden;
    display: flex;
    align-items: center;

    padding: 8px 12px;

    white-space: pre;

    font-family: monospace;
  }

  .overlay__filled {
    color: transparent;
  }

  .overlay__empty {
    color: rgba(128, 128, 128, 0.5);
  }
`;

export function buildCodeGhostPhone(c: CodeComments): CodeTab[] {
  return [
    tab(
      'TSX',
      dedent`
      import { useState } from 'react';
      import { usePhoneMask, E164_MASK } from 'use-digit-mask';

      import styles from './PhoneField.module.scss';

      function PhoneField() {
        const [value, setValue] = useState('');

        const { props, ghostValue, mask } = usePhoneMask({
          value,
          onChange: (next) => setValue(next),
          trimMaskTail: true,
          // ${c.ghostChar}
          ghostChar: '·',
        });

        // ${c.ghostOnlyWhenResolved}
        const showGhost = mask !== E164_MASK;

        return (
          <div className={styles.wrapper}>
            <input
              {...props}
              type="text"
              inputMode="numeric"
              placeholder="Start typing a number..."
            />
            {showGhost && ghostValue && (
              <span
                aria-hidden="true"
                className={styles.overlay}
              >
                <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
                <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
              </span>
            )}
          </div>
        );
      }
    `,
    ),
    tab('SCSS', GHOST_PHONE_SCSS, 'scss'),
  ];
}

export function buildCodePhoneAuto(c: CodeComments): CodeTab[] {
  return [
    tab(
      'Basic',
      dedent`
      import { useState } from 'react';
      import { usePhoneMask } from 'use-digit-mask';

      function PhoneField() {
        const [value, setValue] = useState('');

        const {
          props,
          candidates,
          selectCandidate,
        } = usePhoneMask({
          value,
          onChange: (next) => setValue(next),
          trimMaskTail: true,
        });

        return (
          <div>
            <input {...props} type="text" inputMode="numeric" />

            {/* ${c.candidates} */}
            {candidates.length > 1 && (
              <div>
                {candidates.map((c) => (
                  <button key={c.id} onClick={() => selectCandidate(c)}>
                    {c.label} {c.prefix}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
    `,
    ),
    tab(
      'Uncontrolled',
      dedent`
      import { usePhoneMask } from 'use-digit-mask';

      // ${c.uncontrolled}
      function PhoneField() {
        const { props, candidates, selectCandidate } = usePhoneMask({
          defaultValue: '',
          trimMaskTail: true,
        });

        return (
          <div>
            <input {...props} type="text" inputMode="numeric" />

            {candidates.length > 1 && (
              <div>
                {candidates.map((c) => (
                  <button key={c.id} onClick={() => selectCandidate(c)}>
                    {c.label} {c.prefix}
                  </button>
                ))}
              </div>
            )}
          </div>
        );
      }
    `,
    ),
    rhfMaskTab('React Hook Form', {
      componentName: 'Phone',
      fieldName: 'phone',
      hook: 'usePhoneMask',
      destructure: '{ props, candidates, selectCandidate }',
      hookOptions: ['trimMaskTail: true,'],
      jsx: `<div>
  <input {...props} type="text" inputMode="numeric" />

  {candidates.length > 1 && (
    <div>
      {candidates.map((c) => (
        <button key={c.id} onClick={() => selectCandidate(c)}>
          {c.label} {c.prefix}
        </button>
      ))}
    </div>
  )}
</div>`,
    }),
  ];
}
