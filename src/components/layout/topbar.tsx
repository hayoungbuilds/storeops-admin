'use client';

import { Badge } from '@/components/ui/badge';
import { RoleToggle } from '../../features/orders/components/RoleToggle';

export default function Topbar() {
    return (
        <header className="h-14 shrink-0 border-b bg-background">
            <div className="flex h-full items-center justify-between px-6 py-3">
                <div className="flex items-center gap-3">
                    <div className="font-semibold">StoreOps</div>
                    <Badge variant="secondary">Minimal</Badge>
                </div>

                <RoleToggle />
            </div>
        </header>
    );
}
