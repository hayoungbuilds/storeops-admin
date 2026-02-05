export const ROLES = ['viewer', 'admin'] as const;
export type Role = (typeof ROLES)[number];

export const DEFAULT_ROLE: Role = 'viewer';
export const ROLE_STORAGE_KEY = 'storeops_role';
export const ROLE_QUERY_KEY = 'role';
export const ROLE_HEADER_KEY = 'x-role';
