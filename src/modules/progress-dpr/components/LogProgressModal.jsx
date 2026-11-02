import { useState, useEffect } from 'react';
import {
  Calendar,
  Activity,
  HardHat,
  Truck,
  CloudSun,
  AlertTriangle,
  FileText,
} from 'lucide-react';
import { Modal, Button } from '@/design-system';

const WEATHER_OPTIONS = ['SUNNY', 'CLEAR', 'CLOUDY', 'OVERCAST', 'RAINY', 'STORMY', 'WINDY'];

const BLOCKER_CATEGORIES = [
  { value: 'MATERIAL_SHORTAGE', label: 'Material Shortage' },
  { value: 'DESIGN_CLARIFICATION', label: 'Design Clarification / RFI' },
  { value: 'DRAWING_REVISION', label: 'Drawing Revision' },
  { value: 'MANPOWER_SHORTAGE', label: 'Manpower Shortage' },
  { value: 'EQUIPMENT_BREAKDOWN', label: 'Equipment Breakdown' },
  { value: 'WEATHER_DELAY', label: 'Weather Delay' },
  { value: 'SITE_ACCESS', label: 'Site Access Restriction' },
  { value: 'SAFETY_HALT', label: 'Safety Halt' },
  { value: 'PERMIT_APPROVAL', label: 'Permit / Inspection Delay' },
  { value: 'SUBCONTRACTOR_DELAY', label: 'Subcontractor Delay' },
  { value: 'CLIENT_DECISION', label: 'Client Decision Pending' },
  { value: 'PREDECESSOR_INCOMPLETE', label: 'Predecessor Task Incomplete' },
  { value: 'OTHER', label: 'Other Operational Issue' },
];

export function LogProgressModal({
  open,
  onClose,
  activities = [],
  onSave,
  isSaving,
  initialActivityId,
}) {
  const [activityId, setActivityId] = useState('');
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10));
  const [quantityCompletedToday, setQuantityCompletedToday] = useState('');
  const [manpowerCount, setManpowerCount] = useState('');
  const [equipmentUsed, setEquipmentUsed] = useState('');
  const [weatherCondition, setWeatherCondition] = useState('SUNNY');
  const [siteHindranceNotes, setSiteHindranceNotes] = useState('');
  const [remarks, setRemarks] = useState('');
  const [isBlocker, setIsBlocker] = useState(false);
  const [blockerCategory, setBlockerCategory] = useState('MATERIAL_SHORTAGE');
  const [blockerReason, setBlockerReason] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (initialActivityId) {
      setActivityId(String(initialActivityId));
    } else if (activities.length > 0 && !activityId) {
      setActivityId(String(activities[0].id));
    }
  }, [initialActivityId, activities, activityId]);

  const selectedActivity = activities.find((a) => String(a.id) === String(activityId));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!activityId) {
      setErrorMsg('Please select a WBS activity.');
      return;
    }
    const qty = parseFloat(quantityCompletedToday);
    if (isNaN(qty) || qty <= 0) {
      setErrorMsg('Please enter a valid completed quantity greater than 0.');
      return;
    }

    const payload = {
      logDate,
      quantityCompletedToday: qty,
      manpowerCount: manpowerCount ? parseInt(manpowerCount, 10) : null,
      equipmentUsed: equipmentUsed.trim() || null,
      weatherCondition,
      siteHindranceNotes: siteHindranceNotes.trim() || null,
      remarks: remarks.trim() || null,
      isBlocker,
      blockerCategory: isBlocker ? blockerCategory : null,
      blockerReason: isBlocker ? blockerReason.trim() : null,
    };

    try {
      await onSave(Number(activityId), payload);
      // Reset form
      setQuantityCompletedToday('');
      setSiteHindranceNotes('');
      setRemarks('');
      setIsBlocker(false);
      setBlockerReason('');
      onClose();
    } catch (err) {
      setErrorMsg(err?.message || 'Failed to record progress entry.');
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="md"
      title={
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-brand-600" />
          <span className="text-base font-semibold text-ink-900">Record Physical Site Progress</span>
        </div>
      }
      footer={
        <div className="flex w-full items-center justify-end gap-2">
          <Button variant="outline" size="sm" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" onClick={handleSubmit} isLoading={isSaving}>
            Save Progress Entry
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-1">
        {errorMsg && (
          <div className="rounded-lg bg-rose-50 p-2.5 text-xs text-rose-700 border border-rose-200">
            {errorMsg}
          </div>
        )}

        {/* Activity Selection */}
        <div>
          <label className="block text-xs font-semibold text-ink-700">
            WBS Activity <span className="text-status-danger">*</span>
          </label>
          <select
            value={activityId}
            onChange={(e) => setActivityId(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            required
          >
            <option value="">Select activity...</option>
            {activities.map((a) => (
              <option key={a.id} value={a.id}>
                {a.code ? `[${a.code}] ` : ''}
                {a.name} ({a.uom || 'units'} - Planned: {a.plannedQuantity ?? 'N/A'})
              </option>
            ))}
          </select>
          {selectedActivity && (
            <p className="mt-1 text-[11px] text-ink-500">
              Discipline: <strong className="text-ink-700">{selectedActivity.discipline || 'GENERAL'}</strong> | UOM:{' '}
              <strong className="text-ink-700">{selectedActivity.uom || 'Units'}</strong> | Planned:{' '}
              <strong className="text-ink-700">{selectedActivity.plannedQuantity ?? '—'}</strong>
            </p>
          )}
        </div>

        {/* Date and Quantity Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-700">
              Progress Date <span className="text-status-danger">*</span>
            </label>
            <div className="relative mt-1">
              <Calendar className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input
                type="date"
                value={logDate}
                onChange={(e) => setLogDate(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-card py-1.5 pl-9 pr-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700">
              Quantity Completed Today <span className="text-status-danger">*</span>
            </label>
            <div className="relative mt-1">
              <input
                type="number"
                step="any"
                min="0.001"
                placeholder={selectedActivity?.uom ? `e.g. 15.5 (${selectedActivity.uom})` : 'e.g. 15.5'}
                value={quantityCompletedToday}
                onChange={(e) => setQuantityCompletedToday(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-card py-1.5 px-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
                required
              />
            </div>
          </div>
        </div>

        {/* Manpower and Weather Grid */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-semibold text-ink-700">Manpower Headcount</label>
            <div className="relative mt-1">
              <HardHat className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <input
                type="number"
                min="0"
                placeholder="e.g. 14 workers"
                value={manpowerCount}
                onChange={(e) => setManpowerCount(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-card py-1.5 pl-9 pr-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700">Weather Condition</label>
            <div className="relative mt-1">
              <CloudSun className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
              <select
                value={weatherCondition}
                onChange={(e) => setWeatherCondition(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-card py-1.5 pl-9 pr-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
              >
                {WEATHER_OPTIONS.map((w) => (
                  <option key={w} value={w}>
                    {w}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Equipment Deployed */}
        <div>
          <label className="block text-xs font-semibold text-ink-700">Equipment / Machinery Used</label>
          <div className="relative mt-1">
            <Truck className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="e.g. 1 JCB Excavator, 1 Concrete Pump"
              value={equipmentUsed}
              onChange={(e) => setEquipmentUsed(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-card py-1.5 pl-9 pr-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Blocker Flag Toggle */}
        <div className="rounded-xl border border-surface-border bg-surface-subtle p-3">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={isBlocker}
              onChange={(e) => setIsBlocker(e.target.checked)}
              className="rounded border-surface-border text-brand-600 focus:ring-brand-500 h-4 w-4"
            />
            <span className="text-xs font-semibold text-ink-900">
              Activity experienced a Site Execution Blocker / Hindrance today
            </span>
          </label>

          {isBlocker && (
            <div className="mt-3 space-y-2.5 pt-2 border-t border-surface-border">
              <div>
                <label className="block text-[11px] font-semibold text-ink-700">Blocker Category</label>
                <select
                  value={blockerCategory}
                  onChange={(e) => setBlockerCategory(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
                >
                  {BLOCKER_CATEGORIES.map((c) => (
                    <option key={c.value} value={c.value}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-ink-700">Blocker Reason & Root Cause</label>
                <textarea
                  rows={2}
                  placeholder="Describe the cause of delay, material shortage or hindrance..."
                  value={blockerReason}
                  onChange={(e) => setBlockerReason(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
                  required={isBlocker}
                />
              </div>
            </div>
          )}
        </div>

        {/* Site Hindrance Notes */}
        <div>
          <label className="block text-xs font-semibold text-ink-700">Site Hindrance / Delay Notes</label>
          <input
            type="text"
            placeholder="e.g. 1 hour thunderstorm halt, material unloading delay"
            value={siteHindranceNotes}
            onChange={(e) => setSiteHindranceNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card py-1.5 px-3 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          />
        </div>

        {/* Operational Remarks */}
        <div>
          <label className="block text-xs font-semibold text-ink-700">Operational Remarks & Notes</label>
          <textarea
            rows={2}
            placeholder="Grid location poured, quality test cubes taken, handoff notes..."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="mt-1 w-full rounded-lg border border-surface-border bg-surface-card p-2 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          />
        </div>
      </form>
    </Modal>
  );
}
