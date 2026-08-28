// Shared status vocabulary used by DPR, quality/NCR, material stock and issue
// severity across every module, so a "status" always reads the same way.
export const STATUS_TONE_CLASSES = {
  success: 'bg-status-successBg text-status-success',
  warning: 'bg-status-warningBg text-status-warning',
  danger: 'bg-status-dangerBg text-status-danger',
  critical: 'bg-status-criticalBg text-status-critical',
  info: 'bg-status-infoBg text-status-info',
  neutral: 'bg-status-neutralBg text-status-neutral',
};

// Maps backend workflow statuses (DPR: draft/submitted/approved; NCR: Open/Assigned/
// Rectification Submitted/Verification/Closed/Reopened; alerts: Info/Warning/High/Critical)
// to a display tone so every module can share <StatusPill status={...} />.
export const WORKFLOW_STATUS_TONE = {
  DRAFT: 'neutral',
  SUBMITTED: 'info',
  PENDING: 'warning',
  APPROVED: 'success',
  REJECTED: 'danger',
  OPEN: 'warning',
  ASSIGNED: 'info',
  RECTIFICATION_SUBMITTED: 'info',
  VERIFICATION: 'info',
  CLOSED: 'success',
  REOPENED: 'danger',
  INFO: 'info',
  WARNING: 'warning',
  HIGH: 'danger',
  CRITICAL: 'critical',
  ACTIVE: 'success',
  INACTIVE: 'neutral',
  BLOCKED: 'danger',
  OVERDUE: 'critical',
  PLANNING: 'info',
  ON_HOLD: 'warning',
  COMPLETED: 'success',
};
