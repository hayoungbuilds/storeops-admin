import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrderStatus, OrdersListResponse } from '@/shared/constants/orders';
import { ordersKeys } from './queries';
import { apiFetch } from '@/lib/fetcher';
import { dashboardKeys } from '../dashboard/queries';

type Payload = { id: string; status: OrderStatus };
type ResponseBody = { item: Order };

export function useUpdateOrderStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: Payload) => {
            const res = await apiFetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update');
            return res.json() as Promise<ResponseBody>;
        },

        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: ordersKeys.detail(id) });
            await qc.cancelQueries({ queryKey: ordersKeys.lists() });

            const prevDetail = qc.getQueryData<{ item: Order | null }>(ordersKeys.detail(id));

            qc.setQueryData<{ item: Order | null }>(ordersKeys.detail(id), (old) => {
                if (!old?.item) return old ?? { item: null };
                return { ...old, item: { ...old.item, status } };
            });

            // list는 "list prefix"에 걸린 모든 캐시를 업데이트
            qc.setQueriesData<OrdersListResponse>({ queryKey: ordersKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((o) => (o.id === id ? { ...o, status } : o)),
                };
            });

            return { prevDetail };
        },

        onError: (_err, vars, ctx) => {
            if (ctx?.prevDetail) qc.setQueryData(ordersKeys.detail(vars.id), ctx.prevDetail);
        },

        onSettled: (_data, _err, vars) => {
            qc.invalidateQueries({ queryKey: ordersKeys.detail(vars.id) });
            qc.invalidateQueries({ queryKey: ordersKeys.lists() });
            qc.invalidateQueries({ queryKey: dashboardKeys.all });
        },
    });
}
