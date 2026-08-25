import { useQuery } from '@tanstack/react-query';
import { Table, Button, type Column } from '@/design-system';
import { auditApi } from '../api/auditApi';
import type { AuditLog } from '../types';

// Read-only history of create/update/approve actions (FR-005).
export function AuditListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['audit'], queryFn: () => auditApi.list() });

  const columns: Column<AuditLog>[] = [
    { key: 'user', header: 'User' },
    { key: 'action', header: 'Action' },
    { key: 'entityType', header: 'Entity' },
    { key: 'timestamp', header: 'Timestamp' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Audit Log</h1>
          <p className="page-subheading">Read-only history of create/update/approve actions (FR-005).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
