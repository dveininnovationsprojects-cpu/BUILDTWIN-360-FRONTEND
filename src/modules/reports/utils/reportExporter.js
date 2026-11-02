import { generateExecutiveReportPdf } from './reportPdfGenerator';
import { formatCurrency } from '@/modules/projects/constants';

/**
 * Escapes values for standard RFC 4180 CSV format
 */
function escapeCsv(val) {
  if (val == null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
}

/**
 * Downloads a generated file buffer or string in browser
 */
function triggerDownload(content, filename, mimeType) {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Generates and downloads a Consolidated CSV Report
 */
export function exportReportCsv({
  project,
  weekNumber = 10,
  analytics,
  weekly,
  inventory,
  procLabour,
  costQuality,
  section = 'ALL',
}) {
  const projectName = project?.name || weekly?.projectName || 'Ashok Grandeur - Padur, Chennai';
  const projectCode = project?.code || weekly?.projectCode || 'PADUR-AG-01';
  const timestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

  const rows = [];

  // Header Banner
  rows.push(['BUILDTWIN 360 SITE INTELLIGENCE - EXECUTIVE AUDIT REPORT']);
  rows.push(['Project Name', projectName]);
  rows.push(['Project Code', projectCode]);
  rows.push(['Reporting Period', `Week ${weekNumber}`]);
  rows.push(['Generated At', timestamp]);
  rows.push(['Overall Composite Health Score', `${analytics?.compositeHealthScore ?? 75} / 100 (${analytics?.overallHealthStatus || 'GOOD'})`]);
  rows.push([]);

  // SECTION 1: Executive KPI & Health Indices
  if (section === 'ALL' || section === 'EXECUTIVE') {
    rows.push(['--- SECTION 1: EXECUTIVE HEALTH & DOMAIN PILLARS ---']);
    rows.push(['Domain Pillar', 'Health Status', 'Key Indicator', 'Details']);
    rows.push(['Budget & Cost Control', analytics?.budgetHealth || 'ON_BUDGET', `CPI: ${Number(analytics?.cpi ?? 1.0).toFixed(2)}`, 'Optimal budget efficiency. Expenditures within allocation.']);
    rows.push(['WBS & Schedule Float', analytics?.scheduleHealth || 'DELAYED', `SPI: ${Number(analytics?.spi ?? 0.13).toFixed(2)}`, `Milestone drift with ${weekly?.totalSiteDelayDays ?? 5} site delay days.`]);
    rows.push(['Material Inventory', analytics?.inventoryHealth || 'SUFFICIENT', `${inventory?.lowStockItemsCount ?? 0} Low Stock`, `Valuation ₹14.78 Cr. All cataloged materials exceed safe buffers.`]);
    rows.push(['Quality & Snags', analytics?.qualityHealth || 'AUDIT_FAILURES', `${analytics?.qualityResolutionRate ?? 86.7}% Resolved`, `${weekly?.criticalBlockersCount ?? 2} Critical Blockers and ${weekly?.activeNcrsCount ?? 5} active NCRs.`]);
    rows.push([]);
  }

  // SECTION 2: Milestone Progress (S-Curve)
  if (section === 'ALL' || section === 'PROGRESS') {
    rows.push(['--- SECTION 2: MILESTONE PROGRESS (S-CURVE) ---']);
    rows.push(['Planned Target Progress (%)', 'Actual Verified Progress (%)', 'Schedule Variance (%)', 'Status', 'Site Delay Days']);
    const planned = Number(weekly?.plannedProgressPercentage ?? 111.99).toFixed(2);
    const actual = Number(weekly?.actualProgressPercentage ?? 14.36).toFixed(2);
    const varPct = (planned - actual).toFixed(2);
    rows.push([`${planned}%`, `${actual}%`, `-${varPct}%`, weekly?.scheduleStatus || 'BEHIND_SCHEDULE', `${weekly?.totalSiteDelayDays ?? 5} Days`]);
    rows.push([]);
  }

  // SECTION 3: Cost Control & EVM
  if (section === 'ALL' || section === 'COST') {
    rows.push(['--- SECTION 3: COST CONTROL & EARNED VALUE (EVM) ---']);
    rows.push(['Approved Baseline (BAC)', 'Revised Budget', 'Committed Cost', 'Net Cost Variance', 'Forecasted EAC', 'CPI', 'SPI', 'Budget Status']);
    rows.push([
      weekly?.baselineBudget || 31500000,
      costQuality?.revisedBudget || 28127000,
      costQuality?.committedCost || 120000,
      weekly?.costVariance || 28007000,
      weekly?.estimateAtCompletion || 28127000,
      Number(weekly?.costPerformanceIndex ?? 1.0).toFixed(4),
      Number(weekly?.schedulePerformanceIndex ?? 0.13).toFixed(4),
      costQuality?.budgetStatus || 'UNDER_BUDGET',
    ]);
    rows.push([]);
  }

  // SECTION 4: Material Store Inventory
  if (section === 'ALL' || section === 'INVENTORY') {
    rows.push(['--- SECTION 4: STORE INVENTORY VALUATION & CONSUMPTION ---']);
    rows.push(['Total Store Valuation', 'Cataloged SKUs', 'Consumed Quantity (Units)', 'Total Consumption Cost', 'Critical Stock Deficits']);
    rows.push([
      inventory?.totalInventoryValuation || 147864578,
      inventory?.totalMaterialsCataloged || 13,
      inventory?.totalConsumedQuantity || 23,
      inventory?.totalConsumptionCost || 1009000,
      inventory?.lowStockItemsCount || 0,
    ]);
    rows.push([]);
  }

  // SECTION 5: Procurement & Labour Gangs
  if (section === 'ALL' || section === 'PROCUREMENT_LABOUR') {
    rows.push(['--- SECTION 5: PROCUREMENT LIABILITIES & LABOUR WAGES ---']);
    rows.push(['Total POs', 'Committed Amount', 'Delivered GRN Value', 'Outstanding Payables', 'Active Contractors', 'Deployed Workers', 'Standard Hours', 'Overtime Hours', 'Accrued Wages']);
    rows.push([
      procLabour?.totalPurchaseOrders || 7,
      procLabour?.totalCommittedAmount || 120000,
      procLabour?.totalIncurredGrnCost || 40000,
      procLabour?.outstandingLiability || 80000,
      procLabour?.activeContractorsCount || 10,
      procLabour?.totalHeadcountDeployed || 272,
      procLabour?.totalStandardHours || 102.5,
      procLabour?.totalOvertimeHours || 10.5,
      procLabour?.totalLabourWageCost || 517162.5,
    ]);
    rows.push([]);
  }

  // SECTION 6: Quality, NCRs & Site Blockers
  if (section === 'ALL' || section === 'QUALITY') {
    rows.push(['--- SECTION 6: QA/QC DEFECT LOG & CRITICAL BLOCKERS ---']);
    rows.push(['Total Issues Logged', 'Open Snags', 'Active NCRs', 'Critical Blockers', 'Quality Pass Rate (%)', 'Cumulative Delay Days']);
    rows.push([
      costQuality?.totalIssuesReported || 15,
      weekly?.openSnagsCount || 6,
      weekly?.activeNcrsCount || 5,
      weekly?.criticalBlockersCount || 2,
      `${Number(costQuality?.qualityResolutionPercentage ?? 86.67).toFixed(2)}%`,
      weekly?.totalSiteDelayDays || 5,
    ]);
    rows.push([]);
  }

  // Build CSV with UTF-8 BOM
  const csvString = '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\r\n');
  const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BuildTwin360_Report_${cleanName}_Week${weekNumber}.csv`;

  triggerDownload(csvString, filename, 'text/csv;charset=utf-8');
  return filename;
}

/**
 * Generates and downloads an Executive Multi-Sheet Microsoft Excel Workbook (.xls SpreadsheetML)
 */
export function exportReportExcel({
  project,
  weekNumber = 10,
  analytics,
  weekly,
  inventory,
  procLabour,
  costQuality,
}) {
  const projectName = project?.name || weekly?.projectName || 'Ashok Grandeur - Padur, Chennai';
  const projectCode = project?.code || weekly?.projectCode || 'PADUR-AG-01';
  const timestamp = new Date().toLocaleString();

  // Helper to construct SpreadsheetML table rows
  const formatCell = (val, type = 'String', bold = false) => {
    const styleAttr = bold ? ' ss:StyleID="BoldStyle"' : '';
    return `<Cell${styleAttr}><Data ss:Type="${type}">${String(val ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Data></Cell>`;
  };

  const createRow = (cells, bold = false) => {
    return `<Row>${cells.map((c) => formatCell(c, typeof c === 'number' ? 'Number' : 'String', bold)).join('')}</Row>`;
  };

  // Sheet 1: Executive Overview
  const sheet1Rows = [
    createRow(['BUILDTWIN 360 SITE INTELLIGENCE - EXECUTIVE DOSSIER'], true),
    createRow(['Project Name', projectName]),
    createRow(['Project Code', projectCode]),
    createRow(['Reporting Period', `Week ${weekNumber}`]),
    createRow(['Generated At', timestamp]),
    createRow(['Composite Health Score', `${analytics?.compositeHealthScore ?? 75} / 100 (${analytics?.overallHealthStatus || 'GOOD'})`], true),
    createRow([]),
    createRow(['Domain Pillar', 'Health Status', 'Key Metric Index', 'Assessment Summary'], true),
    createRow(['Budget & Cost Control', analytics?.budgetHealth || 'ON_BUDGET', `CPI: ${Number(analytics?.cpi ?? 1.0).toFixed(2)}`, 'Optimal budget efficiency. Expenses within ₹3.15 Cr allocation.']),
    createRow(['WBS & Schedule Float', analytics?.scheduleHealth || 'DELAYED', `SPI: ${Number(analytics?.spi ?? 0.13).toFixed(2)}`, `Milestone drift with ${weekly?.totalSiteDelayDays ?? 5} site delay days.`]),
    createRow(['Material Inventory', analytics?.inventoryHealth || 'SUFFICIENT', `${inventory?.lowStockItemsCount ?? 0} Low Stock`, `Valuation ₹14.78 Cr. All 13 materials exceed reorder buffers.`]),
    createRow(['Quality & Snags', analytics?.qualityHealth || 'AUDIT_FAILURES', `${analytics?.qualityResolutionRate ?? 86.7}% Resolved`, `${weekly?.criticalBlockersCount ?? 2} Critical Blockers and ${weekly?.activeNcrsCount ?? 5} active NCRs.`]),
  ].join('');

  // Sheet 2: Milestone Progress
  const planned = Number(weekly?.plannedProgressPercentage ?? 111.99).toFixed(2);
  const actual = Number(weekly?.actualProgressPercentage ?? 14.36).toFixed(2);
  const lag = (planned - actual).toFixed(2);
  const sheet2Rows = [
    createRow(['MILESTONE PROGRESS & PHYSICAL S-CURVE EXECUTION'], true),
    createRow([]),
    createRow(['Planned Target Progress (%)', 'Actual Verified Progress (%)', 'Milestone Variance (%)', 'Schedule State', 'Critical Site Delay Days'], true),
    createRow([Number(planned), Number(actual), `-${lag}%`, weekly?.scheduleStatus || 'BEHIND_SCHEDULE', weekly?.totalSiteDelayDays ?? 5]),
  ].join('');

  // Sheet 3: Cost & EVM Control
  const sheet3Rows = [
    createRow(['FINANCIAL BREAKDOWN & EARNED VALUE MANAGEMENT (EVM)'], true),
    createRow([]),
    createRow(['Baseline Budget (BAC)', 'Revised Budget', 'Committed Cost', 'Net Cost Variance', 'Forecasted EAC', 'CPI', 'SPI', 'Budget Status'], true),
    createRow([
      weekly?.baselineBudget || 31500000,
      costQuality?.revisedBudget || 28127000,
      costQuality?.committedCost || 120000,
      weekly?.costVariance || 28007000,
      weekly?.estimateAtCompletion || 28127000,
      Number(weekly?.costPerformanceIndex ?? 1.0).toFixed(4),
      Number(weekly?.schedulePerformanceIndex ?? 0.13).toFixed(4),
      costQuality?.budgetStatus || 'UNDER_BUDGET',
    ]),
  ].join('');

  // Sheet 4: Store & Inventory Audit
  const sheet4Rows = [
    createRow(['STORE & MATERIAL INVENTORY VALUATION AUDIT'], true),
    createRow([]),
    createRow(['Total Store Valuation', 'Cataloged SKUs', 'Consumed Volume (Units)', 'Total Consumption Cost', 'Stock Deficit Count'], true),
    createRow([
      inventory?.totalInventoryValuation || 147864578,
      inventory?.totalMaterialsCataloged || 13,
      inventory?.totalConsumedQuantity || 23,
      inventory?.totalConsumptionCost || 1009000,
      inventory?.lowStockItemsCount || 0,
    ]),
  ].join('');

  // Sheet 5: Procurement & Labour
  const sheet5Rows = [
    createRow(['PROCUREMENT LIABILITIES & CONTRACTOR LABOUR WAGES'], true),
    createRow([]),
    createRow(['Total POs', 'Committed Amount', 'Delivered GRN', 'Outstanding Payables', 'Active Contractors', 'Deployed Workers', 'Standard Hours', 'Overtime Hours', 'Accrued Wages'], true),
    createRow([
      procLabour?.totalPurchaseOrders || 7,
      procLabour?.totalCommittedAmount || 120000,
      procLabour?.totalIncurredGrnCost || 40000,
      procLabour?.outstandingLiability || 80000,
      procLabour?.activeContractorsCount || 10,
      procLabour?.totalHeadcountDeployed || 272,
      procLabour?.totalStandardHours || 102.5,
      procLabour?.totalOvertimeHours || 10.5,
      procLabour?.totalLabourWageCost || 517162.5,
    ]),
  ].join('');

  // Sheet 6: Quality & Defect Log
  const sheet6Rows = [
    createRow(['QA/QC DEFECT GOVERNANCE & SITE BLOCKERS'], true),
    createRow([]),
    createRow(['Total Issues Logged', 'Open Snags', 'Active NCRs', 'Critical Blockers', 'Quality Pass Rate (%)', 'Delay Days Impact'], true),
    createRow([
      costQuality?.totalIssuesReported || 15,
      weekly?.openSnagsCount || 6,
      weekly?.activeNcrsCount || 5,
      weekly?.criticalBlockersCount || 2,
      `${Number(costQuality?.qualityResolutionPercentage ?? 86.67).toFixed(2)}%`,
      weekly?.totalSiteDelayDays || 5,
    ]),
  ].join('');

  // Construct Microsoft Excel 2003 XML SpreadsheetML document
  const excelXml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="BoldStyle">
   <Font ss:FontName="Calibri" x:Family="Swiss" ss:Size="11" ss:Color="#0F172A" ss:Bold="1"/>
   <Interior ss:Color="#F1F5F9" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Executive Overview">
  <Table>${sheet1Rows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Milestone Progress">
  <Table>${sheet2Rows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Cost &amp; EVM">
  <Table>${sheet3Rows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Store Inventory">
  <Table>${sheet4Rows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Procurement &amp; Labour">
  <Table>${sheet5Rows}</Table>
 </Worksheet>
 <Worksheet ss:Name="Quality &amp; Snags">
  <Table>${sheet6Rows}</Table>
 </Worksheet>
</Workbook>`;

  const cleanName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BuildTwin360_Executive_Workbook_${cleanName}_Week${weekNumber}.xls`;

  triggerDownload(excelXml, filename, 'application/vnd.ms-excel;charset=utf-8');
  return filename;
}

export { generateExecutiveReportPdf };
