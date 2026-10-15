import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Boxes,
  ClipboardCheck,
  Flame,
  MinusCircle,
  Plus,
  RefreshCw,
  Scale,
  Send,
} from 'lucide-react';
import { Button, Input, Modal, StatusPill, Table } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { procurementApi } from '../api/procurementApi';

export function StockLedgerTab({ projectId, materials = [], canManage = false }) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const [isConsumptionModalOpen, setConsumptionModalOpen] = useState(false);
  const [isIssueModalOpen, setIssueModalOpen] = useState(false);
  const [isReconcileModalOpen, setReconcileModalOpen] = useState(false);

  const consumptionForm = useForm({
    defaultValues: {
      materialId: '',
      quantity: '',
      wbsActivityId: '',
      remarks: '',
    },
  });

  const issueForm = useForm({
    defaultValues: {
      materialId: '',
      quantity: '',
      wbsActivityId: '',
      remarks: '',
    },
  });

  const reconcileForm = useForm({
    defaultValues: {
      materialId: '',
      physicalCount: '',
      remarks: '',
    },
  });

  const { data: ledger = [], isLoading, refetch } = useQuery({
    queryKey: ['stock-ledger-project', projectId],
    queryFn: () => procurementApi.getStockLedgerByProject(projectId),
    enabled: !!projectId,
  });

  const consumptionMutation = useMutation({
    mutationFn: (values) =>
      procurementApi.recordSiteConsumption({
        projectId: Number(projectId),
        materialId: Number(values.materialId),
        quantity: Number(values.quantity),
        wbsActivityId: values.wbsActivityId ? Number(values.wbsActivityId) : null,
        transactionType: 'CONSUMPTION',
        referenceType: 'DAILY_CONSUMPTION',
        remarks: values.remarks?.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ledger-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      pushToast('Ground site consumption recorded and stock ledger updated.', 'success');
      setConsumptionModalOpen(false);
      consumptionForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const issueMutation = useMutation({
    mutationFn: (values) =>
      procurementApi.issueMaterialToSite({
        projectId: Number(projectId),
        materialId: Number(values.materialId),
        quantity: Number(values.quantity),
        wbsActivityId: values.wbsActivityId ? Number(values.wbsActivityId) : null,
        transactionType: 'ISSUE',
        referenceType: 'MANUAL_ISSUE',
        remarks: values.remarks?.trim() || null,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ledger-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      pushToast('Material issued to site successfully.', 'success');
      setIssueModalOpen(false);
      issueForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const reconcileMutation = useMutation({
    mutationFn: (values) =>
      procurementApi.reconcilePhysicalStock({
        projectId: Number(projectId),
        materialId: Number(values.materialId),
        physicalCount: Number(values.physicalCount),
        remarks: values.remarks?.trim() || 'Physical inventory audit count',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['stock-ledger-project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      pushToast('Physical stock reconciliation audit recorded.', 'success');
      setReconcileModalOpen(false);
      reconcileForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const columns = [
    {
      key: 'id',
      header: 'Txn #',
      render: (row) => <span className="font-mono text-xs font-bold">TXN-{row.id}</span>,
    },
    {
      key: 'timestamp',
      header: 'Date & Time',
      render: (row) => (
        <span className="text-xs text-ink-600">
          {row.timestamp ? new Date(row.timestamp).toLocaleString() : '—'}
        </span>
      ),
    },
    {
      key: 'material',
      header: 'Material',
      render: (row) => {
        const mat = materials.find((m) => Number(m.id) === Number(row.materialId));
        return (
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-ink-900">{mat?.name || `Material #${row.materialId}`}</span>
            <span className="font-mono text-[10px] text-ink-400">{mat?.code || 'SKU'}</span>
          </div>
        );
      },
    },
    {
      key: 'transactionType',
      header: 'Movement Type',
      render: (row) => {
        const type = row.transactionType || 'ISSUE';
        const tone =
          type === 'RECEIPT'
            ? 'success'
            : type === 'CONSUMPTION'
            ? 'danger'
            : type === 'ADJUSTMENT'
            ? 'warning'
            : 'brand';
        return <StatusPill status={type} tone={tone} />;
      },
    },
    {
      key: 'quantity',
      header: 'Movement Qty',
      render: (row) => {
        const mat = materials.find((m) => Number(m.id) === Number(row.materialId));
        const isPositive = row.transactionType === 'RECEIPT' || row.transactionType === 'RETURN';
        return (
          <span
            className={`font-mono text-xs font-bold ${
              isPositive ? 'text-emerald-700' : 'text-ink-900'
            }`}
          >
            {isPositive ? '+' : '-'}
            {Number(row.quantity || 0).toLocaleString()} {mat?.unit || 'Units'}
          </span>
        );
      },
    },
    {
      key: 'balance',
      header: 'Balance After',
      render: (row) => (
        <span className="font-mono text-xs font-semibold text-brand-700">
          {Number(row.balanceAfter || 0).toLocaleString()}
        </span>
      ),
    },
    {
      key: 'reference',
      header: 'Reference & Work Scope',
      render: (row) => (
        <div className="flex flex-col text-xs text-ink-600">
          <span>{row.referenceType || 'SITE_OPS'}</span>
          {row.wbsActivityId && (
            <span className="text-[10px] text-brand-600">WBS Activity #{row.wbsActivityId}</span>
          )}
          {row.remarks && <span className="text-[10px] text-ink-400">{row.remarks}</span>}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-500">
          Immutable append-only stock movement ledger tracking receipts, store issues, daily ground site consumptions, and physical audits.
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isLoading}>
            <RefreshCw className={`mr-1.5 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          {canManage && (
            <>
              <Button size="sm" variant="outline" onClick={() => setIssueModalOpen(true)}>
                <Send className="mr-1 h-3.5 w-3.5" /> Issue to Site
              </Button>
              <Button size="sm" onClick={() => setConsumptionModalOpen(true)}>
                <Flame className="mr-1 h-3.5 w-3.5 text-amber-500" /> Record Consumption
              </Button>
              <Button size="sm" variant="outline" onClick={() => setReconcileModalOpen(true)}>
                <Scale className="mr-1 h-3.5 w-3.5" /> Reconcile Stock
              </Button>
            </>
          )}
        </div>
      </div>

      <Table
        columns={columns}
        data={ledger}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No stock ledger transactions recorded for this project yet."
      />

      {/* Record Consumption Modal */}
      <Modal
        open={isConsumptionModalOpen}
        onClose={() => setConsumptionModalOpen(false)}
        title="Record Ground Material Consumption (WBS Sync)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setConsumptionModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={consumptionForm.handleSubmit((values) => consumptionMutation.mutate(values))}
              isLoading={consumptionMutation.isPending}
            >
              Record Consumption
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={consumptionForm.handleSubmit((values) => consumptionMutation.mutate(values))}
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Select Material *
            <select
              {...consumptionForm.register('materialId', { required: 'Material is required' })}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Choose Material Catalog Item --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name} (Stock: {m.currentStock || 0} {m.unit || 'units'})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity Consumed *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 50"
              {...consumptionForm.register('quantity', { required: 'Quantity is required' })}
              error={consumptionForm.formState.errors.quantity?.message}
            />

            <Input
              label="WBS Activity ID (Optional)"
              type="number"
              placeholder="e.g. 10"
              {...consumptionForm.register('wbsActivityId')}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Consumption Remarks / Pouring Batch
            <textarea
              rows={2}
              placeholder="e.g. Consumed for Ground Floor column casting grid A1-A4..."
              {...consumptionForm.register('remarks')}
              className="rounded-lg border border-surface-border bg-white p-2 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </form>
      </Modal>

      {/* Issue to Site Modal */}
      <Modal
        open={isIssueModalOpen}
        onClose={() => setIssueModalOpen(false)}
        title="Issue Material from Store to Site Work"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIssueModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={issueForm.handleSubmit((values) => issueMutation.mutate(values))}
              isLoading={issueMutation.isPending}
            >
              Issue Material
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={issueForm.handleSubmit((values) => issueMutation.mutate(values))}
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Select Material to Issue *
            <select
              {...issueForm.register('materialId', { required: 'Material is required' })}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Choose Material Catalog Item --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name} (Available: {m.currentStock || 0} {m.unit || 'units'})
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Quantity to Issue *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 100"
              {...issueForm.register('quantity', { required: 'Quantity is required' })}
              error={issueForm.formState.errors.quantity?.message}
            />

            <Input
              label="WBS Activity ID (Optional)"
              type="number"
              placeholder="e.g. 10"
              {...issueForm.register('wbsActivityId')}
            />
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Work Package / Contractor Notes
            <textarea
              rows={2}
              placeholder="e.g. Issued to structural team for slab reinforcement..."
              {...issueForm.register('remarks')}
              className="rounded-lg border border-surface-border bg-white p-2 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </form>
      </Modal>

      {/* Reconcile Modal */}
      <Modal
        open={isReconcileModalOpen}
        onClose={() => setReconcileModalOpen(false)}
        title="Physical Inventory Stock Count Reconciliation"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setReconcileModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={reconcileForm.handleSubmit((values) => reconcileMutation.mutate(values))}
              isLoading={reconcileMutation.isPending}
            >
              Post Audit Adjustment
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={reconcileForm.handleSubmit((values) => reconcileMutation.mutate(values))}
        >
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Select Material *
            <select
              {...reconcileForm.register('materialId', { required: 'Material is required' })}
              className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
            >
              <option value="">-- Choose Material Item --</option>
              {materials.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.code} — {m.name} (System Stock: {m.currentStock || 0} {m.unit || 'units'})
                </option>
              ))}
            </select>
          </label>

          <Input
            label="Actual Physical Count Measured on Site *"
            type="number"
            min="0"
            step="any"
            placeholder="e.g. 48"
            {...reconcileForm.register('physicalCount', { required: 'Physical count is required' })}
            error={reconcileForm.formState.errors.physicalCount?.message}
          />

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Audit Reason / Discrepancy Justification
            <textarea
              rows={2}
              placeholder="e.g. Monthly physical stock verification conducted by Store Auditor..."
              {...reconcileForm.register('remarks')}
              className="rounded-lg border border-surface-border bg-white p-2 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </form>
      </Modal>
    </div>
  );
}
