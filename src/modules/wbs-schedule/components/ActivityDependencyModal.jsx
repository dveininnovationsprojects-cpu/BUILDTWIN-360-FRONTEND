import React, { useState, useEffect } from 'react';
import { Modal, Button, Input, Select } from '@/design-system';
import { DEPENDENCY_TYPES } from '../constants/wbsConstants';

export function ActivityDependencyModal({
  open,
  onClose,
  onSubmit,
  isSubmitting,
  activities = [],
  initialPredecessorId = null,
  initialSuccessorId = null,
}) {
  const [predecessorId, setPredecessorId] = useState('');
  const [successorId, setSuccessorId] = useState('');
  const [dependencyType, setDependencyType] = useState('FS');
  const [lagDays, setLagDays] = useState('0');
  const [remarks, setRemarks] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (open) {
      setPredecessorId(initialPredecessorId ? String(initialPredecessorId) : '');
      setSuccessorId(initialSuccessorId ? String(initialSuccessorId) : '');
      setDependencyType('FS');
      setLagDays('0');
      setRemarks('');
      setError('');
    }
  }, [open, initialPredecessorId, initialSuccessorId]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!predecessorId) {
      setError('Please select a predecessor activity.');
      return;
    }
    if (!successorId) {
      setError('Please select a successor activity.');
      return;
    }
    if (predecessorId === successorId) {
      setError('An activity cannot have a precedence dependency on itself.');
      return;
    }

    onSubmit({
      predecessorId: Number(predecessorId),
      successorId: Number(successorId),
      dependencyType,
      lagDays: Number(lagDays) || 0,
      remarks: remarks.trim() || null,
    });
  };

  const selectedTypeInfo = DEPENDENCY_TYPES.find((t) => t.value === dependencyType);

  return (
    <Modal
      open={open}
      onClose={() => !isSubmitting && onClose()}
      title="Create Activity Precedence Dependency"
      size="md"
      footer={
        <div className="flex items-center justify-end gap-2 w-full">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
            Link Dependency
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 text-xs">
        {error && (
          <div className="rounded-lg border border-rose-300 bg-rose-50 p-2.5 text-xs text-rose-800 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-300">
            {error}
          </div>
        )}

        {/* Predecessor Activity */}
        <div>
          <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
            1. Predecessor Activity (Must execute first) *
          </label>
          <select
            value={predecessorId}
            onChange={(e) => {
              setPredecessorId(e.target.value);
              setError('');
            }}
            className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
          >
            <option value="">Select Predecessor Task</option>
            {activities.map((act) => {
              const isSummary = !act.parentId || act.level === 1;
              return (
                <option key={act.id} value={act.id}>
                  {isSummary ? '[Summary Task]' : `  ↳ [Sub-task L${act.level || 2}]`} {act.code} &mdash; {act.name} ({act.discipline})
                </option>
              );
            })}
          </select>
        </div>

        {/* Precedence Type */}
        <div>
          <Select
            label="2. Dependency Relationship Type *"
            value={dependencyType}
            onChange={(e) => setDependencyType(e.target.value)}
            options={DEPENDENCY_TYPES}
          />
          {selectedTypeInfo?.description && (
            <p className="mt-1 text-[11px] text-ink-500 italic">
              {selectedTypeInfo.description}
            </p>
          )}
        </div>

        {/* Successor Activity */}
        <div>
          <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
            3. Successor Activity (Depends on predecessor) *
          </label>
          <select
            value={successorId}
            onChange={(e) => {
              setSuccessorId(e.target.value);
              setError('');
            }}
            className="w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
          >
            <option value="">Select Successor Task</option>
            {activities
              .filter((act) => String(act.id) !== String(predecessorId))
              .map((act) => {
                const isSummary = !act.parentId || act.level === 1;
                return (
                  <option key={act.id} value={act.id}>
                    {isSummary ? '[Summary Task]' : `  ↳ [Sub-task L${act.level || 2}]`} {act.code} &mdash; {act.name} ({act.discipline})
                  </option>
                );
              })}
          </select>
        </div>

        {/* Lead / Lag Days */}
        <div>
          <Input
            label="4. Lead / Lag Days (Positive = Lag Delay, Negative = Lead Early Start)"
            type="number"
            step="1"
            value={lagDays}
            onChange={(e) => setLagDays(e.target.value)}
            placeholder="0"
          />
          <span className="mt-1 block text-[10px] text-ink-400">
            Example: +3 days for concrete curing lag before formwork stripping.
          </span>
        </div>

        {/* Remarks */}
        <div>
          <label className="mb-1 block font-semibold text-ink-700 dark:text-ink-200">
            Engineering Remarks / Reason
          </label>
          <textarea
            rows={2}
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            placeholder="e.g. Curing specification as per IS 456..."
            className="w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 dark:text-white outline-none focus:border-brand-500"
          />
        </div>
      </form>
    </Modal>
  );
}
