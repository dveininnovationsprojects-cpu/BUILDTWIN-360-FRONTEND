// Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).
export interface Budget {
  id: string;
  costCode: string;
  baselineAmount: string;
  actualAmount: string;
  variance: string;
}
