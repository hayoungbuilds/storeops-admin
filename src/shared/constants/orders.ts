export const ORDERS_QUERY_DEFAULT = {
    q: '',
    status: 'all',
    channel: 'all',
    page: 1,
    pageSize: 10,
} as const;

export const ORDER_STATUSES = ['paid', 'preparing', 'shipped', 'cancelled', 'refunded'] as const;
export const ORDER_CHANNELS = ['Online', 'POS'] as const;
export const ORDER_CUSTOMERS = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Han', 'Yoon'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderChannel = (typeof ORDER_CHANNELS)[number];
