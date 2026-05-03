import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { type ParsedValues } from 'use-digit-mask';
import { describe, expect, it } from 'vitest';

import { CandidatePhone, fireChangeAt, getInput } from './_helpers';

describe('usePhoneMask - selectCandidate', () => {
  it('клик Japan +81 при digits="8" переключает в японский формат без лишних цифр', () => {
    // '8' (Russia alt, prefixDigits='8') -> select Japan (prefixDigits='81'):
    // candidate '81' does NOT start in '8' -> fallback: strip current '8' -> body='' -> nextDigits='81'
    // Japan mask: +## ##-####-#### -> '+81 __-____-____'
    render(<CandidatePhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    expect(input.value).toBe('8 (___) ___-__-__');

    fireEvent.click(screen.getByTestId('candidate-81'));
    expect(input.value).toBe('+81 __-____-____');
  });

  it('клик Russia (8) при digits="81123" (Japan) переключает без потери цифр тела', () => {
    // Japan mask: +## ##-####-#### -> '81123' -> '+81 12-3___-____'
    // Переключение на Russia '8': strip новый (короткий) префикс '8' -> body='1123'
    // nextDigits='81123' -> Russia mask '# (###) ###-##-##' -> '8 (112) 3__-__-__'
    render(<CandidatePhone />);
    const input = getInput();
    fireChangeAt(input, '81123', 5);
    expect(input.value).toBe('+81 12-3___-____');

    fireEvent.click(screen.getByTestId('candidate-8'));
    expect(input.value).toBe('8 (112) 3__-__-__');
  });

  it('клик +84 при digits="8" (после backspace с +81) не уводит 8 в body', () => {
    // Ввод '8' -> select +81 -> backspace (digits='8', forcedId=JP, prefixDigits='81')
    // -> select +84: '8'.startsWith('84')=false, '8'.startsWith('81')=false -> body='' -> nextDigits='84'
    render(<CandidatePhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    fireEvent.click(screen.getByTestId('candidate-81'));
    expect(input.value).toBe('+81 __-____-____');

    fireChangeAt(input, '+8', 2);
    fireEvent.click(screen.getByTestId('candidate-84'));
    expect(input.value).toBe('+84 ___ ___ ____');
  });

  it('клик Russia (8) при пустом поле заполняет только префикс', () => {
    render(<CandidatePhone />);
    const input = getInput();
    fireChangeAt(input, '8', 1);
    fireEvent.click(screen.getByTestId('candidate-8'));
    expect(input.value).toBe('8 (___) ___-__-__');
  });

  it('prefix в onChange корректен после selectCandidate', () => {
    let lastParsed: ParsedValues | null = null;
    render(
      <CandidatePhone
        onChangeSpy={(_, p) => {
          lastParsed = p;
        }}
      />,
    );
    const input = getInput();
    fireChangeAt(input, '8', 1);
    fireEvent.click(screen.getByTestId('candidate-81'));
    expect(lastParsed!.prefix).toBe('+81');
  });
});
