import { PlayCircle, Layers, PauseCircle, CheckCircle, IndianRupee, Briefcase } from 'lucide-react';
import { StatCard } from '@/design-system';
import { formatCurrency } from '@/modules/projects/constants';

export function WbsMetricsBar({ workPackages = [] }) {
  const totalPackages = workPackages.length;
  const inProgress = workPackages.filter((w) => w.status === 'IN_PROGRESS').length;
  const planned = workPackages.filter((w) => w.status === 'PLANNED').length;
  const onHold = workPackages.filter((w) => w.status === 'ON_HOLD').length;
  const completed = workPackages.filter((w) => w.status === 'COMPLETED').length;
  const totalBudget = workPackages.reduce((acc, w) => acc + (Number(w.budgetAmount) || 0), 0);

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-6">
      <StatCard
        label="Total Packages"
        value={totalPackages}
        icon={<Briefcase className="h-4 w-4 text-brand-500" />}
      />
      <StatCard
        label="In Progress"
        value={inProgress}
        deltaTone="success"
        icon={<PlayCircle className="h-4 w-4 text-emerald-500" />}
      />
      <StatCard
        label="Planned"
        value={planned}
        deltaTone="neutral"
        icon={<Layers className="h-4 w-4 text-sky-500" />}
      />
      <StatCard
        label="On Hold"
        value={onHold}
        deltaTone={onHold > 0 ? 'warning' : 'neutral'}
        icon={<PauseCircle className="h-4 w-4 text-amber-500" />}
      />
      <StatCard
        label="Completed"
        value={completed}
        deltaTone="success"
        icon={<CheckCircle className="h-4 w-4 text-indigo-500" />}
      />
      <StatCard
        label="Allocated Budget"
        value={formatCurrency(totalBudget)}
        icon={<IndianRupee className="h-4 w-4 text-emerald-600" />}
      />
    </div>
  );
}
