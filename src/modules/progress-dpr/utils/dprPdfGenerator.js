import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Generates and downloads a clean white PDF report for a Daily Progress Report (DPR).
 * Pure white background with black/dark neutral text and no blue headers or sign-off section.
 * @param {Object} dpr - The DPR record object.
 */
export function generateDprPdf(dpr) {
  if (!dpr) return;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Clean Neutral Colors (Pure White BG, Black/Dark Neutral Text, Light Gray Borders)
  const blackText = [0, 0, 0];
  const darkTextColor = [33, 37, 41]; // #212529
  const mutedTextColor = [108, 117, 125]; // #6C757D
  const borderColor = [222, 226, 230]; // #DEE2E6
  const headerBg = [245, 245, 245]; // #F5F5F5
  const whiteBg = [255, 255, 255];

  // 1. Top Header Bar (Clean White Background with Black Text)
  doc.setTextColor(...blackText);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text('BUILDTWIN 360', margin, 12);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(...darkTextColor);
  doc.text('DAILY PROGRESS REPORT', pageWidth - margin, 12, { align: 'right' });

  // Divider Line below header
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.4);
  doc.line(margin, 17, pageWidth - margin, 17);

  // 2. Report Overview Box (White Background, Thin Gray Border)
  let currentY = 22;

  doc.setDrawColor(...borderColor);
  doc.setFillColor(...whiteBg);
  doc.roundedRect(margin, currentY, pageWidth - margin * 2, 24, 1, 1, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedTextColor);

  // Column 1
  doc.text('DPR REF ID:', margin + 4, currentY + 7);
  doc.text('REPORT DATE:', margin + 4, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);
  doc.text(String(dpr.id || 'N/A'), margin + 28, currentY + 7);
  doc.text(String(dpr.reportDate || new Date().toISOString().slice(0, 10)), margin + 28, currentY + 16);

  // Column 2
  const col2X = margin + 70;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('PROJECT / SITE:', col2X, currentY + 7);
  doc.text('SUBMITTED BY:', col2X, currentY + 16);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkTextColor);
  doc.text(String(dpr.siteName || 'N/A'), col2X + 28, currentY + 7);
  doc.text(String(dpr.submittedBy || 'Site Engineer'), col2X + 28, currentY + 16);

  // Column 3
  const col3X = pageWidth - margin - 45;
  const statusText = String(dpr.status || 'SUBMITTED').toUpperCase();
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...mutedTextColor);
  doc.text('STATUS:', col3X, currentY + 7);

  doc.setFont('helvetica', 'bold');
  if (statusText === 'APPROVED') {
    doc.setTextColor(22, 163, 74); // Green
  } else {
    doc.setTextColor(...darkTextColor);
  }
  doc.text(statusText, col3X + 16, currentY + 7);

  currentY += 30;

  // 3. Work Summary (White Background Box, Black Heading)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...blackText);
  doc.text('Work Summary', margin, currentY);

  currentY += 3;
  doc.setFillColor(...whiteBg);
  doc.setDrawColor(...borderColor);

  const activityText = dpr.activity?.trim() || 'No summary provided.';
  const splitActivity = doc.splitTextToSize(activityText, pageWidth - margin * 2 - 8);
  const summaryBoxHeight = Math.max(12, splitActivity.length * 5 + 6);

  doc.roundedRect(margin, currentY, pageWidth - margin * 2, summaryBoxHeight, 1, 1, 'FD');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkTextColor);
  doc.text(splitActivity, margin + 4, currentY + 6);

  currentY += summaryBoxHeight + 8;

  // 4. Completed Quantities Table (Neutral Gray/White Header, Black Text)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(...blackText);
  doc.text('Completed Quantities', margin, currentY);

  currentY += 3;

  const quantities = Array.isArray(dpr.quantities) && dpr.quantities.length > 0
    ? dpr.quantities
    : Array.isArray(dpr.quantityEntries) && dpr.quantityEntries.length > 0
    ? dpr.quantityEntries
    : [];

  let tableRows = [];
  if (quantities.length > 0) {
    tableRows = quantities.map((item, index) => [
      String(index + 1),
      item.workDescription || item.item || 'Item',
      item.completedQuantity != null ? String(item.completedQuantity) : '-',
      item.unit || 'm3',
    ]);
  } else if (dpr.qtyCompleted) {
    tableRows = [
      ['1', dpr.activity || 'Completed Work Item', dpr.qtyCompleted, '-'],
    ];
  } else {
    tableRows = [
      ['1', 'General site activity', '1.00', 'Lot'],
    ];
  }

  autoTable(doc, {
    startY: currentY,
    margin: { left: margin, right: margin },
    head: [['#', 'Work Item / Description', 'Completed Qty', 'Unit']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: headerBg,
      textColor: blackText,
      fontStyle: 'bold',
      fontSize: 8.5,
      lineWidth: 0.3,
      lineColor: borderColor,
      cellPadding: 2.5,
    },
    bodyStyles: {
      fontSize: 8.5,
      textColor: darkTextColor,
      lineWidth: 0.3,
      lineColor: borderColor,
      cellPadding: 2.5,
    },
    alternateRowStyles: {
      fillColor: whiteBg,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 'auto' },
      2: { cellWidth: 35, halign: 'right', fontStyle: 'bold' },
      3: { cellWidth: 25, halign: 'center' },
    },
    didDrawPage: (data) => {
      currentY = data.cursor.y;
    },
  });

  currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : currentY + 25;

  // 5. Attached Site Photos & Activity Tagging Evidence Table
  const photos = Array.isArray(dpr.photos) ? dpr.photos : [];
  if (photos.length > 0) {
    if (currentY + 45 > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blackText);
    doc.text(`Site Photo Evidence & Activity Tagging (${photos.length} Photos)`, margin, currentY);

    currentY += 3;

    const photoRows = photos.map((p, idx) => [
      String(idx + 1),
      p.activityTag || 'General Progress',
      p.locationTag || '-',
      p.caption || p.name || 'Photo Evidence',
      p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : 'Today',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Activity Tag', 'Location / Grid', 'Caption & Description', 'Date']],
      body: photoRows,
      theme: 'grid',
      headStyles: {
        fillColor: headerBg,
        textColor: blackText,
        fontStyle: 'bold',
        fontSize: 8.5,
        lineWidth: 0.3,
        lineColor: borderColor,
        cellPadding: 2.5,
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: darkTextColor,
        lineWidth: 0.3,
        lineColor: borderColor,
        cellPadding: 2.5,
      },
      alternateRowStyles: {
        fillColor: whiteBg,
      },
      columnStyles: {
        0: { cellWidth: 10, halign: 'center' },
        1: { cellWidth: 45, fontStyle: 'bold' },
        2: { cellWidth: 30 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 22, halign: 'center' },
      },
      didDrawPage: (data) => {
        currentY = data.cursor.y;
      },
    });

    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : currentY + 25;
  }

  // 6. Remarks & Observations
  if (dpr.remarks?.trim()) {
    if (currentY + 30 > pageHeight - 15) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blackText);
    doc.text('Remarks', margin, currentY);

    currentY += 3;
    doc.setFillColor(...whiteBg);
    doc.setDrawColor(...borderColor);

    const splitRemarks = doc.splitTextToSize(dpr.remarks.trim(), pageWidth - margin * 2 - 8);
    const remarksBoxHeight = Math.max(12, splitRemarks.length * 5 + 6);

    doc.roundedRect(margin, currentY, pageWidth - margin * 2, remarksBoxHeight, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkTextColor);
    doc.text(splitRemarks, margin + 4, currentY + 6);
  }

  // 7. Simple Footer on White Background
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedTextColor);

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text('Daily Progress Report', margin, pageHeight - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Save / Trigger Download
  const cleanSiteName = String(dpr.siteName || 'Site').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
  const fileName = `DPR_${String(dpr.reportDate || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_')}_${cleanSiteName}_${String(dpr.id || 'export')}.pdf`;
  doc.save(fileName);
}
