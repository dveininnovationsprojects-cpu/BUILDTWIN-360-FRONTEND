import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button } from '@/design-system';
import { equipmentApi } from '../api/equipmentApi';
// Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).
export function EquipmentListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['equipment'], queryFn: () => equipmentApi.list() });
    const columns = [
        { key: 'assetCode', header: 'Asset Code' },
        { key: 'type', header: 'Type' },
        { key: 'site', header: 'Allocated Site' },
        { key: 'status', header: 'Status', render: (row) => _jsx(StatusPill, { status: row.status }) },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Equipment" }), _jsx("p", { className: "page-subheading", children: "Equipment/asset register, site allocation, downtime and usage hours (FR-100..102)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
