import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronRight,
  Building2,
  MapPin,
  Layers,
  GitBranch,
  ShieldCheck,
  Users,
  Calendar,
  IndianRupee,
  ArrowLeft,
} from 'lucide-react';
import { StatusPill, Tabs, Spinner } from '@/design-system';
import { projectsApi } from '../api/projectsApi';
import { SitesManager } from './SitesManager';
import { BuildingsManager } from './BuildingsManager';
import { FloorsManager } from './FloorsManager';
import { ZonesManager } from './ZonesManager';
import { HierarchyTreeViewer } from './HierarchyTreeViewer';
import { HierarchyValidatorTool } from './HierarchyValidatorTool';
import { formatCurrency, formatArea, PROJECT_TYPE_LABELS } from '../constants';

// Breadcrumb level types
const LEVEL = {
  PROJECT: 'project',
  SITE: 'site',
  BUILDING: 'building',
  FLOOR: 'floor',
};

function DetailPill({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-ink-600">
      <Icon className="h-3.5 w-3.5 text-brand-400 shrink-0" />
      <span className="font-medium text-ink-500">{label}:</span>
      <span className="text-ink-700">{value}</span>
    </div>
  );
}

function Breadcrumbs({ crumbs, onNavigate }) {
  return (
    <nav className="flex flex-wrap items-center gap-1 text-sm">
      {crumbs.map((crumb, i) => (
        <span key={crumb.level} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-ink-300" />}
          <button
            type="button"
            onClick={() => i < crumbs.length - 1 && onNavigate(crumb.level)}
            className={`rounded px-1.5 py-0.5 font-medium transition-colors ${
              i === crumbs.length - 1
                ? 'text-brand-700 bg-brand-50 cursor-default'
                : 'text-ink-500 hover:text-brand-700 hover:bg-white/60'
            }`}
          >
            {crumb.label}
          </button>
        </span>
      ))}
    </nav>
  );
}

export function ProjectHierarchyWorkspace({ projectId, onBack }) {
  const [level, setLevel] = useState(LEVEL.PROJECT);
  const [selectedSite, setSelectedSite] = useState(null);
  const [selectedBuilding, setSelectedBuilding] = useState(null);
  const [selectedFloor, setSelectedFloor] = useState(null);

  const { data: project, isLoading } = useQuery({
    queryKey: ['projects', projectId],
    queryFn: () => projectsApi.getById(projectId),
    enabled: !!projectId,
  });

  const navigateTo = (lvl) => {
    if (lvl === LEVEL.PROJECT) {
      setLevel(LEVEL.PROJECT);
      setSelectedSite(null);
      setSelectedBuilding(null);
      setSelectedFloor(null);
    } else if (lvl === LEVEL.SITE) {
      setLevel(LEVEL.SITE);
      setSelectedBuilding(null);
      setSelectedFloor(null);
    } else if (lvl === LEVEL.BUILDING) {
      setLevel(LEVEL.BUILDING);
      setSelectedFloor(null);
    }
  };

  const handleSelectSite = (site) => {
    setSelectedSite(site);
    setSelectedBuilding(null);
    setSelectedFloor(null);
    setLevel(LEVEL.SITE);
  };

  const handleSelectBuilding = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(null);
    setLevel(LEVEL.BUILDING);
  };

  const handleSelectFloor = (floor) => {
    setSelectedFloor(floor);
    setLevel(LEVEL.FLOOR);
  };

  const crumbs = [
    { level: LEVEL.PROJECT, label: project?.name || 'Project' },
    ...(selectedSite ? [{ level: LEVEL.SITE, label: selectedSite.name }] : []),
    ...(selectedBuilding ? [{ level: LEVEL.BUILDING, label: selectedBuilding.name }] : []),
    ...(selectedFloor ? [{ level: LEVEL.FLOOR, label: selectedFloor.floorName }] : []),
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!project) {
    return (
      <div className="flex flex-col items-center gap-3 py-12 text-ink-500">
        <p className="text-sm">Project not found.</p>
        <button
          type="button"
          onClick={onBack}
          className="text-sm text-brand-600 hover:text-brand-800 font-medium"
        >
          ← Back to Projects
        </button>
      </div>
    );
  }

  const mainTabs = [
    {
      key: 'hierarchy',
      label: 'Sites & Hierarchy',
      content: (
        <div className="pt-4">
          {level === LEVEL.PROJECT && (
            <SitesManager
              projectId={projectId}
              projectName={project.name}
              onSelectSite={handleSelectSite}
            />
          )}
          {level === LEVEL.SITE && selectedSite && (
            <BuildingsManager
              siteId={selectedSite.id}
              siteName={selectedSite.name}
              projectId={projectId}
              onSelectBuilding={handleSelectBuilding}
            />
          )}
          {level === LEVEL.BUILDING && selectedBuilding && (
            <FloorsManager
              buildingId={selectedBuilding.id}
              buildingName={selectedBuilding.name}
              projectId={projectId}
              onSelectFloor={handleSelectFloor}
            />
          )}
          {level === LEVEL.FLOOR && selectedFloor && (
            <ZonesManager
              floorId={selectedFloor.id}
              floorName={selectedFloor.floorName}
              projectId={projectId}
            />
          )}
        </div>
      ),
    },
    {
      key: 'tree',
      label: 'Visual Tree Explorer',
      content: (
        <div className="pt-4">
          <HierarchyTreeViewer projectId={projectId} projectName={project.name} />
        </div>
      ),
    },
    {
      key: 'validate',
      label: 'Lineage Validator',
      content: (
        <div className="pt-4">
          <HierarchyValidatorTool />
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Back & Breadcrumbs */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-ink-500 hover:text-brand-700 font-medium rounded-lg px-2 py-1 hover:bg-white/40 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          All Projects
        </button>
        <span className="text-ink-300">|</span>
        <Breadcrumbs crumbs={crumbs} onNavigate={navigateTo} />
      </div>

      {/* Project Summary Card */}
      <div className="surface-panel rounded-2xl p-5 flex flex-col gap-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded">
                {project.code}
              </span>
              <StatusPill status={project.status} />
              {project.projectType && (
                <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">
                  {PROJECT_TYPE_LABELS[project.projectType] || project.projectType}
                </span>
              )}
            </div>
            <h1 className="text-xl font-bold text-brand-900">{project.name}</h1>
            {project.clientName || project.client ? (
              <p className="text-sm text-ink-500">
                Client: <span className="font-medium text-ink-700">{project.clientName || project.client}</span>
              </p>
            ) : null}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 border-t border-surface-border pt-3">
          <DetailPill icon={MapPin} label="Location" value={project.location} />
          <DetailPill
            icon={IndianRupee}
            label="Budget"
            value={formatCurrency(project.estimatedBudget)}
          />
          <DetailPill
            icon={Building2}
            label="Area"
            value={formatArea(project.totalBuiltUpAreaSqFt)}
          />
          <DetailPill
            icon={Calendar}
            label="Start"
            value={project.plannedStartDate || project.startDate}
          />
          <DetailPill
            icon={Calendar}
            label="End"
            value={project.plannedEndDate || project.endDate || 'Ongoing'}
          />
        </div>

        {project.description && (
          <p className="text-xs text-ink-500 border-t border-surface-border pt-2">
            {project.description}
          </p>
        )}

        {/* Team Members */}
        {project.teamMembers && project.teamMembers.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 border-t border-surface-border pt-2">
            <Users className="h-3.5 w-3.5 text-ink-400" />
            <span className="text-xs text-ink-500 font-medium">Team:</span>
            {project.teamMembers.map((m) => (
              <span
                key={m.id}
                className="text-xs bg-brand-50 text-brand-700 px-2 py-0.5 rounded-full font-medium"
              >
                {m.fullName || m.username}{' '}
                <span className="text-brand-400">({m.role?.replace(/_/g, ' ')})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Main Tabs */}
      <Tabs items={mainTabs} defaultKey="hierarchy" />
    </div>
  );
}
