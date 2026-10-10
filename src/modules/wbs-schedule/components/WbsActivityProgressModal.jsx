import React, { useState, useEffect } from 'react';
import { Modal, Button, Input } from '@/design-system';

export function WbsActivityProgressModal({
  activity,
  open,
  onClose,
  onSubmit,
  isSubmitting,
}) {
  const [completedQuantity, setCompletedQuantity] = useState('');
  const [loggedDate, setLoggedDate] = useState(new Date().toISOString().split('T')[0]);
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (activity) {
      setCompletedQuantity(
        activity.completedQuantity != null ? String(activity.completedQuantity) : '0'
      );
      setLoggedDate(new Date().toISOString().split('T')[0]);
      setRemarks('');
      setError('');
    }
  }, [activity, open]);

  const planned = Number(activity?.plannedQuantity) || 0;
  const completed = Number(completedQuantity) || 0;
  const calculatedPercent = planned > 0 ? Math.min(100, Math.round((completed / planned) * 100)) : 0;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (completedQuantity === '' || isNaN(completed) || completed < 0) {
      setError('Please enter a valid non-negative completed quantity');
      return;
    }

    onSubmit({
      completedQuantity: completed,
      progressPercentage: calculatedPercent,
      loggedDate,
      remarks: remarks.trim() || null,
    });
  };

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title="Log WBS Activity Progress"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Save Progress
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
          <p className="font-mono text-[11px] font-bold text-brand-700">{activity?.code}</p>
          <p className="font-bold text-ink-900 text-sm mt-0.5">{activity?.name}</p>
          <div className="mt-2 flex items-center justify-between text-xs text-ink-500">
            <span>
              Planned BOQ:{' '}
              <strong className="text-ink-800">
                {activity?.plannedQuantity} {activity?.uom}
              </strong>
            </span>
            <span>
              Current Progress:{' '}
              <strong className="text-brand-600">
                {Number(activity?.progressPercentage || 0).toFixed(1)}%
              </strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div>
            <Input
              label={`Completed Quantity (${activity?.uom || 'units'}) *`}
              type="number"
              step="0.01"
              min="0"
              value={completedQuantity}
              onChange={(e) => {
                setCompletedQuantity(e.target.value);
                setError('');
              }}
              error={error}
            />
          </div>

          <div>
            <Input
              label="Measurement / Log Date *"
              type="date"
              value={loggedDate}
              onChange={(e) => setLoggedDate(e.target.value)}
            />
          </div>
        </div>

        {/* Calculated Progress Bar Preview */}
        <div className="rounded-lg border border-brand-200/60 bg-brand-50/30 p-3 dark:border-brand-900/40 dark:bg-brand-950/20">
          <div className="flex items-center justify-between text-xs font-semibold text-brand-950 dark:text-brand-200 mb-1.5">
            <span>Resulting Progress Roll-up:</span>
            <span className="text-sm font-bold text-brand-700 dark:text-brand-300">
              {calculatedPercent}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-black/10 dark:bg-white/10">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: `${calculatedPercent}%` }}
            />
          </div>
        </div>

        <div>
          <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
            Engineering Remarks / Inspection Note
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="Verified against daily pour card or contractor log..."
            className="w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
