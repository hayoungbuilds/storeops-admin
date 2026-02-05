'use client';

import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';

export type Role = 'viewer' | 'admin';

type RoleCtx = {
    role: Role;
    setRole: (r: Role) => void;
};

const Ctx = createContext<RoleCtx | null>(null);

const STORAGE_KEY = 'storeops_role';

export function RoleProvider({ children }: { children: React.ReactNode }) {
    const [role, setRoleState] = useState<Role>('viewer');

    // 초기 로드
    useEffect(() => {
        const saved = (localStorage.getItem(STORAGE_KEY) as Role | null) ?? 'viewer';
        setRoleState(saved);
    }, []);

    // 탭 간 동기화(선택)
    useEffect(() => {
        const onStorage = (e: StorageEvent) => {
            if (e.key === STORAGE_KEY && (e.newValue === 'viewer' || e.newValue === 'admin')) {
                setRoleState(e.newValue);
            }
        };
        window.addEventListener('storage', onStorage);
        return () => window.removeEventListener('storage', onStorage);
    }, []);

    const setRole = (r: Role) => {
        setRoleState(r);
        localStorage.setItem(STORAGE_KEY, r);
    };

    const value = useMemo(() => ({ role, setRole }), [role]);
    return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useRole() {
    const v = useContext(Ctx);
    if (!v) throw new Error('useRole must be used within RoleProvider');
    return v;
}
