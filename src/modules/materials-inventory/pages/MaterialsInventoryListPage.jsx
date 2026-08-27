import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { materialsInventoryApi } from '../api/materialsInventoryApi';
// Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057).
export function MaterialsInventoryListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['materials-inventory'], queryFn: () => materialsInventoryApi.list() });
    const columns = [
        { key: 'code', header: 'Code' },
        { key: 'name', header: 'Material' },
        { key: 'currentStock', header: 'Current Stock' },
        { key: 'reorderLevel', header: 'Reorder Level' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Materials & Inventory" }), _jsx("p", { className: "page-subheading", children: "Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
