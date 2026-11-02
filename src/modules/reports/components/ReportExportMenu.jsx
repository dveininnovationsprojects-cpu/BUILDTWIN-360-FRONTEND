import React, { useState, useRef, useEffect } from 'react';
import {
  Download,
  FileText,
  FileSpreadsheet,
  FileCode,
  Printer,
  ChevronDown,
  Sparkles,
  Check,
} from 'lucide-react';
import { Button } from '@/design-system';

export function ReportExportMenu({
  onExportPdf,
  onExportExcel,
  onExportCsv,
  onPrint,
  isGeneratingPdf = false,
  className = '',
}) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef(null);

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <Button
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        isLoading={isGeneratingPdf}
        className="flex items-center gap-1.5 shadow-sm"
        title="Export Report (PDF / Excel / CSV / Print)"
      >
        <Download className="h-3.5 w-3.5" />
        <span>Export Report</span>
        <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 max-w-[calc(100vw-2rem)] origin-top-right rounded-xl border border-surface-border bg-white p-1.5 shadow-xl z-50 animate-in fade-in-50 zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-surface-border/60 mb-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-ink-400">
              Select Export Format
            </span>
          </div>

          {/* Option 1: PDF */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportPdf();
            }}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-left rounded-lg text-xs font-semibold text-ink-800 hover:bg-brand-50 hover:text-brand-900 transition-colors group"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-rose-50 text-rose-600 border border-rose-100 group-hover:bg-rose-100">
              <FileText className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-900">PDF Document</span>
                <span className="text-[10px] font-mono text-ink-400">.pdf</span>
              </div>
              <p className="text-[10px] font-normal text-ink-500 truncate">
                Executive dossier with KPIs &amp; signatures
              </p>
            </div>
          </button>

          {/* Option 2: Excel */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportExcel();
            }}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-left rounded-lg text-xs font-semibold text-ink-800 hover:bg-emerald-50 hover:text-emerald-900 transition-colors group"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-emerald-50 text-emerald-600 border border-emerald-100 group-hover:bg-emerald-100">
              <FileSpreadsheet className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-900">Excel Workbook</span>
                <span className="text-[10px] font-mono text-ink-400">.xls</span>
              </div>
              <p className="text-[10px] font-normal text-ink-500 truncate">
                Multi-sheet workbook (EVM, store, labour)
              </p>
            </div>
          </button>

          {/* Option 3: CSV */}
          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onExportCsv();
            }}
            className="flex items-center w-full gap-2.5 px-3 py-2 text-left rounded-lg text-xs font-semibold text-ink-800 hover:bg-slate-100 hover:text-ink-900 transition-colors group"
          >
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-700 border border-slate-200 group-hover:bg-slate-200">
              <FileCode className="h-4 w-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-ink-900">CSV Raw Data</span>
                <span className="text-[10px] font-mono text-ink-400">.csv</span>
              </div>
              <p className="text-[10px] font-normal text-ink-500 truncate">
                Standard format for BI tools &amp; pipelines
              </p>
            </div>
          </button>

          {/* Option 4: Print */}
          {onPrint && (
            <>
              <div className="border-t border-surface-border/60 my-1" />
              <button
                type="button"
                onClick={() => {
                  setIsOpen(false);
                  onPrint();
                }}
                className="flex items-center w-full gap-2.5 px-3 py-2 text-left rounded-lg text-xs font-medium text-ink-700 hover:bg-slate-50 hover:text-ink-900 transition-colors"
              >
                <Printer className="h-3.5 w-3.5 text-ink-500" />
                <span>Open Printable View (Ctrl+P)</span>
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
