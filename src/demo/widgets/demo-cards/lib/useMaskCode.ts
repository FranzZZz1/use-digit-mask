import {
  buildMaskCodeTab,
  type CodeComments,
  type CodeTab,
  createCodeTab,
  dedent,
  numericInput,
  rhfMaskTab,
  withGhostScssTab,
} from '@/shared/lib/snippetUtils';

export function buildRecipeOnComplete(c: CodeComments): CodeTab {
  return createCodeTab(
    'TSX',
    dedent`
      import { useState } from 'react';
      import { useMask } from 'use-digit-mask';

      function PinField({ onSubmit }: { onSubmit: (pin: string) => void }) {
        const [value, setValue] = useState('');

        const { props } = useMask({
          mask: '####',
          trimMaskTail: true,
          value,
          onChange: setValue,
          // ${c.recipeOnComplete}
          onComplete: ({ rawWithoutPrefix }) => onSubmit(rawWithoutPrefix),
        });

        return <input {...props} type="text" placeholder="PIN" />;
      }
    `,
  );
}

function blocksDateFieldSnippet(c: CodeComments): string {
  return dedent`
    function DateField() {
      const [value, setValue] = useState('');

      const { props } = useMask({
        mask: 'DD/MM/YYYY',
        // ${c.recipeBlocks}
        blocks: {
          DD: ({ MM, YYYY }) => ({ min: 1, max: daysInMonth(MM, YYYY) }),
          MM: { min: 1, max: 12 },
          YYYY: { min: 1, max: 9999 },
        },
        overwrite: true,
        value,
        onChange: setValue,
      });

      return <input {...props} type="text" placeholder="DD/MM/YYYY" />;
    }
  `;
}

export function buildRecipeBlocks(c: CodeComments): CodeTab[] {
  const dateField = blocksDateFieldSnippet(c);

  const base = createCodeTab(
    'Base',
    [
      `import { useState } from 'react';`,
      `import { useMask } from 'use-digit-mask';`,
      '',
      dedent`
        const DAYS_PER_MONTH = [31, 29, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        // ${c.recipeBlocksDays}
        function daysInMonth(monthStr: string, yearStr: string): number {
          const month = parseInt(monthStr, 10);
          if (!month || monthStr.length < 2) return 31;
          if (month === 2 && yearStr.length === 4) {
            const year = parseInt(yearStr, 10);
            return (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0 ? 29 : 28;
          }
          return DAYS_PER_MONTH[month - 1] ?? 31;
        }
      `,
      '',
      dateField,
    ].join('\n'),
  );

  const dateFns = createCodeTab(
    'date-fns',
    [
      `import { useState } from 'react';`,
      `import { getDaysInMonth } from 'date-fns';`,
      `import { useMask } from 'use-digit-mask';`,
      '',
      dedent`
        // ${c.recipeBlocksDays}
        function daysInMonth(monthStr: string, yearStr: string): number {
          if (!monthStr || monthStr.length < 2) return 31;
          const year = yearStr.length === 4 ? parseInt(yearStr, 10) : new Date().getFullYear();
          return getDaysInMonth(new Date(year, parseInt(monthStr, 10) - 1));
        }
      `,
      '',
      dateField,
    ].join('\n'),
  );

  const momentTab = createCodeTab(
    'moment',
    [
      `import { useState } from 'react';`,
      `import moment from 'moment';`,
      `import { useMask } from 'use-digit-mask';`,
      '',
      dedent`
        // ${c.recipeBlocksDays}
        function daysInMonth(monthStr: string, yearStr: string): number {
          if (!monthStr || monthStr.length < 2) return 31;
          const year = yearStr.length === 4 ? parseInt(yearStr, 10) : moment().year();
          return moment({ year, month: parseInt(monthStr, 10) - 1 }).daysInMonth();
        }
      `,
      '',
      dateField,
    ].join('\n'),
  );

  return [base, dateFns, momentTab];
}

export function buildCodePhoneRu(c: CodeComments): CodeTab[] {
  return [
    buildMaskCodeTab('Basic', {
      componentName: 'PhoneRU',
      hookOptions: [
        `mask: '+7 (###) ###-##-##',`,
        `// ${c.prefixAliases}`,
        `prefixAliases: ['+7', '8'],`,
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
        `prefixAliases: ['+7', '8'],`,
        `activateOnFocus: true,`,
        `deactivateOnEmptyBlur: true,`,
      ],
      jsx: numericInput('+7 (___) ___-__-__'),
    }),
  ];
}

export const CODE_CREDIT_CARD: CodeTab[] = [
  buildMaskCodeTab('Basic', {
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
  buildMaskCodeTab('Basic', {
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
          placeholder="HH:MM"
        />
      );
    }
  `;

  return [{ label: 'Basic', code: tsCode, jsVariant: jsCode }];
}

export function buildCodeGhostMask(c: CodeComments): [CodeTab[], CodeTab[]] {
  const alwaysVisible = withGhostScssTab(
    [
      createCodeTab(
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
    ],
    true,
  );

  const hideOnInput = withGhostScssTab(
    [
      createCodeTab(
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
    ],
    true,
  );

  return [alwaysVisible, hideOnInput];
}

export function buildCodeAlwaysActive(c: CodeComments): CodeTab[] {
  return [
    buildMaskCodeTab('Basic', {
      componentName: 'PhoneField',
      hookOptions: [`mask: '+7 (###) ###-##-##',`, `// ${c.alwaysActive}`, `alwaysActive: true,`],
      jsx: numericInput('+7 (___) ___-__-__'),
    }),
  ];
}

function buildDynamicMaskSource(ts: boolean, c: CodeComments): string {
  const sig = ts ? '(digits: string): string' : '(digits)';
  const generic = ts ? '<string>' : '';

  return dedent`
    import { useState } from 'react';
    import { useMask } from 'use-digit-mask';

    const MASK_DEFAULT = '#### #### #### ####'; // Visa / MC
    const MASK_AMEX    = '#### ###### #####';   // American Express

    // ${c.dynamicMask}
    function getCardMask${sig} {
      return digits.startsWith('34') || digits.startsWith('37')
        ? MASK_AMEX
        : MASK_DEFAULT;
    }

    function CardField() {
      const [value, setValue] = useState${generic}('');

      const { props } = useMask({
        mask: getCardMask,
        value,
        onChange: setValue,
      });

      return (
        <input
          {...props}
          type="text"
          placeholder="Card number"
        />
      );
    }
  `;
}

export function buildCodeDynamicMask(c: CodeComments): CodeTab[] {
  return [{ label: 'Basic', code: buildDynamicMaskSource(true, c), jsVariant: buildDynamicMaskSource(false, c) }];
}

function buildOverwriteSource(ts: boolean, c: CodeComments): string {
  const generic = ts ? '<string>' : '';

  return dedent`
    import { useState } from 'react';
    import { useMask } from 'use-digit-mask';

    function DateField() {
      const [value, setValue] = useState${generic}('');

      const { props } = useMask({
        mask: '##/##/####',
        // ${c.overwrite}
        overwrite: true,
        value,
        onChange: setValue,
      });

      return <input {...props} type="text" placeholder="DD/MM/YYYY" />;
    }
  `;
}

export function buildCodeOverwrite(c: CodeComments): CodeTab[] {
  return [{ label: 'Basic', code: buildOverwriteSource(true, c), jsVariant: buildOverwriteSource(false, c) }];
}

function buildPhoneOrEmailSource(ts: boolean, c: CodeComments): string {
  const sig = ts ? '(value: string): boolean' : '(value)';
  const generic = ts ? '<string>' : '';

  return dedent`
    import { useState } from 'react';
    import { useMask } from 'use-digit-mask';

    // ${c.recipePhoneOrEmail}
    const isEmailLike = ${sig} => /[a-zA-Z@]/.test(value);

    function PhoneOrEmailField() {
      const [value, setValue] = useState${generic}('');

      const { props } = useMask({
        mask: '+7 (###) ###-##-##',
        prefixAliases: ['+7', '8'],
        bypassMask: isEmailLike,
        value,
        onChange: setValue,
      });

      return <input {...props} type="text" placeholder="Phone or email" />;
    }
  `;
}

export function buildCodePhoneOrEmail(c: CodeComments): CodeTab[] {
  return [{ label: 'Basic', code: buildPhoneOrEmailSource(true, c), jsVariant: buildPhoneOrEmailSource(false, c) }];
}

export function buildCodePin(c: CodeComments): CodeTab[] {
  return [
    buildMaskCodeTab('Basic', {
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
