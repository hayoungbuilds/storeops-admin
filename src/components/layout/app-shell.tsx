import Sidebar from '@/components/layout/sidebar';
import Topbar from '@/components/layout/topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        // ✅ 이 레이어가 가로 스크롤을 책임짐
        <div className="min-h-screen bg-background overflow-x-auto">
            {/* ✅ 이 컨테이너가 최소 폭을 강제 */}
            <div className="mx-auto min-w-[1100px] max-w-6xl px-6">
                <div className="flex">
                    {/* Sidebar: 고정 폭 */}
                    <aside className="w-[260px] shrink-0 border-r py-6 pr-4">
                        <Sidebar />
                    </aside>

                    {/* Main */}
                    <div className="min-w-0 flex-1">
                        <Topbar />
                        <main className="py-6 pl-6">{children}</main>
                    </div>
                </div>
            </div>
        </div>
    );
}
