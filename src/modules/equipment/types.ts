// Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).
export interface Equipment {
  id: string;
  assetCode: string;
  type: string;
  site: string;
  status: string;
}
