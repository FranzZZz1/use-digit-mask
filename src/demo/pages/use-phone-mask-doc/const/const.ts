import { type CodeComments, dedent } from '@/shared/lib/snippetUtils';

export function buildSnippetOverride(c: CodeComments): string {
  return dedent`
    import { useState } from 'react';
    import { mergeDialPlans, usePhoneMask } from 'use-digit-mask';

    const customPlans = mergeDialPlans({
      DE: { pattern: '## #########' }, // ${c.overridePattern}
    });

    function PhoneInput() {
      const [value, setValue] = useState('');
      const { props } = usePhoneMask({ value, onChange: setValue, dialPlans: customPlans });
      return <input {...props} />;
    }
  `;
}

export function buildSnippetRemove(c: CodeComments): string {
  return dedent`
    import { mergeDialPlans } from 'use-digit-mask';

    // ${c.removeCountry}
    const customPlans = mergeDialPlans({ KZ: null });
  `;
}

export function buildSnippetAdd(c: CodeComments): string {
  return dedent`
    import { mergeDialPlans } from 'use-digit-mask';

    // ${c.addPlan}
    const customPlans = mergeDialPlans({
      XX: { cc: '999', pattern: '###-###', label: 'Custom Country' },
    });
  `;
}
