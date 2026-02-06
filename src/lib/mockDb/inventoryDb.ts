export type StockStatus = 'ok' | 'low' | 'oos';

export type InventoryItem = {
    sku: string;
    name: string;
    stock: number;
    safetyStock: number;
    status: StockStatus;
    updatedAt: string;
};

const NAMES = ['아메리카노', '라떼', '바닐라라떼', '샌드위치', '쿠키', '케이크', '스콘', '콜드브루'] as const;

function pad(n: number, w = 4) {
    return String(n).padStart(w, '0');
}

export function statusOf(stock: number, safetyStock: number): StockStatus {
    if (stock <= 0) return 'oos';
    if (stock <= safetyStock) return 'low';
    return 'ok';
}

export const inventoryDb: InventoryItem[] = Array.from({ length: 48 }, (_, i) => {
    const idx = i + 1;
    const safety = 5 + (idx % 4) * 5;
    const stock = (idx * 7) % 38;

    return {
        sku: `SKU-${pad(idx)}`,
        name: `${NAMES[idx % NAMES.length]} ${idx}`,
        stock,
        safetyStock: safety,
        status: statusOf(stock, safety),
        updatedAt: `2026-02-06 1${idx % 10}:${pad((idx * 3) % 60, 2)}`,
    };
});
