import type { KPIDefinition } from '../types';

/**
 * BUILDTWIN 360 - Day 1 KPI Dictionary & Metric Governance Framework Dataset
 * Section 11 & Section 16.3 Requirements Specification
 * Reference Context: Ashok Builders & Developers, Padur, Chennai
 */
export const BUILDTWIN_KPI_DICTIONARY: KPIDefinition[] = [
  {
    id: 'kpi-prg-01',
    code: 'KPI-PRG-01',
    name: 'Cumulative Physical Progress (%)',
    category: 'Progress',
    businessPurpose: 'Measures overall physical completion of a project, building, floor, zone, or work package relative to planned quantities.',
    formula: 'Physical Progress % = Sum(min(1.0, Cumulative Approved Qty_i / Total Planned Qty_i) * Weightage_i) * 100',
    sourceTables: ['activities.planned_qty', 'activities.weightage', 'dpr_activity_progress.qty_today', 'dpr_headers.status'],
    refreshTrigger: 'Real-time upon DPR Approval; Cached hourly for Executive Dashboard.',
    exclusions: 'If Total Planned Qty = 0, activity is excluded and remaining weights normalized. Unapproved DPRs are excluded.',
    ownerRole: 'Project Manager / QS Coordinator',
    validationExample: {
      project: 'PRJ-001 Padur Residence (Ground Floor)',
      scenario: 'Column Reinforcement (Weight 0.40, 100% done) + Slab Concreting (Weight 0.60, 50% done)',
      calculation: '(0.40 * 1.0 + 0.60 * 0.50) * 100',
      result: '70.0% Physical Progress'
    }
  },
  {
    id: 'kpi-sch-01',
    code: 'KPI-SCH-01',
    name: 'Schedule Performance Index (SPI)',
    category: 'Schedule',
    businessPurpose: 'Quantifies schedule efficiency. SPI > 1.0 indicates ahead of schedule; SPI < 1.0 indicates project slippage.',
    formula: 'SPI = Earned Value (EV) / Planned Value (PV)',
    sourceTables: ['projects.contract_value', 'activities.planned_start_date', 'activities.planned_end_date', 'dpr_activity_progress'],
    refreshTrigger: 'Daily at 00:00 hrs after end-of-day DPR lock.',
    exclusions: 'If PV = 0 (before project start), SPI defaults to 1.00.',
    ownerRole: 'Data Analyst / Project Manager',
    validationExample: {
      project: 'PRJ-002 OMR Commercial Block',
      scenario: 'BAC = ₹50,000,000, Planned PV to date = ₹15,000,000, Earned EV to date = ₹12,500,000',
      calculation: '12,500,000 / 15,000,000',
      result: '0.833 (Behind Schedule by 16.7%)'
    }
  },
  {
    id: 'kpi-sch-02',
    code: 'KPI-SCH-02',
    name: 'Schedule Variance (SV & SV Days)',
    category: 'Schedule',
    businessPurpose: 'Expresses schedule deviation in both financial value and calendar days behind/ahead of baseline.',
    formula: 'SV_monetary = EV - PV; SV_days = Baseline Planned End Date - Forecast Completion Date',
    sourceTables: ['activities.planned_end_date', 'calculated EV', 'calculated PV', 'forecast_completion_date'],
    refreshTrigger: 'Daily analytics job.',
    exclusions: 'Excludes non-critical path activities when evaluating milestone impact.',
    ownerRole: 'Project Manager',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: 'EV = ₹4,50,000, PV = ₹5,00,000. Baseline Slab Date = Aug 20, Forecast = Aug 26',
      calculation: 'SV_monetary = 4,50,000 - 5,00,000; SV_days = Aug 20 - Aug 26',
      result: '-₹50,000 Monetary SV, -6 Days Schedule Variance'
    }
  },
  {
    id: 'kpi-cst-01',
    code: 'KPI-CST-01',
    name: 'Cost Performance Index (CPI) & Budget Variance',
    category: 'Cost',
    businessPurpose: 'Measures financial efficiency of spent capital against physical work delivered.',
    formula: 'CPI = Earned Value (EV) / Actual Cost (AC)',
    sourceTables: ['cost_transactions.amount', 'cost_transactions.source_type', 'calculated EV'],
    refreshTrigger: 'Real-time on verified cost transaction / invoice entry.',
    exclusions: 'Unverified commitments (draft POs) are tracked under Committed Cost, not Actual Cost. If AC = 0, CPI = 1.00.',
    ownerRole: 'Quantity / Cost Coordinator',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: 'EV = ₹4,50,000, Actual Cost spent (AC) = ₹4,80,000',
      calculation: '4,50,000 / 4,80,000',
      result: '0.9375 CPI (Over Budget by 6.25%)'
    }
  },
  {
    id: 'kpi-lbr-01',
    code: 'KPI-LBR-01',
    name: 'Labour Productivity Index (LPI)',
    category: 'Labour',
    businessPurpose: 'Evaluates crew work efficiency against benchmark rates (e.g., m³ concrete per labour-hour).',
    formula: 'Actual Productivity = Completed Qty / Labour Hours; LPI = (Actual Productivity / Benchmark) * 100',
    sourceTables: ['dpr_activity_progress.qty_today', 'labour_daily.headcount', 'labour_activity_allocations.labour_hours'],
    refreshTrigger: 'Daily upon DPR submission.',
    exclusions: 'Weather downtime days marked in DPR header are excluded from benchmark calculations.',
    ownerRole: 'Site Engineer / Site Supervisor',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: '12.5 m³ concreting achieved with 50 labour-hours. Benchmark = 0.30 m³/labour-hr',
      calculation: '( (12.5 / 50) / 0.30 ) * 100',
      result: '83.33% Labour Productivity Index (16.67% under benchmark)'
    }
  },
  {
    id: 'kpi-mat-01',
    code: 'KPI-MAT-01',
    name: 'Material Consumption Rate & Depletion Forecast',
    category: 'Material',
    businessPurpose: 'Projects exact calendar date when material inventory will deplete, warning of material shortage before upcoming planned activities.',
    formula: 'Rolling Daily Consumption Rate (CR_7d) = Sum(Consumed Qty_7d) / 7; Depletion Date = Current Date + (Stock / CR_7d)',
    sourceTables: ['stock_ledger.qty', 'stock_ledger.txn_type', 'materials.reorder_level'],
    refreshTrigger: 'Real-time on stock_ledger transaction; Batch evaluation twice daily.',
    exclusions: 'If CR_7d = 0, uses standard planned BOQ rate for upcoming scheduled look-ahead activities.',
    ownerRole: 'Procurement / Store Officer',
    validationExample: {
      project: 'PRJ-001 Padur Residence (Cement Stock)',
      scenario: 'Store Balance = 120 Bags, Daily Consumption = 30 Bags/day. Planned Slab Date = Aug 30',
      calculation: '120 / 30 = 4 Days -> Depletion on Aug 29',
      result: 'ALERT: Stock Shortage before Planned Activity (Aug 30)'
    }
  },
  {
    id: 'kpi-mat-02',
    code: 'KPI-MAT-02',
    name: 'Material Wastage Percentage (%)',
    category: 'Material',
    businessPurpose: 'Identifies material loss, theft, or excess scrap at site by comparing store issues against measured physical installation.',
    formula: 'Wastage % = ((Total Issued Qty - Measured Productive Qty - Usable Balance) / Total Issued Qty) * 100',
    sourceTables: ['stock_ledger', 'material_consumption.qty', 'material_consumption.wastage_qty'],
    refreshTrigger: 'Weekly material reconciliation.',
    exclusions: 'Standard scrap allowance (e.g., Rebar 2.5%, Sand 5.0%) is subtracted before alerting.',
    ownerRole: 'Quantity Surveyor / Site Engineer',
    validationExample: {
      project: 'PRJ-002 OMR Commercial Block (12mm Rebar)',
      scenario: 'Issued = 10.0 MT, Measured in structures = 9.4 MT, Store Balance = 0.3 MT',
      calculation: '((10.0 - 9.4 - 0.3) / 10.0) * 100',
      result: '3.0% Material Wastage (Exceeds 2.5% benchmark threshold)'
    }
  },
  {
    id: 'kpi-sup-01',
    code: 'KPI-SUP-01',
    name: 'Supplier On-Time Delivery (OTD %)',
    category: 'Supplier',
    businessPurpose: 'Evaluates material supplier compliance with agreed Purchase Order delivery schedules.',
    formula: 'Supplier OTD % = (On-time Receipts (GRN Date <= PO Due Date) / Total Receipts) * 100',
    sourceTables: ['purchase_orders.delivery_date', 'grn.created_at', 'grn.accepted_qty'],
    refreshTrigger: 'Real-time on GRN entry.',
    exclusions: 'Rejected shipments (accepted qty = 0) count as late deliveries.',
    ownerRole: 'Procurement Lead',
    validationExample: {
      project: 'Supplier: Chennai Ready-Mix Concrete Co.',
      scenario: '10 PO deliveries in last 30 days, 9 delivered on or before PO due date',
      calculation: '(9 / 10) * 100',
      result: '90.0% Supplier OTD Rate'
    }
  },
  {
    id: 'kpi-qlt-01',
    code: 'KPI-QLT-01',
    name: 'NCR / Quality Defect Ageing & Closure Index',
    category: 'Quality',
    businessPurpose: 'Tracks open site quality defects, overdue rectifications, and contractor accountability.',
    formula: 'NCR Ageing Days = Current Date - Creation Date (for non-closed status)',
    sourceTables: ['quality_issues.created_at', 'quality_issues.due_date', 'quality_issues.status'],
    refreshTrigger: 'Daily automated batch execution.',
    exclusions: 'Reopened NCRs retain original creation date for ageing calculation.',
    ownerRole: 'Quality Engineer',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: 'NCR-042 (Slab Honeycombing, High Severity) created Aug 15, current date Aug 25',
      calculation: 'Aug 25 - Aug 15',
      result: '10 Days Ageing (Overdue by 5 days past 5-day SLA)'
    }
  },
  {
    id: 'kpi-rsk-01',
    code: 'KPI-RSK-01',
    name: 'Activity Delay Risk Score (DRS 0-100)',
    category: 'Risk',
    businessPurpose: 'Predicts which upcoming critical activities are likely to suffer schedule failure before the failure occurs.',
    formula: 'DRS = (0.35 * S_pred) + (0.25 * S_mat) + (0.20 * S_lbr) + (0.10 * S_prod) + (0.10 * S_qlt)',
    sourceTables: ['activity_dependencies', 'stock_ledger', 'labour_daily', 'dpr_activity_progress', 'quality_issues'],
    refreshTrigger: 'Nightly risk analytics engine.',
    exclusions: 'Non-critical path activities have a 0.5x scaling multiplier applied to DRS.',
    ownerRole: 'Data Analyst / Backend Lead',
    validationExample: {
      project: 'PRJ-001 Padur Residence (Slab Concreting ACT-104)',
      scenario: 'Predecessor late (80) + Cement stock low (100) + Crew productivity low (60) + Open NCR (90)',
      calculation: '(0.35*80) + (0.25*100) + (0.20*20) + (0.10*60) + (0.10*90)',
      result: '72.0 / 100 Delay Risk Score (CRITICAL RISK)'
    }
  },
  {
    id: 'kpi-fct-01',
    code: 'KPI-FCT-01',
    name: 'Forecast Completion Date (FCD)',
    category: 'Forecast',
    businessPurpose: 'Dynamic statistical forecasting of project finish date adjusted for recent site burn rate and active blockers.',
    formula: 'Remaining Work Days_adj = Baseline Remaining Days / Rolling 14-Day SPI; FCD = Current Date + Days_adj + Blocker Delays',
    sourceTables: ['activities.planned_end_date', 'rolling 14-day SPI', 'issues.due_date'],
    refreshTrigger: 'Weekly analytics job (Sunday 23:00 hrs).',
    exclusions: 'If rolling SPI < 0.50, SPI is capped at 0.50 with a high uncertainty flag.',
    ownerRole: 'Data Analyst',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: 'Baseline finish Sept 30 (36 days remaining from Aug 25). Rolling SPI = 0.80. Blocker = +3 days',
      calculation: 'Aug 25 + (36 / 0.80) + 3 days',
      result: 'Forecast Completion Date: Oct 12, 2026 (+12 Days Slippage)'
    }
  },
  {
    id: 'kpi-hlt-01',
    code: 'KPI-HLT-01',
    name: 'Project Health Index (PHI 0-100)',
    category: 'Health',
    businessPurpose: 'Single composite executive score (0-100) summarizing overall project status across Schedule, Cost, Quality, Material, and Risk.',
    formula: 'PHI = (0.30 * S_SPI) + (0.25 * S_CPI) + (0.20 * (100 - DRS_avg)) + (0.15 * S_Quality) + (0.10 * S_Material)',
    sourceTables: ['SPI', 'CPI', 'DRS', 'Quality Closure Rate', 'Material Shortage Alerts'],
    refreshTrigger: 'Daily Executive Aggregation Service.',
    exclusions: 'If project status is SETUP or ARCHIVED, PHI is set to NULL.',
    ownerRole: 'Data Analyst / Executive Management',
    validationExample: {
      project: 'PRJ-001 Padur Residence',
      scenario: 'SPI=0.90 (27.0), CPI=0.9375 (23.44), DRS_avg=45 (11.0), Quality=75% (11.25), Material=60 (6.0)',
      calculation: '27.0 + 23.44 + 11.00 + 11.25 + 6.00',
      result: '78.69 / 100 Project Health Index (AMBER / NEEDS ATTENTION)'
    }
  }
];
