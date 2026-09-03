import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Edit } from 'lucide-react';
import { Table, StatusPill, Button } from '@/design-system';
import { Modal } from '@/design-system/components/Modal/Modal';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { wbsScheduleApi } from '../api/wbsScheduleApi';
import { WbsScheduleForm } from '../components/WbsScheduleForm';

// WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).
export function WbsScheduleListPage() {
  const queryClient = useQueryClient();
  const pushToast = useToastStore((s) => s.push);
  const [isAddModalOpen, setAddModalOpen] = useState(false);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [isSubmitting, setSubmitting] = useState(false);

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['wbs-schedule'],
    queryFn: () => wbsScheduleApi.list(),
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
    retryDelay: 1000,
  });

  const columns = [
    { key: 'wbsCode', header: 'WBS Code' },
    { key: 'name', header: 'Activity' },
    { key: 'discipline', header: 'Discipline' },
    { key: 'status', header: 'Status', render: (row) => <StatusPill status={row.status} /> },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleEditClick(row)}
            className="inline-flex items-center gap-1 rounded-md px-3 py-1.5 text-sm font-medium text-brand-600 transition-colors hover:bg-brand-50 active:bg-brand-100"
            title="Edit activity"
          >
            <Edit className="h-4 w-4" />
            Edit
          </button>
        </div>
      ),
    },
  ];

  function handleEditClick(activity) {
    setSelectedActivity(activity);
    setEditModalOpen(true);
  }

  async function handleAddNew(formData) {
    setSubmitting(true);
    try {
      await wbsScheduleApi.create(formData);
      pushToast('Activity created successfully', 'success');
      setAddModalOpen(false);
      // Invalidate and refetch the data
      queryClient.invalidateQueries({ queryKey: ['wbs-schedule'] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create activity';
      pushToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleEditSubmit(formData) {
    if (!selectedActivity) return;
    
    setSubmitting(true);
    try {
      await wbsScheduleApi.update(selectedActivity.id, formData);
      pushToast('Activity updated successfully', 'success');
      setEditModalOpen(false);
      setSelectedActivity(null);
      // Invalidate and refetch the data
      queryClient.invalidateQueries({ queryKey: ['wbs-schedule'] });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update activity';
      pushToast(errorMessage, 'error');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-heading">WBS & Schedule</h1>
          <p className="page-subheading">
            WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).
          </p>
        </div>
        <Button
          size="sm"
          onClick={() => setAddModalOpen(true)}
          disabled={isSubmitting}
        >
          Add New
        </Button>
      </div>

      {error && data === undefined && (
        <div className="rounded-md border border-status-warning/20 bg-status-warning/10 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-status-warning">
                ⚠️ Unable to load from server - showing demo data
              </p>
              <p className="text-xs text-status-warning/70 mt-1">
                Backend server is not available. Create test data to see changes.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={() => refetch()}
              disabled={isLoading}
            >
              {isLoading ? 'Retrying...' : 'Retry'}
            </Button>
          </div>
        </div>
      )}

      {data && data.length === 0 && (
        <div className="rounded-md border-2 border-dashed border-surface-border bg-surface-subtle p-8 text-center">
          <p className="text-sm font-medium text-ink-500">No WBS activities found</p>
          <p className="text-xs text-ink-400 mt-1">
            Click "Add New" to create your first activity.
          </p>
        </div>
      )}

      {data && data.length > 0 && (
        <Table
          columns={columns}
          data={data}
          rowKey={(row) => row.id}
          isLoading={isLoading}
        />
      )}

      {isLoading && !data && (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-surface-border border-t-brand-500"></div>
            </div>
            <p className="mt-3 text-sm text-ink-500">Loading activities...</p>
          </div>
        </div>
      )}

      {/* Add New Modal */}
      <Modal
        open={isAddModalOpen}
        onClose={() => !isSubmitting && setAddModalOpen(false)}
        title="Add New Activity"
        size="lg"
        footer={null}
      >
        <WbsScheduleForm
          onSubmit={handleAddNew}
          onCancel={() => setAddModalOpen(false)}
          isSubmitting={isSubmitting}
          mode="add"
        />
      </Modal>

      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => !isSubmitting && setEditModalOpen(false)}
        title="Edit Activity"
        size="lg"
        footer={null}
      >
        {selectedActivity && (
          <WbsScheduleForm
            initialData={selectedActivity}
            onSubmit={handleEditSubmit}
            onCancel={() => setEditModalOpen(false)}
            isSubmitting={isSubmitting}
            mode="edit"
          />
        )}
      </Modal>
    </div>
  );
}
