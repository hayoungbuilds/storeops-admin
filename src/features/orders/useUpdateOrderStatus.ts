import { useMutation, useQueryClient } from '@tanstack/react-query';

export function useUpdateOrderStatus() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (payload: { id: string; status: string }) => {
            const res = await fetch('/api/orders', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });
            if (!res.ok) throw new Error('Failed to update');
            return res.json() as Promise<{ item: any }>;
        },

        // optimistic
        onMutate: async ({ id, status }) => {
            await qc.cancelQueries({ queryKey: ['order', id] });

            const prev = qc.getQueryData<{ item: any }>(['order', id]);

            qc.setQueryData(['order', id], (old: any) => {
                if (!old?.item) return old;
                return { ...old, item: { ...old.item, status } };
            });

            // 리스트도 같이 갱신 (orders 쿼리키가 ["orders", state]라면 prefix로)
            qc.setQueriesData({ queryKey: ['orders'] }, (old: any) => {
                if (!old?.items) return old;
                return {
                    ...old,
                    items: old.items.map((o: any) => (o.id === id ? { ...o, status } : o)),
                };
            });

            return { prev };
        },

        onError: (_err, variables, ctx) => {
            if (ctx?.prev) qc.setQueryData(['order', variables.id], ctx.prev);
        },

        onSettled: (_data, _err, variables) => {
            qc.invalidateQueries({ queryKey: ['order', variables.id] });
            qc.invalidateQueries({ queryKey: ['orders'] });
        },
    });
}
