import {
    ORDER_CHANNELS,
    ORDER_STATUSES,
    ORDER_CUSTOMERS,
    type OrderChannel,
    type OrderStatus,
    Order,
} from '@/shared/constants/orders';

function pad(n: number, width = 4) {
    return String(n).padStart(width, '0');
}
const baseDate = '2026-02-02';

function pad2(n: number) {
    return String(n).padStart(2, '0');
}

function randomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function buildMockOrders(count = 180): Order[] {
    // 시간/분을 랜덤 분산
    const hour = randomInt(9, 22); // 09~22시
    const minute = randomInt(0, 59);

    return Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const status = ORDER_STATUSES[idx % ORDER_STATUSES.length];
        const channel = ORDER_CHANNELS[idx % ORDER_CHANNELS.length];

        return {
            id: `ORD-20260202-${pad(idx)}`,
            time: `${baseDate} ${pad2(hour)}:${pad2(minute)}`,
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
