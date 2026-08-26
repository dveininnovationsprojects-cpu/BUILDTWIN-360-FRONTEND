import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { reportsApi } from '../api/reportsApi';
// Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).
export function ReportsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['reports'], queryFn: () => reportsApi.list() });
    const columns = [
        { key: 'name', header: 'Report' },
        { key: 'period', header: 'Period' },
        { key: 'generatedAt', header: 'Generated' },
        { key: 'format', header: 'Format' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Reports" }), _jsx("p", { className: "page-subheading", children: "Executive/project/site dashboards and scheduled/exportable reports (FR-130..135)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
