import { NextRequest } from 'next/server';
import { normalizeOrdersPageSize, normalizeOrdersSort } from '@/lib/ordersQuery';
import { clamp, toInt } from '@/lib/number';
import {
    ORDERS_QUERY_DEFAULT as DEFAULT,
    ORDER_CHANNELS,
    ORDER_STATUSES,
    type OrderStatus,
    type OrderChannel,
    Order,
} from '@/shared/constants/orders';
import { requireAdmin } from '@/lib/server/auth';
import { ordersDb } from '@/lib/mockDb/ordersDb';

type StatusFilter = OrderStatus | 'all';
type ChannelFilter = OrderChannel | 'all';

type OrdersResponse = {
    items: Order[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
};

type PatchBody = { id?: string; status?: string };

function isOrderStatus(v: string): v is OrderStatus {
    return (ORDER_STATUSES as readonly string[]).includes(v);
}

function isOrderChannel(v: string): v is OrderChannel {
    return (ORDER_CHANNELS as readonly string[]).includes(v);
}

function parseQuery(searchParams: URLSearchParams) {
    const q = (searchParams.get('q') ?? DEFAULT.q).trim().toLowerCase();

    const statusRaw = searchParams.get('status');
    const status: StatusFilter = statusRaw && isOrderStatus(statusRaw) ? statusRaw : DEFAULT.status;

    const channelRaw = searchParams.get('channel');
    const channel: ChannelFilter = channelRaw && isOrderChannel(channelRaw) ? channelRaw : DEFAULT.channel;

    const page = Math.max(1, toInt(searchParams.get('page'), DEFAULT.page));
    const pageSize = normalizeOrdersPageSize(toInt(searchParams.get('pageSize'), DEFAULT.pageSize), DEFAULT.pageSize);

    const sort = normalizeOrdersSort(searchParams.get('sort'), DEFAULT.sort);

    const id = (searchParams.get('id') ?? '').trim();

    return { q, status, channel, page, pageSize, id, sort };
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const { q, status, channel, page, pageSize, id, sort } = parseQuery(searchParams);

    // 단건 조회
    if (id) {
        const found = ordersDb.find((o) => o.id === id);
        return Response.json({ item: found ?? null });
    }

    let filtered = [...ordersDb];

    if (q) {
        filtered = filtered.filter((o) => o.id.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q));
    }

    if (status !== 'all') filtered = filtered.filter((o) => o.status === status);
    if (channel !== 'all') filtered = filtered.filter((o) => o.channel === channel);

    switch (sort) {
        case 'amount_desc':
            filtered.sort((a, b) => b.amount - a.amount);
            break;
        case 'amount_asc':
            filtered.sort((a, b) => a.amount - b.amount);
            break;
        case 'time_desc':
        default:
            filtered.sort((a, b) => b.time.localeCompare(a.time));
            break;
    }

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
    const forbidden = requireAdmin(req);
    if (forbidden) return forbidden;

    const body = (await req.json().catch(() => null)) as PatchBody | null;

    const id = body?.id?.trim();
    const statusRaw = body?.status;

    if (!id || !statusRaw) return Response.json({ error: 'invalid' }, { status: 400 });
    if (!isOrderStatus(statusRaw)) return Response.json({ error: 'invalid_status' }, { status: 400 });

    const idx = ordersDb.findIndex((o) => o.id === id);
    if (idx < 0) return Response.json({ error: 'not_found' }, { status: 404 });

    ordersDb[idx] = { ...ordersDb[idx], status: statusRaw };

    return Response.json({ item: ordersDb[idx] });
}
