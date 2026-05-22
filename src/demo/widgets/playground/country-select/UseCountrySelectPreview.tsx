import { PhoneField } from '@/entities/phone-input';

import { type UseCountrySelectOptions } from './schema';

type Props = {
  options: UseCountrySelectOptions;
};

export function UseCountrySelectPreview({ options }: Props) {
  return (
    <PhoneField
      showCountrySelect
      trimMaskTail={options.trimMaskTail}
      priorityIds={options.priorityIds}
      stickyPins={options.stickyPins}
      disableSort={options.disableSort}
      ghost={options.ghost}
      ghostChar={options.ghostChar}
      ghostOnlyWhenResolved={options.ghostOnlyWhenResolved}
    />
  );
}
