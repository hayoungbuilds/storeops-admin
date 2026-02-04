'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { useOrdersQueryState } from '@/features/orders/useOrdersQueryState';
import { useOrders } from '@/features/orders/useOrders';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { ORDERS_QUERY_DEFAULT as DEFAULT, ORDERS_PAGE_SIZE_OPTIONS, type OrderStatus } from '@/shared/constants/orders';
import { formatKRW } from '@/lib/format';
import { StatusBadge } from '@/features/orders/components/StatusBadge';
import type { Order } from '@/lib/mockOrdersDb';
import { useBulkUpdateOrderStatus } from '@/features/orders/useBulkUpdateOrderStatus';

export default function OrdersPage() {
    const router = useRouter();
    const { state, setQuery } = useOrdersQueryState();

    // URL -> fetch
    const { data, isLoading, isError, refetch } = useOrders(state);

    // search input: 즉시 입력 + 디바운스로 URL 반영
    const [qInput, setQInput] = useState(state.q);
    const qDebounced = useDebouncedValue(qInput, 350);

    // selection
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    // bulk mutation
    const bulk = useBulkUpdateOrderStatus();
    const isBulkLoading = bulk.isPending;

    // 페이지/필터/정렬/사이즈 바뀌면 선택 초기화
    useEffect(() => {
        setSelectedIds(new Set());
    }, [state.q, state.status, state.channel, state.page, state.pageSize, state.sort]);

    // URL이 외부에서 바뀌는 경우 input도 동기화
    useEffect(() => {
        setQInput(state.q);
    }, [state.q]);

    // 디바운스 값이 바뀌면 URL에 반영
    useEffect(() => {
        if (qDebounced !== state.q) setQuery({ q: qDebounced });
    }, [qDebounced, state.q, setQuery]);

    const idsOnPage = useMemo(() => (data?.items ?? []).map((o: Order) => o.id), [data]);

    const allSelectedOnPage = useMemo(() => {
        if (!idsOnPage.length) return false;
        return idsOnPage.every((id) => selectedIds.has(id));
    }, [idsOnPage, selectedIds]);

    const toggleOne = (id: string) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id);
            else next.add(id);
            return next;
        });
    };

    const toggleAllOnPage = () => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (allSelectedOnPage) idsOnPage.forEach((id) => next.delete(id));
            else idsOnPage.forEach((id) => next.add(id));
            return next;
        });
    };

    const onReset = () => {
        setQInput(DEFAULT.q);
        setQuery({
            q: DEFAULT.q,
            status: DEFAULT.status,
            channel: DEFAULT.channel,
            sort: DEFAULT.sort,
            page: DEFAULT.page,
            pageSize: DEFAULT.pageSize,
        });
    };

    const onBulkShip = () => {
        const ids = Array.from(selectedIds);
        if (ids.length === 0 || isBulkLoading) return;

        bulk.mutate(
            { ids, status: 'shipped' as OrderStatus },
            {
                onSuccess: (json) => {
                    toast.success(`${json.updated ?? ids.length}건 출고 처리 완료`);
                    setSelectedIds(new Set());
                },
                onError: () => toast.error('처리에 실패했어요'),
            }
        );
    };

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Orders</h1>
                <p className="text-sm text-muted-foreground">URL과 상태를 동기화한 주문 리스트</p>
            </div>

            {/* Filters */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <div className="relative w-full max-w-sm">
                        <input
                            className="h-10 w-full rounded-md border bg-background px-3 pr-24 text-sm outline-none"
                            placeholder="주문번호 / 고객명"
                            value={qInput}
                            onChange={(e) => setQInput(e.target.value)}
                        />

                        {qInput !== state.q && (
                            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 text-xs text-muted-foreground">
                                <span className="inline-block h-3 w-3 animate-spin rounded-full border border-muted-foreground/30 border-t-muted-foreground/70" />
                                <span>검색 중…</span>
                            </div>
                        )}
                    </div>

                    <select
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        disabled={isBulkLoading}
                        value={state.status}
                        onChange={(e) => setQuery({ status: e.target.value })}
                    >
                        <option value="all">상태 전체</option>
                        <option value="paid">결제완료</option>
                        <option value="preparing">준비중</option>
                        <option value="shipped">출고</option>
                        <option value="cancelled">취소</option>
                        <option value="refunded">환불</option>
                    </select>

                    <select
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        disabled={isBulkLoading}
                        value={state.channel}
                        onChange={(e) => setQuery({ channel: e.target.value })}
                    >
                        <option value="all">채널 전체</option>
                        <option value="Online">Online</option>
                        <option value="POS">POS</option>
                    </select>

                    <select
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        disabled={isBulkLoading}
                        value={state.sort}
                        onChange={(e) => setQuery({ sort: e.target.value })}
                    >
                        <option value="time_desc">최신순</option>
                        <option value="amount_desc">금액 높은순</option>
                        <option value="amount_asc">금액 낮은순</option>
                    </select>

                    <select
                        className="h-10 rounded-md border bg-background px-2 text-sm"
                        disabled={isBulkLoading}
                        value={state.pageSize}
                        onChange={(e) => setQuery({ pageSize: Number(e.target.value) })}
                    >
                        {ORDERS_PAGE_SIZE_OPTIONS.map((n) => (
                            <option key={n} value={n}>
                                {n}개
                            </option>
                        ))}
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-10 rounded-md border bg-muted px-3 text-sm"
                        disabled={isBulkLoading}
                        onClick={onReset}
                    >
                        초기화
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading && (
                <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm text-muted-foreground">로딩 중...</p>
                    <div className="mt-3 h-24 rounded-md bg-muted/40" />
                </div>
            )}

            {isError && (
                <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">불러오기에 실패했어요</p>
                    <button className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm" onClick={() => refetch()}>
                        다시 시도
                    </button>
                </div>
            )}

            {data &&
                (data.items.length === 0 ? (
                    <div className="rounded-lg border bg-background p-10 text-center">
                        <p className="text-sm font-medium">검색 결과가 없어요</p>
                        <p className="mt-1 text-xs text-muted-foreground">검색어/필터를 바꿔보거나 초기화해보세요.</p>
                        <div className="mt-4 flex justify-center gap-2">
                            <button
                                className="h-10 rounded-md border bg-muted px-3 text-sm"
                                disabled={isBulkLoading}
                                onClick={onReset}
                            >
                                필터 초기화
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden rounded-lg border bg-background">
                        <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                            <label className="flex items-center gap-2 text-muted-foreground">
                                <input
                                    type="checkbox"
                                    checked={allSelectedOnPage}
                                    onChange={toggleAllOnPage}
                                    disabled={isBulkLoading}
                                    className="h-4 w-4"
                                />
                                <span className="text-sm">총 {data.meta.total}건</span>
                            </label>

                            <div className="flex items-center gap-2">
                                <button
                                    className="h-9 rounded-md border bg-muted px-3 text-sm"
                                    disabled={isBulkLoading || qInput !== state.q || state.page <= 1}
                                    onClick={() => setQuery({ page: state.page - 1 })}
                                >
                                    이전
                                </button>

                                <span className="text-xs text-muted-foreground">
                                    {data.meta.page} / {data.meta.totalPages}
                                </span>

                                <button
                                    className="h-9 rounded-md border bg-muted px-3 text-sm"
                                    disabled={isBulkLoading || qInput !== state.q || state.page >= data.meta.totalPages}
                                    onClick={() => setQuery({ page: state.page + 1 })}
                                >
                                    다음
                                </button>

                                {selectedIds.size > 0 && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        선택 {selectedIds.size}건
                                    </span>
                                )}

                                <button
                                    className="h-9 rounded-md border bg-muted px-3 text-sm disabled:opacity-60"
                                    disabled={selectedIds.size === 0 || isBulkLoading}
                                    onClick={onBulkShip}
                                >
                                    {isBulkLoading ? '처리 중...' : '선택 주문 출고 처리'}
                                </button>
                            </div>
                        </div>

                        <div className="divide-y">
                            {data.items.map((o: Order) => (
                                <div
                                    key={o.id}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => router.push(`/orders/${o.id}`)}
                                    onKeyDown={(e) => e.key === 'Enter' && router.push(`/orders/${o.id}`)}
                                    className="cursor-pointer px-4 py-3 text-sm hover:bg-muted/30"
                                >
                                    <div className="flex items-center justify-between gap-3">
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="checkbox"
                                                disabled={isBulkLoading}
                                                checked={selectedIds.has(o.id)}
                                                onChange={() => toggleOne(o.id)}
                                                onClick={(e) => e.stopPropagation()}
                                                className="h-4 w-4"
                                                aria-label={`select ${o.id}`}
                                            />
                                            <div className="font-medium">{o.id}</div>
                                        </div>

                                        <StatusBadge status={o.status} />
                                    </div>

                                    <div className="mt-1 flex items-center justify-between text-sm text-muted-foreground">
                                        <div>
                                            {o.time} · {o.customer} · {o.channel}
                                        </div>
                                        <div className="text-foreground tabular-nums">{formatKRW(o.amount)}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}
        </div>
    );
}
