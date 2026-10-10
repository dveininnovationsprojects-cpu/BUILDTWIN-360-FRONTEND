import React, { useState, useEffect } from 'react';
import { Modal, Button, Select } from '@/design-system';
import { WBS_STATUSES } from '../constants/wbsConstants';

export function WbsActivityStatusModal({
  activity,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [status, setStatus] = useState('PLANNED');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    if (activity) {
      setStatus(activity.status || 'PLANNED');
      setRemarks('');
    }
  }, [activity, open]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      status,
      remarks: remarks.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title="Update Activity Execution Status"
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Update Status
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-xs">
        <div className="rounded-lg border border-surface-border bg-surface-subtle p-2.5">
          <span className="font-mono text-[11px] font-bold text-brand-700">{activity?.code}</span>
          <p className="font-semibold text-ink-900 mt-0.5">{activity?.name}</p>
        </div>

        <div>
          <Select
            label="Execution Status *"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={WBS_STATUSES}
          />
        </div>

        <div>
          <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
            Status Change Reason / Notes
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Approved by PM, ready for execution..."
            className="w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
