// Roles from Project Requirements Specification, section 7 (Stakeholders and User Roles).
export const ROLES = {
  DIRECTOR: 'DIRECTOR',
  PROJECT_MANAGER: 'PROJECT_MANAGER',
  SITE_ENGINEER: 'SITE_ENGINEER',
  SITE_SUPERVISOR: 'SITE_SUPERVISOR',
  PROCUREMENT_STORE: 'PROCUREMENT_STORE',
  COST_COORDINATOR: 'COST_COORDINATOR',
  QUALITY_ENGINEER: 'QUALITY_ENGINEER',
  DATA_ANALYST: 'DATA_ANALYST',
  SYSTEM_ADMIN: 'SYSTEM_ADMIN',
  AUDITOR: 'AUDITOR',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

// Field-only roles must never see commercial/management-only data (FR-004).
export const FIELD_ONLY_ROLES: Role[] = [ROLES.SITE_ENGINEER, ROLES.SITE_SUPERVISOR];

export const COMMERCIAL_ROLES: Role[] = [
  ROLES.DIRECTOR,
  ROLES.PROJECT_MANAGER,
  ROLES.COST_COORDINATOR,
];
