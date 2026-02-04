import { NextRequest } from 'next/server';
import { ordersDb } from '@/lib/mockOrdersDb';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/constants/orders';

type BulkBody = {
    ids?: string[];
    status?: string; // 기본 shipped
};

function isOrderStatus(v: string): v is OrderStatus {
    return (ORDER_STATUSES as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
    const body = (await req.json().catch(() => null)) as BulkBody | null;

    const ids = Array.isArray(body?.ids) ? body!.ids.filter(Boolean) : [];
    const statusRaw = body?.status ?? 'shipped';

    if (ids.length === 0) return Response.json({ error: 'invalid_ids' }, { status: 400 });
    if (!isOrderStatus(statusRaw)) return Response.json({ error: 'invalid_status' }, { status: 400 });

    const idSet = new Set(ids);
    let updated = 0;

    for (let i = 0; i < ordersDb.length; i++) {
        const o = ordersDb[i];
        if (idSet.has(o.id)) {
            ordersDb[i] = { ...o, status: statusRaw };
            updated++;
        }
    }

    return Response.json({ ok: true, updated, status: statusRaw });
}
