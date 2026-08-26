import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useRef, useState } from 'react';
import { cn } from '@/design-system/utils/cn';
export function Dropdown({ trigger, items }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    useEffect(() => {
        const onClick = (e) => {
            if (ref.current && !ref.current.contains(e.target))
                setOpen(false);
        };
        document.addEventListener('mousedown', onClick);
        return () => document.removeEventListener('mousedown', onClick);
    }, []);
    return (_jsxs("div", { className: "relative", ref: ref, children: [_jsx("div", { onClick: () => setOpen((o) => !o), children: trigger }), open && (_jsx("div", { className: "absolute right-0 z-40 mt-1 w-48 rounded-md border border-surface-border bg-surface-base py-1 shadow-popover", children: items.map((item, i) => (_jsx("button", { onClick: () => {
                        item.onSelect();
                        setOpen(false);
                    }, className: cn('block w-full px-3 py-2 text-left text-sm hover:bg-surface-subtle', item.destructive ? 'text-status-danger' : 'text-ink-900'), children: item.label }, i))) }))] }));
}
