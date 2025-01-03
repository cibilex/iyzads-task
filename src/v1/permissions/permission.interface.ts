export type Permission = Record<
  string,
  {
    perms: Record<string, { t: string; v: number; id: number }>;
    id: number;
  }
>;
