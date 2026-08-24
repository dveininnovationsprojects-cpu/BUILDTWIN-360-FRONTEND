import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { projectsApi } from '../api/projectsApi';
import type { Project } from '../types';

// Project & site master — code, type, client, buildings/floors/zones (FR-010..014).
export function ProjectsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['projects'], queryFn: () => projectsApi.list() });

  const columns: Column<Project>[] = [
    { key: 'code', header: 'Code' },
    { key: 'name', header: 'Name' },
    { key: 'type', header: 'Type' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Projects</h1>
          <p className="page-subheading">Project & site master — code, type, client, buildings/floors/zones (FR-010..014).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
