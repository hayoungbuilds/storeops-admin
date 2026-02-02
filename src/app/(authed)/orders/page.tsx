type Order = {
    id: string;
    time: string;
    customer: string;
    channel: 'Online' | 'POS';
    status: 'paid' | 'preparing' | 'shipped' | 'cancelled' | 'refunded';
    amount: number;
};

const orders: Order[] = [
    {
        id: 'ORD-20260202-0001',
        time: '2026-02-02 10:12',
        customer: 'Kim',
        channel: 'Online',
        status: 'paid',
        amount: 32000,
    },
    {
        id: 'ORD-20260202-0002',
        time: '2026-02-02 10:18',
        customer: 'Lee',
        channel: 'POS',
        status: 'preparing',
        amount: 58000,
    },
    {
        id: 'ORD-20260202-0003',
        time: '2026-02-02 10:25',
        customer: 'Park',
        channel: 'Online',
        status: 'shipped',
        amount: 41000,
    },
    {
        id: 'ORD-20260202-0004',
        time: '2026-02-02 10:31',
        customer: 'Choi',
        channel: 'POS',
        status: 'cancelled',
        amount: 12000,
    },
    {
        id: 'ORD-20260202-0005',
        time: '2026-02-02 10:44',
        customer: 'Jung',
        channel: 'Online',
        status: 'refunded',
        amount: 45000,
    },
];

function statusLabel(s: Order['status']) {
    return {
        paid: '결제완료',
        preparing: '준비중',
        shipped: '출고',
        cancelled: '취소',
        refunded: '환불',
    }[s];
}

export default function OrdersPage() {
    const total = orders.reduce((acc, o) => acc + o.amount, 0);
    const cancelled = orders.filter((o) => o.status === 'cancelled').length;
    const refunded = orders.filter((o) => o.status === 'refunded').length;

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Orders</h1>
                <p className="text-sm text-muted-foreground">주문을 검색하고 상태를 관리합니다.</p>
            </div>

            {/* Filter bar (더미) */}
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="flex flex-1 items-center gap-2">
                    <input
                        className="h-10 w-full max-w-sm rounded-md border bg-background px-3 text-sm outline-none"
                        placeholder="주문번호 / 고객명 검색"
                    />
                    <button className="h-10 rounded-md border bg-muted px-3 text-sm">필터</button>
                    <button className="h-10 rounded-md border bg-muted px-3 text-sm">초기화</button>
                </div>

                <div className="flex items-center gap-2">
                    <span className="rounded-md border bg-muted px-2 py-1 text-xs">Today</span>
                    <button className="h-10 rounded-md bg-primary px-3 text-sm text-primary-foreground">
                        + 새 주문(더미)
                    </button>
                </div>
            </div>

            {/* Mini summary */}
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <Summary label="주문" value={`${orders.length}건`} />
                <Summary label="총액" value={`₩ ${total.toLocaleString('ko-KR')}`} />
                <Summary label="취소" value={`${cancelled}건`} />
                <Summary label="환불" value={`${refunded}건`} />
            </div>

            {/* Table */}
            <div className="overflow-hidden rounded-lg border bg-background">
                <div className="grid grid-cols-12 bg-muted/40 px-4 py-3 text-xs text-muted-foreground">
                    <div className="col-span-4">주문번호</div>
                    <div className="col-span-3">시간</div>
                    <div className="col-span-2">고객</div>
                    <div className="col-span-1">채널</div>
                    <div className="col-span-1">상태</div>
                    <div className="col-span-1 text-right">금액</div>
                </div>

                {orders.map((o) => (
                    <div key={o.id} className="grid grid-cols-12 px-4 py-3 text-sm hover:bg-muted/30">
                        <div className="col-span-4 font-medium">{o.id}</div>
                        <div className="col-span-3 text-muted-foreground">{o.time}</div>
                        <div className="col-span-2">{o.customer}</div>
                        <div className="col-span-1">
                            <span className="rounded-md border bg-muted px-2 py-1 text-xs">{o.channel}</span>
                        </div>
                        <div className="col-span-1">
                            <span
                                className={[
                                    'rounded-md border px-2 py-1 text-xs',
                                    o.status === 'cancelled' || o.status === 'refunded'
                                        ? 'border-destructive/30 bg-destructive/10 text-destructive'
                                        : 'bg-muted',
                                ].join(' ')}
                            >
                                {statusLabel(o.status)}
                            </span>
                        </div>
                        <div className="col-span-1 text-right">{o.amount.toLocaleString('ko-KR')}</div>
                    </div>
                ))}

                <div className="flex items-center justify-between border-t px-4 py-3 text-sm text-muted-foreground">
                    <span>총 {orders.length}건</span>
                    <div className="flex items-center gap-2">
                        <button className="h-9 rounded-md border bg-muted px-3 text-sm">이전</button>
                        <button className="h-9 rounded-md border bg-muted px-3 text-sm">다음</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function Summary({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-lg border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
    );
}
