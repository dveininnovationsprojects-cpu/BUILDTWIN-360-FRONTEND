import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Truck,
  Plus,
  Clock,
  RefreshCw,
  Search,
  Filter,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Trash2,
  Edit,
  Activity,
  Layers,
} from 'lucide-react';
import { Table, Button, StatusPill } from '@/design-system';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { equipmentApi } from '../api/equipmentApi';
import { EquipmentMetricsBar } from '../components/EquipmentMetricsBar';
import { EquipmentRegisterModal } from '../components/EquipmentRegisterModal';
import { EquipmentUsageModal } from '../components/EquipmentUsageModal';

export function EquipmentListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const [activeTab, setActiveTab] = useState('ASSETS'); // 'ASSETS' | 'USAGE' | 'ANALYTICS'
  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL'); // 'ALL' | 'AVAILABLE' | 'IN_USE' | 'MAINTENANCE'
  const [searchQuery, setSearchQuery] = useState('');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isUsageOpen, setIsUsageOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState(null);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN,
    ROLES.PROCUREMENT_STORE
  );

  // Fetch Projects for site allocation
  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.content || []);

  // Fetch Equipment Assets Directory (FR-100)
  const {
    data: equipmentData = [],
    isLoading: isEquipmentLoading,
    refetch: refetchEquipment,
  } = useQuery({
    queryKey: ['equipment-list'],
    queryFn: () => equipmentApi.list(),
  });
  const equipmentList = Array.isArray(equipmentData) ? equipmentData : (equipmentData?.content || []);

  // Fetch Daily Usage Logs (FR-101, FR-102)
  const {
    data: usageData = [],
    isLoading: isUsageLoading,
    refetch: refetchUsage,
  } = useQuery({
    queryKey: ['equipment-usage', selectedProjectId],
    queryFn: () => equipmentApi.getUsageByProject(selectedProjectId),
    enabled: Boolean(selectedProjectId),
  });
  const usageLogs = Array.isArray(usageData) ? usageData : (usageData?.content || []);

  // Mutations
  const registerMutation = useMutation({
    mutationFn: (payload) =>
      payload.id ? equipmentApi.update(payload.id, payload) : equipmentApi.create(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['equipment-list'] });
      pushToast(
        variables.id
          ? 'Equipment asset updated successfully.'
          : 'New equipment asset registered in fleet.',
        'success'
      );
      setIsRegisterOpen(false);
      setEditingEquipment(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to save equipment asset.', 'error');
    },
  });

  const statusToggleMutation = useMutation({
    mutationFn: ({ id, status, row }) =>
      equipmentApi.update(id, {
        assetCode: row?.assetCode,
        name: row?.name,
        type: row?.type,
        status,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-list'] });
      pushToast('Equipment status updated.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to change status.', 'error'),
  });

  const deleteEquipmentMutation = useMutation({
    mutationFn: (id) => equipmentApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-list'] });
      pushToast('Equipment removed from fleet register.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete equipment.', 'error'),
  });

  const recordUsageMutation = useMutation({
    mutationFn: (payload) => equipmentApi.recordUsage(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-usage', selectedProjectId] });
      pushToast('Daily equipment usage & downtime logged.', 'success');
      setIsUsageOpen(false);
    },
    onError: (err) => pushToast(err?.message || 'Failed to record usage log.', 'error'),
  });

  const deleteUsageMutation = useMutation({
    mutationFn: (id) => equipmentApi.deleteUsage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-usage', selectedProjectId] });
      pushToast('Equipment usage log deleted.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete usage log.', 'error'),
  });

  // Filtered Equipment List
  const filteredEquipment = useMemo(() => {
    return equipmentList.filter((item) => {
      const matchesStatus =
        statusFilter === 'ALL' || item.status === statusFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.assetCode?.toLowerCase().includes(q) ||
        item.name?.toLowerCase().includes(q) ||
        item.type?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [equipmentList, statusFilter, searchQuery]);

  // Equipment Map for quick lookup in Usage Logs
  const equipmentMap = useMemo(() => {
    const map = new Map();
    equipmentList.forEach((eq) => map.set(eq.id, eq));
    return map;
  }, [equipmentList]);

  // Asset Table Columns
  const assetColumns = [
    {
      key: 'assetCode',
      header: 'Asset Code & Equipment',
      render: (row) => (
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <span className="font-mono font-bold text-xs bg-surface-subtle px-2 py-0.5 rounded border border-surface-border text-brand-900">
              {row.assetCode}
            </span>
            <span className="text-xs font-semibold text-ink-900">{row.name}</span>
          </div>
          <span className="text-[11px] text-ink-500 font-medium">Type: {row.type || 'GENERAL'}</span>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Category',
      render: (row) => (
        <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-surface-subtle text-ink-700 border border-surface-border">
          {row.type || 'OTHER'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => {
        const variant =
          row.status === 'AVAILABLE'
            ? 'success'
            : row.status === 'IN_USE'
            ? 'warning'
            : 'danger';
        return <StatusPill status={row.status || 'AVAILABLE'} variant={variant} />;
      },
    },
    {
      key: 'registered',
      header: 'Registered',
      render: (row) => (
        <span className="text-xs text-ink-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {canManage && (
            <>
              {/* Quick status dropdown / toggle */}
              {row.status !== 'IN_USE' && (
                <Button
                  size="xs"
                  variant="outline"
                  title="Mark In-Use"
                  onClick={() => statusToggleMutation.mutate({ id: row.id, status: 'IN_USE', row })}
                >
                  <Clock className="h-3 w-3 mr-1 text-amber-600" />
                  In-Use
                </Button>
              )}
              {row.status !== 'AVAILABLE' && (
                <Button
                  size="xs"
                  variant="outline"
                  title="Mark Available"
                  onClick={() => statusToggleMutation.mutate({ id: row.id, status: 'AVAILABLE', row })}
                >
                  <CheckCircle2 className="h-3 w-3 mr-1 text-emerald-600" />
                  Available
                </Button>
              )}
              {row.status !== 'MAINTENANCE' && (
                <Button
                  size="xs"
                  variant="ghost"
                  title="Mark Maintenance"
                  onClick={() => statusToggleMutation.mutate({ id: row.id, status: 'MAINTENANCE', row })}
                >
                  <Wrench className="h-3.5 w-3.5 text-red-600" />
                </Button>
              )}
              <Button
                size="xs"
                variant="ghost"
                title="Edit Equipment"
                onClick={() => {
                  setEditingEquipment(row);
                  setIsRegisterOpen(true);
                }}
              >
                <Edit className="h-3.5 w-3.5 text-ink-500 hover:text-ink-900" />
              </Button>
              <Button
                size="xs"
                variant="ghost"
                title="Delete Equipment"
                onClick={() => {
                  if (window.confirm(`Delete equipment ${row.assetCode} - ${row.name}?`)) {
                    deleteEquipmentMutation.mutate(row.id);
                  }
                }}
              >
                <Trash2 className="h-3.5 w-3.5 text-status-danger" />
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

  // Usage Table Columns
  const usageColumns = [
    {
      key: 'equipment',
      header: 'Equipment Asset',
      render: (row) => {
        const eq = equipmentMap.get(row.equipmentId);
        return (
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-ink-900">
              {eq ? `${eq.assetCode} - ${eq.name}` : `Equipment #${row.equipmentId}`}
            </span>
            <span className="text-[11px] text-ink-500 font-mono">
              Type: {eq?.type || 'MACHINERY'}
            </span>
          </div>
        );
      },
    },
    {
      key: 'usageDate',
      header: 'Date',
      render: (row) => (
        <span className="text-xs font-medium text-ink-700">
          {row.usageDate || 'N/A'}
        </span>
      ),
    },
    {
      key: 'hoursUsed',
      header: 'Operating Hours',
      render: (row) => {
        const hrs = Number(row.hoursUsed || 0);
        return (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-ink-900">{hrs.toFixed(1)} hrs</span>
            <div className="w-16 bg-surface-subtle h-1.5 rounded-full overflow-hidden border border-surface-border">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${Math.min(100, (hrs / 10) * 100)}%` }}
              />
            </div>
          </div>
        );
      },
    },
    {
      key: 'downtimeHours',
      header: 'Downtime Hours',
      render: (row) => {
        const dt = Number(row.downtimeHours || 0);
        return (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              dt > 0 ? 'text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-200' : 'text-ink-500'
            }`}
          >
            {dt > 0 && <AlertTriangle className="h-3 w-3 text-red-500" />}
            {dt.toFixed(1)} hrs
          </span>
        );
      },
    },
    {
      key: 'efficiency',
      header: 'Utilization Ratio',
      render: (row) => {
        const hrs = Number(row.hoursUsed || 0);
        const dt = Number(row.downtimeHours || 0);
        const total = hrs + dt;
        const ratio = total > 0 ? Math.round((hrs / total) * 100) : 100;
        return (
          <span
            className={`text-xs font-semibold ${
              ratio >= 85 ? 'text-emerald-700' : ratio >= 70 ? 'text-amber-700' : 'text-red-700'
            }`}
          >
            {ratio}% Uptime
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          {canManage && (
            <Button
              size="xs"
              variant="ghost"
              title="Delete Usage Log"
              onClick={() => {
                if (window.confirm('Delete this equipment usage log?')) {
                  deleteUsageMutation.mutate(row.id);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5 text-status-danger" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <ModulePageHeading>Equipment &amp; Machinery</ModulePageHeading>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-surface-base border border-surface-border rounded-lg px-2.5 py-1">
            <Layers className="h-3.5 w-3.5 text-ink-500" />
            <select
              className="bg-transparent text-xs font-semibold text-ink-800 focus:outline-none cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} - ` : ''}{p.name}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetchEquipment();
              refetchUsage();
            }}
            title="Refresh equipment data"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          {canManage && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsUsageOpen(true)}
              >
                <Clock className="h-4 w-4 mr-1.5 text-brand-600" />
                Log Daily Usage
              </Button>
              <Button
                size="sm"
                onClick={() => {
                  setEditingEquipment(null);
                  setIsRegisterOpen(true);
                }}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Register Asset
              </Button>
            </>
          )}
        </div>
      </div>

      {/* KPI Metric Cards */}
      <EquipmentMetricsBar
        equipmentList={equipmentList}
        usageLogs={usageLogs}
        selectedStatus={statusFilter}
        onSelectStatus={(status) => setStatusFilter(status || 'ALL')}
      />

      {/* Tabs Navigation */}
      <div className="flex items-center justify-between border-b border-surface-border">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('ASSETS')}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'ASSETS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Truck className="h-4 w-4" />
            Asset Register &amp; Fleet ({equipmentList.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('USAGE')}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'USAGE'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Clock className="h-4 w-4" />
            Daily Usage &amp; Downtime Logs ({usageLogs.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('ANALYTICS')}
            className={`px-4 py-2.5 text-xs font-semibold transition-colors border-b-2 -mb-px flex items-center gap-2 ${
              activeTab === 'ANALYTICS'
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <Activity className="h-4 w-4" />
            Utilization &amp; Health Insights
          </button>
        </div>
      </div>

      {/* Tab 1: Equipment Assets Directory */}
      {activeTab === 'ASSETS' && (
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-ink-500 font-medium mr-1 flex items-center gap-1">
                <Filter className="h-3 w-3" /> Filter Status:
              </span>
              {['ALL', 'AVAILABLE', 'IN_USE', 'MAINTENANCE'].map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`px-2.5 py-1 text-xs rounded-md font-medium transition-colors ${
                    statusFilter === status
                      ? 'bg-brand-600 text-white shadow-sm'
                      : 'bg-surface-subtle text-ink-600 hover:bg-surface-border'
                  }`}
                >
                  {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                </button>
              ))}
            </div>
            <span className="text-xs text-ink-500">
              Showing {filteredEquipment.length} of {equipmentList.length} registered assets
            </span>
          </div>

          <Table
            columns={assetColumns}
            data={filteredEquipment}
            rowKey={(row) => row.id}
            isLoading={isEquipmentLoading}
            emptyMessage="No equipment assets found matching your criteria."
          />
        </div>
      )}

      {/* Tab 2: Daily Usage & Downtime Logs */}
      {activeTab === 'USAGE' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <p className="text-xs text-ink-600">
              Equipment operating hours and mechanical downtime logs for Project #{selectedProjectId}.
            </p>
            {canManage && (
              <Button size="xs" onClick={() => setIsUsageOpen(true)}>
                <Plus className="h-3.5 w-3.5 mr-1" />
                Record New Log
              </Button>
            )}
          </div>

          <Table
            columns={usageColumns}
            data={usageLogs}
            rowKey={(row) => row.id}
            isLoading={isUsageLoading}
            emptyMessage={`No usage logs found for Project #${selectedProjectId}. Click "Record New Log" to add.`}
          />
        </div>
      )}

      {/* Tab 3: Utilization & Health Insights */}
      {activeTab === 'ANALYTICS' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="surface-panel p-5 rounded-xl border border-surface-border flex flex-col gap-4">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-brand-600" />
              Fleet Availability &amp; Readiness
            </h3>
            <p className="text-xs text-ink-500">
              Percentage of machinery operational without breakdown impediments across all project sites.
            </p>
            <div className="flex flex-col gap-3 mt-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-700 font-medium">Ready For Work (Available)</span>
                <span className="font-bold text-emerald-600">
                  {equipmentList.filter((e) => e.status === 'AVAILABLE').length} units
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-700 font-medium">Operating On-Site (In Use)</span>
                <span className="font-bold text-amber-600">
                  {equipmentList.filter((e) => e.status === 'IN_USE').length} units
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-ink-700 font-medium">Mechanical Maintenance / Breakdown</span>
                <span className="font-bold text-red-600">
                  {equipmentList.filter((e) => e.status === 'MAINTENANCE').length} units
                </span>
              </div>
            </div>
          </div>

          <div className="surface-panel p-5 rounded-xl border border-surface-border flex flex-col gap-4">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2">
              <Wrench className="h-4 w-4 text-amber-600" />
              Preventive Maintenance Alerts
            </h3>
            <p className="text-xs text-ink-500">
              Machinery with excessive downtime requires immediate inspection and spare parts servicing.
            </p>
            <div className="flex flex-col gap-2 mt-2">
              {equipmentList.filter((e) => e.status === 'MAINTENANCE').length === 0 ? (
                <div className="p-4 rounded-lg bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
                  <span>All machinery fleet currently operating normally with zero active breakdown alerts.</span>
                </div>
              ) : (
                equipmentList
                  .filter((e) => e.status === 'MAINTENANCE')
                  .map((e) => (
                    <div
                      key={e.id}
                      className="p-3 rounded-lg bg-red-50/50 border border-red-200 flex items-center justify-between text-xs"
                    >
                      <div className="flex flex-col">
                        <span className="font-bold text-red-900">{e.assetCode} - {e.name}</span>
                        <span className="text-[11px] text-red-700">Type: {e.type}</span>
                      </div>
                      <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-semibold text-[10px]">
                        Service Required
                      </span>
                    </div>
                  ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <EquipmentRegisterModal
        open={isRegisterOpen}
        onClose={() => {
          setIsRegisterOpen(false);
          setEditingEquipment(null);
        }}
        initialData={editingEquipment}
        onSubmit={(values) => registerMutation.mutate(values)}
        isLoading={registerMutation.isPending}
      />

      <EquipmentUsageModal
        open={isUsageOpen}
        onClose={() => setIsUsageOpen(false)}
        equipmentList={equipmentList}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSubmit={(values) => recordUsageMutation.mutate(values)}
        isLoading={recordUsageMutation.isPending}
      />
    </div>
  );
}
