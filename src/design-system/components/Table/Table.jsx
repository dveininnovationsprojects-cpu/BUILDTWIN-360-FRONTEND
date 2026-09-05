import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '@/design-system/utils/cn';
/** Generic data table shared by every list screen (projects, activities, DPRs, materials, POs...). */
export function Table({ columns, data, rowKey, isLoading, emptyMessage = 'No records found.', onRowClick, }) {
    return (_jsx("div", { className: "surface-panel overflow-x-auto", children: _jsxs("table", { className: "w-full text-left text-sm", children: [_jsx("thead", { className: "border-b border-surface-border bg-surface-subtle", children: _jsx("tr", { children: columns.map((col) => (_jsx("th", { className: "px-4 py-2.5 font-medium text-ink-500", children: col.header }, col.key))) }) }), _jsxs("tbody", { children: [isLoading && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-4 py-8 text-center text-ink-500", children: "Loading..." }) })), !isLoading && data.length === 0 && (_jsx("tr", { children: _jsx("td", { colSpan: columns.length, className: "px-4 py-8 text-center text-ink-500", children: emptyMessage }) })), !isLoading &&
                            data.map((row) => (_jsx("tr", { onClick: () => onRowClick?.(row), className: cn('border-b border-surface-border last:border-0', onRowClick && 'cursor-pointer hover:bg-surface-subtle'), children: columns.map((col) => {
                                    const value = row[col.key];
                                    return (_jsx("td", { className: cn('px-4 py-2.5 text-ink-900', col.className), children: col.render ? col.render(row) : String(value != null && value !== '' ? value : 'N/A') }, col.key));
                                }) }, rowKey(row))))] })] }) }));
}
