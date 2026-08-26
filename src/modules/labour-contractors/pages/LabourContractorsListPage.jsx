import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { labourContractorsApi } from '../api/labourContractorsApi';
// Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).
export function LabourContractorsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['labour-contractors'], queryFn: () => labourContractorsApi.list() });
    const columns = [
        { key: 'date', header: 'Date' },
        { key: 'contractor', header: 'Contractor' },
        { key: 'trade', header: 'Trade' },
        { key: 'headcount', header: 'Headcount' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Labour & Contractors" }), _jsx("p", { className: "page-subheading", children: "Contractor master, daily headcount/allocation and productivity analytics (FR-040..045)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
