import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { notificationsApi } from '../api/notificationsApi';
// In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).
export function NotificationsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.list() });
    const columns = [
        { key: 'message', header: 'Message' },
        { key: 'severity', header: 'Severity', render: (row) => _jsx(StatusPill, { status: row.severity }) },
        { key: 'createdAt', header: 'Raised' },
        { key: 'readStatus', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.readStatus }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Notifications" }), _jsx("p", { className: "page-subheading", children: "In-app alerts for overdue activities, low stock, pending approvals (FR-120..123)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
