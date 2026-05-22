import { type CodeComments, type CodeTab, dedent, tab } from '@/shared/lib/snippetUtils';

export function buildCodeCountrySelectRadix(c: CodeComments): CodeTab[] {
  return [
    tab(
      'Basic',
      dedent`
      import { useRef, useState } from 'react';
      import * as Popover from '@radix-ui/react-popover';
      import { usePhoneMask, useCountrySelect } from 'use-digit-mask';

      function PhoneWithRadixSelect() {
        const [value, setValue] = useState('');
        const inputRef = useRef(null);

        const { props, id, allPlans, selectPlan, candidates } = usePhoneMask({
          value,
          onChange: (next) => setValue(next),
          trimMaskTail: true,
        });

        const {
          isOpen, toggle, close,
          query, setQuery,
          items, dividerAfter,
          searchRef, select, currentPlan,
        } = useCountrySelect({
          allPlans,
          currentId: id,
          onSelect: selectPlan,
          candidates,
          priorityIds: ['US', 'GB', 'RU'],
          inputRef,
          // ${c.noInternalListeners}
          noInternalListeners: true,
        });

        return (
          <div style={{ display: 'flex' }}>
            <Popover.Root open={isOpen} onOpenChange={(open) => !open && close()}>
              {/* ${c.countryTrigger} */}
              <Popover.Trigger asChild>
                <button type="button" onClick={toggle}>
                  {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
                </button>
              </Popover.Trigger>

              <Popover.Portal>
                <Popover.Content sideOffset={4} align="start">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                  />

                  {items.map((plan, i) => (
                    <div key={plan.id}>
                      {/* ${c.divider} */}
                      {i === dividerAfter && <hr />}
                      <div role="option" onClick={() => select(plan)}>
                        {plan.label} +{plan.cc}
                      </div>
                    </div>
                  ))}
                </Popover.Content>
              </Popover.Portal>
            </Popover.Root>

            {/* ${c.phoneInput} */}
            <input ref={inputRef} {...props} type="text" inputMode="numeric" />
          </div>
        );
      }
    `,
    ),
  ];
}

export function buildCodePhoneCountrySelect(c: CodeComments): CodeTab[] {
  return [
    tab(
      'Basic',
      dedent`
      import { useState } from 'react';
      import { usePhoneMask, useCountrySelect } from 'use-digit-mask';

      function PhoneWithCountry() {
        const [value, setValue] = useState('');

        const { props, id, allPlans, selectPlan, candidates } = usePhoneMask({
          value,
          onChange: (next) => setValue(next),
          trimMaskTail: true,
        });

        const {
          isOpen, toggle,
          query, setQuery,
          items, dividerAfter,
          containerRef, searchRef,
          select, currentPlan,
        } = useCountrySelect({
          allPlans,
          currentId: id,
          onSelect: selectPlan,
          // ${c.candidatesBubble}
          candidates,
          // ${c.priorityIds}
          priorityIds: ['US', 'GB', 'RU'],
        });

        return (
          <div style={{ display: 'flex' }}>

            {/* ${c.countryTrigger} */}
            <div ref={containerRef} style={{ position: 'relative' }}>
              <button onClick={toggle}>
                {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
              </button>

              {isOpen && (
                <div role="listbox">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                  />

                  {items.map((plan, i) => (
                    <div key={plan.id}>
                      {/* ${c.divider} */}
                      {i === dividerAfter && <hr />}
                      <div role="option" onClick={() => select(plan)}>
                        {plan.label} +{plan.cc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* ${c.phoneInput} */}
            <input {...props} type="text" inputMode="numeric" />
          </div>
        );
      }
    `,
    ),
    tab(
      'React Hook Form',
      dedent`
      import { useController, useForm } from 'react-hook-form';
      import { useCountrySelect, usePhoneMask } from 'use-digit-mask';

      function PhoneWithCountry({ control }) {
        const { field } = useController({
          name: 'phone',
          control,
          defaultValue: '',
        });

        const { props, id, allPlans, selectPlan, candidates } = usePhoneMask({
          value: field.value,
          onChange: field.onChange,
          trimMaskTail: true,
        });

        const {
          isOpen, toggle,
          query, setQuery,
          items, dividerAfter,
          containerRef, searchRef,
          select, currentPlan,
        } = useCountrySelect({
          allPlans,
          currentId: id,
          onSelect: selectPlan,
          candidates,
          priorityIds: ['US', 'GB', 'RU'],
        });

        return (
          <div style={{ display: 'flex' }}>
            <div ref={containerRef} style={{ position: 'relative' }}>
              <button onClick={toggle}>
                {currentPlan ? \`+\${currentPlan.cc}\` : '+'}
              </button>

              {isOpen && (
                <div role="listbox">
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search…"
                  />
                  {items.map((plan, i) => (
                    <div key={plan.id}>
                      {i === dividerAfter && <hr />}
                      <div role="option" onClick={() => select(plan)}>
                        {plan.label} +{plan.cc}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <input {...props} type="text" inputMode="numeric" />
          </div>
        );
      }

      function PhoneForm() {
        const { control, handleSubmit } = useForm();

        return (
          <form onSubmit={handleSubmit(console.log)}>
            <PhoneWithCountry control={control} />
            <button type="submit">Submit</button>
          </form>
        );
      }
    `,
    ),
  ];
}
