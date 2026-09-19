import { useEffect, useState } from 'react';
import { useFieldArray, useForm } from 'react-hook-form';
import { Download, Plus, Trash2, Camera, Layers } from 'lucide-react';
import { Button, Input, Modal, Select, Textarea } from '@/design-system';
import { DprPhotoUploadSection } from './DprPhotoUploadSection';

const UNITS = [
  { value: 'm3', label: 'm3' },
  { value: 'm2', label: 'm2' },
  { value: 'm', label: 'm' },
  { value: 'Nos', label: 'Nos' },
  { value: 'kg', label: 'kg' },
  { value: '%', label: '%' },
  { value: 'Rmt', label: 'Rmt' },
  { value: 'MT', label: 'MT' },
  { value: 'Sqft', label: 'Sqft' },
];

const emptyQuantity = () => ({ workDescription: '', completedQuantity: '', unit: 'm3' });

const initialValues = () => ({
  reportDate: new Date().toISOString().slice(0, 10),
  siteName: '',
  activity: '',
  remarks: '',
  quantities: [emptyQuantity()],
});

function isFiniteQuantity(value) {
  return typeof value === 'number' && Number.isFinite(value);
}

function toPayload(values, status, submittedBy, photos = []) {
  const quantities = (values.quantities ?? [])
    .filter((quantity) => quantity.workDescription?.trim() || isFiniteQuantity(quantity.completedQuantity))
    .map((quantity) => ({
      workDescription: quantity.workDescription?.trim() ?? '',
      completedQuantity: isFiniteQuantity(quantity.completedQuantity) ? quantity.completedQuantity : null,
      unit: quantity.unit,
    }));

  return {
    reportDate: values.reportDate,
    siteName: values.siteName.trim(),
    activity: values.activity.trim(),
    quantities,
    photos: photos.map((p) => ({
      id: p.id,
      name: p.name,
      size: p.size,
      type: p.type,
      previewUrl: p.previewUrl || p.dataUrl || p.url,
      dataUrl: p.dataUrl || p.previewUrl || p.url,
      activityTag: p.activityTag || 'General Progress',
      caption: p.caption || '',
      locationTag: p.locationTag || '',
      uploadedAt: p.uploadedAt || new Date().toISOString(),
    })),
    remarks: values.remarks.trim(),
    status,
    submittedBy,
  };
}

export function DprEntryFormModal({ open, onClose, onSave, isSaving, submittedBy }) {
  const form = useForm({ mode: 'onBlur', defaultValues: initialValues() });
  const { fields, append, remove } = useFieldArray({ control: form.control, name: 'quantities' });
  const [photos, setPhotos] = useState([]);

  // Dynamically extract work item names for live activity tagging
  const watchedQuantities = form.watch('quantities') || [];
  const watchedActivity = form.watch('activity') || '';
  const liveActivities = Array.from(
    new Set([
      watchedActivity.trim(),
      ...watchedQuantities.map((q) => q.workDescription?.trim()).filter(Boolean),
    ].filter(Boolean))
  );

  useEffect(() => {
    if (open) {
      form.reset(initialValues());
      setPhotos([]);
    }
  }, [open, form]);

  async function save(status, downloadAfter = false) {
    const baseFieldsAreValid = await form.trigger(['reportDate', 'siteName']);
    if (!baseFieldsAreValid) return;

    form.clearErrors(['activity', 'quantities']);
    const values = form.getValues();

    if (status === 'SUBMITTED' || downloadAfter) {
      let hasQuantityErrors = false;

      if (!values.activity?.trim()) {
        form.setError('activity', { type: 'required', message: 'Work summary is required to submit or generate report.' });
      }

      values.quantities?.forEach((quantity, index) => {
        if (!quantity.workDescription?.trim()) {
          form.setError(`quantities.${index}.workDescription`, { type: 'required', message: 'Work item is required.' });
          hasQuantityErrors = true;
        }
        if (!isFiniteQuantity(quantity.completedQuantity) || quantity.completedQuantity <= 0) {
          form.setError(`quantities.${index}.completedQuantity`, { type: 'min', message: 'Enter a quantity greater than zero.' });
          hasQuantityErrors = true;
        }
        if (!quantity.unit) {
          form.setError(`quantities.${index}.unit`, { type: 'required', message: 'Unit is required.' });
          hasQuantityErrors = true;
        }
      });

      if (!values.activity?.trim() || hasQuantityErrors) return;
    }

    try {
      await onSave(toPayload(values, status, submittedBy, photos), downloadAfter);
    } catch {
      // The list page shows the failure toast and leaves this form open for correction.
    }
  }

  return (
    <Modal
      open={open}
      onClose={() => {
        if (!isSaving) onClose();
      }}
      size="xl"
      title="New Daily Progress Report (DPR)"
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>Cancel</Button>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => save('DRAFT')} isLoading={isSaving} disabled={isSaving}>Save Draft</Button>
            <Button
              variant="outline"
              className="flex items-center gap-1.5 border-brand-500 text-brand-600 hover:bg-brand-50"
              onClick={() => save('SUBMITTED', true)}
              isLoading={isSaving}
              disabled={isSaving}
            >
              <Download className="h-4 w-4" />
              <span>Save & Download PDF</span>
            </Button>
            <Button onClick={() => save('SUBMITTED')} isLoading={isSaving} disabled={isSaving}>Submit DPR</Button>
          </div>
        </div>
      }
    >
      <form
        className="flex flex-col gap-5"
        onSubmit={(event) => {
          event.preventDefault();
          save('SUBMITTED');
        }}
      >
        {/* Basic Details */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Input
            label="Report date *"
            type="date"
            disabled={isSaving}
            error={form.formState.errors.reportDate?.message}
            {...form.register('reportDate', { required: 'Report date is required.' })}
          />
          <Input
            label="Project / site *"
            placeholder="e.g. Padur Residence - Block A"
            disabled={isSaving}
            error={form.formState.errors.siteName?.message}
            {...form.register('siteName', {
              required: 'Project or site is required.',
              validate: (value) => value.trim().length > 1 || 'Enter a project or site name.',
            })}
          />
        </div>

        <Input
          label="Work summary"
          placeholder="e.g. Slab concreting at Level 03"
          hint="Required when submitting; a draft can be completed later."
          disabled={isSaving}
          error={form.formState.errors.activity?.message}
          {...form.register('activity')}
        />

        {/* Quantities Section */}
        <section className="rounded-xl border border-surface-border p-4 bg-surface-card">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <h4 className="font-semibold text-ink-900 text-sm">Completed quantities</h4>
              <p className="text-xs text-ink-500">Record each activity completed during this reporting period.</p>
            </div>
            <Button type="button" size="sm" variant="outline" onClick={() => append(emptyQuantity())} disabled={isSaving}>
              <Plus className="h-4 w-4" />
              Add quantity
            </Button>
          </div>

          <div className="flex flex-col gap-3">
            {fields.map((field, index) => (
              <div key={field.id} className="grid grid-cols-1 items-start gap-3 rounded-lg bg-surface-subtle p-3 sm:grid-cols-[minmax(0,1fr)_9rem_7rem_auto]">
                <Input
                  label={index === 0 ? 'Work item' : undefined}
                  placeholder="e.g. Concrete placement"
                  disabled={isSaving}
                  error={form.formState.errors.quantities?.[index]?.workDescription?.message}
                  {...form.register(`quantities.${index}.workDescription`)}
                />
                <Input
                  label={index === 0 ? 'Completed qty.' : undefined}
                  type="number"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  disabled={isSaving}
                  error={form.formState.errors.quantities?.[index]?.completedQuantity?.message}
                  {...form.register(`quantities.${index}.completedQuantity`, { valueAsNumber: true })}
                />
                <Select
                  label={index === 0 ? 'Unit' : undefined}
                  options={UNITS}
                  disabled={isSaving}
                  error={form.formState.errors.quantities?.[index]?.unit?.message}
                  {...form.register(`quantities.${index}.unit`)}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="mt-0 sm:mt-7"
                  onClick={() => remove(index)}
                  disabled={isSaving || fields.length === 1}
                  aria-label={`Remove quantity ${index + 1}`}
                  title={fields.length === 1 ? 'Keep one row available for entry' : 'Remove quantity'}
                >
                  <Trash2 className="h-4 w-4 text-status-danger" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        {/* Photo Upload & Activity Tagging Feature */}
        <DprPhotoUploadSection
          photos={photos}
          onChange={setPhotos}
          disabled={isSaving}
          availableActivities={liveActivities}
        />

        <Textarea
          label="Remarks / Site observations"
          rows={3}
          placeholder="Mention site conditions, weather, delays, safety observations, manpower notes, or follow-up items."
          disabled={isSaving}
          error={form.formState.errors.remarks?.message}
          {...form.register('remarks', { maxLength: { value: 1000, message: 'Remarks cannot exceed 1,000 characters.' } })}
        />
      </form>
    </Modal>
  );
}
