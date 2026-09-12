// Project & Construction Hierarchy vocabulary & options (matches Spring Boot DTO constraints)

// Project
export const PROJECT_TYPES = [
  { value: 'RESIDENTIAL', label: 'Residential' },
  { value: 'COMMERCIAL', label: 'Commercial' },
  { value: 'INDUSTRIAL', label: 'Industrial' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'RENOVATION', label: 'Renovation' },
];

export const PROJECT_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ARCHIVED', label: 'Archived' },
];

export const PROJECT_TYPE_LABELS = Object.fromEntries(PROJECT_TYPES.map((t) => [t.value, t.label]));
export const PROJECT_STATUS_LABELS = Object.fromEntries(PROJECT_STATUSES.map((s) => [s.value, s.label]));

// Sites
export const SITE_TYPES = [
  { value: 'BUILDING_TOWER', label: 'Building Tower' },
  { value: 'INFRASTRUCTURE', label: 'Infrastructure' },
  { value: 'CLUBHOUSE', label: 'Clubhouse / Amenities' },
  { value: 'VILLA_ZONE', label: 'Villa Zone' },
  { value: 'COMMERCIAL_ZONE', label: 'Commercial Zone' },
];

export const SITE_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const SITE_TYPE_LABELS = Object.fromEntries(SITE_TYPES.map((t) => [t.value, t.label]));
export const SITE_STATUS_LABELS = Object.fromEntries(SITE_STATUSES.map((s) => [s.value, s.label]));

// Buildings
export const BUILDING_TYPES = [
  { value: 'RESIDENTIAL_TOWER', label: 'Residential Tower' },
  { value: 'COMMERCIAL_BLOCK', label: 'Commercial Block' },
  { value: 'CLUBHOUSE', label: 'Clubhouse' },
  { value: 'PODIUM', label: 'Podium' },
  { value: 'PARKING_BLOCK', label: 'Parking Block' },
];

export const BUILDING_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'UNDER_CONSTRUCTION', label: 'Under Construction' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'ON_HOLD', label: 'On Hold' },
];

export const BUILDING_TYPE_LABELS = Object.fromEntries(BUILDING_TYPES.map((t) => [t.value, t.label]));
export const BUILDING_STATUS_LABELS = Object.fromEntries(BUILDING_STATUSES.map((s) => [s.value, s.label]));

// Floors
export const FLOOR_TYPES = [
  { value: 'BASEMENT', label: 'Basement' },
  { value: 'STILT', label: 'Stilt' },
  { value: 'PODIUM', label: 'Podium' },
  { value: 'TYPICAL', label: 'Typical Floor' },
  { value: 'REFUGE', label: 'Refuge Floor' },
  { value: 'TERRACE', label: 'Terrace' },
];

export const FLOOR_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const FLOOR_TYPE_LABELS = Object.fromEntries(FLOOR_TYPES.map((t) => [t.value, t.label]));
export const FLOOR_STATUS_LABELS = Object.fromEntries(FLOOR_STATUSES.map((s) => [s.value, s.label]));

// Zones
export const ZONE_TYPES = [
  { value: 'RESIDENTIAL_UNIT', label: 'Residential Unit' },
  { value: 'COMMON_AREA', label: 'Common Area' },
  { value: 'CORRIDOR', label: 'Corridor' },
  { value: 'ELECTRICAL_ROOM', label: 'Electrical Room' },
  { value: 'DUCT_SHAFT', label: 'Duct Shaft' },
  { value: 'STAIRCASE', label: 'Staircase' },
];

export const ZONE_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const ZONE_TYPE_LABELS = Object.fromEntries(ZONE_TYPES.map((t) => [t.value, t.label]));
export const ZONE_STATUS_LABELS = Object.fromEntries(ZONE_STATUSES.map((s) => [s.value, s.label]));

// Currency & number formatting helpers
export function formatCurrency(amount, currency = 'INR') {
  if (amount == null || isNaN(amount)) return '₹0';
  const num = Number(amount);
  if (num >= 10000000) {
    return `₹${(num / 10000000).toFixed(2)} Cr`;
  }
  if (num >= 100000) {
    return `₹${(num / 100000).toFixed(2)} L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(num);
}

export function formatArea(sqFt) {
  if (sqFt == null || isNaN(sqFt)) return '0 sq.ft';
  return `${Number(sqFt).toLocaleString('en-IN')} sq.ft`;
}
