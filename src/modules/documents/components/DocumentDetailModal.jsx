import { Modal, Button, StatusPill } from '@/design-system';
import { ExternalLink, Download, Trash2, Calendar, User, Layers, Tag, FileText } from 'lucide-react';

export function DocumentDetailModal({
  document: doc,
  open,
  onClose,
  onDelete,
  onOpenViewer,
  canManage = false,
}) {
  if (!doc) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Project Document & Drawing Details"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <div>
            {canManage && (
              <Button
                size="sm"
                variant="ghost"
                className="text-status-danger hover:bg-red-50"
                onClick={() => {
                  if (window.confirm(`Delete document "${doc.title}"?`)) {
                    onDelete(doc.id);
                    onClose();
                  }
                }}
              >
                <Trash2 className="h-4 w-4 mr-1 text-status-danger" />
                Delete
              </Button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                onClose();
                onOpenViewer?.(doc);
              }}
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1" />
              Open Document
            </Button>
            <Button size="sm" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4">
        {/* Title & Badges */}
        <div className="flex items-start justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <h3 className="text-sm font-bold text-ink-900 leading-snug">{doc.title}</h3>
            <span className="text-[11px] text-ink-500 font-mono mt-0.5 block">
              Document ID: #{doc.id}
            </span>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
              {doc.version || 'v1.0'}
            </span>
            <StatusPill status={doc.status || 'ACTIVE'} />
          </div>
        </div>

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
            <Tag className="h-4 w-4 text-ink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-ink-400">Category</span>
              <span className="font-medium text-ink-800">{doc.category || 'DRAWING'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
            <Layers className="h-4 w-4 text-ink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-ink-400">Project Site</span>
              <span className="font-medium text-ink-800">Project #{doc.projectId}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
            <User className="h-4 w-4 text-ink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-ink-400">Uploaded By</span>
              <span className="font-medium text-ink-800">{doc.uploadedBy || 'Site Engineer'}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-surface-subtle border border-surface-border">
            <Calendar className="h-4 w-4 text-ink-400 shrink-0" />
            <div className="flex flex-col">
              <span className="text-[10px] uppercase font-semibold text-ink-400">Uploaded On</span>
              <span className="font-medium text-ink-800">
                {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : 'Active'}
              </span>
            </div>
          </div>
        </div>

        {/* Storage URL Panel */}
        <div className="flex flex-col gap-1 p-3 rounded-lg bg-surface-subtle border border-surface-border text-xs">
          <span className="text-[10px] uppercase font-semibold text-ink-400 flex items-center gap-1">
            <FileText className="h-3 w-3" /> Storage URI / Location
          </span>
          <span className="font-mono text-ink-700 truncate select-all">{doc.objectUrl}</span>
        </div>
      </div>
    </Modal>
  );
}
