import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  History,
  Plus,
  RefreshCw,
  Users,
} from 'lucide-react';
import { Button, Input, Modal, Textarea } from '@/design-system';

const REVISION_STORAGE_PREFIX = 'buildtwin_wbs_schedule_revisions_';

function toDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function dateOnly(date) {
  return date.toISOString().slice(0, 10);
}

function formatDate(value) {
  const date = toDate(value);
  return date ? date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not scheduled';
}

function isOpen(activity) {
  return !['COMPLETED', 'CANCELLED', 'CLOSED'].includes(String(activity.status || '').toUpperCase()) && Number(activity.progressPercentage || 0) < 100;
}

function activityWindow(activity) {
  return toDate(activity.plannedStartDate) || toDate(activity.plannedEndDate);
}

function activityFingerprint(activities, workPackages) {
  return JSON.stringify({
    activities: activities.map((a) => [a.id, a.status, a.progressPercentage, a.plannedStartDate, a.plannedEndDate]).sort(),
    workPackages: workPackages.map((w) => [w.id, w.status, w.plannedStartDate, w.plannedEndDate]).sort(),
  });
}

function readRevisions(key) {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '[]');
    return Array.isArray(saved) ? saved : [];
  } catch {
    return [];
  }
}

function MetricCard({ label, value, detail, tone = 'brand', icon }) {
  const tones = {
    brand: 'border-brand-200 bg-brand-50/70 text-brand-700',
    blue: 'border-blue-200 bg-blue-50/70 text-blue-700',
    amber: 'border-amber-200 bg-amber-50/70 text-amber-700',
    rose: 'border-rose-200 bg-rose-50/70 text-rose-700',
  };
  return (
    <div className={`rounded-xl border p-3 ${tones[tone]}`}>
      <div className="flex items-center justify-between gap-2 text-[11px] font-bold uppercase tracking-wider">
        <span>{label}</span>
        {icon}
      </div>
      <p className="mt-1 text-2xl font-extrabold">{value}</p>
      <p className="mt-0.5 text-[11px] opacity-75">{detail}</p>
    </div>
  );
}

export function WbsScheduleControlTab({
  project,
  projectId,
  activities = [],
  workPackages = [],
  onOpenActivities,
  onOpenWorkPackages,
}) {
  const [lookAheadDays, setLookAheadDays] = useState(7);
  const [, setRevisionVersion] = useState(0);
  const [showAllRevisions, setShowAllRevisions] = useState(false);
  const [isRevisionModalOpen, setIsRevisionModalOpen] = useState(false);
  const [revisionTitle, setRevisionTitle] = useState('');
  const [revisionNotes, setRevisionNotes] = useState('');

  const today = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return now;
  }, []);
  const todayKey = dateOnly(today);

  const overdueActivities = useMemo(() => activities
    .filter((activity) => isOpen(activity) && toDate(activity.plannedEndDate) && toDate(activity.plannedEndDate) < today)
    .sort((a, b) => toDate(a.plannedEndDate) - toDate(b.plannedEndDate)), [activities, today]);

  const lookAheadActivities = useMemo(() => {
    const horizon = new Date(today);
    horizon.setDate(horizon.getDate() + lookAheadDays);
    return activities
      .filter((activity) => {
        if (!isOpen(activity)) return false;
        const start = toDate(activity.plannedStartDate);
        const end = toDate(activity.plannedEndDate) || start;
        return start && end && start <= horizon && end >= today;
      })
      .sort((a, b) => (activityWindow(a) || 0) - (activityWindow(b) || 0));
  }, [activities, lookAheadDays, today]);

  const revisionKey = `${REVISION_STORAGE_PREFIX}${projectId}`;
  const revisions = readRevisions(revisionKey);

  const currentSignature = activityFingerprint(activities, workPackages);
  const lastRevision = revisions[0];
  const hasUnrecordedChanges = Boolean(lastRevision && lastRevision.signature !== currentSignature);

  function recordRevision() {
    const nextNumber = (revisions[0]?.number || 0) + 1;
    const revision = {
      id: `${Date.now()}`,
      number: nextNumber,
      title: revisionTitle.trim() || `Schedule update ${nextNumber}`,
      notes: revisionNotes.trim(),
      recordedAt: new Date().toISOString(),
      signature: currentSignature,
      activityCount: activities.length,
      workPackageCount: workPackages.length,
      overdueCount: overdueActivities.length,
      lookAheadCount: lookAheadActivities.length,
    };
    localStorage.setItem(revisionKey, JSON.stringify([revision, ...revisions].slice(0, 20)));
    setRevisionVersion((value) => value + 1);
    setRevisionTitle('');
    setRevisionNotes('');
    setIsRevisionModalOpen(false);
  }

  const scheduledActivities = activities.filter((activity) => toDate(activity.plannedEndDate));
  const projectEnd = scheduledActivities.reduce((latest, activity) => {
    const end = toDate(activity.plannedEndDate);
    return end && (!latest || end > latest) ? end : latest;
  }, null);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3 rounded-xl border border-brand-200 bg-gradient-to-r from-brand-50 to-white p-4">
        <div>
          <div className="flex items-center gap-2 text-brand-700">
            <CalendarClock className="h-5 w-5" />
            <h2 className="text-base font-bold">Schedule Control &amp; Project Management</h2>
          </div>
          <p className="mt-1 max-w-2xl text-xs text-ink-600">
            Coordinate the project schedule, preserve revision history, and focus the next 7 or 14 days of site execution.
          </p>
        </div>
        <button type="button" onClick={() => setIsRevisionModalOpen(true)} className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-brand-700">
          <Plus className="h-3.5 w-3.5" /> Record Schedule Revision
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <MetricCard label="Open Activities" value={activities.filter(isOpen).length} detail={`${activities.length} total activities`} icon={<ClipboardList className="h-4 w-4" />} />
        <MetricCard label="7 Day Look-Ahead" value={lookAheadDays === 7 ? lookAheadActivities.length : '—'} detail="Activities in the next week" tone="blue" icon={<CalendarClock className="h-4 w-4" />} />
        <MetricCard label="Overdue" value={overdueActivities.length} detail="Open activities past planned finish" tone="rose" icon={<AlertTriangle className="h-4 w-4" />} />
        <MetricCard label="Project Finish" value={formatDate(projectEnd && dateOnly(projectEnd))} detail={`${workPackages.length} work packages`} tone="amber" icon={<CheckCircle2 className="h-4 w-4" />} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <section className="rounded-xl border border-surface-border bg-white/80 p-4">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
            <div>
              <h3 className="text-sm font-bold text-ink-900">Execution Look-Ahead</h3>
              <p className="text-[11px] text-ink-500">{project?.name || 'Selected project'} · From {formatDate(todayKey)}</p>
            </div>
            <div className="flex rounded-lg border border-surface-border bg-surface-subtle p-0.5">
              {[7, 14].map((days) => (
                <button key={days} type="button" onClick={() => setLookAheadDays(days)} className={`rounded-md px-3 py-1.5 text-xs font-semibold ${lookAheadDays === days ? 'bg-brand-600 text-white' : 'text-ink-600 hover:bg-white'}`}>
                  {days} days
                </button>
              ))}
            </div>
          </div>
          {lookAheadActivities.length === 0 ? (
            <div className="py-10 text-center text-xs text-ink-500">No open activities fall within this look-ahead window.</div>
          ) : (
            <div className="mt-3 divide-y divide-surface-border">
              {lookAheadActivities.map((activity) => (
                <div key={activity.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-ink-900">{activity.code} · {activity.name}</p>
                    <p className="mt-0.5 text-[11px] text-ink-500">{formatDate(activity.plannedStartDate)} → {formatDate(activity.plannedEndDate)} · {activity.assignedContractor || 'Unassigned'}</p>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="rounded-full bg-blue-50 px-2 py-1 font-semibold text-blue-700">{Number(activity.progressPercentage || 0)}% complete</span>
                    <span className="rounded-full bg-surface-subtle px-2 py-1 font-medium text-ink-600">{activity.status || 'PLANNED'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button type="button" onClick={onOpenActivities} className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-brand-700 hover:text-brand-900">
            Manage activities <span aria-hidden="true">→</span>
          </button>
        </section>

        <section className="rounded-xl border border-rose-200 bg-rose-50/30 p-4">
          <div className="flex items-center justify-between border-b border-rose-200 pb-3">
            <div>
              <h3 className="text-sm font-bold text-rose-900">Overdue Activity Identification</h3>
              <p className="text-[11px] text-rose-700">Automatically based on planned finish and status</p>
            </div>
            <AlertTriangle className="h-5 w-5 text-rose-500" />
          </div>
          {overdueActivities.length === 0 ? (
            <div className="flex items-center gap-2 py-8 text-xs font-medium text-emerald-700"><CheckCircle2 className="h-4 w-4" /> No overdue open activities.</div>
          ) : (
            <div className="mt-2 divide-y divide-rose-200">
              {overdueActivities.slice(0, 6).map((activity) => {
                const daysLate = Math.max(1, Math.ceil((today - toDate(activity.plannedEndDate)) / 86400000));
                return <div key={activity.id} className="flex items-center justify-between gap-2 py-2.5"><div className="min-w-0"><p className="truncate text-xs font-semibold text-rose-900">{activity.code} · {activity.name}</p><p className="text-[11px] text-rose-700">Due {formatDate(activity.plannedEndDate)} · {activity.assignedContractor || 'Unassigned'}</p></div><span className="shrink-0 rounded-full bg-rose-100 px-2 py-1 text-[11px] font-bold text-rose-700">{daysLate}d late</span></div>;
              })}
              {overdueActivities.length > 6 && <p className="pt-2 text-[11px] font-medium text-rose-700">+ {overdueActivities.length - 6} more overdue activities</p>}
            </div>
          )}
        </section>
      </div>

      <section className="rounded-xl border border-surface-border bg-white/80 p-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
          <div><h3 className="text-sm font-bold text-ink-900">Schedule Revision Tracking</h3><p className="text-[11px] text-ink-500">Project: {project?.code || projectId} · Record a revision after an approved schedule change.</p></div>
          <div className="flex items-center gap-2 text-[11px] text-ink-500"><History className="h-4 w-4" /> {revisions.length} saved revision{revisions.length === 1 ? '' : 's'}</div>
        </div>
        {hasUnrecordedChanges && <div className="mt-3 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800"><RefreshCw className="h-3.5 w-3.5" /> Schedule data changed since revision {lastRevision.number}. Record a new revision when approved.</div>}
        {revisions.length === 0 ? <p className="py-6 text-center text-xs text-ink-500">No schedule revisions recorded yet. Use “Record Schedule Revision” after confirming the current baseline or update.</p> : <div className="mt-3 divide-y divide-surface-border">{revisions.slice(0, showAllRevisions ? revisions.length : 5).map((revision) => <div key={revision.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"><div><p className="font-bold text-ink-900">Revision {revision.number} · {revision.title}</p><p className="text-[11px] text-ink-500">{new Date(revision.recordedAt).toLocaleString()}{revision.notes ? ` · ${revision.notes}` : ''}</p></div><div className="flex gap-3 text-ink-600"><span>{revision.workPackageCount} packages</span><span>{revision.activityCount} activities</span><span>{revision.overdueCount} overdue</span></div></div>)}</div>}
        {revisions.length > 5 && <button type="button" onClick={() => setShowAllRevisions((value) => !value)} className="mt-2 text-xs font-semibold text-brand-700">{showAllRevisions ? 'Show less' : 'Show all revisions'}</button>}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-surface-border bg-surface-subtle/50 px-4 py-3 text-xs">
        <div className="flex items-center gap-2 text-ink-600"><Users className="h-4 w-4 text-brand-600" /><span>Project management actions are maintained in Work Packages and Activities.</span></div>
        <button type="button" onClick={onOpenWorkPackages} className="font-semibold text-brand-700 hover:text-brand-900">Manage work packages →</button>
      </div>

      <Modal
        open={isRevisionModalOpen}
        onClose={() => setIsRevisionModalOpen(false)}
        title="Record Schedule Revision"
        size="md"
        footer={(
          <div className="flex w-full items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setIsRevisionModalOpen(false)}>Cancel</Button>
            <Button size="sm" onClick={recordRevision}>Save Revision</Button>
          </div>
        )}
      >
        <div className="flex flex-col gap-3">
          <p className="text-xs text-ink-600">Capture the approved schedule state for {project?.name || 'this project'}. The revision will include the current work packages, activities, overdue count, and look-ahead count.</p>
          <Input label="Revision title" value={revisionTitle} onChange={(event) => setRevisionTitle(event.target.value)} placeholder="e.g. Baseline update after client approval" />
          <Textarea label="Change summary (optional)" value={revisionNotes} onChange={(event) => setRevisionNotes(event.target.value)} rows={3} placeholder="Describe the schedule change, approval, or reason for this revision." />
        </div>
      </Modal>
    </div>
  );
}
