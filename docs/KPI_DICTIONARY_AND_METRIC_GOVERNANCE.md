# BUILDTWIN 360 — KPI Dictionary & Metric Governance Framework Draft
**Document Version:** 1.0 (Day 1 / Week 1 Foundation Deliverable)  
**Project:** BuildTwin 360 — Construction Progress Intelligence & Digital Site Control Platform  
**Reference Context:** Ashok Builders & Developers, Padur, Chennai  
**Author / Lead:** Data Analyst (Construction Intelligence Lead)  

---

## 1. Executive Overview & Governance Principles

The **BuildTwin 360 Metric Governance Framework** establishes the analytical foundation for site-control and executive decision-making. In accordance with Section 11 of the Project Requirements Specification, all Key Performance Indicators (KPIs) and predictive algorithms must satisfy four non-negotiable governance principles:

1. **Deterministic Reproducibility:** Every KPI is calculated purely from immutable transactional database entries (`dpr_activity_progress`, `stock_ledger`, `labour_daily`, `cost_transactions`, `quality_issues`). No manual spreadsheet overrides or arbitrary ad-hoc adjustments are permitted.
2. **Approved-State Filtering:** Dashboard analytics and risk scores ingest only verified data (e.g., approved DPR quantities, verified Goods Receipt Notes, closed/inspected quality checks).
3. **Baseline Immutability:** Baseline schedules and budgets (`Planned Value`, `BAC`) are frozen upon project status activation. Forecasting algorithms calculate slip and risk without modifying original baseline parameters.
4. **Complete Traceability & Auditability:** Every aggregate metric can be drilled down to site-level evidence (photos, engineer remarks, specific WBS level, floor/zone, or material ledger entry).

---

## 2. Standardized KPI Schema Specification

Every metric in the BuildTwin 360 analytics ecosystem is defined using the standard 8-attribute schema:

| Attribute | Description |
| :--- | :--- |
| **Metric ID & Name** | Unique canonical code (e.g., `KPI-PRG-01`) and standard business name. |
| **Business Purpose** | Operational problem solved and strategic decision enabled. |
| **Mathematical Formula** | Precise algebraic definition reproducible in SQL/Python/Java. |
| **Source Tables & Fields** | Exact transactional entity fields required for calculation. |
| **Refresh Trigger** | Execution frequency (Real-time trigger, Daily DPR batch, 15-min cache). |
| **Exclusions & Edge Cases** | Zero-denominator guards, unapproved draft handling, baseline rules. |
| **Metric Owner** | Role accountable for metric definition and accuracy verification. |
| **Validation Benchmark** | Worked numerical example based on Padur/OMR site sample data. |

---

## 3. Core KPI Dictionary (12 Standardized Models)

### 3.1 KPI-PRG-01: Physical Progress Percentage (%)

* **Metric ID:** `KPI-PRG-01`
* **Metric Name:** Cumulative Physical Progress (%)
* **Business Purpose:** Measures overall physical completion of a project, building, floor, zone, or work package relative to planned quantities.
* **Mathematical Formula:**
  $$\text{Physical Progress \%} = \sum_{i \in \text{Activities}} \left( \min\left(1.0, \frac{\text{Cumulative Approved Qty}_i}{\text{Total Planned Qty}_i}\right) \times \text{Weightage}_i \right) \times 100$$
* **Source Tables & Fields:** `activities.planned_qty`, `activities.weightage`, `dpr_activity_progress.qty_today`, `dpr_headers.status = 'APPROVED'`
* **Refresh Trigger:** Real-time upon DPR Approval; Cached hourly for Executive Dashboard.
* **Exclusions & Edge Cases:** If `Total Planned Qty` = 0 or NULL, activity is excluded from calculation. Unapproved DPR quantities are excluded.
* **Metric Owner:** Project Manager / QS Coordinator.
* **Validation Example (PRJ-001 Padur Residence - Ground Floor):**
  * Column Reinforcement (Weight 0.40): 100% achieved -> 0.40
  * Slab Concreting (Weight 0.60): 50% achieved -> 0.30
  * Total Physical Progress: $(0.40 + 0.30) \times 100 = \mathbf{70.0\%}$.

---

### 3.2 KPI-SCH-01: Schedule Performance Index (SPI)

* **Metric ID:** `KPI-SCH-01`
* **Metric Name:** Schedule Performance Index (SPI)
* **Business Purpose:** Quantifies schedule efficiency. SPI > 1.0 indicates ahead of schedule; SPI < 1.0 indicates project slippage.
* **Mathematical Formula:**
  $$\text{SPI} = \frac{\text{Earned Value (EV)}}{\text{Planned Value (PV)}}$$
* **Source Tables & Fields:** `projects.contract_value`, `activities.planned_start_date`, `activities.planned_end_date`, `dpr_activity_progress`
* **Refresh Trigger:** Daily at 00:00 hrs after end-of-day DPR lock.
* **Exclusions & Edge Cases:** If $PV = 0$, SPI defaults to 1.00.
* **Metric Owner:** Data Analyst / Project Manager.
* **Validation Example (PRJ-002 OMR Commercial Block):**
  * $\text{BAC} = \text{₹50,000,000}$, $\text{PV} = \text{₹15,000,000}$, $\text{EV} = \text{₹12,500,000}$.
  * $\text{SPI} = \frac{12,500,000}{15,000,000} = \mathbf{0.833}$ (Behind Schedule by 16.7%).

---

### 3.3 KPI-SCH-02: Schedule Variance (SV & SV Days)

* **Metric ID:** `KPI-SCH-02`
* **Metric Name:** Schedule Variance (Monetary & Time-based Days)
* **Business Purpose:** Expresses schedule deviation in both financial value and calendar days behind/ahead of baseline.
* **Mathematical Formula:**
  $$\text{SV}_{\text{monetary}} = \text{EV} - \text{PV}$$
  $$\text{SV}_{\text{days}} = \text{Baseline Planned End Date} - \text{Forecast Completion Date}$$
* **Source Tables & Fields:** `activities.planned_end_date`, calculated `EV`, calculated `PV`, analytical `forecast_completion_date`.
* **Refresh Trigger:** Daily analytics job.
* **Exclusions & Edge Cases:** Excludes non-critical path activities when evaluating milestone impact.
* **Metric Owner:** Project Manager.
* **Validation Example (PRJ-001 Padur Residence):**
  * $\text{EV} = \text{₹4,50,000}$, $\text{PV} = \text{₹5,00,000} \implies \text{SV}_{\text{monetary}} = \mathbf{-\text{₹}50,000}$.
  * Baseline Slab Date = Aug 20, 2026; Current Forecast = Aug 26, 2026 $\implies \text{SV}_{\text{days}} = \mathbf{-6\text{ Days}}$.

---

### 3.4 KPI-CST-01: Cost Performance Index (CPI) & Budget Variance

* **Metric ID:** `KPI-CST-01`
* **Metric Name:** Cost Performance Index (CPI)
* **Business Purpose:** Measures financial efficiency of spent capital against physical work delivered.
* **Mathematical Formula:**
  $$\text{CPI} = \frac{\text{Earned Value (EV)}}{\text{Actual Cost (AC)}}$$
* **Source Tables & Fields:** `cost_transactions.amount`, `cost_transactions.source_type`, calculated `EV`.
* **Refresh Trigger:** Real-time on verified cost transaction entry.
* **Exclusions & Edge Cases:** Unverified commitments (draft POs) are tracked under Committed Cost, not Actual Cost.
* **Metric Owner:** Quantity / Cost Coordinator.
* **Validation Example (PRJ-001 Padur Residence):**
  * $\text{EV} = \text{₹4,50,000}$, $\text{AC} = \text{₹4,80,000}$.
  * $\text{CPI} = \frac{4,50,000}{4,80,000} = \mathbf{0.9375}$ (Over budget).

---

### 3.5 KPI-LBR-01: Labour Productivity Index (LPI)

* **Metric ID:** `KPI-LBR-01`
* **Metric Name:** Labour Productivity Index (by Trade & Contractor)
* **Business Purpose:** Evaluates crew work efficiency against benchmark rates.
* **Mathematical Formula:**
  $$\text{Actual Productivity} = \frac{\text{Activity Completed Qty}}{\text{Total Allocated Labour-Hours}}$$
  $$\text{LPI} = \frac{\text{Actual Productivity}}{\text{Benchmark Productivity}} \times 100$$
* **Source Tables & Fields:** `dpr_activity_progress.qty_today`, `labour_daily.headcount`, `labour_activity_allocations.labour_hours`.
* **Refresh Trigger:** Daily upon DPR submission.
* **Exclusions & Edge Cases:** Weather downtime days are excluded from benchmark calculations.
* **Metric Owner:** Site Engineer / Site Supervisor.
* **Validation Example (PRJ-001 Slab Concreting):**
  * Approved Concreting Qty = 12.5 m³. Labour Hours = 50 hours. Actual Productivity = $0.25\text{ m}^3/\text{hr}$.
  * Benchmark = $0.30\text{ m}^3/\text{hr} \implies \text{LPI} = \mathbf{83.33\%}$.

---

### 3.6 KPI-MAT-01: Material Consumption Rate & Depletion Forecast

* **Metric ID:** `KPI-MAT-01`
* **Metric Name:** Rolling Daily Consumption Rate & Stock Depletion Date
* **Business Purpose:** Projects exact calendar date when material inventory will deplete.
* **Mathematical Formula:**
  $$\text{Rolling Daily Consumption Rate } (CR_{7d}) = \frac{\sum_{t=1}^{7} \text{Material Consumed Qty}_t}{7}$$
  $$\text{Days to Depletion} = \frac{\text{Current Usable Stock Balance}}{CR_{7d}}$$
* **Source Tables & Fields:** `stock_ledger.qty`, `stock_ledger.txn_type`, `materials.reorder_level`.
* **Refresh Trigger:** Real-time on `stock_ledger` transaction.
* **Exclusions & Edge Cases:** If $CR_{7d} = 0$, system uses standard planned BOQ rate.
* **Metric Owner:** Procurement / Store Officer.
* **Validation Example (PRJ-001 Cement Stock):**
  * Store Balance = 120 Bags. Rolling Consumption = 30 Bags/day $\implies$ Depletion in 4 Days (Aug 29, 2026).
  * Planned Slab Date = Aug 30, 2026 $\implies$ **ALERT: Stock Shortage before Planned Activity!**

---

### 3.7 KPI-MAT-02: Material Wastage Percentage (%)

* **Metric ID:** `KPI-MAT-02`
* **Metric Name:** Site Material Wastage Variance (%)
* **Business Purpose:** Identifies material loss, theft, or excess scrap at site.
* **Mathematical Formula:**
  $$\text{Wastage \%} = \left( \frac{\text{Total Issued Qty} - \text{Measured Productive Qty} - \text{Usable Balance}}{\text{Total Issued Qty}} \right) \times 100$$
* **Source Tables & Fields:** `stock_ledger`, `material_consumption.qty`, `material_consumption.wastage_qty`.
* **Refresh Trigger:** Weekly material reconciliation.
* **Exclusions & Edge Cases:** Standard scrap allowance subtracted before alert.
* **Metric Owner:** Quantity Surveyor / Site Engineer.
* **Validation Example (PRJ-002 Rebar Steel 12mm):**
  * Issued = 10.0 MT. Measured = 9.4 MT. Store Balance = 0.3 MT $\implies \text{Wastage} = \mathbf{3.0\%}$ (Threshold: 2.5%).

---

### 3.8 KPI-SUP-01: Supplier On-Time Delivery (OTD %)

* **Metric ID:** `KPI-SUP-01`
* **Metric Name:** Supplier Delivery Reliability Rate (%)
* **Business Purpose:** Evaluates supplier compliance with agreed Purchase Order delivery schedules.
* **Mathematical Formula:**
  $$\text{Supplier OTD \%} = \left( \frac{\text{Count of On-Time Goods Receipts (GRN Date} \le \text{PO Due Date)}}{\text{Total Goods Receipts (GRNs)}} \right) \times 100$$
* **Source Tables & Fields:** `purchase_orders.delivery_date`, `grn.created_at`, `grn.accepted_qty`.
* **Refresh Trigger:** Real-time on GRN entry.
* **Metric Owner:** Procurement Lead.
* **Validation Example (Chennai Ready-Mix Concrete Co.):**
  * 9 On-time shipments out of 10 $\implies \text{OTD} = \mathbf{90.0\%}$.

---

### 3.9 KPI-QLT-01: NCR / Quality Defect Ageing & Closure Index

* **Metric ID:** `KPI-QLT-01`
* **Metric Name:** Quality NCR Ageing & Resolution Rate
* **Business Purpose:** Tracks open site quality defects and contractor accountability.
* **Mathematical Formula:**
  $$\text{NCR Ageing Days} = \text{Current Date} - \text{NCR Creation Date} \quad (\text{for Status} \ne \text{'CLOSED'})$$
* **Source Tables & Fields:** `quality_issues.created_at`, `quality_issues.due_date`, `quality_issues.status`.
* **Refresh Trigger:** Daily automated batch execution.
* **Metric Owner:** Quality Engineer.
* **Validation Example (PRJ-001 Padur Residence):**
  * `NCR-042` (Slab Honeycombing) created Aug 15, current date Aug 25 $\implies$ **Ageing: 10 Days** (Overdue by 5 days).

---

### 3.10 KPI-RSK-01: Activity Delay Risk Score (DRS 0–100)

* **Metric ID:** `KPI-RSK-01`
* **Metric Name:** Multi-Factor Activity Delay Risk Score (DRS)
* **Business Purpose:** Predicts activities likely to suffer schedule failure.
* **Mathematical Formula:**
  $$\text{DRS} = (0.35 \times S_{\text{pred}}) + (0.25 \times S_{\text{mat}}) + (0.20 \times S_{\text{lbr}}) + (0.10 \times S_{\text{prod}}) + (0.10 \times S_{\text{qlt}})$$
* **Source Tables & Fields:** `activity_dependencies`, `stock_ledger`, `labour_daily`, `dpr_activity_progress`, `quality_issues`.
* **Refresh Trigger:** Nightly risk analytics engine.
* **Metric Owner:** Data Analyst / Backend Lead.
* **Validation Example (PRJ-001 Slab Concreting ACT-104):**
  * Predecessor slippage + Cement shortage + Low crew productivity + Open NCR $\implies \text{DRS} = \mathbf{72.0/100}$ (**CRITICAL DELAY RISK**).

---

### 3.11 KPI-FCT-01: Forecast Completion Date (FCD)

* **Metric ID:** `KPI-FCT-01`
* **Metric Name:** Earned Rate Forecast Completion Date
* **Business Purpose:** Dynamic statistical forecasting of project finish date.
* **Mathematical Formula:**
  $$\text{Remaining Work Days}_{\text{adj}} = \frac{\text{Baseline Remaining Work Days}}{\text{Rolling 14-Day SPI}}$$
  $$\text{FCD} = \text{Current Date} + \text{Remaining Work Days}_{\text{adj}} + \text{Blocker Delays}$$
* **Source Tables & Fields:** `activities.planned_end_date`, rolling 14-day SPI, active `issues.due_date`.
* **Refresh Trigger:** Weekly analytics job.
* **Metric Owner:** Data Analyst.
* **Validation Example (PRJ-001 Padur Residence):**
  * Baseline Finish = Sept 30 (36 days remaining). Rolling SPI = 0.80. Adjusted = 45 days + 3 days blocker $\implies$ **Forecast Oct 12, 2026** (+12 days slip).

---

### 3.12 KPI-HLT-01: Project Health Index (PHI 0–100)

* **Metric ID:** `KPI-HLT-01`
* **Metric Name:** Composite Project Health Index (PHI)
* **Business Purpose:** Single composite executive score (0–100) summarizing overall project status.
* **Mathematical Formula:**
  $$\text{PHI} = (0.30 \times S_{\text{SPI}}) + (0.25 \times S_{\text{CPI}}) + (0.20 \times (100 - \text{DRS}_{\text{avg}})) + (0.15 \times S_{\text{Quality}}) + (0.10 \times S_{\text{Material}})$$
* **Source Tables & Fields:** Aggregate outputs from SPI, CPI, DRS, Quality, and Material alerts.
* **Refresh Trigger:** Daily Executive Aggregation Service.
* **Health Scale:** 85-100 (Green/Healthy), 70-84 (Amber/Needs Attention), 0-69 (Red/High Risk).
* **Metric Owner:** Data Analyst / Executive Management.
* **Validation Example (PRJ-001 Padur Residence):**
  * $\text{PHI} = 27.0 + 23.44 + 11.00 + 11.25 + 6.00 = \mathbf{78.69 / 100}$ (**AMBER / NEEDS ATTENTION**).
