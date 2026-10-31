import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Layers,
  LayoutGrid,
  List,
  ExternalLink,
  Trash2,
  Compass,
  CheckCircle2,
  Calculator,
  ClipboardList,
  FileCode,
} from 'lucide-react';
import { Table, Button, StatusPill } from '@/design-system';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { projectsApi } from '@/modules/projects/api/projectsApi';
import { documentsApi } from '../api/documentsApi';
import { DocumentMetricsBar } from '../components/DocumentMetricsBar';
import { DocumentUploadModal } from '../components/DocumentUploadModal';
import { DocumentDetailModal } from '../components/DocumentDetailModal';
import { DocumentViewerModal } from '../components/DocumentViewerModal';

export function DocumentsListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);

  const [selectedProjectId, setSelectedProjectId] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState('GRID'); // 'GRID' | 'TABLE'

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [viewerDoc, setViewerDoc] = useState(null);

  const canManage = useHasRole(
    ROLES.SITE_ENGINEER,
    ROLES.PROJECT_MANAGER,
    ROLES.DIRECTOR,
    ROLES.ADMIN,
    ROLES.QUALITY_ENGINEER
  );

  // Fetch Projects for site selector
  const { data: projectsData = [] } = useQuery({
    queryKey: ['projects'],
    queryFn: () => projectsApi.list(),
  });
  const projects = Array.isArray(projectsData) ? projectsData : (projectsData?.content || []);

  // Fetch Documents by Project (FR-113)
  const {
    data: documentsData = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['documents', selectedProjectId, selectedCategory],
    queryFn: () =>
      documentsApi.list({
        projectId: selectedProjectId,
        category: selectedCategory === 'ALL' ? undefined : selectedCategory,
      }),
    enabled: Boolean(selectedProjectId),
  });
  const documents = Array.isArray(documentsData) ? documentsData : (documentsData?.content || []);

  // Mutations
  const uploadMutation = useMutation({
    mutationFn: (payload) => documentsApi.create(payload),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      if (variables?.projectId && Number(variables.projectId) !== selectedProjectId) {
        setSelectedProjectId(Number(variables.projectId));
      }
      refetch();
      pushToast('Document registered in project repository.', 'success');
      setIsUploadOpen(false);
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to upload document.', 'error');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => documentsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', selectedProjectId] });
      pushToast('Document removed from repository.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete document.', 'error'),
  });

  // Client-side search & category filtering
  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      let matchesCat = true;
      if (selectedCategory === 'DRAWING') {
        matchesCat = doc.category === 'DRAWING';
      } else if (selectedCategory === 'APPROVAL') {
        matchesCat = doc.category === 'APPROVAL';
      } else if (selectedCategory === 'BOQ') {
        matchesCat = doc.category === 'BOQ' || doc.category === 'QUOTATION' || doc.category === 'INVOICE_EVIDENCE';
      } else if (selectedCategory === 'REPORT') {
        matchesCat = doc.category === 'REPORT' || doc.category === 'SITE_PHOTO';
      }

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        doc.title?.toLowerCase().includes(q) ||
        doc.category?.toLowerCase().includes(q) ||
        doc.version?.toLowerCase().includes(q) ||
        doc.uploadedBy?.toLowerCase().includes(q);

      return matchesCat && matchesSearch;
    });
  }, [documents, selectedCategory, searchQuery]);

  function getCategoryIcon(cat) {
    switch (cat) {
      case 'DRAWING':
        return <Compass className="h-5 w-5 text-indigo-600" />;
      case 'APPROVAL':
        return <CheckCircle2 className="h-5 w-5 text-emerald-600" />;
      case 'BOQ':
      case 'QUOTATION':
      case 'INVOICE_EVIDENCE':
        return <Calculator className="h-5 w-5 text-amber-600" />;
      case 'REPORT':
      case 'SITE_PHOTO':
        return <ClipboardList className="h-5 w-5 text-purple-600" />;
      default:
        return <FileText className="h-5 w-5 text-brand-600" />;
    }
  }

  // Table Columns
  const tableColumns = [
    {
      key: 'title',
      header: 'Document Title & Category',
      render: (row) => (
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-surface-subtle border border-surface-border">
            {getCategoryIcon(row.category)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="font-semibold text-xs text-ink-900 hover:text-brand-600 cursor-pointer">
              {row.title}
            </span>
            <span className="text-[11px] text-ink-500 font-mono">Category: {row.category}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'version',
      header: 'Version',
      render: (row) => (
        <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
          {row.version || 'v1.0'}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Status',
      render: (row) => <StatusPill status={row.status || 'ACTIVE'} />,
    },
    {
      key: 'uploadedBy',
      header: 'Uploaded By',
      render: (row) => (
        <span className="text-xs text-ink-700 font-medium">
          {row.uploadedBy || 'Site Engineer'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: 'Date',
      render: (row) => (
        <span className="text-xs text-ink-500">
          {row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'Active'}
        </span>
      ),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <Button
            size="xs"
            variant="outline"
            title="Open Document"
            onClick={() => setViewerDoc(row)}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            Open
          </Button>
          {canManage && (
            <Button
              size="xs"
              variant="ghost"
              title="Delete Document"
              onClick={() => {
                if (window.confirm(`Delete document "${row.title}"?`)) {
                  deleteMutation.mutate(row.id);
                }
              }}
            >
              <Trash2 className="h-3.5 w-3.5 text-status-danger" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <ModulePageHeading>Document &amp; Photo Repository</ModulePageHeading>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Project Selector */}
          <div className="flex items-center gap-2 bg-surface-base border border-surface-border rounded-lg px-2.5 py-1">
            <Layers className="h-3.5 w-3.5 text-ink-500" />
            <select
              className="bg-transparent text-xs font-semibold text-ink-800 focus:outline-none cursor-pointer"
              value={selectedProjectId}
              onChange={(e) => setSelectedProjectId(Number(e.target.value))}
            >
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.code ? `${p.code} - ` : ''}{p.name}
                </option>
              ))}
            </select>
          </div>

          <Button variant="outline" size="sm" onClick={() => refetch()} title="Refresh documents">
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>

          {canManage && (
            <Button size="sm" onClick={() => setIsUploadOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Upload Document
            </Button>
          )}
        </div>
      </div>

      {/* KPI Metrics Bar */}
      <DocumentMetricsBar
        documents={documents}
        selectedCategory={selectedCategory}
        onSelectCategory={(cat) => setSelectedCategory(cat)}
      />

      {/* Category Tabs & View Options */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-surface-border">
        <div className="flex items-center gap-1 overflow-x-auto">
          {[
            { id: 'ALL', label: 'All Documents' },
            { id: 'DRAWING', label: 'Drawings & Blueprints' },
            { id: 'APPROVAL', label: 'Permits & Approvals' },
            { id: 'BOQ', label: 'BOQ & Financials' },
            { id: 'REPORT', label: 'Reports & Photos' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
                selectedCategory === tab.id
                  ? 'border-brand-600 text-brand-700'
                  : 'border-transparent text-ink-500 hover:text-ink-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-2 sm:pb-0">
          <div className="flex items-center border border-surface-border rounded-md overflow-hidden bg-surface-subtle">
            <button
              type="button"
              onClick={() => setViewMode('GRID')}
              className={`p-1.5 transition-colors ${
                viewMode === 'GRID' ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setViewMode('TABLE')}
              className={`p-1.5 transition-colors ${
                viewMode === 'TABLE' ? 'bg-brand-600 text-white' : 'text-ink-500 hover:text-ink-900'
              }`}
              title="Table View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'GRID' && (
        <>
          {filteredDocuments.length === 0 ? (
            <div className="surface-panel p-12 text-center text-ink-500 rounded-xl border border-surface-border">
              <FileText className="h-10 w-10 text-ink-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-ink-800">No project documents found</p>
              <p className="text-xs text-ink-500 mt-1">
                Upload drawings, approvals, or BOQs for Project #{selectedProjectId}.
              </p>
              {canManage && (
                <Button size="sm" className="mt-4" onClick={() => setIsUploadOpen(true)}>
                  <Plus className="h-4 w-4 mr-1.5" />
                  Upload First Document
                </Button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDocuments.map((doc) => (
                <div
                  key={doc.id}
                  onClick={() => setSelectedDoc(doc)}
                  className="surface-panel p-4 rounded-xl border border-surface-border flex flex-col justify-between hover:border-brand-400 hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="p-2.5 rounded-lg bg-surface-subtle border border-surface-border group-hover:bg-brand-50 transition-colors">
                        {getCategoryIcon(doc.category)}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                          {doc.version || 'v1.0'}
                        </span>
                        <StatusPill status={doc.status || 'ACTIVE'} />
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-ink-900 line-clamp-2 group-hover:text-brand-600 transition-colors">
                        {doc.title}
                      </h4>
                      <span className="text-[11px] font-mono text-ink-400 mt-1 block">
                        Category: {doc.category}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-surface-border flex items-center justify-between text-[11px] text-ink-500">
                    <span>{doc.uploadedBy || 'Site Engineer'}</span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewerDoc(doc);
                      }}
                      className="text-brand-600 hover:text-brand-800 flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink className="h-3 w-3" />
                      Open
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Table View */}
      {viewMode === 'TABLE' && (
        <Table
          columns={tableColumns}
          data={filteredDocuments}
          rowKey={(row) => row.id}
          isLoading={isLoading}
          onRowClick={(row) => setSelectedDoc(row)}
          emptyMessage="No project documents found matching your filter."
        />
      )}

      {/* Modals */}
      <DocumentUploadModal
        open={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        projects={projects}
        selectedProjectId={selectedProjectId}
        onSubmit={(values) => uploadMutation.mutate(values)}
        isLoading={uploadMutation.isPending}
      />

      <DocumentDetailModal
        document={selectedDoc}
        open={Boolean(selectedDoc)}
        onClose={() => setSelectedDoc(null)}
        onOpenViewer={(doc) => setViewerDoc(doc)}
        onDelete={(id) => deleteMutation.mutate(id)}
        canManage={canManage}
      />

      {/* Interactive In-App Document & Blueprint Viewer */}
      <DocumentViewerModal
        document={viewerDoc}
        open={Boolean(viewerDoc)}
        onClose={() => setViewerDoc(null)}
      />
    </div>
  );
}
