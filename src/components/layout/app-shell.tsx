import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="h-screen bg-background overflow-x-auto">
            {/* 가로: 최소폭 유지 + 좌우 여백 */}
            <div className="mx-auto h-full w-full min-w-[1100px] max-w-6xl px-6">
                {/* 좌/우 레이아웃이 화면 높이를 꽉 채움 */}
                <div className="flex h-full">
                    {/* Sidebar: 화면 높이 고정 + 스크롤 필요시 sidebar 내부에서 */}
                    <aside className="w-[260px] shrink-0 border-r py-6 pr-4 overflow-y-auto">
                        <Sidebar />
                    </aside>

                    {/* Main: 세로 flex로 Topbar + 콘텐츠 */}
                    <div className="min-w-0 flex-1 flex flex-col">
                        <Topbar />

                        {/* 컨텐츠가 길어지면 여기만 스크롤 */}
                        <main className="flex-1 overflow-y-auto py-6 pl-6">{children}</main>
                    </div>
                </div>
            </div>
        </div>
    );
}
