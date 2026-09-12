import { useQuery } from '@tanstack/react-query';
import { Building2, Layers, PlayCircle, PauseCircle, CheckCircle, IndianRupee, MapPin } from 'lucide-react';
import { StatCard } from '@/design-system';
import { projectsApi } from '../api/projectsApi';
import { formatCurrency } from '../constants';

export function ProjectMetricsBar() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ['projects-metrics'],
    queryFn: projectsApi.getMetrics,
  });

  if (isLoading && !metrics) {
    return (
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-7 animate-pulse">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="surface-panel h-24 rounded-xl bg-brand-900/10" />
        ))}
      </div>
    );
  }

  const m = metrics || {
    totalProjects: 0,
    activeProjects: 0,
    plannedProjects: 0,
    onHoldProjects: 0,
    completedProjects: 0,
    totalEstimatedBudget: 0,
    totalSites: 0,
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7">
      <StatCard
        label="Total Projects"
        value={m.totalProjects}
        icon={<Building2 className="h-4 w-4 text-brand-500" />}
      />
      <StatCard
        label="Active"
        value={m.activeProjects}
        deltaTone="success"
        icon={<PlayCircle className="h-4 w-4 text-emerald-500" />}
      />
      <StatCard
        label="Planned"
        value={m.plannedProjects}
        deltaTone="neutral"
        icon={<Layers className="h-4 w-4 text-sky-500" />}
      />
      <StatCard
        label="On Hold"
        value={m.onHoldProjects}
        deltaTone={m.onHoldProjects > 0 ? 'warning' : 'neutral'}
        icon={<PauseCircle className="h-4 w-4 text-amber-500" />}
      />
      <StatCard
        label="Completed"
        value={m.completedProjects}
        deltaTone="success"
        icon={<CheckCircle className="h-4 w-4 text-indigo-500" />}
      />
      <StatCard
        label="Total Budget"
        value={formatCurrency(m.totalEstimatedBudget)}
        icon={<IndianRupee className="h-4 w-4 text-emerald-600" />}
      />
      <StatCard
        label="Total Sites"
        value={m.totalSites}
        icon={<MapPin className="h-4 w-4 text-purple-500" />}
      />
    </div>
  );
}
