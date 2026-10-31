import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '@/design-system';
import { UploadCloud, File, Link as LinkIcon } from 'lucide-react';
import { storeDocumentFile } from '../utils/documentStorage';
import { useAuthStore } from '@/context/authStore';
import { useToastStore } from '@/design-system/components/Toast/Toast';

const CATEGORIES = [
  { value: 'DRAWING', label: 'Architectural / Structural / MEP Drawing' },
  { value: 'APPROVAL', label: 'Statutory Clearance / Municipal Permit' },
  { value: 'BOQ', label: 'Bill of Quantities (BOQ) & Estimations' },
  { value: 'QUOTATION', label: 'Vendor / Subcontractor Quotation' },
  { value: 'REPORT', label: 'Inspection / Daily Site Progress Report' },
  { value: 'INVOICE_EVIDENCE', label: 'Vendor Invoice & Delivery Evidence' },
  { value: 'SITE_PHOTO', label: 'Site Progress Photo Record' },
];

const VERSION_OPTIONS = ['v1.0', 'v1.1', 'v1.2', 'v2.0', 'v2.1', 'v3.0'];

export function DocumentUploadModal({
  open,
  onClose,
  projects = [],
  selectedProjectId = 1,
  onSubmit,
  isLoading = false,
}) {
  const user = useAuthStore((s) => s.user);
  const pushToast = useToastStore((state) => state.push);
  const [selectedFile, setSelectedFile] = useState(null);
  const [useManualUrl, setUseManualUrl] = useState(false);

  const form = useForm({
    defaultValues: {
      projectId: selectedProjectId || 1,
      title: '',
      category: 'DRAWING',
      version: 'v1.0',
      status: 'ACTIVE',
      objectUrl: '',
      uploadedBy: user?.name || user?.username || 'admin',
    },
  });

  // Only reset form values when the modal opens
  useEffect(() => {
    if (open) {
      form.reset({
        projectId: selectedProjectId || 1,
        title: '',
        category: 'DRAWING',
        version: 'v1.0',
        status: 'ACTIVE',
        objectUrl: '',
        uploadedBy: user?.name || user?.username || 'admin',
      });
      setSelectedFile(null);
      setUseManualUrl(false);
    }
  }, [open, selectedProjectId]);

  function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      if (!form.getValues('title')) {
        const cleanName = file.name.replace(/\.[^/.]+$/, '');
        form.setValue('title', cleanName);
      }
      const dummyUrl = `https://buildtwin.storage.local/documents/${Date.now()}_${encodeURIComponent(file.name)}`;
      form.setValue('objectUrl', dummyUrl);
    }
  }

  function handleFormSubmit(values) {
    if (!values.title?.trim() && !selectedFile?.name) {
      pushToast('Document title is required.', 'error');
      return;
    }

    if (useManualUrl && !values.objectUrl?.trim()) {
      pushToast('Please enter the Document Object URL.', 'error');
      return;
    }

    const finalUrl =
      (useManualUrl && values.objectUrl?.trim()) ||
      (selectedFile
        ? `https://buildtwin.storage.local/documents/${Date.now()}_${encodeURIComponent(selectedFile.name)}`
        : 'https://buildtwin.storage.local/documents/sample-spec.pdf');

    // Store file in fast client storage
    if (selectedFile) {
      storeDocumentFile(finalUrl, selectedFile);
    }

    const targetProjectId = Number(values.projectId || selectedProjectId || 1);

    onSubmit?.({
      projectId: targetProjectId,
      title: values.title?.trim() || selectedFile?.name || 'Project Document',
      category: values.category || 'DRAWING',
      version: values.version || 'v1.0',
      status: values.status || 'ACTIVE',
      objectUrl: finalUrl,
      uploadedBy: values.uploadedBy?.trim() || user?.name || user?.username || 'admin',
    });
  }

  function onInvalid(errors) {
    const firstErr = Object.values(errors)[0];
    if (firstErr?.message) {
      pushToast(firstErr.message, 'error');
    } else {
      pushToast('Please fill all required fields.', 'error');
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Upload & Register Project Document"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="document-upload-form"
            onClick={form.handleSubmit(handleFormSubmit, onInvalid)}
            isLoading={isLoading}
          >
            Upload Document
          </Button>
        </>
      }
    >
      <form
        id="document-upload-form"
        className="flex flex-col gap-4"
        onSubmit={form.handleSubmit(handleFormSubmit, onInvalid)}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Project Site *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('projectId')}
            >
              {projects.length > 0 ? (
                projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.code ? `${p.code} - ` : ''}
                    {p.name}
                  </option>
                ))
              ) : (
                <option value={selectedProjectId || 1}>Active Site (PADUR-AG-01)</option>
              )}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Document Category *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('category')}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Document Title *</label>
          <Input
            placeholder="e.g. Ground Slab Concrete Reinforcement Detail"
            {...form.register('title', { required: 'Document title is required' })}
            error={form.formState.errors.title?.message}
          />
        </div>

        {/* File Dropzone or URL toggle */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-ink-700">Attach File / Storage Link *</label>
            <button
              type="button"
              onClick={() => setUseManualUrl(!useManualUrl)}
              className="text-[11px] text-brand-600 hover:text-brand-800 flex items-center gap-1 font-medium"
            >
              {useManualUrl ? <UploadCloud className="h-3 w-3" /> : <LinkIcon className="h-3 w-3" />}
              {useManualUrl ? 'Switch to File Upload' : 'Enter Direct URL'}
            </button>
          </div>

          {useManualUrl ? (
            <Input
              placeholder="e.g. https://storage.blob.core.windows.net/drawings/slab-v2.pdf"
              {...form.register('objectUrl')}
            />
          ) : (
            <div className="relative border-2 border-dashed border-surface-border rounded-xl p-4 text-center hover:border-brand-400 transition-colors bg-surface-subtle">
              <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center gap-1.5 pointer-events-none">
                <UploadCloud className="h-7 w-7 text-brand-600" />
                {selectedFile ? (
                  <div className="flex items-center gap-2 text-xs font-semibold text-ink-900 bg-white px-3 py-1 rounded-md border border-surface-border">
                    <File className="h-4 w-4 text-brand-600" />
                    <span>{selectedFile.name}</span>
                    <span className="text-[10px] text-ink-400">
                      ({(selectedFile.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                ) : (
                  <>
                    <p className="text-xs font-semibold text-ink-800">
                      Click or drag and drop blueprint, PDF, or image file
                    </p>
                    <p className="text-[11px] text-ink-500">
                      PDF, DWG, DXF, XLSX, PNG, JPG up to 50MB
                    </p>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Version Control *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('version')}
            >
              {VERSION_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Status</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('status')}
            >
              <option value="ACTIVE">ACTIVE (Current)</option>
              <option value="SUPERSEDES">SUPERSEDES (Archived)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Uploaded By</label>
            <Input {...form.register('uploadedBy')} />
          </div>
        </div>
      </form>
    </Modal>
  );
}
