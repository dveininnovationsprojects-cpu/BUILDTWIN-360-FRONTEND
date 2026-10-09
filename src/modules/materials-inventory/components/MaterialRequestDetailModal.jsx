import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardList,
  CheckCircle2,
  XCircle,
  Package,
  Calendar,
  AlertTriangle,
  ArrowUpRight,
  User,
  MapPin,
  Layers,
  Clock,
  Trash2,
  FileCheck,
} from 'lucide-react';
import { Modal, Button, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import {
  materialRequestsApi,
  MATERIAL_REQUEST_STATUSES,
  REQUEST_PRIORITIES,
} from '../api/materialRequestsApi';
import { UNIT_LABEL_MAP } from '../api/materialsInventoryApi';

export function MaterialRequestDetailModal({
  open,
  onClose,
  request,
  material = null,
  contractors = [],
  onIssueMaterial,
}) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const currentUser = useAuthStore((s) => s.user);

  const [approvalAction, setApprovalAction] = useState(null); // 'APPROVE' | 'REJECT' | null
  const [approvalRemarks, setApprovalRemarks] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const canApprove = useHasRole(
    ROLES.PROJECT_MANAGER,
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROCUREMENT_STORE
  );

  const canDelete = useHasRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER);

  // Approval mutation
  const approvalMutation = useMutation({
    mutationFn: async ({ status, reason, remarks }) => {
      return materialRequestsApi.updateApproval(request.id, {
        status,
        approvedBy: currentUser?.name || currentUser?.username || 'Project Manager',
        rejectionReason: reason || null,
        remarks: remarks || null,
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['material-requests-project'] });
      pushToast(
        updated.status === 'APPROVED'
          ? `Material Request ${request.requestNumber || ''} approved successfully.`
          : `Material Request ${request.requestNumber || ''} has been rejected.`,
        updated.status === 'APPROVED' ? 'success' : 'info'
      );
      setApprovalAction(null);
      setApprovalRemarks('');
      setRejectionReason('');
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to update request approval status.', 'error');
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => materialRequestsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['material-requests-project'] });
      pushToast('Material Request deleted.', 'success');
      onClose();
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete request.', 'error'),
  });

  if (!request) return null;

  const unitLabel = UNIT_LABEL_MAP[request.unit] || request.unit || 'Units';
  const unitRate = Number(material?.standardRate ?? 0);
  const estimatedTotal = Number(request.requiredQty ?? 0) * unitRate;
  const currentStock = Number(material?.currentStock ?? 0);
  const priorityDef = REQUEST_PRIORITIES.find((p) => p.value === request.priority);

  const isPending = request.status === 'PENDING';
  const isApproved = request.status === 'APPROVED';
  const isRejected = request.status === 'REJECTED';

  const handleApproveSubmit = () => {
    approvalMutation.mutate({
      status: 'APPROVED',
      remarks: approvalRemarks.trim(),
    });
  };

  const handleRejectSubmit = () => {
    if (!rejectionReason.trim()) {
      pushToast('Please provide a reason for rejecting this requisition.', 'warning');
      return;
    }
    approvalMutation.mutate({
      status: 'REJECTED',
      reason: rejectionReason.trim(),
      remarks: approvalRemarks.trim(),
    });
  };

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete request ${request.requestNumber}?`)) {
      deleteMutation.mutate(request.id);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/40 dark:text-brand-400">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-semibold text-ink-900">{request.requestNumber}</h3>
              <StatusPill status={request.status} />
              {priorityDef && (
                <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${priorityDef.badge}`}>
                  {priorityDef.label}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-500">
              Submitted by <strong>{request.requestedBy}</strong> on{' '}
              {new Date(request.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {canDelete && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleDelete}
                isLoading={deleteMutation.isPending}
                className="text-status-danger hover:bg-status-dangerBg border-status-danger/30 text-xs"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose}>
              Close
            </Button>

            {/* If approved, provide direct quick shortcut to fulfill via Stock Issue */}
            {isApproved && onIssueMaterial && (
              <Button
                onClick={() => {
                  onClose();
                  onIssueMaterial(request);
                }}
                className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700"
              >
                <FileCheck className="h-4 w-4" />
                Fulfill / Issue Stock
              </Button>
            )}

            {/* If pending and user has role, show Approve/Reject triggers */}
            {isPending && canApprove && !approvalAction && (
              <>
                <Button
                  variant="outline"
                  onClick={() => setApprovalAction('REJECT')}
                  className="text-status-danger hover:bg-status-dangerBg border-status-danger/30"
                >
                  <XCircle className="h-4 w-4 mr-1 text-status-danger" />
                  Reject
                </Button>
                <Button
                  onClick={() => setApprovalAction('APPROVE')}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Approve Request
                </Button>
              </>
            )}
          </div>
        </div>
      }
    >
      <div className="flex flex-col gap-4 py-1">
        {/* Inline Approval Confirmation Panel */}
        {approvalAction === 'APPROVE' && (
          <div className="rounded-xl border border-emerald-500/30 bg-emerald-50/60 p-4 dark:bg-emerald-950/20">
            <h4 className="font-semibold text-emerald-900 dark:text-emerald-300 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Approve Material Request ({request.requestNumber})
            </h4>
            <p className="mt-1 text-xs text-emerald-800 dark:text-emerald-400">
              Confirm requisition of <strong>{request.requiredQty} {unitLabel}</strong> of{' '}
              <strong>{request.materialName}</strong> for site execution.
            </p>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-ink-700">Approval Comments (Optional)</label>
              <input
                type="text"
                placeholder="e.g. Approved for casting schedule. Verified against BOQ."
                value={approvalRemarks}
                onChange={(e) => setApprovalRemarks(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-1.5 text-xs text-ink-900 focus:outline-none focus:border-brand-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setApprovalAction(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-emerald-600 hover:bg-emerald-700"
                onClick={handleApproveSubmit}
                isLoading={approvalMutation.isPending}
              >
                Confirm Approval
              </Button>
            </div>
          </div>
        )}

        {/* Inline Rejection Panel */}
        {approvalAction === 'REJECT' && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-50/60 p-4 dark:bg-rose-950/20">
            <h4 className="font-semibold text-rose-900 dark:text-rose-300 text-sm flex items-center gap-1.5">
              <XCircle className="h-4 w-4 text-rose-600" />
              Reject Material Request ({request.requestNumber})
            </h4>
            <div className="mt-3">
              <label className="mb-1 block text-xs font-medium text-rose-900 dark:text-rose-300">
                Reason for Rejection <span className="text-status-danger">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Requested quantity exceeds weekly pour ceiling; re-align with revised schedule."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                className="w-full rounded-lg border border-rose-300 bg-surface-base px-3 py-1.5 text-xs text-ink-900 focus:outline-none focus:border-rose-500"
              />
            </div>
            <div className="mt-3 flex items-center justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setApprovalAction(null)}>
                Cancel
              </Button>
              <Button
                size="sm"
                className="bg-rose-600 hover:bg-rose-700 text-white"
                onClick={handleRejectSubmit}
                isLoading={approvalMutation.isPending}
              >
                Confirm Rejection
              </Button>
            </div>
          </div>
        )}

        {/* Top 4 KPI Metrics */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-[10px] uppercase font-semibold text-ink-400">Requested Qty</span>
            <p className="mt-1 text-lg font-bold text-ink-900">
              {Number(request.requiredQty).toLocaleString()}{' '}
              <span className="text-xs font-normal text-ink-500">{unitLabel}</span>
            </p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-[10px] uppercase font-semibold text-ink-400">Current Store Stock</span>
            <p className={`mt-1 text-lg font-bold ${currentStock < Number(request.requiredQty) ? 'text-amber-600' : 'text-emerald-600'}`}>
              {currentStock.toLocaleString()}{' '}
              <span className="text-xs font-normal text-ink-500">{unitLabel}</span>
            </p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-[10px] uppercase font-semibold text-ink-400">Required Date</span>
            <p className="mt-1 text-base font-bold text-ink-900 flex items-center gap-1">
              <Calendar className="h-4 w-4 text-ink-400" />
              {request.requiredDate ? new Date(request.requiredDate).toLocaleDateString() : 'Immediate'}
            </p>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
            <span className="text-[10px] uppercase font-semibold text-ink-400">Est. Total Cost</span>
            <p className="mt-1 text-lg font-bold text-brand-600">
              ₹{estimatedTotal.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
            </p>
          </div>
        </div>

        {/* Detailed Breakdown Grid */}
        <div className="rounded-xl border border-surface-border bg-surface-card p-4 text-xs">
          <h4 className="font-semibold text-ink-900 mb-3 text-xs uppercase tracking-wider text-ink-400">
            Requisition Specifications
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
            <div>
              <span className="text-ink-400 block">Material SKU & Name</span>
              <span className="font-semibold text-ink-900 text-sm">
                {request.materialCode ? `[${request.materialCode}] ` : ''}{request.materialName}
              </span>
            </div>

            <div>
              <span className="text-ink-400 block">Project</span>
              <span className="font-semibold text-ink-900">
                {request.projectName || `Project #${request.projectId}`}
              </span>
            </div>

            <div>
              <span className="text-ink-400 block">Site & Specific Zone</span>
              <span className="font-medium text-ink-800">
                {request.siteName ? `${request.siteName} · ` : ''}
                {request.zone || 'Site Store'}
              </span>
            </div>

            <div>
              <span className="text-ink-400 block">WBS Activity / Work Package</span>
              <span className="font-medium text-ink-800">
                {request.activityName || 'General Civil Execution'}
              </span>
            </div>

            <div>
              <span className="text-ink-400 block">Executing Contractor</span>
              <span className="font-medium text-ink-800">
                {(() => {
                  const c = contractors.find((con) => String(con.id) === String(request.contractorId));
                  return request.contractorName || (c ? (c.contractorName || c.name || c.companyName) : request.contractorId ? `Contractor #${request.contractorId}` : 'Internal Site Force');
                })()}
              </span>
            </div>

            <div>
              <span className="text-ink-400 block">Requested By</span>
              <span className="font-medium text-ink-800">
                {request.requestedBy}
              </span>
            </div>
          </div>

          {request.remarks && (
            <div className="mt-3 border-t border-surface-border pt-3">
              <span className="text-ink-400 block">Site Notes & Purpose</span>
              <p className="mt-1 text-ink-700 italic bg-surface-subtle p-2.5 rounded-lg border border-surface-border">
                "{request.remarks}"
              </p>
            </div>
          )}
        </div>

        {/* Approval Status Audit Trail */}
        {(isApproved || isRejected) && (
          <div
            className={`rounded-xl border p-4 text-xs ${
              isApproved
                ? 'border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20'
                : 'border-rose-300 bg-rose-50/50 dark:bg-rose-950/20'
            }`}
          >
            <div className="flex items-center gap-2">
              {isApproved ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              ) : (
                <XCircle className="h-4 w-4 text-rose-600" />
              )}
              <h5 className="font-semibold text-ink-900">
                {isApproved ? 'Approval Granted' : 'Requisition Rejected'}
              </h5>
            </div>

            <p className="mt-1 text-ink-600">
              Processed by <strong>{request.approvedBy || 'Project Manager'}</strong>
              {request.updatedAt && (
                <span> on {new Date(request.updatedAt).toLocaleString()}</span>
              )}
            </p>

            {request.rejectionReason && (
              <p className="mt-2 text-rose-800 dark:text-rose-300">
                <strong>Rejection Reason:</strong> {request.rejectionReason}
              </p>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
}
