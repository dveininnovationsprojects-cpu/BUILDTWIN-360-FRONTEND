// Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).
export interface Report {
  id: string;
  name: string;
  period: string;
  generatedAt: string;
  format: string;
}
