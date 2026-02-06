'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { formatKRW } from '@/lib/format';
import { StatusBadge } from '@/features/orders/components/StatusBadge';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { dashboardKeys } from '@/features/dashboard/queries';

type DashboardRange = 'today' | '7d';

type DashboardResponse = {
    kpi: { total: number; preparing: number; shipped: number; todaySales: number };
    recent: Array<{
        id: string;
        time: string;
        customer: string;
        channel: 'Online' | 'POS';
        status: 'paid' | 'preparing' | 'shipped' | 'cancelled' | 'refunded';
        amount: number;
    }>;
    charts: {
        salesByHour: Array<{ hour: string; sales: number }>;
        ordersByStatus: Array<{ status: 'paid' | 'preparing' | 'shipped' | 'cancelled' | 'refunded'; count: number }>;
    };
};

function KpiCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
    );
}

function fillHourlySales(raw: Array<{ hour: string; sales: number }>) {
    const map = new Map(raw.map((d) => [d.hour, d.sales]));

    return Array.from({ length: 24 }, (_, h) => {
        const key = `${String(h).padStart(2, '0')}:00`; // "00:00"~"23:00"
        return { hour: key, sales: map.get(key) ?? 0 };
    });
}

function statusLabel(s: string) {
    const m: Record<string, string> = {
        paid: '결제',
        preparing: '준비',
        shipped: '출고',
        cancelled: '취소',
        refunded: '환불',
    };
    return m[s] ?? s;
}

export default function DashboardPage() {
    const [range, setRange] = useState<DashboardRange>('today');
    const TICKS = ['00:00', '06:00', '12:00', '18:00', '23:00'];

    const { data, isLoading, isError, refetch, isFetching } = useQuery({
        queryKey: dashboardKeys.byRange(range),
        queryFn: async ({ queryKey }) => {
            const [, r] = queryKey as ReturnType<typeof dashboardKeys.byRange>;
            const res = await fetch(`/api/dashboard?range=${r}`);
            if (!res.ok) throw new Error('Failed');
            return (await res.json()) as DashboardResponse;
        },
        placeholderData: (prev) => prev,
        staleTime: 10_000,
    });

    const salesData = useMemo(() => {
        if (!data) return [];

        return fillHourlySales(data.charts.salesByHour);
    }, [data]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div>
                    <div className="h-7 w-40 rounded bg-muted/40" />
                    <div className="mt-2 h-4 w-64 rounded bg-muted/30" />
                </div>
                <div className="grid gap-3 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[92px] rounded-lg border bg-muted/20" />
                    ))}
                </div>
                <div className="h-48 rounded-lg border bg-muted/20" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">대시보드를 불러오지 못했어요</p>
                <button className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm" onClick={() => refetch()}>
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">운영 지표와 최근 주문을 한 눈에</p>
                    </div>
                    {isFetching && <span className="text-xs text-muted-foreground">업데이트 중…</span>}
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <KpiCard label="총 주문" value={data.kpi.total} />
                <KpiCard label="준비중" value={data.kpi.preparing} />
                <KpiCard label="출고" value={data.kpi.shipped} />
                <KpiCard label="오늘 매출" value={formatKRW(data.kpi.todaySales)} />
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <div className="text-sm font-medium">시간대별 매출</div>
                            <div className="mt-1 text-xs text-muted-foreground">
                                {range === 'today' ? '오늘' : '최근 7일'} 기준
                            </div>
                        </div>

                        <div className="flex items-center gap-1 rounded-md border bg-muted p-1 text-xs">
                            <button
                                className={`px-2 py-1 rounded ${range === 'today' ? 'bg-background' : ''}`}
                                onClick={() => setRange('today')}
                            >
                                오늘
                            </button>
                            <button
                                className={`px-2 py-1 rounded ${range === '7d' ? 'bg-background' : ''}`}
                                onClick={() => setRange('7d')}
                            >
                                7일
                            </button>
                        </div>
                    </div>

                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={salesData}>
                                <XAxis
                                    padding={{ left: 16, right: 16 }}
                                    dataKey="hour"
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    tick={{ fontSize: 12 }}
                                    ticks={TICKS}
                                    tickFormatter={(h: string) => `${h.split(':')[0]}시`}
                                />
                                <Tooltip
                                    formatter={(v: any) => formatKRW(Number(v))}
                                    labelFormatter={(label) => `시간: ${label}`}
                                />
                                <YAxis hide />
                                <Line type="monotone" dataKey="sales" dot={false} strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        고정된 시간 버킷(00~23)에 맞춰 빈 구간은 0으로 채웁니다.
                    </p>
                </div>

                <div className="rounded-lg border bg-background p-4">
                    <div className="mb-3 text-sm font-medium">상태별 주문수</div>
                    <div className="h-56">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={data.charts.ordersByStatus}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis
                                    dataKey="status"
                                    tickLine={false}
                                    axisLine={false}
                                    interval={0}
                                    tickFormatter={statusLabel}
                                />
                                <YAxis tickLine={false} axisLine={false} />
                                <Tooltip />
                                <Bar dataKey="count" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">상태 분포를 빠르게 확인합니다.</p>
                </div>
            </div>

            <div className="overflow-hidden rounded-lg border bg-background">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <div className="text-sm font-medium">최근 주문</div>
                    <Link href="/orders" className="text-sm text-muted-foreground hover:underline">
                        주문 전체 보기 →
                    </Link>
                </div>

                <div className="divide-y">
                    {data.recent.map((o) => (
                        <Link
                            key={o.id}
                            href={`/orders/${encodeURIComponent(o.id)}`}
                            className="block px-4 py-3 text-sm hover:bg-muted/30"
                        >
                            <div className="flex items-center justify-between">
                                <div className="font-medium">{o.id}</div>
                                <StatusBadge status={o.status} />
                            </div>
                            <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                                <div>
                                    {o.time} · {o.customer} · {o.channel}
                                </div>
                                <div className="text-foreground">{formatKRW(o.amount)}</div>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
}
