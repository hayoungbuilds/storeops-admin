'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

export default function Topbar() {
    return (
        <header className="px-6 py-4 border-b bg-background/80 backdrop-blur">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h1 className="text-sm font-medium">StoreOps</h1>
                    <Badge variant="secondary">Minimal</Badge>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="secondary" size="sm">
                        Viewer
                    </Button>
                    <Button size="sm">Admin</Button>
                </div>
            </div>
        </header>
    );
}
