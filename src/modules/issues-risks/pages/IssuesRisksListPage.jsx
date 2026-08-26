import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { issuesRisksApi } from '../api/issuesRisksApi';
// Issue/blocker tracking, escalation and project risk register (FR-090..093).
export function IssuesRisksListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['issues-risks'], queryFn: () => issuesRisksApi.list() });
    const columns = [
        { key: 'title', header: 'Issue' },
        { key: 'priority', header: 'Priority', render: (row) => _jsx(StatusPill, { status: row.priority }) },
        { key: 'owner', header: 'Owner' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Issues & Risks" }), _jsx("p", { className: "page-subheading", children: "Issue/blocker tracking, escalation and project risk register (FR-090..093)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
