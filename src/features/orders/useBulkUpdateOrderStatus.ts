import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '@/lib/mockOrdersDb';
import { OrderStatus } from '@/shared/constants/orders';

type Payload = { ids: string[]; status: OrderStatus };
type OrdersListResponse = {
    items: Order[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};
type BulkResult = {
    ok: true;
    status: OrderStatus;
    requested: number;
    updated: string[];
    skipped: string[];
    notFound: string[];
};

export function useBulkUpdateOrderStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async ({ ids, status }: Payload) => {
            const res = await fetch('/api/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ids, status }),
            });
            if (!res.ok) throw new Error('Failed bulk update');
            return res.json() as Promise<BulkResult>;
        },

        onMutate: async ({ ids, status }) => {
            await qc.cancelQueries({ queryKey: ['orders'] });

            const prevLists = qc.getQueriesData<OrdersListResponse>({ queryKey: ['orders'] });

            const idSet = new Set(ids);

            // 리스트 optimistic: 캐시에 있는 모든 orders 쿼리(페이지/필터/정렬) 반영
            qc.setQueriesData<OrdersListResponse>({ queryKey: ['orders'] }, (old) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.map((o) => (idSet.has(o.id) ? { ...o, status } : o)),
                };
            });

            // 상세도 열려있을 수 있으니 같이 반영(있는 것만)
            ids.forEach((id) => {
                qc.setQueryData<Order | null>(['order', id], (old) => (old ? { ...old, status } : old));
            });

            return { prevLists };
        },

        onError: (_err, _vars, ctx) => {
            // 롤백: 리스트 캐시 원복
            for (const [key, data] of ctx?.prevLists ?? []) {
                qc.setQueryData(key, data);
            }
        },

        onSettled: async (_data, _err) => {
            await qc.invalidateQueries({ queryKey: ['orders'] });
            await qc.invalidateQueries({ queryKey: ['order'] });
        },
    });
}
