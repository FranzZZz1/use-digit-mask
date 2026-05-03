import { type ru } from '../translations/ru';

export type Lang = 'en' | 'ru';

export type Translation = typeof ru;

/** Record of prop-name → translated description string, used by PropTable. */
export type PropDesc = Record<string, string>;

type Leaf = string | number | boolean | null | undefined;

/**
 * Recursively collects every dot-separated key path in T whose leaf is a Leaf
 * value, plus every intermediate object key.
 *
 * Example: PathKeys<{ a: { b: string } }> → '' | 'a' | 'a.b'
 */
export type PathKeys<T, Prev extends string = ''> =
  | ''
  | {
      [K in keyof T]: T[K] extends Leaf
        ? `${Prev}${K & string}`
        : T[K] extends object
          ? `${Prev}${K & string}` | PathKeys<T[K], `${Prev}${K & string}.`>
          : never;
    }[keyof T];

/**
 * Resolves the value type at a dot-separated path P inside T.
 *
 * Example: PathValue<{ a: { b: string } }, 'a.b'> → string
 */
export type PathValue<T, P> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? PathValue<T[K], Rest>
    : never
  : P extends keyof T
    ? T[P]
    : never;

/** All valid dot-path keys in the translation object. */
export type TranslationKeys = PathKeys<Translation>;

/** The value type at a given translation key path. */
export type TranslationAt<P extends TranslationKeys> = PathValue<Translation, P>;

/** A single entry in the on-this-page TOC, derived from the translation shape. */
export type TocEntry = Translation['toc'][keyof Translation['toc']][number];

type ObjectKeysAtLevel<T> = {
  [K in keyof T]: T[K] extends Record<string, unknown> ? K : never;
}[keyof T];

/** All keys at path P that are nested objects (not leaf values). */
export type ObjectKeysAtPath<P extends TranslationKeys> = ObjectKeysAtLevel<PathValue<Translation, P>>;

/** All keys (leaf and object) at path P, one level deep. */
export type AllKeysAtPath<P extends TranslationKeys> = keyof PathValue<Translation, P>;
