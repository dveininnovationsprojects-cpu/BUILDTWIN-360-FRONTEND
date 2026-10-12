import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '@/design-system';

export function GrnEditModal({ open, onClose, grn, onSave, isSaving }) {
  const form = useForm({ defaultValues: {} });
  const { register, handleSubmit, reset } = form;

  useEffect(() => {
    if (grn) reset({
      grnNumber: grn.grnNumber || '',
      dcNumber: grn.dcNumber || '',
      vehicleNumber: grn.vehicleNumber || '',
      gateEntryNumber: grn.gateEntryNumber || '',
      receivedBy: grn.receivedBy || '',
      deliveryEvidenceUrl: grn.deliveryEvidenceUrl || '',
      rejectionReason: grn.rejectionReason || '',
    });
  }, [grn, reset]);

  return (
    <Modal open={open} onClose={onClose} title="Edit GRN Details" size="md" footer={(
      <>
        <Button variant="outline" onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit((values) => onSave?.(grn.id, values))} isLoading={isSaving}>Save Changes</Button>
      </>
    )}>
      <form className="grid grid-cols-2 gap-3 text-ink-900" onSubmit={handleSubmit((values) => onSave?.(grn.id, values))}>
        <Input label="GRN Number" {...register('grnNumber')} />
        <Input label="Delivery Challan" {...register('dcNumber')} />
        <Input label="Vehicle Number" {...register('vehicleNumber')} />
        <Input label="Gate Entry Number" {...register('gateEntryNumber')} />
        <Input label="Received By" {...register('receivedBy')} />
        <Input label="Evidence / Challan URL" {...register('deliveryEvidenceUrl')} />
        <div className="col-span-2"><Input label="Rejection Reason" {...register('rejectionReason')} /></div>
      </form>
    </Modal>
  );
}
