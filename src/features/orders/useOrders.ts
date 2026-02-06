import { useQuery } from '@tanstack/react-query';
import type { OrdersQuery } from './useOrdersQueryState';
import { ordersKeys } from './queries';
import { OrdersListResponse } from '@/shared/constants/orders';

export function useOrders(qs: OrdersQuery) {
    return useQuery({
        queryKey: ordersKeys.list(qs),
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
            return res.json() as Promise<OrdersListResponse>;
        },
        placeholderData: (prev) => prev,
    });
}
