export type ChangeType = 'added' | 'changed' | 'fixed' | 'breaking' | 'tradeoff';

export type ChangelogSection = {
  type: ChangeType;
  items: string[];
};

export type ChangelogEntry = {
  version: string;
  date: string; // YYYY-MM-DD
  sections: ChangelogSection[];
};
