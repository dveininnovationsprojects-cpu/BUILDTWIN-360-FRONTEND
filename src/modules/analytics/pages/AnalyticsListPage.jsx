import { useState } from 'react';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Table, Button, Modal, Input } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { analyticsApi } from '../api/analyticsApi';
import { QualityNcrIntelligenceView } from '../components/QualityNcrIntelligenceView';
import { DelayRiskForecastView } from '../components/DelayRiskForecastView';
import { AnalyticsFrameworkContainer } from '../components/AnalyticsFrameworkContainer';
import { TrendingDown, ShieldAlert, LineChart, FileSpreadsheet, Plus } from 'lucide-react';

export function AnalyticsListPage() {
  const [activeTab, setActiveTab] = useState('DELAY_RISK'); // 'DELAY_RISK', 'QUALITY_NCR', 'PROJECT_HEALTH', 'FRAMEWORK_SPEC'
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const canManage = useHasRole(
    ROLES.DATA_ANALYST,
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.ADMIN
  );

  const form = useForm({
    defaultValues: {
      project: '',
      healthIndex: '85.0 / 100 (Green)',
      delayRisk: '20.0 (Low Risk)',
      forecastCompletion: 'Dec 31, 2026 (On Schedule)',
    },
  });

  const { data, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: () => analyticsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (payload) => analyticsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['analytics'] });
      pushToast('Analytics KPI record added.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to add analytics KPI.', 'error');
    },
  });

  const columns = [
    {
      key: 'project',
      header: 'Project Name',
      render: (row) => <span className="font-semibold text-ink-900">{row.project}</span>,
    },
    {
      key: 'healthIndex',
      header: 'Composite Health Index',
      render: (row) => {
        const isGreen = row.healthIndex.includes('Green');
        return (
          <span
            className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${
              isGreen ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
            }`}
          >
            {row.healthIndex}
          </span>
        );
      },
    },
    {
      key: 'delayRisk',
      header: 'Predictive Delay Risk',
      render: (row) => (
        <span className="font-mono text-xs font-medium text-ink-700">{row.delayRisk}</span>
      ),
    },
    {
      key: 'forecastCompletion',
      header: 'Forecast Handover Date',
      render: (row) => (
        <span className="text-xs font-medium text-ink-800">{row.forecastCompletion}</span>
      ),
    },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      project: values.project,
      healthIndex: values.healthIndex,
      delayRisk: values.delayRisk,
      forecastCompletion: values.forecastCompletion,
    });
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Page Header */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        <div>
          <ModulePageHeading>Construction Intelligence</ModulePageHeading>
          <p className="text-xs text-ink-500 mt-0.5">
            Predictive delay-risk forecasting, milestone critical path telemetry, quality non-conformance radar, and engineering governance.
          </p>
        </div>

        {/* Global Navigation Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto rounded-xl border border-surface-border bg-surface-card p-1 shadow-xs">
          <button
            onClick={() => setActiveTab('DELAY_RISK')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'DELAY_RISK'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-ink-600 hover:bg-surface-subtle'
            }`}
          >
            <TrendingDown className="h-3.5 w-3.5" />
            <span>Delay-Risk &amp; Forecast</span>
          </button>

          <button
            onClick={() => setActiveTab('QUALITY_NCR')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'QUALITY_NCR'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-ink-600 hover:bg-surface-subtle'
            }`}
          >
            <ShieldAlert className="h-3.5 w-3.5" />
            <span>Quality &amp; NCR Intelligence</span>
          </button>

          <button
            onClick={() => setActiveTab('PROJECT_HEALTH')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'PROJECT_HEALTH'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-ink-600 hover:bg-surface-subtle'
            }`}
          >
            <LineChart className="h-3.5 w-3.5" />
            <span>Project Health &amp; EVM</span>
          </button>

          <button
            onClick={() => setActiveTab('FRAMEWORK_SPEC')}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === 'FRAMEWORK_SPEC'
                ? 'bg-brand-600 text-white shadow-xs'
                : 'text-ink-600 hover:bg-surface-subtle'
            }`}
          >
            <FileSpreadsheet className="h-3.5 w-3.5" />
            <span>Metric Governance (7 Specs)</span>
          </button>
        </div>
      </div>

      {/* TAB 1: DELAY-RISK & FORECAST WIDGETS WITH DRILL-DOWN */}
      {activeTab === 'DELAY_RISK' && (
        <DelayRiskForecastView onNavigateToQuality={() => setActiveTab('QUALITY_NCR')} />
      )}

      {/* TAB 2: QUALITY & NCR MANAGEMENT INTELLIGENCE HUB */}
      {activeTab === 'QUALITY_NCR' && <QualityNcrIntelligenceView />}

      {/* TAB 3: EXECUTIVE PROJECT HEALTH & EVM TABLE */}
      {activeTab === 'PROJECT_HEALTH' && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card p-4 shadow-xs">
            <div>
              <h3 className="text-sm font-bold text-ink-900">Portfolio Project Health &amp; Delay Risk Index</h3>
              <p className="text-xs text-ink-500">
                Cross-project predictive health ratings calculated from ground progress, materials, and NCR velocity.
              </p>
            </div>
            {canManage && (
              <Button size="sm" onClick={() => setIsOpen(true)}>
                <Plus className="mr-1.5 h-4 w-4" /> Add KPI Entry
              </Button>
            )}
          </div>

          <Table
            columns={columns}
            data={data ?? []}
            rowKey={(row) => row.id || row.project}
            isLoading={isLoading}
          />
        </div>
      )}

      {/* TAB 4: METRIC GOVERNANCE FRAMEWORK SPECIFICATION */}
      {activeTab === 'FRAMEWORK_SPEC' && <AnalyticsFrameworkContainer />}

      {/* Add Analytics Entry Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Add Analytics KPI Record"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Add Analytics Entry
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4 text-xs" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Project Name *"
            placeholder="e.g. PRJ-003 Guindy Tech Park"
            {...form.register('project', { required: 'Project name is required' })}
            error={form.formState.errors.project?.message}
          />
          <Input
            label="Health Index Rating *"
            placeholder="e.g. 88.5 / 100 (Green)"
            {...form.register('healthIndex', { required: 'Health index is required' })}
            error={form.formState.errors.healthIndex?.message}
          />
          <Input
            label="Delay Risk Score *"
            placeholder="e.g. 24.0 (Low Risk)"
            {...form.register('delayRisk', { required: 'Delay risk score is required' })}
            error={form.formState.errors.delayRisk?.message}
          />
          <Input
            label="Forecast Completion *"
            placeholder="e.g. Nov 15, 2026 (On Schedule)"
            {...form.register('forecastCompletion', { required: 'Forecast completion is required' })}
            error={form.formState.errors.forecastCompletion?.message}
          />
        </form>
      </Modal>
    </div>
  );
}
