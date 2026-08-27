import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useQuery } from '@tanstack/react-query';
import { Table, Button } from '@/design-system';
import { documentsApi } from '../api/documentsApi';
// Document/photo repository by project/category/version with search (FR-110..114).
export function DocumentsListPage() {
    const { data, isLoading } = useQuery({ queryKey: ['documents'], queryFn: () => documentsApi.list() });
    const columns = [
        { key: 'name', header: 'Document' },
        { key: 'category', header: 'Category' },
        { key: 'uploadedBy', header: 'Uploaded By' },
        { key: 'version', header: 'Version' },
    ];
    return (_jsxs("div", { className: "flex flex-col gap-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("h1", { className: "page-heading", children: "Documents" }), _jsx("p", { className: "page-subheading", children: "Document/photo repository by project/category/version with search (FR-110..114)." })] }), _jsx(Button, { size: "sm", children: "Add New" })] }), _jsx(Table, { columns: columns, data: data ?? [], rowKey: (row) => row.id, isLoading: isLoading })] }));
}
