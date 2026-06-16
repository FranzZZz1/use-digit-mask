import {
  type CodeComments,
  type CodeTab,
  createCodeTab,
  dedent,
  GHOST_PHONE_SCSS,
  rhfMaskTab,
  withGhostScssTab,
} from '@/shared/lib/snippetUtils';

export function buildCodeGhostPhone(c: CodeComments): CodeTab[] {
  return withGhostScssTab(
    [
      createCodeTab(
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
          ghostChar: '9',
        });

        // ${c.ghostOnlyWhenResolved}
        const showGhost = mask !== E164_MASK;

        return (
          <div className={styles.wrapper}>
            <input
              {...props}
              type="text"
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
    ],
    true,
    GHOST_PHONE_SCSS,
  );
}

export function buildCodePhoneAuto(c: CodeComments): CodeTab[] {
  return [
    createCodeTab(
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
            <input {...props} type="text" />

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
    createCodeTab(
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
            <input {...props} type="text" />

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
  <input {...props} type="text" />

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
