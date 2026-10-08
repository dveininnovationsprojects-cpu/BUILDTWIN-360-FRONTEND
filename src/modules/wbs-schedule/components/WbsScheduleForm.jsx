import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Calendar } from 'lucide-react';
import { Button, Input, Select, Textarea } from '@/design-system';
import { WBS_DISCIPLINES, WBS_STATUSES } from '../constants/wbsConstants';

export function WbsScheduleForm({
  onSubmit,
  onCancel,
  isSubmitting,
  mode = 'add',
  initialData = null,
  sites = [],
}) {
  const isEditMode = mode === 'edit';

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
    setValue,
  } = useForm({
    mode: 'onBlur',
    defaultValues: {
      siteId: '',
      code: '',
      name: '',
      discipline: 'CIVIL',
      status: 'PLANNED',
      plannedStartDate: '',
      plannedEndDate: '',
      actualStartDate: '',
      actualEndDate: '',
      budgetAmount: '',
      assignedContractor: '',
      inchargeUserId: '',
      description: '',
    },
  });

  useEffect(() => {
    if (initialData) {
      reset({
        siteId: initialData.siteId != null ? String(initialData.siteId) : '',
        code: initialData.code || initialData.wbsCode || '',
        name: initialData.name || '',
        discipline: (initialData.discipline || 'CIVIL').toUpperCase(),
        status: (initialData.status || 'PLANNED').toUpperCase(),
        plannedStartDate: initialData.plannedStartDate || initialData.startDate || '',
        plannedEndDate: initialData.plannedEndDate || initialData.endDate || '',
        actualStartDate: initialData.actualStartDate || '',
        actualEndDate: initialData.actualEndDate || '',
        budgetAmount: initialData.budgetAmount != null && initialData.budgetAmount !== 0 ? String(initialData.budgetAmount) : '',
        assignedContractor: initialData.assignedContractor || '',
        inchargeUserId: initialData.inchargeUserId != null ? String(initialData.inchargeUserId) : '',
        description: initialData.description || '',
      });
    } else {
      reset({
        siteId: '',
        code: '',
        name: '',
        discipline: 'CIVIL',
        status: 'PLANNED',
        plannedStartDate: '',
        plannedEndDate: '',
        actualStartDate: '',
        actualEndDate: '',
        budgetAmount: '',
        assignedContractor: '',
        inchargeUserId: '',
        description: '',
      });
    }
  }, [initialData, reset]);

  const startDate = watch('plannedStartDate');
  const endDate = watch('plannedEndDate');

  // Calculate duration display if dates are set
  let durationDays = null;
  if (startDate && endDate) {
    const diff = Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24));
    if (diff >= 0) durationDays = diff + 1;
  }

  async function handleFormSubmit(values) {
    const payload = {
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      siteId: values.siteId ? Number(values.siteId) : null,
      budgetAmount: values.budgetAmount ? Number(values.budgetAmount) : null,
      inchargeUserId: values.inchargeUserId ? Number(values.inchargeUserId) : null,
      assignedContractor: values.assignedContractor ? values.assignedContractor.trim() : null,
      actualStartDate: values.actualStartDate || null,
      actualEndDate: values.actualEndDate || null,
    };
    await onSubmit(payload);
  }

  const siteOptions = [
    { value: '', label: 'None (Project-wide package)' },
    ...sites.map((s) => ({ value: String(s.id), label: `${s.code} - ${s.name}` })),
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2.5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
        {/* Work Package Code */}
        <Input
          label="Work Package Code *"
          placeholder="e.g. WP-CIV-01 or WP-MEP-03"
          error={errors.code?.message}
          disabled={isSubmitting}
          {...register('code', {
            required: 'Work package code is required',
            pattern: {
              value: /^[a-zA-Z0-9.\-_/ ]+$/,
              message: 'Code can contain letters, numbers, hyphens, and dots',
            },
          })}
        />

        {/* Work Package Title */}
        <Input
          label="Package Title / Scope *"
          placeholder="e.g. Substructure & RCC Piling Works"
          error={errors.name?.message}
          disabled={isSubmitting}
          {...register('name', {
            required: 'Work package title is required',
            minLength: { value: 3, message: 'Title must be at least 3 characters' },
          })}
        />

        {/* Trade Discipline */}
        <Select
          label="Trade / Discipline *"
          options={WBS_DISCIPLINES}
          error={errors.discipline?.message}
          disabled={isSubmitting}
          {...register('discipline', { required: 'Discipline is required' })}
        />

        {/* Execution Status */}
        <Select
          label="Execution Status *"
          options={WBS_STATUSES}
          error={errors.status?.message}
          disabled={isSubmitting}
          {...register('status', { required: 'Status is required' })}
        />

        {/* Site / Tower */}
        <Select
          label="Assigned Site / Tower (Optional)"
          options={siteOptions}
          disabled={isSubmitting}
          {...register('siteId')}
        />

        {/* Budget Allocation */}
        <Input
          label="Budget Allocation (₹)"
          type="number"
          placeholder="e.g. 5000000"
          error={errors.budgetAmount?.message}
          disabled={isSubmitting}
          {...register('budgetAmount', {
            min: { value: 0, message: 'Budget cannot be negative' },
          })}
        />

        {/* Assigned Contractor */}
        <Input
          label="Assigned Contractor Firm"
          placeholder="e.g. L&T GeoStructure, Voltas MEP"
          disabled={isSubmitting}
          {...register('assignedContractor')}
        />

        {/* Incharge User ID */}
        <Input
          label="Incharge Engineer / User ID"
          type="number"
          placeholder="e.g. 1"
          disabled={isSubmitting}
          {...register('inchargeUserId')}
        />
      </div>

      {/* Schedule & Timeline */}
      <div className="rounded-xl border border-surface-border/80 bg-surface-subtle/50 p-2.5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-ink-600">
            <Calendar className="h-3.5 w-3.5 text-brand-500" />
            <span>Schedule & Timeline</span>
          </div>
          {durationDays != null && (
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 border border-brand-200">
              Planned Duration: {durationDays} day{durationDays !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          <Input
            label="Planned Start Date *"
            type="date"
            error={errors.plannedStartDate?.message}
            disabled={isSubmitting}
            {...register('plannedStartDate', {
              required: 'Planned start date is required',
            })}
          />
          <Input
            label="Planned End Date *"
            type="date"
            error={errors.plannedEndDate?.message}
            disabled={isSubmitting}
            {...register('plannedEndDate', {
              required: 'Planned end date is required',
            })}
          />
          <Input
            label="Actual Start Date"
            type="date"
            disabled={isSubmitting}
            {...register('actualStartDate')}
          />
          <Input
            label="Actual Completion"
            type="date"
            disabled={isSubmitting}
            {...register('actualEndDate')}
          />
        </div>
      </div>

      {/* Description / Scope */}
      <Textarea
        label="Detailed Scope Description"
        placeholder="Enter technical work package scope, specifications, milestone dependencies..."
        rows={2}
        className="min-h-[48px] h-[48px] resize-y"
        disabled={isSubmitting}
        {...register('description')}
      />

      {/* Form Actions */}
      <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-surface-border">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isEditMode ? 'Update Work Package' : 'Create Work Package'}
        </Button>
      </div>
    </form>
  );
}
