import { useQuery } from '@tanstack/react-query';
import { ordersKeys } from './queries';
import { OrderDetailResponse } from '@/shared/constants/orders';

export function useOrder(id: string) {
    return useQuery({
        queryKey: ordersKeys.detail(id),
        queryFn: async () => {
            const res = await fetch(`/api/orders?id=${encodeURIComponent(id)}`);
            if (!res.ok) throw new Error('Failed to fetch order');
            return res.json() as Promise<OrderDetailResponse>;
        },
    });
}
