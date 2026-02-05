'use client';

import { useRole } from '@/shared/providers/RoleProvider';

export function RoleToggle() {
    const { role, setRole } = useRole();

    return (
        <div className="flex items-center gap-2">
            <button
                className={`h-9 rounded-full px-4 text-sm border ${role === 'viewer' ? 'bg-muted' : 'bg-background'}`}
                onClick={() => setRole('viewer')}
                type="button"
            >
                Viewer
            </button>
            <button
                className={`h-9 rounded-full px-4 text-sm border ${role === 'admin' ? 'bg-muted' : 'bg-background'}`}
                onClick={() => setRole('admin')}
                type="button"
            >
                Admin
            </button>
        </div>
    );
}
