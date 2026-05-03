import { type CodeComments, type CodeTab, dedent, rhfMaskTab, tab } from '@/shared/lib/snippetUtils';

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
      jsx: `    <div>
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
