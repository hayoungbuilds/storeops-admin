'use client';

import { useParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { formatKRW } from '@/lib/format';
import { StatusBadge } from '@/features/orders/components/StatusBadge';
import { useOrder } from '@/features/orders/useOrder';
import { useUpdateOrderStatus } from '@/features/orders/useUpdateOrderStatus';
import { OrderStatus } from '@/shared/constants/orders';
import { useRole } from '@/shared/providers/RoleProvider';

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const id = decodeURIComponent(params.id);

    const { data: order, isLoading, isError, refetch } = useOrder(id);
    const update = useUpdateOrderStatus();

    const { role } = useRole();
    const canWrite = role === 'admin';

    const onChangeStatus = (status: OrderStatus) => {
        update.mutate(
            { id, status },
            {
                onSuccess: () => toast.success(`상태를 '${status}'로 변경했어요`),
                onError: () => toast.error('변경 실패. 다시 시도해주세요.'),
            }
        );
    };

    if (isLoading) {
        return (
            <div className="space-y-4">
                <div className="h-8 w-40 rounded bg-muted/40" />
                <div className="h-32 rounded-lg border bg-background p-4" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">주문을 불러오지 못했어요</p>
                <button className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm" onClick={() => refetch()}>
                    다시 시도
                </button>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="rounded-lg border bg-background p-4">
                <p className="text-sm font-medium">주문을 찾을 수 없어요</p>
                <button
                    className="mt-3 h-9 rounded-md border bg-muted px-3 text-sm"
                    onClick={() => router.push('/orders')}
                >
                    목록으로
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                    <h1 className="text-xl font-semibold">{order.id}</h1>
                    <p className="text-sm text-muted-foreground">
                        {order.time} · {order.customer} · {order.channel}
                    </p>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        className="h-10 rounded-md border bg-muted px-3 text-sm"
                        onClick={() => router.push('/orders')}
                    >
                        목록
                    </button>
                </div>
            </div>

            {/* Summary card */}
            <div className="rounded-lg border bg-background p-4">
                <div className="flex items-center justify-between">
                    <div className="text-sm font-medium">주문 요약</div>
                    <StatusBadge status={order.status} />
                </div>

                <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
                    <div className="text-muted-foreground">금액</div>
                    <div className="text-right tabular-nums">{formatKRW(order.amount)}</div>

                    <div className="text-muted-foreground">채널</div>
                    <div className="text-right">{order.channel}</div>

                    <div className="text-muted-foreground">고객</div>
                    <div className="text-right">{order.customer}</div>
                </div>
            </div>

            {/* Actions */}
            {canWrite && (
                <div className="rounded-lg border bg-background p-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="text-sm font-medium">액션</div>
                            <p className="mt-1 text-xs text-muted-foreground">상태 변경은 API(PATCH)로 처리합니다.</p>
                        </div>

                        {update.isPending && <span className="text-xs text-muted-foreground">처리 중...</span>}
                    </div>

                    <div className="mt-3 flex flex-wrap gap-2">
                        <button
                            className="h-10 rounded-md border bg-background px-3 text-sm hover:bg-muted/40 disabled:opacity-60"
                            disabled={update.isPending}
                            onClick={() => onChangeStatus('preparing')}
                        >
                            준비중 처리
                        </button>

                        <button
                            className="h-10 rounded-md border bg-background px-3 text-sm hover:bg-muted/40 disabled:opacity-60"
                            disabled={update.isPending}
                            onClick={() => onChangeStatus('shipped')}
                        >
                            출고 처리
                        </button>

                        <button
                            className="h-10 rounded-md border bg-background px-3 text-sm hover:bg-muted/40 disabled:opacity-60"
                            disabled={update.isPending}
                            onClick={() => toast.message('취소/환불 플로우는 구현 중입니다.')}
                        >
                            취소/환불
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
