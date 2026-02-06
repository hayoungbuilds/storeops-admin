'use client';

import { useRole } from '@/shared/providers/RoleProvider';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useSettings } from '@/features/settings/useSettings';
import { useUpdateStoreName } from '@/features/settings/useUpdateStoreName';

function Section({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
    return (
        <div className="rounded-lg border bg-background p-4">
            <div className="space-y-1">
                <div className="text-sm font-medium">{title}</div>
                <div className="text-xs text-muted-foreground">{desc}</div>
            </div>
            <div className="mt-4">{children}</div>
        </div>
    );
}

export default function SettingsPage() {
    const { role, setRole } = useRole();
    const canWrite = role === 'admin';

    const { data } = useSettings();
    const [name, setName] = useState('');
    const update = useUpdateStoreName();

    useEffect(() => {
        if (data?.storeName) setName(data.storeName);
    }, [data?.storeName]);

    const [notifySlack, setNotifySlack] = useState(true);

    const block = () => toast.error('Viewer 권한에서는 변경할 수 없어요');

    return (
        <div className="space-y-6">
            <div className="space-y-1">
                <h1 className="text-xl font-semibold">Settings</h1>
                <p className="text-sm text-muted-foreground">권한에 따라 편집 가능 여부가 달라집니다.</p>
            </div>

            {/* 권한 탭 */}
            <div className="rounded-lg border bg-background p-4">
                <div className="text-sm font-medium">권한</div>
                <p className="mt-1 text-xs text-muted-foreground">
                    데모용 권한 토글입니다. (실서비스는 서버 세션/토큰 기반)
                </p>

                <div className="mt-3 flex items-center gap-2">
                    <button
                        className={`h-9 rounded-full px-4 text-sm border ${
                            role === 'viewer' ? 'bg-muted' : 'bg-background'
                        }`}
                        onClick={() => setRole('viewer')}
                        type="button"
                    >
                        Viewer
                    </button>
                    <button
                        className={`h-9 rounded-full px-4 text-sm border ${
                            role === 'admin' ? 'bg-muted' : 'bg-background'
                        }`}
                        onClick={() => setRole('admin')}
                        type="button"
                    >
                        Admin
                    </button>

                    <span className="ml-2 text-xs text-muted-foreground">
                        현재: <span className="font-medium text-foreground">{role}</span>
                    </span>
                </div>
            </div>

            <div className="grid gap-3 lg:grid-cols-2">
                <Section title="매장 정보" desc="매장명/기본 정보(데모)">
                    <div className="space-y-2">
                        <label className="text-xs text-muted-foreground">매장명</label>
                        <input
                            className="h-10 w-full max-w-md rounded-md border bg-background px-3 text-sm outline-none"
                            value={name}
                            disabled={!canWrite}
                            onChange={(e) => setName(e.target.value)}
                        />
                        <div className="flex justify-end">
                            <button
                                className="h-10 rounded-md border bg-muted px-3 text-sm disabled:opacity-60"
                                disabled={update.isPending || !name.trim() || !canWrite}
                                onClick={() =>
                                    update.mutate(name.trim(), {
                                        onSuccess: () => toast.success('매장 이름이 변경됐어요'),
                                        onError: () => toast.error('변경 실패'),
                                    })
                                }
                            >
                                {update.isPending ? '저장 중...' : '저장'}
                            </button>
                        </div>
                    </div>
                </Section>

                <Section title="알림" desc="주문 이벤트 알림(데모)">
                    <label className="flex items-center gap-2 text-sm">
                        <input
                            type="checkbox"
                            checked={notifySlack}
                            onChange={(e) => {
                                if (!canWrite) return block();
                                setNotifySlack(e.target.checked);
                            }}
                            disabled={!canWrite}
                            className="h-4 w-4 disabled:opacity-60"
                        />
                        Slack 알림 사용
                    </label>

                    <p className="mt-2 text-xs text-muted-foreground">Viewer에서는 토글이 비활성화됩니다.</p>
                </Section>
            </div>

            {!canWrite && (
                <div className="rounded-lg border bg-background p-4">
                    <p className="text-sm font-medium">읽기 전용 모드</p>
                    <p className="mt-1 text-xs text-muted-foreground">Admin으로 전환하면 설정을 변경할 수 있어요.</p>
                </div>
            )}
        </div>
    );
}
