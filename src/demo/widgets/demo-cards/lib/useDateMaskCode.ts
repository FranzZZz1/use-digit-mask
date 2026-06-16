import { type CodeComments, type CodeTab, createCodeTab, dedent } from '@/shared/lib/snippetUtils';

function buildDateMaskSource(ts: boolean, c: CodeComments, format: string, placeholder: string): string {
  const generic = ts ? '<string>' : '';

  return dedent`
    import { useState } from 'react';
    import { useDateMask } from 'use-digit-mask';

    function DateField() {
      const [value, setValue] = useState${generic}('');

      const { props } = useDateMask({
        // ${c.dateMask}
        format: '${format}',
        overwrite: true,
        value,
        onChange: setValue,
      });

      return <input {...props} type="text" placeholder="${placeholder}" />;
    }
  `;
}

export function buildCodeDateMask(c: CodeComments): CodeTab[] {
  return [
    {
      label: 'Basic',
      code: buildDateMaskSource(true, c, 'dd/MM/yyyy', 'DD/MM/YYYY'),
      jsVariant: buildDateMaskSource(false, c, 'dd/MM/yyyy', 'DD/MM/YYYY'),
    },
  ];
}

export function buildCodeDateMaskIso(c: CodeComments): CodeTab[] {
  return [
    {
      label: 'Basic',
      code: buildDateMaskSource(true, c, 'yyyy-MM-dd', 'YYYY-MM-DD'),
      jsVariant: buildDateMaskSource(false, c, 'yyyy-MM-dd', 'YYYY-MM-DD'),
    },
  ];
}

export function buildCodeDateMaskDatetime(c: CodeComments): CodeTab[] {
  return [
    {
      label: 'Basic',
      code: buildDateMaskSource(true, c, 'dd.MM.yyyy HH:mm', 'DD.MM.YYYY HH:MM'),
      jsVariant: buildDateMaskSource(false, c, 'dd.MM.yyyy HH:mm', 'DD.MM.YYYY HH:MM'),
    },
  ];
}

export function buildRecipeBirthDate(c: CodeComments): CodeTab {
  return createCodeTab(
    'TSX',
    dedent`
      import { useState } from 'react';
      import { useDateMask } from 'use-digit-mask';

      function BirthDateField() {
        const [value, setValue] = useState('');

        // ${c.recipeBirthDate}
        const maxDate = new Date(new Date().getFullYear(), 11, 31);

        const { props } = useDateMask({
          format: 'dd/MM/yyyy',
          overwrite: true,
          min: new Date('1900-01-01'),
          max: maxDate,
          value,
          onChange: setValue,
        });

        return <input {...props} type="text" placeholder="DD/MM/YYYY" />;
      }
    `,
  );
}

export function buildRecipeDateMax(c: CodeComments): CodeTab {
  return createCodeTab(
    'TSX',
    dedent`
      import { useState } from 'react';
      import { useDateMask } from 'use-digit-mask';

      function DateField() {
        const [value, setValue] = useState('');

        const { props } = useDateMask({
          format: 'dd/MM/yyyy',
          overwrite: true,
          // ${c.recipeDateMax}
          max: new Date(),
          value,
          onChange: setValue,
        });

        return <input {...props} type="text" placeholder="DD/MM/YYYY" />;
      }
    `,
  );
}

export function buildRecipeTimeRange(c: CodeComments): CodeTab {
  return createCodeTab(
    'TSX',
    dedent`
      import { useState } from 'react';
      import { useDateMask } from 'use-digit-mask';

      type TimeFieldProps = {
        placeholder: string;
        value: string;
        onChange: (v: string) => void;
        min?: string;
      };

      function TimeField({ placeholder, min, value, onChange }: TimeFieldProps) {
        // ${c.recipeTimeRange}
        const { props } = useDateMask({ format: 'HH:mm', min, value, onChange });
        return <input {...props} type="text" placeholder={placeholder} />;
      }

      function TimeRangePicker() {
        const [start, setStart] = useState('');
        const [end, setEnd] = useState('');

        return (
          <>
            <TimeField placeholder="Start" value={start} onChange={setStart} />
            <TimeField placeholder="End" min={start} value={end} onChange={setEnd} />
          </>
        );
      }
    `,
  );
}
