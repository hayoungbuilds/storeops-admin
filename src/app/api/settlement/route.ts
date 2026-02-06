import { NextRequest } from 'next/server';

type Range = '7d' | '30d';

type SettlementRow = {
    date: string; // YYYY-MM-DD
    channel: 'Online' | 'POS';
    orders: number;
    sales: number;
    fee: number;
    payout: number;
};

function clampRange(v: string | null): Range {
    return v === '30d' ? '30d' : '7d';
}

function makeDate(base: Date, offsetDays: number) {
    const d = new Date(base);
    d.setDate(d.getDate() - offsetDays);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url);
    const range = clampRange(searchParams.get('range'));

    const days = range === '30d' ? 30 : 7;
    const base = new Date('2026-02-06T00:00:00');

    const rows: SettlementRow[] = [];
    for (let i = 0; i < days; i++) {
        const date = makeDate(base, i);
        // Online
        {
            const orders = 12 + ((i * 3) % 10);
            const sales = orders * (18_000 + ((i * 7) % 6) * 1_500);
            const fee = Math.floor(sales * 0.035);
            rows.push({ date, channel: 'Online', orders, sales, fee, payout: sales - fee });
        }
        // POS
        {
            const orders = 9 + ((i * 5) % 8);
            const sales = orders * (16_000 + ((i * 11) % 7) * 1_200);
            const fee = Math.floor(sales * 0.02);
            rows.push({ date, channel: 'POS', orders, sales, fee, payout: sales - fee });
        }
    }

    const summary = rows.reduce(
        (acc, r) => {
            acc.orders += r.orders;
            acc.sales += r.sales;
            acc.fee += r.fee;
            acc.payout += r.payout;
            return acc;
        },
        { orders: 0, sales: 0, fee: 0, payout: 0 }
    );

    return Response.json({ range, summary, rows });
}
