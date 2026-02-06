export const ORDERS_QUERY_DEFAULT = {
    q: '',
    status: 'all',
    channel: 'all',
    page: 1,
    pageSize: 10,
    sort: 'time_desc',
} as const;

export const ORDER_STATUSES = ['paid', 'preparing', 'shipped', 'cancelled', 'refunded'] as const;
export const ORDER_CHANNELS = ['Online', 'POS'] as const;
export const ORDER_CUSTOMERS = ['Kim', 'Lee', 'Park', 'Choi', 'Jung', 'Han', 'Yoon'] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type OrderChannel = (typeof ORDER_CHANNELS)[number];

export const ORDERS_PAGE_SIZE_OPTIONS = [10, 20, 50] as const;
export type OrdersPageSize = (typeof ORDERS_PAGE_SIZE_OPTIONS)[number];

export const ORDERS_SORT_OPTIONS = ['time_desc', 'amount_desc', 'amount_asc'] as const;
export type OrdersSort = (typeof ORDERS_SORT_OPTIONS)[number];


export type Order = {
    id: string;
    time: string;
    customer: string;
    channel: OrderChannel;
    status: OrderStatus;
    amount: number;
  };
  
  export type OrdersListResponse = {
    items: Order[];
    meta: { total: number; page: number; pageSize: number; totalPages: number };
  };
  
  export type OrderDetailResponse = { item: Order | null };
  