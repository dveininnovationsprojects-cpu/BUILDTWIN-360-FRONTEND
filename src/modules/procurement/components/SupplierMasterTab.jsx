import { useMemo, useState } from 'react';
import { Button, EmptyState, StatCard, StatusPill, Table } from '@/design-system';
import { Building2, Edit3, Search, ShieldCheck, Users } from 'lucide-react';

export function SupplierMasterTab({ suppliers = [], isLoading, canManage, onAdd, onEdit }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const metrics = useMemo(() => ({
    total: suppliers.length,
    active: suppliers.filter((supplier) => (supplier.status || 'ACTIVE') === 'ACTIVE').length,
    inactive: suppliers.filter((supplier) => supplier.status !== 'ACTIVE').length,
  }), [suppliers]);

  const filteredSuppliers = useMemo(() => {
    const query = search.trim().toLowerCase();
    return suppliers.filter((supplier) => {
      const matchesSearch = !query || [supplier.supplierCode, supplier.name, supplier.contactPerson, supplier.email, supplier.gstin]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query));
      const matchesStatus = statusFilter === 'ALL' || (supplier.status || 'ACTIVE') === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, suppliers]);

  const columns = [
    { key: 'supplierCode', header: 'Supplier Code', render: (row) => <span className="font-mono text-xs font-semibold text-brand-900">{row.supplierCode}</span> },
    { key: 'name', header: 'Supplier / Vendor', render: (row) => <span className="font-semibold text-ink-900">{row.name}</span> },
    { key: 'contactPerson', header: 'Primary Contact', render: (row) => <span className="text-xs text-ink-700">{row.contactPerson || '—'}</span> },
    { key: 'phone', header: 'Phone', render: (row) => <span className="text-xs text-ink-700">{row.phone || '—'}</span> },
    { key: 'email', header: 'Email', render: (row) => <span className="text-xs text-ink-700">{row.email || '—'}</span> },
    { key: 'gstin', header: 'GSTIN', render: (row) => <span className="font-mono text-xs text-ink-600">{row.gstin || '—'}</span> },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status === 'ACTIVE' ? 'SUCCESS' : 'WARNING'} label={row.status || 'ACTIVE'} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => canManage && <Button size="xs" variant="outline" onClick={() => onEdit(row)}><Edit3 className="mr-1 h-3.5 w-3.5" /> Edit</Button>,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatCard label="Total Suppliers" value={metrics.total} icon={<Users className="h-4 w-4" />} />
        <StatCard label="Active Suppliers" value={metrics.active} icon={<ShieldCheck className="h-4 w-4" />} />
        <StatCard label="Inactive / On Hold" value={metrics.inactive} icon={<Building2 className="h-4 w-4" />} />
      </div>

      <div className="flex flex-col gap-3 rounded-lg border border-surface-border bg-surface-subtle p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-ink-400" />
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search supplier, code, contact, GSTIN..." className="h-9 w-full rounded border border-surface-border bg-surface-base pl-9 pr-3 text-xs text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-400" />
        </div>
        <div className="flex items-center gap-2">&
          <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="h-9 rounded border border-surface-border bg-surface-base px-2.5 text-xs text-ink-900">
            <option value="ALL">All statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
          {canManage && <Button size="sm" onClick={onAdd}><Building2 className="mr-1.5 h-4 w-4" /> Add Supplier</Button>}
        </div>
      </div>

      {filteredSuppliers.length === 0 && !isLoading ? (
        <EmptyState title="No suppliers found" description={search ? 'Try a different search term.' : 'Register your first approved supplier.'} actionLabel={canManage ? 'Add Supplier' : undefined} onAction={canManage ? onAdd : undefined} />
      ) : (
        <Table columns={columns} data={filteredSuppliers} rowKey={(row) => row.id} isLoading={isLoading} />
      )}
    </div>
  );
}
