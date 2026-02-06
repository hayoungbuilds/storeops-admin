'use client';

import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { formatKRW } from '@/lib/format';

type Range = '7d' | '30d';

type SettlementRow = {
    date: string;
    channel: 'Online' | 'POS';
    orders: number;
    sales: number;
    fee: number;
    payout: number;
};

type SettlementResponse = {
    range: Range;
    summary: { orders: number; sales: number; fee: number; payout: number };
    rows: SettlementRow[];
};

function KpiCard({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className="mt-2 text-2xl font-semibold">{value}</div>
        </div>
    );
}

export default function SettlementPage() {
    const [range, setRange] = useState<Range>('7d');

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: ['settlement', range],
        queryFn: async () => {
            const res = await fetch(`/api/settlement?range=${range}`);
            if (!res.ok) throw new Error('Failed');
            return (await res.json()) as SettlementResponse;
        },
    });

    const rows = useMemo(() => data?.rows ?? [], [data]);

    if (isLoading) {
        return (
            <div className="space-y-6">
                <div className="h-7 w-40 rounded bg-muted/40" />
                <div className="grid gap-3 md:grid-cols-4">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-[92px] rounded-lg border bg-muted/20" />
                    ))}
                </div>
                <div className="h-64 rounded-lg border bg-muted/20" />
            </div>
        );
    }

    if (isError || !data) {
        return (
            <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">정산 데이터를 불러오지 못했어요</p>
                <button className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm" onClick={() => refetch()}>
                    다시 시도
                </button>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 flex flex-col gap-6">
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Settlement</h1>
                    <p className="text-sm text-muted-foreground">기간별 정산 요약과 내역을 확인합니다.</p>
                </div>

                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 rounded-md border bg-muted p-1 text-xs">
                        <button
                            className={`px-2 py-1 rounded ${range === '7d' ? 'bg-background' : ''}`}
                            onClick={() => setRange('7d')}
                        >
                            7일
                        </button>
                        <button
                            className={`px-2 py-1 rounded ${range === '30d' ? 'bg-background' : ''}`}
                            onClick={() => setRange('30d')}
                        >
                            30일
                        </button>
                    </div>

                    <button
                        className="h-9 rounded-md border bg-muted px-3 text-sm"
                        onClick={() => alert('CSV 다운로드(데모)')}
                    >
                        CSV 다운로드
                    </button>
                </div>
            </div>

            <div className="grid gap-3 md:grid-cols-4">
                <KpiCard label="주문수" value={data.summary.orders} />
                <KpiCard label="총 매출" value={formatKRW(data.summary.sales)} />
                <KpiCard label="수수료" value={formatKRW(data.summary.fee)} />
                <KpiCard label="정산 예정" value={formatKRW(data.summary.payout)} />
            </div>

            <div className="overflow-auto rounded-lg border bg-background">
                <div className="grid grid-cols-12 border-b px-4 py-3 text-xs text-muted-foreground">
                    <div className="col-span-3">날짜</div>
                    <div className="col-span-2">채널</div>
                    <div className="col-span-2 text-right">주문수</div>
                    <div className="col-span-2 text-right">매출</div>
                    <div className="col-span-1 text-right">수수료</div>
                    <div className="col-span-2 text-right">정산액</div>
                </div>

                <div className="min-h-0 flex-1 overflow-y-auto divide-y">
                    {rows.map((r, i) => (
                        <div
                            key={`${r.date}-${r.channel}-${i}`}
                            className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-muted/30"
                        >
                            <div className="col-span-3 font-medium">{r.date}</div>
                            <div className="col-span-2 text-muted-foreground">{r.channel}</div>
                            <div className="col-span-2 text-right">{r.orders}</div>
                            <div className="col-span-2 text-right">{formatKRW(r.sales)}</div>
                            <div className="col-span-1 text-right">{formatKRW(r.fee)}</div>
                            <div className="col-span-2 text-right font-medium">{formatKRW(r.payout)}</div>
                        </div>
                    ))}
                </div>

                <div className="border-t px-4 py-3 text-xs text-muted-foreground">데모 정산 데이터입니다.</div>
            </div>
        </div>
    );
}
