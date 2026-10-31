import { useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  Bell,
  CheckCheck,
  CheckCircle2,
  Archive,
  Trash2,
  AlertTriangle,
  Flame,
  Plus,
  RefreshCw,
  Mail,
  ExternalLink,
  Info,
  ArrowRight,
  Package,
  ShieldAlert,
} from 'lucide-react';
import { Table, Button, Modal, Input, StatusPill } from '@/design-system';
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { useAuthStore, useHasRole } from '@/context/authStore';
import { ROLES } from '@/constants/roles';
import { notificationsApi, notificationService } from '../api/notificationsApi';
import { useNotifications } from '@/hooks/useNotifications';

const NOTIF_TYPES = [
  { value: 'GENERAL_INFO', label: 'General Announcement' },
  { value: 'LOW_STOCK', label: 'Low Stock Alarming (06:00 AM Cron)' },
  { value: 'CRITICAL_BLOCKER', label: 'Critical Site Blocker' },
  { value: 'OVERDUE_SLA', label: 'Overdue SLA Escalation (07:00 AM Cron)' },
  { value: 'BUDGET_OVERRUN', label: 'Budget Overrun >90% (01:00 AM Cron)' },
  { value: 'NCR_FAILED', label: 'NCR Audit Failed / Rejected' },
];

const NOTIF_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

export function NotificationsListPage() {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'UNREAD' | 'READ' | 'ARCHIVED'

  const queryClient = useQueryClient();
  const pushToast = useToastStore((state) => state.push);
  const user = useAuthStore((s) => s.user);
  const canManage = useHasRole(ROLES.PROJECT_MANAGER, ROLES.DIRECTOR, ROLES.ADMIN);

  const { unreadCount, urgentCount, refresh: refreshSummary } = useNotifications();

  const form = useForm({
    defaultValues: {
      title: '',
      message: '',
      notificationType: 'GENERAL_INFO',
      priority: 'HIGH',
      recipientUsername: 'admin',
      channel: 'IN_APP',
    },
  });

  const { data: notifications = [], isLoading, refetch } = useQuery({
    queryKey: ['notifications-inbox'],
    queryFn: () => notificationsApi.list({ size: 100 }),
    refetchInterval: 15000,
  });

  // Listen for real-time notification events from other modules
  useEffect(() => {
    const handleCreated = () => {
      refetch();
      refreshSummary();
    };
    window.addEventListener('buildtwin:notification-created', handleCreated);
    return () => window.removeEventListener('buildtwin:notification-created', handleCreated);
  }, [refetch, refreshSummary]);

  // Defensive array normalizer: guarantees an array regardless of API payload shape
  const notificationList = useMemo(() => {
    if (Array.isArray(notifications)) return notifications;
    if (Array.isArray(notifications?.content)) return notifications.content;
    return [];
  }, [notifications]);

  const createMutation = useMutation({
    mutationFn: (payload) => notificationsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] });
      refreshSummary();
      pushToast('System alert dispatched successfully.', 'success');
      setIsOpen(false);
      form.reset();
    },
    onError: (err) => {
      pushToast(err?.message || 'Failed to dispatch notification alert.', 'error');
    },
  });

  const markReadMutation = useMutation({
    mutationFn: (id) => notificationsApi.markAsRead(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] });
      refreshSummary();
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification((prev) => (prev ? { ...prev, status: 'READ' } : null));
      }
      pushToast('Notification marked as read.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to mark as read.', 'error'),
  });

  const markAllReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(user?.username || 'admin'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] });
      refreshSummary();
      pushToast('All notifications marked as read.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to mark all as read.', 'error'),
  });

  const archiveMutation = useMutation({
    mutationFn: (id) => notificationsApi.archive(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] });
      refreshSummary();
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(null);
      }
      pushToast('Notification moved to archive.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to archive notification.', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => notificationsApi.delete(id),
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['notifications-inbox'] });
      refreshSummary();
      if (selectedNotification && selectedNotification.id === id) {
        setSelectedNotification(null);
      }
      pushToast('Notification deleted.', 'success');
    },
    onError: (err) => pushToast(err?.message || 'Failed to delete notification.', 'error'),
  });


  const filteredNotifications = useMemo(() => {
    return notificationList.filter((item) => {
      if (!item) return false;
      if (activeTab === 'UNREAD') return item.status === 'UNREAD';
      if (activeTab === 'READ') return item.status === 'READ';
      if (activeTab === 'ARCHIVED') return item.status === 'ARCHIVED';
      return item.status !== 'ARCHIVED';
    });
  }, [notificationList, activeTab]);

  function getModuleRoute(notif) {
    if (!notif) return null;
    const type = notif.notificationType || '';
    const refModule = notif.referenceModule || '';

    if (refModule === 'PROCUREMENT' || type === 'LOW_STOCK') {
      return { path: '/procurement', label: 'Go to Procurement & Inventory' };
    }
    if (refModule === 'MATERIALS') {
      return { path: '/materials-inventory', label: 'Go to Materials & Inventory' };
    }
    if (refModule === 'PROJECTS') {
      return { path: '/projects', label: 'Go to Projects' };
    }
    if (refModule === 'EQUIPMENT') {
      return { path: '/equipment', label: 'Go to Equipment' };
    }
    if (refModule === 'LABOUR') {
      return { path: '/labour-contractors', label: 'Go to Labour & Contractors' };
    }
    if (refModule === 'DOCUMENTS') {
      return { path: '/documents', label: 'Go to Documents' };
    }
    if (refModule === 'PROGRESS_DPR') {
      return { path: '/progress-dpr', label: 'Go to Daily Progress Reports' };
    }
    if (refModule === 'QUALITY_ISSUE' || type === 'NCR_FAILED' || type === 'NCR_RAISED') {
      return { path: '/quality', label: 'Go to Quality Management' };
    }
    if (refModule === 'PROJECT_ISSUE' || type === 'CRITICAL_BLOCKER') {
      return { path: '/issues-risks', label: 'Go to Issues & Risks' };
    }
    if (refModule === 'COST_BUDGET' || type === 'BUDGET_OVERRUN') {
      return { path: '/cost-control', label: 'Go to Cost Control' };
    }
    if (type === 'OVERDUE_SLA') {
      return { path: '/wbs-schedule', label: 'Go to Schedule & SLA' };
    }
    return null;
  }

  const columns = [
    {
      key: 'title',
      header: 'Notification Title & Message',
      render: (row) => {
        return (
          <div className="flex flex-col gap-1 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-sm ${row.status === 'UNREAD' ? 'text-ink-900 font-bold' : 'text-ink-700 font-medium'}`}>
                {row.title || 'System Alert'}
              </span>
              {row.status === 'UNREAD' && (
                <span className="inline-block h-2 w-2 rounded-full bg-brand-600 animate-ping" />
              )}
            </div>
            <p className="text-xs text-ink-600 line-clamp-2">{row.message}</p>
            <div className="flex items-center gap-2 text-[11px] text-ink-400 mt-0.5">
              <span className="font-mono bg-surface-subtle px-1.5 py-0.5 rounded border border-surface-border">
                {row.referenceModule || row.notificationType || 'SYSTEM'}
              </span>
              <span>•</span>
              <span>{row.createdAt ? new Date(row.createdAt).toLocaleString() : 'Just now'}</span>
            </div>
          </div>
        );
      },
    },
    {
      key: 'priority',
      header: 'Priority',
      render: (row) => {
        const priority = row.priority || 'MEDIUM';
        const isUrgent = priority === 'URGENT';
        const isHigh = priority === 'HIGH';
        return (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-wider ${
              isUrgent
                ? 'bg-red-500/15 text-red-700 border border-red-300 font-bold animate-pulse'
                : isHigh
                ? 'bg-amber-500/15 text-amber-700 border border-amber-300'
                : 'bg-blue-500/15 text-blue-700 border border-blue-200'
            }`}
          >
            {isUrgent ? <Flame className="h-3 w-3" /> : <AlertTriangle className="h-3 w-3" />}
            {priority}
          </span>
        );
      },
    },
    {
      key: 'status',
      header: 'Read Status',
      render: (row) => {
        const variant =
          row.status === 'READ'
            ? 'success'
            : row.status === 'ARCHIVED'
            ? 'neutral'
            : 'warning';
        return <StatusPill status={row.status || 'UNREAD'} variant={variant} />;
      },
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row) => (
        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          {row.status === 'UNREAD' && (
            <Button
              size="xs"
              variant="outline"
              title="Mark as read"
              onClick={(e) => {
                e.stopPropagation();
                markReadMutation.mutate(row.id);
              }}
              isLoading={markReadMutation.isPending && markReadMutation.variables === row.id}
            >
              <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-brand-600" />
              Read
            </Button>
          )}
          {row.status !== 'ARCHIVED' && (
            <Button
              size="xs"
              variant="ghost"
              title="Archive notification"
              onClick={(e) => {
                e.stopPropagation();
                archiveMutation.mutate(row.id);
              }}
              isLoading={archiveMutation.isPending && archiveMutation.variables === row.id}
            >
              <Archive className="h-3.5 w-3.5 text-ink-400 hover:text-ink-700" />
            </Button>
          )}
          <Button
            size="xs"
            variant="ghost"
            title="Delete notification"
            onClick={(e) => {
              e.stopPropagation();
              if (window.confirm(`Delete notification "${row.title || 'Notification'}"?`)) {
                deleteMutation.mutate(row.id);
              }
            }}
            isLoading={deleteMutation.isPending && deleteMutation.variables === row.id}
          >
            <Trash2 className="h-3.5 w-3.5 text-status-danger" />
          </Button>
        </div>
      ),
    },
  ];

  function handleSubmit(values) {
    createMutation.mutate({
      projectId: 1,
      recipientUsername: values.recipientUsername?.trim() || 'admin',
      title: values.title?.trim() || 'Urgent Site Alert',
      message: values.message?.trim(),
      notificationType: values.notificationType,
      priority: values.priority,
      channel: values.channel,
    });
  }

  const linkedRoute = selectedNotification ? getModuleRoute(selectedNotification) : null;

  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <ModulePageHeading>Notifications &amp; Alerts</ModulePageHeading>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              refetch();
              refreshSummary();
            }}
            title="Refresh alerts"
          >
            <RefreshCw className="h-4 w-4 mr-1.5" />
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markAllReadMutation.mutate()}
              isLoading={markAllReadMutation.isPending}
            >
              <CheckCheck className="h-4 w-4 mr-1.5 text-emerald-600" />
              Mark All Read
            </Button>
          )}
          {canManage && (
            <Button size="sm" onClick={() => setIsOpen(true)}>
              <Plus className="h-4 w-4 mr-1.5" />
              Dispatch Alert
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-surface-border overflow-x-auto">
        {[
          { key: 'ALL', label: 'All', count: notificationList.filter((n) => n.status !== 'ARCHIVED').length },
          { key: 'UNREAD', label: 'Unread', count: unreadCount },
          { key: 'READ', label: 'Read', count: notificationList.filter((n) => n.status === 'READ').length },
          { key: 'ARCHIVED', label: 'Archived', count: notificationList.filter((n) => n.status === 'ARCHIVED').length },
        ].map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold transition-colors border-b-2 -mb-px whitespace-nowrap ${
              activeTab === tab.key
                ? 'border-brand-600 text-brand-700'
                : 'border-transparent text-ink-500 hover:text-ink-800'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={`rounded-full px-1.5 py-0.2 text-[10px] font-bold ${
                  activeTab === tab.key
                    ? 'bg-brand-100 text-brand-800'
                    : 'bg-surface-subtle text-ink-500'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Data Table with Click-to-View */}
      <Table
        columns={columns}
        data={filteredNotifications}
        rowKey={(row) => row.id}
        isLoading={isLoading}
        onRowClick={(row) => {
          setSelectedNotification(row);
          if (row.status === 'UNREAD') {
            markReadMutation.mutate(row.id);
          }
        }}
        emptyMessage="No notifications found in this view."
      />

      {/* Selected Notification Detail Modal */}
      {selectedNotification && (
        <Modal
          open={Boolean(selectedNotification)}
          onClose={() => setSelectedNotification(null)}
          title="Notification Details"
          size="md"
          footer={
            <div className="flex items-center justify-between w-full">
              <div>
                {linkedRoute && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedNotification(null);
                      navigate(linkedRoute.path);
                    }}
                  >
                    <ExternalLink className="h-3.5 w-3.5 mr-1 text-brand-600" />
                    {linkedRoute.label}
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                {selectedNotification.status === 'UNREAD' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => markReadMutation.mutate(selectedNotification.id)}
                    isLoading={markReadMutation.isPending}
                  >
                    <CheckCircle2 className="h-3.5 w-3.5 mr-1 text-brand-600" />
                    Mark Read
                  </Button>
                )}
                {selectedNotification.status !== 'ARCHIVED' && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => archiveMutation.mutate(selectedNotification.id)}
                    isLoading={archiveMutation.isPending}
                  >
                    <Archive className="h-3.5 w-3.5 mr-1 text-ink-600" />
                    Archive
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (window.confirm('Delete this notification?')) {
                      deleteMutation.mutate(selectedNotification.id);
                    }
                  }}
                  isLoading={deleteMutation.isPending}
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1 text-status-danger" />
                  Delete
                </Button>
                <Button size="sm" onClick={() => setSelectedNotification(null)}>
                  Close
                </Button>
              </div>
            </div>
          }
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4 border-b border-surface-border pb-3">
              <div>
                <h3 className="text-sm font-bold text-ink-900">{selectedNotification.title || 'System Alert'}</h3>
                <p className="text-xs text-ink-500 mt-0.5">
                  Received: {selectedNotification.createdAt ? new Date(selectedNotification.createdAt).toLocaleString() : 'Just now'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase ${
                    selectedNotification.priority === 'URGENT'
                      ? 'bg-red-500/15 text-red-700 border border-red-300'
                      : 'bg-blue-500/15 text-blue-700 border border-blue-200'
                  }`}
                >
                  {selectedNotification.priority || 'MEDIUM'}
                </span>
                <StatusPill
                  status={selectedNotification.status || 'UNREAD'}
                  variant={selectedNotification.status === 'READ' ? 'success' : 'warning'}
                />
              </div>
            </div>

            <div className="surface-panel p-3 rounded-lg border border-surface-border bg-surface-subtle text-xs text-ink-800 whitespace-pre-wrap leading-relaxed">
              {selectedNotification.message || 'No additional details provided.'}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs text-ink-600">
              <div className="flex flex-col gap-1 p-2 rounded bg-surface-subtle border border-surface-border">
                <span className="text-[10px] uppercase font-semibold text-ink-400">Category / Type</span>
                <span className="font-mono text-ink-800">{selectedNotification.notificationType || 'GENERAL_INFO'}</span>
              </div>
              <div className="flex flex-col gap-1 p-2 rounded bg-surface-subtle border border-surface-border">
                <span className="text-[10px] uppercase font-semibold text-ink-400">Recipient</span>
                <span className="font-medium text-ink-800">{selectedNotification.recipientUsername || 'admin'}</span>
              </div>
            </div>

            {selectedNotification.referenceModule && (
              <div className="flex items-center gap-2 p-2 rounded bg-brand-50/50 border border-brand-200 text-xs text-brand-800">
                <Info className="h-4 w-4 text-brand-600 shrink-0" />
                <span>
                  Linked module: <strong className="font-mono">{selectedNotification.referenceModule}</strong>
                  {selectedNotification.referenceId ? ` (ID: ${selectedNotification.referenceId})` : ''}
                </span>
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* Dispatch Alert Modal */}
      <Modal
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Dispatch Targeted Notification / Site Alert"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={form.handleSubmit(handleSubmit)} isLoading={createMutation.isPending}>
              Dispatch Alert
            </Button>
          </>
        }
      >
        <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleSubmit)}>
          <Input
            label="Alert Title *"
            placeholder="e.g. CRITICAL: Store Cement Shortage Predicted"
            {...form.register('title', { required: 'Title is required' })}
            error={form.formState.errors.title?.message}
          />

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Alert Category *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('notificationType')}
            >
              {NOTIF_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Priority / Severity *</label>
              <select
                className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
                {...form.register('priority')}
              >
                {NOTIF_PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1">Recipient Username</label>
              <Input
                placeholder="admin or specific user"
                {...form.register('recipientUsername')}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-ink-700 mb-1">Alert Message *</label>
            <textarea
              rows={3}
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 placeholder:text-ink-400 focus:outline-none focus:ring-2 focus:ring-brand-200"
              placeholder="Detailed description of the issue or scheduled cron alert..."
              {...form.register('message', { required: 'Message is required' })}
            />
            {form.formState.errors.message && (
              <span className="text-[11px] text-status-danger mt-1">
                {form.formState.errors.message.message}
              </span>
            )}
          </div>
        </form>
      </Modal>
    </div>
  );
}

export { notificationService };
