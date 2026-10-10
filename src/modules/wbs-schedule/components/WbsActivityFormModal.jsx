import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/design-system';
import {
  WBS_DISCIPLINES,
  WBS_STATUSES,
  WBS_UOMS,
} from '../constants/wbsConstants';

export function WbsActivityFormModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  workPackages = [],
  activities = [],
  initialData = null,
  selectedWorkPackageId = null,
}) {
  const isEdit = Boolean(initialData?.id);

  const [workPackageId, setWorkPackageId] = useState(
    selectedWorkPackageId || workPackages[0]?.id || ''
  );
  const [parentId, setParentId] = useState('');
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [discipline, setDiscipline] = useState('CIVIL');
  const [description, setDescription] = useState('');
  const [uom, setUom] = useState('CUM');
  const [plannedQuantity, setPlannedQuantity] = useState('');
  const [plannedStartDate, setPlannedStartDate] = useState('');
  const [plannedEndDate, setPlannedEndDate] = useState('');
  const [status, setStatus] = useState('PLANNED');
  const [assignedContractor, setAssignedContractor] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setWorkPackageId(initialData.workPackageId ? String(initialData.workPackageId) : selectedWorkPackageId || '');
      setParentId(initialData.parentId ? String(initialData.parentId) : '');
      setCode(initialData.code || '');
      setName(initialData.name || '');
      setDiscipline(initialData.discipline || 'CIVIL');
      setDescription(initialData.description || '');
      setUom(initialData.uom || 'CUM');
      setPlannedQuantity(initialData.plannedQuantity != null ? String(initialData.plannedQuantity) : '');
      setPlannedStartDate(initialData.plannedStartDate || '');
      setPlannedEndDate(initialData.plannedEndDate || '');
      setStatus(initialData.status || 'PLANNED');
      setAssignedContractor(initialData.assignedContractor || '');
    } else {
      setWorkPackageId(selectedWorkPackageId ? String(selectedWorkPackageId) : workPackages[0]?.id ? String(workPackages[0].id) : '');
      setParentId('');
      setCode(`ACT-${discipline.substring(0, 3)}-${String(Math.floor(100 + Math.random() * 900))}`);
      setName('');
      setDiscipline('CIVIL');
      setDescription('');
      setUom('CUM');
      setPlannedQuantity('');
      setPlannedStartDate('');
      setPlannedEndDate('');
      setStatus('PLANNED');
      setAssignedContractor('');
    }
    setErrors({});
  }, [initialData, open, selectedWorkPackageId, workPackages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};

    if (!code.trim()) errs.code = 'Activity code is required';
    if (!name.trim()) errs.name = 'Activity name is required';
    if (!uom) errs.uom = 'UOM is required';
    if (!plannedQuantity || Number(plannedQuantity) <= 0) {
      errs.plannedQuantity = 'Planned quantity must be greater than 0';
    }
    if (!workPackageId) {
      errs.workPackageId = 'Please select a parent Work Package';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    const payload = {
      workPackageId: Number(workPackageId),
      parentId: parentId ? Number(parentId) : null,
      code: code.trim().toUpperCase(),
      name: name.trim(),
      discipline,
      description: description.trim(),
      uom,
      plannedQuantity: Number(plannedQuantity),
      plannedStartDate: plannedStartDate || null,
      plannedEndDate: plannedEndDate || null,
      status,
      assignedContractor: assignedContractor.trim() || null,
    };

    onSubmit(payload);
  };

  // Potential parent tasks (exclude self if in edit mode)
  const availableParents = activities.filter((a) => !isEdit || String(a.id) !== String(initialData?.id));

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title={isEdit ? 'Edit WBS Activity' : 'Create Construction WBS Activity'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2.5 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            isLoading={isSubmitting}
          >
            {isEdit ? 'Save Changes' : 'Create Activity'}
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {/* Work Package Selector */}
          <div>
            <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
              Target Work Package *
            </label>
            <select
              value={workPackageId}
              onChange={(e) => setWorkPackageId(e.target.value)}
              disabled={isEdit}
              className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
            >
              <option value="">Select Work Package</option>
              {workPackages.map((wp) => (
                <option key={wp.id} value={wp.id}>
                  {wp.code} - {wp.name}
                </option>
              ))}
            </select>
            {errors.workPackageId && (
              <p className="mt-1 text-[11px] text-rose-500">{errors.workPackageId}</p>
            )}
          </div>

          {/* Optional Parent Activity for Sub-tasks */}
          <div>
            <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
              Parent Task (Optional for Sub-Task hierarchy)
            </label>
            <select
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
            >
              <option value="">None (Top-Level Activity)</option>
              {availableParents.map((act) => (
                <option key={act.id} value={act.id}>
                  {act.code} - {act.name}
                </option>
              ))}
            </select>
          </div>

          {/* Code */}
          <div>
            <Input
              label="Activity Code *"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ACT-CIV-004"
              error={errors.code}
            />
          </div>

          {/* Discipline */}
          <div>
            <Select
              label="Trade Discipline *"
              value={discipline}
              onChange={(e) => setDiscipline(e.target.value)}
              options={WBS_DISCIPLINES}
            />
          </div>

          {/* Name */}
          <div className="md:col-span-2">
            <Input
              label="Activity / Task Scope Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Column Starter, Rebar Tying & Formwork Stripping"
              error={errors.name}
            />
          </div>

          {/* UOM */}
          <div>
            <Select
              label="Unit of Measure (UOM) *"
              value={uom}
              onChange={(e) => setUom(e.target.value)}
              options={WBS_UOMS}
            />
          </div>

          {/* Planned Quantity */}
          <div>
            <Input
              label="Planned BOQ Quantity *"
              type="number"
              step="0.01"
              value={plannedQuantity}
              onChange={(e) => setPlannedQuantity(e.target.value)}
              placeholder="e.g. 250.0"
              error={errors.plannedQuantity}
            />
          </div>

          {/* Planned Start */}
          <div>
            <Input
              label="Planned Start Date"
              type="date"
              value={plannedStartDate}
              onChange={(e) => setPlannedStartDate(e.target.value)}
            />
          </div>

          {/* Planned End */}
          <div>
            <Input
              label="Planned End Date"
              type="date"
              value={plannedEndDate}
              onChange={(e) => setPlannedEndDate(e.target.value)}
            />
          </div>

          {/* Status */}
          <div>
            <Select
              label="Status"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              options={WBS_STATUSES}
            />
          </div>

          {/* Assigned Contractor */}
          <div>
            <Input
              label="Assigned Contractor Name"
              value={assignedContractor}
              onChange={(e) => setAssignedContractor(e.target.value)}
              placeholder="e.g. Apex Infra Contractors"
            />
          </div>

          {/* Description */}
          <div className="md:col-span-2">
            <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
              Detailed Scope Description
            </label>
            <textarea
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Engineering specifications, tolerances, or safety requirements..."
              className="w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
