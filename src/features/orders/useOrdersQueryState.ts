'use client';

import { useCallback, useMemo } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { ORDERS_QUERY_DEFAULT as DEFAULT } from '@/shared/constants/orders';

export type OrdersQuery = {
    q: string;
    status: string;
    channel: string;
    page: number;
    pageSize: number;
};

// 숫자 파싱 안전장치
function toInt(value: string | null, fallback: number) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}

// URLSearchParams -> state
function parseQuery(sp: URLSearchParams): OrdersQuery {
    return {
        q: sp.get('q') ?? DEFAULT.q,
        status: sp.get('status') ?? DEFAULT.status,
        channel: sp.get('channel') ?? DEFAULT.channel,
        page: Math.max(1, toInt(sp.get('page'), DEFAULT.page)),
        pageSize: clamp(toInt(sp.get('pageSize'), DEFAULT.pageSize), DEFAULT.pageSize, 50),
    };
}

// state -> URLSearchParams (기본값은 제거)
function serializeQuery(next: URLSearchParams, q: OrdersQuery) {
    const setOrDelete = (key: string, value: string, def: string) => {
        if (!value || value === def) next.delete(key);
        else next.set(key, value);
    };

    const setNumOrDelete = (key: string, value: number, def: number) => {
        if (!value || value === def) next.delete(key);
        else next.set(key, String(value));
    };

    setOrDelete('q', q.q.trim(), DEFAULT.q);
    setOrDelete('status', q.status, DEFAULT.status);
    setOrDelete('channel', q.channel, DEFAULT.channel);
    setNumOrDelete('page', Math.max(1, q.page), DEFAULT.page);
    setNumOrDelete('pageSize', q.pageSize, DEFAULT.pageSize);
}

export function useOrdersQueryState() {
    const router = useRouter();
    const pathname = usePathname();
    const sp = useSearchParams();

    // state는 sp가 바뀔 때만 계산
    const state = useMemo(() => parseQuery(new URLSearchParams(sp.toString())), [sp]);

    // setQuery가 "항상 최신 sp" 기준으로 동작하도록 콜백 내부에서 다시 파싱
    const setQuery = useCallback(
        (patch: Partial<OrdersQuery>) => {
            // 항상 주소창(최신 URL) 기준
            const current = new URLSearchParams(window.location.search);
            const currentState = parseQuery(current);

            const merged: OrdersQuery = { ...currentState, ...patch };

            if ('q' in patch || 'status' in patch || 'channel' in patch || 'pageSize' in patch) {
                merged.page = 1;
            }

            const next = new URLSearchParams(current.toString());
            serializeQuery(next, merged);

            const qs = next.toString();
            router.replace(qs ? `${pathname}?${qs}` : pathname);
        },
        [router, pathname]
    );

    return { state, setQuery };
}
