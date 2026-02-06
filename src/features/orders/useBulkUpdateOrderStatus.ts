import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Order, OrdersListResponse } from '@/shared/constants/orders';
import type { OrderStatus } from '@/shared/constants/orders';
import { ordersKeys } from '@/features/orders/queries';
import { apiFetch } from '@/lib/fetcher';
import { dashboardKeys } from '../dashboard/queries';

type BulkPayload = {
    ids: string[];
    status: OrderStatus;
};

type BulkResponse = {
    items?: Order[];
    requested: number;
    updated: string[];
    skipped: string[];
    notFound: string[];
};

type BulkError = {
    error: string;
};

export function useUpdateBulkOrderStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: BulkPayload) => {
            const res = await apiFetch('/api/orders/bulk', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                // 403 등 에러 메시지 표준화
                const json = (await res.json().catch(() => null)) as BulkError | null;
                const msg =
                    res.status === 403
                        ? '권한이 없어요'
                        : json?.error
                        ? `처리 실패: ${json.error}`
                        : '처리에 실패했어요';
                throw new Error(msg);
            }

            return (await res.json()) as BulkResponse;
        },

        onMutate: async ({ ids, status }) => {
            const idSet = new Set(ids);

            await qc.cancelQueries({ queryKey: ordersKeys.lists() });
            await qc.cancelQueries({ queryKey: ordersKeys.details() });

            const prevLists = qc.getQueriesData<OrdersListResponse>({ queryKey: ordersKeys.lists() });
            const prevDetails = qc.getQueriesData<{ item: Order | null }>({ queryKey: ordersKeys.details() });

            // list caches
            qc.setQueriesData<OrdersListResponse>({ queryKey: ordersKeys.lists() }, (old) => {
                if (!old) return old;
                return {
                    ...old,
                    items: old.items.map((o) => (idSet.has(o.id) ? { ...o, status } : o)),
                };
            });

            // detail caches
            qc.setQueriesData<{ item: Order | null }>({ queryKey: ordersKeys.details() }, (old) => {
                if (!old?.item) return old ?? { item: null };
                if (!idSet.has(old.item.id)) return old;
                return { ...old, item: { ...old.item, status } };
            });

            return { prevLists, prevDetails };
        },

        onError: (_err, _vars, ctx) => {
            // rollback
            ctx?.prevLists?.forEach(([key, data]) => qc.setQueryData(key, data));
            ctx?.prevDetails?.forEach(([key, data]) => qc.setQueryData(key, data));
        },

        onSettled: async () => {
            await qc.invalidateQueries({ queryKey: ordersKeys.lists() });
            await qc.invalidateQueries({ queryKey: ordersKeys.details() });
            qc.invalidateQueries({ queryKey: dashboardKeys.all });
        },
    });
}
