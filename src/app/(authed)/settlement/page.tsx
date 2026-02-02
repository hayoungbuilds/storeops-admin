export default function SettlementPage() {
    return <Placeholder title="Settlement" desc="정산 현황과 지급 내역을 관리합니다." />;
}

function Placeholder({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">{title}</h1>
                <p className="text-sm text-muted-foreground">{desc}</p>
            </div>

            <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">준비 중</p>

                <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                    <div className="h-24 rounded-md bg-muted/40" />
                    <div className="h-24 rounded-md bg-muted/40" />
                </div>
            </div>
        </div>
    );
}
