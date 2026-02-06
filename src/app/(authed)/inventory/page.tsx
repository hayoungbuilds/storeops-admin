'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { useRole } from '@/shared/providers/RoleProvider';
import { toast } from 'sonner';

type StockStatus = 'ok' | 'low' | 'oos';
type StatusFilter = StockStatus | 'all';

type InventoryItem = {
    sku: string;
    name: string;
    stock: number;
    safetyStock: number;
    status: StockStatus;
    updatedAt: string;
};

type InventoryResponse = {
    kpi: { total: number; low: number; oos: number };
    items: InventoryItem[];
};

function KpiCard({ label, value, isMuted = false }: { label: string; value: string | number; isMuted?: boolean }) {
    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="text-sm text-muted-foreground">{label}</div>
            <div className={`mt-2 text-2xl font-semibold ${isMuted ? 'opacity-60' : ''}`}>{value}</div>
        </div>
    );
}

function StatusPill({ status }: { status: StockStatus }) {
    const map: Record<StockStatus, { label: string; cls: string }> = {
        ok: { label: '정상', cls: 'bg-muted/40 text-foreground' },
        low: { label: '임박', cls: 'bg-muted text-foreground' },
        oos: { label: '품절', cls: 'bg-background text-foreground border' },
    };
    const s = map[status];
    return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${s.cls}`}>{s.label}</span>;
}

function LoadingInline() {
    return (
        <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground">
            <span className="inline-block h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground/70" />
            <span>검색 중…</span>
        </div>
    );
}

export default function InventoryPage() {
    const [qInput, setQInput] = useState('');
    const qDebounced = useDebouncedValue(qInput, 250);

    const [status, setStatus] = useState<StatusFilter>('all');

    const { data, isLoading, isFetching, isError, refetch } = useQuery({
        queryKey: ['inventory', { q: qDebounced, status }],
        queryFn: async () => {
            const sp = new URLSearchParams({ q: qDebounced, status });
            const res = await fetch(`/api/inventory?${sp.toString()}`);
            if (!res.ok) throw new Error('Failed to fetch inventory');
            return (await res.json()) as InventoryResponse;
        },
        staleTime: 30_000,
        placeholderData: (prev) => prev,
    });

    const items = useMemo(() => data?.items ?? [], [data]);
    const kpi = data?.kpi;

    const showInitialLoading = isLoading && !data;

    const onReset = () => {
        setQInput('');
        setStatus('all');
    };

    const qc = useQueryClient();
    const { role } = useRole();
    const canWrite = role === 'admin';

    const adjustStock = async (sku: string, delta: number, currentStock?: number) => {
        if (!canWrite) {
            toast.error('Viewer 권한에서는 재고를 조정할 수 없어요');
            return;
        }

        if (delta < 0 && (currentStock ?? 0) <= 0) return;

        // optimistic: 현재 캐시를 먼저 업데이트
        const key = ['inventory', { q: qDebounced, status }];
        const prev = qc.getQueryData<InventoryResponse>(key);

        qc.setQueryData<InventoryResponse>(key, (old) => {
            if (!old) return old;
            return {
                ...old,
                items: old.items.map((x) => {
                    if (x.sku !== sku) return x;
                    const nextStock = Math.max(0, x.stock + delta);
                    const nextStatus: StockStatus = nextStock <= 0 ? 'oos' : nextStock <= x.safetyStock ? 'low' : 'ok';
                    return { ...x, stock: nextStock, status: nextStatus };
                }),
            };
        });

        try {
            const res = await fetch('/api/inventory', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'x-role': role,
                },
                body: JSON.stringify({ sku, delta }),
            });

            if (res.status === 403) {
                toast.error('권한이 없어요 (403)');
                if (prev) qc.setQueryData(key, prev);
                return;
            }

            if (!res.ok) {
                toast.error('재고 반영 실패');
                if (prev) qc.setQueryData(key, prev);
                return;
            }

            toast.success('재고 반영 완료');
            qc.invalidateQueries({ queryKey: ['inventory'] });
        } catch {
            toast.error('네트워크 오류');
            if (prev) qc.setQueryData(key, prev);
        }
    };

    const isTyping = qInput !== qDebounced;

    if (isError) {
        return (
            <div className="space-y-6">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">Inventory</h1>
                    <p className="text-sm text-muted-foreground">품절/임박 SKU를 빠르게 확인합니다.</p>
                </div>

                <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">재고를 불러오지 못했어요</p>
                    <button className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm" onClick={() => refetch()}>
                        다시 시도
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full min-h-0 flex flex-col gap-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Inventory</h1>
                <p className="text-sm text-muted-foreground">품절/임박 SKU를 빠르게 확인합니다.</p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
                <KpiCard label="SKU" value={kpi?.total ?? '-'} isMuted={!kpi} />
                <KpiCard label="임박" value={kpi?.low ?? '-'} isMuted={!kpi} />
                <KpiCard label="품절" value={kpi?.oos ?? '-'} isMuted={!kpi} />
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <input
                            className="h-10 w-full rounded-md border bg-background px-3 pr-24 text-sm outline-none"
                            placeholder="SKU / 상품명"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />
                        {isTyping || isFetching ? <LoadingInline /> : null}
                    </div>

                    <select
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        value={status}
                        onChange={(e) => setStatus(e.target.value as StatusFilter)}
                    >
                        <option value="all">상태 전체</option>
                        <option value="ok">정상</option>
                        <option value="low">임박</option>
                        <option value="oos">품절</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button className="h-10 rounded-md border bg-muted px-3 text-sm" onClick={onReset}>
                        초기화
                    </button>
                </div>
            </div>

            {/* Content */}
            {showInitialLoading ? (
                <div className="h-64 rounded-lg border bg-muted/20" />
            ) : items.length === 0 ? (
                <div className="rounded-lg border bg-background p-10 text-center">
                    <p className="text-sm font-medium">검색 결과가 없어요</p>
                    <p className="mt-1 text-xs text-muted-foreground">검색어/필터를 바꿔보거나 초기화해보세요.</p>
                    <div className="mt-4 flex justify-center">
                        <button className="h-10 rounded-md border bg-muted px-3 text-sm" onClick={onReset}>
                            필터 초기화
                        </button>
                    </div>
                </div>
            ) : (
                <div className="overflow-y-auto rounded-lg border bg-background">
                    <div className="grid grid-cols-12 border-b px-4 py-3 text-xs text-muted-foreground">
                        <div className="col-span-3">SKU</div>
                        <div className="col-span-4">상품</div>
                        <div className="col-span-2 text-right">재고/안전</div>
                        <div className="col-span-1 text-right">상태</div>
                        <div className="col-span-2 text-right">조정</div>
                    </div>

                    <div className="min-h-0 flex-1 overflow-y-auto divide-y">
                        {items.map((x) => (
                            <div
                                key={x.sku}
                                className="grid grid-cols-12 items-center px-4 py-3 text-sm hover:bg-muted/30"
                            >
                                <div className="col-span-3 font-medium">{x.sku}</div>
                                <div className="col-span-4 text-muted-foreground">{x.name}</div>

                                <div className="col-span-2 text-right">
                                    {x.stock} / {x.safetyStock}
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <StatusPill status={x.status} />
                                </div>

                                <div className="col-span-2 flex justify-end gap-2">
                                    <button
                                        className="h-8 rounded-md border bg-background px-2 text-xs hover:bg-muted/40 disabled:opacity-50"
                                        disabled={!canWrite || isFetching || x.stock <= 0}
                                        onClick={() => adjustStock(x.sku, -1, x.stock)}
                                        title={
                                            !canWrite
                                                ? 'Viewer는 조정 불가'
                                                : x.stock <= 0
                                                ? '재고가 0이면 감소할 수 없어요'
                                                : '재고 -1'
                                        }
                                    >
                                        -1
                                    </button>

                                    <button
                                        className="h-8 rounded-md border bg-background px-2 text-xs hover:bg-muted/40 disabled:opacity-50"
                                        disabled={!canWrite || isFetching}
                                        onClick={() => adjustStock(x.sku, +1)}
                                        title={canWrite ? '재고 +1' : 'Viewer는 조정 불가'}
                                    >
                                        +1
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="border-t px-4 py-3 text-xs text-muted-foreground">
                        데모 데이터입니다. (업데이트 기준: {items[0]?.updatedAt ?? '-'})
                    </div>
                </div>
            )}
        </div>
    );
}
