import { Modal, Button, StatusPill, Card } from '@/design-system';
import { CheckCircle2, XCircle, FileText, ExternalLink, PackageCheck, Calendar, User, Hash } from 'lucide-react';

export function GrnDetailsModal({ open, onClose, grn }) {
  if (!grn) return null;

  const received = Number(grn.receivedQty || 0);
  const accepted = Number(grn.acceptedQty || 0);
  const rejected = Number(grn.rejectedQty || 0);

  const acceptedPct = received > 0 ? Math.round((accepted / received) * 100) : 100;
  const rejectedPct = received > 0 ? Math.round((rejected / received) * 100) : 0;

  const isFullAcceptance = rejected === 0 && accepted > 0;
  const isPartial = rejected > 0 && accepted > 0;
  const isFullRejection = accepted === 0 && received > 0;

  const statusType = isFullAcceptance ? 'SUCCESS' : isPartial ? 'WARNING' : 'DANGER';
  const statusLabel = isFullAcceptance ? 'FULLY ACCEPTED' : isPartial ? 'PARTIALLY ACCEPTED' : 'FULLY REJECTED';

  const formattedDate = grn.createdAt
    ? new Date(grn.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Recently';

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={`Goods Receipt Note — ${grn.grnNumber || `GRN-${grn.id}`}`}
      size="md"
      footer={
        <Button variant="outline" onClick={onClose}>
          Close
        </Button>
      }
    >
      <div className="flex flex-col gap-5 text-ink-900">
        {/* Top Header Card */}
        <div className="flex items-center justify-between p-4 rounded-lg bg-surface-subtle border border-surface-border">
          <div>
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Status & Verification</span>
            <div className="mt-1 flex items-center gap-2">
              <span
                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${
                  isFullAcceptance
                    ? 'bg-status-success/15 text-status-success border border-status-success/30'
                    : isPartial
                    ? 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                    : 'bg-status-danger/15 text-status-danger border border-status-danger/30'
                }`}
              >
                {statusLabel}
              </span>
              <span className="text-xs text-ink-500">({acceptedPct}% accepted)</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xs font-semibold text-ink-500 uppercase tracking-wider">Date Recorded</span>
            <p className="text-xs font-medium text-ink-800 mt-1 flex items-center gap-1 justify-end">
              <Calendar className="w-3.5 h-3.5 text-ink-400" />
              {formattedDate}
            </p>
          </div>
        </div>

        {/* Quantities Visual Breakdown */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-medium text-ink-600">
            <span>Inspection Breakdown</span>
            <span>Total Delivered: <strong>{received}</strong></span>
          </div>

          {/* Dual Progress Bar */}
          <div className="h-3 w-full rounded-full bg-surface-border overflow-hidden flex">
            <div
              style={{ width: `${acceptedPct}%` }}
              className="bg-status-success h-full transition-all duration-300"
              title={`Accepted: ${accepted} (${acceptedPct}%)`}
            />
            <div
              style={{ width: `${rejectedPct}%` }}
              className="bg-status-danger h-full transition-all duration-300"
              title={`Rejected: ${rejected} (${rejectedPct}%)`}
            />
          </div>

          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="p-2.5 rounded bg-surface-base border border-surface-border text-center">
              <span className="text-[11px] text-ink-500 block">Total Received</span>
              <strong className="text-base text-ink-900 font-bold">{received}</strong>
            </div>

            <div className="p-2.5 rounded bg-status-success/5 border border-status-success/20 text-center">
              <span className="text-[11px] text-status-success block font-medium">Accepted (Stock In)</span>
              <strong className="text-base text-status-success font-bold">+{accepted}</strong>
            </div>

            <div className="p-2.5 rounded bg-status-danger/5 border border-status-danger/20 text-center">
              <span className="text-[11px] text-status-danger block font-medium">Rejected</span>
              <strong className="text-base text-status-danger font-bold">{rejected}</strong>
            </div>
          </div>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <span className="text-ink-500 block font-medium mb-1">Purchase Order</span>
            <p className="font-semibold text-ink-900 flex items-center gap-1.5">
              <Hash className="w-3.5 h-3.5 text-brand-600" />
              {grn.poNumber || `PO-${grn.poId}`}
            </p>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <span className="text-ink-500 block font-medium mb-1">Material Name</span>
            <p className="font-semibold text-ink-900 truncate">
              {grn.materialName || `Material #${grn.materialId}`}
            </p>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <span className="text-ink-500 block font-medium mb-1">Inspector / Storekeeper</span>
            <p className="font-semibold text-ink-900 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-ink-500" />
              {grn.receivedBy || 'Site Storekeeper'}
            </p>
          </div>

          <div className="p-3 rounded bg-surface-subtle border border-surface-border">
            <span className="text-ink-500 block font-medium mb-1">Stock Ledger Reference</span>
            <p className="font-semibold text-brand-700 font-mono">
              GRN-{grn.id}
            </p>
          </div>
        </div>

        {/* Rejection Reason (if any) */}
        {rejected > 0 && grn.rejectionReason && (
          <div className="p-3 rounded-lg bg-status-danger/5 border border-status-danger/20 text-xs">
            <span className="font-semibold text-status-danger block mb-1">Rejection Reason:</span>
            <p className="text-ink-800 leading-relaxed">{grn.rejectionReason}</p>
          </div>
        )}

        {/* Delivery Evidence */}
        {grn.deliveryEvidenceUrl ? (
          <div className="p-3 rounded-lg bg-surface-subtle border border-surface-border text-xs">
            <span className="font-semibold text-ink-700 block mb-1.5">Delivery Evidence / Challan:</span>
            {grn.deliveryEvidenceUrl.startsWith('http') ? (
              <a
                href={grn.deliveryEvidenceUrl}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 hover:text-brand-800 underline font-medium inline-flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                View Attached Delivery Challan Document
              </a>
            ) : (
              <span className="text-ink-800 font-mono">{grn.deliveryEvidenceUrl}</span>
            )}
          </div>
        ) : (
          <div className="p-2.5 rounded bg-surface-subtle text-xs text-ink-400 italic">
            No external delivery evidence URL attached.
          </div>
        )}
      </div>
    </Modal>
  );
}
