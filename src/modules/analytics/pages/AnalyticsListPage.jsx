import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { analyticsApi } from '../api/analyticsApi';
// Delay-risk, forecast completion and project health index (section 11).
export function AnalyticsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: () => analyticsApi.list() });
    const columns = [
        { key: 'project', header: 'Project' },
        { key: 'healthIndex', header: 'Health Index' },
        { key: 'delayRisk', header: 'Delay Risk' },
        { key: 'forecastCompletion', header: 'Forecast Completion' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Construction Intelligence" }), _jsx("p", { className: "page-subheading", children: "Delay-risk, forecast completion and project health index (section 11)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
