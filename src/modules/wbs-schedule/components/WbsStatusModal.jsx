import { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@/design-system';
import { WBS_STATUSES } from '../constants/wbsConstants';

export function WbsStatusModal({ workPackage, onClose, onUpdate, isUpdating }) {
  const [status, setStatus] = useState('PLANNED');

  useEffect(() => {
    if (workPackage) {
      setStatus(workPackage.status || 'PLANNED');
    }
  }, [workPackage]);

  if (!workPackage) return null;

  return (
    <Modal
      open={!!workPackage}
      onClose={onClose}
      size="sm"
      title="Update Work Package Status"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isUpdating}>
            Cancel
          </Button>
          <Button
            onClick={() => onUpdate(workPackage.id, status)}
            isLoading={isUpdating}
            disabled={isUpdating}
          >
            Update Status
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-3 py-2">
        <p className="text-sm text-ink-600">
          Update status for{' '}
          <strong className="text-ink-900">{workPackage.code}</strong> —{' '}
          <span className="text-ink-700">{workPackage.name}</span>:
        </p>
        <Select
          label="Execution Status"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          options={WBS_STATUSES}
        />
      </div>
    </Modal>
  );
}
