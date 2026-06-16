import { render } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { PASTE_STRIP_PREFIX } from '../constants';

import { fireChangeAt, firePaste, getInput, placeCaret, RussiaPhone, TestInput, UkPhone, UsPhone } from './_helpers';

describe('Вставка - без префикса', () => {
  it('вставка чистых цифр в пустое поле', () => {
    render(<TestInput mask="#### #### #### ####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1234567890123456');
    expect(input.value).toBe('1234 5678 9012 3456');
  });

  it('вставка лишних цифр обрезается до maxDigits', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '123456789');
    expect(input.value).toBe('1234');
  });

  it('вставка в середину заполненной маски', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 2);
    firePaste(input, '99');
    expect(input.value).toBe('1299 3456');
  });

  it('вставка заменяет выделение', () => {
    render(<TestInput mask="#### ####" initialValue="1234 5678" />);
    const input = getInput();
    placeCaret(input, 0, 4);
    firePaste(input, '9999');
    expect(input.value).toBe('9999 5678');
  });

  it('цифры с нецифровыми символами внутри - только цифры', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1-2-3-4');
    expect(input.value).toBe('1234');
  });
});

describe('Вставка - с видимым префиксом', () => {
  it('вставка "+7 (999) 123-45-67" - стрипает видимый префикс', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '+7 (999) 123-45-67');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "79991234567" - стрипает цифровой префикс', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '79991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "89991234567" - префикс 8 стрипается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '89991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка "9991234567" без префикса - вставляется как есть', () => {
    render(<RussiaPhone />);
    const input = getInput();
    fireChangeAt(input, '7', 1);
    placeCaret(input, 0);
    firePaste(input, '9991234567');
    expect(input.value).toBe('+7 (999) 123-45-67');
  });

  it('вставка только "+7" в неактивную маску -> активирует маску, тело пустое', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка только "8" в неактивную маску -> активирует маску, тело пустое', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка "7" (цифровой prefix) в неактивную маску -> активирует', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '7');
    expect(input.value).toBe('+7 (___) ___-__-__');
  });

  it('вставка "+7" в активированную маску -> "7" идёт в первый слот', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (7__) ___-__-__');
  });

  it('вставка "8" в активированную маску -> "8" идёт в первый слот', () => {
    render(<RussiaPhone alwaysActive />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8');
    expect(input.value).toBe('+7 (8__) ___-__-__');
  });

  it('вставка "+7" в активированную маску с уже введёнными цифрами -> "7" вставляется в начало', () => {
    render(<RussiaPhone initialValue="+7 (983) 120-48-97" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7');
    expect(input.value).toBe('+7 (798) 312-04-89');
  });
});

describe('Вставка — pasteStripPrefix', () => {
  it('default "overflow": 10 цифр начинающихся с "8" — "8" остаётся, маска полная', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('"always": 10 цифр начинающихся с "8" — "8" стрипается, маска неполная', () => {
    render(<RussiaPhone pasteStripPrefix={PASTE_STRIP_PREFIX.always} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (983) 120-48-9_');
  });

  it('"overflow": 10 цифр начинающихся с "8" — "8" остаётся в теле, маска полная', () => {
    render(<RussiaPhone pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '8983120489');
    expect(input.value).toBe('+7 (898) 312-04-89');
  });

  it('"overflow": 11 цифр с "8" — overflow, "8" стрипается', () => {
    render(<RussiaPhone pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '89831204897');
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('"overflow": 11 цифр с "+7 (" — overflow, prefix стрипается', () => {
    render(<RussiaPhone pasteStripPrefix={PASTE_STRIP_PREFIX.overflow} />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+79831204897');
    expect(input.value).toBe('+7 (983) 120-48-97');
  });

  it('default "overflow": частичный "+7 (983) 120-48-" — visiblePrefix стрипается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7 (983) 120-48-');
    expect(input.value).toBe('+7 (983) 120-48-__');
  });

  it('default "overflow": частичный "798312048" (raw, 9 цифр) — "7" не стрипается', () => {
    render(<RussiaPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '798312048');
    expect(input.value).toBe('+7 (798) 312-04-8_');
  });
});

describe('Вставка при allowedPrefixes = []', () => {
  it('вставка "79991234567" — "7" идёт в первый слот, не стрипается как префикс', () => {
    render(<TestInput mask="+7 (###) ###-##-##" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '79991234567');
    expect(input.value).toBe('+7 (799) 912-34-56');
  });

  it('вставка "+7 (9991234567)" — цифры маски не стрипаются, "7" идёт в слот', () => {
    render(<TestInput mask="+7 (###) ###-##-##" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+7 (9991234567)');
    expect(input.value).toBe('+7 (799) 912-34-56');
  });
});

describe('Вставка - маска без префикса', () => {
  it('вставка цифр соответствует ожидаемому формату даты', () => {
    render(<TestInput mask="##/##/####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '01012025');
    expect(input.value).toBe('01/01/2025');
  });

  it('вставка PIN-кода', () => {
    render(<TestInput mask="####" />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '4242');
    expect(input.value).toBe('4242');
  });
});

describe('Вставка — США "+1 (###) ###-####"', () => {
  it('"+12024567890" — prefix стрипается, полный номер', () => {
    render(<UsPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+12024567890');
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('"12024567890" (без +) — "1" стрипается на overflow', () => {
    render(<UsPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '12024567890');
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('"2024567890" (без prefix) — вставляется как есть', () => {
    render(<UsPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '2024567890');
    expect(input.value).toBe('+1 (202) 456-7890');
  });

  it('только "+1" в неактивное поле — активирует маску, тело пустое', () => {
    render(<UsPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+1');
    expect(input.value).toBe('+1 (___) ___-____');
  });
});

describe('Вставка — Великобритания "+44 #### ######" (двузначный cc)', () => {
  it('"+441234567890" — "44" стрипается, полный номер', () => {
    render(<UkPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+441234567890');
    expect(input.value).toBe('+44 1234 567890');
  });

  it('"441234567890" (без +) — "44" стрипается на overflow', () => {
    render(<UkPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '441234567890');
    expect(input.value).toBe('+44 1234 567890');
  });

  it('"1234567890" (без prefix) — вставляется как есть', () => {
    render(<UkPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '1234567890');
    expect(input.value).toBe('+44 1234 567890');
  });

  it('только "+44" в неактивное поле — активирует маску, тело пустое', () => {
    render(<UkPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '+44');
    expect(input.value).toBe('+44 ____ ______');
  });

  it('"44" (цифровой prefix) в неактивное поле — активирует маску', () => {
    render(<UkPhone />);
    const input = getInput();
    placeCaret(input, 0);
    firePaste(input, '44');
    expect(input.value).toBe('+44 ____ ______');
  });
});
