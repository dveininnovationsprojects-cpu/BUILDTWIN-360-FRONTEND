// Document/photo repository by project/category/version with search (FR-110..114).
export interface Document {
  id: string;
  name: string;
  category: string;
  uploadedBy: string;
  version: string;
}
