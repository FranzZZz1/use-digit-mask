import { SECTION_IDS } from '@/shared/router';

export const toc = {
  useMask: [
    { id: SECTION_IDS.overview, label: 'Overview', dativeLabel: 'Overview' },
    { id: SECTION_IDS.parameters, label: 'Parameters', dativeLabel: 'Parameters' },
    { id: SECTION_IDS.returnValue, label: 'Return values', dativeLabel: 'Return values' },
    { id: SECTION_IDS.parsedValues, label: 'ParsedValues', dativeLabel: 'ParsedValues' },
  ],
  usePhoneMask: [
    { id: SECTION_IDS.overview, label: 'Overview', dativeLabel: 'Overview' },
    { id: SECTION_IDS.parameters, label: 'Parameters', dativeLabel: 'Parameters' },
    { id: SECTION_IDS.returnValue, label: 'Return values', dativeLabel: 'Return values' },
    { id: SECTION_IDS.dialPlan, label: 'DialPlan type', dativeLabel: 'DialPlan type' },
    { id: SECTION_IDS.phoneMaskCandidate, label: 'PhoneMaskCandidate type', dativeLabel: 'PhoneMaskCandidate type' },
    { id: SECTION_IDS.customization, label: 'Customising plans', dativeLabel: 'Customising plans' },
  ],
  useCountrySelect: [
    { id: SECTION_IDS.overview, label: 'Overview', dativeLabel: 'Overview' },
    { id: SECTION_IDS.parameters, label: 'Parameters', dativeLabel: 'Parameters' },
    { id: SECTION_IDS.returnValue, label: 'Return values', dativeLabel: 'Return values' },
  ],
};
