import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { progressDprApi } from '../api/progressDprApi';
// Daily Progress Report: draft/submit/approve, quantities, photos, remarks (FR-030..035).
export function ProgressDprListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['progress-dpr'], queryFn: () => progressDprApi.list() });
    const columns = [
        { key: 'reportDate', header: 'Date' },
        { key: 'siteName', header: 'Site' },
        { key: 'submittedBy', header: 'Submitted By' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Daily Progress (DPR)" }), _jsx("p", { className: "page-subheading", children: "Daily Progress Report: draft/submit/approve, quantities, photos, remarks (FR-030..035)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
