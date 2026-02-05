import { ROLE_HEADER_KEY, ROLE_STORAGE_KEY, DEFAULT_ROLE, ROLES, type Role } from '@/shared/constants/auth';

function isRole(v: string | null): v is Role {
    return !!v && (ROLES as readonly string[]).includes(v);
}

function getRoleFromClient(): Role {
    if (typeof window === 'undefined') return DEFAULT_ROLE;
    const raw = window.localStorage.getItem(ROLE_STORAGE_KEY);
    return isRole(raw) ? raw : DEFAULT_ROLE;
}

export async function apiFetch(input: RequestInfo | URL, init: RequestInit = {}) {
    const role = getRoleFromClient();

    const headers = new Headers(init.headers);
    headers.set(ROLE_HEADER_KEY, role);

    return fetch(input, { ...init, headers });
}
