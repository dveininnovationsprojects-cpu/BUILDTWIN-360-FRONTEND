import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input, Select, Textarea } from '@/design-system';
import { TRADE_OPTIONS, CONTRACTOR_TYPE_OPTIONS } from '../api/labourContractorsApi';

export function ContractorMasterModal({
  open,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) {
  const isEdit = Boolean(initialData && initialData.id);

  const {
    register,
    handleSubmit,
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
      status: 'ACTIVE',
      deployedWorkers: 15,
    },
  });

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
          status: 'ACTIVE',
          deployedWorkers: 15,
        });
      }
    }
  }, [open, initialData, reset]);

  const onFormSubmit = (values) => {
    onSubmit({
      ...values,
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
          🏢 <strong>Contractor Master Profile:</strong> Registered subcontractors and agency entities will be accessible across daily labour logs, WBS task assignments, and site access verification.
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
            label="Contractor Type"
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
