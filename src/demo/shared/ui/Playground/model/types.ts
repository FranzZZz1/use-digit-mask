export type BoolOptionDef = {
  type: 'bool';
  key: string;
  defaultEnabled?: boolean;
  /**
   * When set, this option can only be enabled while its parent is enabled.
   * Toggling the parent off will auto-disable this option.
   * When this option is activated as `initialKey`, its parent is auto-enabled.
   */
  requiresParent?: string;
  /**
   * When true, the field is always included in the serialized output — even when disabled (value: false).
   * Needed when the preview component has a non-false default for this prop.
   */
  alwaysSerialize?: boolean;
};

export type StrOptionDef = {
  type: 'str';
  key: string;
  defaultEnabled?: boolean;
  defaultValue?: string;
  placeholder?: string;
  maxLength?: number;
  /** Преобразует raw string перед сериализацией. Вернуть null/undefined — пропустить поле. */
  transform?: (value: string) => unknown;
  /** Fallback-значение, если transform вернул null/undefined или value пустой. */
  fallback?: unknown;
};

export type DividerDef = {
  type: 'divider';
};

export type OptionDef = BoolOptionDef | StrOptionDef | DividerDef;
export type OptionSchema = OptionDef[];

export type BoolOptionState = { enabled: boolean };
export type StrOptionState = { enabled: boolean; value: string };
export type OptionsState = Record<string, BoolOptionState | StrOptionState>;
