import React, { useState, useEffect } from 'react';
import { Modal, Button, StatusPill, Spinner } from '@/design-system';
import {
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  GitBranch,
  Clock,
  Layers,
  ShieldCheck,
  ShieldAlert,
} from 'lucide-react';
import { activityDependenciesApi } from '../api/wbsScheduleApi';
import { DEPENDENCY_TYPE_BADGES } from '../constants/wbsConstants';

export function WbsActivityReadinessModal({
  activity,
  open,
  onClose,
  onOpenCreateDependency,
}) {
  const [chain, setChain] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (activity && open) {
      setIsLoading(true);
      activityDependenciesApi
        .getDependencyChain(activity.id)
        .then((res) => setChain(res))
        .catch((err) => {
          console.warn('Failed to load dependency chain:', err);
          setChain(null);
        })
        .finally(() => setIsLoading(false));
    } else {
      setChain(null);
    }
  }, [activity, open]);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Activity Readiness & Precedence Diagnostics"
      size="lg"
      footer={
        <div className="flex items-center justify-between w-full">
          {onOpenCreateDependency && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                onClose();
                onOpenCreateDependency(activity);
              }}
              className="flex items-center gap-1.5"
            >
              <GitBranch className="h-3.5 w-3.5 text-brand-600" />
              Link New Precedence Dependency
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose} className="ml-auto">
            Close
          </Button>
        </div>
      }
    >
      <div className="flex flex-col gap-4 text-xs">
        {/* Activity Details Header */}
        <div className="flex items-start justify-between rounded-xl border border-surface-border bg-surface-subtle p-3.5">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded">
                {activity?.code}
              </span>
              <span className="text-[11px] font-semibold text-ink-500 uppercase">
                {activity?.discipline}
              </span>
            </div>
            <h3 className="font-bold text-ink-900 text-sm mt-1">{activity?.name}</h3>
            <p className="text-ink-500 mt-0.5">
              Work Package: <strong className="text-ink-700">{activity?.workPackageName || 'WP'}</strong>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <StatusPill status={activity?.status || 'PLANNED'} />
            <span className="text-[11px] font-medium text-ink-500">
              {Number(activity?.progressPercentage || 0).toFixed(1)}% Done
            </span>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 text-ink-400 gap-2">
            <Spinner size="md" />
            <span>Analyzing dependency chain & precedence validation...</span>
          </div>
        ) : chain ? (
          <>
            {/* Readiness Banner */}
            <div
              className={`rounded-xl border p-4 flex items-center justify-between gap-3 ${
                chain.isReadyToStart
                  ? 'border-emerald-300 bg-emerald-50/70 text-emerald-900 dark:border-emerald-900/40 dark:bg-emerald-950/20 dark:text-emerald-300'
                  : 'border-amber-300 bg-amber-50/70 text-amber-900 dark:border-amber-900/40 dark:bg-amber-950/20 dark:text-amber-300'
              }`}
            >
              <div className="flex items-center gap-3">
                {chain.isReadyToStart ? (
                  <ShieldCheck className="h-8 w-8 text-emerald-600 shrink-0" />
                ) : (
                  <ShieldAlert className="h-8 w-8 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm">
                    {chain.isReadyToStart
                      ? 'Ready for Site Execution (No Blocking Predecessors)'
                      : `Execution Blocked: ${chain.blockingPredecessorsCount} Incomplete Predecessor(s)`}
                  </h4>
                  <p className="text-[11px] opacity-80 mt-0.5">
                    {chain.isReadyToStart
                      ? 'All required predecessor prerequisite tasks are completed. Activity can proceed.'
                      : 'Dependent activities must be completed or meet lag criteria before work commences.'}
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span
                  className={`inline-flex px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                    chain.isReadyToStart
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-white'
                  }`}
                >
                  {chain.isReadyToStart ? 'Ready' : 'Blocked'}
                </span>
              </div>
            </div>

            {/* Blocking Warnings */}
            {!chain.isReadyToStart && chain.blockingPredecessorNames?.length > 0 && (
              <div className="rounded-lg border border-rose-200 bg-rose-50/50 p-3 text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/20 dark:text-rose-300">
                <span className="font-bold flex items-center gap-1.5 mb-1 text-xs">
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
                  Prerequisite Activities Blocking Execution:
                </span>
                <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                  {chain.blockingPredecessorNames.map((name, i) => (
                    <li key={i}>{name}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Predecessors (Incoming links) */}
            <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-brand-600" />
                  Incoming Predecessors ({chain.predecessors?.length || 0})
                </span>
                <span className="text-[11px] text-ink-500">Tasks that must precede this</span>
              </div>

              {chain.predecessors && chain.predecessors.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {chain.predecessors.map((p) => (
                    <div
                      key={p.id}
                      className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-subtle p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          {p.predecessorCode}
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900">{p.predecessorName}</p>
                          <p className="text-[10px] text-ink-400">
                            {p.predecessorDiscipline} &bull; {p.predecessorStatus} (
                            {Number(p.predecessorProgressPercentage || 0).toFixed(0)}%)
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            DEPENDENCY_TYPE_BADGES[p.dependencyType] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {p.dependencyType || 'FS'}
                        </span>
                        {p.lagDays !== 0 && (
                          <span className="text-[11px] font-mono text-ink-500 flex items-center gap-0.5">
                            <Clock className="h-3 w-3" />
                            {p.lagDays > 0 ? `+${p.lagDays}d` : `${p.lagDays}d`}
                          </span>
                        )}
                        <StatusPill status={p.predecessorStatus || 'PLANNED'} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 italic py-2 text-center text-xs">
                  No incoming predecessors configured. This is an initial or unconstrained task.
                </p>
              )}
            </div>

            {/* Successors (Outgoing links) */}
            <div className="rounded-xl border border-surface-border bg-surface-card p-3.5 flex flex-col gap-2.5">
              <div className="flex items-center justify-between border-b border-surface-border pb-2">
                <span className="font-bold text-ink-900 flex items-center gap-1.5">
                  <ArrowRight className="h-4 w-4 text-brand-600" />
                  Outgoing Successors ({chain.successors?.length || 0})
                </span>
                <span className="text-[11px] text-ink-500">Tasks waiting on this completion</span>
              </div>

              {chain.successors && chain.successors.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {chain.successors.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-subtle p-2.5"
                    >
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[11px] font-bold text-brand-700 bg-brand-50 px-1.5 py-0.5 rounded">
                          {s.successorCode}
                        </span>
                        <div>
                          <p className="font-semibold text-ink-900">{s.successorName}</p>
                          <p className="text-[10px] text-ink-400">
                            {s.successorDiscipline} &bull; {s.successorStatus}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                            DEPENDENCY_TYPE_BADGES[s.dependencyType] || 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {s.dependencyType || 'FS'}
                        </span>
                        {s.lagDays !== 0 && (
                          <span className="text-[11px] font-mono text-ink-500">
                            {s.lagDays > 0 ? `+${s.lagDays}d` : `${s.lagDays}d`}
                          </span>
                        )}
                        <StatusPill status={s.successorStatus || 'PLANNED'} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-ink-400 italic py-2 text-center text-xs">
                  No downstream successor tasks currently linked to this activity.
                </p>
              )}
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-surface-border p-8 text-center text-ink-500">
            No dependency constraints currently linked. You can establish precedence links to schedule activities sequentially.
          </div>
        )}
      </div>
    </Modal>
  );
}
