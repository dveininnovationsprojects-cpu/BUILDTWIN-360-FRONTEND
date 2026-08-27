import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { projectsApi } from '../api/projectsApi';
// Project & site master — code, type, client, buildings/floors/zones (FR-010..014).
export function ProjectsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.list() });
    const columns = [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Name' },
        { key: 'type', header: 'Type' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Projects" }), _jsx("p", { className: "page-subheading", children: "Project & site master \u2014 code, type, client, buildings/floors/zones (FR-010..014)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
