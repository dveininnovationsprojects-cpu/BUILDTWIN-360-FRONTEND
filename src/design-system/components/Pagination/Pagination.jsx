import { jsxs as _jsxs, jsx as _jsx } from "react/jsx-runtime";
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/design-system/components/Button/Button';
export function Pagination({ page, totalPages, onPageChange }) {
    return (_jsxs("div", { className: "flex items-center justify-between text-sm text-ink-500", children: [_jsxs("span", { children: ["Page ", page, " of ", Math.max(totalPages, 1)] }), _jsxs("div", { className: "flex gap-1", children: [_jsx(Button, { variant: "outline", size: "sm", disabled: page <= 1, onClick: () => onPageChange(page - 1), children: _jsx(ChevronLeft, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", disabled: page >= totalPages, onClick: () => onPageChange(page + 1), children: _jsx(ChevronRight, { className: "h-4 w-4" }) })] })] }));
}
