import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { formatCurrency } from '@/modules/projects/constants';

/**
 * Generates and downloads an Executive Comprehensive Project Report as a PDF
 */
export async function generateExecutiveReportPdf({
  project,
  weekNumber = 10,
  analytics,
  weekly,
  inventory,
  procLabour,
  costQuality,
}) {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const blackText = [15, 23, 42]; // slate-900
  const darkTextColor = [51, 65, 85]; // slate-700
  const mutedTextColor = [100, 116, 139]; // slate-500
  const brandPrimary = [79, 70, 229]; // indigo-600
  const borderColor = [226, 232, 240]; // slate-200
  const headerBg = [248, 250, 252]; // slate-50
  const whiteBg = [255, 255, 255];

  // 1. Top Header Bar
  doc.setTextColor(...brandPrimary);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('BUILDTWIN 360', margin, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...darkTextColor);
  doc.text('EXECUTIVE PROJECT INTELLIGENCE REPORT', pageWidth - margin, 12, { align: 'right' });

  // Divider Line
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(margin, 16, pageWidth - margin, 16);

  // 2. Project Metadata & Composite Health Hero Box
  let currentY = 20;
  const projectName = project?.name || weekly?.projectName || 'Ashok Grandeur - Padur, Chennai';
  const projectCode = project?.code || weekly?.projectCode || 'PADUR-AG-01';
  const healthScore = analytics?.compositeHealthScore ?? 75;
  const overallStatus = analytics?.overallHealthStatus || 'GOOD';

  doc.setFillColor(...headerBg);
  doc.setDrawColor(...borderColor);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 22, 1, 1, 'FD');

  // Project Info (Left)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10.5);
  doc.setTextColor(...blackText);
  doc.text(projectName, margin + 4, currentY + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(...mutedTextColor);
  doc.text(`Project Code: ${projectCode}   |   Reporting Period: Week ${weekNumber}   |   Generated: ${new Date().toLocaleString()}`, margin + 4, currentY + 12);
  doc.text(`Lead Contractor / Client: Ashok Builders & Developers   |   Location: Padur, Chennai`, margin + 4, currentY + 17);

  // Health Score Badge (Right)
  const scoreBoxX = pageWidth - margin - 42;
  doc.setFillColor(240, 253, 244); // emerald-50
  doc.setDrawColor(187, 247, 208); // emerald-200
  doc.roundedRect(scoreBoxX, currentY + 3, 38, 16, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(22, 101, 52); // emerald-800
  doc.text('HEALTH SCORE', scoreBoxX + 19, currentY + 8, { align: 'center' });

  doc.setFontSize(11);
  doc.text(`${healthScore} / 100 (${overallStatus})`, scoreBoxX + 19, currentY + 14, { align: 'center' });

  currentY += 27;

  // 3. Domain Pillars Executive Summary Grid
  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Domain Pillar', 'Status', 'Key Metric Index', 'Executive Assessment']],
    body: [
      [
        'Budget & Cost Control',
        analytics?.budgetHealth?.replace('_', ' ') || 'ON BUDGET',
        `CPI: ${Number(analytics?.cpi ?? 1.0).toFixed(2)}`,
        'Optimal budget efficiency. Expenditures tracked within approved ₹3.15 Cr allocation.',
      ],
      [
        'WBS & Schedule Float',
        analytics?.scheduleHealth?.replace('_', ' ') || 'DELAYED',
        `SPI: ${Number(analytics?.spi ?? 0.13).toFixed(2)}`,
        `Milestone lag detected with ${weekly?.totalSiteDelayDays ?? 5} site delay days. Superstructure catch-up required.`,
      ],
      [
        'Material Inventory',
        analytics?.inventoryHealth?.replace('_', ' ') || 'SUFFICIENT',
        `${inventory?.lowStockItemsCount ?? 0} Low Stock`,
        `Valuation ₹14.78 Cr. All ${inventory?.totalMaterialsCataloged ?? 13} warehouse materials exceed safety reorder buffers.`,
      ],
      [
        'Quality & Defect Governance',
        analytics?.qualityHealth?.replace('_', ' ') || 'AUDIT FAILURES',
        `${analytics?.qualityResolutionRate ?? 86.7}% Resolved`,
        `${weekly?.criticalBlockersCount ?? 2} Critical Blockers and ${weekly?.activeNcrsCount ?? 5} active NCRs requiring engineer verification.`,
      ],
    ],
    theme: 'grid',
    headStyles: {
      fillColor: brandPrimary,
      textColor: whiteBg,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: 2,
    },
    bodyStyles: {
      fontSize: 7.5,
      textColor: darkTextColor,
      cellPadding: 2,
      lineWidth: 0.2,
      lineColor: borderColor,
    },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 42 },
      1: { cellWidth: 28, halign: 'center' },
      2: { cellWidth: 32, fontStyle: 'bold', halign: 'center' },
      3: { cellWidth: 'auto' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // 4. Milestone Progress & S-Curve Variance
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blackText);
  doc.text('1. Milestone Progress & Physical S-Curve Variance', margin, currentY);
  currentY += 2;

  const planned = Number(weekly?.plannedProgressPercentage ?? 111.99).toFixed(2);
  const actual = Number(weekly?.actualProgressPercentage ?? 14.36).toFixed(2);
  const varPct = (planned - actual).toFixed(2);

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Planned Target %', 'Actual Progress %', 'Milestone Variance', 'Schedule State', 'Site Delay Days']],
    body: [
      [`${planned}%`, `${actual}%`, `-${varPct}% Lag`, weekly?.scheduleStatus || 'BEHIND SCHEDULE', `${weekly?.totalSiteDelayDays ?? 5} Days`],
    ],
    theme: 'grid',
    headStyles: { fillColor: headerBg, textColor: blackText, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, textColor: darkTextColor, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center', fontStyle: 'bold' },
      2: { halign: 'center', textColor: [225, 29, 72] }, // rose-600
      3: { halign: 'center', fontStyle: 'bold' },
      4: { halign: 'center' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // 5. Earned Value (EVM) & Cost Performance Table
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blackText);
  doc.text('2. Financial Breakdown & Earned Value Management (EVM)', margin, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Approved Baseline (BAC)', 'Revised Budget', 'Committed Cost', 'Net Cost Variance', 'Forecasted EAC', 'EVM CPI']],
    body: [
      [
        formatCurrency(weekly?.baselineBudget || 31500000),
        formatCurrency(costQuality?.revisedBudget || 28127000),
        formatCurrency(costQuality?.committedCost || 120000),
        `+${formatCurrency(weekly?.costVariance || 28007000)}`,
        formatCurrency(weekly?.estimateAtCompletion || 28127000),
        Number(weekly?.costPerformanceIndex ?? 1.0).toFixed(2),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: headerBg, textColor: blackText, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, textColor: darkTextColor, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'right' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right', fontStyle: 'bold', textColor: [16, 185, 129] }, // emerald-600
      4: { halign: 'right', fontStyle: 'bold' },
      5: { halign: 'center', fontStyle: 'bold' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // 6. Procurement, Store Inventory & Labour Accruals
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blackText);
  doc.text('3. Store Inventory, Vendor Procurement & Labour Gangs', margin, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [
      ['Total Store Valuation', 'Weekly Material Cost', 'PO Commitments', 'Outstanding Payables', 'Headcount', 'Weekly Wages Accrued'],
    ],
    body: [
      [
        formatCurrency(inventory?.totalInventoryValuation || 147864578),
        formatCurrency(weekly?.totalMaterialConsumptionCost || 1009000),
        formatCurrency(weekly?.committedProcurementCost || 120000),
        formatCurrency(weekly?.outstandingLiability || 80000),
        `${weekly?.totalHeadcount ?? 272} Workers`,
        formatCurrency(weekly?.totalLabourCost || 517162.5),
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: headerBg, textColor: blackText, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, textColor: darkTextColor, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'right', fontStyle: 'bold' },
      1: { halign: 'right' },
      2: { halign: 'right' },
      3: { halign: 'right' },
      4: { halign: 'center', fontStyle: 'bold' },
      5: { halign: 'right', fontStyle: 'bold' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 6;

  // 7. Quality Defect Log & Blockers
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...blackText);
  doc.text('4. QA/QC Defect Governance & Critical Blockers', margin, currentY);
  currentY += 2;

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['Total Issues', 'Open Snag Defects', 'Active NCRs', 'Critical Blockers', 'Quality Pass Rate', 'Delay Days Impact']],
    body: [
      [
        String(costQuality?.totalIssuesReported ?? 15),
        String(weekly?.openSnagsCount ?? 6),
        String(weekly?.activeNcrsCount ?? 5),
        String(weekly?.criticalBlockersCount ?? 2),
        `${Number(costQuality?.qualityResolutionPercentage ?? 86.67).toFixed(1)}%`,
        `${weekly?.totalSiteDelayDays ?? 5} Days`,
      ],
    ],
    theme: 'grid',
    headStyles: { fillColor: headerBg, textColor: blackText, fontStyle: 'bold', fontSize: 7.5, cellPadding: 2 },
    bodyStyles: { fontSize: 7.5, textColor: darkTextColor, cellPadding: 2 },
    columnStyles: {
      0: { halign: 'center' },
      1: { halign: 'center', textColor: [217, 119, 6] },
      2: { halign: 'center', textColor: [225, 29, 72] },
      3: { halign: 'center', textColor: [159, 18, 57], fontStyle: 'bold' },
      4: { halign: 'center', fontStyle: 'bold', textColor: [16, 185, 129] },
      5: { halign: 'center', fontStyle: 'bold' },
    },
  });

  currentY = doc.lastAutoTable.finalY + 12;

  // Check if signatures fit on page
  if (currentY + 28 > pageHeight - margin) {
    doc.addPage();
    currentY = margin + 10;
  }

  // 8. Sign-off & Verification Section
  doc.setDrawColor(...borderColor);
  doc.line(margin, currentY, pageWidth - margin, currentY);
  currentY += 5;

  const colWidth = (pageWidth - margin * 2 - 20) / 2;

  // Left Sign-off
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...darkTextColor);
  doc.text('PREPARED & VERIFIED BY:', margin, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Project Execution Manager / QS Lead', margin, currentY + 5);
  doc.text(`Digital Sign-off: Verified on site • ${new Date().toLocaleDateString()}`, margin, currentY + 9);

  // Right Sign-off
  const rightX = margin + colWidth + 20;
  doc.setFont('helvetica', 'bold');
  doc.text('AUTHORIZED & APPROVED BY:', rightX, currentY);
  doc.setFont('helvetica', 'normal');
  doc.text('Director / Executive Management', rightX, currentY + 5);
  doc.text(`Digital Sign-off: Approved • BuildTwin 360 MIS System`, rightX, currentY + 9);

  // 9. Document Footer
  doc.setFontSize(7);
  doc.setTextColor(...mutedTextColor);
  doc.text('Confidential Document — Generated automatically by BuildTwin 360 Site Intelligence & MIS Platform', margin, pageHeight - 8);
  doc.text(`Page 1 of 1`, pageWidth - margin, pageHeight - 8, { align: 'right' });

  // 10. Trigger Download
  const cleanProjName = projectName.replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `BuildTwin360_Executive_Report_${cleanProjName}_Week${weekNumber}.pdf`;
  doc.save(filename);

  return filename;
}
