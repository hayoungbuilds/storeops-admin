import {
    ORDER_CHANNELS,
    ORDER_STATUSES,
    ORDER_CUSTOMERS,
    type OrderChannel,
    type OrderStatus,
} from '@/shared/constants/orders';

export type Order = {
    id: string;
    time: string;
    customer: string;
    channel: OrderChannel;
    status: OrderStatus;
    amount: number;
};

function pad(n: number, width = 4) {
    return String(n).padStart(width, '0');
}

function buildMockOrders(count = 180): Order[] {
    return Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const status = ORDER_STATUSES[idx % ORDER_STATUSES.length];
        const channel = ORDER_CHANNELS[idx % ORDER_CHANNELS.length];

        return {
            id: `ORD-20260202-${pad(idx)}`,
            time: `2026-02-02 10:${pad(idx % 60, 2)}`,
            customer: ORDER_CUSTOMERS[idx % ORDER_CUSTOMERS.length],
            channel,
            status,
            amount: 10_000 + (idx % 20) * 3_500,
        };
    });
}

// dev 서버 메모리에서 유지되는 "가짜 DB"
export const ordersDb: Order[] = buildMockOrders(180);

export function updateManyStatus(ids: string[], nextStatus: OrderStatus) {
    const idSet = new Set(ids);
    let updated = 0;

    for (const o of ordersDb) {
        if (idSet.has(o.id)) {
            o.status = nextStatus;
            updated++;
        }
    }

    return { updated };
}
