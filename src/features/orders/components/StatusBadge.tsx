type Props = {
    status: 'paid' | 'preparing' | 'shipped' | 'cancelled' | 'refunded' | string;
};

const LABEL: Record<string, string> = {
    paid: '결제완료',
    preparing: '준비중',
    shipped: '출고',
    cancelled: '취소',
    refunded: '환불',
};

export function StatusBadge({ status }: Props) {
    const text = LABEL[status] ?? status;

    return (
        <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs text-foreground">{text}</span>
    );
}
