import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input, Select, Textarea } from '@/design-system';
import { TRADE_OPTIONS, CONTRACTOR_TYPE_OPTIONS } from '../api/labourContractorsApi';
import { Network, Building2 } from 'lucide-react';

export function ContractorMasterModal({
  open,
  onClose,
  onSubmit,
  contractors = [],
  initialData = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  // Filter available main contractors (cannot be itself, must be MAIN_CONTRACTOR or active prime contractor)
  const mainContractors = contractors.filter(
    (c) =>
      c.contractorType !== 'SUBCONTRACTOR' &&
      (!initialData || String(c.id) !== String(initialData.id))
  );

  const parentOptions = [
    { value: '', label: '-- Select Parent Main Contractor --' },
    ...mainContractors.map((c) => ({
      value: c.id,
      label: `${c.companyName || c.name} (${c.contractorCode || `CTR-${c.id}`})`,
    })),
  ];

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      contractorCode: '',
      companyName: '',
      name: '',
      tradeSpecialization: 'MASON',
      contactNumber: '',
      email: '',
      address: '',
      contractorType: 'MAIN_CONTRACTOR',
      parentContractorId: '',
      status: 'ACTIVE',
      deployedWorkers: 15,
    },
  });

  const selectedContractorType = watch('contractorType');

  useEffect(() => {
    if (open) {
      if (initialData) {
        reset({
          contractorCode: initialData.contractorCode || '',
          companyName: initialData.companyName || initialData.name || '',
          name: initialData.name || initialData.contactPerson || '',
          tradeSpecialization: initialData.tradeSpecialization || 'MASON',
          contactNumber: initialData.contactNumber || initialData.phone || '',
          email: initialData.email || '',
          address: initialData.address || initialData.activeSites || '',
          contractorType: initialData.contractorType || 'MAIN_CONTRACTOR',
          parentContractorId: initialData.parentContractorId ? String(initialData.parentContractorId) : '',
          status: initialData.status || 'ACTIVE',
          deployedWorkers: initialData.deployedWorkers || 15,
        });
      } else {
        const autoCode = `CTR-00${Math.floor(100 + Math.random() * 900)}`;
        reset({
          contractorCode: autoCode,
          companyName: '',
          name: '',
          tradeSpecialization: 'MASON',
          contactNumber: '',
          email: '',
          address: 'Ashok Grandeur Site, Padur, OMR',
          contractorType: 'MAIN_CONTRACTOR',
          parentContractorId: '',
          status: 'ACTIVE',
          deployedWorkers: 15,
        });
      }
    }
  }, [open, initialData, reset]);

  // If contractor type changes to MAIN_CONTRACTOR, clear parentContractorId
  useEffect(() => {
    if (selectedContractorType === 'MAIN_CONTRACTOR') {
      setValue('parentContractorId', '');
    }
  }, [selectedContractorType, setValue]);

  const onFormSubmit = (values) => {
    const isSub = values.contractorType === 'SUBCONTRACTOR';
    onSubmit({
      ...values,
      contractorType: isSub ? 'SUBCONTRACTOR' : 'MAIN_CONTRACTOR',
      parentContractorId: isSub && values.parentContractorId ? Number(values.parentContractorId) : null,
      deployedWorkers: Number(values.deployedWorkers) || 0,
      id: initialData?.id,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? `Edit Contractor: ${initialData?.companyName}` : 'Register New Contractor'}
      size="lg"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" onClick={handleSubmit(onFormSubmit)} isLoading={isLoading}>
            {isEdit ? 'Save Changes' : 'Register Contractor'}
          </Button>
        </div>
      }
    >
      <form className="flex flex-col gap-3.5" onSubmit={handleSubmit(onFormSubmit)}>
        <div className="rounded-lg border border-brand-200/60 bg-brand-50/40 p-3 text-xs text-brand-900 dark:border-brand-900/40 dark:bg-brand-950/20 dark:text-brand-300">
          🏢 <strong>Contractor Master Profile:</strong> Registered prime contractors and specialized subcontractors are mapped to site work packages, daily labour logs, and performance summaries.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Input
            label="Contractor Code *"
            placeholder="e.g. CTR-006"
            {...register('contractorCode', { required: 'Contractor code is required' })}
            error={errors.contractorCode?.message}
          />
          <Input
            label="Company / Firm Name *"
            placeholder="e.g. Sri Lakshmi Masonry Works"
            {...register('companyName', { required: 'Company name is required' })}
            error={errors.companyName?.message}
          />
          <Input
            label="Contact Person (Full Name) *"
            placeholder="e.g. R. Shanmugam"
            {...register('name', { required: 'Contact person name is required' })}
            error={errors.name?.message}
          />
          <Select
            label="Trade Specialization *"
            options={TRADE_OPTIONS}
            {...register('tradeSpecialization', { required: 'Trade specialization is required' })}
            error={errors.tradeSpecialization?.message}
          />
          <Input
            label="Primary Contact Number *"
            placeholder="e.g. +91 98410 12345"
            {...register('contactNumber', { required: 'Contact number is required' })}
            error={errors.contactNumber?.message}
          />
          <Input
            label="Email Address"
            type="email"
            placeholder="e.g. contact@firm.com"
            {...register('email', {
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address format',
              },
            })}
            error={errors.email?.message}
          />
          <Select
            label="Contractor Type *"
            options={CONTRACTOR_TYPE_OPTIONS}
            {...register('contractorType')}
          />
          <Input
            label="Registered / Deployed Workers"
            type="number"
            placeholder="15"
            {...register('deployedWorkers', { min: { value: 1, message: 'Minimum 1 worker' } })}
            error={errors.deployedWorkers?.message}
          />

          {/* Subcontractor Parent Association */}
          {selectedContractorType === 'SUBCONTRACTOR' && (
            <div className="md:col-span-2 rounded-xl border border-brand-300/80 bg-brand-50/60 p-3.5 dark:border-brand-800 dark:bg-brand-950/30">
              <div className="flex items-center gap-2 mb-2 text-xs font-semibold text-brand-900 dark:text-brand-300">
                <Network className="h-4 w-4 text-brand-600" />
                <span>Parent Main Contractor Association *</span>
              </div>
              <Select
                label="Select Parent Main Contractor *"
                options={parentOptions}
                {...register('parentContractorId', {
                  required:
                    selectedContractorType === 'SUBCONTRACTOR'
                      ? 'Subcontractor must be assigned to an active Parent Main Contractor'
                      : false,
                })}
                error={errors.parentContractorId?.message}
              />
              <p className="mt-1.5 text-[11px] text-ink-500">
                Backend Architecture Rule: A Subcontractor must be parented under an established Main Contractor/Agency.
              </p>
            </div>
          )}

          <div className="md:col-span-2">
            <Textarea
              label="Registered Office / Site Address"
              placeholder="e.g. Tower A Floor 4, Foundation Zone 1, Ashok Grandeur Campus"
              rows={2}
              {...register('address')}
            />
          </div>
        </div>
      </form>
    </Modal>
  );
}

