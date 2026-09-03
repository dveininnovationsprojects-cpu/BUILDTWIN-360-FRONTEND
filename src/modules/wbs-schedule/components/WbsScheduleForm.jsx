import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Input, Select, Textarea } from '@/design-system';

const DISCIPLINES = [
  { value: 'civil', label: 'Civil' },
  { value: 'structural', label: 'Structural' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'mechanical', label: 'Mechanical' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'hvac', label: 'HVAC' },
  { value: 'finishing', label: 'Finishing' },
  { value: 'general', label: 'General' },
];

const STATUSES = [
  { value: 'planned', label: 'Planned' },
  { value: 'in-progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
  { value: 'on-hold', label: 'On Hold' },
];

export function WbsScheduleForm({ 
  onSubmit, 
  onCancel, 
  isSubmitting,
  mode = 'add',
  initialData = null 
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm({
    mode: 'onBlur',
    defaultValues: initialData ? {
      wbsCode: initialData.wbsCode || '',
      name: initialData.name || '',
      discipline: initialData.discipline || 'general',
      status: initialData.status || 'planned',
      description: initialData.description || '',
      startDate: initialData.startDate || '',
      endDate: initialData.endDate || '',
      duration: initialData.duration || '',
    } : {
      wbsCode: '',
      name: '',
      discipline: 'general',
      status: 'planned',
      description: '',
      startDate: '',
      endDate: '',
      duration: '',
    },
  });

  async function handleFormSubmit(formData) {
    try {
      await onSubmit(formData);
      if (mode === 'add') {
        reset();
      }
    } catch (error) {
      // Error is handled by parent component
      console.error('Form submission error:', error);
    }
  }

  const isEditMode = mode === 'edit';
  const submitButtonLabel = isSubmitting 
    ? (isEditMode ? 'Updating...' : 'Creating...') 
    : (isEditMode ? 'Update Activity' : 'Create Activity');

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-2 overflow-hidden">
      <div className="grid grid-cols-1 gap-2 md:grid-cols-2 overflow-hidden">
        {/* WBS Code */}
        <Input
          label="WBS Code"
          placeholder="e.g., 1.1.1"
          error={errors.wbsCode?.message}
          disabled={isSubmitting || isEditMode}
          {...register('wbsCode', {
            required: 'WBS Code is required',
            pattern: {
              value: /^[\d.]+$/,
              message: 'WBS Code should contain only numbers and dots',
            },
          })}
        />

        {/* Activity Name */}
        <Input
          label="Activity Name"
          placeholder="Enter activity name"
          error={errors.name?.message}
          disabled={isSubmitting}
          {...register('name', {
            required: 'Activity name is required',
            minLength: { value: 3, message: 'Name must be at least 3 characters' },
          })}
        />

        {/* Discipline */}
        <Select
          label="Discipline"
          placeholder="Select discipline"
          options={DISCIPLINES}
          error={errors.discipline?.message}
          disabled={isSubmitting}
          {...register('discipline', { required: 'Discipline is required' })}
        />

        {/* Status */}
        <Select
          label="Status"
          placeholder="Select status"
          options={STATUSES}
          error={errors.status?.message}
          disabled={isSubmitting}
          {...register('status', { required: 'Status is required' })}
        />

        {/* Start Date */}
        <Input
          label="Start Date"
          type="date"
          error={errors.startDate?.message}
          disabled={isSubmitting}
          {...register('startDate', {
            required: 'Start date is required',
          })}
        />

        {/* End Date */}
        <Input
          label="End Date"
          type="date"
          error={errors.endDate?.message}
          disabled={isSubmitting}
          {...register('endDate', {
            required: 'End date is required',
          })}
        />

        {/* Duration */}
        <Input
          label="Duration (days)"
          type="number"
          placeholder="0"
          error={errors.duration?.message}
          disabled={isSubmitting}
          {...register('duration', {
            required: 'Duration is required',
            min: { value: 1, message: 'Duration must be at least 1 day' },
          })}
        />
      </div>

      {/* Description */}
      <Textarea
        label="Description"
        placeholder="Enter activity description"
        rows={1}
        error={errors.description?.message}
        disabled={isSubmitting}
        {...register('description', {
          maxLength: { value: 500, message: 'Description cannot exceed 500 characters' },
        })}
      />

      {/* Form Actions */}
      <div className="flex gap-3 justify-end pt-1">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {submitButtonLabel}
        </Button>
      </div>
    </form>
  );
}
