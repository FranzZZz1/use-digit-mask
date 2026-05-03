export type BackTo = {
  path: string;
  sectionId: string;
  hookLabel: string;
};

export type DocsLocationState = {
  scrollTo?: string;
  backTo?: BackTo | null;
};
