import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { documentsApi } from '../api/documentsApi';

// Document/photo repository by project/category/version with search (FR-110..114).
export function DocumentsListPage() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN,
    ROLES.QUALITY_ENGINEER
  );

  const form = useForm({
    defaultValues: {
      name: '',
      category: 'Structural Drawing',
      uploadedBy: 'Site Engineer',
      version: 'v1.0',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => documentsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => documentsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      pushToast('Document registered successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to register document.', 'error');
    },
  });

  const columns = [
    { key: 'name', header: 'Document Name' },
    { key: 'category', header: 'Category' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'version', header: 'Version' },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      name: values.name,
      category: values.category,
      uploadedBy: values.uploadedBy,
      version: values.version,
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Documents & Drawings</h1>
          <p className="page-subheading">
            Document/photo repository by project/category/version with search (FR-110..114).
          </p>
        </div>
        {canManage && <Button size="sm" onClick={() => setIsOpen(true)}>Add New</Button>}
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Upload / Register Document"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>Cancel</Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Register Document
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Document Title / File Name *"
            placeholder="e.g. Approved Structural Blueprint Floor 4.pdf"
            {...form.register('name', { required: 'Document name is required' })}
            error={form.formState.errors.name?.message}
          />
          <Input
            label="Category *"
            placeholder="e.g. Structural Drawing / Quality Report"
            {...form.register('category', { required: 'Category is required' })}
            error={form.formState.errors.category?.message}
          />
          <Input
            label="Version Label *"
            placeholder="e.g. v1.0"
            {...form.register('version', { required: 'Version is required' })}
            error={form.formState.errors.version?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
