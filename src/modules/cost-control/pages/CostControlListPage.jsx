import { useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Building2,
  CheckCircle2,
  Coins,
  DollarSign,
  Edit,
  FileCheck2,
  Filter,
  Flame,
  HardHat,
  IndianRupee,
  Layers,
  Plus,
  RefreshCw,
  Scale,
  Search,
  ShieldAlert,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
  Wrench,
  Zap,
} from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Button, Input, Modal, StatusPill, Table } from '@/design-system';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { formatCurrency } from '@/modules/projects/constants';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import {
  costControlApi,
  costSyncApi,
  costTransactionApi,
  costVarianceApi,
  costAnalyticsApi,
} from '../api/costControlApi';
import { BentoEvmDashboard as EvmDashboard } from '../components/BentoEvmDashboard';

const COST_HEADS = ['LABOUR', 'MATERIAL', 'EQUIPMENT', 'SUBCONTRACTOR', 'OVERHEAD'];
const SOURCE_TYPES = [
  'PO_COMMITMENT',
  'ACTUAL_EXPENSE',
  'SUBCONTRACT_BILL',
  'LABOUR_WAGES',
  'MATERIAL_INVOICE',
  'EQUIPMENT_HIRE',
];

const unwrapNumber = (value) => Number(value) || 0;
function normaliseBudget(item) {
  return {
    ...item,
    baselineAmount: unwrapNumber(item?.baselineAmount),
    revisedAmount: unwrapNumber(item?.revisedAmount),
    costCode: item?.costCode || '',
    costHead: item?.costHead || 'MATERIAL',
    description: item?.description || '',
  };
}
function normaliseTransaction(item) {
  return {
    ...item,
    amount: unwrapNumber(item?.amount),
    costCode: item?.costCode || '',
    costHead: item?.costHead || 'MATERIAL',
    sourceType: item?.sourceType || 'ACTUAL_EXPENSE',
  };
}

export function CostControlListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const canManage = useHasRole(
    ROLES.ADMIN,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.QUANTITY_COST_COORDINATOR
  );

  const [activeTab, setActiveTab] = useState('budgets'); // 'budgets', 'transactions', 'variance', 'evm'
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [search, setSearch] = useState('');
  const [headFilter, setHeadFilter] = useState('ALL');

  // Modals state
  const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [isRevisionModalOpen, setRevisionModalOpen] = useState(false);
  const [revisingBudget, setRevisingBudget] = useState(null);
  const [isTransactionModalOpen, setTransactionModalOpen] = useState(false);

  // Forms
  const budgetForm = useForm({
    defaultValues: {
      costCode: '',
      costHead: 'MATERIAL',
      description: '',
      baselineAmount: '',
      revisedAmount: '',
      revisionReason: '',
      approvedBy: '',
    },
  });

  const revisionForm = useForm({
    defaultValues: {
      revisedAmount: '',
      reason: '',
    },
  });

  const transactionForm = useForm({
    defaultValues: {
      costCode: '',
      costHead: 'MATERIAL',
      sourceType: 'ACTUAL_EXPENSE',
      amount: '',
      transactionDate: new Date().toISOString().slice(0, 10),
      referenceNumber: '',
      vendorOrPayee: '',
      remarks: '',
    },
  });

  // Project selector
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list-simple'],
    queryFn: () => projectsApi.list(),
  });
  const projectId = selectedProjectId || projects[0]?.id || 1;
  const selectedProject = projects.find((project) => Number(project.id) === Number(projectId));

  // Queries
  const budgetsQuery = useQuery({
    queryKey: ['cost-control', projectId],
    queryFn: () => costControlApi.list(projectId),
    enabled: !!projectId,
    select: (items) => items.map(normaliseBudget),
  });

  const transactionsQuery = useQuery({
    queryKey: ['cost-transactions', projectId],
    queryFn: () => costTransactionApi.list(projectId),
    enabled: !!projectId,
    select: (items) => items.map(normaliseTransaction),
  });

  const varianceQuery = useQuery({
    queryKey: ['cost-variance-report', projectId],
    queryFn: () => costVarianceApi.getVarianceReport(projectId),
    enabled: !!projectId,
  });

  const overrunsQuery = useQuery({
    queryKey: ['cost-overruns-report', projectId],
    queryFn: () => costVarianceApi.getOverruns(projectId),
    enabled: !!projectId,
  });

  const commitmentsQuery = useQuery({
    queryKey: ['cost-commitments', projectId],
    queryFn: () => costVarianceApi.getCommitments(projectId),
    enabled: !!projectId,
  });

  const evmQuery = useQuery({
    queryKey: ['cost-evm', projectId],
    queryFn: () => costAnalyticsApi.evm(projectId),
    enabled: !!projectId,
  });

  const trackingReportQuery = useQuery({
    queryKey: ['cost-tracking-report', projectId],
    queryFn: () => costAnalyticsApi.tracking(projectId),
    enabled: !!projectId,
  });

  const forecastQuery = useQuery({
    queryKey: ['cost-forecast', projectId],
    queryFn: () => costAnalyticsApi.forecast(projectId),
    enabled: !!projectId,
  });

  const budgets = budgetsQuery.data || [];
  const transactions = transactionsQuery.data || [];
  const evm = evmQuery.data || {};
  const varianceReport = varianceQuery.data || {};
  const overrunsReport = overrunsQuery.data || {};
  const commitments = commitmentsQuery.data || {};

  const tracking = useMemo(() => {
    const actual = evm.actualCost || transactions.reduce((sum, item) => sum + item.amount, 0);
    const committed =
      commitments.totalCommittedAmount ||
      transactions
        .filter((item) => item.sourceType === 'PO_COMMITMENT')
        .reduce((sum, item) => sum + item.amount, 0);
    const approved = budgets.reduce(
      (sum, item) => sum + (item.revisedAmount > 0 ? item.revisedAmount : item.baselineAmount),
      0
    );
    return {
      totalApprovedBudget: approved,
      totalActualExpense: actual,
      totalCommittedCost: committed,
      totalProjectedCost: actual + committed,
      netVariance: approved - actual - committed,
    };
  }, [budgets, evm.actualCost, transactions, commitments]);

  // Mutations
  const saveBudget = useMutation({
    mutationFn: ({ id, payload }) =>
      id ? costControlApi.update(id, payload) : costControlApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-evm', projectId] });
      pushToast(
        editingBudget
          ? 'Budget head updated successfully.'
          : 'Budget head created successfully.',
        'success'
      );
      closeBudgetModal();
    },
    onError: (error) =>
      pushToast(error?.response?.data?.message || error.message || 'Unable to save budget head.', 'error'),
  });

  const authorizeRevisionMutation = useMutation({
    mutationFn: ({ id, payload }) => costControlApi.authorizeRevision(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-evm', projectId] });
      pushToast('Budget revision authorized and recorded with justification.', 'success');
      setRevisionModalOpen(false);
      setRevisingBudget(null);
      revisionForm.reset();
    },
    onError: (error) =>
      pushToast(error?.response?.data?.message || error.message || 'Unable to authorize revision.', 'error'),
  });

  const deleteBudget = useMutation({
    mutationFn: costControlApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control', projectId] });
      pushToast('Budget head deleted successfully.', 'success');
    },
    onError: (error) => pushToast(error.message || 'Unable to delete budget head.', 'error'),
  });

  const saveTransaction = useMutation({
    mutationFn: costTransactionApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-evm', projectId] });
      pushToast('Cost transaction recorded successfully.', 'success');
      closeTransactionModal();
    },
    onError: (error) =>
      pushToast(error?.response?.data?.message || error.message || 'Unable to record transaction.', 'error'),
  });

  const deleteTransaction = useMutation({
    mutationFn: costTransactionApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-evm', projectId] });
      pushToast('Cost transaction deleted successfully.', 'success');
    },
    onError: (error) => pushToast(error.message || 'Unable to delete transaction.', 'error'),
  });

  // Sync mutations
  const syncMutation = useMutation({
    mutationFn: (type) => {
      if (type === 'material') return costSyncApi.syncMaterial(projectId);
      if (type === 'labour') return costSyncApi.syncLabour(projectId);
      if (type === 'equipment') return costSyncApi.syncEquipment(projectId);
      return costSyncApi.syncAll(projectId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['cost-transactions', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-evm', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-tracking-report', projectId] });
      queryClient.invalidateQueries({ queryKey: ['cost-variance-report', projectId] });
      pushToast(
        data?.message || 'Ground site consumptions synchronized to cost actual ledger successfully.',
        'success'
      );
    },
    onError: (err) => pushToast(err?.response?.data?.message || err.message, 'error'),
  });

  const totals = useMemo(
    () => ({
      baseline: budgets.reduce((sum, item) => sum + item.baselineAmount, 0),
      approved: budgets.reduce(
        (sum, item) => sum + (item.revisedAmount > 0 ? item.revisedAmount : item.baselineAmount),
        0
      ),
      heads: budgets.length,
    }),
    [budgets]
  );

  const filteredBudgets = useMemo(() => {
    return budgets.filter((item) => {
      const query = search.trim().toLowerCase();
      return (
        (!query ||
          [item.costCode, item.costHead, item.description].some((value) =>
            String(value).toLowerCase().includes(query)
          )) &&
        (headFilter === 'ALL' || item.costHead === headFilter)
      );
    });
  }, [budgets, headFilter, search]);

  function closeBudgetModal() {
    setBudgetModalOpen(false);
    setEditingBudget(null);
    budgetForm.reset();
  }
  function closeTransactionModal() {
    setTransactionModalOpen(false);
    transactionForm.reset();
  }
  function editBudget(item) {
    setEditingBudget(item);
    budgetForm.reset({
      ...item,
      baselineAmount: String(item.baselineAmount),
      revisedAmount: item.revisedAmount ? String(item.revisedAmount) : '',
    });
    setBudgetModalOpen(true);
  }
  function openRevisionModal(item) {
    setRevisingBudget(item);
    revisionForm.reset({
      revisedAmount: String(item.revisedAmount || item.baselineAmount || ''),
      reason: item.revisionReason || '',
    });
    setRevisionModalOpen(true);
  }

  function submitBudget(values) {
    saveBudget.mutate({
      id: editingBudget?.id,
      payload: {
        projectId: Number(projectId),
        costCode: values.costCode.trim().toUpperCase(),
        costHead: values.costHead,
        description: values.description?.trim() || null,
        baselineAmount: Number(values.baselineAmount),
        revisedAmount: values.revisedAmount ? Number(values.revisedAmount) : null,
        revisionReason: values.revisionReason?.trim() || null,
        approvedBy: values.approvedBy?.trim() || null,
      },
    });
  }

  function submitRevision(values) {
    authorizeRevisionMutation.mutate({
      id: revisingBudget.id,
      payload: {
        revisedAmount: Number(values.revisedAmount),
        reason: values.reason?.trim() || 'Authorized cost scope revision',
        revisionReason: values.reason?.trim() || 'Authorized cost scope revision',
      },
    });
  }

  function submitTransaction(values) {
    saveTransaction.mutate({
      projectId: Number(projectId),
      costCode: values.costCode.trim().toUpperCase(),
      costHead: values.costHead,
      sourceType: values.sourceType,
      amount: Number(values.amount),
      transactionDate: values.transactionDate,
      referenceNumber: values.referenceNumber?.trim() || null,
      vendorOrPayee: values.vendorOrPayee?.trim() || null,
      remarks: values.remarks?.trim() || null,
    });
  }

  const budgetColumns = [
    {
      key: 'costCode',
      header: 'Cost Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-brand-700">{row.costCode}</span>
      ),
    },
    {
      key: 'costHead',
      header: 'Cost Head',
      render: (row) => <StatusPill status={row.costHead} />,
    },
    {
      key: 'description',
      header: 'Scope Description',
      render: (row) => row.description || '—',
    },
    {
      key: 'baselineAmount',
      header: 'Baseline Budget',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.baselineAmount)}</span>
      ),
    },
    {
      key: 'revisedAmount',
      header: 'Approved / Revised',
      render: (row) => (
        <span className="font-semibold text-emerald-700">
          {formatCurrency(row.revisedAmount || row.baselineAmount)}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill status={row.status || 'APPROVED'} />,
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) =>
        canManage && (
          <div className="flex justify-end gap-1">
            <button
              type="button"
              title="Authorize revision with justification"
              onClick={() => openRevisionModal(row)}
              className="rounded p-1.5 text-emerald-700 hover:bg-emerald-50"
            >
              <FileCheck2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Edit budget head"
              onClick={() => editBudget(row)}
              className="rounded p-1.5 text-brand-700 hover:bg-brand-50"
            >
              <Edit className="h-4 w-4" />
            </button>
            <button
              type="button"
              title="Delete budget head"
              onClick={() => {
                if (window.confirm(`Delete budget head ${row.costCode}?`))
                  deleteBudget.mutate(row.id);
              }}
              className="rounded p-1.5 text-red-600 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ),
    },
  ];

  const transactionColumns = [
    { key: 'transactionDate', header: 'Date' },
    {
      key: 'costCode',
      header: 'Cost Code',
      render: (row) => (
        <span className="font-mono text-xs font-bold text-brand-700">{row.costCode}</span>
      ),
    },
    {
      key: 'costHead',
      header: 'Cost Head',
      render: (row) => <StatusPill status={row.costHead} />,
    },
    {
      key: 'sourceType',
      header: 'Source',
      render: (row) => row.sourceType.replace(/_/g, ' '),
    },
    {
      key: 'amount',
      header: 'Amount',
      render: (row) => (
        <span className="font-semibold">{formatCurrency(row.amount)}</span>
      ),
    },
    {
      key: 'vendorOrPayee',
      header: 'Vendor / Payee',
      render: (row) => row.vendorOrPayee || '—',
    },
    {
      key: 'actions',
      header: 'Actions',
      className: 'text-right',
      render: (row) =>
        canManage && (
          <button
            type="button"
            title="Delete transaction"
            onClick={() => {
              if (window.confirm('Delete this cost transaction?'))
                deleteTransaction.mutate(row.id);
            }}
            className="rounded p-1.5 text-red-600 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        ),
    },
  ];

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <ModulePageHeading>Cost Control, Budget &amp; EVM</ModulePageHeading>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={projectId}
            onChange={(event) => setSelectedProjectId(Number(event.target.value))}
            className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm font-semibold text-ink-900 outline-none"
          >
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.code} — {project.name}
              </option>
            ))}
          </select>

          {/* Ground Sync Trigger */}
          {canManage && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => syncMutation.mutate('all')}
              isLoading={syncMutation.isPending}
              title="Synchronize Ground Material consumptions, Daily Labour muster, and Equipment hours into Cost Actual Ledger"
            >
              <Zap className="mr-1.5 h-4 w-4 text-amber-500" />
              Sync Ground Costs
            </Button>
          )}

          {activeTab === 'budgets' && canManage && (
            <Button
              size="sm"
              onClick={() => {
                setEditingBudget(null);
                budgetForm.reset();
                setBudgetModalOpen(true);
              }}
            >
              <Plus className="mr-1.5 h-4 w-4" />
              Add Cost Head
            </Button>
          )}

          {activeTab === 'transactions' && canManage && (
            <Button size="sm" onClick={() => setTransactionModalOpen(true)}>
              <Plus className="mr-1.5 h-4 w-4" />
              Record Transaction
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-surface-border">
        <button
          type="button"
          onClick={() => setActiveTab('budgets')}
          className={`px-4 py-2.5 text-sm font-semibold ${
            activeTab === 'budgets'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          Budget / Cost Heads ({budgets.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('transactions')}
          className={`px-4 py-2.5 text-sm font-semibold ${
            activeTab === 'transactions'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          Cost Transactions ({transactions.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('variance')}
          className={`px-4 py-2.5 text-sm font-semibold ${
            activeTab === 'variance'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          Variance &amp; Overruns (90% Alarms)
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('evm')}
          className={`px-4 py-2.5 text-sm font-semibold ${
            activeTab === 'evm'
              ? 'border-b-2 border-brand-600 text-brand-700'
              : 'text-ink-500'
          }`}
        >
          EVM Dashboard &amp; Forecast
        </button>
      </div>

      {/* TAB 1: Budgets */}
      {activeTab === 'budgets' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard label="Configured Cost Heads" value={totals.heads} icon={Wallet} />
            <MetricCard
              label="Baseline Budget"
              value={formatCurrency(totals.baseline)}
              icon={IndianRupee}
            />
            <MetricCard
              label="Approved / Revised Budget"
              value={formatCurrency(totals.approved)}
              icon={IndianRupee}
              tone="emerald"
            />
          </div>

          <div className="surface-panel flex flex-wrap items-center gap-3 p-3">
            <div className="flex min-w-[240px] flex-1 items-center gap-2 rounded-lg border border-surface-border bg-white px-3 py-2 text-sm">
              <Search className="h-4 w-4 text-ink-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search cost code, head or description..."
                className="w-full bg-transparent outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-ink-500" />
              <select
                value={headFilter}
                onChange={(event) => setHeadFilter(event.target.value)}
                className="rounded-lg border border-surface-border bg-white px-3 py-2 text-sm outline-none"
              >
                <option value="ALL">All cost heads</option>
                {COST_HEADS.map((head) => (
                  <option key={head} value={head}>
                    {head}
                  </option>
                ))}
              </select>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => budgetsQuery.refetch()}
              disabled={budgetsQuery.isFetching}
            >
              <RefreshCw
                className={`mr-1.5 h-4 w-4 ${budgetsQuery.isFetching ? 'animate-spin' : ''}`}
              />
              Refresh
            </Button>
          </div>

          <Table
            columns={budgetColumns}
            data={filteredBudgets}
            rowKey={(row) => row.id}
            isLoading={budgetsQuery.isLoading}
            emptyMessage={
              selectedProject
                ? 'No budget heads configured for this project.'
                : 'Select a project to view budget heads.'
            }
          />
        </>
      )}

      {/* TAB 2: Transactions */}
      {activeTab === 'transactions' && (
        <>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <MetricCard
              label="Ledger Transactions"
              value={transactions.length}
              icon={Activity}
            />
            <MetricCard
              label="Actual Incurred Cost"
              value={formatCurrency(
                tracking.totalActualExpense ||
                  transactions.reduce((sum, item) => sum + item.amount, 0)
              )}
              icon={IndianRupee}
              tone="amber"
            />
            <MetricCard
              label="Committed PO Liabilities"
              value={formatCurrency(tracking.totalCommittedCost)}
              icon={Wallet}
              tone="brand"
            />
          </div>

          <div className="surface-panel flex flex-wrap items-center justify-between gap-3 p-4">
            <div>
              <p className="text-sm font-semibold text-ink-800">Ground Cost Transactions Ledger</p>
              <p className="text-xs text-ink-500">
                Pulls real expenditures from Stock Ledger issues/consumptions, Daily Labour muster wages, and Equipment hire.
              </p>
            </div>
            <div className="flex gap-2">
              {canManage && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => syncMutation.mutate('all')}
                  isLoading={syncMutation.isPending}
                >
                  <Zap className="mr-1 h-3.5 w-3.5 text-amber-500" /> Sync Now
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => transactionsQuery.refetch()}
                disabled={transactionsQuery.isFetching}
              >
                <RefreshCw
                  className={`mr-1.5 h-4 w-4 ${transactionsQuery.isFetching ? 'animate-spin' : ''}`}
                />
                Refresh
              </Button>
            </div>
          </div>

          <Table
            columns={transactionColumns}
            data={transactions}
            rowKey={(row) => row.id}
            isLoading={transactionsQuery.isLoading}
            emptyMessage="No cost transactions recorded for this project."
          />
        </>
      )}

      {/* TAB 3: Variance & Overruns (90% Alarms) */}
      {activeTab === 'variance' && (
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <MetricCard
              label="Total Allocated Budget"
              value={formatCurrency(varianceReport.totalAllocatedBudget || totals.approved)}
              icon={Wallet}
            />
            <MetricCard
              label="Total Incurred Actuals"
              value={formatCurrency(varianceReport.totalActualExpense || tracking.totalActualExpense)}
              icon={IndianRupee}
              tone="amber"
            />
            <MetricCard
              label="Cost Variance (CV)"
              value={formatCurrency(varianceReport.costVariance || tracking.netVariance)}
              icon={
                (varianceReport.costVariance || tracking.netVariance) >= 0
                  ? TrendingUp
                  : TrendingDown
              }
              tone={
                (varianceReport.costVariance || tracking.netVariance) >= 0 ? 'emerald' : 'danger'
              }
            />
            <MetricCard
              label="Budget Status"
              value={varianceReport.status || (tracking.netVariance >= 0 ? 'SAFE' : 'OVERRUN')}
              icon={ShieldAlert}
              tone={
                varianceReport.status === 'OVERRUN'
                  ? 'danger'
                  : varianceReport.status === 'WARNING_90'
                  ? 'warning'
                  : 'emerald'
              }
            />
          </div>

          {/* Overruns / 90% Limit Warnings */}
          <div className="surface-panel p-4">
            <h3 className="text-sm font-bold text-ink-900">
              Budget Utilization &amp; Overrun Intelligence (FR-072)
            </h3>
            <p className="mt-1 text-xs text-ink-500">
              Automated scan checking Allocated Budget vs (Actual Cost + Committed Purchase Orders). When total liability crosses 90% of allocated budget head, critical warnings are triggered.
            </p>

            <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-surface-border p-3.5">
                <p className="text-xs font-semibold text-ink-700">Procurement Commitments (Open POs)</p>
                <p className="mt-1 text-xl font-bold text-brand-700">
                  {formatCurrency(commitments.totalCommittedAmount || tracking.totalCommittedCost)}
                </p>
                <p className="mt-1 text-[11px] text-ink-500">
                  {commitments.openPoCount || 0} Open PO(s) locked under financial commitment
                </p>
              </div>

              <div className="rounded-xl border border-surface-border p-3.5">
                <p className="text-xs font-semibold text-ink-700">Cost Variance Percentage</p>
                <p
                  className={`mt-1 text-xl font-bold ${
                    varianceReport.costVariancePercentage > 0 ? 'text-red-600' : 'text-emerald-700'
                  }`}
                >
                  {varianceReport.costVariancePercentage
                    ? `${varianceReport.costVariancePercentage.toFixed(1)}%`
                    : '0.0%'}
                </p>
                <p className="mt-1 text-[11px] text-ink-500">
                  Calculated against baseline authorized project ceiling
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: EVM Dashboard */}
      {activeTab === 'evm' && (
        <EvmDashboard
          evm={evm}
          tracking={tracking}
          trackingReport={trackingReportQuery.data}
          forecast={forecastQuery.data}
          project={selectedProject}
          isLoading={evmQuery.isLoading || trackingReportQuery.isLoading}
          onRefresh={() => {
            evmQuery.refetch();
            trackingReportQuery.refetch();
            forecastQuery.refetch();
          }}
          onUpdateMetrics={async (params) => {
            const updated = await costAnalyticsApi.evm(projectId, params);
            queryClient.setQueryData(['cost-evm', projectId], updated);
            return updated;
          }}
        />
      )}

      {/* Budget Create / Edit Modal */}
      <BudgetModal
        open={isBudgetModalOpen}
        onClose={closeBudgetModal}
        form={budgetForm}
        editing={editingBudget}
        onSubmit={submitBudget}
        isLoading={saveBudget.isPending}
      />

      {/* Authorize Revision Modal */}
      {revisingBudget && (
        <Modal
          open={isRevisionModalOpen}
          onClose={() => setRevisionModalOpen(false)}
          title={`Authorize Budget Revision (${revisingBudget.costCode})`}
          size="md"
          footer={
            <>
              <Button variant="outline" onClick={() => setRevisionModalOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={revisionForm.handleSubmit(submitRevision)}
                isLoading={authorizeRevisionMutation.isPending}
              >
                Authorize &amp; Apply Revision
              </Button>
            </>
          }
        >
          <form
            className="flex flex-col gap-4"
            onSubmit={revisionForm.handleSubmit(submitRevision)}
          >
            <div className="rounded-lg bg-surface-subtle p-3 text-xs">
              <span className="font-semibold text-ink-900">Cost Head:</span>{' '}
              {revisingBudget.costCode} ({revisingBudget.costHead}) · Baseline:{' '}
              {formatCurrency(revisingBudget.baselineAmount)}
            </div>

            <Input
              label="New Approved Revised Amount (₹) *"
              type="number"
              min="0.01"
              step="any"
              placeholder="e.g. 50000"
              {...revisionForm.register('revisedAmount', { required: 'Revised amount is required' })}
              error={revisionForm.formState.errors.revisedAmount?.message}
            />

            <label className="flex flex-col gap-1.5 text-xs font-semibold text-ink-700">
              Audit Revision Justification Reason *
              <textarea
                rows={3}
                placeholder="e.g. Scope expansion approved by Client for high-grade M40 concrete mix..."
                {...revisionForm.register('reason', { required: 'Reason is required' })}
                className="rounded-lg border border-surface-border bg-white p-2.5 text-xs outline-none focus:border-brand-500"
              />
            </label>
          </form>
        </Modal>
      )}

      {/* Record Transaction Modal */}
      <TransactionModal
        open={isTransactionModalOpen}
        onClose={closeTransactionModal}
        form={transactionForm}
        onSubmit={submitTransaction}
        isLoading={saveTransaction.isPending}
      />
    </div>
  );
}

function MetricCard({ label, value, icon: Icon, tone = 'neutral' }) {
  const toneClasses = {
    neutral: 'text-ink-900',
    brand: 'text-brand-700',
    amber: 'text-amber-700',
    emerald: 'text-emerald-700',
    danger: 'text-red-700',
    warning: 'text-amber-600',
  };

  return (
    <div className="surface-panel flex items-center justify-between p-4 shadow-sm">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-500">{label}</p>
        <p className={`mt-2 text-2xl font-bold ${toneClasses[tone] || toneClasses.neutral}`}>
          {value}
        </p>
      </div>
      <Icon className={`h-6 w-6 opacity-75 ${toneClasses[tone] || toneClasses.neutral}`} />
    </div>
  );
}

function BudgetModal({ open, onClose, form, editing, onSubmit, isLoading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? 'Edit Budget / Cost Head' : 'Add Budget / Cost Head'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isLoading}>
            {editing ? 'Update Budget Head' : 'Save Budget Head'}
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Input
          label="Cost Code *"
          placeholder="CBS-MAT-001"
          {...form.register('costCode', { required: 'Cost code is required' })}
          error={form.formState.errors.costCode?.message}
        />
        <SelectField label="Cost Head *" name="costHead" form={form} options={COST_HEADS} />
        <div className="sm:col-span-2">
          <Input
            label="Description"
            placeholder="Concrete, steel, labour or other cost scope"
            {...form.register('description')}
          />
        </div>
        <Input
          label="Baseline Amount (₹) *"
          type="number"
          min="0"
          step="0.01"
          {...form.register('baselineAmount', {
            required: 'Baseline amount is required',
            min: { value: 0, message: 'Amount cannot be negative' },
          })}
          error={form.formState.errors.baselineAmount?.message}
        />
        <Input
          label="Approved Revised Amount (₹)"
          type="number"
          min="0"
          step="0.01"
          {...form.register('revisedAmount')}
        />
        <Input label="Revision Reason" {...form.register('revisionReason')} />
        <Input label="Approved By" {...form.register('approvedBy')} />
      </form>
    </Modal>
  );
}

function TransactionModal({ open, onClose, form, onSubmit, isLoading }) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Record Cost Transaction"
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} isLoading={isLoading}>
            Record Transaction
          </Button>
        </>
      }
    >
      <form
        className="grid grid-cols-1 gap-4 sm:grid-cols-2"
        onSubmit={form.handleSubmit(onSubmit)}
      >
        <Input
          label="Cost Code *"
          placeholder="CBS-MAT-001"
          {...form.register('costCode', { required: 'Cost code is required' })}
          error={form.formState.errors.costCode?.message}
        />
        <SelectField label="Cost Head *" name="costHead" form={form} options={COST_HEADS} />
        <SelectField label="Source Type *" name="sourceType" form={form} options={SOURCE_TYPES} />
        <Input
          label="Amount (₹) *"
          type="number"
          min="0.01"
          step="0.01"
          {...form.register('amount', {
            required: 'Amount is required',
            min: { value: 0.01, message: 'Amount must be greater than zero' },
          })}
          error={form.formState.errors.amount?.message}
        />
        <Input
          label="Transaction Date *"
          type="date"
          {...form.register('transactionDate', { required: 'Date is required' })}
          error={form.formState.errors.transactionDate?.message}
        />
        <Input label="Reference Number" {...form.register('referenceNumber')} />
        <Input label="Vendor / Payee" {...form.register('vendorOrPayee')} />
        <div className="sm:col-span-2">
          <Input label="Remarks" {...form.register('remarks')} />
        </div>
      </form>
    </Modal>
  );
}

function SelectField({ label, name, form, options }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm font-medium text-ink-700">
      {label}
      <select
        {...form.register(name, { required: true })}
        className="rounded-lg border border-surface-border bg-white px-3 py-2.5 outline-none"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option.replace(/_/g, ' ')}
          </option>
        ))}
      </select>
    </label>
  );
}
