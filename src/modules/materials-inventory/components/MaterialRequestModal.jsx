import React, { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardPen,
  Package,
  Calendar,
  AlertTriangle,
  Info,
  DollarSign,
  Layers,
  MapPin,
  Clock,
  User,
  CheckCircle,
} from 'lucide-react';
import { Modal, Button, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore } from '@/context/authStore';
import {
  materialsInventoryApi,
  UNIT_LABEL_MAP,
} from '../api/materialsInventoryApi';
import {
  materialRequestsApi,
  REQUEST_PRIORITIES,
} from '../api/materialRequestsApi';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { wbsScheduleApi } from '@/modules/wbs-schedule/api/wbsScheduleApi';
import { labourContractorsApi } from '@/modules/labour-contractors/api/labourContractorsApi';

export function MaterialRequestModal({
  open,
  onClose,
  initialMaterial = null,
  allMaterials = [],
  defaultProjectId = 1,
  onSuccess,
}) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const currentUser = useAuthStore((s) => s.user);

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const defaultRequiredDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + 3);
    return d.toISOString().slice(0, 10);
  }, []);

  const form = useForm({
    defaultValues: {
      projectId: String(defaultProjectId || 1),
      materialId: initialMaterial?.id ? String(initialMaterial.id) : '',
      requiredQty: '',
      requiredDate: defaultRequiredDate,
      priority: 'NORMAL',
      siteId: '',
      zone: '',
      wbsActivityId: '',
      contractorId: '',
      requestedBy: currentUser?.name || currentUser?.username || 'Site Engineer',
      remarks: '',
    },
  });

  const watchedProjectId = form.watch('projectId');
  const watchedMaterialId = form.watch('materialId');
  const watchedQty = form.watch('requiredQty');
  const watchedPriority = form.watch('priority');

  // Reset / sync form whenever modal opens or initialMaterial changes
  useEffect(() => {
    if (open) {
      const defaultMat = initialMaterial || allMaterials[0] || null;
      form.reset({
        projectId: String(defaultProjectId || 1),
        materialId: defaultMat?.id ? String(defaultMat.id) : '',
        requiredQty: '',
        requiredDate: defaultRequiredDate,
        priority: 'NORMAL',
        siteId: '',
        zone: '',
        wbsActivityId: '',
        contractorId: '',
        requestedBy: currentUser?.name || currentUser?.username || 'Site Engineer',
        remarks: '',
      });
    }
  }, [open, initialMaterial, allMaterials, defaultProjectId, defaultRequiredDate, currentUser, form]);

  // Selected material details
  const activeMaterial = useMemo(() => {
    if (initialMaterial && String(initialMaterial.id) === String(watchedMaterialId)) {
      return initialMaterial;
    }
    return allMaterials.find((m) => String(m.id) === String(watchedMaterialId)) || null;
  }, [initialMaterial, allMaterials, watchedMaterialId]);

  // Fetch projects dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-dropdown-list'],
    queryFn: () => projectsApi.list(),
    enabled: open,
    staleTime: 60_000,
  });

  // Fetch sites for the selected project
  const numericProjectId = Number(watchedProjectId) || 1;
  const { data: sites = [] } = useQuery({
    queryKey: ['sites-by-project', numericProjectId],
    queryFn: () => projectsApi.getSites(numericProjectId),
    enabled: open && Boolean(numericProjectId),
    staleTime: 60_000,
  });

  // Fetch WBS activities for the selected project
  const { data: wbsActivities = [] } = useQuery({
    queryKey: ['wbs-activities-project', numericProjectId],
    queryFn: () => wbsScheduleApi.list(numericProjectId),
    enabled: open && Boolean(numericProjectId),
    staleTime: 30_000,
  });

  // Fetch contractors for dropdown
  const { data: contractors = [] } = useQuery({
    queryKey: ['contractors-dropdown-list'],
    queryFn: () => labourContractorsApi.listContractors(),
    enabled: open,
    staleTime: 60_000,
  });

  // Calculations
  const numericQty = parseFloat(watchedQty) || 0;
  const currentStock = Number(activeMaterial?.currentStock ?? 0);
  const standardRate = Number(activeMaterial?.standardRate ?? 0);
  const estimatedCost = numericQty * standardRate;
  const unitLabel = activeMaterial ? UNIT_LABEL_MAP[activeMaterial.unit] || activeMaterial.unit : '';
  const exceedsStock = numericQty > 0 && currentStock > 0 && numericQty > currentStock;
  const isOutOfStock = currentStock === 0 && Boolean(activeMaterial);

  // Mutation
  const mutation = useMutation({
    mutationFn: async (values) => {
      const selectedSite = sites.find((s) => String(s.id) === String(values.siteId));
      const selectedWbs = wbsActivities.find((w) => String(w.id) === String(values.wbsActivityId));
      const selectedProj = projects.find((p) => String(p.id) === String(values.projectId));

      return materialRequestsApi.create({
        projectId: Number(values.projectId || 1),
        projectName: selectedProj?.name || 'Project 1',
        materialId: Number(values.materialId || activeMaterial?.id),
        materialCode: activeMaterial?.materialCode || '',
        materialName: activeMaterial?.name || '',
        unit: activeMaterial?.unit || 'BAGS',
        requiredQty: Number(values.requiredQty),
        requiredDate: values.requiredDate || null,
        priority: values.priority || 'NORMAL',
        siteId: values.siteId ? Number(values.siteId) : null,
        siteName: selectedSite?.name || '',
        wbsActivityId: values.wbsActivityId ? Number(values.wbsActivityId) : null,
        activityName: selectedWbs?.name || '',
        zone: values.zone?.trim() || null,
        contractorId: values.contractorId ? Number(values.contractorId) : null,
        requestedBy: values.requestedBy?.trim() || currentUser?.name || 'Site Engineer',
        remarks: values.remarks?.trim() || null,
      });
    },
    onSuccess: (created) => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      queryClient.invalidateQueries({ queryKey: ['material-requests-project'] });
      queryClient.invalidateQueries({ queryKey: ['materials-inventory'] });
      pushToast(
        `Material Request ${created.requestNumber || ''} submitted successfully for approval.`,
        'success'
      );
      form.reset();
      onSuccess?.(created);
      onClose();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to raise material request.', 'error');
    },
  });

  const onSubmit = (values) => {
    mutation.mutate(values);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-950/50 dark:text-brand-400">
            <ClipboardPen className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-ink-900">Raise Material Request (Site Indent)</h3>
            <p className="text-xs text-ink-500">
              Submit site material demand for engineering review & store fulfillment (FR-051)
            </p>
          </div>
        </div>
      }
      size="lg"
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="text-xs text-ink-500">
            {estimatedCost > 0 && (
              <span>
                Est. Value:{' '}
                <strong className="text-ink-900 font-semibold">
                  ₹{estimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </strong>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onClose} type="button">
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmit)}
              isLoading={mutation.isPending}
              className="flex items-center gap-1.5"
            >
              <CheckCircle className="h-4 w-4" />
              Submit Request
            </Button>
          </div>
        </div>
      }
    >
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4 py-1">
        {/* Row 1: Project & Priority */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">
              Project <span className="text-status-danger">*</span>
            </label>
            <select
              {...form.register('projectId', { required: 'Project is required' })}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.code || `PROJ-${p.id}`})
                  </option>
                ))
              ) : (
                <option value="1">Metro Rail Phase 2 (PROJ-001)</option>
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Urgency / Priority</label>
            <div className="flex items-center gap-1.5">
              {REQUEST_PRIORITIES.map((p) => {
                const isSelected = watchedPriority === p.value;
                return (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => form.setValue('priority', p.value)}
                    className={`flex-1 rounded-lg border py-1.5 text-center text-xs font-semibold transition-all ${
                      isSelected
                        ? `${p.badge} ring-1 ring-brand-500 shadow-sm`
                        : 'border-surface-border bg-surface-subtle text-ink-500 hover:bg-surface-card'
                    }`}
                  >
                    {p.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 2: Material Selection */}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">
            Select Material from Catalog <span className="text-status-danger">*</span>
          </label>
          <select
            {...form.register('materialId', { required: 'Material selection is required' })}
            className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">-- Choose Material Item --</option>
            {allMaterials.map((m) => (
              <option key={m.id} value={m.id}>
                {m.materialCode} - {m.name} ({m.category}) · Stock: {m.currentStock ?? 0} {UNIT_LABEL_MAP[m.unit] || m.unit}
              </option>
            ))}
          </select>
          {form.formState.errors.materialId && (
            <p className="mt-1 text-[11px] text-status-danger">
              {form.formState.errors.materialId.message}
            </p>
          )}
        </div>

        {/* Material Live Inventory & Rate Context Card */}
        {activeMaterial && (
          <div className="rounded-xl border border-surface-border bg-surface-subtle p-3 text-xs">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-400">Available Stock</span>
                <p className="mt-0.5 font-bold text-ink-900 text-sm">
                  {currentStock.toLocaleString()}{' '}
                  <span className="text-xs font-normal text-ink-500">{unitLabel}</span>
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-400">Standard Rate</span>
                <p className="mt-0.5 font-bold text-emerald-600 text-sm">
                  ₹{standardRate.toLocaleString('en-IN')}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-400">Reorder Threshold</span>
                <p className="mt-0.5 font-medium text-ink-700">
                  {activeMaterial.reorderLevel != null ? `${activeMaterial.reorderLevel} ${unitLabel}` : 'Not configured'}
                </p>
              </div>

              <div>
                <span className="text-[10px] uppercase font-semibold text-ink-400">Est. Total Cost</span>
                <p className="mt-0.5 font-bold text-brand-600 text-sm">
                  ₹{estimatedCost.toLocaleString('en-IN', { maximumFractionDigits: 0 })}
                </p>
              </div>
            </div>

            {/* Availability Alerts */}
            {isOutOfStock ? (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-status-danger/30 bg-status-dangerBg p-2 text-[11px] text-status-danger">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Store Zero Stock:</strong> This item currently has 0 stock in warehouse. Upon approval, an indent will be routed to procurement for Purchase Order generation.
                </span>
              </div>
            ) : exceedsStock ? (
              <div className="mt-2.5 flex items-center gap-1.5 rounded-lg border border-status-warning/30 bg-status-warningBg p-2 text-[11px] text-status-warning">
                <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>Partial Availability:</strong> Requested quantity ({numericQty} {unitLabel}) exceeds current on-hand stock ({currentStock} {unitLabel}). Remaining balance will trigger restock.
                </span>
              </div>
            ) : null}
          </div>
        )}

        {/* Row 3: Quantity & Required Date */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">
              Required Quantity <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="e.g. 50"
                {...form.register('requiredQty', {
                  required: 'Quantity is required',
                  min: { value: 0.01, message: 'Quantity must be greater than zero' },
                })}
                className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 pr-16 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              />
              <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-ink-400">
                {unitLabel || 'Units'}
              </span>
            </div>
            {form.formState.errors.requiredQty && (
              <p className="mt-1 text-[11px] text-status-danger">
                {form.formState.errors.requiredQty.message}
              </p>
            )}
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">
              Required On Site By Date <span className="text-status-danger">*</span>
            </label>
            <div className="relative">
              <input
                type="date"
                min={today}
                {...form.register('requiredDate', { required: 'Required date is required' })}
                className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
            {form.formState.errors.requiredDate && (
              <p className="mt-1 text-[11px] text-status-danger">
                {form.formState.errors.requiredDate.message}
              </p>
            )}
          </div>
        </div>

        {/* Row 4: Site Location & Specific Zone */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Site / Location</label>
            <select
              {...form.register('siteId')}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- General Site Store --</option>
              {sites.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.code || `SITE-${s.id}`})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Specific Zone / Pour Area</label>
            <input
              type="text"
              placeholder="e.g. Tower A - Level 3 Slab Grid C"
              {...form.register('zone')}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Row 5: WBS Task & Assigned Contractor */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">WBS Activity / Work Package</label>
            <select
              {...form.register('wbsActivityId')}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- Not tied to specific WBS task --</option>
              {wbsActivities.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.code ? `[${w.code}] ` : ''}{w.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-ink-700">Executing Contractor (Optional)</label>
            <select
              {...form.register('contractorId')}
              className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">-- No contractor assigned --</option>
              {contractors.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.contractorName || c.name || c.companyName} {c.contractorType ? `(${c.contractorType})` : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Row 6: Requested By */}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">Requested By (Site Engineer / Incharge)</label>
          <input
            type="text"
            {...form.register('requestedBy')}
            className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Row 7: Purpose & Specifications */}
        <div>
          <label className="mb-1 block text-xs font-medium text-ink-700">
            Purpose, Mix Specification & Site Notes
          </label>
          <textarea
            rows={2}
            placeholder="e.g. Required for night shift column casting. Grade 43 OPC in fresh condition."
            {...form.register('remarks')}
            className="w-full rounded-lg border border-surface-border bg-surface-base px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
