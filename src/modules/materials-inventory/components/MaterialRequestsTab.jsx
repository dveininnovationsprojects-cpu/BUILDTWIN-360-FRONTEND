import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ClipboardPen,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FileCheck,
  Eye,
  Calendar,
  Layers,
  Check,
  X,
  Filter,
  IndianRupee,
} from 'lucide-react';
import { Table, Button, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole, useAuthStore } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import {
  materialRequestsApi,
  MATERIAL_REQUEST_STATUSES,
  REQUEST_PRIORITIES,
} from '../api/materialRequestsApi';
import { UNIT_LABEL_MAP } from '../api/materialsInventoryApi';
import { MaterialRequestModal } from './MaterialRequestModal';
import { MaterialRequestDetailModal } from './MaterialRequestDetailModal';

export function MaterialRequestsTab({
  materials = [],
  onOpenIssueModal,
  onRequestNew,
  selectedMaterialForRequest = null,
}) {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const currentUser = useAuthStore((s) => s.user);

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');

  // Modal states
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [modalInitialMaterial, setModalInitialMaterial] = useState(null);

  const canApprove = useHasRole(
    ROLES.PROJECT_MANAGER,
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROCUREMENT_STORE
  );

  // Fetch all material requests
  const {
    data: requests = [],
    isLoading,
    refetch,
    isRefetching,
  } = useQuery({
    queryKey: ['material-requests'],
    queryFn: () => materialRequestsApi.listByProject(1),
    staleTime: 15_000,
  });

  // Fast quick-approve mutation directly from table
  const quickApproveMutation = useMutation({
    mutationFn: async (req) => {
      return materialRequestsApi.updateApproval(req.id, {
        status: 'APPROVED',
        approvedBy: currentUser?.name || currentUser?.username || 'Project Manager',
        remarks: 'Quick-approved from Material Requests dashboard.',
      });
    },
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: ['material-requests'] });
      pushToast(`Request ${updated.requestNumber} approved.`, 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to approve request.', 'error'),
  });

  // KPI Calculations
  const totalCount = requests.length;
  const pendingCount = requests.filter((r) => r.status === 'PENDING').length;
  const approvedCount = requests.filter((r) => r.status === 'APPROVED').length;

  const totalRequestedValue = useMemo(() => {
    return requests.reduce((acc, req) => {
      const mat = materials.find((m) => String(m.id) === String(req.materialId));
      const rate = Number(mat?.standardRate ?? 0);
      return acc + Number(req.requiredQty ?? 0) * rate;
    }, 0);
  }, [requests, materials]);

  // Filter requests
  const filteredRequests = useMemo(() => {
    return requests.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.requestNumber?.toLowerCase().includes(q) ||
        r.materialName?.toLowerCase().includes(q) ||
        r.materialCode?.toLowerCase().includes(q) ||
        r.requestedBy?.toLowerCase().includes(q) ||
        r.zone?.toLowerCase().includes(q);

      const matchesStatus = !statusFilter || r.status === statusFilter;
      const matchesPriority = !priorityFilter || r.priority === priorityFilter;

      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [requests, searchQuery, statusFilter, priorityFilter]);

  const handleOpenCreate = (mat = null) => {
    setModalInitialMaterial(mat || selectedMaterialForRequest);
    setIsCreateOpen(true);
  };

  const columns = [
    {
      key: 'requestNumber',
      header: 'Request Ref',
      render: (row) => (
        <div>
          <span className="font-semibold text-ink-900 block text-xs">{row.requestNumber}</span>
          <span className="text-[10px] text-ink-400">
            {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : ''}
          </span>
        </div>
      ),
    },
    {
      key: 'material',
      header: 'Material Item',
      render: (row) => {
        const mat = materials.find((m) => String(m.id) === String(row.materialId));
        return (
          <div>
            <span className="font-medium text-ink-900 block text-xs">{row.materialName}</span>
            <span className="text-[10px] font-mono text-ink-400">
              {row.materialCode || mat?.materialCode || 'SKU'} · {mat?.category || 'General'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'requiredQty',
      header: 'Quantity',
      render: (row) => {
        const unitLabel = UNIT_LABEL_MAP[row.unit] || row.unit || '';
        return (
          <span className="font-bold text-ink-900 text-xs">
            {Number(row.requiredQty).toLocaleString()}{' '}
            <span className="text-[11px] font-normal text-ink-500">{unitLabel}</span>
          </span>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => {
        const pDef = REQUEST_PRIORITIES.find((p) => p.value === row.priority);
        return (
          <span className={`rounded-full border px-2 py-0.5 text-[10px] font-bold ${pDef?.badge || ''}`}>
            {pDef?.label || row.priority || 'Normal'}
          </span>
        );
      },
    },
    {
      key: 'requiredDate',
      header: 'Required By',
      render: (row) => {
        if (!row.requiredDate) return <span className="text-ink-400 text-xs">—</span>;
        const reqDate = new Date(row.requiredDate);
        const isUrgent = reqDate <= new Date(Date.now() + 2 * 86400000);
        return (
          <span className={`text-xs flex items-center gap-1 ${isUrgent ? 'font-semibold text-amber-700' : 'text-ink-700'}`}>
            <Calendar className="h-3 w-3 text-ink-400" />
            {reqDate.toLocaleDateString()}
          </span>
        );
      },
    },
    {
      key: 'location',
      header: 'Zone / Location',
      render: (row) => (
        <span className="text-xs text-ink-600 block truncate max-w-[140px]" title={row.zone || row.siteName}>
          {row.zone || row.siteName || 'Site Store'}
        </span>
      ),
    },
    {
      key: 'requestedBy',
      header: 'Requested By',
      render: (row) => (
        <span className="text-xs text-ink-700 font-medium block truncate max-w-[110px]" title={row.requestedBy}>
          {row.requestedBy}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill status={row.status} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setSelectedRequest(row)}
            className="rounded p-1 text-ink-400 hover:bg-surface-subtle hover:text-ink-900 transition-colors"
            title="View Details"
          >
            <Eye className="h-4 w-4" />
          </button>

          {row.status === 'PENDING' && canApprove && (
            <button
              type="button"
              onClick={() => quickApproveMutation.mutate(row)}
              disabled={quickApproveMutation.isPending}
              className="rounded p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
              title="Quick Approve Request"
            >
              <Check className="h-4 w-4" />
            </button>
          )}

          {row.status === 'APPROVED' && onOpenIssueModal && (
            <button
              type="button"
              onClick={() => onOpenIssueModal(row)}
              className="rounded p-1 text-brand-600 hover:bg-brand-50 dark:hover:bg-brand-950/40 transition-colors"
              title="Issue Stock (Fulfill)"
            >
              <FileCheck className="h-4 w-4" />
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total Requisitions',
            value: totalCount,
            icon: ClipboardPen,
            color: 'text-brand-700 bg-brand-50/70 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800 dark:text-brand-300',
          },
          {
            label: 'Pending Approvals',
            value: pendingCount,
            icon: Clock,
            color: 'text-status-warning bg-status-warningBg border-status-warning/30',
          },
          {
            label: 'Approved & Ready',
            value: approvedCount,
            icon: CheckCircle2,
            color: 'text-status-success bg-status-successBg border-status-success/30',
          },
          {
            label: 'Demand Valuation',
            value: `₹${totalRequestedValue.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`,
            icon: IndianRupee,
            color: 'text-indigo-700 bg-indigo-50/70 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800 dark:text-indigo-300',
          },
        ].map(({ label, value, icon: Icon, color }) => (
          <div
            key={label}
            className={`group flex flex-col justify-between rounded-xl border p-3 shadow-xs transition-all hover:shadow-md min-h-[82px] ${color}`}
          >
            <div className="flex items-center justify-between gap-1">
              <span className="text-xs font-semibold opacity-85 leading-tight">
                {label}
              </span>
              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white/80 dark:bg-black/25 shadow-xs">
                <Icon className="h-3.5 w-3.5" />
              </div>
            </div>
            <div className="mt-2 flex items-baseline">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-ink-900 leading-none">
                {value}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Control Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card p-3">
        <div className="flex flex-1 flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
            <input
              type="text"
              placeholder="Search request ref, material, requester, zone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Statuses</option>
            {MATERIAL_REQUEST_STATUSES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
          >
            <option value="">All Priorities</option>
            {REQUEST_PRIORITIES.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </div>

        <Button
          size="sm"
          onClick={() => handleOpenCreate(null)}
          className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700"
        >
          <Plus className="h-4 w-4" />
          Raise Material Request
        </Button>
      </div>

      {/* Requests Table */}
      <Table
        columns={columns}
        data={filteredRequests}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => setSelectedRequest(row)}
        emptyMessage={
          searchQuery || statusFilter || priorityFilter
            ? 'No material requisitions match your filter criteria.'
            : 'No material requests raised yet. Click "Raise Material Request" to submit a site indent.'
        }
      />

      {/* Material Request Form Modal */}
      <MaterialRequestModal
        open={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setModalInitialMaterial(null);
        }}
        initialMaterial={modalInitialMaterial}
        allMaterials={materials}
        onSuccess={() => refetch()}
      />

      {/* Material Request Detail Modal */}
      <MaterialRequestDetailModal
        open={Boolean(selectedRequest)}
        onClose={() => setSelectedRequest(null)}
        request={selectedRequest}
        material={materials.find((m) => String(m.id) === String(selectedRequest?.materialId))}
        onIssueMaterial={(req) => onOpenIssueModal?.(req)}
      />
    </div>
  );
}
