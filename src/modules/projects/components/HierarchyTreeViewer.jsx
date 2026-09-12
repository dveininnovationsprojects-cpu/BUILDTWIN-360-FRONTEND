import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  ChevronDown,
  Building2,
  MapPin,
  Layers,
  Grid,
  SquareStack,
  RefreshCw,
  AlertCircle,
} from 'lucide-react';
import { StatusPill, Spinner } from '@/design-system';
import { hierarchyApi } from '../api/projectsApi';
import { ZONE_TYPE_LABELS } from '../constants';

function TreeNode({ label, sublabel, icon: Icon, iconColor = 'text-brand-500', status, badge, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  const hasChildren = children != null;

  return (
    <div className="select-none">
      <button
        type="button"
        onClick={() => hasChildren && setOpen((o) => !o)}
        className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left transition-colors ${
          hasChildren ? 'cursor-pointer hover:bg-white/40' : 'cursor-default'
        }`}
      >
        {hasChildren ? (
          open ? (
            <ChevronDown className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          ) : (
            <ChevronRight className="h-3.5 w-3.5 shrink-0 text-ink-400" />
          )
        ) : (
          <span className="w-3.5 shrink-0" />
        )}

        <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />

        <div className="flex flex-1 items-center gap-2 min-w-0">
          <span className="text-sm font-medium text-ink-900 truncate">{label}</span>
          {sublabel && (
            <span className="text-xs text-ink-400 truncate shrink-0">· {sublabel}</span>
          )}
          {badge && (
            <span className="ml-auto text-xs bg-brand-50 text-brand-700 px-1.5 py-0.5 rounded font-medium shrink-0">
              {badge}
            </span>
          )}
          {status && (
            <span className="ml-auto shrink-0">
              <StatusPill status={status} />
            </span>
          )}
        </div>
      </button>

      {open && hasChildren && (
        <div className="ml-6 border-l border-brand-100 pl-2 mt-1 mb-1">
          {children}
        </div>
      )}
    </div>
  );
}

function ZoneNodes({ zones }) {
  if (!zones || zones.length === 0) {
    return <p className="text-xs text-ink-400 px-9 py-2">No zones registered.</p>;
  }
  return zones.map((zone) => (
    <TreeNode
      key={zone.id}
      label={zone.name}
      sublabel={`${zone.code}${zone.zoneType ? ` · ${ZONE_TYPE_LABELS[zone.zoneType] || zone.zoneType}` : ''}${zone.areaSqFt ? ` · ${Number(zone.areaSqFt).toLocaleString('en-IN')} sq.ft` : ''}`}
      icon={Grid}
      iconColor="text-teal-500"
      status={zone.status}
    />
  ));
}

function FloorNodes({ floors }) {
  if (!floors || floors.length === 0) {
    return <p className="text-xs text-ink-400 px-9 py-2">No floors registered.</p>;
  }
  return floors.map((floor) => (
    <TreeNode
      key={floor.id}
      label={floor.floorName}
      sublabel={`Floor ${floor.floorNumber}${floor.floorType ? ` · ${floor.floorType}` : ''}`}
      icon={Layers}
      iconColor="text-violet-500"
      status={floor.status}
      badge={floor.zones?.length ? `${floor.zones.length} Zones` : undefined}
    >
      <ZoneNodes zones={floor.zones} />
    </TreeNode>
  ));
}

function BuildingNodes({ buildings }) {
  if (!buildings || buildings.length === 0) {
    return <p className="text-xs text-ink-400 px-9 py-2">No buildings registered.</p>;
  }
  return buildings.map((bld) => (
    <TreeNode
      key={bld.id}
      label={bld.name}
      sublabel={`${bld.code}${bld.buildingType ? ` · ${bld.buildingType}` : ''}${bld.totalFloors ? ` · ${bld.totalFloors} Floors` : ''}`}
      icon={Building2}
      iconColor="text-blue-500"
      status={bld.status}
      badge={bld.floors?.length ? `${bld.floors.length} Floors` : undefined}
    >
      <FloorNodes floors={bld.floors} />
    </TreeNode>
  ));
}

function SiteNodes({ sites }) {
  if (!sites || sites.length === 0) {
    return <p className="text-xs text-ink-400 px-9 py-2">No sites registered.</p>;
  }
  return sites.map((site) => (
    <TreeNode
      key={site.id}
      label={site.name}
      sublabel={`${site.code}${site.siteType ? ` · ${site.siteType}` : ''}${site.latitude ? ` · ${site.latitude.toFixed(4)}, ${site.longitude?.toFixed(4)}` : ''}`}
      icon={MapPin}
      iconColor="text-amber-500"
      status={site.status}
      badge={site.buildings?.length ? `${site.buildings.length} Buildings` : undefined}
      defaultOpen
    >
      <BuildingNodes buildings={site.buildings} />
    </TreeNode>
  ));
}

export function HierarchyTreeViewer({ projectId, projectName }) {
  const {
    data: tree,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['hierarchy-tree', projectId],
    queryFn: () => hierarchyApi.getTree(projectId),
    enabled: !!projectId,
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-ink-500">
        <Spinner className="h-8 w-8" />
        <p className="text-sm">Loading hierarchy tree…</p>
      </div>
    );
  }

  if (isError || !tree) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-ink-500">
        <AlertCircle className="h-8 w-8 text-status-warning" />
        <p className="text-sm font-medium">Unable to load hierarchy tree.</p>
        <button
          type="button"
          onClick={() => refetch()}
          className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-800 font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  const totalSites = tree.sites?.length ?? 0;
  const totalBuildings = tree.sites?.reduce((sum, s) => sum + (s.buildings?.length ?? 0), 0) ?? 0;
  const totalFloors = tree.sites?.reduce((sum, s) => sum + s.buildings?.reduce((b, bld) => b + (bld.floors?.length ?? 0), 0), 0) ?? 0;
  const totalZones = tree.sites?.reduce((sum, s) => sum + s.buildings?.reduce((b, bld) => b + bld.floors?.reduce((f, flr) => f + (flr.zones?.length ?? 0), 0), 0), 0) ?? 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Summary bar */}
      <div className="flex flex-wrap items-center gap-4 bg-white/40 border border-surface-border rounded-xl px-4 py-3">
        <div className="flex items-center gap-2 text-sm">
          <MapPin className="h-4 w-4 text-amber-500" />
          <span className="font-semibold text-amber-700">{totalSites}</span>
          <span className="text-ink-500">Sites</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Building2 className="h-4 w-4 text-blue-500" />
          <span className="font-semibold text-blue-700">{totalBuildings}</span>
          <span className="text-ink-500">Buildings</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Layers className="h-4 w-4 text-violet-500" />
          <span className="font-semibold text-violet-700">{totalFloors}</span>
          <span className="text-ink-500">Floors</span>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Grid className="h-4 w-4 text-teal-500" />
          <span className="font-semibold text-teal-700">{totalZones}</span>
          <span className="text-ink-500">Zones</span>
        </div>
        <button
          type="button"
          onClick={() => refetch()}
          className="ml-auto flex items-center gap-1.5 text-xs text-ink-500 hover:text-brand-700 font-medium"
        >
          <RefreshCw className="h-3.5 w-3.5" />
          Refresh
        </button>
      </div>

      {/* Tree */}
      <div className="bg-white/30 border border-surface-border rounded-xl px-2 py-3 overflow-auto">
        <TreeNode
          label={tree.name}
          sublabel={`${tree.code} · PROJECT`}
          icon={SquareStack}
          iconColor="text-brand-600"
          status={tree.status}
          badge={`${totalSites} Sites`}
          defaultOpen
        >
          <SiteNodes sites={tree.sites} />
        </TreeNode>
      </div>

      <p className="text-xs text-ink-400 text-center">
        Click any node to expand / collapse · Hierarchy reflects live backend data
      </p>
    </div>
  );
}
