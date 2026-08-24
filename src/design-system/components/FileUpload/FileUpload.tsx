import { useRef, useState } from 'react';
import { UploadCloud, X, FileText } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';

export interface FileUploadProps {
  label?: string;
  accept?: string;
  multiple?: boolean;
  maxSizeMb?: number;
  onFilesSelected: (files: File[]) => void;
}

/** Evidence/photo/document upload used by DPR photos, quality/NCR evidence and the document repository. */
export function FileUpload({ label = 'Upload evidence', accept = 'image/*,.pdf', multiple = true, maxSizeMb = 10, onFilesSelected }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selected, setSelected] = useState<File[]>([]);
  const [error, setError] = useState<string>();

  function handleFiles(files: FileList | null) {
    if (!files) return;
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

  return (
    <div className="flex flex-col gap-2">
      {label && <span className="text-sm font-medium text-ink-700">{label}</span>}
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          'flex flex-col items-center justify-center gap-1.5 rounded-md border-2 border-dashed border-surface-border bg-surface-subtle py-8 text-ink-500 hover:border-brand-400 hover:text-brand-600',
        )}
      >
        <UploadCloud className="h-6 w-6" />
        <span className="text-sm">Click to browse or drag files here</span>
        <span className="text-xs text-ink-300">Images, PDF — up to {maxSizeMb}MB each</span>
      </button>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
      {error && <span className="text-xs text-status-danger">{error}</span>}
      {selected.length > 0 && (
        <ul className="flex flex-col gap-1">
          {selected.map((f, i) => (
            <li key={i} className="flex items-center justify-between rounded bg-surface-subtle px-3 py-1.5 text-xs text-ink-700">
              <span className="flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" /> {f.name}
              </span>
              <button
                type="button"
                onClick={() => setSelected((prev) => prev.filter((_, idx) => idx !== i))}
                className="text-ink-400 hover:text-status-danger"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
