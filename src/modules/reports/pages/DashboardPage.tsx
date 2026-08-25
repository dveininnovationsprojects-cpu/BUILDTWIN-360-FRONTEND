import { StatCard, Card, CardHeader, CardTitle, ProgressBar } from '@/design-system';
import { BusinessCalculationLogicModule } from '@/modules/analytics/components/BusinessCalculationLogicModule';

// FR-130..133: executive/project/site dashboard shell. Wire each StatCard's
// value to GET /analytics/project-health and GET /projects/{id}/dashboard once available.
export function DashboardPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="page-heading">Executive Dashboard</h1>
        <p className="page-subheading">Portfolio health across all active projects.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Active Projects" value="—" />
        <StatCard label="Physical Progress" value="—%" />
        <StatCard label="Open Quality Issues" value="—" deltaTone="danger" />
        <StatCard label="Material Alerts" value="—" deltaTone="warning" />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Project Health</CardTitle>
        </CardHeader>
        <div className="flex flex-col gap-3">
          <div>
            <div className="mb-1 flex justify-between text-sm text-ink-500">
              <span>Padur Independent Residence — PRJ-001</span>
              <span>—%</span>
            </div>
            <ProgressBar value={0} />
          </div>
        </div>
      </Card>

      {/* Business Calculation Logic Alignment with Domain Rules */}
      <BusinessCalculationLogicModule />
    </div>
  );
}

