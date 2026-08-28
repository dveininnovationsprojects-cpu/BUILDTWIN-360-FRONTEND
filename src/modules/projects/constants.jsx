// Project & site master vocabulary (FR-010..014).
export const PROJECT_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'RENOVATION', label: 'Renovation' },
];

export const PROJECT_STATUSES = [
  { value: 'PLANNING', label: 'Planning' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const PROJECT_TYPE_LABELS = Object.fromEntries(PROJECT_TYPES.map((t) => [t.value, t.label]));
export const PROJECT_STATUS_LABELS = Object.fromEntries(PROJECT_STATUSES.map((s) => [s.value, s.label]));
