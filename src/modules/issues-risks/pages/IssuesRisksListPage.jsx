import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  AlertCircle,
  AlertTriangle,
  Award,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Image,
  Layers,
  Play,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Wrench,
  XCircle,
} from 'lucide-react';
import { Button, Input, Modal, Table } from '@/design-system';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import {
  issuesRisksApi,
  ISSUE_TYPES,
  ISSUE_SEVERITIES,
  ISSUE_STATUSES,
  getSeverityBadge,
  getStatusBadge,
} from '../api/issuesRisksApi';

const getSafeImageUrl = (url) => {
  if (!url || typeof url !== 'string' || !url.trim()) return null;
  const trimmed = url.trim();
  if (trimmed.startsWith('blob:')) {
    try {
      const parsed = new URL(trimmed.replace(/^blob:/, ''));
      if (parsed.origin !== window.location.origin) return null;
    } catch {
      return null;
    }
  }
  if (trimmed.includes('storage.buildtwin360.com')) {
    return 'https://images.unsplash.com/photo-1541888946425-d0fbb18615f8?auto=format&fit=crop&w=800&q=80';
  }
  return trimmed;
};

export function IssuesRisksListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const currentUser = useAuthStore((s) => s.user);

  // Role checks for 5-step master lifecycle
  const canLog = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER,
    ROLES.SITE_SUPERVISOR,
    ROLES.QUALITY_ENGINEER
  );
  const canAssign = useHasRole(ROLES.ADMIN, ROLES.PROJECT_MANAGER);
  const canFix = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.SITE_ENGINEER,
    ROLES.CONTRACTOR
  );
  const canAudit = useHasRole(
    ROLES.ADMIN,
    ROLES.PROJECT_MANAGER,
    ROLES.QUALITY_ENGINEER
  );

  // State
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [activeRegister, setActiveRegister] = useState('ISSUES');

  // Modals state
  const [isCreateModalOpen, setCreateModalOpen] = useState(false);
  const [assigningIssue, setAssigningIssue] = useState(null);
  const [resolvingIssue, setResolvingIssue] = useState(null);
  const [auditingIssue, setAuditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);

  // Forms
  const createForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      issueType: 'SNAG',
      severity: 'HIGH',
      initialPhotoUrl: '',
      wbsActivityId: '',
    },
  });

  const assignForm = useForm({
    defaultValues: {
      assignedTo: '',
      assignedToRole: 'CONTRACTOR',
      targetResolutionDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
      severity: 'HIGH',
    },
  });

  const resolveForm = useForm({
    defaultValues: {
      resolutionRemarks: '',
      resolutionPhotoUrl: '',
      actualResolutionDate: new Date().toISOString().slice(0, 10),
    },
  });

  const auditForm = useForm({
    defaultValues: {
      approved: true,
      verificationRemarks: '',
    },
  });

  // Queries
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.list(),
  });

  const projectId = selectedProjectId || projects[0]?.id || 1;
  const currentProject = projects.find((p) => Number(p.id) === Number(projectId));

  const issuesQuery = useQuery({
    queryKey: ['project-issues', projectId, typeFilter, statusFilter, severityFilter],
    queryFn: () =>
      issuesRisksApi.getIssuesByProject(projectId, {
        type: typeFilter,
        status: statusFilter,
        severity: severityFilter,
      }),
    enabled: !!projectId,
  });

  const summaryQuery = useQuery({
    queryKey: ['project-issues-summary', projectId],
    queryFn: () => issuesRisksApi.getIssueSummary(projectId),
    enabled: !!projectId,
  });

  const overdueQuery = useQuery({
    queryKey: ['project-issues-overdue', projectId],
    queryFn: () => issuesRisksApi.getOverdueIssues(projectId),
    enabled: !!projectId,
  });

  const issues = issuesQuery.data || [];
  const summary = summaryQuery.data || {};
  const overdueIssues = overdueQuery.data || [];

  // Mutations for 5-Step Lifecycle
  const createMutation = useMutation({
    mutationFn: (payload) =>
      issuesRisksApi.createIssue({
        ...payload,
        projectId: Number(projectId),
        wbsActivityId: payload.wbsActivityId ? Number(payload.wbsActivityId) : null,
        reportedBy: currentUser?.name || 'Site Engineer',
        reportedRole: currentUser?.roles?.[0] || 'SITE_ENGINEER',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-overdue', projectId] });
      pushToast('Issue / Defect ticket logged successfully with status OPEN.', 'success');
      setCreateModalOpen(false);
      createForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const assignMutation = useMutation({
    mutationFn: ({ id, payload }) => issuesRisksApi.assignIssue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-overdue', projectId] });
      pushToast('Issue assigned and SLA Target Date recorded.', 'success');
      setAssigningIssue(null);
      assignForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const startProgressMutation = useMutation({
    mutationFn: (id) => issuesRisksApi.startProgress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-summary', projectId] });
      pushToast('Issue marked as IN_PROGRESS. Contractor started work.', 'success');
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, payload }) => issuesRisksApi.resolveIssue(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-overdue', projectId] });
      pushToast('Resolution proof submitted. Ticket moved to RESOLVED for QA inspection.', 'success');
      setResolvingIssue(null);
      resolveForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      issuesRisksApi.verifyIssue(id, {
        ...payload,
        verifiedBy: currentUser?.name || 'Quality Lead',
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['project-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-summary', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-issues-overdue', projectId] });
      if (vars.payload.approved) {
        pushToast('QA Audit Passed! Ticket marked as CLOSED ✅', 'success');
      } else {
        pushToast('QA Audit Rejected! Ticket reverted to OPEN for contractor rework ⚠️', 'warning');
      }
      setAuditingIssue(null);
      auditForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  // Client-side search filtering
  const filteredIssues = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return issues;
    return issues.filter(
      (iss) =>
        (iss.ticketNumber && iss.ticketNumber.toLowerCase().includes(q)) ||
        (iss.title && iss.title.toLowerCase().includes(q)) ||
        (iss.assignedTo && iss.assignedTo.toLowerCase().includes(q)) ||
        (iss.reportedBy && iss.reportedBy.toLowerCase().includes(q))
    );
  }, [issues, search]);

  const riskRegister = useMemo(
    () => filteredIssues.filter((issue) => issue.issueType === 'RISK'),
    [filteredIssues]
  );
  const issueRegister = useMemo(
    () => filteredIssues.filter((issue) => issue.issueType !== 'RISK'),
    [filteredIssues]
  );

  // Handlers
  function openAssign(issue) {
    setAssigningIssue(issue);
    assignForm.reset({
      assignedTo: issue.assignedTo || '',
      assignedToRole: issue.assignedToRole || 'CONTRACTOR',
      targetResolutionDate:
        issue.targetResolutionDate ||
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
      severity: issue.severity || 'HIGH',
    });
  }

  function openResolve(issue) {
    setResolvingIssue(issue);
    resolveForm.reset({
      resolutionRemarks: issue.resolutionRemarks || '',
      resolutionPhotoUrl: issue.resolutionPhotoUrl || '',
      actualResolutionDate:
        issue.actualResolutionDate || new Date().toISOString().slice(0, 10),
    });
  }

  function openAudit(issue) {
    setAuditingIssue(issue);
    auditForm.reset({
      approved: true,
      verificationRemarks: '',
    });
  }

  // Table Columns
  const columns = [
    {
      key: 'ticketNumber',
      header: 'Ticket #',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-700">
            {row.ticketNumber || `ISS-${row.id}`}
          </span>
          <span className="text-[10px] text-ink-400">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Defect / Issue Details',
      render: (row) => (
        <div className="flex max-w-sm flex-col gap-0.5">
          <span className="text-xs font-semibold text-ink-900">{row.title}</span>
          {row.description && (
            <span className="line-clamp-1 text-[11px] text-ink-500">{row.description}</span>
          )}
          <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
            <span className="rounded bg-surface-subtle px-1.5 py-0.5 font-medium text-ink-700">
              Type: {row.issueType}
            </span>
            {row.wbsActivityId && <span>WBS #{row.wbsActivityId}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase tracking-wider ${getSeverityBadge(
            row.severity
          )}`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Lifecycle State',
      render: (row) => (
        <div className="flex flex-col gap-1">
          <span
            className={`inline-block rounded-md px-2 py-0.5 text-center text-xs ${getStatusBadge(
              row.status
            )}`}
          >
            {row.status.replace(/_/g, ' ')}
          </span>
          {row.isOverdue && row.status !== 'CLOSED' && (
            <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-red-600">
              <AlertTriangle className="h-3 w-3" /> Overdue SLA!
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'assignment',
      header: 'Assigned & SLA',
      render: (row) => (
        <div className="flex flex-col text-xs text-ink-700">
          <span className="font-medium text-ink-900">{row.assignedTo || 'Unassigned'}</span>
          <span className="text-[11px] text-ink-500">
            {row.targetResolutionDate ? (
              <span
                className={
                  row.isOverdue && row.status !== 'CLOSED'
                    ? 'font-bold text-red-600'
                    : 'text-ink-600'
                }
              >
                Due: {row.targetResolutionDate}
              </span>
            ) : (
              'No SLA'
            )}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Master Action',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          {/* Quick Details View */}
          <button
            type="button"
            title="View full ticket details & photos"
            onClick={() => setViewingIssue(row)}
            className="rounded p-1.5 text-ink-500 hover:bg-surface-subtle hover:text-ink-900"
          >
            <Eye className="h-4 w-4" />
          </button>

          {/* Step 2 Action: Assign & Set SLA */}
          {row.status === 'OPEN' && canAssign && (
            <Button size="xs" variant="outline" onClick={() => openAssign(row)}>
              <UserCheck className="mr-1 h-3.5 w-3.5" />
              Assign &amp; SLA
            </Button>
          )}

          {/* Step 3A Action: Start Work */}
          {row.status === 'ASSIGNED' && canFix && (
            <Button
              size="xs"
              variant="outline"
              onClick={() => startProgressMutation.mutate(row.id)}
              isLoading={startProgressMutation.isPending}
            >
              <Play className="mr-1 h-3.5 w-3.5 text-brand-600" />
              Start Work
            </Button>
          )}

          {/* Step 3B Action: Submit Resolution */}
          {row.status === 'IN_PROGRESS' && canFix && (
            <Button size="xs" variant="primary" onClick={() => openResolve(row)}>
              <Wrench className="mr-1 h-3.5 w-3.5" />
              Submit Resolution
            </Button>
          )}

          {/* Step 4 Action: QA Audit Verification */}
          {row.status === 'RESOLVED' && canAudit && (
            <Button
              size="xs"
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => openAudit(row)}
            >
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Audit Sign-off
            </Button>
          )}

          {/* Closed State */}
          {row.status === 'CLOSED' && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  const riskColumns = [
    {
      key: 'ticketNumber',
      header: 'Risk ID',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-700">{row.ticketNumber || `RISK-${row.id}`}</span>
          <span className="text-[10px] text-ink-400">Logged {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}</span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Risk / Trigger',
      render: (row) => (
        <div className="max-w-sm">
          <p className="text-xs font-semibold text-ink-900">{row.title}</p>
          <p className="mt-0.5 line-clamp-2 text-[11px] text-ink-500">{row.description || 'No trigger or mitigation notes recorded.'}</p>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Risk Level',
      render: (row) => (
        <span className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${getSeverityBadge(row.severity)}`}>
          {row.severity}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Treatment Status',
      render: (row) => (
        <span className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${getStatusBadge(row.status)}`}>
          {row.status.replace(/_/g, ' ')}
        </span>
      ),
    },
    {
      key: 'owner',
      header: 'Owner / Review Date',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-ink-900">{row.assignedTo || 'Unassigned'}</span>
          <span className="text-[11px] text-ink-500">Review: {row.targetResolutionDate || 'Not set'}</span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) => (
        <Button size="xs" variant="outline" onClick={() => setViewingIssue(row)}>
          <Eye className="mr-1 h-3.5 w-3.5" /> View register entry
        </Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <ModulePageHeading>Issues and Risks</ModulePageHeading>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm font-semibold text-ink-900 outline-none"
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.code} — {p.name}
              </option>
            ))}
          </select>
          {canLog && (
            <Button size="sm" onClick={() => setCreateModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Log Defect / Issue
            </Button>
          )}
        </div>
      </div>

      {/* Overdue SLA Red Alert Banner */}
      {overdueIssues.length > 0 && (
        <div className="flex items-center justify-between rounded-xl border border-red-300 bg-red-50 p-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-600 text-white">
              <ShieldAlert className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-red-900">
                🚨 RED ALERT: {overdueIssues.length} Ticket(s) Exceeded SLA Target Resolution Date!
              </p>
              <p className="text-xs text-red-700">
                Contractors have crossed committed SLA delivery dates without site audit verification. Immediate executive escalation required.
              </p>
            </div>
          </div>
          <Button
            size="xs"
            variant="danger"
            onClick={() => {
              setStatusFilter('ALL');
              setSearch('');
            }}
          >
            Review Overdue ({overdueIssues.length})
          </Button>
        </div>
      )}

      {/* Executive KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7">
        <KpiCard
          label="Total Tickets"
          value={summary.totalIssues ?? issues.length}
          icon={Layers}
          tone="neutral"
        />
        <KpiCard
          label="Open / Logged"
          value={summary.openCount ?? issues.filter((i) => i.status === 'OPEN').length}
          icon={AlertCircle}
          tone="danger"
        />
        <KpiCard
          label="In Progress"
          value={
            summary.inProgressCount ??
            issues.filter((i) => i.status === 'IN_PROGRESS' || i.status === 'ASSIGNED').length
          }
          icon={Wrench}
          tone="brand"
        />
        <KpiCard
          label="Pending QA Audit"
          value={
            summary.resolvedCount ?? issues.filter((i) => i.status === 'RESOLVED').length
          }
          icon={FileCheck2}
          tone="warning"
        />
        <KpiCard
          label="Closed &amp; Verified"
          value={summary.closedCount ?? issues.filter((i) => i.status === 'CLOSED').length}
          icon={CheckCircle2}
          tone="success"
        />
        <KpiCard
          label="Overdue SLA"
          value={summary.overdueCount ?? overdueIssues.length}
          icon={Clock}
          tone={summary.overdueCount > 0 ? 'critical' : 'neutral'}
        />
        <KpiCard
          label="Resolution Rate"
          value={`${Math.round(summary.resolutionPercentage || 0)}%`}
          icon={Award}
          tone="success"
        />
      </div>

      {/* Issue workspace / Risk register */}
      <div className="flex border-b border-surface-border">
        <button
          type="button"
          onClick={() => {
            setActiveRegister('ISSUES');
            setTypeFilter('ALL');
          }}
          className={`px-4 py-2.5 text-xs font-semibold ${activeRegister === 'ISSUES' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-ink-500'}`}
        >
          Issue lifecycle ({issues.filter((issue) => issue.issueType !== 'RISK').length})
        </button>
        <button
          type="button"
          onClick={() => {
            setActiveRegister('RISKS');
            setTypeFilter('RISK');
          }}
          className={`px-4 py-2.5 text-xs font-semibold ${activeRegister === 'RISKS' ? 'border-b-2 border-brand-600 text-brand-700' : 'text-ink-500'}`}
        >
          Risk register ({issues.filter((issue) => issue.issueType === 'RISK').length})
        </button>
      </div>

      {activeRegister === 'RISKS' && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <KpiCard label="Registered Risks" value={riskRegister.length} icon={AlertTriangle} tone="neutral" />
          <KpiCard label="Critical / High" value={riskRegister.filter((risk) => risk.severity === 'CRITICAL' || risk.severity === 'HIGH').length} icon={ShieldAlert} tone="critical" />
          <KpiCard label="Open Treatment" value={riskRegister.filter((risk) => risk.status !== 'CLOSED').length} icon={Clock} tone="warning" />
          <KpiCard label="Overdue Reviews" value={riskRegister.filter((risk) => risk.isOverdue).length} icon={Calendar} tone="danger" />
        </div>
      )}

      {/* Filters & Search Toolbar */}
      <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-3">
        {/* Search */}
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search ticket #, defect title, contractor..."
            className="w-full bg-transparent outline-none"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none"
          >
            <option value="ALL">All Issue Types</option>
            {ISSUE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none"
          >
            <option value="ALL">All Statuses</option>
            {ISSUE_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ')}
              </option>
            ))}
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none"
          >
            <option value="ALL">All Severities</option>
            {ISSUE_SEVERITIES.map((sev) => (
              <option key={sev} value={sev}>
                {sev}
              </option>
            ))}
          </select>

          {/* Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              issuesQuery.refetch();
              summaryQuery.refetch();
              overdueQuery.refetch();
            }}
            disabled={issuesQuery.isFetching}
          >
            <RefreshCw
              className={`mr-1.5 h-4 w-4 ${issuesQuery.isFetching ? 'animate-spin' : ''}`}
            />
            Refresh
          </Button>
        </div>
      </div>

      {/* Main Table / Risk Register */}
      <Table
        columns={activeRegister === 'RISKS' ? riskColumns : columns}
        data={activeRegister === 'RISKS' ? riskRegister : issueRegister}
        rowKey={(row) => row.id}
        isLoading={issuesQuery.isLoading}
        emptyMessage={
          activeRegister === 'RISKS'
            ? 'No project risks match the selected filters.'
            : currentProject
            ? 'No tickets logged matching the selected filters.'
            : 'Select a project to inspect quality issues.'
        }
      />

      {/* ======================================================== */}
      {/* STEP 1: Log Issue / Defect Modal */}
      {/* ======================================================== */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="📸 Step 1: Identify & Log Defect / Issue Ticket"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={createForm.handleSubmit((values) => createMutation.mutate(values))}
              isLoading={createMutation.isPending}
            >
              Log Ticket (Status: OPEN)
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={createForm.handleSubmit((values) => createMutation.mutate(values))}
        >
          <Input
            label="Defect / Problem Title *"
            placeholder="e.g. Honeycombing detected in Basement Column B4"
            {...createForm.register('title', { required: 'Title is required' })}
            error={createForm.formState.errors.title?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Ticket Type *
              <select
                {...createForm.register('issueType')}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                {ISSUE_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Severity Level *
              <select
                {...createForm.register('severity')}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                {ISSUE_SEVERITIES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Defect Description &amp; Technical Root Cause
            <textarea
              rows={3}
              placeholder="e.g. Insufficient vibration during concrete pouring leading to surface aggregate voids..."
              {...createForm.register('description')}
              className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
            />
          </label>

          <Input
            label="Initial Defect Photo URL"
            placeholder="https://storage.buildtwin360.com/defects/column_b4.jpg"
            {...createForm.register('initialPhotoUrl')}
          />

          <Input
            label="WBS Activity ID (Optional tag)"
            type="number"
            placeholder="e.g. 10"
            {...createForm.register('wbsActivityId')}
          />
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* STEP 2: Assign & Set SLA Modal */}
      {/* ======================================================== */}
      <Modal
        open={Boolean(assigningIssue)}
        onClose={() => setAssigningIssue(null)}
        title={`👷 Step 2: Assign Contractor & Set SLA (${assigningIssue?.ticketNumber || ''})`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setAssigningIssue(null)}>
              Cancel
            </Button>
            <Button
              onClick={assignForm.handleSubmit((values) =>
                assignMutation.mutate({ id: assigningIssue.id, payload: values })
              )}
              isLoading={assignMutation.isPending}
            >
              Assign &amp; Set SLA (Status: ASSIGNED)
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={assignForm.handleSubmit((values) =>
            assignMutation.mutate({ id: assigningIssue.id, payload: values })
          )}
        >
          <div className="rounded-lg bg-surface-subtle p-3 text-xs text-ink-700">
            <span className="font-semibold text-ink-900">Issue:</span> {assigningIssue?.title}
          </div>

          <Input
            label="Assigned Contractor / Engineer *"
            placeholder="e.g. Shree Constructions / Karthik Contractor"
            {...assignForm.register('assignedTo', { required: 'Assignee is required' })}
            error={assignForm.formState.errors.assignedTo?.message}
          />

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Assignee Role
              <select
                {...assignForm.register('assignedToRole')}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="CONTRACTOR">CONTRACTOR</option>
                <option value="SITE_ENGINEER">SITE_ENGINEER</option>
                <option value="SITE_SUPERVISOR">SITE_SUPERVISOR</option>
              </select>
            </label>

            <Input
              label="SLA Target Resolution Date *"
              type="date"
              {...assignForm.register('targetResolutionDate', {
                required: 'Target date is required',
              })}
              error={assignForm.formState.errors.targetResolutionDate?.message}
            />
          </div>
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* STEP 3B: Submit Resolution Proof Modal */}
      {/* ======================================================== */}
      <Modal
        open={Boolean(resolvingIssue)}
        onClose={() => setResolvingIssue(null)}
        title={`🔨 Step 3B: Submit Rectification Proof (${resolvingIssue?.ticketNumber || ''})`}
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setResolvingIssue(null)}>
              Cancel
            </Button>
            <Button
              className="bg-brand-600 text-white hover:bg-brand-700"
              onClick={resolveForm.handleSubmit((values) =>
                resolveMutation.mutate({ id: resolvingIssue.id, payload: values })
              )}
              isLoading={resolveMutation.isPending}
            >
              Submit Proof (Status: RESOLVED)
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={resolveForm.handleSubmit((values) =>
            resolveMutation.mutate({ id: resolvingIssue.id, payload: values })
          )}
        >
          <div className="rounded-lg bg-surface-subtle p-3 text-xs text-ink-700">
            <p className="font-semibold text-ink-900">{resolvingIssue?.title}</p>
            {resolvingIssue?.targetResolutionDate && (
              <p className="mt-1 text-[11px] text-ink-500">
                Committed SLA Target: {resolvingIssue.targetResolutionDate}
              </p>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Rectification Remarks (Method &amp; Materials Used) *
            <textarea
              rows={3}
              placeholder="e.g. Chipped loose concrete, applied bonding agent and filled with Sika Grout 214..."
              {...resolveForm.register('resolutionRemarks', {
                required: 'Resolution remarks are required',
              })}
              className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
            />
          </label>

          <Input
            label="Resolution Proof Photo URL"
            placeholder="https://storage.buildtwin360.com/proof/column_b4_resolved.jpg"
            {...resolveForm.register('resolutionPhotoUrl')}
          />

          <Input
            label="Actual Resolution Date"
            type="date"
            {...resolveForm.register('actualResolutionDate')}
          />
        </form>
      </Modal>

      {/* ======================================================== */}
      {/* STEP 4: Quality Audit Verification Modal */}
      {/* ======================================================== */}
      <Modal
        open={Boolean(auditingIssue)}
        onClose={() => setAuditingIssue(null)}
        title={`🕵️ Step 4: Quality Engineer Site Audit Sign-off (${auditingIssue?.ticketNumber || ''})`}
        size="md"
        footer={
          <div className="flex w-full items-center justify-between">
            <Button variant="outline" onClick={() => setAuditingIssue(null)}>
              Cancel
            </Button>
            <div className="flex gap-2">
              <Button
                variant="danger"
                onClick={() => {
                  auditForm.setValue('approved', false);
                  auditForm.handleSubmit((values) =>
                    verifyMutation.mutate({
                      id: auditingIssue.id,
                      payload: { ...values, approved: false },
                    })
                  )();
                }}
                isLoading={verifyMutation.isPending}
              >
                <XCircle className="mr-1 h-4 w-4" />
                Reject &amp; Revert to OPEN
              </Button>
              <Button
                className="bg-emerald-600 text-white hover:bg-emerald-700"
                onClick={() => {
                  auditForm.setValue('approved', true);
                  auditForm.handleSubmit((values) =>
                    verifyMutation.mutate({
                      id: auditingIssue.id,
                      payload: { ...values, approved: true },
                    })
                  )();
                }}
                isLoading={verifyMutation.isPending}
              >
                <ShieldCheck className="mr-1 h-4 w-4" />
                Approve &amp; CLOSE Ticket
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-surface-subtle p-3 text-xs">
            <p className="font-bold text-ink-900">{auditingIssue?.title}</p>
            <p className="mt-1 text-ink-600">
              Contractor Remarks: {auditingIssue?.resolutionRemarks || 'None'}
            </p>
            {auditingIssue?.resolutionPhotoUrl && (
              <div className="mt-2">
                <span className="font-semibold text-ink-700">Proof Attachment:</span>{' '}
                <a
                  href={auditingIssue.resolutionPhotoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-brand-600 underline"
                >
                  View Photo Proof
                </a>
              </div>
            )}
          </div>

          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Audit Inspection Notes / Non-Conformance Details *
            <textarea
              rows={3}
              placeholder="e.g. Inspected on site. Rebound hammer test passed. Rectified as per IS:456 standard."
              {...auditForm.register('verificationRemarks')}
              className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </Modal>

      {/* ======================================================== */}
      {/* Detail & Evidence Drawer */}
      {/* ======================================================== */}
      {viewingIssue && (
        <Modal
          open={Boolean(viewingIssue)}
          onClose={() => setViewingIssue(null)}
          title={`Ticket Audit Log: ${viewingIssue.ticketNumber || `ISS-${viewingIssue.id}`}`}
          size="lg"
          footer={
            <Button variant="outline" onClick={() => setViewingIssue(null)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-surface-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">{viewingIssue.title}</h3>
                <p className="mt-0.5 text-ink-500">
                  Logged by {viewingIssue.reportedBy || 'Site Engineer'} (
                  {viewingIssue.reportedRole || 'ENGINEER'})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`rounded-full px-2 py-0.5 text-[10px] uppercase ${getSeverityBadge(
                    viewingIssue.severity
                  )}`}
                >
                  {viewingIssue.severity}
                </span>
                <span
                  className={`rounded px-2 py-0.5 font-bold ${getStatusBadge(
                    viewingIssue.status
                  )}`}
                >
                  {viewingIssue.status}
                </span>
              </div>
            </div>

            {/* Photos Comparison */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-surface-border p-3">
                <p className="mb-2 font-bold text-ink-800">📸 Initial Defect Photo</p>
                {getSafeImageUrl(viewingIssue.initialPhotoUrl) ? (
                  <img
                    src={getSafeImageUrl(viewingIssue.initialPhotoUrl)}
                    alt="Defect"
                    className="h-44 w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-lg bg-surface-subtle text-ink-400">
                    No initial photo uploaded
                  </div>
                )}
              </div>

              <div className="rounded-xl border border-surface-border p-3">
                <p className="mb-2 font-bold text-ink-800">✅ Resolution Proof Photo</p>
                {getSafeImageUrl(viewingIssue.resolutionPhotoUrl) ? (
                  <img
                    src={getSafeImageUrl(viewingIssue.resolutionPhotoUrl)}
                    alt="Resolved"
                    className="h-44 w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="flex h-44 items-center justify-center rounded-lg bg-surface-subtle text-ink-400">
                    No resolution proof photo uploaded yet
                  </div>
                )}
              </div>
            </div>

            {/* Description & Remarks */}
            <div className="grid grid-cols-1 gap-3 rounded-xl bg-surface-subtle p-3 sm:grid-cols-2">
              <div>
                <p className="font-semibold text-ink-700">Root Cause Description:</p>
                <p className="mt-1 text-ink-600">{viewingIssue.description || '—'}</p>
              </div>
              <div>
                <p className="font-semibold text-ink-700">Rectification Remarks:</p>
                <p className="mt-1 text-ink-600">{viewingIssue.resolutionRemarks || '—'}</p>
              </div>
            </div>

            {/* SLA & Verification Audit */}
            <div className="grid grid-cols-2 gap-3 border-t border-surface-border pt-3 sm:grid-cols-4">
              <div>
                <p className="text-ink-400">Target SLA Date</p>
                <p className="font-semibold text-ink-800">
                  {viewingIssue.targetResolutionDate || '—'}
                </p>
              </div>
              <div>
                <p className="text-ink-400">Actual Resolved Date</p>
                <p className="font-semibold text-ink-800">
                  {viewingIssue.actualResolutionDate || '—'}
                </p>
              </div>
              <div>
                <p className="text-ink-400">Verified By</p>
                <p className="font-semibold text-ink-800">{viewingIssue.verifiedBy || '—'}</p>
              </div>
              <div>
                <p className="text-ink-400">Audit Remarks</p>
                <p className="font-semibold text-ink-800">
                  {viewingIssue.verificationRemarks || '—'}
                </p>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function KpiCard({ label, value, icon: Icon, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'text-ink-900 border-surface-border',
    brand: 'text-brand-700 border-brand-200 bg-brand-50/30',
    danger: 'text-red-700 border-red-200 bg-red-50/40',
    critical: 'text-red-700 border-red-400 bg-red-100 font-bold animate-pulse',
    warning: 'text-amber-700 border-amber-200 bg-amber-50/30',
    success: 'text-emerald-700 border-emerald-200 bg-emerald-50/30',
  };

  return (
    <div
      className={`flex items-center justify-between rounded-xl border p-3.5 shadow-sm ${
        toneClasses[tone] || toneClasses.neutral
      }`}
    >
      <div>
        <p className="text-[11px] font-semibold uppercase tracking-wider text-ink-500">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </div>
      <Icon className="h-5 w-5 opacity-75" />
    </div>
  );
}
