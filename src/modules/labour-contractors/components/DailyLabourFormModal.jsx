import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input, Select, Textarea } from '@/design-system';
import { TRADE_OPTIONS, SITE_OPTIONS } from '../api/labourContractorsApi';

export function DailyLabourFormModal({
  open,
  onClose,
  onSubmit,
  contractors = [],
  initialData = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  const contractorSelectOptions = contractors.map((c) => ({
    value: c.id,
    label: `${c.companyName || c.name} (${c.tradeSpecialization || 'Specialist'})`,
  }));

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      date: new Date().toISOString().slice(0, 10),
      contractorId: contractors[0]?.id || 1,
      tradeCategory: 'MASON',
      siteId: 1,
      headcount: 15,
      standardHours: 8,
      overtimeHours: 0,
      remarks: '',
      taskDescription: '',
    },
  });

  const selectedContractorId = watch('contractorId');

  // Auto-default trade category when contractor is selected
  useEffect(() => {
    if (selectedContractorId && !isEdit) {
      const match = contractors.find((c) => String(c.id) === String(selectedContractorId));
      if (match && match.tradeSpecialization) {
        setValue('tradeCategory', match.tradeSpecialization);
      }
    }
  }, [selectedContractorId, contractors, isEdit, setValue]);

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          date: initialData.date || initialData.recordDate || new Date().toISOString().slice(0, 10),
          contractorId: initialData.contractorId || contractors[0]?.id || 1,
          tradeCategory: initialData.tradeCategory || initialData.trade || 'MASON',
          siteId: initialData.siteId || 1,
          headcount: initialData.headcount || 10,
          standardHours: initialData.standardHours ?? 8,
          overtimeHours: initialData.overtimeHours ?? 0,
          remarks: initialData.remarks || '',
          taskDescription: initialData.allocations?.[0]?.activityDescription || '',
        });
      } else {
        const firstCtr = contractors[0];
        reset({
          date: new Date().toISOString().slice(0, 10),
          contractorId: firstCtr?.id || 1,
          tradeCategory: firstCtr?.tradeSpecialization || 'MASON',
          siteId: 1,
          headcount: 15,
          standardHours: 8,
          overtimeHours: 0,
          remarks: '',
          taskDescription: '',
        });
      }
    }
  }, [open, initialData, contractors, reset]);

  const onFormSubmit = (values) => {
    const selectedCtr = contractors.find((c) => String(c.id) === String(values.contractorId));
    const selectedSite = SITE_OPTIONS.find((s) => Number(s.value) === Number(values.siteId));

    const payload = {
      recordDate: values.date,
      date: values.date,
      contractorId: Number(values.contractorId),
      contractor: selectedCtr?.companyName || selectedCtr?.name || 'Contractor Agency',
      contractorCode: selectedCtr?.contractorCode || '',
      siteId: Number(values.siteId),
      siteLocation: selectedSite?.label || 'Tower A (Stilt + 18 Floors)',
      tradeCategory: values.tradeCategory,
      headcount: Number(values.headcount),
      standardHours: Number(values.standardHours ?? 8),
      overtimeHours: Number(values.overtimeHours ?? 0),
      remarks: values.remarks || '',
      allocations: values.taskDescription
        ? [
            {
              activityId: 1,
              hoursAllocated: Number(values.standardHours ?? 8),
              activityDescription: values.taskDescription,
            },
          ]
        : [],
      id: initialData?.id,
    };

    onSubmit(payload);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? 'Edit Daily Labour & Attendance' : 'Log Daily Labour Deployment (FR-041)'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onFormSubmit)} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Log Daily Attendance'}
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="rounded-lg border border-brand-200/60 bg-brand-50/40 p-3 text-xs text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300">
          📋 <strong>Daily Site Labour Log:</strong> Captures physical headcount, deployed trade specialization, shift hours, and overtime directly linked with the contractor master profile and DPR verification.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Input
            label="Record Date *"
            type="date"
            {...register('date', { required: 'Record date is required' })}
            error={errors.date?.message}
          />

          <Select
            label="Contractor Agency *"
            options={contractorSelectOptions}
            {...register('contractorId', { required: 'Please select a contractor' })}
            error={errors.contractorId?.message}
          />

          <Select
            label="Trade Category *"
            options={TRADE_OPTIONS}
            {...register('tradeCategory', { required: 'Trade category is required' })}
            error={errors.tradeCategory?.message}
          />

          <Select
            label="Project Site / Physical Tower *"
            options={SITE_OPTIONS}
            {...register('siteId', { required: 'Site is required' })}
          />

          <Input
            label="Headcount (Workers Deployed) *"
            type="number"
            placeholder="15"
            {...register('headcount', {
              required: 'Headcount is required',
              min: { value: 1, message: 'Minimum 1 worker deployed' },
            })}
            error={errors.headcount?.message}
          />

          <div className="grid grid-cols-2 gap-2">
            <Input
              label="Standard Shift (hrs)"
              type="number"
              step="0.5"
              placeholder="8"
              {...register('standardHours', { min: { value: 1, message: 'Min 1 hr' } })}
            />
            <Input
              label="Overtime (hrs)"
              type="number"
              step="0.5"
              placeholder="0"
              {...register('overtimeHours', { min: { value: 0, message: 'Cannot be negative' } })}
            />
          </div>

          <div className="md:col-span-2">
            <Input
              label="Work Package / Task Allocation (Optional)"
              placeholder="e.g. Column Fe500D rebar tying and formwork shuttering alignment on Grid 4-8"
              {...register('taskDescription')}
            />
          </div>

          <div className="md:col-span-2">
            <Textarea
              label="Supervisor Remarks & Site Progress Observations"
              placeholder="e.g. 1st slab reinforcement inspected and approved for concreting; shift completed without incident."
              rows={2}
              {...register('remarks')}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}
