import { Modal, Button } from '@/design-system';

export function DeleteConfirmModal({
  open,
  onClose,
  onConfirm,
  title = 'Confirm Deletion',
  message = 'Are you sure you want to proceed with this action?',
  confirmLabel = 'Delete',
  isLoading = false,
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button type="button" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="button" variant="danger" onClick={onConfirm} isLoading={isLoading}>
            {confirmLabel}
          </Button>
        </div>
      }
    >
      <div className="py-2 text-sm text-ink-700">
        <p>{message}</p>
        <p className="mt-2 text-xs text-status-danger font-medium">
          This operation cannot be reverted once confirmed.
        </p>
      </div>
    </Modal>
  );
}
