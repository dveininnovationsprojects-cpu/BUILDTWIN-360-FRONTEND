// Delay-risk, forecast completion and project health index (section 11).
export interface ProjectHealth {
  id: string;
  project: string;
  healthIndex: string;
  delayRisk: string;
  forecastCompletion: string;
}

export interface KPIDefinition {
  id: string;
  code: string;
  name: string;
  category: 'Progress' | 'Schedule' | 'Cost' | 'Labour' | 'Material' | 'Supplier' | 'Quality' | 'Risk' | 'Forecast' | 'Health';
  businessPurpose: string;
  formula: string;
  sourceTables: string[];
  refreshTrigger: string;
  exclusions: string;
  ownerRole: string;
  validationExample: {
    project: string;
    scenario: string;
    calculation: string;
    result: string;
  };
}

