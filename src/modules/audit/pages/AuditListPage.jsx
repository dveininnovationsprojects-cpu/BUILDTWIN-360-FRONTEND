import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { auditApi } from '../api/auditApi';
// Read-only history of create/update/approve actions (FR-005).
export function AuditListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['audit'], queryFn: () => auditApi.list() });
    const columns = [
        { key: 'user', header: 'User' },
        { key: 'action', header: 'Action' },
        { key: 'entityType', header: 'Entity' },
        { key: 'timestamp', header: 'Timestamp' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Audit Log" }), _jsx("p", { className: "page-subheading", children: "Read-only history of create/update/approve actions (FR-005)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
