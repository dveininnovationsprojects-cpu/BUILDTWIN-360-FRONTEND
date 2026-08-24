import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { notificationsApi } from '../api/notificationsApi';
import type { Notification } from '../types';

// In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).
export function NotificationsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['notifications'], queryFn: () => notificationsApi.list() });

  const columns: Column<Notification>[] = [
    { key: 'message', header: 'Message' },
    { key: 'severity', header: 'Severity', render: (row) => <StatusPill status={row.severity} /> },
    { key: 'createdAt', header: 'Raised' },
    { key: 'readStatus', header: 'Status', render: (row) => <StatusPill status={row.readStatus} /> },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Notifications</h1>
          <p className="page-subheading">In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
