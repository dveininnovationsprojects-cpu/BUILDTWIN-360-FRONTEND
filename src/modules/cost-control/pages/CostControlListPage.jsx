import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { costControlApi } from '../api/costControlApi';
import { EvmCostIntelligenceModule } from '../components/EvmCostIntelligenceModule';
import {
  Calculator,
  TrendingDown,
  TrendingUp,
  BarChart3,
  Layers,
  Table as TableIcon,
  Plus,
  Coins,
  ShieldAlert,
} from 'lucide-react';

// Format helper
const formatCurrency = (val) => {
  if (val === undefined || val === null || val === '') return '₹0';
  const cleanVal = typeof val === 'string' ? parseFloat(val.replace(/[^0-9.-]+/g, '')) : val;
  if (isNaN(cleanVal)) return '₹0';
  return `₹${Math.round(cleanVal).toLocaleString('en-IN')}`;
};

export function CostControlListPage() {
  const [activeView, setActiveView] = useState('EVM_SUITE'); // 'EVM_SUITE' | 'WBS_TABLE'
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.QUANTITY_COST_COORDINATOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      code: '',
      category: '',
      bac: '',
      pv: '',
      ev: '',
      ac: '',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['cost-control'],
    queryFn: () => costControlApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => costControlApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cost-control'] });
      pushToast('Budget head added successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add budget head.', 'error');
    },
  });

  // Calculate quick summary metrics from data
  const summaryStats = useMemo(() => {
    const list = data || [];
    let totalBac = 0;
    let totalAc = 0;
    let totalEv = 0;

    list.forEach((item) => {
      const b = typeof item.bac === 'string' ? parseFloat(item.bac.replace(/[^0-9.-]+/g, '')) : item.bac;
      const a = typeof item.ac === 'string' ? parseFloat(item.ac.replace(/[^0-9.-]+/g, '')) : item.ac;
      const e = typeof item.ev === 'string' ? parseFloat(item.ev.replace(/[^0-9.-]+/g, '')) : item.ev;
      if (!isNaN(b)) totalBac += b;
      if (!isNaN(a)) totalAc += a;
      if (!isNaN(e)) totalEv += e;
    });

    const cpi = totalAc > 0 ? (totalEv / totalAc).toFixed(2) : '1.00';
    const fac = parseFloat(cpi) > 0 ? Math.round(totalBac / parseFloat(cpi)) : totalBac;
    const cv = totalEv - totalAc;

    return { totalBac, totalAc, totalEv, cpi, fac, cv };
  }, [data]);

  const columns = [
    {
      key: 'code',
      header: 'WBS Code',
      render: (row) => <span className="font-mono font-bold text-slate-900">{row.code}</span>,
    },
    {
      key: 'category',
      header: 'Cost Head / Category',
      render: (row) => <span className="font-semibold text-slate-900">{row.category}</span>,
    },
    {
      key: 'bac',
      header: 'Budget at Completion (BAC)',
      render: (row) => (
        <span className="font-mono font-medium text-slate-700">{formatCurrency(row.bac)}</span>
      ),
    },
    {
      key: 'ac',
      header: 'Actual Cost (AC)',
      render: (row) => (
        <span className="font-mono font-medium text-slate-900">{formatCurrency(row.ac)}</span>
      ),
    },
    {
      key: 'cpi',
      header: 'Cost Performance (CPI)',
      render: (row) => {
        const raw = row.cpi;
        const num = parseFloat(raw);
        if (!isNaN(num)) {
          return (
            <span
              className={`font-mono font-bold px-2 py-0.5 rounded text-xs ${
                num >= 1.0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {num.toFixed(2)} {num >= 1.0 ? '• Under Budget' : '• Over Budget'}
            </span>
          );
        }
        return <span className="font-mono text-slate-700">{row.cpi || '1.00 (On Budget)'}</span>;
      },
    },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      code: values.code,
      category: values.category,
      bac: values.bac,
      pv: values.pv || values.bac,
      ev: values.ev || values.bac,
      ac: values.ac,
      cpi: '1.00 (On Budget)',
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-heading">Cost Control & EVM Intelligence</h1>
          <p className="text-xs text-slate-500 mt-1">
            WBS Budget tracking, Earned Value Management, Cost Performance Index (CPI) and Forecast at Completion (FAC) engine.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* View Mode Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs">
            <button
              onClick={() => setActiveView('EVM_SUITE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                activeView === 'EVM_SUITE'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Calculator className="h-3.5 w-3.5" />
              EVM Intelligence Suite (3 Models)
            </button>
            <button
              onClick={() => setActiveView('WBS_TABLE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md font-bold transition-all ${
                activeView === 'WBS_TABLE'
                  ? 'bg-white text-brand-600 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="h-3.5 w-3.5" />
              WBS Cost Head Table
            </button>
          </div>

          {canManage && (
            <Button size="sm" onClick={() => setIsOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1" /> Add Budget Head
            </Button>
          )}
        </div>
      </div>

      {/* Render selected view */}
      {activeView === 'EVM_SUITE' ? (
        <EvmCostIntelligenceModule />
      ) : (
        <div className="flex flex-col gap-4">
          <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-bold text-slate-900">Recorded WBS Cost Heads</h2>
              <span className="text-xs text-slate-500">{data?.length || 0} Cost Heads</span>
            </div>
            <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* Modal to add new Budget Head */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add New Cost / Budget Head"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Save Budget Head
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="WBS Code *"
            placeholder="e.g. WBS-1.8"
            {...form.register('code', { required: 'WBS Code is required' })}
            error={form.formState.errors.code?.message}
          />
          <Input
            label="Category / Cost Head *"
            placeholder="e.g. Structural Steel Fabrication"
            {...form.register('category', { required: 'Category is required' })}
            error={form.formState.errors.category?.message}
          />
          <Input
            label="Budget at Completion (BAC) in ₹ *"
            placeholder="e.g. 2500000"
            {...form.register('bac', { required: 'BAC is required' })}
            error={form.formState.errors.bac?.message}
          />
          <Input
            label="Actual Cost (AC) in ₹ *"
            placeholder="e.g. 1850000"
            {...form.register('ac', { required: 'Actual Cost is required' })}
            error={form.formState.errors.ac?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
