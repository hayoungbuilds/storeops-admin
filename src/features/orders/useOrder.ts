import { Order } from '@/lib/mockDb/ordersDb';
import { useQuery } from '@tanstack/react-query';

export function useOrder(id: string) {
    return useQuery({
        queryKey: ['order', id],
        enabled: !!id,
        queryFn: async () => {
            const params = new URLSearchParams({ id });
            const res = await fetch(`/api/orders?${params.toString()}`);

            if (!res.ok) throw new Error('Failed to fetch order');

            const json = (await res.json()) as { item: Order | null };
            return json.item;
        },
    });
}
