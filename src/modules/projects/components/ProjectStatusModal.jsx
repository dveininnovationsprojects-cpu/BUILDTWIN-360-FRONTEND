import { useState, useEffect } from 'react';
import { Button, Modal, Select } from '@/design-system';
import { PROJECT_STATUSES } from '../constants';

export function ProjectStatusModal({ open, onClose, project, onUpdateStatus, isSaving }) {
  const [status, setStatus] = useState('ACTIVE');

  useEffect(() => {
    if (project) {
      setStatus(project.status || 'ACTIVE');
    }
  }, [project]);

  const handleSave = () => {
    if (!project) return;
    onUpdateStatus({ id: project.id, status });
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title="Update Project Status"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} isLoading={isSaving}>
            Update Status
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4 py-2">
        <p className="text-sm text-ink-600">
          Change lifecycle status for project{' '}
          <strong className="text-ink-900">{project?.name}</strong> ({project?.code}):
        </p>
        <Select
          label="Lifecycle Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={PROJECT_STATUSES}
        />
      </div>
    </Modal>
  );
}
