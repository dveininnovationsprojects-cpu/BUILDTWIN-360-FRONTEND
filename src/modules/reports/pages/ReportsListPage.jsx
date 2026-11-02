import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  FileBarChart,
  Calendar,
  Package,
  Users,
  DollarSign,
  Layers,
  Download,
  Printer,
  Sparkles,
  Plus,
  RefreshCw,
  Clock,
  ShieldCheck,
  Building2,
} from 'lucide-react';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { Button, Modal, Input, StatusPill } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { reportsApi } from '../api/reportsApi';

import { ExecutiveHealthScorecard } from '../components/ExecutiveHealthScorecard';
import { WeeklyExecutiveReportTab } from '../components/WeeklyExecutiveReportTab';
import { InventoryReportTab } from '../components/InventoryReportTab';
import { ProcurementLabourReportTab } from '../components/ProcurementLabourReportTab';
import { CostQualityReportTab } from '../components/CostQualityReportTab';
import { ReportArchiveTab } from '../components/ReportArchiveTab';
import { ReportExportModal } from '../components/ReportExportModal';

export function ReportsListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  // Active Tab: 'weekly' | 'inventory' | 'proc-labour' | 'cost-quality' | 'archive'
  const [activeTab, setActiveTab] = useState('weekly');

  // Selected Project (defaults to 1)
  const [selectedProjectId, setSelectedProjectId] = useState(1);

  // Selected Reporting Week (defaults to Week 10)
  const [selectedWeek, setSelectedWeek] = useState(10);

  // Modals state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [activePreviewReport, setActivePreviewReport] = useState(null);

  // RBAC: Executive & Analysts have full scheduling authority
  const canManage = useHasRole(
    ROLES.DIRECTOR,
    ROLES.PROJECT_MANAGER,
    ROLES.DATA_ANALYST,
    ROLES.AUDITOR,
    ROLES.ADMIN
  );

  // Form for scheduling a new report
  const scheduleForm = useForm({
    defaultValues: {
      name: '',
      period: 'Week 10 (Aug 2026)',
      format: 'PDF Document',
    },
  });

  // 1. Fetch available projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects-list-simple'],
    queryFn: () => projectsApi.list(),
  });

  const selectedProject =
    projects.find((p) => String(p.id) === String(selectedProjectId)) || projects[0];

  // 2. Fetch Live Backend Report Datasets
  const {
    data: analyticsData,
    isLoading: isLoadingAnalytics,
    refetch: refetchAnalytics,
    isRefetching: isRefetchingAnalytics,
  } = useQuery({
    queryKey: ['report-analytics', selectedProjectId],
    queryFn: () => reportsApi.getAnalyticsAggregation(selectedProjectId),
  });

  const {
    data: weeklyData,
    isLoading: isLoadingWeekly,
    refetch: refetchWeekly,
  } = useQuery({
    queryKey: ['report-weekly', selectedProjectId, selectedWeek],
    queryFn: () => reportsApi.getWeeklyReport(selectedProjectId, selectedWeek),
  });

  const {
    data: inventoryData,
    isLoading: isLoadingInventory,
    refetch: refetchInventory,
  } = useQuery({
    queryKey: ['report-inventory', selectedProjectId],
    queryFn: () => reportsApi.getInventoryReport(selectedProjectId),
  });

  const {
    data: procLabourData,
    isLoading: isLoadingProcLabour,
    refetch: refetchProcLabour,
  } = useQuery({
    queryKey: ['report-proc-labour', selectedProjectId],
    queryFn: () => reportsApi.getProcurementLabourReport(selectedProjectId),
  });

  const {
    data: costQualityData,
    isLoading: isLoadingCostQuality,
    refetch: refetchCostQuality,
  } = useQuery({
    queryKey: ['report-cost-quality', selectedProjectId],
    queryFn: () => reportsApi.getCostQualityReport(selectedProjectId),
  });

  const {
    data: archiveReports = [],
    isLoading: isLoadingArchive,
  } = useQuery({
    queryKey: ['reports-archive'],
    queryFn: () => reportsApi.list(),
  });

  // Refetch all queries
  const handleRefreshAll = async () => {
    await Promise.all([
      refetchAnalytics(),
      refetchWeekly(),
      refetchInventory(),
      refetchProcLabour(),
      refetchCostQuality(),
    ]);
    pushToast('Live report data synchronized with backend.', 'success');
  };

  // Schedule / Create Report Mutation
  const createReportMutation = useMutation({
    mutationFn: (payload) => reportsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-archive'] });
      pushToast('Report scheduled & generated in archive.', 'success');
      setIsScheduleModalOpen(false);
      scheduleForm.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to generate report.', 'error');
    },
  });

  // Delete Archive Entry Mutation
  const deleteReportMutation = useMutation({
    mutationFn: (id) => reportsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['reports-archive'] });
      pushToast('Report archive removed.', 'success');
    },
  });

  // Handle scheduling form submit
  const handleScheduleSubmit = (values) => {
    createReportMutation.mutate({
      name: values.name,
      period: values.period,
      format: values.format,
      type: 'EXECUTIVE',
      author: 'Director / Management',
    });
  };

  // Quick Snapshot Save
  const handleSaveCurrentSnapshot = () => {
    const defaultName = `Executive Snapshot - ${selectedProject?.name || 'Project'} (Week ${selectedWeek})`;
    createReportMutation.mutate({
      name: defaultName,
      period: `Week ${selectedWeek} Snapshot`,
      format: 'PDF Document',
      type: 'WEEKLY',
      author: 'Director / Management',
    });
  };

  // Open Preview Modal
  const handleOpenPrintPreview = (reportItem = null) => {
    setActivePreviewReport(
      reportItem || {
        name: `Executive Consolidated Report - ${selectedProject?.name || 'Padur Project'} (Week ${selectedWeek})`,
        period: `Week ${selectedWeek}`,
      }
    );
    setIsExportModalOpen(true);
  };

  // Download Report Action
  const handleDownloadReport = (report) => {
    // Generate a simple CSV/JSON or browser print
    const content = JSON.stringify(
      {
        report: report.name,
        project: selectedProject?.name,
        period: report.period,
        generatedAt: report.generatedAt,
        weeklySummary: weeklyData,
        analytics: analyticsData,
        costQuality: costQualityData,
        inventory: inventoryData,
        procurementLabour: procLabourData,
      },
      null,
      2
    );
    const blob = new Blob([content], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${report.name.toLowerCase().replace(/[^a-z0-9]/g, '_')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    pushToast(`Export downloaded: ${report.name}`, 'success');
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Header & Project Switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <ModulePageHeading>Reports &amp; Analytics</ModulePageHeading>
          <p className="text-xs text-ink-500 mt-1">
            Consolidated Weekly Project Reports, Inventory Valuation, Cost/Quality EVM &amp; Composite Health Scores
          </p>
        </div>

        {/* Project Selector */}
        <div className="flex items-center gap-2.5">
          <label htmlFor="project-picker" className="text-xs font-semibold text-ink-600 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-brand-600" />
            Project:
          </label>
          <select
            id="project-picker"
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            className="rounded-lg border border-surface-border bg-white px-3 py-1.5 text-xs font-bold text-ink-900 shadow-2xs focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
          >
            {projects.map((proj) => (
              <option key={proj.id} value={proj.id}>
                {proj.name} ({proj.code || 'PADUR'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top Executive Health Scorecard */}
      <ExecutiveHealthScorecard
        analytics={analyticsData}
        selectedProject={selectedProject}
        selectedWeek={selectedWeek}
        onRefresh={handleRefreshAll}
        isRefreshing={isRefetchingAnalytics}
        onPrint={() => handleOpenPrintPreview()}
        onExport={handleSaveCurrentSnapshot}
      />

      {/* 5 Tab Navigation Bar */}
      <div className="flex items-center gap-1 overflow-x-auto border-b border-surface-border pb-px scrollbar-none">
        <button
          type="button"
          onClick={() => setActiveTab('weekly')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all duration-200 shrink-0 ${
            activeTab === 'weekly'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50'
          }`}
        >
          <Calendar className="h-4 w-4" />
          Weekly Executive Briefing
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all duration-200 shrink-0 ${
            activeTab === 'inventory'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50'
          }`}
        >
          <Package className="h-4 w-4" />
          Material &amp; Inventory Audit
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('proc-labour')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all duration-200 shrink-0 ${
            activeTab === 'proc-labour'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50'
          }`}
        >
          <Users className="h-4 w-4" />
          Procurement &amp; Labour Unified
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('cost-quality')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all duration-200 shrink-0 ${
            activeTab === 'cost-quality'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          Cost &amp; Quality Control (EVM)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('archive')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 rounded-t-lg transition-all duration-200 shrink-0 ${
            activeTab === 'archive'
              ? 'border-brand-600 text-brand-700 bg-brand-50/60 shadow-2xs'
              : 'border-transparent text-ink-500 hover:text-ink-800 hover:bg-slate-50'
          }`}
        >
          <Layers className="h-4 w-4" />
          Report Archives ({archiveReports.length})
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === 'weekly' && (
        <WeeklyExecutiveReportTab
          data={weeklyData}
          isLoading={isLoadingWeekly}
          selectedWeek={selectedWeek}
          onWeekChange={setSelectedWeek}
        />
      )}

      {activeTab === 'inventory' && (
        <InventoryReportTab
          data={inventoryData}
          isLoading={isLoadingInventory}
        />
      )}

      {activeTab === 'proc-labour' && (
        <ProcurementLabourReportTab
          data={procLabourData}
          isLoading={isLoadingProcLabour}
        />
      )}

      {activeTab === 'cost-quality' && (
        <CostQualityReportTab
          data={costQualityData}
          isLoading={isLoadingCostQuality}
        />
      )}

      {activeTab === 'archive' && (
        <ReportArchiveTab
          reports={archiveReports}
          isLoading={isLoadingArchive}
          onOpenCreate={() => setIsScheduleModalOpen(true)}
          onViewSnapshot={(report) => handleOpenPrintPreview(report)}
          onDownload={handleDownloadReport}
          onDelete={(id) => deleteReportMutation.mutate(id)}
          canManage={canManage}
        />
      )}

      {/* Schedule / Generate New Report Modal */}
      <Modal
        open={isScheduleModalOpen}
        onClose={() => setIsScheduleModalOpen(false)}
        title="Schedule / Generate Executive Report"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsScheduleModalOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={scheduleForm.handleSubmit(handleScheduleSubmit)}
              isLoading={createReportMutation.isPending}
            >
              Generate Report
            </Button>
          </>
        }
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={scheduleForm.handleSubmit(handleScheduleSubmit)}
        >
          <Input
            label="Report Title *"
            placeholder="e.g. Month-End EVM & Quality Audit Dossier"
            {...scheduleForm.register('name', { required: 'Report name is required' })}
            error={scheduleForm.formState.errors.name?.message}
          />
          <Input
            label="Reporting Period *"
            placeholder="e.g. Week 10 (Aug 18 - Aug 25, 2026)"
            {...scheduleForm.register('period', { required: 'Period is required' })}
            error={scheduleForm.formState.errors.period?.message}
          />
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Export Format</label>
            <select
              {...scheduleForm.register('format')}
              className="w-full rounded-lg border border-surface-border bg-white px-3 py-2 text-xs font-medium text-ink-800 shadow-2xs focus:border-brand-500 focus:outline-none"
            >
              <option value="PDF Document">PDF Document (High-Res Executive Print)</option>
              <option value="Excel Workbook">Excel Workbook (.xlsx Financials)</option>
              <option value="CSV Data File">CSV Raw Data Export (.csv)</option>
            </select>
          </div>
        </form>
      </Modal>

      {/* Official Executive Print & Export Modal */}
      <ReportExportModal
        open={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        report={activePreviewReport}
        liveData={{
          weekly: weeklyData,
          analytics: analyticsData,
          costQuality: costQualityData,
          inventory: inventoryData,
          procLabour: procLabourData,
        }}
      />
    </div>
  );
}
