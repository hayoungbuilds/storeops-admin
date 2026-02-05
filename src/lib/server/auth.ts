import { NextRequest } from 'next/server';
import { DEFAULT_ROLE, ROLE_HEADER_KEY, ROLE_QUERY_KEY, ROLES, type Role } from '@/shared/constants/auth';

function isRole(v: string | null): v is Role {
    return !!v && (ROLES as readonly string[]).includes(v);
}

export function getRoleFromRequest(req: NextRequest): Role {
    // 우선순위: header > query > default
    const headerRole = req.headers.get(ROLE_HEADER_KEY);
    if (isRole(headerRole)) return headerRole;

    const url = new URL(req.url);
    const queryRole = url.searchParams.get(ROLE_QUERY_KEY);
    if (isRole(queryRole)) return queryRole;

    return DEFAULT_ROLE;
}

export function requireAdmin(req: NextRequest) {
    const role = getRoleFromRequest(req);
    if (role !== 'admin') {
        return Response.json({ error: 'forbidden', role }, { status: 403 });
    }
    return null;
}
