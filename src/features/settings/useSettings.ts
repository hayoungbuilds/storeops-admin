import { useQuery } from '@tanstack/react-query';

export type Settings = { storeName: string };

export function useSettings() {
    return useQuery({
        queryKey: ['settings'],
        queryFn: async () => {
            const res = await fetch('/api/settings');
            if (!res.ok) throw new Error('Failed to fetch settings');
            return (await res.json()) as Settings;
        },
        staleTime: 60_000,
    });
}
