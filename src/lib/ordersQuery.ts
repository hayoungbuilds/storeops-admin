import {
    ORDERS_PAGE_SIZE_OPTIONS,
    ORDERS_SORT_OPTIONS,
    ORDERS_QUERY_DEFAULT,
    type OrdersPageSize,
    type OrdersSort,
} from '@/shared/constants/orders';

export function normalizeOrdersPageSize(n: number, fallback: OrdersPageSize = ORDERS_QUERY_DEFAULT.pageSize) {
    return (ORDERS_PAGE_SIZE_OPTIONS as readonly number[]).includes(n) ? (n as OrdersPageSize) : fallback;
}

export function normalizeOrdersSort(value: string | null, fallback: OrdersSort = ORDERS_QUERY_DEFAULT.sort) {
    return value && (ORDERS_SORT_OPTIONS as readonly string[]).includes(value) ? (value as OrdersSort) : fallback;
}
