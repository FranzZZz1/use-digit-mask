import { type ChangelogEntry } from '@/shared/config';

export const changelogEntries: ChangelogEntry[] = [
  {
    version: '0.5.1',
    date: '2026-05-25',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: нажатие Backspace при курсоре в начале поля (позиция 0) и непустых цифрах больше не сбрасывает всё значение — курсор остаётся на месте.',
        ],
      },
    ],
  },
  {
    version: '0.5.0',
    date: '2026-05-24',
    sections: [
      {
        type: 'added',
        items: [
          '|useMask|: механизм undo/redo — |Ctrl+Z| / |Meta+Z| отменяет последнее изменение, |Ctrl+Y| / |Ctrl+Shift+Z| повторяет. Новый проп |historyLimit| (по умолчанию |100|) ограничивает глубину стека. Новые поля |api|: |undo()|, |redo()|, |canUndo|, |canRedo|.',
        ],
      },
      {
        type: 'fixed',
        items: [
          "|useMask|: при курсоре внутри зоны префикса (перед буквальной цифрой, например |'7'| в маске |'+7 (###)...'|) введённая цифра теперь корректно попадает в первый слот, не захватывая буквальную цифру префикса.",
        ],
      },
    ],
  },
  {
    version: '0.4.0',
    date: '2026-05-22',
    sections: [
      {
        type: 'added',
        items: [
          "|useMask|: новый проп |alwaysActive| — при |true| шаблон маски всегда отображается вне зависимости от фокуса. |onChange| по-прежнему возвращает |''|, когда цифр нет.",
          '|useMask|: новый проп |ghostChar| — символ для заполнения пустых слотов в |ghostValue|. По умолчанию равен |placeholderChar|.',
          '|useMask| / |usePhoneMask|: новое поле |ghostValue| в возвращаемом объекте — маска с заполненными через |ghostChar| слотами, удобно для построения ghost/placeholder-оверлеев.',
          "|ParsedValues.parentPrefix| — заполняется, когда пользователь набирает номер через |altPrefixes| (например, набрал |'8'| → |parentPrefix| равен |'+7'|). При использовании |useMask| напрямую всегда |undefined|.",
          '|PhoneMaskCandidate.parentPrefix| — канонический E.164-префикс для кандидатов, разрезолвленных через |altPrefixes|. Вычисляется один раз при построении кандидатов.',
          '|PhoneMaskResult.parentPrefix| — пробрасывается из лучшего совпавшего кандидата.',
        ],
      },
      {
        type: 'fixed',
        items: [
          "|useMask|: при пустом |allowedPrefixes| ввод цифры, совпадающей с литеральной цифрой в префиксе маски (например, |'7'| для маски |'+7 (###)...'|), теперь корректно попадает в первый слот, а не игнорируется.",
          "|useMask|: при пустом |allowedPrefixes| вставка цифр, начинающихся с цифры из префикса маски (например, |'79991234567'|), больше не срезает первую цифру — все вставленные цифры заполняют слоты слева направо.",
          '|useCountrySelect|: |disableSort| больше не игнорирует |stickyPins| и |priorityIds| — теперь отключает только всплытие кандидатов по набранному префиксу, оставляя явную конфигурацию пинов нетронутой.',
        ],
      },
    ],
  },
  {
    version: '0.3.1',
    date: '2026-05-05',
    sections: [
      {
        type: 'fixed',
        items: [
          '|useMask|: |onChange| теперь вызывается с форматированным значением, когда внешнее значение приходит без маскировки (например, чистые цифры с бэкенда) — предотвращает рассинхронизацию состояния родителя с тем, что отображается в поле.',
        ],
      },
    ],
  },
  {
    version: '0.3.0',
    date: '2026-05-04',
    sections: [
      {
        type: 'added',
        items: [
          '|useCountrySelect|: новые опции |inputRef|, |disableSort|, |noInternalListeners|.',
          '|usePhoneMask| теперь принимает все пропы |useMask| через spread (кроме |value| и |mask|).',
          '|dialPlanToCandidate| экспортируется из публичного API.',
          '|mergeDialPlans|: |cc| теперь можно задавать для новых записей; отсутствие |pattern| вызывает ошибку.',
        ],
      },
      {
        type: 'fixed',
        items: [
          'Mobile: |onMouseDown| больше не вызывает preventDefault на iOS/Android — виртуальная клавиатура теперь появляется корректно.',
          'Mobile: долгое удержание Backspace больше не перепрыгивает на позицию 0 мимо первого блока цифр.',
          '|usePhoneMask|: |isMaskCompleted| теперь корректно отражает заполненность всех слотов после смены плана.',
          "|usePhoneMask selectCandidate|: тело сбрасывается в |''| при переключении на несовместимый префикс.",
          '|usePhoneMask forcedId|: сбрасывается, если текущие цифры больше не соответствуют закреплённому плану.',
          '|useCountrySelect select()|: |flushSync| перед |focus()| предотвращает переход фокуса на |body|.',
          '|useCountrySelect|: |onSelect| читается через ref, устраняя баг с устаревшим замыканием.',
          '|useMask|: |onChange| пропускается, если форматированное значение не изменилось.',
        ],
      },
    ],
  },
  {
    version: '0.2.0',
    date: '2026-04-20',
    sections: [
      {
        type: 'breaking',
        items: [
          "|DialPlan.altPrefixes| изменён с |AltPrefix[]| на |string[]| — полные строки префиксов с опциональным |+|. До: |[{ cc: '8', hasPlus: false }]| → После: |['8']|.",
        ],
      },
      {
        type: 'added',
        items: [
          'Хук |useCountrySelect| — headless-хук для построения выпадающего списка выбора страны.',
          'Опция |DialPlan.hasPlus| (по умолчанию |true|) — управляет тем, использует ли основной префикс символ |+|.',
          '|useCountrySelect|: опция |stickyPins| — |priorityIds| остаются закреплёнными независимо от ввода пользователя.',
          '|formatDigitsWithMask()| экспортируется как самостоятельная чистая утилита.',
        ],
      },
      {
        type: 'changed',
        items: [
          'Модуль dial plans разбит на отдельные файлы: |defaultPlans|, |selectPhoneMask|, |mergeDialPlans|, |types|.',
          "|FALLBACK.prefix| теперь равен |''| вместо |'+'|, когда страна не определена.",
        ],
      },
      {
        type: 'fixed',
        items: [
          '|usePhoneMask|: устаревшее замыкание исправлено — |ParsedValues.prefix| теперь всегда отражает текущий ввод, а не предыдущий цикл рендера.',
          '|usePhoneMask|: |selectCandidate| больше не зависит от api |useMask|, устраняя проблему с несвоевременным состоянием маски.',
        ],
      },
    ],
  },
  {
    version: '0.1.0',
    date: '2026-04-02',
    sections: [
      {
        type: 'added',
        items: ['Первый релиз — хуки |useMask| и |usePhoneMask|.'],
      },
    ],
  },
];
