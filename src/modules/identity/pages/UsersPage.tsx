import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, type Column } from '@/design-system';
import { identityApi } from '../api/identityApi';
import type { AppUser } from '../types';

// System-admin screen backing FR-002 (create/activate/deactivate/reset accounts).
export function UsersPage() {
  const { data, isLoading } = useQuery({ queryKey: ['users'], queryFn: identityApi.listUsers });

  const columns: Column<AppUser>[] = [
    { key: 'name', header: 'Name' },
    { key: 'email', header: 'Email' },
    { key: 'roles', header: 'Roles', render: (u) => u.roles.join(', ') },
    { key: 'status', header: 'Status', render: (u) => <StatusPill status={u.status} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-heading">Users & Access</h1>
        <p className="page-subheading">Manage accounts, roles and project-level permissions.</p>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(u) => u.id} isLoading={isLoading} />
    </div>
  );
}
