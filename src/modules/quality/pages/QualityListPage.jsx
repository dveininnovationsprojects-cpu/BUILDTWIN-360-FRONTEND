import { useEffect, useMemo, useState } from 'react';
import { QualityNcrDefectAnalyticsModule } from '../components/QualityNcrDefectAnalyticsModule';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  Filter,
  Layers,
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
import { FileUpload } from '@/design-system/components/FileUpload/FileUpload';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import {
  issuesRisksApi,
  getSeverityBadge,
  getStatusBadge,
} from '@/modules/issues-risks/api/issuesRisksApi';

const QUALITY_WORKFLOW = ['OPEN', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

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

function QualityStatusWorkflow({ status }) {
  const currentIndex = Math.max(0, QUALITY_WORKFLOW.indexOf(status));

  return (
    <div className="rounded-xl border border-surface-border bg-surface-subtle/50 p-3">
      <div className="mb-2 flex items-center justify-between">
        <p className="text-xs font-bold text-ink-900">Status workflow</p>
        <span className="text-[10px] font-semibold uppercase text-ink-500">Open → Closed</span>
      </div>
      <div className="grid grid-cols-5 gap-1">
        {QUALITY_WORKFLOW.map((step, index) => (
          <div key={step} className="flex min-w-0 flex-col items-center gap-1">
            <div className="flex w-full items-center">
              <div
                className={`h-1 flex-1 rounded-full ${index <= currentIndex ? 'bg-brand-600' : 'bg-surface-border'}`}
              />
            </div>
            <span
              className={`text-center text-[9px] font-semibold ${index <= currentIndex ? 'text-brand-700' : 'text-ink-400'}`}
            >
              {step.replace(/_/g, ' ')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function QualityListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const currentUser = useAuthStore((s) => s.user);

  const canManage = useHasRole(
    ROLES.QUALITY_ENGINEER,
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL_QUALITY'); // 'ALL_QUALITY', 'NCR', 'SNAG'
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals state
  const [isNcrModalOpen, setNcrModalOpen] = useState(false);
  const [auditingIssue, setAuditingIssue] = useState(null);
  const [viewingIssue, setViewingIssue] = useState(null);
  const [evidenceFiles, setEvidenceFiles] = useState([]);
  const [evidencePreviewUrl, setEvidencePreviewUrl] = useState('');

  const ncrForm = useForm({
    defaultValues: {
      title: '',
      description: '',
      issueType: 'NCR',
      severity: 'HIGH',
      initialPhotoUrl: '',
      wbsActivityId: '',
    },
  });

  useEffect(() => {
    return () => {
      if (evidencePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(evidencePreviewUrl);
    };
  }, [evidencePreviewUrl]);

  function resetNcrEvidence() {
    if (evidencePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(evidencePreviewUrl);
    setEvidenceFiles([]);
    setEvidencePreviewUrl('');
  }

  function handleEvidenceSelected(files) {
    if (evidencePreviewUrl?.startsWith('blob:')) URL.revokeObjectURL(evidencePreviewUrl);
    setEvidenceFiles(files);
    const firstImage = files.find((file) => file.type.startsWith('image/'));
    setEvidencePreviewUrl(firstImage ? URL.createObjectURL(firstImage) : '');
  }

  const auditForm = useForm({
    defaultValues: {
      approved: true,
      verificationRemarks: '',
    },
  });

  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list'],
    queryFn: () => projectsApi.list(),
  });

  const projectId = selectedProjectId || projects[0]?.id || 1;
  const currentProject = projects.find((p) => Number(p.id) === Number(projectId));

  // Query issues
  const { data: rawIssues = [], isLoading } = useQuery({
    queryKey: ['quality-issues', projectId, statusFilter],
    queryFn: () =>
      issuesRisksApi.getIssuesByProject(projectId, {
        status: statusFilter,
      }),
    enabled: !!projectId,
  });

  const { data: summary = {} } = useQuery({
    queryKey: ['quality-summary', projectId],
    queryFn: () => issuesRisksApi.getIssueSummary(projectId),
    enabled: !!projectId,
  });

  const { data: overdueIssues = [] } = useQuery({
    queryKey: ['quality-overdue', projectId],
    queryFn: () => issuesRisksApi.getOverdueIssues(projectId),
    enabled: !!projectId,
  });

  // Filter to Quality-specific types (NCR and SNAG) or all based on tab
  const qualityIssues = useMemo(() => {
    return rawIssues.filter((item) => {
      if (activeTab === 'NCR') return item.issueType === 'NCR';
      if (activeTab === 'SNAG') return item.issueType === 'SNAG';
      return item.issueType === 'NCR' || item.issueType === 'SNAG' || item.issueType === 'DEFECT';
    });
  }, [rawIssues, activeTab]);

  const filteredData = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return qualityIssues;
    return qualityIssues.filter(
      (iss) =>
        (iss.ticketNumber && iss.ticketNumber.toLowerCase().includes(q)) ||
        (iss.title && iss.title.toLowerCase().includes(q)) ||
        (iss.assignedTo && iss.assignedTo.toLowerCase().includes(q))
    );
  }, [qualityIssues, search]);

  const createNcrMutation = useMutation({
    mutationFn: (values) =>
      issuesRisksApi.createIssue({
        ...values,
        initialPhotoUrl: values.initialPhotoUrl || (evidencePreviewUrl && !evidencePreviewUrl.startsWith('blob:') ? evidencePreviewUrl : ''),
        projectId: Number(projectId),
        wbsActivityId: values.wbsActivityId ? Number(values.wbsActivityId) : null,
        reportedBy: currentUser?.name || 'QA Lead',
        reportedRole: currentUser?.roles?.[0] || 'QUALITY_ENGINEER',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quality-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['quality-summary', projectId] });
      pushToast('Quality Non-Conformance Report (NCR) logged successfully.', 'success');
      setNcrModalOpen(false);
      ncrForm.reset();
      resetNcrEvidence();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, payload }) =>
      issuesRisksApi.verifyIssue(id, {
        ...payload,
        verifiedBy: currentUser?.name || 'QA Auditor',
      }),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['quality-issues', projectId] });
      queryClient.invalidateQueries({ queryKey: ['quality-summary', projectId] });
      if (vars.payload.approved) {
        pushToast('Site Audit Passed! Defect closed and signed off ✅', 'success');
      } else {
        pushToast('Site Audit Rejected! Rework required ⚠️', 'warning');
      }
      setAuditingIssue(null);
      auditForm.reset();
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const columns = [
    {
      key: 'ticketNumber',
      header: 'NCR / Snag Ref',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-mono text-xs font-bold text-brand-700">
            {row.ticketNumber || `NCR-${row.id}`}
          </span>
          <span className="text-[10px] text-ink-400">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'title',
      header: 'Defect Description & Root Cause',
      render: (row) => (
        <div className="flex max-w-sm flex-col">
          <span className="text-xs font-semibold text-ink-900">{row.title}</span>
          {row.description && (
            <span className="line-clamp-1 text-[11px] text-ink-500">{row.description}</span>
          )}
          <div className="mt-1 flex items-center gap-2 text-[10px] text-ink-500">
            <span className="font-semibold text-brand-700">{row.issueType}</span>
            {row.wbsActivityId && <span>· WBS #{row.wbsActivityId}</span>}
          </div>
        </div>
      ),
    },
    {
      key: 'severity',
      header: 'Severity',
      render: (row) => (
        <span
          className={`inline-block rounded-full px-2 py-0.5 text-[10px] uppercase ${getSeverityBadge(
            row.severity
          )}`}
        >
          {row.severity}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Audit Status',
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
            <span className="font-mono text-[10px] font-bold text-red-600">
              Overdue SLA!
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'contractor',
      header: 'Rectifying Contractor',
      render: (row) => (
        <div className="flex flex-col text-xs text-ink-700">
          <span className="font-medium text-ink-900">{row.assignedTo || 'Unassigned'}</span>
          <span className="text-[11px] text-ink-500">
            Due: {row.targetResolutionDate || 'No SLA'}
          </span>
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Audit Actions',
      className: 'text-right',
      render: (row) => (
        <div className="flex items-center justify-end gap-1.5">
          <button
            type="button"
            title="Inspect proof & history"
            onClick={() => setViewingIssue(row)}
            className="rounded p-1.5 text-ink-500 hover:bg-surface-subtle hover:text-ink-900"
          >
            <Eye className="h-4 w-4" />
          </button>

          {row.status === 'RESOLVED' && canManage && (
            <Button
              size="xs"
              className="bg-amber-600 text-white hover:bg-amber-700"
              onClick={() => {
                setAuditingIssue(row);
                auditForm.reset({ approved: true, verificationRemarks: '' });
              }}
            >
              <ShieldCheck className="mr-1 h-3.5 w-3.5" />
              Conduct QA Audit
            </Button>
          )}

          {row.status === 'CLOSED' && (
            <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-xs font-semibold text-emerald-700">
              <CheckCircle2 className="h-3.5 w-3.5" /> Verified
            </span>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <ModulePageHeading>Quality &amp; Inspections (NCR)</ModulePageHeading>
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
          {canManage && (
            <Button size="sm" onClick={() => setNcrModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Raise Quality NCR
            </Button>
          )}
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-6">
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Total Quality NCRs</p>
          <p className="mt-1 text-xl font-bold text-brand-900">{summary.ncrCount ?? 0}</p>
        </div>
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Snag List Items</p>
          <p className="mt-1 text-xl font-bold text-brand-900">{summary.snagCount ?? 0}</p>
        </div>
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Critical / High</p>
          <p className="mt-1 text-xl font-bold text-red-600">
            {(summary.criticalCount || 0) + (summary.highCount || 0)}
          </p>
        </div>
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Pending QA Audit</p>
          <p className="mt-1 text-xl font-bold text-amber-600">{summary.resolvedCount ?? 0}</p>
        </div>
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Verified &amp; Closed</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">{summary.closedCount ?? 0}</p>
        </div>
        <div className="surface-panel p-3.5">
          <p className="text-[11px] font-semibold uppercase text-ink-500">Quality Pass Rate</p>
          <p className="mt-1 text-xl font-bold text-emerald-700">
            {Math.round(summary.resolutionPercentage || 0)}%
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-surface-border">
        <button
          type="button"
          onClick={() => setActiveTab('ALL_QUALITY')}
          className={`px-4 py-2.5 text-xs font-semibold ${
            activeTab === 'ALL_QUALITY'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          All Quality Records ({qualityIssues.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('NCR')}
          className={`px-4 py-2.5 text-xs font-semibold ${
            activeTab === 'NCR'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          Non-Conformance Reports (NCR) ({rawIssues.filter((i) => i.issueType === 'NCR').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('SNAG')}
          className={`px-4 py-2.5 text-xs font-semibold ${
            activeTab === 'SNAG'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          Snag Lists ({rawIssues.filter((i) => i.issueType === 'SNAG').length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('QUALITY_ANALYTICS')}
          className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-1.5 ${
            activeTab === 'QUALITY_ANALYTICS'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          <ShieldAlert className="h-3.5 w-3.5 text-rose-600" />
          NCR Ageing &amp; Defect Analytics (KPI-QLT-01 &amp; 02)
        </button>
      </div>

      {activeTab === 'QUALITY_ANALYTICS' ? (
        <QualityNcrDefectAnalyticsModule projectId={projectId} />
      ) : (
        <>
          {/* Toolbar */}
          <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-3">
        <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm">
          <Search className="h-4 w-4 text-ink-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search NCR ref, defect title, contractor..."
            className="w-full bg-transparent outline-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-ink-800 outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">OPEN</option>
            <option value="ASSIGNED">ASSIGNED</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="RESOLVED">RESOLVED (Pending Audit)</option>
            <option value="CLOSED">CLOSED (Passed)</option>
          </select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['quality-issues'] })}
          >
            <RefreshCw className="mr-1 h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Table */}
      <Table
        columns={columns}
        data={filteredData}
        rowKey={(r) => r.id}
        isLoading={isLoading}
        emptyMessage="No quality or NCR records found."
      />

        </>
      )}

      {/* Raise NCR Modal */}
      <Modal
        open={isNcrModalOpen}
        onClose={() => {
          setNcrModalOpen(false);
          resetNcrEvidence();
        }}
        title="Create NCR / Snag & Attach Evidence"
        size="md"
        footer={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setNcrModalOpen(false);
                resetNcrEvidence();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={ncrForm.handleSubmit((values) => createNcrMutation.mutate(values))}
              isLoading={createNcrMutation.isPending}
            >
              Issue NCR Ticket
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={ncrForm.handleSubmit((values) => createNcrMutation.mutate(values))}
        >
          <Input
            label="NCR Title / Defect Summary *"
            placeholder="e.g. Honeycombing detected in Basement Column B4"
            {...ncrForm.register('title', { required: 'Title is required' })}
            error={ncrForm.formState.errors.title?.message}
          />
          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Type *
              <select
                {...ncrForm.register('issueType')}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="NCR">NCR (Non-Conformance)</option>
                <option value="SNAG">Snagging Defect</option>
              </select>
            </label>
            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Severity Level *
              <select
                {...ncrForm.register('severity')}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>
            </label>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Audit Observation / Root Cause
            <textarea
              rows={3}
              placeholder="e.g. Vibration was insufficient during concreting, leading to aggregate pockets..."
              {...ncrForm.register('description')}
              className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
            />
          </label>
          <Input
            label="Hosted Evidence URL (optional)"
            placeholder="https://storage.buildtwin360.com/defects/b4_defect.jpg"
            {...ncrForm.register('initialPhotoUrl')}
          />
          <div className="rounded-xl border border-surface-border bg-surface-subtle/50 p-3">
            <div className="mb-2 flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-bold text-ink-900">Evidence upload</p>
                <p className="mt-0.5 text-[11px] text-ink-500">
                  Attach site photos or inspection PDFs. Images are used as the initial defect evidence.
                </p>
              </div>
              <span className="rounded-full bg-brand-50 px-2 py-1 text-[10px] font-semibold text-brand-700">
                {evidenceFiles.length} attached
              </span>
            </div>
            <FileUpload
              key={isNcrModalOpen ? 'ncr-evidence-open' : 'ncr-evidence-closed'}
              label=""
              accept="image/*,.pdf"
              multiple
              maxSizeMb={10}
              onFilesSelected={handleEvidenceSelected}
            />
            {evidencePreviewUrl && (
              <div className="mt-3 overflow-hidden rounded-lg border border-surface-border bg-white">
                <img
                  src={evidencePreviewUrl}
                  alt="Selected defect evidence preview"
                  className="h-36 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
                <p className="px-2 py-1.5 text-[10px] text-ink-500">
                  Preview: {evidenceFiles.find((file) => file.type.startsWith('image/'))?.name}
                </p>
              </div>
            )}
            {evidenceFiles.some((file) => file.type === 'application/pdf') && (
              <p className="mt-2 text-[11px] text-ink-500">
                PDF evidence attached and included with this NCR record.
              </p>
            )}
          </div>
        </form>
      </Modal>

      {/* Audit Modal */}
      <Modal
        open={Boolean(auditingIssue)}
        onClose={() => setAuditingIssue(null)}
        title={`Conduct QA Site Audit: ${auditingIssue?.ticketNumber || ''}`}
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
                <XCircle className="mr-1 h-4 w-4" /> Reject (Re-open)
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
                <ShieldCheck className="mr-1 h-4 w-4" /> Pass &amp; Close NCR
              </Button>
            </div>
          </div>
        }
      >
        <div className="flex flex-col gap-4">
          <div className="rounded-lg bg-surface-subtle p-3 text-xs">
            <p className="font-bold text-ink-900">{auditingIssue?.title}</p>
            <p className="mt-1 text-ink-600">
              Contractor Rectification: {auditingIssue?.resolutionRemarks || 'None'}
            </p>
          </div>
          <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
            Site Audit Remarks &amp; Quality Test Results *
            <textarea
              rows={3}
              placeholder="e.g. Inspected on site. Rebound hammer test passed. Rectified as per IS:456."
              {...auditForm.register('verificationRemarks')}
              className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
            />
          </label>
        </div>
      </Modal>

      {/* Details Modal */}
      {viewingIssue && (
        <Modal
          open={Boolean(viewingIssue)}
          onClose={() => setViewingIssue(null)}
          title={`NCR Quality Record: ${viewingIssue.ticketNumber || `NCR-${viewingIssue.id}`}`}
          size="lg"
          footer={
            <Button variant="outline" onClick={() => setViewingIssue(null)}>
              Close
            </Button>
          }
        >
          <div className="flex flex-col gap-4 text-xs">
            <h3 className="text-sm font-bold text-ink-900">{viewingIssue.title}</h3>
            <QualityStatusWorkflow status={viewingIssue.status} />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-surface-border p-3">
                <p className="mb-2 font-bold text-ink-800">Defect Evidence</p>
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
                    No photo uploaded
                  </div>
                )}
              </div>
              <div className="rounded-xl border border-surface-border p-3">
                <p className="mb-2 font-bold text-ink-800">Resolution Evidence</p>
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
                    Pending resolution proof
                  </div>
                )}
              </div>
            </div>
            <div className="rounded-xl bg-surface-subtle p-3">
              <p className="font-semibold text-ink-700">Audit Verification Remarks:</p>
              <p className="mt-1 text-ink-600">{viewingIssue.verificationRemarks || '—'}</p>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
