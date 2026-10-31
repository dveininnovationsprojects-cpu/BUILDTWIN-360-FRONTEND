import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Modal, Button, Input } from '@/design-system';
import { Wand2 } from 'lucide-react';

const EQUIPMENT_TYPES = [
  { value: 'CRANE', label: 'Tower Crane / Mobile Crane' },
  { value: 'PUMP', label: 'Concrete Boom Pump / Stationary Pump' },
  { value: 'EXCAVATOR', label: 'Excavator / Backhoe Loader (JCB)' },
  { value: 'CONCRETE_EQUIPMENT', label: 'Transit Mixer / Batching Plant' },
  { value: 'MIXER', label: 'Portable Concrete Mixer' },
  { value: 'VIBRATOR', label: 'Needle / Surface Concrete Vibrator' },
  { value: 'GENERATOR', label: 'Diesel Power Generator (DG Set)' },
  { value: 'SCAFFOLDING', label: 'Cuplock / Scaffolding System' },
  { value: 'TRUCK', label: 'Tipper Truck / Dumper' },
  { value: 'EARTHMOVING', label: 'Compactor / Roller / Grader' },
  { value: 'OTHER', label: 'Other Machinery / Tool' },
];

const STATUS_OPTIONS = [
  { value: 'AVAILABLE', label: 'Available (Ready for Site Allocation)' },
  { value: 'IN_USE', label: 'In Use (Allocated & Operating)' },
  { value: 'MAINTENANCE', label: 'Maintenance (Breakdown / Overhaul)' },
];

export function EquipmentRegisterModal({
  open,
  onClose,
  initialData = null,
  onSubmit,
  isLoading = false,
}) {
  const isEditing = Boolean(initialData?.id);

  const form = useForm({
    defaultValues: {
      assetCode: '',
      name: '',
      type: 'CRANE',
      status: 'AVAILABLE',
    },
  });

  useEffect(() => {
    if (initialData) {
      form.reset({
        assetCode: initialData.assetCode || '',
        name: initialData.name || '',
        type: initialData.type || 'CRANE',
        status: initialData.status || 'AVAILABLE',
      });
    } else {
      generateAssetCode('CRANE');
    }
  }, [initialData, open]);

  function generateAssetCode(type = 'CRANE') {
    const prefixMap = {
      CRANE: 'EQ-CRN',
      PUMP: 'EQ-PMP',
      EXCAVATOR: 'EQ-EXC',
      CONCRETE_EQUIPMENT: 'EQ-CON',
      MIXER: 'EQ-MIX',
      VIBRATOR: 'EQ-VIB',
      GENERATOR: 'EQ-GEN',
      SCAFFOLDING: 'EQ-SCF',
      TRUCK: 'EQ-TRK',
      EARTHMOVING: 'EQ-ERT',
      OTHER: 'EQ-OTH',
    };
    const prefix = prefixMap[type] || 'EQ-AST';
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    form.setValue('assetCode', `${prefix}-${randomSuffix}`);
  }

  function handleTypeChange(e) {
    const newType = e.target.value;
    form.setValue('type', newType);
    if (!isEditing) {
      generateAssetCode(newType);
    }
  }

  function handleFormSubmit(values) {
    onSubmit({
      ...values,
      id: initialData?.id,
    });
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEditing ? `Edit Equipment Asset (${initialData.assetCode})` : 'Register New Equipment Asset'}
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={form.handleSubmit(handleFormSubmit)} isLoading={isLoading}>
            {isEditing ? 'Save Changes' : 'Register Asset'}
          </Button>
        </>
      }
    >
      <form className="flex flex-col gap-4" onSubmit={form.handleSubmit(handleFormSubmit)}>
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-ink-700">Asset Code *</label>
            {!isEditing && (
              <button
                type="button"
                onClick={() => generateAssetCode(form.getValues('type'))}
                className="text-[11px] text-brand-600 hover:text-brand-800 flex items-center gap-1 font-medium"
              >
                <Wand2 className="h-3 w-3" />
                Regenerate Code
              </button>
            )}
          </div>
          <Input
            placeholder="e.g. EQ-CRN-401"
            {...form.register('assetCode', { required: 'Asset code is required' })}
            error={form.formState.errors.assetCode?.message}
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-ink-700 mb-1">Equipment Name / Model *</label>
          <Input
            placeholder="e.g. Liebherr 85EC Tower Crane (40m Jib)"
            {...form.register('name', { required: 'Equipment name is required' })}
            error={form.formState.errors.name?.message}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Equipment Category *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('type')}
              onChange={handleTypeChange}
            >
              {EQUIPMENT_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-ink-700 mb-1">Initial Status *</label>
            <select
              className="w-full rounded-md border border-surface-border bg-white px-3 py-2 text-xs text-ink-800 focus:outline-none focus:ring-2 focus:ring-brand-200"
              {...form.register('status')}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </form>
    </Modal>
  );
}
