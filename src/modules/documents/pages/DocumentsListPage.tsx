import { useQuery } from '@tanstack/react-query';
import { Table, StatusPill, Button, type Column } from '@/design-system';
import { documentsApi } from '../api/documentsApi';
import type { Document } from '../types';

// Document/photo repository by project/category/version with search (FR-110..114).
export function DocumentsListPage() {
  const { data, isLoading } = useQuery({ queryKey: ['documents'], queryFn: () => documentsApi.list() });

  const columns: Column<Document>[] = [
    { key: 'name', header: 'Document' },
    { key: 'category', header: 'Category' },
    { key: 'uploadedBy', header: 'Uploaded By' },
    { key: 'version', header: 'Version' },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">Documents</h1>
          <p className="page-subheading">Document/photo repository by project/category/version with search (FR-110..114).</p>
        </div>
        <Button size="sm">Add New</Button>
      </div>
      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />
    </div>
  );
}
