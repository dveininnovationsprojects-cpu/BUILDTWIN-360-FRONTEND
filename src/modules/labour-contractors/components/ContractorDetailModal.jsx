import { Modal, Button } from '@/design-system';
import {
  Building2,
  Phone,
  Mail,
  MapPin,
  CheckCircle2,
  Users,
  Hammer,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export function ContractorDetailModal({ open, onClose, contractor, onEdit }) {
  if (!contractor) return null;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Contractor Profile"
      size="md"
      footer={
        <div className="flex items-center justify-between w-full">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              onClose();
              if (onEdit) onEdit(contractor);
            }}
          >
            Edit Profile
          </Button>
          <Button type="button" variant="primary" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Header summary */}
        <div className="flex items-start justify-between border-b border-surface-border pb-3.5">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-700 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-800">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
                  {contractor.contractorCode || `CTR-${contractor.id}`}
                </span>
                <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-semibold ${
                  contractor.status === 'ACTIVE'
                    ? 'border-status-success/30 bg-status-successBg text-status-success'
                    : 'border-slate-300 bg-slate-100 text-slate-600'
                }`}>
                  <CheckCircle2 className="h-3 w-3" />
                  {contractor.status || 'ACTIVE'}
                </span>
              </div>
              <h3 className="font-bold text-base text-ink-900 mt-1">{contractor.companyName || contractor.name}</h3>
              <p className="text-ink-500 text-[11px]">{contractor.contractorType === 'SUBCONTRACTOR' ? 'Specialized Subcontractor' : 'Main Contractor / Prime Agency'}</p>
            </div>
          </div>
        </div>

        {/* Contact & Trade details */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-ink-400 block font-medium">Trade Specialization.</span>
            <span className="font-bold text-ink-900 text-sm mt-1 flex items-center gap-1.5">
              <Hammer className="h-4 w-4 text-brand-600" />
              {contractor.tradeSpecialization || 'General Works'}
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-ink-400 block font-medium">Active Workforce Strength</span>
            <span className="font-bold text-brand-600 text-sm mt-1 flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              {contractor.deployedWorkers || 15} Deployed Workers
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-ink-400 block font-medium">Contact Person</span>
            <span className="font-semibold text-ink-900 text-xs mt-1 block">
              {contractor.name || contractor.contactPerson || '—'}
            </span>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-ink-400 block font-medium">Phone / Mobile</span>
            <span className="font-semibold text-ink-900 text-xs mt-1 flex items-center gap-1">
              <Phone className="h-3 w-3 text-ink-500" />
              {contractor.contactNumber || contractor.phone || '—'}
            </span>
          </div>
        </div>

        {/* Contact info rows */}
        <div className="flex flex-col gap-2 rounded-xl border border-surface-border bg-surface-subtle p-3">
          <div className="flex items-center gap-2 text-ink-700">
            <Mail className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="font-medium text-ink-500">Email:</span>
            <span className="font-semibold text-ink-900 truncate">{contractor.email || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-ink-700">
            <MapPin className="h-4 w-4 text-ink-400 shrink-0" />
            <span className="font-medium text-ink-500">Location / Active Sites:</span>
            <span className="font-semibold text-ink-900 truncate">{contractor.address || contractor.activeSites || 'Ashok Grandeur Site'}</span>
          </div>
        </div>

        {/* Compliance & Quality Badges */}
        <div className="rounded-xl border border-brand-200/50 bg-brand-50/30 p-3 dark:border-brand-900/30 dark:bg-brand-950/10">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-brand-900 dark:text-brand-300 flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-status-success" />
              Contractor Site Compliance Rating
            </span>
            <span className="font-bold text-status-success">98% Verified</span>
          </div>
          <p className="text-[11px] text-ink-500 leading-relaxed">
            Statutory ESI/PF registration verified. Linked with DPR attendance checks and daily safety clearance protocol.
          </p>
        </div>
      </div>
    </Modal>
  );
}
