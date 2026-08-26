import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill } from '@/design-system';
import { identityApi } from '../api/identityApi';
// System-admin screen backing FR-002 (create/activate/deactivate/reset accounts).
export function UsersPage() {
    const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: identityApi.listUsers });
    const columns = [
        { key: 'name', header: 'Name' },
        { key: 'email', header: 'Email' },
        { key: 'roles', header: 'Roles', render: (u) => u.roles.join(', ') },
        { key: 'status', header: 'Status', render: (u) => _jsx(StatusPill, { status: u.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Users & Access" }), _jsx("p", { className: "page-subheading", children: "Manage accounts, roles and project-level permissions." })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (u) => u.id, isLoading: isLoading })] }));
}
