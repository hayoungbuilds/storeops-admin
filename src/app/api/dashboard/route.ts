import { NextRequest } from 'next/server';
import type { OrderStatus } from '@/shared/constants/orders';
import { ordersDb } from '@/lib/mockDb/ordersDb';

type Status = OrderStatus;

type DashboardResponse = {
    kpi: { total: number; preparing: number; shipped: number; todaySales: number };
    recent: Array<{
        id: string;
        time: string;
        customer: string;
        channel: 'Online' | 'POS';
        status: Status;
        amount: number;
    }>;
    charts: {
        salesByHour: Array<{ hour: string; sales: number }>;
        ordersByStatus: Array<{ status: Status; count: number }>;
    };
};

// 데모 기준 "오늘" 날짜(데이터 생성 날짜에 맞춰)
const TODAY = '2026-02-02';

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const range = (searchParams.get('range') ?? 'today') as 'today' | '7d';

    // --- range 적용(데모) ---
    // 실제라면 createdAt(Date)로 비교하지만, 지금은 time 문자열이므로 startsWith로 처리
    const base = range === 'today' ? ordersDb.filter((o) => o.time.startsWith(TODAY)) : ordersDb;

    // --- KPI ---
    const total = base.length;
    const preparing = base.filter((o) => o.status === 'preparing').length;
    const shipped = base.filter((o) => o.status === 'shipped').length;

    const todaySales = base.reduce((sum, o) => sum + o.amount, 0);

    // --- 최근 주문 5개 ---
    const recent = [...base].sort((a, b) => b.time.localeCompare(a.time)).slice(0, 5);

    // --- charts: 시간대별 매출 (0~23 버킷 채우기) ---
    const buckets = Array.from({ length: 24 }, (_, h) => ({
        hour: `${String(h).padStart(2, '0')}:00`,
        sales: 0,
    }));

    for (const o of base) {
        const h = Number(o.time.slice(11, 13));
        if (Number.isFinite(h) && h >= 0 && h <= 23) {
            buckets[h].sales += o.amount;
        }
    }
    const salesByHour = buckets;

    // --- charts: 상태별 주문수 ---
    const statusCounts: Record<Status, number> = {
        paid: 0,
        preparing: 0,
        shipped: 0,
        cancelled: 0,
        refunded: 0,
    };

    for (const o of base) {
        statusCounts[o.status] += 1;
    }

    const ordersByStatus = (Object.entries(statusCounts) as Array<[Status, number]>).map(([status, count]) => ({
        status,
        count,
    }));

    const res: DashboardResponse = {
        kpi: { total, preparing, shipped, todaySales },
        recent,
        charts: { salesByHour, ordersByStatus },
    };

    return Response.json(res);
}
