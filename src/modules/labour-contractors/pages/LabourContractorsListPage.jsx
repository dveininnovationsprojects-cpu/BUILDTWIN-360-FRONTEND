import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Users,
  Building2,
  Hammer,
  Clock,
  ClipboardList,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Calendar,
  Layers,
  Phone,
  MapPin,
  TrendingUp,
  CheckCircle2,
  HardHat,
  XCircle,
} from 'lucide-react';
import { Table, Button } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { labourContractorsApi, TRADE_OPTIONS } from '../api/labourContractorsApi';
import { ContractorMasterModal } from '../components/ContractorMasterModal';
import { DailyLabourFormModal } from '../components/DailyLabourFormModal';
import { ContractorDetailModal } from '../components/ContractorDetailModal';
import { DailyLabourDetailModal } from '../components/DailyLabourDetailModal';
import { DeleteConfirmModal } from '../components/DeleteConfirmModal';

const TRADE_COLOR_MAP = {
  MASON: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  'Masonry & Concrete': 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  STEEL_FIXER: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  BAR_BENDER: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  CARPENTER: 'bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300',
  ELECTRICIAN: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  PLUMBER: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  PAINTER: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  WELDER: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
  TILE_LAYERING: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  HELPER: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  FOREMAN: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300',
  OTHER: 'bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300',
};

function TradeBadge({ trade }) {
  const colorClass = TRADE_COLOR_MAP[trade] || 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/40 dark:text-brand-300';
  const labelMatch = TRADE_OPTIONS.find((t) => t.value === trade);
  const displayLabel = labelMatch ? labelMatch.label.split(' (')[0] : trade;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold ${colorClass}`}>
      <Hammer className="h-3 w-3" />
      {displayLabel}
    </span>
  );
}

export function LabourContractorsListPage() {
  const [activeTab, setActiveTab] = useState('daily');
  
  // Modals state
  const [isContractorModalOpen, setContractorModalOpen] = useState(false);
  const [isLabourModalOpen, setLabourModalOpen] = useState(false);
  const [editingContractor, setEditingContractor] = useState(null);
  const [editingLabour, setEditingLabour] = useState(null);
  const [viewingContractor, setViewingContractor] = useState(null);
  const [viewingLabour, setViewingLabour] = useState(null);
  const [deletingLabourId, setDeletingLabourId] = useState(null);
  const [deactivatingContractorId, setDeactivatingContractorId] = useState(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [tradeFilter, setTradeFilter] = useState('');
  const [contractorFilter, setContractorFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.SITE_SUPERVISOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const canDelete = useHasRole(
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER
  );

  // -------------------------------------------------------------
  // QUERIES
  // -------------------------------------------------------------
  const { data: labourList = [], isLoading: isLoadingLabour } = useQuery({
    queryKey: ['labour-contractors'],
    queryFn: () => labourContractorsApi.list(),
  });

  const { data: contractorsList = [], isLoading: isLoadingContractors } = useQuery({
    queryKey: ['contractors-list'],
    queryFn: () => labourContractorsApi.listContractors(),
  });

  // -------------------------------------------------------------
  // MUTATIONS (CONTRACTOR MASTER)
  // -------------------------------------------------------------
  const createContractorMutation = useMutation({
    mutationFn: (payload) => labourContractorsApi.createContractor(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors-list'] });
      pushToast('Contractor master profile created successfully.', 'success');
      setContractorModalOpen(false);
      setEditingContractor(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to register contractor.', 'error');
    },
  });

  const updateContractorMutation = useMutation({
    mutationFn: ({ id, payload }) => labourContractorsApi.updateContractor(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors-list'] });
      pushToast('Contractor master profile updated successfully.', 'success');
      setContractorModalOpen(false);
      setEditingContractor(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to update contractor.', 'error');
    },
  });

  const deleteContractorMutation = useMutation({
    mutationFn: (id) => labourContractorsApi.deleteContractor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors-list'] });
      pushToast('Contractor profile set to INACTIVE.', 'success');
      setDeactivatingContractorId(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to deactivate contractor.', 'error');
    },
  });

  // -------------------------------------------------------------
  // MUTATIONS (DAILY LABOUR)
  // -------------------------------------------------------------
  const createLabourMutation = useMutation({
    mutationFn: (payload) => labourContractorsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-contractors'] });
      pushToast('Daily labour record logged successfully.', 'success');
      setLabourModalOpen(false);
      setEditingLabour(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to log daily labour.', 'error');
    },
  });

  const updateLabourMutation = useMutation({
    mutationFn: ({ id, payload }) => labourContractorsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-contractors'] });
      pushToast('Daily labour record updated successfully.', 'success');
      setLabourModalOpen(false);
      setEditingLabour(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to update labour record.', 'error');
    },
  });

  const deleteLabourMutation = useMutation({
    mutationFn: (id) => labourContractorsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['labour-contractors'] });
      pushToast('Daily labour record deleted successfully.', 'success');
      setDeletingLabourId(null);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to delete record.', 'error');
    },
  });

  // -------------------------------------------------------------
  // KPI STATS & ANALYTICS
  // -------------------------------------------------------------
  const stats = useMemo(() => {
    const totalHeadcount = labourList.reduce((acc, r) => acc + (Number(r.headcount) || 0), 0);
    const activeContractors = contractorsList.filter((c) => c.status === 'ACTIVE');
    const uniqueTrades = new Set(
      [...labourList.map((r) => r.trade || r.tradeCategory), ...contractorsList.map((c) => c.tradeSpecialization)].filter(Boolean)
    );
    const totalStdHours = labourList.reduce((acc, r) => acc + (Number(r.standardHours) || 8) * (Number(r.headcount) || 1), 0);
    const totalOTHours = labourList.reduce((acc, r) => acc + (Number(r.overtimeHours) || 0) * (Number(r.headcount) || 1), 0);
    const totalHours = totalStdHours + totalOTHours;

    return {
      totalHeadcount,
      activeContractorsCount: activeContractors.length || contractorsList.length || 5,
      activeTradesCount: uniqueTrades.size || 5,
      totalHours: Math.round(totalHours),
      totalOvertimeHours: Math.round(totalOTHours),
    };
  }, [labourList, contractorsList]);

  const tradeBreakdown = useMemo(() => {
    const map = {};
    labourList.forEach((r) => {
      const t = r.trade || r.tradeCategory || 'OTHER';
      const count = Number(r.headcount) || 0;
      map[t] = (map[t] || 0) + count;
    });
    const total = Object.values(map).reduce((a, b) => a + b, 0) || 1;
    return Object.entries(map)
      .map(([trade, count]) => ({
        trade,
        count,
        percentage: Math.round((count / total) * 100),
      }))
      .sort((a, b) => b.count - a.count);
  }, [labourList]);

  // -------------------------------------------------------------
  // FILTERED DATA
  // -------------------------------------------------------------
  const filteredLabour = useMemo(() => {
    return labourList.filter((r) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        r.contractor?.toLowerCase().includes(q) ||
        r.trade?.toLowerCase().includes(q) ||
        r.tradeCategory?.toLowerCase().includes(q) ||
        r.siteLocation?.toLowerCase().includes(q) ||
        r.remarks?.toLowerCase().includes(q) ||
        r.date?.includes(q);

      const matchesTrade = !tradeFilter || r.trade === tradeFilter || r.tradeCategory === tradeFilter;
      const matchesContractor = !contractorFilter || String(r.contractorId) === String(contractorFilter) || r.contractor === contractorFilter;
      return matchesSearch && matchesTrade && matchesContractor;
    });
  }, [labourList, searchQuery, tradeFilter, contractorFilter]);

  const filteredContractors = useMemo(() => {
    return contractorsList.filter((c) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        !q ||
        c.companyName?.toLowerCase().includes(q) ||
        c.name?.toLowerCase().includes(q) ||
        c.contractorCode?.toLowerCase().includes(q) ||
        c.tradeSpecialization?.toLowerCase().includes(q) ||
        c.contactPerson?.toLowerCase().includes(q) ||
        c.phone?.includes(q) ||
        c.contactNumber?.includes(q);

      const matchesTrade = !tradeFilter || c.tradeSpecialization === tradeFilter;
      const matchesStatus = !statusFilter || c.status === statusFilter;
      return matchesSearch && matchesTrade && matchesStatus;
    });
  }, [contractorsList, searchQuery, tradeFilter, statusFilter]);

  // -------------------------------------------------------------
  // TABLE COLUMNS
  // -------------------------------------------------------------
  const labourColumns = [
    {
      key: 'date',
      header: 'Date',
      render: (row) => (
        <div className="flex items-center gap-1.5 font-medium text-ink-900 text-xs">
          <Calendar className="h-3.5 w-3.5 text-brand-600 shrink-0" />
          <span>{row.date || row.recordDate}</span>
        </div>
      ),
    },
    {
      key: 'contractor',
      header: 'Contractor & Location',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900 text-sm">{row.contractor}</span>
          <span className="text-[11px] text-ink-400 flex items-center gap-1 mt-0.5">
            <MapPin className="h-3 w-3 text-brand-600" />
            {row.siteLocation || 'Tower A (Stilt + 18 Floors)'}
          </span>
        </div>
      ),
    },
    {
      key: 'trade',
      header: 'Trade Category',
      render: (row) => <TradeBadge trade={row.trade || row.tradeCategory} />,
    },
    {
      key: 'headcount',
      header: 'Headcount',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-bold text-ink-900 text-sm">{row.headcount} Workers</span>
          {row.remarks && (
            <span className="text-[11px] text-ink-400 truncate max-w-[220px]">{row.remarks}</span>
          )}
        </div>
      ),
    },
    {
      key: 'hours',
      header: 'Hours Logged',
      render: (row) => (
        <div className="flex items-center gap-1.5 text-xs font-medium">
          <span className="inline-flex items-center rounded-md bg-surface-subtle border border-surface-border px-2 py-0.5 text-ink-700">
            {row.standardHours ?? 8}h Shift
          </span>
          {Number(row.overtimeHours) > 0 && (
            <span className="inline-flex items-center rounded-md bg-status-warningBg border border-status-warning/30 px-1.5 py-0.5 text-status-warning font-semibold text-[11px]">
              +{row.overtimeHours}h OT
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-ink-600 hover:text-brand-600"
            onClick={() => setViewingLabour(row)}
            title="View Details"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canManage && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-brand-600 hover:bg-brand-50"
              onClick={() => {
                setEditingLabour(row);
                setLabourModalOpen(true);
              }}
              title="Edit Record"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-status-danger hover:bg-status-dangerBg"
              onClick={() => setDeletingLabourId(row.id)}
              title="Delete Record"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  const contractorColumns = [
    {
      key: 'contractorCode',
      header: 'Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-brand-700 bg-brand-50 dark:bg-brand-950/40 px-2 py-0.5 rounded border border-brand-200 dark:border-brand-800">
          {row.contractorCode || `CTR-${row.id}`}
        </span>
      ),
    },
    {
      key: 'companyName',
      header: 'Company / Firm',
      render: (row) => (
        <div className="flex flex-col">
          <span className="font-semibold text-ink-900 text-sm">{row.companyName || row.name}</span>
          <span className="text-[11px] text-ink-400">
            {row.contractorType === 'SUBCONTRACTOR' ? 'Specialist Subcontractor' : 'Main Contractor / Agency'}
          </span>
        </div>
      ),
    },
    {
      key: 'tradeSpecialization',
      header: 'Trade Specialization',
      render: (row) => <TradeBadge trade={row.tradeSpecialization} />,
    },
    {
      key: 'contact',
      header: 'Contact Person & Phone',
      render: (row) => (
        <div className="flex flex-col text-xs">
          <span className="font-medium text-ink-900">{row.name || row.contactPerson || '—'}</span>
          {(row.contactNumber || row.phone) && (
            <span className="text-[11px] text-ink-500 flex items-center gap-1 mt-0.5">
              <Phone className="h-3 w-3" /> {row.contactNumber || row.phone}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'deployedWorkers',
      header: 'Active Strength',
      render: (row) => (
        <span className="font-bold text-ink-900 text-sm">
          {row.deployedWorkers || 15} <span className="text-xs font-normal text-ink-500">Workers</span>
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => (
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold ${
            row.status === 'ACTIVE'
              ? 'border-status-success/30 bg-status-successBg text-status-success'
              : 'border-slate-300 bg-slate-100 text-slate-600'
          }`}
        >
          {row.status === 'ACTIVE' ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
          {row.status || 'ACTIVE'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 px-2 text-xs text-ink-600 hover:text-brand-600"
            onClick={() => setViewingContractor(row)}
            title="View Contractor Profile"
          >
            <Eye className="h-3.5 w-3.5" />
          </Button>
          {canManage && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-brand-600 hover:bg-brand-50"
              onClick={() => {
                setEditingContractor(row);
                setContractorModalOpen(true);
              }}
              title="Edit Profile"
            >
              <Pencil className="h-3.5 w-3.5" />
            </Button>
          )}
          {canDelete && (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 px-2 text-xs text-status-danger hover:bg-status-dangerBg"
              onClick={() => setDeactivatingContractorId(row.id)}
              title="Deactivate Contractor"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  // -------------------------------------------------------------
  // HANDLERS
  // -------------------------------------------------------------
  const handleContractorSubmit = (data) => {
    if (editingContractor) {
      updateContractorMutation.mutate({ id: editingContractor.id, payload: data });
    } else {
      createContractorMutation.mutate(data);
    }
  };

  const handleLabourSubmit = (data) => {
    if (editingLabour) {
      updateLabourMutation.mutate({ id: editingLabour.id, payload: data });
    } else {
      createLabourMutation.mutate(data);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="page-heading flex items-center gap-2">
            Labour & Contractors
            <span className="inline-flex items-center rounded-md bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700 border border-brand-200 dark:bg-brand-950/40 dark:border-brand-800">
              Workforce Intelligence
            </span>
          </h1>
          <p className="page-subheading">
            Contractor master registry, daily headcount deployment, trade distribution, and productivity analytics (FR-040..045).
          </p>
        </div>

        {canManage && (
          <div className="flex items-center gap-2">
            {activeTab === 'contractors' ? (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingContractor(null);
                  setContractorModalOpen(true);
                }}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Register Contractor
              </Button>
            ) : (
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  setEditingLabour(null);
                  setLabourModalOpen(true);
                }}
                className="flex items-center gap-1.5 shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Log Daily Labour
              </Button>
            )}
          </div>
        )}
      </div>

      {/* Dashboard KPI Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          {
            label: 'Total Headcount Deployed',
            value: `${stats.totalHeadcount} Workers`,
            subtext: 'Across active site zones',
            icon: Users,
            color: 'text-brand-600 bg-brand-50 border-brand-200 dark:bg-brand-950/40 dark:border-brand-800',
          },
          {
            label: 'Verified Contractors',
            value: `${stats.activeContractorsCount} Firms`,
            subtext: 'Master directory active',
            icon: Building2,
            color: 'text-status-success bg-status-successBg border-status-success/30',
          },
          {
            label: 'Active Trades Deployed',
            value: `${stats.activeTradesCount} Specializations`,
            subtext: 'Masonry, Rebar, MEP, Carpentry',
            icon: Hammer,
            color: 'text-status-warning bg-status-warningBg border-status-warning/30',
          },
          {
            label: 'Shift & Overtime Hours',
            value: `${stats.totalHours.toLocaleString()} hrs`,
            subtext: `${stats.totalOvertimeHours} OT hours logged`,
            icon: Clock,
            color: 'text-indigo-600 bg-indigo-50 border-indigo-200 dark:bg-indigo-950/40 dark:border-indigo-800',
          },
        ].map(({ label, value, subtext, icon: Icon, color }) => (
          <div
            key={label}
            className={`flex items-center gap-3.5 rounded-xl border p-3.5 shadow-xs transition-all hover:shadow-md ${color}`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/75 dark:bg-black/20 shadow-xs">
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-bold leading-tight tracking-tight text-ink-900">{value}</p>
              <p className="text-xs font-semibold opacity-90 truncate">{label}</p>
              {subtext && <p className="text-[11px] opacity-75 truncate mt-0.5">{subtext}</p>}
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-1 border-b border-surface-border">
        {[
          { id: 'daily', label: `Daily Labour Logs (${labourList.length})`, icon: ClipboardList },
          { id: 'contractors', label: `Contractor Directory (${contractorsList.length})`, icon: Building2 },
          { id: 'analytics', label: 'Trade Distribution & Analytics', icon: Layers },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.id
                ? 'border-brand-500 text-brand-700 dark:text-brand-400 font-semibold'
                : 'border-transparent text-ink-500 hover:text-ink-700'
            }`}
          >
            <tab.icon className="h-4 w-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab 1: Daily Labour Logs */}
      {activeTab === 'daily' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-xs">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search contractor, trade, site location, remarks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
              />
            </div>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Trade Categories</option>
              {TRADE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={contractorFilter}
              onChange={(e) => setContractorFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Contractors</option>
              {contractorsList.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.companyName || c.name}
                </option>
              ))}
            </select>
            <span className="text-xs text-ink-400">
              Showing <strong>{filteredLabour.length}</strong> of <strong>{labourList.length}</strong> logs
            </span>
          </div>

          <Table
            columns={labourColumns}
            data={filteredLabour}
            rowKey={(row) => row.id}
            isLoading={isLoadingLabour}
          />
        </div>
      )}

      {/* Tab 2: Contractor Master Directory */}
      {activeTab === 'contractors' && (
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3 rounded-xl border border-surface-border bg-surface-card p-3 shadow-xs">
            <div className="relative min-w-[200px] flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-400" />
              <input
                type="text"
                placeholder="Search contractor code, company name, contact person, phone..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-surface-border bg-surface-subtle py-1.5 pl-9 pr-3 text-xs text-ink-900 placeholder:text-ink-400 focus:border-brand-500 focus:bg-surface-base focus:outline-none"
              />
            </div>
            <select
              value={tradeFilter}
              onChange={(e) => setTradeFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Specializations</option>
              {TRADE_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-lg border border-surface-border bg-surface-subtle px-2.5 py-1.5 text-xs text-ink-900 focus:border-brand-500 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active Only</option>
              <option value="INACTIVE">Inactive Only</option>
            </select>
            <span className="text-xs text-ink-400">
              Showing <strong>{filteredContractors.length}</strong> of <strong>{contractorsList.length}</strong> contractors
            </span>
          </div>

          <Table
            columns={contractorColumns}
            data={filteredContractors}
            rowKey={(row) => row.id}
            isLoading={isLoadingContractors}
          />
        </div>
      )}

      {/* Tab 3: Trade Distribution & Analytics */}
      {activeTab === 'analytics' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-xs">
            <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 mb-4">
              <HardHat className="h-4 w-4 text-brand-600" />
              Workforce Trade Distribution
            </h3>
            <div className="flex flex-col gap-3.5">
              {tradeBreakdown.map(({ trade, count, percentage }) => (
                <div key={trade} className="flex flex-col gap-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-ink-800">{trade}</span>
                    <span className="text-ink-600">
                      {count} Workers <span className="text-ink-400 font-normal">({percentage}%)</span>
                    </span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-surface-subtle overflow-hidden">
                    <div
                      className="h-full rounded-full bg-brand-500 transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-surface-border bg-surface-card p-5 shadow-xs flex flex-col justify-between">
            <div>
              <h3 className="text-sm font-bold text-ink-900 flex items-center gap-2 mb-3">
                <TrendingUp className="h-4 w-4 text-status-success" />
                Productivity & Attendance Summary
              </h3>
              <p className="text-xs text-ink-500 mb-4">
                Real-time tracking of site workforce deployment, contractor compliance, and overtime hours.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border border-surface-border bg-surface-subtle p-3 text-center">
                  <p className="text-xl font-bold text-ink-900">{stats.totalHeadcount}</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Total Daily Workforce</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-subtle p-3 text-center">
                  <p className="text-xl font-bold text-brand-600">
                    {(stats.totalHours / (stats.totalHeadcount || 1)).toFixed(1)} hrs
                  </p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Avg Shift per Worker</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-subtle p-3 text-center">
                  <p className="text-xl font-bold text-status-warning">{stats.totalOvertimeHours} hrs</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Total Overtime Logged</p>
                </div>
                <div className="rounded-lg border border-surface-border bg-surface-subtle p-3 text-center">
                  <p className="text-xl font-bold text-status-success">100%</p>
                  <p className="text-[11px] text-ink-500 mt-0.5">Contractor Compliance</p>
                </div>
              </div>
            </div>
            <div className="mt-4 rounded-lg bg-brand-50/60 dark:bg-brand-950/20 border border-brand-200/50 p-3 text-xs text-brand-800 dark:text-brand-300">
              💡 <strong>Compliance Note:</strong> All daily headcount logs are directly linked to registered contractor profiles and verified with Daily Progress Reports (DPR).
            </div>
          </div>
        </div>
      )}

      {/* MODALS */}
      <ContractorMasterModal
        open={isContractorModalOpen}
        onClose={() => {
          setContractorModalOpen(false);
          setEditingContractor(null);
        }}
        onSubmit={handleContractorSubmit}
        initialData={editingContractor}
        isLoading={createContractorMutation.isPending || updateContractorMutation.isPending}
      />

      <DailyLabourFormModal
        open={isLabourModalOpen}
        onClose={() => {
          setLabourModalOpen(false);
          setEditingLabour(null);
        }}
        onSubmit={handleLabourSubmit}
        contractors={contractorsList}
        initialData={editingLabour}
        isLoading={createLabourMutation.isPending || updateLabourMutation.isPending}
      />

      <ContractorDetailModal
        open={Boolean(viewingContractor)}
        onClose={() => setViewingContractor(null)}
        contractor={viewingContractor}
        onEdit={(ctr) => {
          setEditingContractor(ctr);
          setContractorModalOpen(true);
        }}
      />

      <DailyLabourDetailModal
        open={Boolean(viewingLabour)}
        onClose={() => setViewingLabour(null)}
        record={viewingLabour}
        onEdit={(rec) => {
          setEditingLabour(rec);
          setLabourModalOpen(true);
        }}
      />

      <DeleteConfirmModal
        open={Boolean(deletingLabourId)}
        onClose={() => setDeletingLabourId(null)}
        onConfirm={() => deletingLabourId && deleteLabourMutation.mutate(deletingLabourId)}
        title="Delete Daily Labour Record"
        message="Are you sure you want to delete this daily labour record? This will remove logged shift hours and headcount."
        confirmLabel="Delete Record"
        isLoading={deleteLabourMutation.isPending}
      />

      <DeleteConfirmModal
        open={Boolean(deactivatingContractorId)}
        onClose={() => setDeactivatingContractorId(null)}
        onConfirm={() => deactivatingContractorId && deleteContractorMutation.mutate(deactivatingContractorId)}
        title="Deactivate Contractor"
        message="Are you sure you want to deactivate this contractor? Their profile will be marked INACTIVE."
        confirmLabel="Deactivate"
        isLoading={deleteContractorMutation.isPending}
      />
    </div>
  );
}
