import { SECTION_IDS } from '@/shared/router';

export const toc = {
  useMask: [
    { id: SECTION_IDS.overview, label: 'Обзор', dativeLabel: 'обзору' },
    { id: SECTION_IDS.parameters, label: 'Параметры', dativeLabel: 'параметрам' },
    { id: SECTION_IDS.returnValue, label: 'Возвращаемые значения', dativeLabel: 'возвращаемым значениям' },
    { id: SECTION_IDS.parsedValues, label: 'ParsedValues', dativeLabel: 'ParsedValues' },
  ],
  usePhoneMask: [
    { id: SECTION_IDS.overview, label: 'Обзор', dativeLabel: 'обзору' },
    { id: SECTION_IDS.parameters, label: 'Параметры', dativeLabel: 'параметрам' },
    { id: SECTION_IDS.returnValue, label: 'Возвращаемые значения', dativeLabel: 'возвращаемым значениям' },
    { id: SECTION_IDS.dialPlan, label: 'Тип DialPlan', dativeLabel: 'типу DialPlan' },
    { id: SECTION_IDS.phoneMaskCandidate, label: 'Тип PhoneMaskCandidate', dativeLabel: 'типу PhoneMaskCandidate' },
    { id: SECTION_IDS.customization, label: 'Кастомизация форматов', dativeLabel: 'кастомизации форматов' },
  ],
  useCountrySelect: [
    { id: SECTION_IDS.overview, label: 'Обзор', dativeLabel: 'обзору' },
    { id: SECTION_IDS.parameters, label: 'Параметры', dativeLabel: 'параметрам' },
    { id: SECTION_IDS.returnValue, label: 'Возвращаемые значения', dativeLabel: 'возвращаемым значениям' },
  ],
};
