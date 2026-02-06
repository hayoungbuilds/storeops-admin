import { NextRequest } from 'next/server';
import { inventoryDb, statusOf } from '@/lib/mockDb/inventoryDb';

type StockStatus = 'ok' | 'low' | 'oos';
type StatusFilter = StockStatus | 'all';

type PatchBody = { sku?: string; delta?: number };

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);

    const q = (searchParams.get('q') ?? '').trim().toLowerCase();
    const status = (searchParams.get('status') ?? 'all') as StatusFilter;

    let items = [...inventoryDb];

    if (q) items = items.filter((x) => x.sku.toLowerCase().includes(q) || x.name.toLowerCase().includes(q));
    if (status !== 'all') items = items.filter((x) => x.status === status);

    const kpi = {
        total: items.length,
        low: items.filter((x) => x.status === 'low').length,
        oos: items.filter((x) => x.status === 'oos').length,
    };

    return Response.json({ items, kpi });
}

export async function PATCH(req: NextRequest) {
    const role = req.headers.get('x-role') ?? 'viewer';
    if (role !== 'admin') return Response.json({ error: 'forbidden' }, { status: 403 });

    const body = (await req.json().catch(() => null)) as PatchBody | null;
    const sku = body?.sku;
    const delta = body?.delta;

    if (!sku || typeof delta !== 'number' || !Number.isFinite(delta)) {
        return Response.json({ error: 'invalid' }, { status: 400 });
    }

    const idx = inventoryDb.findIndex((x) => x.sku === sku);
    if (idx < 0) return Response.json({ error: 'not_found' }, { status: 404 });

    const current = inventoryDb[idx];
    if (delta < 0 && current.stock <= 0) {
        return Response.json({ error: 'stock_already_zero' }, { status: 400 });
    }

    // 데모: 가끔 실패
    if (Math.random() < 0.08) return Response.json({ error: 'random_fail' }, { status: 500 });

    const nextStock = Math.max(0, current.stock + Math.trunc(delta));
    inventoryDb[idx] = {
        ...current,
        stock: nextStock,
        status: statusOf(nextStock, current.safetyStock),
        updatedAt: `2026-02-06 16:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
    };

    return Response.json({ item: inventoryDb[idx] });
}
