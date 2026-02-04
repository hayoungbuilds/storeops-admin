import { useQuery } from '@tanstack/react-query';
import type { OrdersQuery } from './useOrdersQueryState';

export function useOrders(qs: OrdersQuery) {
    return useQuery({
        queryKey: ['orders', qs],
        queryFn: async () => {
            const params = new URLSearchParams({
                q: qs.q,
                status: qs.status,
                channel: qs.channel,
                page: String(qs.page),
                pageSize: String(qs.pageSize),
                sort: qs.sort,
            });

            const res = await fetch(`/api/orders?${params.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch orders');
            return res.json() as Promise<{
                items: any[];
                meta: { total: number; page: number; pageSize: number; totalPages: number };
            }>;
        },
        placeholderData: (prev) => prev,
    });
}
