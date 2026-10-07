// BuildTwin 360 - Stakeholder & User Roles Master Specification (SRS Section 7 & Backend DataInitializer)
// Exactly the 10 Standard Roles supported across Spring Boot backend and Frontend.

export const ROLES = {
  DIRECTOR: 'DIRECTOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SITE_SUPERVISOR: 'SITE_SUPERVISOR',
  PROCUREMENT_STORE: 'PROCUREMENT_STORE',
  QUANTITY_COST_COORDINATOR: 'QUANTITY_COST_COORDINATOR',
  // Backward compatibility alias:
  COST_COORDINATOR: 'QUANTITY_COST_COORDINATOR',
  QUALITY_ENGINEER: 'QUALITY_ENGINEER',
  DATA_ANALYST: 'DATA_ANALYST',
  ADMIN: 'ADMIN',
  // Backward compatibility alias:
  SYSTEM_ADMIN: 'ADMIN',
  AUDITOR: 'AUDITOR',
};

// Normalized canonical keys for the 10 roles
export const CANONICAL_ROLES = [
  ROLES.DIRECTOR,
  ROLES.PROJECT_MANAGER,
  ROLES.SITE_ENGINEER,
  ROLES.SITE_SUPERVISOR,
  ROLES.PROCUREMENT_STORE,
  ROLES.QUANTITY_COST_COORDINATOR,
  ROLES.QUALITY_ENGINEER,
  ROLES.DATA_ANALYST,
  ROLES.ADMIN,
  ROLES.AUDITOR,
];

// Mapping to/from Backend Spring Security roles ("ROLE_...")
export const ROLE_DEFINITIONS = {
  [ROLES.DIRECTOR]: {
    key: ROLES.DIRECTOR,
    backendRole: 'ROLE_DIRECTOR',
    label: 'Director / Management',
    description: 'Portfolio monitoring, approvals, performance review, high-level cost and risk oversight.',
    scope: 'All projects, executive dashboards, approvals, reports',
    badgeClass: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300',
  },
  [ROLES.PROJECT_MANAGER]: {
    key: ROLES.PROJECT_MANAGER,
    backendRole: 'ROLE_PROJECT_MANAGER',
    label: 'Project Manager',
    description: 'Schedule, progress, labour, material, issues, cost coordination and contractor review.',
    scope: 'Assigned projects with broad edit/approval rights',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300',
  },
  [ROLES.SITE_ENGINEER]: {
    key: ROLES.SITE_ENGINEER,
    backendRole: 'ROLE_SITE_ENGINEER',
    label: 'Site Engineer',
    description: 'DPR entry, quantities, photos, labour allocation, material requests, quality observations.',
    scope: 'Assigned site/project operational modules',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  [ROLES.SITE_SUPERVISOR]: {
    key: ROLES.SITE_SUPERVISOR,
    backendRole: 'ROLE_SITE_SUPERVISOR',
    label: 'Site Supervisor',
    description: 'Attendance support, activity updates, material issue requests, evidence capture.',
    scope: 'Restricted field-data access',
    badgeClass: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300',
  },
  [ROLES.PROCUREMENT_STORE]: {
    key: ROLES.PROCUREMENT_STORE,
    backendRole: 'ROLE_PROCUREMENT_STORE',
    label: 'Procurement / Store',
    description: 'Purchase requests, PO data, GRN, stock, issue and supplier records.',
    scope: 'Material and procurement modules',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300',
  },
  [ROLES.QUANTITY_COST_COORDINATOR]: {
    key: ROLES.QUANTITY_COST_COORDINATOR,
    backendRole: 'ROLE_QUANTITY_COST_COORDINATOR',
    label: 'Quantity / Cost Coordinator',
    description: 'BOQ/cost heads, budget, measurements, actual cost and commercial reports.',
    scope: 'Cost and measurement modules',
    badgeClass: 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300',
  },
  [ROLES.QUALITY_ENGINEER]: {
    key: ROLES.QUALITY_ENGINEER,
    backendRole: 'ROLE_QUALITY_ENGINEER',
    label: 'Quality Engineer',
    description: 'Inspection plans, NCR/snag records, evidence and closure.',
    scope: 'Quality modules',
    badgeClass: 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300',
  },
  [ROLES.DATA_ANALYST]: {
    key: ROLES.DATA_ANALYST,
    backendRole: 'ROLE_DATA_ANALYST',
    label: 'Data / Management Analyst',
    description: 'KPI models, dashboard validation, trends, forecast and management reports.',
    scope: 'Read access to analytical datasets; controlled export',
    badgeClass: 'bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300',
  },
  [ROLES.ADMIN]: {
    key: ROLES.ADMIN,
    backendRole: 'ROLE_ADMIN',
    label: 'System Administrator',
    description: 'Users, roles, configurations, master data and audit review.',
    scope: 'Administrative modules & full access',
    badgeClass: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300',
  },
  [ROLES.AUDITOR]: {
    key: ROLES.AUDITOR,
    backendRole: 'ROLE_AUDITOR',
    label: 'Auditor / Reviewer',
    description: 'Read-only history, reports and approval evidence.',
    scope: 'Read-only controlled access',
    badgeClass: 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800/60 dark:text-slate-300',
  },
};

/**
 * Normalizes any role representation into its canonical key.
 * Handles "ROLE_ADMIN" -> "ADMIN", "SYSTEM_ADMIN" -> "ADMIN", etc.
 */
export function normalizeRole(role) {
  if (!role) return '';
  const cleaned = String(role).trim().toUpperCase().replace(/^ROLE_/, '');
  if (cleaned === 'SYSTEM_ADMIN') return ROLES.ADMIN;
  if (cleaned === 'COST_COORDINATOR') return ROLES.QUANTITY_COST_COORDINATOR;
  return cleaned;
}

/**
 * Converts a role into Spring Boot's required authority string (with ROLE_ prefix)
 */
export function toBackendRole(role) {
  const normalized = normalizeRole(role);
  return `ROLE_${normalized}`;
}

// Field-only roles must never see commercial/management-only data (FR-004).
export const FIELD_ONLY_ROLES = [ROLES.SITE_ENGINEER, ROLES.SITE_SUPERVISOR];

export const COMMERCIAL_ROLES = [
  ROLES.DIRECTOR,
  ROLES.PROJECT_MANAGER,
  ROLES.QUANTITY_COST_COORDINATOR,
];
