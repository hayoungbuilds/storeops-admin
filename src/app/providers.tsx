'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { Toaster } from '@/components/ui/sonner';
import { useState } from 'react';
import { RoleProvider } from '@/shared/providers/RoleProvider';

export default function Providers({ children }: { children: React.ReactNode }) {
    const [queryClient] = useState(
        () =>
            new QueryClient({
                defaultOptions: {
                    queries: {
                        retry: 1,
                        refetchOnWindowFocus: false,
                        staleTime: 30_000,
                    },
                },
            })
    );

    return (
        <QueryClientProvider client={queryClient}>
            <RoleProvider>
                {children}
                <Toaster />
                <ReactQueryDevtools initialIsOpen={false} />
            </RoleProvider>
        </QueryClientProvider>
    );
}
