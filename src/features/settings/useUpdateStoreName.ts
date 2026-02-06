import { useMutation, useQueryClient } from '@tanstack/react-query';
import type { Settings } from './useSettings';

export function useUpdateStoreName() {
    const qc = useQueryClient();

    return useMutation({
        mutationFn: async (storeName: string) => {
            const res = await fetch('/api/settings', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ storeName }),
            });
            if (!res.ok) throw new Error('Failed');
            return (await res.json()) as Settings;
        },

        onSuccess: (next) => {
            qc.setQueryData<Settings>(['settings'], next);
        },
    });
}
