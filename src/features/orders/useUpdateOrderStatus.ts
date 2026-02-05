import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order } from '@/lib/mockOrdersDb';
import { OrderStatus } from '@/shared/constants/orders';

type Payload = { id: string; status: OrderStatus };
type OrdersListResponse = {
    items: Order[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};

export function useUpdateOrderStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Payload) => {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update');

            // API는 { item: Order } 형태를 반환
            return res.json() as Promise<{ item: Order }>;
        },

        // optimistic
        onMutate: async ({ id, status }) => {
            // 상세 쿼리 중단
            await qc.cancelQueries({ queryKey: ['order', id] });

            // 상세 캐시: Order | null
            const prevOrder = qc.getQueryData<Order | null>(['order', id]);

            // 리스트 캐시: 여러 key가 있을 수 있으니 prefix로 다 저장해두고 롤백 가능하게
            const prevLists = qc.getQueriesData<OrdersListResponse>({ queryKey: ['orders'] });

            // 상세 optimistic
            qc.setQueryData<Order | null>(['order', id], (old) => {
                if (!old) return old;
                return { ...old, status } as Order;
            });

            // 리스트 optimistic (현재 캐시에 있는 모든 페이지/필터 조합에 반영)
            qc.setQueriesData<OrdersListResponse>({ queryKey: ['orders'] }, (old) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.map((o) => (o.id === id ? { ...o, status } : o)),
                };
            });

            return { prevOrder, prevLists };
        },

        onError: (_err, variables, ctx) => {
            // 상세 롤백
            if (ctx) {
                qc.setQueryData(['order', variables.id], ctx.prevOrder ?? null);

                // 리스트 롤백
                for (const [key, data] of ctx.prevLists ?? []) {
                    qc.setQueryData(key, data);
                }
            }
        },

        onSettled: (_data, _err, variables) => {
            qc.invalidateQueries({ queryKey: ['order', variables.id] });
            qc.invalidateQueries({ queryKey: ['orders'] });
            qc.invalidateQueries({ queryKey: ['dashboard'] });
        },
    });
}
