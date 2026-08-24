// WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).
export interface Activity {
  id: string;
  wbsCode: string;
  name: string;
  discipline: string;
  status: string;
}
