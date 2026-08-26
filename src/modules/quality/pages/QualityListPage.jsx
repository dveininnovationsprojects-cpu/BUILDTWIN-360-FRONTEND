import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { qualityApi } from '../api/qualityApi';
// Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084).
export function QualityListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['quality'], queryFn: () => qualityApi.list() });
    const columns = [
        { key: 'category', header: 'Category' },
        { key: 'severity', header: 'Severity', render: (row) => _jsx(StatusPill, { status: row.severity }) },
        { key: 'responsible', header: 'Responsible' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Quality & NCR" }), _jsx("p", { className: "page-subheading", children: "Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
