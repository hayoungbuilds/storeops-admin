import type { OrdersQuery } from './useOrdersQueryState';

export const ordersKeys = {
    all: ['orders'] as const,

    lists: () => [...ordersKeys.all, 'list'] as const,
    list: (qs: OrdersQuery) => [...ordersKeys.lists(), qs] as const,

    details: () => [...ordersKeys.all, 'detail'] as const,
    detail: (id: string) => [...ordersKeys.details(), id] as const,
};
