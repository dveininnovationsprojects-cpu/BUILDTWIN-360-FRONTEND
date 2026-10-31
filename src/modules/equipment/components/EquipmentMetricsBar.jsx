import { Truck, CheckCircle2, Clock, Wrench, AlertTriangle, ShieldCheck } from 'lucide-react';

export function EquipmentMetricsBar({
  equipmentList = [],
  usageLogs = [],
  selectedStatus,
  onSelectStatus,
}) {
  const totalAssets = equipmentList.length;
  const availableCount = equipmentList.filter((e) => e.status === 'AVAILABLE').length;
  const inUseCount = equipmentList.filter((e) => e.status === 'IN_USE').length;
  const maintenanceCount = equipmentList.filter((e) => e.status === 'MAINTENANCE').length;

  const totalOperatingHours = usageLogs.reduce((acc, log) => acc + (Number(log.hoursUsed) || 0), 0);
  const totalDowntimeHours = usageLogs.reduce((acc, log) => acc + (Number(log.downtimeHours) || 0), 0);

  const availabilityRate = totalAssets > 0 ? Math.round(((totalAssets - maintenanceCount) / totalAssets) * 100) : 100;

  const cards = [
    {
      id: 'TOTAL',
      label: 'Total Fleet Assets',
      value: totalAssets,
      subtext: `${availabilityRate}% Fleet Health`,
      icon: Truck,
      color: 'blue',
      onClick: () => onSelectStatus && onSelectStatus(selectedStatus === 'ALL' ? null : 'ALL'),
      active: selectedStatus === 'ALL',
    },
    {
      id: 'AVAILABLE',
      label: 'Available On-Site',
      value: availableCount,
      subtext: 'Ready for allocation',
      icon: CheckCircle2,
      color: 'emerald',
      onClick: () => onSelectStatus && onSelectStatus(selectedStatus === 'AVAILABLE' ? null : 'AVAILABLE'),
      active: selectedStatus === 'AVAILABLE',
    },
    {
      id: 'IN_USE',
      label: 'Actively In-Use',
      value: inUseCount,
      subtext: `${totalOperatingHours.toFixed(1)} hrs logged`,
      icon: Clock,
      color: 'amber',
      onClick: () => onSelectStatus && onSelectStatus(selectedStatus === 'IN_USE' ? null : 'IN_USE'),
      active: selectedStatus === 'IN_USE',
    },
    {
      id: 'MAINTENANCE',
      label: 'Under Maintenance',
      value: maintenanceCount,
      subtext: `${totalDowntimeHours.toFixed(1)} hrs downtime`,
      icon: Wrench,
      color: 'red',
      onClick: () => onSelectStatus && onSelectStatus(selectedStatus === 'MAINTENANCE' ? null : 'MAINTENANCE'),
      active: selectedStatus === 'MAINTENANCE',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((c) => {
        const Icon = c.icon;
        const colorClasses = {
          blue: 'text-blue-600 bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800',
          emerald: 'text-emerald-600 bg-emerald-50 border-emerald-200 dark:bg-emerald-950/40 dark:border-emerald-800',
          amber: 'text-amber-600 bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800',
          red: 'text-red-600 bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800',
        }[c.color];

        return (
          <div
            key={c.id}
            onClick={c.onClick}
            className={`surface-panel p-4 flex flex-col justify-between rounded-xl border transition-all cursor-pointer hover:shadow-md ${
              c.active
                ? 'ring-2 ring-brand-500 border-brand-500 shadow-sm'
                : 'border-surface-border hover:border-brand-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-ink-500">
                {c.label}
              </span>
              <div className={`p-2 rounded-lg border ${colorClasses}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-bold text-ink-900 tracking-tight">{c.value}</span>
              <p className="text-[11px] text-ink-500 mt-0.5">{c.subtext}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
