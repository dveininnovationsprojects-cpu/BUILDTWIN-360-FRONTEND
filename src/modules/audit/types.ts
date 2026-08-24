// Read-only history of create/update/approve actions (FR-005).
export interface AuditLog {
  id: string;
  user: string;
  action: string;
  entityType: string;
  timestamp: string;
}
