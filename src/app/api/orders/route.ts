import { NextRequest } from 'next/server';
import {
    ORDER_CHANNELS as CHANNELS,
    ORDER_STATUSES as STATUSES,
    ORDER_CUSTOMERS as CUSTOMERS,
    ORDERS_QUERY_DEFAULT as DEFAULT,
    OrderStatus,
    OrderChannel,
    ORDERS_PAGE_SIZE_OPTIONS,
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

function normalizePageSize(n: number) {
    return (ORDERS_PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? n : DEFAULT.pageSize;
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

function parseQuery(searchParams: URLSearchParams) {
    const q = (searchParams.get('q') ?? DEFAULT.q).trim().toLowerCase();

    const statusRaw = searchParams.get('status');
    const status: StatusFilter = statusRaw && isStatus(statusRaw) ? statusRaw : DEFAULT.status;

    const channelRaw = searchParams.get('channel');
    const channel: ChannelFilter = channelRaw && isChannel(channelRaw) ? channelRaw : DEFAULT.channel;

    const page = Math.max(1, toInt(searchParams.get('page'), DEFAULT.page));
    const pageSize = normalizePageSize(toInt(searchParams.get('pageSize'), DEFAULT.pageSize));

    const id = (searchParams.get('id') ?? '').trim();

    return { q, status, channel, page, pageSize, id };
}

const ALL = buildMockOrders(180);

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

export async function PATCH(req: NextRequest) {
    const body = await req.json().catch(() => null);
    const id = body?.id as string | undefined;
    const status = body?.status as string | undefined;

    if (!id || !status) return Response.json({ error: 'invalid' }, { status: 400 });

    const idx = ALL.findIndex((o) => o.id === id);
    if (idx < 0) return Response.json({ error: 'not_found' }, { status: 404 });

    // 데모용: 가끔 실패
    if (Math.random() < 0.1) return Response.json({ error: 'random_fail' }, { status: 500 });

    const next = { ...ALL[idx], status: status as Status };
    ALL[idx] = next;

    return Response.json({ item: next });
}
