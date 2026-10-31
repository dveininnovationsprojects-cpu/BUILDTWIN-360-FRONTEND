import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '@/design-system';

export function EquipmentUsageModal({
  open,
  onClose,
  equipmentList = [],
  projects = [],
  selectedProjectId = 1,
  onSubmit,
  isLoading = false,
}) {
  const form = useForm({
    defaultValues: {
      equipmentId: '',
      projectId: selectedProjectId || 1,
      usageDate: new Date().toISOString().split('T')[0],
      activityId: '',
      hoursUsed: 8.0,
      downtimeHours: 0.0,
    },
  });

  useEffect(() => {
    if (open) {
      form.reset({
        equipmentId: equipmentList[0]?.id ? String(equipmentList[0].id) : '',
        projectId: selectedProjectId || 1,
        usageDate: new Date().toISOString().split('T')[0],
        activityId: '',
        hoursUsed: 8.0,
        downtimeHours: 0.0,
      });
    }
  }, [open, equipmentList, selectedProjectId]);

  function handleFormSubmit(values) {
    onSubmit({
      equipmentId: Number(values.equipmentId),
      projectId: Number(values.projectId),
      usageDate: values.usageDate,
      activityId: values.activityId ? Number(values.activityId) : null,
      hoursUsed: Number(values.hoursUsed || 0),
      downtimeHours: Number(values.downtimeHours || 0),
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Daily Equipment Usage & Downtime"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            Submit Daily Log
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Select Equipment Asset *</label>
          <select
            className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
            {...form.register('equipmentId', { required: 'Please select an equipment asset' })}
          >
            <option value="">-- Choose Equipment --</option>
            {equipmentList.map((eq) => (
              <option key={eq.id} value={eq.id}>
                {eq.assetCode} - {eq.name} ({eq.status})
              </option>
            ))}
          </select>
          {form.formState.errors.equipmentId && (
            <span className="text-[11px] text-status-danger mt-1">
              {form.formState.errors.equipmentId.message}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Site / Project *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('projectId', { required: 'Project is required' })}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} - ` : ''}{p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Usage Date *</label>
            <input
              type="date"
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('usageDate', { required: 'Usage date is required' })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Operational Hours Used *</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="e.g. 7.5"
              {...form.register('hoursUsed', { required: 'Hours used is required' })}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Downtime Hours (Breakdown/Idle)</label>
            <input
              type="number"
              step="0.5"
              min="0"
              max="24"
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="e.g. 0.5"
              {...form.register('downtimeHours')}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">WBS Activity ID (Optional)</label>
          <Input
            placeholder="e.g. 101 (Concrete Pouring Level 3)"
            {...form.register('activityId')}
          />
        </div>
      </form>
    </Modal>
  );
}
