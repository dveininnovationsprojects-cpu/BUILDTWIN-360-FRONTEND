// Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057).
export interface Material {
  id: string;
  code: string;
  name: string;
  currentStock: string;
  reorderLevel: string;
}
