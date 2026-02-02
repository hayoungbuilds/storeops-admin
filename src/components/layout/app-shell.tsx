import Sidebar from './sidebar';
import Topbar from './topbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
    return (
        <div className="min-h-screen bg-background">
            <div className="mx-auto flex max-w-6xl">
                <Sidebar />
                <main className="flex-1">
                    <Topbar />
                    <div className="px-6 py-6 space-y-6">{children}</div>
                </main>
            </div>
        </div>
    );
}
