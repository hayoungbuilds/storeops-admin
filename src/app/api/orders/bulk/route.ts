import { NextRequest } from 'next/server';
import { ordersDb } from '@/lib/mockOrdersDb';
import { ORDER_STATUSES, type OrderStatus } from '@/shared/constants/orders';
import { requireAdmin } from '@/lib/server/auth';

type BulkBody = { ids?: string[]; status?: string };

function isOrderStatus(v: string): v is OrderStatus {
    return (ORDER_STATUSES as readonly string[]).includes(v);
}

export async function POST(req: NextRequest) {
    const forbidden = requireAdmin(req);
    if (forbidden) return forbidden;

    const body = (await req.json().catch(() => null)) as BulkBody | null;

    const ids = Array.isArray(body?.ids) ? body!.ids.filter(Boolean) : [];
    const statusRaw = body?.status ?? 'shipped';

    if (ids.length === 0) return Response.json({ error: 'invalid_ids' }, { status: 400 });
    if (!isOrderStatus(statusRaw)) return Response.json({ error: 'invalid_status' }, { status: 400 });

    const byId = new Map(ordersDb.map((o) => [o.id, o] as const));

    const updated: string[] = [];
    const skipped: string[] = [];
    const notFound: string[] = [];

    for (const id of ids) {
        const found = byId.get(id);
        if (!found) {
            notFound.push(id);
            continue;
        }

        if (found.status === statusRaw) {
            skipped.push(id);
            continue;
        }

        // 메모리 DB 반영
        const idx = ordersDb.findIndex((o) => o.id === id);
        if (idx >= 0) {
            ordersDb[idx] = { ...ordersDb[idx], status: statusRaw };
            updated.push(id);
        } else {
            notFound.push(id);
        }
    }

    return Response.json({
        ok: true,
        status: statusRaw,
        requested: ids.length,
        updated,
        skipped,
        notFound,
    });
}
