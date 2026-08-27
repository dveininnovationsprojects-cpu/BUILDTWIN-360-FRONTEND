import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { costControlApi } from '../api/costControlApi';
// Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).
export function CostControlListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['cost-control'], queryFn: () => costControlApi.list() });
    const columns = [
        { key: 'costCode', header: 'Cost Code' },
        { key: 'baselineAmount', header: 'Baseline' },
        { key: 'actualAmount', header: 'Actual' },
        { key: 'variance', header: 'Variance' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Cost & Budget" }), _jsx("p", { className: "page-subheading", children: "Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
