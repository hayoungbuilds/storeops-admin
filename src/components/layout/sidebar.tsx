'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Separator } from '@/components/ui/separator';

const NAV = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/orders', label: 'Orders' },
    { href: '/settlement', label: 'Settlement' },
    { href: '/inventory', label: 'Inventory' },
    { href: '/settings', label: 'Settings' },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-56 px-4 py-6 sticky top-0 h-screen hidden md:block">
            <div className="space-y-1">
                <p className="text-sm font-semibold tracking-tight">StoreOps</p>
                <p className="text-xs text-muted-foreground">Admin Console</p>
            </div>

            <Separator className="my-5" />

            <nav className="space-y-1">
                {NAV.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                'block rounded-md px-3 py-2 text-sm',
                                active
                                    ? 'bg-muted font-medium'
                                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/60',
                            ].join(' ')}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
