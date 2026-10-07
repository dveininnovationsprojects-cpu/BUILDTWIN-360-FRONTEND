import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill, Tabs, StatCard } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { procurementApi } from '../api/procurementApi';
import { supplierApi } from '../api/supplierApi';
import { GrnListTab } from '../components/GrnListTab';
import { RecordGrnModal } from '../components/RecordGrnModal';
import { SupplierMasterTab } from '../components/SupplierMasterTab';
import { PurchaseOrderTrackingTab } from '../components/PurchaseOrderTrackingTab';
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  Plus,
  FileCheck2,
  Boxes,
  DollarSign,
  ClipboardList,
  Building2
} from 'lucide-react';

export function ProcurementListPage() {
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedPoForGrn, setSelectedPoForGrn] = useState(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.PROCUREMENT_STORE,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  // Form for Creating Purchase Order
  const poForm = useForm({
    defaultValues: {
      poNumber: `PO-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
      supplier: '',
      supplierId: 1,
      projectId: 1,
      amount: '',
      deliveryDate: new Date().toISOString().slice(0, 10),
      status: 'ISSUED',
    },
  });

  const supplierForm = useForm({
    defaultValues: { supplierCode: '', name: '', contactPerson: '', phone: '', email: '', gstin: '', address: '', status: 'ACTIVE' },
  });

  // Query: Purchase Orders
  const { data: purchaseOrders = [], isLoading: isLoadingPos } = useQuery({
    queryKey: ['procurement'],
    queryFn: () => procurementApi.list(),
  });

  // Query: Goods Receipt Notes
  const { data: grns = [], isLoading: isLoadingGrns } = useQuery({
    queryKey: ['grns'],
    queryFn: () => procurementApi.listGrns(),
  });

  // Query: Materials Master
  const { data: materials = [] } = useQuery({
    queryKey: ['materials'],
    queryFn: () => procurementApi.listMaterials(),
  });

  const { data: suppliers = [], isLoading: isLoadingSuppliers } = useQuery({
    queryKey: ['suppliers'],
    queryFn: () => supplierApi.list(),
  });

  // Query: Projected Shortages (FR-056)
  const { data: projectedShortages = [], isLoading: isLoadingShortages } = useQuery({
    queryKey: ['projected-shortages'],
    queryFn: () => procurementApi.getProjectedShortages(1),
  });

  // Mutation: Create PO
  const createPoMutation = useMutation({
    mutationFn: (payload) => procurementApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      pushToast('Purchase Order created successfully.', 'success');
      setIsPoModalOpen(false);
      poForm.reset({
        poNumber: `PO-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
        supplier: '',
        supplierId: 1,
        projectId: 1,
        amount: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        status: 'ISSUED',
      });
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to create Purchase Order.', 'error');
    },
  });

  const saveSupplierMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? supplierApi.update(id, payload) : supplierApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      pushToast(editingSupplier ? 'Supplier updated successfully.' : 'Supplier registered successfully.', 'success');
      setIsSupplierModalOpen(false);
      setEditingSupplier(null);
      supplierForm.reset({ supplierCode: '', name: '', contactPerson: '', phone: '', email: '', gstin: '', address: '', status: 'ACTIVE' });
    },
    onError: (err) => pushToast(err?.message || 'Failed to save supplier.', 'error'),
  });

  const handleCreatePoSubmit = (values) => {
    createPoMutation.mutate({
      poNumber: values.poNumber,
      supplier: values.supplier,
      supplierId: Number(values.supplierId || 1),
      projectId: Number(values.projectId || 1),
      amount: values.amount ? Number(values.amount) : 0,
      deliveryDate: values.deliveryDate,
      status: values.status || 'ISSUED',
    });
  };

  const handleOpenGrnForPo = (po) => {
    setSelectedPoForGrn(po);
    setIsGrnModalOpen(true);
  };

  const handleAddSupplier = () => {
    setEditingSupplier(null);
    supplierForm.reset({ supplierCode: '', name: '', contactPerson: '', phone: '', email: '', gstin: '', address: '', status: 'ACTIVE' });
    setIsSupplierModalOpen(true);
  };

  const handleEditSupplier = (supplier) => {
    setEditingSupplier(supplier);
    supplierForm.reset({ supplierCode: supplier.supplierCode || '', name: supplier.name || '', contactPerson: supplier.contactPerson || '', phone: supplier.phone || '', email: supplier.email || '', gstin: supplier.gstin || '', address: supplier.address || '', status: supplier.status || 'ACTIVE' });
    setIsSupplierModalOpen(true);
  };

  const handleSupplierSubmit = (values) => saveSupplierMutation.mutate({ id: editingSupplier?.id, payload: values });

  // PO Table Columns
  const poColumns = [
    {
      key: 'poNumber',
      header: 'PO Number',
      render: (row) => (
        <span className="font-semibold text-brand-900 font-mono text-xs">
          {row.poNumber || `PO-${row.id}`}
        </span>
      ),
    },
    {
      key: 'supplier',
      header: 'Supplier / Vendor',
      render: (row) => <span className="font-medium text-ink-900 text-xs">{row.supplier || 'Vendor'}</span>,
    },
    {
      key: 'deliveryDate',
      header: 'Expected Delivery',
      render: (row) => <span className="text-xs text-ink-700">{row.deliveryDate || '—'}</span>,
    },
    {
      key: 'amount',
      header: 'Order Amount',
      render: (row) => (
        <span className="text-xs font-semibold text-ink-900">
          {row.amount ? `₹${Number(row.amount).toLocaleString('en-IN')}` : '—'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'PO Status',
      render: (row) => <StatusPill status={row.status || 'PENDING'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          {canManage && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => handleOpenGrnForPo(row)}
              className="text-brand-700 border-brand-300 hover:bg-brand-50"
            >
              <PackageCheck className="w-3.5 h-3.5 mr-1 inline" />
              Record GRN
            </Button>
          )}
        </div>
      ),
    },
  ];

  // Projected Shortages Table Columns
  const shortageColumns = [
    { key: 'materialCode', header: 'Material SKU', render: (r) => <span className="font-mono text-xs font-semibold">{r.materialCode}</span> },
    { key: 'materialName', header: 'Material Name', render: (r) => <span className="text-xs font-medium">{r.materialName}</span> },
    { key: 'currentStock', header: 'Warehouse Stock', render: (r) => <span className="text-xs font-bold text-ink-900">{r.currentStock} {r.unit}</span> },
    { key: 'reorderLevel', header: 'Reorder Level', render: (r) => <span className="text-xs text-ink-600">{r.reorderLevel} {r.unit}</span> },
    { key: 'totalRequestedQty', header: 'Site Requests', render: (r) => <span className="text-xs font-medium text-brand-700">{r.totalRequestedQty} {r.unit}</span> },
    {
      key: 'projectedShortage',
      header: 'Projected Shortage',
      render: (r) => (
        Number(r.projectedShortage) > 0 ? (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-status-danger/15 text-status-danger">
            -{r.projectedShortage} {r.unit}
          </span>
        ) : (
          <span className="text-status-success text-xs font-medium">None</span>
        )
      ),
    },
    {
      key: 'status',
      header: 'Stock Health',
      render: (r) => {
        if (r.status === 'SHORTAGE') return <StatusPill status="CRITICAL" label="SHORTAGE" />;
        if (r.status === 'LOW_STOCK') return <StatusPill status="WARNING" label="LOW STOCK" />;
        return <StatusPill status="SUCCESS" label="OPTIMAL" />;
      },
    },
  ];

  // Tab definitions
  const tabItems = [
    {
      key: 'pos',
      label: (
        <span className="flex items-center gap-1.5">
          <Truck className="w-4 h-4" />
          Purchase Orders ({purchaseOrders.length})
        </span>
      ),
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-500">
              Track vendor purchase orders, committed delivery dates, and issue Goods Receipt Notes upon site arrival.
            </p>
            {canManage && (
              <Button size="sm" onClick={() => setIsPoModalOpen(true)}>
                <Plus className="w-4 h-4 mr-1 inline" />
                Add Purchase Order
              </Button>
            )}
          </div>
          <Table
            columns={poColumns}
            data={purchaseOrders}
            rowKey={(row) => row.id}
            isLoading={isLoadingPos}
          />
        </div>
      ),
    },
    {
      key: 'tracking',
      label: (
        <span className="flex items-center gap-1.5">
          <Truck className="h-4 w-4" />
          PO Tracking
        </span>
      ),
      content: (
        <PurchaseOrderTrackingTab
          purchaseOrders={purchaseOrders}
          suppliers={suppliers}
          isLoading={isLoadingPos}
          canManage={canManage}
          onRecordGrn={handleOpenGrnForPo}
        />
      ),
    },
    {
      key: 'grn',
      label: (
        <span className="flex items-center gap-1.5">
          <PackageCheck className="w-4 h-4 text-brand-600" />
          Goods Receipt Notes (GRN) ({grns.length})
        </span>
      ),
      content: (
        <GrnListTab
          grns={grns}
          isLoading={isLoadingGrns}
          canManage={canManage}
          onRecordGrn={() => {
            setSelectedPoForGrn(null);
            setIsGrnModalOpen(true);
          }}
        />
      ),
    },
    {
      key: 'suppliers',
      label: (
        <span className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4" />
          Supplier Master ({suppliers.length})
        </span>
      ),
      content: (
        <SupplierMasterTab
          suppliers={suppliers}
          isLoading={isLoadingSuppliers}
          canManage={canManage}
          onAdd={handleAddSupplier}
          onEdit={handleEditSupplier}
        />
      ),
    },
    {
      key: 'shortages',
      label: (
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-status-warning" />
          Projected Shortages (FR-056)
        </span>
      ),
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-subtle border border-surface-border text-xs text-ink-700">
            <ClipboardList className="w-5 h-5 text-brand-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-ink-900">Projected Material Shortage Intelligence: </span>
              Matches active approved site material requests against live warehouse inventory. When requested quantity exceeds stock,
              a shortage alert is flagged so purchase orders and GRN deliveries can be expedited before site work is halted.
            </div>
          </div>
          <Table
            columns={shortageColumns}
            data={projectedShortages}
            rowKey={(row) => row.materialId || row.materialCode}
            isLoading={isLoadingShortages}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-surface-border pb-4">
        <div>
          <h1 className="page-heading flex items-center gap-2">
            <Truck className="w-6 h-6 text-brand-600" />
            Procurement & Goods Receipt (GRN)
          </h1>
          <p className="text-xs text-ink-500 mt-1">
            Supplier management, PO tracking, delivery verification, and automated stock ledger inwarding (FR-051 to FR-056, FR-061).
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPoModalOpen(true)}
            >
              <Plus className="w-4 h-4 mr-1 inline" />
              New PO
            </Button>
            <Button
              size="sm"
              onClick={() => {
                setSelectedPoForGrn(null);
                setIsGrnModalOpen(true);
              }}
            >
              <PackageCheck className="w-4 h-4 mr-1.5 inline" />
              Record GRN
            </Button>
          </div>
        )}
      </div>

      {/* Main Tabbed Interface */}
      <Tabs items={tabItems} defaultKey="pos" />

      {/* Create Purchase Order Modal */}
      <Modal
        open={isPoModalOpen}
        onClose={() => setIsPoModalOpen(false)}
        title="Create Purchase Order (PO)"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsPoModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={poForm.handleSubmit(handleCreatePoSubmit)}
              isLoading={createPoMutation.isPending}
            >
              Create PO
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4 text-ink-900" onSubmit={poForm.handleSubmit(handleCreatePoSubmit)}>
          <Input
            label="PO Number *"
            placeholder="e.g. PO-2026-005"
            {...poForm.register('poNumber', { required: 'PO number is required' })}
            error={poForm.formState.errors.poNumber?.message}
          />
          <Input
            label="Supplier / Vendor Name *"
            placeholder="e.g. UltraTech Cement Distributors"
            {...poForm.register('supplier', { required: 'Supplier is required' })}
            error={poForm.formState.errors.supplier?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Order Amount (₹)"
              type="number"
              placeholder="e.g. 150000"
              {...poForm.register('amount')}
            />
            <Input
              label="Expected Delivery Date *"
              type="date"
              {...poForm.register('deliveryDate', { required: 'Delivery date is required' })}
              error={poForm.formState.errors.deliveryDate?.message}
            />
          </div>
        </form>
      </Modal>

      <Modal
        open={isSupplierModalOpen}
        onClose={() => { setIsSupplierModalOpen(false); setEditingSupplier(null); }}
        title={editingSupplier ? 'Edit Supplier Profile' : 'Register Supplier'}
        size="md"
        footer={(
          <>
            <Button variant="outline" onClick={() => { setIsSupplierModalOpen(false); setEditingSupplier(null); }}>Cancel</Button>
            <Button onClick={supplierForm.handleSubmit(handleSupplierSubmit)} isLoading={saveSupplierMutation.isPending}>
              {editingSupplier ? 'Save Changes' : 'Register Supplier'}
            </Button>
          </>
        )}
      >
        <form className="flex flex-col gap-4 text-ink-900" onSubmit={supplierForm.handleSubmit(handleSupplierSubmit)}>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Supplier Code *" placeholder="e.g. SUP-1003" {...supplierForm.register('supplierCode', { required: 'Supplier code is required' })} error={supplierForm.formState.errors.supplierCode?.message} disabled={Boolean(editingSupplier)} />
            <Input label="Company / Trade Name *" placeholder="e.g. ABC Building Supplies" {...supplierForm.register('name', { required: 'Supplier name is required' })} error={supplierForm.formState.errors.name?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Contact Person" placeholder="Primary contact" {...supplierForm.register('contactPerson')} />
            <Input label="Phone *" placeholder="e.g. +919876543210" {...supplierForm.register('phone', { required: 'Phone is required' })} error={supplierForm.formState.errors.phone?.message} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input label="Email" type="email" placeholder="accounts@supplier.com" {...supplierForm.register('email')} />
            <Input label="GSTIN" placeholder="15-character GSTIN" {...supplierForm.register('gstin')} />
          </div>
          <Input label="Registered Address" placeholder="Business address" {...supplierForm.register('address')} />
          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-700">
            Status
            <select className="h-10 rounded-lg border border-surface-border bg-surface-base px-3 text-sm text-ink-900" {...supplierForm.register('status')}>
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </label>
        </form>
      </Modal>

      {/* Record Goods Receipt Note (GRN) Modal */}
      <RecordGrnModal
        open={isGrnModalOpen}
        onClose={() => {
          setIsGrnModalOpen(false);
          setSelectedPoForGrn(null);
        }}
        defaultPo={selectedPoForGrn}
        purchaseOrders={purchaseOrders}
        materials={materials}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['grns'] });
          queryClient.invalidateQueries({ queryKey: ['procurement'] });
        }}
      />
    </div>
  );
}
