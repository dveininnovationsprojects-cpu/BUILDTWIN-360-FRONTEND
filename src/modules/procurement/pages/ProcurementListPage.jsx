import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { procurementApi } from '../api/procurementApi';
// Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).
export function ProcurementListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['procurement'], queryFn: () => procurementApi.list() });
    const columns = [
        { key: 'poNumber', header: 'PO Number' },
        { key: 'supplier', header: 'Supplier' },
        { key: 'deliveryDate', header: 'Delivery Date' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Procurement & Suppliers" }), _jsx("p", { className: "page-subheading", children: "Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
