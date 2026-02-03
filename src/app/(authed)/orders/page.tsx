'use client';

import { useEffect, useState } from 'react';
import { useOrdersQueryState } from '@/features/orders/useOrdersQueryState';
import { useOrders } from '@/features/orders/useOrders';
import { useDebouncedValue } from '@/shared/hooks/useDebouncedValue';
import { ORDERS_QUERY_DEFAULT as DEFAULT } from '@/shared/constants/orders';

export default function OrdersPage() {
    const { state, setQuery } = useOrdersQueryState();

    // input은 로컬에서 즉시 움직이게
    const [qInput, setQInput] = useState(state.q);
    const qDebounced = useDebouncedValue(qInput, 350);

    // URL이 외부에서 바뀌는 경우(뒤로가기/링크 진입) input도 동기화
    useEffect(() => {
        setQInput(state.q);
    }, [state.q]);

    // 디바운스 값이 바뀌면 URL에 반영
    useEffect(() => {
        if (qDebounced !== state.q) {
            setQuery({ q: qDebounced });
        }
    }, [qDebounced]);

    const { data, isLoading, isError, refetch } = useOrders(state);

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
                        value={state.channel}
                        onChange={(e) => setQuery({ channel: e.target.value })}
                    >
                        <option value="all">채널 전체</option>
                        <option value="Online">Online</option>
                        <option value="POS">POS</option>
                    </select>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-10 rounded-md border bg-muted px-3 text-sm"
                        onClick={() => {
                            setQInput(DEFAULT.q);
                            setQuery({
                                q: DEFAULT.q,
                                status: DEFAULT.status,
                                channel: DEFAULT.channel,
                                page: DEFAULT.page,
                                pageSize: DEFAULT.pageSize,
                            });
                        }}
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

            {data && (
                <div className="overflow-hidden rounded-lg border bg-background">
                    <div className="flex items-center justify-between border-b px-4 py-3 text-sm">
                        <span className="text-muted-foreground">총 {data.meta.total}건</span>
                        <div className="flex items-center gap-2">
                            <button
                                className="h-9 rounded-md border bg-muted px-3 text-sm"
                                disabled={qInput !== state.q || state.page <= 1}
                                onClick={() => setQuery({ page: state.page - 1 })}
                            >
                                이전
                            </button>
                            <span className="text-xs text-muted-foreground">
                                {data.meta.page} / {data.meta.totalPages}
                            </span>
                            <button
                                className="h-9 rounded-md border bg-muted px-3 text-sm"
                                disabled={qInput !== state.q || state.page >= data.meta.totalPages}
                                onClick={() => setQuery({ page: state.page + 1 })}
                            >
                                다음
                            </button>
                        </div>
                    </div>

                    <div className="divide-y">
                        {data.items.map((o: any) => (
                            <div key={o.id} className="px-4 py-3 text-sm hover:bg-muted/30">
                                <div className="flex items-center justify-between">
                                    <div className="font-medium">{o.id}</div>
                                    <div className="text-muted-foreground">{o.time}</div>
                                </div>
                                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {o.customer} · {o.channel} · {o.status}
                                    </span>
                                    <span>₩ {Number(o.amount).toLocaleString('ko-KR')}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
