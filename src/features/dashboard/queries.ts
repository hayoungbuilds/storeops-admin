export const dashboardKeys = {
    all: ['dashboard'] as const,
    byRange: (range: 'today' | '7d') => ['dashboard', range] as const,
};
