import { useQuery } from '@tanstack/react-query';

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error('Failed to fetch order');
            return res.json() as Promise<{ item: any | null }>;
        },
        enabled: Boolean(id),
    });
}
