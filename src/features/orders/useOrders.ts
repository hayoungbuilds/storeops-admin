import { useQuery } from '@tanstack/react-query';
import type { OrdersQuery } from '@/features/orders/useOrdersQueryState';
import { Order } from '@/lib/mockDb/ordersDb';

export function useOrders(qs: OrdersQuery) {
    return useQuery({
        queryKey: ['orders', qs.q, qs.status, qs.channel, qs.page, qs.pageSize, qs.sort],
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
                items: Order[];
                meta: { total: number; page: number; pageSize: number; totalPages: number };
            }>;
        },
        placeholderData: (prev) => prev,
    });
}
