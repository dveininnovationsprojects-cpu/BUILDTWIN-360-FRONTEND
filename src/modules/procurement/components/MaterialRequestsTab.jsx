import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  CheckCircle2,
  ClipboardList,
  Plus,
  RefreshCw,
  Trash2,
  XCircle,
} from 'lucide-react';
import { Button, Input, Modal, StatusPill, Table } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { procurementApi } from '../api/procurementApi';

export function MaterialRequestsTab({ projectId, materials = [], canManage = false }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [approvingMr, setApprovingMr] = useState(null);

  const createForm = useForm({
    defaultValues: {
      materialId: '',
      requestedQuantity: '',
      requiredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      remarks: '',
      wbsActivityId: '',
    },
  });

  const approvalForm = useForm({
    defaultValues: {
      approved: true,
      rejectionReason: '',
    },
  });

  const { data: requests = [], isLoading, refetch } = useQuery({
    queryKey: ['procurement-material-requests', projectId],
    queryFn: () => procurementApi.listMaterialRequests(projectId),
    enabled: !!projectId,
  });

  const createMutation = useMutation({
    mutationFn: (values) =>
      procurementApi.createMaterialRequest({
        projectId: Number(projectId),
        materialId: Number(values.materialId),
        requestedQuantity: Number(values.requestedQuantity),
        requiredDate: values.requiredDate,
        remarks: values.remarks?.trim() || null,
        wbsActivityId: values.wbsActivityId ? Number(values.wbsActivityId) : null,
        status: 'PENDING',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-material-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projected-shortages', projectId] });
      pushToast('Material Request raised successfully with status PENDING.', 'success');
      setCreateModalOpen(false);
      createForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const approvalMutation = useMutation({
    mutationFn: ({ id, approved, reason }) =>
      procurementApi.approveOrRejectRequest(id, approved, reason),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['procurement-material-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['projected-shortages', projectId] });
      pushToast(
        vars.approved
          ? 'Material request APPROVED by Project Manager.'
          : 'Material request REJECTED.',
        'success'
      );
      setApprovingMr(null);
      approvalForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => procurementApi.deleteMaterialRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement-material-requests', projectId] });
      pushToast('Material request cancelled.', 'success');
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const columns = [
    {
      key: 'id',
      header: 'MR #',
      render: (row) => <span className="font-mono text-xs font-bold text-brand-700">MR-{row.id}</span>,
    },
    {
      key: 'material',
      header: 'Material Requested',
      render: (row) => {
        const mat = materials.find((m) => Number(m.id) === Number(row.materialId));
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink-900">{mat?.name || `Material #${row.materialId}`}</span>
            <span className="font-mono text-[10px] text-ink-500">{mat?.code || 'SKU'}</span>
          </div>
        );
      },
    },
    {
      key: 'quantity',
      header: 'Requested Qty',
      render: (row) => {
        const mat = materials.find((m) => Number(m.id) === Number(row.materialId));
        return (
          <span className="text-xs font-bold text-brand-800">
            {Number(row.requestedQuantity || 0).toLocaleString()} {mat?.unit || 'Units'}
          </span>
        );
      },
    },
    {
      key: 'requiredDate',
      header: 'Required By Date',
      render: (row) => <span className="text-xs text-ink-700">{row.requiredDate || '—'}</span>,
    },
    {
      key: 'status',
      header: 'Approval Status',
      render: (row) => <StatusPill status={row.status || 'PENDING'} />,
    },
    {
      key: 'remarks',
      header: 'Remarks / Justification',
      render: (row) => (
        <span className="line-clamp-1 text-xs text-ink-600">
          {row.rejectionReason ? `Rejected: ${row.rejectionReason}` : row.remarks || '—'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {row.status === 'PENDING' && canManage && (
            <>
              <Button
                size="xs"
                variant="outline"
                className="text-emerald-700 hover:bg-emerald-50"
                onClick={() => {
                  setApprovingMr(row);
                  approvalForm.reset({ approved: true, rejectionReason: '' });
                }}
              >
                <CheckCircle2 className="mr-1 h-3.5 w-3.5" /> Approve
              </Button>
              <Button
                size="xs"
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={() => {
                  setApprovingMr(row);
                  approvalForm.reset({ approved: false, rejectionReason: '' });
                }}
              >
                <XCircle className="mr-1 h-3.5 w-3.5" /> Reject
              </Button>
              <button
                type="button"
                title="Cancel request"
                onClick={() => {
                  if (window.confirm(`Cancel Material Request MR-${row.id}?`)) {
                    deleteMutation.mutate(row.id);
                  }
                }}
                className="rounded p-1 text-ink-400 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </>
          )}
          {row.status === 'APPROVED' && (
            <span className="text-[11px] font-semibold text-emerald-700">Ready for PO</span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-500">
          Site Engineers raise Material Requests (MR) for scheduled works. Project Managers approve or reject before Purchase Orders are generated.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {canManage && (
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-1 h-4 w-4" /> Raise Material Request
            </Button>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={requests}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No material requests raised for this project yet."
      />

      {/* Raise MR Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Raise Site Material Request (MR)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createForm.handleSubmit((values) => createMutation.mutate(values))}
              isLoading={createMutation.isPending}
            >
              Raise Request
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Select Material *
            <select
              {...createForm.register('materialId', { required: 'Material is required' })}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Choose Material Catalog Item --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name} ({m.unit || 'unit'})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Requested Quantity *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 500"
              {...createForm.register('requestedQuantity', { required: 'Quantity is required' })}
              error={createForm.formState.errors.requestedQuantity?.message}
            />

            <Input
              label="Required By Date *"
              type="date"
              {...createForm.register('requiredDate', { required: 'Date is required' })}
              error={createForm.formState.errors.requiredDate?.message}
            />
          </div>

          <Input
            label="WBS Activity ID (Optional)"
            type="number"
            placeholder="e.g. 10"
            {...createForm.register('wbsActivityId')}
          />

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Site Justification / Work Notes
            <textarea
              rows={2}
              placeholder="e.g. Required for First Floor Slab Casting reinforcement..."
              {...createForm.register('remarks')}
              className="rounded-lg border border-surface-border bg-white p-2 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </form>
      </Modal>

      {/* Approval Modal */}
      {approvingMr && (
        <Modal
          open={Boolean(approvingMr)}
          onClose={() => setApprovingMr(null)}
          title={`Review Material Request MR-${approvingMr.id}`}
          size="md"
          footer={
            <div className="flex w-full items-center justify-between">
              <Button variant="outline" onClick={() => setApprovingMr(null)}>
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="danger"
                  onClick={() =>
                    approvalMutation.mutate({
                      id: approvingMr.id,
                      approved: false,
                      reason: approvalForm.getValues('rejectionReason') || 'Insufficient site readiness',
                    })
                  }
                  isLoading={approvalMutation.isPending}
                >
                  <XCircle className="mr-1 h-4 w-4" /> Reject Request
                </Button>
                <Button
                  className="bg-emerald-600 text-white hover:bg-emerald-700"
                  onClick={() =>
                    approvalMutation.mutate({
                      id: approvingMr.id,
                      approved: true,
                    })
                  }
                  isLoading={approvalMutation.isPending}
                >
                  <CheckCircle2 className="mr-1 h-4 w-4" /> Approve for PO Generation
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="rounded-lg bg-surface-subtle p-3">
              <p className="font-semibold text-ink-900">
                Quantity: {approvingMr.requestedQuantity} units · Required By:{' '}
                {approvingMr.requiredDate}
              </p>
              {approvingMr.remarks && <p className="mt-1 text-ink-600">{approvingMr.remarks}</p>}
            </div>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Rejection Reason (if rejecting)
              <textarea
                rows={2}
                placeholder="e.g. Existing buffer stock is sufficient for current week schedule..."
                {...approvalForm.register('rejectionReason')}
                className="rounded-lg border border-surface-border bg-white p-2 text-xs outline-none focus:border-brand-500"
              />
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
