import { useEffect, useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill, Tabs, StatCard } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { procurementApi } from '../api/procurementApi';
import { supplierApi } from '../api/supplierApi';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { GrnListTab } from '../components/GrnListTab';
import { RecordGrnModal } from '../components/RecordGrnModal';
import { SupplierMasterTab } from '../components/SupplierMasterTab';
import { PurchaseOrderTrackingTab } from '../components/PurchaseOrderTrackingTab';
import { SupplierPerformanceTab } from '../components/SupplierPerformanceTab';
import {
  Truck,
  PackageCheck,
  AlertTriangle,
  Plus,
  FileCheck2,
  Boxes,
  DollarSign,
  ClipboardList,
  Building2,
  Award,
  Pencil,
  Trash2
} from 'lucide-react';

export function ProcurementListPage() {
  const [isPoModalOpen, setIsPoModalOpen] = useState(false);
  const [isGrnModalOpen, setIsGrnModalOpen] = useState(false);
  const [selectedPoForGrn, setSelectedPoForGrn] = useState(null);
  const [editingPo, setEditingPo] = useState(null);
  const [isSupplierModalOpen, setIsSupplierModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [selectedFulfillment, setSelectedFulfillment] = useState(null);
  const [selectedProjectId, setSelectedProjectId] = useState('');

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });

  useEffect(() => {
    if (!selectedProjectId && projects.length > 0) setSelectedProjectId(String(projects[0].id));
  }, [projects, selectedProjectId]);

  const projectId = Number(selectedProjectId || projects[0]?.id || 0);

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
      supplierId: '',
      projectId: projectId || '',
      materialId: '',
      amount: '',
      deliveryDate: new Date().toISOString().slice(0, 10),
      remarks: '',
    },
  });

  const supplierForm = useForm({
    defaultValues: { supplierCode: '', name: '', contactPerson: '', phone: '', email: '', gstin: '', address: '', status: 'ACTIVE' },
  });

  // Query: Purchase Orders
  const { data: purchaseOrders = [], isLoading: isLoadingPos } = useQuery({
    queryKey: ['procurement', projectId],
    queryFn: () => procurementApi.list({ projectId }),
    enabled: projectId > 0,
  });

  // Query: Goods Receipt Notes
  const { data: grns = [], isLoading: isLoadingGrns } = useQuery({
    queryKey: ['grns', projectId],
    queryFn: () => procurementApi.listGrns(projectId),
    enabled: projectId > 0,
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

  const enrichedPurchaseOrders = useMemo(() => purchaseOrders.map((po) => ({
    ...po,
    supplier: po.supplier || suppliers.find((supplier) => String(supplier.id) === String(po.supplierId))?.name,
    materialName: po.materialName || materials.find((material) => String(material.id) === String(po.materialId))?.name,
    orderedQty: po.orderedQty ?? po.orderQty,
  })), [purchaseOrders, suppliers, materials]);

  // Query: Projected Shortages (FR-056)
  const { data: projectedShortages = [], isLoading: isLoadingShortages } = useQuery({
    queryKey: ['projected-shortages', projectId],
    queryFn: () => procurementApi.getProjectedShortages(projectId),
    enabled: projectId > 0,
  });

  // Mutation: Create PO
  const createPoMutation = useMutation({
    mutationFn: ({ id, payload }) => id ? procurementApi.update(id, payload) : procurementApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      pushToast(editingPo ? 'Purchase Order updated successfully.' : 'Purchase Order created successfully.', 'success');
      setIsPoModalOpen(false);
      setEditingPo(null);
      poForm.reset({
        poNumber: `PO-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
        supplierId: '',
        projectId: projectId || '',
        materialId: '',
        amount: '',
        deliveryDate: new Date().toISOString().slice(0, 10),
        remarks: '',
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

  const deletePoMutation = useMutation({
    mutationFn: (id) => procurementApi.deletePurchaseOrder(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      pushToast('Purchase Order cancelled successfully.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to delete Purchase Order.', 'error'),
  });

  const poApprovalMutation = useMutation({
    mutationFn: ({ id, status }) => procurementApi.approve(id, { status, approvedBy: 'Current User' }),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      pushToast(`Purchase Order ${variables.status.toLowerCase()} successfully.`, 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to update PO approval.', 'error'),
  });

  const poStatusMutation = useMutation({
    mutationFn: ({ id, status }) => procurementApi.updateStatus(id, { status, updatedBy: 'Current User' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      pushToast('Purchase Order status updated.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to update PO status.', 'error'),
  });

  const supplierDeleteMutation = useMutation({
    mutationFn: (id) => supplierApi.remove(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      pushToast('Supplier deleted successfully.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to delete supplier.', 'error'),
  });

  const grnVoidMutation = useMutation({
    mutationFn: (id) => procurementApi.deleteGrn(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      queryClient.invalidateQueries({ queryKey: ['procurement'] });
      queryClient.invalidateQueries({ queryKey: ['materials'] });
      pushToast('GRN voided and stock reversal completed.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to void GRN.', 'error'),
  });

  const grnUpdateMutation = useMutation({
    mutationFn: ({ id, payload }) => procurementApi.updateGrn(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['grns'] });
      pushToast('GRN details updated successfully.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Unable to update GRN.', 'error'),
  });

  const handleCreatePoSubmit = (values) => {
    createPoMutation.mutate({ id: editingPo?.id, payload: {
      poNumber: values.poNumber,
      supplierId: Number(values.supplierId),
      projectId: Number(values.projectId || projectId),
      materialId: values.materialId ? Number(values.materialId) : null,
      amount: values.amount ? Number(values.amount) : null,
      deliveryDate: values.deliveryDate,
      remarks: values.remarks || null,
    } });
  };

  const handleEditPo = (po) => {
    setEditingPo(po);
    poForm.reset({
      poNumber: po.poNumber || '',
      supplierId: String(po.supplierId || ''),
      projectId: po.projectId || projectId,
      materialId: String(po.materialId || ''),
      amount: po.amount ?? '',
      deliveryDate: po.deliveryDate || new Date().toISOString().slice(0, 10),
      remarks: po.remarks || '',
    });
    setIsPoModalOpen(true);
  };

  const handleNewPo = () => {
    setEditingPo(null);
    poForm.reset({
      poNumber: `PO-${new Date().getFullYear()}-00${Math.floor(Math.random() * 90 + 10)}`,
      supplierId: '',
      projectId: projectId || '',
      materialId: '',
      amount: '',
      deliveryDate: new Date().toISOString().slice(0, 10),
      remarks: '',
    });
    setIsPoModalOpen(true);
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

  const handlePoApproval = (po, status) => {
    if (window.confirm(`Are you sure you want to mark ${po.poNumber || `PO-${po.id}`} as ${status}?`)) {
      poApprovalMutation.mutate({ id: po.id, status });
    }
  };

  const handlePoStatus = (po, status) => {
    if (window.confirm(`Update ${po.poNumber || `PO-${po.id}`} to ${status}?`)) {
      poStatusMutation.mutate({ id: po.id, status });
    }
  };

  const handleViewFulfillment = async (po) => {
    try {
      const data = await procurementApi.getFulfillment(po.id);
      setSelectedFulfillment({ po, data });
    } catch (err) {
      pushToast(err?.message || 'Unable to fetch PO fulfillment.', 'error');
    }
  };

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
          {canManage && <Button size="xs" variant="outline" onClick={() => handleOpenGrnForPo(row)} title="Record GRN" aria-label={`Record GRN for ${row.poNumber}`}><PackageCheck className="w-3.5 h-3.5" /></Button>}
          {canManage && <Button size="xs" variant="outline" onClick={() => handleEditPo(row)} title="Edit purchase order" aria-label={`Edit ${row.poNumber}`}><Pencil className="w-3.5 h-3.5" /></Button>}
          {canManage && <Button size="xs" variant="outline" onClick={() => { if (window.confirm(`Cancel ${row.poNumber || `PO-${row.id}`}?`)) deletePoMutation.mutate(row.id); }} title="Delete purchase order" aria-label={`Delete ${row.poNumber}`}><Trash2 className="w-3.5 h-3.5" /></Button>}
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
              <Button size="sm" onClick={handleNewPo}>
                <Plus className="w-4 h-4 mr-1 inline" />
                Add Purchase Order
              </Button>
            )}
          </div>
          <Table
            columns={poColumns}
            data={enrichedPurchaseOrders}
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
          purchaseOrders={enrichedPurchaseOrders}
          suppliers={suppliers}
          isLoading={isLoadingPos}
          canManage={canManage}
          onRecordGrn={handleOpenGrnForPo}
          onApprove={handlePoApproval}
          onUpdateStatus={handlePoStatus}
          onViewFulfillment={handleViewFulfillment}
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
          onVoid={(grn) => {
            if (window.confirm(`Void ${grn.grnNumber || `GRN-${grn.id}`}? This will reverse accepted stock.`)) grnVoidMutation.mutate(grn.id);
          }}
          onEdit={(id, payload) => grnUpdateMutation.mutateAsync({ id, payload })}
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
          onDelete={(supplier) => {
            if (window.confirm(`Delete supplier ${supplier.name}?`)) supplierDeleteMutation.mutate(supplier.id);
          }}
        />
      ),
    },
    {
      key: 'performance',
      label: (
        <span className="flex items-center gap-1.5">
          <Award className="h-4 w-4" />
          Supplier Performance
        </span>
      ),
      content: (
        <SupplierPerformanceTab
          suppliers={suppliers}
          purchaseOrders={enrichedPurchaseOrders}
          grns={grns}
          isLoading={isLoadingSuppliers || isLoadingPos || isLoadingGrns}
        />
      ),
    },
    {
      key: 'shortages',
      label: (
        <span className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-status-warning" />
          Projected Shortages
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
            Procurement & Suppliers
          </h1>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedProjectId}
            onChange={(event) => setSelectedProjectId(event.target.value)}
            disabled={isLoadingProjects || projects.length === 0}
            className="h-9 min-w-56 rounded-lg border border-surface-border bg-surface-base px-3 text-sm text-ink-900"
          >
            <option value="">{isLoadingProjects ? 'Loading projects...' : 'Select project'}</option>
            {projects.map((project) => <option key={project.id} value={project.id}>{project.code ? `${project.code} - ` : ''}{project.name}</option>)}
          </select>
          {canManage && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleNewPo}
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
      </div>

      {/* Main Tabbed Interface */}
      <Tabs items={tabItems} defaultKey="pos" />

      {/* Create Purchase Order Modal */}
      <Modal
        open={isPoModalOpen}
        onClose={() => { setIsPoModalOpen(false); setEditingPo(null); }}
        title={editingPo ? 'Edit Purchase Order (PO)' : 'Create Purchase Order (PO)'}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => { setIsPoModalOpen(false); setEditingPo(null); }}>
              Cancel
            </Button>
            <Button
              onClick={poForm.handleSubmit(handleCreatePoSubmit)}
              isLoading={createPoMutation.isPending}
            >
              {editingPo ? 'Save Changes' : 'Create PO'}
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
          <label className="flex flex-col gap-1.5 text-xs font-medium text-ink-700">
            Supplier / Vendor *
            <select
              className="h-10 rounded-lg border border-surface-border bg-surface-base px-3 text-sm text-ink-900"
              {...poForm.register('supplierId', { required: 'Please select a supplier' })}
            >
              <option value="">Select supplier from Supplier Master</option>
              {suppliers.map((supplier) => (
                <option key={supplier.id} value={supplier.id}>
                  {supplier.supplierCode} - {supplier.name}
                </option>
              ))}
            </select>
            {poForm.formState.errors.supplierId && (
              <span className="text-xs text-status-danger">{poForm.formState.errors.supplierId.message}</span>
            )}
          </label>
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Order Amount (₹)"
              type="number"
              placeholder="e.g. 150000"
              min="0"
              step="0.01"
              {...poForm.register('amount', { min: { value: 0, message: 'Amount cannot be negative' } })}
              error={poForm.formState.errors.amount?.message}
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

      <Modal
        open={Boolean(selectedFulfillment)}
        onClose={() => setSelectedFulfillment(null)}
        title={`PO Fulfillment - ${selectedFulfillment?.po?.poNumber || ''}`}
        size="md"
        footer={<Button variant="outline" onClick={() => setSelectedFulfillment(null)}>Close</Button>}
      >
        <div className="grid grid-cols-2 gap-3 text-sm text-ink-800">
          {Object.entries(selectedFulfillment?.data || {}).map(([key, value]) => (
            <div key={key} className="rounded-lg border border-surface-border bg-surface-subtle p-3">
              <span className="block text-xs font-medium uppercase tracking-wide text-ink-500">{key.replace(/[A-Z]/g, (letter) => ` ${letter}`).trim()}</span>
              <strong className="mt-1 block text-ink-900">{value == null ? '—' : String(value)}</strong>
            </div>
          ))}
        </div>
      </Modal>

      {/* Record Goods Receipt Note (GRN) Modal */}
      <RecordGrnModal
        open={isGrnModalOpen}
        onClose={() => {
          setIsGrnModalOpen(false);
          setSelectedPoForGrn(null);
        }}
        defaultPo={selectedPoForGrn}
        projectId={projectId}
        purchaseOrders={enrichedPurchaseOrders}
        materials={materials}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['grns'] });
          queryClient.invalidateQueries({ queryKey: ['procurement'] });
        }}
      />
    </div>
  );
}
