export function toInt(value: string | null, fallback: number) {
    const n = Number(value);
    return Number.isFinite(n) ? n : fallback;
}

export function clamp(n: number, min: number, max: number) {
    return Math.min(max, Math.max(min, n));
}
