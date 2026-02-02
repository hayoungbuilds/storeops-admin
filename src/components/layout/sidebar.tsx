'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

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
        <div className="space-y-8">
            {/* Brand */}
            <div className="space-y-1">
                <div className="text-base font-semibold leading-none">StoreOps</div>
                <div className="text-sm text-muted-foreground">Admin Console</div>
            </div>

            {/* Nav */}
            <nav className="space-y-1">
                {NAV.map((item) => {
                    const active = pathname === item.href;

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={[
                                'block rounded-md px-3 py-2 text-sm transition-colors',
                                active
                                    ? 'bg-muted text-foreground font-medium'
                                    : 'text-foreground/70 hover:text-foreground hover:bg-muted/60',
                            ].join(' ')}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </div>
    );
}
