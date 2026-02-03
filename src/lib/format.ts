export function formatKRW(value: number) {
    return `₩ ${Number(value).toLocaleString('ko-KR')}`;
}
