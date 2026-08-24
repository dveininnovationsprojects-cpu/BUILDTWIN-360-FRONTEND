// In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).
export interface Notification {
  id: string;
  message: string;
  severity: string;
  createdAt: string;
  readStatus: string;
}
