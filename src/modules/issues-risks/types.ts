// Issue/blocker tracking, escalation and project risk register (FR-090..093).
export interface Issue {
  id: string;
  title: string;
  priority: string;
  owner: string;
  status: string;
}
