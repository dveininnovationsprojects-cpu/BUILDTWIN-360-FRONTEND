// WBS & Work Package Constants matching Spring Boot REST DTO contract

export const WBS_DISCIPLINES = [
  { value: 'CIVIL', label: 'Civil Works' },
  { value: 'STRUCTURAL', label: 'Structural & RCC' },
  { value: 'MEP', label: 'MEP (Mech / Elec / Plumbing)' },
  { value: 'ELECTRICAL', label: 'Electrical & Power' },
  { value: 'PLUMBING', label: 'Plumbing & Drainage' },
  { value: 'HVAC', label: 'HVAC & Ventilation' },
  { value: 'FINISHING', label: 'Finishing & Interiors' },
  { value: 'FIRE_FIGHTING', label: 'Fire Fighting & Safety' },
];

export const WBS_STATUSES = [
  { value: 'PLANNED', label: 'Planned' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'ON_HOLD', label: 'On Hold' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const DISCIPLINE_LABELS = Object.fromEntries(
  WBS_DISCIPLINES.map((d) => [d.value, d.label])
);

export const STATUS_LABELS = Object.fromEntries(
  WBS_STATUSES.map((s) => [s.value, s.label])
);

export const DISCIPLINE_BADGES = {
  CIVIL: 'bg-amber-50 text-amber-800 border-amber-200',
  STRUCTURAL: 'bg-blue-50 text-blue-800 border-blue-200',
  MEP: 'bg-cyan-50 text-cyan-800 border-cyan-200',
  ELECTRICAL: 'bg-yellow-50 text-yellow-800 border-yellow-200',
  PLUMBING: 'bg-teal-50 text-teal-800 border-teal-200',
  HVAC: 'bg-indigo-50 text-indigo-800 border-indigo-200',
  FINISHING: 'bg-purple-50 text-purple-800 border-purple-200',
  FIRE_FIGHTING: 'bg-rose-50 text-rose-800 border-rose-200',
};

export const STATUS_BADGES = {
  PLANNED: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300',
  IN_PROGRESS: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400',
  ON_HOLD: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400',
  COMPLETED: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400',
  DELAYED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
  CANCELLED: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400',
};

// Units of Measure matching Spring Boot DTOs
export const WBS_UOMS = [
  { value: 'CUM', label: 'Cubic Meters (CUM / m³)' },
  { value: 'SQFT', label: 'Square Feet (SQFT)' },
  { value: 'SQM', label: 'Square Meters (SQM / m²)' },
  { value: 'RMT', label: 'Running Meters (RMT)' },
  { value: 'KG', label: 'Kilograms (KG)' },
  { value: 'MT', label: 'Metric Tonnes (MT)' },
  { value: 'NOS', label: 'Numbers / Units (NOS)' },
  { value: 'POINTS', label: 'Electrical / Plumbing Points' },
  { value: 'PERCENT', label: 'Percentage (%)' },
];

// Activity Dependency Precedence Types (CPM)
export const DEPENDENCY_TYPES = [
  { value: 'FS', label: 'Finish-to-Start (FS)', description: 'Successor starts after Predecessor finishes' },
  { value: 'SS', label: 'Start-to-Start (SS)', description: 'Successor starts together with Predecessor' },
  { value: 'FF', label: 'Finish-to-Finish (FF)', description: 'Successor finishes together with Predecessor' },
  { value: 'SF', label: 'Start-to-Finish (SF)', description: 'Successor finishes after Predecessor starts' },
];

export const DEPENDENCY_TYPE_BADGES = {
  FS: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300',
  SS: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300',
  FF: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300',
  SF: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300',
};

