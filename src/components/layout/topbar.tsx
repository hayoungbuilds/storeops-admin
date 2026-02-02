'use client';

import { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

type Role = 'Viewer' | 'Admin';

export default function Topbar() {
    const [role, setRole] = useState<Role>('Admin');

    const setViewer = () => {
        setRole('Viewer');
        toast('권한이 Viewer로 전환됐어요');
    };

    const setAdmin = () => {
        setRole('Admin');
        toast('권한이 Admin으로 전환됐어요');
    };

    return (
        <header className="h-14 border-b bg-background">
            <div className="flex h-full items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="font-semibold">StoreOps</div>
                    <Badge variant="secondary">Minimal</Badge>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant={role === 'Viewer' ? 'default' : 'secondary'} size="sm" onClick={setViewer}>
                        Viewer
                    </Button>
                    <Button variant={role === 'Admin' ? 'default' : 'secondary'} size="sm" onClick={setAdmin}>
                        Admin
                    </Button>
                </div>
            </div>
        </header>
    );
}
