import {
  basicMaskTab,
  type CodeComments,
  type CodeTab,
  dedent,
  GHOST_SCSS,
  numericInput,
  rhfMaskTab,
  tab,
} from '@/shared/lib/snippetUtils';

export function buildCodePhoneRu(c: CodeComments): CodeTab[] {
  return [
    basicMaskTab('Basic', {
      componentName: 'PhoneRU',
      hookOptions: [
        `mask: '+7 (###) ###-##-##',`,
        `// ${c.allowedPrefixes}`,
        `allowedPrefixes: ['+7', '8'],`,
        `activateOnFocus: true,`,
        `deactivateOnEmptyBlur: true,`,
      ],
      jsx: numericInput('+7 (___) ___-__-__'),
    }),
    rhfMaskTab('React Hook Form', {
      componentName: 'Phone',
      fieldName: 'phone',
      hookOptions: [
        `mask: '+7 (###) ###-##-##',`,
        `allowedPrefixes: ['+7', '8'],`,
        `activateOnFocus: true,`,
        `deactivateOnEmptyBlur: true,`,
      ],
      jsx: numericInput('+7 (___) ___-__-__'),
    }),
  ];
}

export const CODE_CREDIT_CARD: CodeTab[] = [
  basicMaskTab('Basic', {
    componentName: 'CreditCard',
    hookOptions: [`mask: '#### #### #### ####',`],
    jsx: numericInput('#### #### #### ####'),
  }),
  rhfMaskTab('React Hook Form', {
    componentName: 'Card',
    fieldName: 'card',
    hookOptions: [`mask: '#### #### #### ####',`],
    jsx: numericInput('#### #### #### ####'),
  }),
];

export const CODE_DATE: CodeTab[] = [
  basicMaskTab('Basic', {
    componentName: 'DateField',
    hookOptions: [`mask: '##/##/####',`],
    jsx: numericInput('MM/DD/YYYY'),
  }),
  rhfMaskTab('React Hook Form', {
    componentName: 'Date',
    fieldName: 'date',
    hookOptions: [`mask: '##/##/####',`],
    jsx: numericInput('MM/DD/YYYY'),
  }),
];

export function buildCodeNormalize(c: CodeComments): CodeTab[] {
  const tsCode = dedent`
    import { useState } from 'react';
    import { useMask } from 'use-digit-mask';

    // ${c.normalize}
    function normalizeTime(digits: string): string {
      let result = digits;

      if (result.length >= 2) {
        const hh = Math.min(parseInt(result.slice(0, 2), 10), 23);
        result = String(hh).padStart(2, '0') + result.slice(2);
      }

      if (result.length >= 4) {
        const mm = Math.min(parseInt(result.slice(2, 4), 10), 59);
        result = result.slice(0, 2) + String(mm).padStart(2, '0');
      }

      return result;
    }

    function TimeField() {
      const [value, setValue] = useState<string>('');

      const { props } = useMask({
        mask: '##:##',
        normalize: normalizeTime,
        value,
        onChange: setValue,
      });

      return (
        <input
          {...props}
          type="text"
          inputMode="numeric"
          placeholder="HH:MM"
        />
      );
    }
  `;

  const jsCode = dedent`
    import { useState } from 'react';
    import { useMask } from 'use-digit-mask';

    // ${c.normalize}
    function normalizeTime(digits) {
      let result = digits;

      if (result.length >= 2) {
        const hh = Math.min(parseInt(result.slice(0, 2), 10), 23);
        result = String(hh).padStart(2, '0') + result.slice(2);
      }

      if (result.length >= 4) {
        const mm = Math.min(parseInt(result.slice(2, 4), 10), 59);
        result = result.slice(0, 2) + String(mm).padStart(2, '0');
      }

      return result;
    }

    function TimeField() {
      const [value, setValue] = useState('');

      const { props } = useMask({
        mask: '##:##',
        normalize: normalizeTime,
        value,
        onChange: setValue,
      });

      return (
        <input
          {...props}
          type="text"
          inputMode="numeric"
          placeholder="HH:MM"
        />
      );
    }
  `;

  return [{ label: 'Basic', code: tsCode, codeJs: jsCode }];
}

export function buildCodeGhostMask(c: CodeComments): [CodeTab[], CodeTab[]] {
  const alwaysVisible: CodeTab[] = [
    tab(
      'TSX',
      dedent`
        import { useState } from 'react';
        import { useMask } from 'use-digit-mask';

        import styles from './CardField.module.scss';

        function CardField() {
          const [value, setValue] = useState('');

          const { props, ghostValue } = useMask({
            mask: '#### #### #### ####',
            trimMaskTail: true,
            // ${c.ghostChar}
            ghostChar: '·',
            value,
            onChange: setValue,
          });

          return (
            <div className={styles.wrapper}>
              <input
                {...props}
                type="text"
                inputMode="numeric"
                placeholder="Card number"
              />
              {ghostValue && (
                <span aria-hidden="true" className={styles.overlay}>
                  <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
                  <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
                </span>
              )}
            </div>
          );
        }
      `,
    ),
    tab('SCSS', GHOST_SCSS, 'scss'),
  ];

  const hideOnInput: CodeTab[] = [
    tab(
      'TSX',
      dedent`
        import { useState } from 'react';
        import { useMask } from 'use-digit-mask';

        import styles from './CardField.module.scss';

        function CardField() {
          const [value, setValue] = useState('');

          const { props, ghostValue } = useMask({
            mask: '#### #### #### ####',
            trimMaskTail: true,
            ghostChar: '·',
            value,
            onChange: setValue,
          });

          // ${c.hideGhostOnInput}
          return (
            <div className={styles.wrapper}>
              <input
                {...props}
                type="text"
                inputMode="numeric"
                placeholder="Card number"
              />
              {!value && ghostValue && (
                <span aria-hidden="true" className={styles.overlay}>
                  <span className={styles.overlay__filled}>{ghostValue.slice(0, value.length)}</span>
                  <span className={styles.overlay__empty}>{ghostValue.slice(value.length)}</span>
                </span>
              )}
            </div>
          );
        }
      `,
    ),
    tab('SCSS', GHOST_SCSS, 'scss'),
  ];

  return [alwaysVisible, hideOnInput];
}

export function buildCodeAlwaysActive(c: CodeComments): CodeTab[] {
  return [
    basicMaskTab('Basic', {
      componentName: 'PhoneField',
      hookOptions: [`mask: '+7 (###) ###-##-##',`, `// ${c.alwaysActive}`, `alwaysActive: true,`],
      jsx: numericInput('+7 (___) ___-__-__'),
    }),
  ];
}

export function buildCodePin(c: CodeComments): CodeTab[] {
  return [
    basicMaskTab('Basic', {
      componentName: 'PinField',
      hookOptions: [`mask: '####',`, `// ${c.trimMaskTail}`, `trimMaskTail: true,`],
      jsx: numericInput('PIN'),
    }),
    rhfMaskTab('React Hook Form', {
      componentName: 'Pin',
      fieldName: 'pin',
      hookOptions: [`mask: '####',`, `trimMaskTail: true,`],
      jsx: numericInput('PIN'),
    }),
  ];
}
