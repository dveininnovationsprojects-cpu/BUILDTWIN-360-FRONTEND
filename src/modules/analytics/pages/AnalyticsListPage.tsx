import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { analyticsApi } from '../api/analyticsApi';
import type { ProjectHealth } from '../types';
import { BusinessCalculationLogicModule } from '../components/BusinessCalculationLogicModule';

// Delay-risk, forecast completion and project health index (section 11).
export function AnalyticsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['analytics'], queryFn: () => analyticsApi.list() });

  const columns: Column<ProjectHealth>[] = [
    { key: 'project', header: 'Project' },
    { key: 'healthIndex', header: 'Health Index' },
    { key: 'delayRisk', header: 'Delay Risk' },
    { key: 'forecastCompletion', header: 'Forecast Completion' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Construction Intelligence</h1>
          <p className="page-subheading">Delay-risk, forecast completion and project health index (section 11).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>

      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />

      {/* Business Calculation Logic Alignment with Domain Rules */}
      <BusinessCalculationLogicModule />
    </div>
  );
}

