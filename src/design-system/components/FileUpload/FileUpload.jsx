import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
/** Evidence/photo/document upload used by DPR photos, quality/NCR evidence and the document repository. */
export function FileUpload({ label = 'Upload evidence', accept = 'image/*,.pdf', multiple = true, maxSizeMb = 10, onFilesSelected }) {
    const inputRef = useRef(null);
    const [selected, setSelected] = useState([]);
    const [error, setError] = useState();
    function handleFiles(files) {
        if (!files)
            return;
        const list = Array.from(files);
        const oversized = list.find((f) => f.size > maxSizeMb * 1024 * 1024);
        if (oversized) {
            setError(`${oversized.name} exceeds ${maxSizeMb}MB limit`);
            return;
        }
        setError(undefined);
        setSelected(list);
        onFilesSelected(list);
    }
    return (_jsxs("div", { className: "flex flex-col gap-2", children: [label && _jsx("span", { className: "text-sm font-medium text-ink-700", children: label }), _jsxs("button", { type: "button", onClick: () => inputRef.current?.click(), className: cn('flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-surface-border bg-surface-subtle py-8 text-ink-500 hover:border-brand-400 hover:text-brand-600'), children: [_jsx(UploadCloud, { className: "h-6 w-6" }), _jsx("span", { className: "text-sm", children: "Click to browse or drag files here" }), _jsxs("span", { className: "text-xs text-ink-300", children: ["Images, PDF \u2014 up to ", maxSizeMb, "MB each"] })] }), _jsx("input", { ref: inputRef, type: "file", accept: accept, multiple: multiple, className: "hidden", onChange: (e) => handleFiles(e.target.files) }), error && _jsx("span", { className: "text-xs text-status-danger", children: error }), selected.length > 0 && (_jsx("ul", { className: "flex flex-col gap-1", children: selected.map((f, i) => (_jsxs("li", { className: "flex items-center justify-between rounded bg-surface-subtle px-3 py-1.5 text-xs text-ink-700", children: [_jsxs("span", { className: "flex items-center gap-1.5", children: [_jsx(FileText, { className: "h-3.5 w-3.5" }), " ", f.name] }), _jsx("button", { type: "button", onClick: () => setSelected((prev) => prev.filter((_, idx) => idx !== i)), className: "text-ink-400 hover:text-status-danger", children: _jsx(X, { className: "h-3.5 w-3.5" }) })] }, i))) }))] }));
}
