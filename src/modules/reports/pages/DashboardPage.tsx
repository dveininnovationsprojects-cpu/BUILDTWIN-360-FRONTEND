import { Card, CardHeader, CardTitle, StatusPill } from '@/design-system';
import { useAuthStore, ROLE_LABELS } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { ROLE_DASHBOARDS_DATA } from '../components/RoleDashboardsData';
import { UserCheck, Sparkles, Building2, Layers, Calendar, TrendingUp, BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
  ReferenceLine,
} from 'recharts';

const PROGRESS_TREND_DATA = [
  { month: 'Apr 2026', planned: 15, actual: 14 },
  { month: 'May 2026', planned: 30, actual: 28 },
  { month: 'Jun 2026', planned: 48, actual: 42 },
  { month: 'Jul 2026', planned: 62, actual: 54 },
  { month: 'Aug 2026', planned: 78, actual: 64.5 },
];

const SPI_CPI_PERFORMANCE_DATA = [
  { package: 'Substructure', spi: 0.98, cpi: 1.02 },
  { package: 'GF Columns', spi: 1.00, cpi: 1.00 },
  { package: 'GF Slab', spi: 0.83, cpi: 0.94 },
  { package: 'FF Columns', spi: 0.90, cpi: 0.96 },
  { package: 'Masonry', spi: 0.95, cpi: 0.98 },
];

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const userRole = user?.roles[0] ?? ROLES.DIRECTOR;
  const activeConfig = ROLE_DASHBOARDS_DATA[userRole] ?? ROLE_DASHBOARDS_DATA[ROLES.DIRECTOR];

  return (
    <div className="flex flex-col gap-6 max-w-[1600px] mx-auto pb-8">
      {/* Sleek Executive Banner Header */}
      <div className="relative overflow-hidden rounded-2xl bg-slate-900 text-white p-6 shadow-md border border-slate-800">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl pointer-events-none" />
        
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between relative z-10">
          <div>
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-brand-500/20 p-2 text-brand-400 border border-brand-500/30">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl font-extrabold text-white tracking-tight">{activeConfig.title}</h1>
                  <span className="rounded-full bg-brand-500/20 px-2.5 py-0.5 text-xs font-bold text-brand-300 border border-brand-400/30">
                    {userRole}
                  </span>
                </div>
                <p className="text-xs text-slate-400 mt-1">
                  {activeConfig.responsibilities}
                </p>
              </div>
            </div>
          </div>

          {/* User Persona */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 rounded-xl bg-slate-800/80 px-3 py-2 text-xs border border-slate-700 backdrop-blur-sm">
              <Calendar className="h-4 w-4 text-brand-400" />
              <div>
                <div className="text-slate-400 text-[10px]">Today's Date:</div>
                <div className="font-bold text-slate-200 text-xs">Aug 26, 2026</div>
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl bg-slate-800/80 px-3 py-2 text-xs border border-slate-700 backdrop-blur-sm">
              <UserCheck className="h-4 w-4 text-emerald-400" />
              <div>
                <div className="text-slate-400 text-[10px]">Logged-in User: <span className="font-semibold text-slate-200">{user?.name ?? 'User'}</span></div>
                <div className="font-bold text-emerald-400 text-xs">{ROLE_LABELS[userRole]}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* High-Density Key Performance Indicators Grid */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-brand-600" />
            <h2 className="text-xs font-bold uppercase tracking-wider text-ink-600">
              Key Performance Indicators ({activeConfig.kpis.length} Indicators)
            </h2>
          </div>
          <span className="text-[11px] font-medium text-ink-500 bg-surface-subtle px-2.5 py-1 rounded-full border border-surface-border">
            Scope: {activeConfig.accessScope}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6">
          {activeConfig.kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="flex flex-col justify-between rounded-xl border border-surface-border bg-white p-4 shadow-sm hover:border-brand-300 hover:shadow-md transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono text-[10px] font-bold text-brand-700 bg-brand-50 px-2 py-0.5 rounded border border-brand-100 group-hover:bg-brand-100 transition-colors">
                    {kpi.code}
                  </span>
                  <StatusPill status={kpi.tone ?? 'neutral'} tone={kpi.tone} className="text-[10px] py-0.5 px-2" />
                </div>
                <div className="text-xs font-bold text-ink-900 leading-snug mb-3 group-hover:text-brand-950">
                  {kpi.label}
                </div>
              </div>

              <div className="border-t border-surface-border pt-3">
                <div className="text-2xl font-extrabold text-brand-950 font-mono tracking-tight">
                  {kpi.value}
                </div>
                {kpi.subtext && (
                  <div className="text-[11px] font-medium text-ink-500 mt-1 leading-tight line-clamp-1">
                    {kpi.subtext}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Progress S-Curve Area Chart */}
        <Card className="flex flex-col border-surface-border shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="border-b border-surface-border pb-3 bg-surface-subtle/50 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-950 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-brand-600" />
                Cumulative Physical Progress Trend (%)
              </CardTitle>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                S-Curve Baseline
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-1">Planned vs Actual progress trajectory over project timeline</p>
          </CardHeader>
          <div className="p-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={PROGRESS_TREND_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="plannedGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="actualGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} unit="%" />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                  itemStyle={{ color: '#cbd5e1' }}
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="planned" name="Planned Progress (%)" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#plannedGradient)" />
                <Area type="monotone" dataKey="actual" name="Actual Progress (%)" stroke="#10b981" strokeWidth={2.5} fillOpacity={1} fill="url(#actualGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Cost & Schedule Performance Index Bar Chart */}
        <Card className="flex flex-col border-surface-border shadow-sm rounded-xl overflow-hidden bg-white">
          <CardHeader className="border-b border-surface-border pb-3 bg-surface-subtle/50 px-5 pt-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-brand-950 flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-brand-600" />
                Performance Indices (SPI & CPI) by Work Package
              </CardTitle>
              <span className="text-[11px] font-semibold text-brand-700 bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                Target = 1.00
              </span>
            </div>
            <p className="text-xs text-ink-500 mt-1">Schedule & Cost performance index compared against 1.0 baseline</p>
          </CardHeader>
          <div className="p-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={SPI_CPI_PERFORMANCE_DATA} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="package" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0.6, 1.2]} tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Legend iconType="square" wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                <ReferenceLine y={1.0} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Target 1.0', fill: '#ef4444', fontSize: 10, position: 'top' }} />
                <Bar dataKey="spi" name="Schedule Index (SPI)" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={16} />
                <Bar dataKey="cpi" name="Cost Index (CPI)" fill="#8b5cf6" radius={[4, 4, 0, 0]} barSize={16} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Executive Primary Focus & Operational Widgets */}
      {activeConfig.primaryFocusWidgets && activeConfig.primaryFocusWidgets.length > 0 && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {activeConfig.primaryFocusWidgets.map((widget, idx) => (
            <Card key={idx} className="flex flex-col justify-between border-surface-border shadow-sm rounded-xl overflow-hidden bg-white">
              <div>
                <CardHeader className="border-b border-surface-border pb-3 bg-surface-subtle/50 px-5 pt-4">
                  <CardTitle className="text-base font-bold text-brand-950 flex items-center gap-2">
                    <Layers className="h-4 w-4 text-brand-600" />
                    {widget.title}
                  </CardTitle>
                  <p className="text-xs text-ink-500 mt-1">{widget.description}</p>
                </CardHeader>

                <div className="p-5 flex flex-col gap-3.5">
                  {widget.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className="flex flex-col gap-2 rounded-lg border border-surface-border p-3.5 bg-white hover:border-brand-200 hover:bg-slate-50/50 transition-all"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-xs font-bold text-ink-900 leading-tight">{item.label}</span>
                        {item.badge && (
                          <StatusPill status={item.badge} tone={item.tone ?? 'neutral'} className="text-[10px] whitespace-nowrap" />
                        )}
                      </div>

                      {item.detail.includes('|') ? (
                        <div className="flex flex-wrap gap-2 mt-0.5">
                          {item.detail.split('|').map((part, pIdx) => (
                            <span key={pIdx} className="inline-flex items-center rounded bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700 border border-slate-200 font-mono">
                              {part.trim()}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-ink-600 leading-relaxed">{item.detail}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}


