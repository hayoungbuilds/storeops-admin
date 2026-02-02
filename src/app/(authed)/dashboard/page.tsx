export default function DashboardPage() {
    const cards = [
        { label: '오늘 매출', value: '₩ —', sub: '데이터 연동 예정' },
        { label: '오늘 주문', value: '—', sub: '데이터 연동 예정' },
        { label: '환불', value: '₩ —', sub: '데이터 연동 예정' },
    ];

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Dashboard</h1>
                <p className="text-sm text-muted-foreground">주문·정산·재고 현황을 한눈에 확인합니다.</p>
            </div>

            <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {cards.map((c) => (
                    <div key={c.label} className="rounded-lg border bg-background px-4 py-4">
                        <p className="text-xs text-muted-foreground">{c.label}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-tight">{c.value}</p>
                        <p className="mt-1 text-xs text-muted-foreground">{c.sub}</p>
                    </div>
                ))}
            </section>

            <section className="grid grid-cols-1 gap-6 md:grid-cols-5">
                <div className="md:col-span-3 space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">매출 추이</h2>
                        <span className="text-xs text-muted-foreground">최근 7일</span>
                    </div>
                    <div className="h-[260px] rounded-lg border bg-background p-4">
                        <div className="flex h-full items-center justify-center rounded-md bg-muted/40">
                            <p className="text-xs text-muted-foreground">Chart Placeholder</p>
                        </div>
                    </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                    <div className="flex items-center justify-between">
                        <h2 className="text-sm font-semibold">결제수단 비율</h2>
                        <span className="text-xs text-muted-foreground">최근 7일</span>
                    </div>
                    <div className="h-[260px] rounded-lg border bg-background p-4">
                        <div className="flex h-full items-center justify-center rounded-md bg-muted/40">
                            <p className="text-xs text-muted-foreground">Chart Placeholder</p>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
