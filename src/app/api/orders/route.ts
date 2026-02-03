import { NextRequest } from 'next/server';
import {
    ORDER_CHANNELS as CHANNELS,
    ORDER_STATUSES as STATUSES,
    ORDER_CUSTOMERS as CUSTOMERS,
    ORDERS_QUERY_DEFAULT as DEFAULT,
    OrderStatus,
    OrderChannel,
} from '@/shared/constants/orders';

type Status = OrderStatus;
type Channel = OrderChannel;

type StatusFilter = Status | 'all';
type ChannelFilter = Channel | 'all';

export type Order = {
    id: string;
    time: string;
    customer: string;
    channel: Channel;
    status: Status;
    amount: number;
};

type OrdersResponse = {
    items: Order[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};

function isStatus(value: string): value is Status {
    return (STATUSES as readonly string[]).includes(value);
}
function isChannel(value: string): value is Channel {
    return (CHANNELS as readonly string[]).includes(value);
}

function pad(n: number, width = 4) {
    return String(n).padStart(width, '0');
}

function toInt(value: string | null, fallback: number) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

function buildMockOrders(count = 180): Order[] {
    return Array.from({ length: count }, (_, i) => {
        const idx = i + 1;
        const status = STATUSES[idx % STATUSES.length];
        const channel = CHANNELS[idx % CHANNELS.length];

        return {
            id: `ORD-20260202-${pad(idx)}`,
            time: `2026-02-02 10:${pad(idx % 60, 2)}`,
            customer: CUSTOMERS[idx % CUSTOMERS.length],
            channel,
            status,
            amount: 10_000 + (idx % 20) * 3_500,
        };
    });
}

const ALL = buildMockOrders(180);

function parseQuery(searchParams: URLSearchParams) {
    const q = (searchParams.get('q') ?? DEFAULT.q).trim().toLowerCase();

    const statusRaw = searchParams.get('status');
    const status: StatusFilter = statusRaw && isStatus(statusRaw) ? statusRaw : DEFAULT.status;

    const channelRaw = searchParams.get('channel');
    const channel: ChannelFilter = channelRaw && isChannel(channelRaw) ? channelRaw : DEFAULT.channel;

    const page = Math.max(1, toInt(searchParams.get('page'), DEFAULT.page));
    const pageSize = clamp(toInt(searchParams.get('pageSize'), DEFAULT.pageSize), DEFAULT.pageSize, 50);

    const id = (searchParams.get('id') ?? '').trim();

    return { q, status, channel, page, pageSize, id };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { q, status, channel, page, pageSize, id } = parseQuery(searchParams);

    // 단건 조회
    if (id) {
        const found = ALL.find((o) => o.id === id);
        return Response.json({ item: found ?? null });
    }

    let filtered = ALL;

    if (q) {
        filtered = filtered.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    }

    if (status !== 'all') filtered = filtered.filter((o) => o.status === status);
    if (channel !== 'all') filtered = filtered.filter((o) => o.channel === channel);

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = clamp(page, 1, totalPages);

    const start = (safePage - 1) * pageSize;
    const items = filtered.slice(start, start + pageSize);

    const res: OrdersResponse = {
        items,
        meta: { total, page: safePage, pageSize, totalPages },
    };

    return Response.json(res);
}
