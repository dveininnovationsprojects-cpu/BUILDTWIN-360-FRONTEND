import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button, Modal, Input, Select, Textarea } from '@/design-system';
import { PROJECT_TYPES, PROJECT_STATUSES } from '../constants';

const EMPTY_VALUES = {
  code: '',
  name: '',
  clientName: '',
  projectType: 'RESIDENTIAL',
  location: '',
  status: 'PLANNED',
  plannedStartDate: '',
  plannedEndDate: '',
  actualStartDate: '',
  estimatedBudget: '',
  currency: 'INR',
  totalBuiltUpAreaSqFt: '',
  description: '',
};

export function ProjectFormModal({ open, onClose, onSave, project, isSaving }) {
  const form = useForm({ defaultValues: EMPTY_VALUES });

  useEffect(() => {
    if (project) {
      form.reset({
        code: project.code || '',
        name: project.name || '',
        clientName: project.clientName || project.client || '',
        projectType: project.projectType || project.type || 'RESIDENTIAL',
        location: project.location || '',
        status: project.status || 'PLANNED',
        plannedStartDate: project.plannedStartDate || project.startDate || '',
        plannedEndDate: project.plannedEndDate || project.endDate || '',
        actualStartDate: project.actualStartDate || '',
        estimatedBudget: project.estimatedBudget != null ? String(project.estimatedBudget) : '',
        currency: project.currency || 'INR',
        totalBuiltUpAreaSqFt: project.totalBuiltUpAreaSqFt != null ? String(project.totalBuiltUpAreaSqFt) : '',
        description: project.description || '',
      });
    } else {
      form.reset(EMPTY_VALUES);
    }
  }, [project, open, form]);

  const handleSubmit = (values) => {
    onSave({
      ...values,
      code: values.code.trim().toUpperCase(),
      name: values.name.trim(),
      clientName: values.clientName.trim(),
      estimatedBudget: values.estimatedBudget ? Number(values.estimatedBudget) : null,
      totalBuiltUpAreaSqFt: values.totalBuiltUpAreaSqFt ? Number(values.totalBuiltUpAreaSqFt) : null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="lg"
      title={project ? 'Edit Project Master' : 'Create Construction Project'}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleSubmit)} isLoading={isSaving}>
            {project ? 'Save Changes' : 'Create Project'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Project Code *"
            placeholder="PADUR-AG-01"
            error={form.formState.errors.code?.message}
            {...form.register('code', { required: 'Project code is required' })}
          />
          <Input
            label="Project Name *"
            placeholder="Ashok Grandeur"
            error={form.formState.errors.name?.message}
            {...form.register('name', { required: 'Project name is required' })}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Select
            label="Project Type *"
            options={PROJECT_TYPES}
            error={form.formState.errors.projectType?.message}
            {...form.register('projectType', { required: 'Type is required' })}
          />
          <Select
            label="Lifecycle Status *"
            options={PROJECT_STATUSES}
            error={form.formState.errors.status?.message}
            {...form.register('status', { required: 'Status is required' })}
          />
          <Input
            label="Client / Developer"
            placeholder="Ashok Builders"
            {...form.register('clientName')}
          />
        </div>

        <Input
          label="Location / Site Address"
          placeholder="Padur, OMR, Chennai, Tamil Nadu"
          {...form.register('location')}
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Planned Start Date"
            type="date"
            {...form.register('plannedStartDate')}
          />
          <Input
            label="Planned End Date"
            type="date"
            {...form.register('plannedEndDate')}
          />
          <Input
            label="Actual Start Date"
            type="date"
            {...form.register('actualStartDate')}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            label="Estimated Budget (₹)"
            type="number"
            step="1000"
            placeholder="45000000"
            {...form.register('estimatedBudget')}
          />
          <Input
            label="Currency"
            placeholder="INR"
            {...form.register('currency')}
          />
          <Input
            label="Built-Up Area (Sq.Ft)"
            type="number"
            step="100"
            placeholder="350000"
            {...form.register('totalBuiltUpAreaSqFt')}
          />
        </div>

        <Textarea
          label="Scope of Work / Description"
          placeholder="18-storey residential development with 220 luxury units..."
          rows={3}
          {...form.register('description')}
        />
      </form>
    </Modal>
  );
}
