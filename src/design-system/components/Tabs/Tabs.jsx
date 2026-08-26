import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState } from 'react';
import { cn } from '@/design-system/utils/cn';
export function Tabs({ items, defaultKey }) {
    const [active, setActive] = useState(defaultKey ?? items[0]?.key);
    const activeItem = items.find((i) => i.key === active);
    return (_jsxs("div", { children: [_jsx("div", { className: "flex gap-1 border-b border-surface-border", children: items.map((item) => (_jsx("button", { onClick: () => setActive(item.key), className: cn('px-4 py-2.5 text-sm font-medium border-b-2 -mb-px', active === item.key
                        ? 'border-brand-500 text-brand-700'
                        : 'border-transparent text-ink-500 hover:text-ink-900'), children: item.label }, item.key))) }), _jsx("div", { className: "pt-4", children: activeItem?.content })] }));
}
