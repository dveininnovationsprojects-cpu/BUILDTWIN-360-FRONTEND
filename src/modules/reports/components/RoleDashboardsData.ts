import { ROLES, type Role } from '@/constants/roles';

export interface DashboardRoleConfig {
  role: Role;
  title: string;
  responsibilities: string;
  accessScope: string;
  kpis: {
    label: string;
    value: string;
    subtext?: string;
    tone?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    code?: string;
  }[];
  primaryFocusWidgets: {
    title: string;
    description: string;
    items: { label: string; detail: string; badge?: string; tone?: 'success' | 'warning' | 'danger' | 'info' }[];
  }[];
}

export const ROLE_DASHBOARDS_DATA: Record<Role, DashboardRoleConfig> = {
  [ROLES.DIRECTOR]: {
    role: ROLES.DIRECTOR,
    title: 'Director / Management Dashboard',
    responsibilities: 'Portfolio monitoring, approvals, performance review, high-level cost and risk oversight.',
    accessScope: 'All projects, executive dashboards, approvals, reports.',
    kpis: [
      { label: 'Project Health Index', value: '78.7 / 100', subtext: 'PHI-01 • Amber (Attention)', tone: 'warning', code: 'KPI-HLT-01' },
      { label: 'Cumulative Physical Progress', value: '64.5%', subtext: 'Across all active projects', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Schedule Performance (SPI)', value: '0.92', subtext: 'SPI < 1.00 (8% Slip)', tone: 'warning', code: 'KPI-SCH-01' },
      { label: 'Cost Performance (CPI)', value: '0.96', subtext: 'CPI < 1.00 (4% Over budget)', tone: 'warning', code: 'KPI-CST-01' },
      { label: 'Delay Risk Score', value: '34 / 100', subtext: 'Low Overall Portfolio Risk', tone: 'success', code: 'KPI-RSK-01' },
      { label: 'Forecast Completion Date', value: 'Oct 12, 2026', subtext: '+12 Days Baseline Slip', tone: 'danger', code: 'KPI-FCT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Executive Portfolio Health',
        description: 'High-level status of major construction sites',
        items: [
          { label: 'Padur Residence (PRJ-001)', detail: 'Progress: 70% | SPI: 0.833 | Cost: Over budget by 6.25%', badge: 'PHI: 78.7', tone: 'warning' },
          { label: 'OMR Commercial Block (PRJ-002)', detail: 'Progress: 45% | SPI: 0.950 | Cost: On budget', badge: 'PHI: 86.2', tone: 'success' },
        ],
      },
      {
        title: 'Executive Approvals Pending',
        description: 'Requires Director signature or authorization',
        items: [
          { label: 'Padur Residence — Variation Order #04', detail: 'Additional rebar steel for foundation slab (₹1,85,000)', badge: 'Pending Approval', tone: 'warning' },
          { label: 'Quarterly Commercial Baseline Audit', detail: 'Review baseline frozen budget before Q4 start', badge: 'Review Needed', tone: 'info' },
        ],
      },
    ],
  },

  [ROLES.PROJECT_MANAGER]: {
    role: ROLES.PROJECT_MANAGER,
    title: 'Project Manager Dashboard',
    responsibilities: 'Schedule, progress, labour, material, issues, cost coordination and contractor review.',
    accessScope: 'Assigned projects with broad edit/approval rights.',
    kpis: [
      { label: 'Schedule Variance (Days)', value: '-6 Days', subtext: 'Behind baseline slab target', tone: 'danger', code: 'KPI-SCH-02' },
      { label: 'Schedule Performance (SPI)', value: '0.833', subtext: 'EV ₹12.5M / PV ₹15.0M', tone: 'danger', code: 'KPI-SCH-01' },
      { label: 'Labour Productivity (LPI)', value: '88.5%', subtext: '11.5% below benchmark target', tone: 'warning', code: 'KPI-LBR-01' },
      { label: 'Material Depletion Alert', value: '4 Days', subtext: 'Cement depletes on Aug 29', tone: 'danger', code: 'KPI-MAT-01' },
      { label: 'Quality NCR Ageing', value: '10 Days', subtext: 'Overdue by 5 days past SLA', tone: 'warning', code: 'KPI-QLT-01' },
      { label: 'Activity Delay Risk (DRS)', value: '72.0 / 100', subtext: 'ACT-104 Slab Concreting High Risk', tone: 'danger', code: 'KPI-RSK-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Critical Path & Milestones',
        description: 'Schedule tracking for critical activities',
        items: [
          { label: 'Ground Floor Slab Concreting (ACT-104)', detail: 'Predecessor late + Cement stock low + Crew LPI 83.3%', badge: 'High Risk (DRS 72)', tone: 'danger' },
          { label: 'Column Reinforcement (ACT-103)', detail: 'Completed 100% on schedule', badge: 'Completed', tone: 'success' },
        ],
      },
      {
        title: 'Daily Progress Reports (DPR) Queue',
        description: 'Pending PM review and verification',
        items: [
          { label: 'Padur DPR — Aug 25, 2026', detail: 'Submitted by Eng. Rajesh • 12.5 m³ concrete, 50 labour-hrs', badge: 'Pending Verification', tone: 'info' },
        ],
      },
    ],
  },

  [ROLES.SITE_ENGINEER]: {
    role: ROLES.SITE_ENGINEER,
    title: 'Site Engineer Dashboard',
    responsibilities: 'DPR entry, quantities, photos, labour allocation, material requests, quality observations.',
    accessScope: 'Assigned site/project operational modules.',
    kpis: [
      { label: 'Today DPR Status', value: 'Submitted', subtext: 'Aug 25 DPR logged with site photos', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Physical Progress (Ground Floor)', value: '70.0%', subtext: 'Reinforcement 100% | Slab 50%', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Crew Productivity Today', value: '0.25 m³/hr', subtext: 'Target: 0.30 m³/labour-hr', tone: 'warning', code: 'KPI-LBR-01' },
      { label: 'Site Quality Observations', value: '3 Active', subtext: '1 Honeycombing open', tone: 'warning', code: 'KPI-QLT-01' },
      { label: 'Pending Material Indents', value: '4 Requisitions', subtext: 'Cement & 12mm Rebar requested', tone: 'info', code: 'KPI-MAT-01' },
      { label: 'Labour Hours Allocated', value: '50 Hrs', subtext: '10 Masons + 4 Helpers today', tone: 'info', code: 'KPI-LBR-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Daily Site Log & Quantities',
        description: 'Operational work done on ground floor zone 1',
        items: [
          { label: 'Ground Floor Column Reinforcement', detail: 'Target: 4.2 MT • Achieved: 4.2 MT (100% complete)', badge: 'Verified', tone: 'success' },
          { label: 'Slab Concreting M30 Grade', detail: 'Target: 25.0 m³ • Achieved: 12.5 m³ (50% complete)', badge: 'In Progress', tone: 'info' },
        ],
      },
      {
        title: 'Site Evidence & Photos Uploaded',
        description: 'Geo-tagged field photos attached to DPR',
        items: [
          { label: 'Slab Shuttering & Rebar Mesh Inspection', detail: '4 high-res photos captured with timestamp & GPS', badge: 'Uploaded', tone: 'success' },
        ],
      },
    ],
  },

  [ROLES.SITE_SUPERVISOR]: {
    role: ROLES.SITE_SUPERVISOR,
    title: 'Site Supervisor Dashboard',
    responsibilities: 'Attendance support, activity updates, material issue requests, evidence capture.',
    accessScope: 'Restricted field-data access.',
    kpis: [
      { label: 'Daily Labour Headcount', value: '42 Workers', subtext: 'Masons: 14, Steel: 16, Helpers: 12', tone: 'info', code: 'KPI-LBR-01' },
      { label: 'Work Activity Progress Today', value: '12.5 m³', subtext: 'Slab concreting poured', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Field Evidence Captured', value: '14 Photos', subtext: 'Site log photos uploaded', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Store Issue Requests', value: '2 Pending', subtext: 'Cement bags & binding wire drawal', tone: 'warning', code: 'KPI-MAT-01' },
      { label: 'Shift Attendance Verified', value: '100%', subtext: 'Morning muster call complete', tone: 'success', code: 'KPI-LBR-01' },
      { label: 'Field Safety Incidents', value: '0 Incidents', subtext: 'Zero reportable injuries', tone: 'success', code: 'KPI-HLT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Crew Attendance & Gang Distribution',
        description: 'Morning muster call and gang allocation',
        items: [
          { label: 'Gang A — Concreting Crew', detail: '12 workers • Allocated to Slab Concreting', badge: 'Active', tone: 'success' },
          { label: 'Gang B — Bar Bending Crew', detail: '16 workers • Allocated to Beam Reinforcement', badge: 'Active', tone: 'success' },
        ],
      },
      {
        title: 'Immediate Material Drawal Slip',
        description: 'Material requested from site store',
        items: [
          { label: 'Indent #302 — OPC 53 Grade Cement', detail: 'Requested 30 Bags for evening pour', badge: 'Awaiting Store Issue', tone: 'warning' },
        ],
      },
    ],
  },

  [ROLES.PROCUREMENT_STORE]: {
    role: ROLES.PROCUREMENT_STORE,
    title: 'Procurement / Store Dashboard',
    responsibilities: 'Purchase requests, PO data, GRN, stock, issue and supplier records.',
    accessScope: 'Material and procurement modules.',
    kpis: [
      { label: 'Days to Stock Depletion', value: '4 Days', subtext: 'Cement stock depletes Aug 29', tone: 'danger', code: 'KPI-MAT-01' },
      { label: 'Rolling Consumption Rate', value: '30 Bags/day', subtext: 'Based on 7-day average', tone: 'info', code: 'KPI-MAT-01' },
      { label: 'Material Wastage Variance', value: '3.0%', subtext: 'Rebar 12mm (Exceeds 2.5% max)', tone: 'danger', code: 'KPI-MAT-02' },
      { label: 'Supplier On-Time Delivery', value: '90.0%', subtext: '9 of 10 shipments on PO date', tone: 'success', code: 'KPI-SUP-01' },
      { label: 'Pending GRN Entry', value: '2 Shipments', subtext: 'RMC Transit mixer at gate', tone: 'warning', code: 'KPI-SUP-01' },
      { label: 'Usable Store Balance', value: '120 Bags', subtext: 'OPC Cement Store #1', tone: 'warning', code: 'KPI-MAT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Low Stock & Depletion Warnings',
        description: 'Materials approaching reorder levels before scheduled activities',
        items: [
          { label: 'OPC 53 Cement (Store #1)', detail: 'Balance: 120 Bags • Consumption: 30/day • Depletion: Aug 29 • Planned Slab: Aug 30', badge: 'CRITICAL SHORTAGE', tone: 'danger' },
          { label: '12mm TMT Steel Rods', detail: 'Balance: 0.3 MT • Reorder level: 0.5 MT', badge: 'REORDER NEEDED', tone: 'warning' },
        ],
      },
      {
        title: 'Supplier Delivery & GRN Status',
        description: 'Incoming material shipments and PO compliance',
        items: [
          { label: 'Chennai Ready-Mix Concrete Co.', detail: 'PO #402 • 12 m³ M30 Concrete • Expected: Today 14:00 hrs', badge: 'In Transit', tone: 'info' },
        ],
      },
    ],
  },

  [ROLES.COST_COORDINATOR]: {
    role: ROLES.COST_COORDINATOR,
    title: 'Quantity / Cost Coordinator Dashboard',
    responsibilities: 'BOQ/cost heads, budget, measurements, actual cost and commercial reports.',
    accessScope: 'Cost and measurement modules.',
    kpis: [
      { label: 'Cost Performance Index (CPI)', value: '0.9375', subtext: 'Over budget by 6.25%', tone: 'danger', code: 'KPI-CST-01' },
      { label: 'Earned Value (EV)', value: '₹4,50,000', subtext: 'Value of physical work delivered', tone: 'info', code: 'KPI-CST-01' },
      { label: 'Actual Cost (AC)', value: '₹4,80,000', subtext: 'Spent capital on work done', tone: 'danger', code: 'KPI-CST-01' },
      { label: 'Cost Variance (CV)', value: '-₹30,000', subtext: 'Negative monetary variance', tone: 'danger', code: 'KPI-CST-01' },
      { label: 'Budget at Completion (BAC)', value: '₹50,000,000', subtext: 'Total approved baseline budget', tone: 'info', code: 'KPI-CST-01' },
      { label: 'Approved Measurements', value: '4,250 m³', subtext: 'Cumulative verified QS log', tone: 'success', code: 'KPI-PRG-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Cost Head Budget vs Actual Variance',
        description: 'Commercial financial performance per work package',
        items: [
          { label: 'Concrete & Formwork Head', detail: 'Budget: ₹3,50,000 • Spent: ₹3,85,000 • Variance: -₹35,000', badge: 'Over Budget', tone: 'danger' },
          { label: 'Rebar Steel Fabrication Head', detail: 'Budget: ₹1,50,000 • Spent: ₹1,45,000 • Variance: +₹5,000', badge: 'Under Budget', tone: 'success' },
        ],
      },
      {
        title: 'Subcontractor Payment Certificates',
        description: 'Certified measurements for billing',
        items: [
          { label: 'RA Bill #02 — Sri Lakshmi Structurals', detail: 'Claimed: ₹2,10,000 • QS Certified: ₹1,95,000', badge: 'Certified for Payment', tone: 'info' },
        ],
      },
    ],
  },

  [ROLES.QUALITY_ENGINEER]: {
    role: ROLES.QUALITY_ENGINEER,
    title: 'Quality Engineer Dashboard',
    responsibilities: 'Inspection plans, NCR/snag records, evidence and closure.',
    accessScope: 'Quality modules.',
    kpis: [
      { label: 'NCR Ageing Days', value: '10 Days', subtext: 'NCR-042 open past 5-day SLA', tone: 'danger', code: 'KPI-QLT-01' },
      { label: 'Quality Closure Rate', value: '75.0%', subtext: '15 of 20 defects resolved', tone: 'warning', code: 'KPI-QLT-01' },
      { label: 'Open Quality Defect Count', value: '3 Active', subtext: '1 High, 2 Medium Severity', tone: 'danger', code: 'KPI-QLT-01' },
      { label: 'Inspection Pass Rate', value: '92.0%', subtext: '23 of 25 inspections passed', tone: 'success', code: 'KPI-QLT-01' },
      { label: 'Hold-Point Approvals', value: '4 Pending', subtext: 'Pre-pour inspection scheduled', tone: 'info', code: 'KPI-QLT-01' },
      { label: 'Quality Risk Index', value: 'Low Impact', subtext: 'No structural failure risks', tone: 'success', code: 'KPI-RSK-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Active Non-Conformance Reports (NCR)',
        description: 'Open site defects and rectification tracking',
        items: [
          { label: 'NCR-042 — Slab Honeycombing (Ground Floor)', detail: 'Logged: Aug 15 • Due: Aug 20 • Ageing: 10 Days • Overdue by 5 days', badge: 'OVERDUE HIGH SEVERITY', tone: 'danger' },
          { label: 'NCR-043 — Rebar Cover Block Displacement', detail: 'Logged: Aug 23 • Due: Aug 26 • Rectification in progress', badge: 'Open Medium', tone: 'warning' },
        ],
      },
      {
        title: 'Pre-Pour Quality Clearance Checklist',
        description: 'Mandatory hold points before concreting',
        items: [
          { label: 'Slab ACT-104 Rebar & Embedded Conduit Check', detail: 'Inspector: Er. Vinoth • Status: Cleared with remarks', badge: 'PASSED', tone: 'success' },
        ],
      },
    ],
  },

  [ROLES.DATA_ANALYST]: {
    role: ROLES.DATA_ANALYST,
    title: 'Data / Management Analyst Dashboard',
    responsibilities: 'KPI models, dashboard validation, trends, forecast and management reports.',
    accessScope: 'Read access to analytical datasets; controlled export.',
    kpis: [
      { label: 'Composite Health (PHI)', value: '78.69 / 100', subtext: 'Weighted 5-factor model score', tone: 'warning', code: 'KPI-HLT-01' },
      { label: 'Forecast Completion Date', value: 'Oct 12, 2026', subtext: 'Earned rate FCD (+12 Days)', tone: 'danger', code: 'KPI-FCT-01' },
      { label: 'Delay Risk Score (DRS)', value: '72.0 / 100', subtext: 'Multi-factor predictive score', tone: 'danger', code: 'KPI-RSK-01' },
      { label: '14-Day Rolling SPI', value: '0.80', subtext: 'Work burn rate vs plan', tone: 'warning', code: 'KPI-FCT-01' },
      { label: 'Calculated Earned Value', value: '₹4,50,000', subtext: 'Physical EV calculation', tone: 'info', code: 'KPI-PRG-01' },
      { label: 'Data Model Governance', value: '100% Validated', subtext: 'Zero manual override flags', tone: 'success', code: 'KPI-HLT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Predictive Analytics & Model Drivers',
        description: 'Mathematical breakdown of forecast models',
        items: [
          { label: 'FCD Calculation Breakdown (KPI-FCT-01)', detail: 'Remaining Work Days: 36 • Rolling SPI: 0.80 -> Adjusted Days: 45 + 3 Blocker = 48 Days', badge: 'Oct 12 Forecast', tone: 'danger' },
          { label: 'DRS Multi-Factor Weightings (KPI-RSK-01)', detail: 'Pred (35%*80) + Mat (25%*100) + Lbr (20%*20) + Prod (10%*60) + Qlt (10%*90) = 72.0', badge: 'CRITICAL RISK', tone: 'danger' },
        ],
      },
      {
        title: 'Analytical Data Export & Governance',
        description: 'Export raw analytical datasets for executive reporting',
        items: [
          { label: 'Weekly SPI / CPI Analytics Dataset', detail: '1,420 record snapshot ready for CSV/PDF export', badge: 'Ready for Export', tone: 'info' },
        ],
      },
    ],
  },

  [ROLES.SYSTEM_ADMIN]: {
    role: ROLES.SYSTEM_ADMIN,
    title: 'System Administrator Dashboard',
    responsibilities: 'Users, roles, configurations, master data and audit review.',
    accessScope: 'Administrative modules.',
    kpis: [
      { label: 'Active User Accounts', value: '28 Users', subtext: '10 System roles configured', tone: 'info', code: 'KPI-HLT-01' },
      { label: 'Calculation Engine Health', value: '99.9% Operational', subtext: 'Real-time & Batch Services', tone: 'success', code: 'KPI-HLT-01' },
      { label: 'Nightly Analytics Batch', value: 'Completed', subtext: 'Last run: Today 00:00 hrs', tone: 'success', code: 'KPI-HLT-01' },
      { label: 'Master Audit Event Logs', value: '1,420 Events', subtext: '100% Traceability verified', tone: 'info', code: 'KPI-HLT-01' },
      { label: 'Database Sync Latency', value: '< 15 ms', subtext: 'PostgreSQL Ledger Sync', tone: 'success', code: 'KPI-HLT-01' },
      { label: 'Role Access Policies', value: 'Enforced', subtext: 'Field-only & Commercial rules active', tone: 'success', code: 'KPI-HLT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'User Role & Permission Matrix',
        description: 'User access levels across 10 domain modules',
        items: [
          { label: 'Role Enforcement Engine', detail: 'FIELD_ONLY_ROLES (Site Engineer, Supervisor) isolated from commercial cost data', badge: 'ENFORCED', tone: 'success' },
          { label: 'Active Sessions', detail: '14 concurrent active tokens across desktop & mobile PWA', badge: 'Active', tone: 'info' },
        ],
      },
      {
        title: 'System Audit & Master Data Integrity',
        description: 'System health logs and security events',
        items: [
          { label: 'Nightly Batch Execution #412', detail: 'Processed 12 KPI models, 120 stock ledger updates, 0 errors', badge: 'Success', tone: 'success' },
        ],
      },
    ],
  },

  [ROLES.AUDITOR]: {
    role: ROLES.AUDITOR,
    title: 'Auditor / Reviewer Dashboard',
    responsibilities: 'Read-only history, reports and approval evidence.',
    accessScope: 'Read-only controlled access.',
    kpis: [
      { label: 'DPR Approval Audit Trail', value: '100% Verified', subtext: 'All DPRs link to site photos', tone: 'success', code: 'KPI-PRG-01' },
      { label: 'Financial Cost Ledger Entries', value: '148 Verified', subtext: 'Zero unbacked transaction edits', tone: 'success', code: 'KPI-CST-01' },
      { label: 'Schedule Baseline History', value: 'Immutably Locked', subtext: 'Baseline frozen on Aug 01', tone: 'success', code: 'KPI-SCH-01' },
      { label: 'Governance Compliance Index', value: '98.5%', subtext: 'Meets Section 11 & 16.3 specs', tone: 'success', code: 'KPI-HLT-01' },
      { label: 'Stock Issue Audit Log', value: '120 Entries', subtext: 'Matched with approved indents', tone: 'info', code: 'KPI-MAT-01' },
      { label: 'Unapproved Data Override Attempts', value: '0 Violations', subtext: 'Strict RBAC security active', tone: 'success', code: 'KPI-HLT-01' },
    ],
    primaryFocusWidgets: [
      {
        title: 'Audit Trail & Immutable Records Inspection',
        description: 'Read-only historical verification logs',
        items: [
          { label: 'Audit Event #8912 — DPR Quantities Approval', detail: 'Approved by PM Suresh on Aug 25 18:30 • Linked Photo #IMG-9012 • Geo: Padur Site', badge: 'VERIFIED AUDIT', tone: 'success' },
          { label: 'Audit Event #8910 — Goods Receipt Note #GRN-104', detail: 'Logged by Store Officer • 120 cement bags • Supplier: Chennai Ready-Mix', badge: 'VERIFIED AUDIT', tone: 'success' },
        ],
      },
      {
        title: 'Governance & Compliance Verification',
        description: 'Verification of 4 core metric governance principles',
        items: [
          { label: 'Deterministic Reproducibility Check', detail: 'Verified 12 KPI formulas against raw SQL transactional tables', badge: 'PASSED', tone: 'success' },
          { label: 'Approved-State Filter Audit', detail: 'Confirmed unapproved draft DPRs excluded from executive dashboards', badge: 'PASSED', tone: 'success' },
        ],
      },
    ],
  },
};
