import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { wbsScheduleApi } from '../api/wbsScheduleApi';
// WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).
export function WbsScheduleListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['wbs-schedule'], queryFn: () => wbsScheduleApi.list() });
    const columns = [
        { key: 'wbsCode', header: 'WBS Code' },
        { key: 'name', header: 'Activity' },
        { key: 'discipline', header: 'Discipline' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "WBS & Schedule" }), _jsx("p", { className: "page-subheading", children: "WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
