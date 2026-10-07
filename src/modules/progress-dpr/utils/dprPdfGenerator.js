import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

/**
 * Loads an image from any source (Data URL, SVG, Blob, HTTP/HTTPS, or local path)
 * and safely converts it to a standard JPEG base64 data URL with aspect ratio metadata.
 * Times out gracefully after timeoutMs to ensure PDF generation never hangs.
 *
 * @param {string} url - Image preview URL, Blob URL, or data URL
 * @param {number} timeoutMs - Timeout limit in milliseconds
 * @returns {Promise<{ base64: string, width: number, height: number, aspect: number } | null>}
 */
function loadImageAsBase64(url, timeoutMs = 3500) {
  return new Promise((resolve) => {
    if (!url || typeof url !== 'string') {
      return resolve(null);
    }

    const timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);

    const img = new Image();

    // Do NOT set crossOrigin for data: or blob: URLs as it can cause security/loading errors
    if (!url.startsWith('data:') && !url.startsWith('blob:')) {
      img.crossOrigin = 'Anonymous';
    }

    img.onload = () => {
      clearTimeout(timer);
      try {
        const naturalW = img.naturalWidth || img.width || 800;
        const naturalH = img.naturalHeight || img.height || 600;
        const aspect = naturalW / naturalH;

        // Scale down huge images to max 1200px dimension for optimal PDF size and speed
        const maxDim = 1200;
        let targetW = naturalW;
        let targetH = naturalH;
        if (targetW > maxDim || targetH > maxDim) {
          if (targetW > targetH) {
            targetW = maxDim;
            targetH = Math.round(maxDim / aspect);
          } else {
            targetH = maxDim;
            targetW = Math.round(maxDim * aspect);
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = targetW;
        canvas.height = targetH;
        const ctx = canvas.getContext('2d');

        // Fill white background to support SVGs and transparent PNGs cleanly in JPEG
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, targetW, targetH);
        ctx.drawImage(img, 0, 0, targetW, targetH);

        const base64 = canvas.toDataURL('image/jpeg', 0.85);
        resolve({
          base64,
          width: targetW,
          height: targetH,
          aspect: aspect,
        });
      } catch (err) {
        // Fallback: If canvas tainted due to CORS, check if it's already a clean JPEG/PNG data URL
        if (url.startsWith('data:image/jpeg') || url.startsWith('data:image/png')) {
          resolve({
            base64: url,
            width: 800,
            height: 600,
            aspect: 4 / 3,
          });
        } else {
          resolve(null);
        }
      }
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve(null);
    };

    img.src = url;
  });
}

/**
 * Generates and downloads a clean, professional PDF report for a Daily Progress Report (DPR).
 * Embeds full site photo evidence plates with activity tags, timestamps, and locations.
 * @param {Object} dpr - The DPR record object.
 */
export async function generateDprPdf(dpr) {
  if (!dpr) return;

  const rawPhotos = Array.isArray(dpr.photos) ? dpr.photos : [];

  // Pre-load all photo images in parallel before rendering PDF
  const loadedPhotos = await Promise.all(
    rawPhotos.map(async (p, idx) => {
      const src = p.previewUrl || p.url || p.dataUrl || p.src || '';
      let imgData = null;
      if (src) {
        imgData = await loadImageAsBase64(src);
      }
      return {
        ...p,
        imgData,
        index: idx + 1,
      };
    })
  );

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  // Clean Neutral Colors (Pure White BG, Dark Neutral Text, Light Gray Borders)
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
      ['1', dpr.activity || 'Completed Work Item', String(dpr.qtyCompleted), '-'],
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

  // 5. Site Photo Evidence & Activity Tagging (Directly below Completed Quantities)
  const printableWidth = pageWidth - margin * 2; // 182mm

  if (loadedPhotos.length > 0) {
    // If not enough room for photo section header + table, start new page
    if (currentY + 50 > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blackText);
    doc.text(`Site Photo Evidence & Inspection Record (${loadedPhotos.length} Attached ${loadedPhotos.length === 1 ? 'Photo' : 'Photos'})`, margin, currentY);

    currentY += 3;

    // 5A. Tabular Photo Register
    const photoRows = loadedPhotos.map((p, idx) => [
      String(idx + 1),
      p.activityTag || 'General Progress',
      p.locationTag || '-',
      p.caption || p.name || 'Site Photo Evidence',
      p.uploadedAt ? new Date(p.uploadedAt).toLocaleDateString() : 'Today',
    ]);

    autoTable(doc, {
      startY: currentY,
      margin: { left: margin, right: margin },
      head: [['#', 'Activity Tag', 'Location / Grid', 'Caption & Observation', 'Date']],
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
        1: { cellWidth: 42, fontStyle: 'bold' },
        2: { cellWidth: 32 },
        3: { cellWidth: 'auto' },
        4: { cellWidth: 24, halign: 'center' },
      },
      didDrawPage: (data) => {
        currentY = data.cursor.y;
      },
    });

    currentY = doc.lastAutoTable?.finalY ? doc.lastAutoTable.finalY + 8 : currentY + 25;

    // 5B. Embedded Photo Evidence Visual Plates
    if (loadedPhotos.length === 1) {
      // 1 Photo: Centered large showcase plate
      const p = loadedPhotos[0];
      const cardWidth = 124;
      const cardHeight = 82;
      const cardX = margin + (printableWidth - cardWidth) / 2;
      const boxW = cardWidth - 8; // 116mm
      const boxH = 58;

      if (currentY + cardHeight > pageHeight - 16) {
        doc.addPage();
        currentY = 15;
      }

      renderPhotoPlate(doc, p, cardX, currentY, cardWidth, cardHeight, boxW, boxH, borderColor, darkTextColor, mutedTextColor);
      currentY += cardHeight + 8;
    } else {
      // 2 or more photos: 2-Column Grid
      const colGap = 6;
      const cardWidth = (printableWidth - colGap) / 2; // 88mm
      const cardHeight = 72; // 48mm img box + 24mm meta
      const boxW = cardWidth - 6; // 82mm
      const boxH = 46;

      for (let i = 0; i < loadedPhotos.length; i += 2) {
        // Page break check before each row
        if (currentY + cardHeight > pageHeight - 16) {
          doc.addPage();
          currentY = 15;
        }

        // Left column
        const p1 = loadedPhotos[i];
        const x1 = margin;
        renderPhotoPlate(doc, p1, x1, currentY, cardWidth, cardHeight, boxW, boxH, borderColor, darkTextColor, mutedTextColor);

        // Right column (if available)
        if (i + 1 < loadedPhotos.length) {
          const p2 = loadedPhotos[i + 1];
          const x2 = margin + cardWidth + colGap;
          renderPhotoPlate(doc, p2, x2, currentY, cardWidth, cardHeight, boxW, boxH, borderColor, darkTextColor, mutedTextColor);
        }

        currentY += cardHeight + 6;
      }
    }
  } else {
    // 0 Photos attached
    if (currentY + 22 > pageHeight - 20) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blackText);
    doc.text('Site Photo Evidence', margin, currentY);

    currentY += 3;
    doc.setFillColor(...whiteBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, currentY, printableWidth, 12, 1, 1, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(...mutedTextColor);
    doc.text('No photographic evidence was attached to this daily progress report.', margin + 4, currentY + 7);

    currentY += 18;
  }

  // 6. Remarks & Observations (Directly below Site Photo Evidence)
  if (dpr.remarks?.trim()) {
    const splitRemarks = doc.splitTextToSize(dpr.remarks.trim(), printableWidth - 8);
    const remarksBoxHeight = Math.max(14, splitRemarks.length * 5 + 6);

    if (currentY + remarksBoxHeight + 12 > pageHeight - 16) {
      doc.addPage();
      currentY = 15;
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...blackText);
    doc.text('Remarks & Observations', margin, currentY);

    currentY += 3;
    doc.setFillColor(...whiteBg);
    doc.setDrawColor(...borderColor);
    doc.roundedRect(margin, currentY, printableWidth, remarksBoxHeight, 1, 1, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.setTextColor(...darkTextColor);
    doc.text(splitRemarks, margin + 4, currentY + 6);

    currentY += remarksBoxHeight + 8;
  }

  // 7. Footer on Every Page
  const pageCount = doc.internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(...mutedTextColor);

    doc.setDrawColor(...borderColor);
    doc.setLineWidth(0.3);
    doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

    doc.text('BuildTwin 360  ·  Daily Progress Report (DPR)', margin, pageHeight - 5);
    doc.text(`Page ${i} of ${pageCount}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Save / Trigger Download
  const cleanSiteName = String(dpr.siteName || 'Site').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 25);
  const fileName = `DPR_${String(dpr.reportDate || 'Report').replace(/[^a-zA-Z0-9_-]/g, '_')}_${cleanSiteName}_${String(dpr.id || 'export')}.pdf`;
  doc.save(fileName);
}

/**
 * Renders an individual photo plate with image viewport, aspect ratio preservation,
 * activity tag badge, caption, and location/timestamp metadata.
 */
function renderPhotoPlate(doc, photo, x, y, cardWidth, cardHeight, boxW, boxH, borderColor, darkTextColor, mutedTextColor) {
  // Outer Card Frame
  doc.setFillColor(252, 252, 252);
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.roundedRect(x, y, cardWidth, cardHeight, 1.5, 1.5, 'FD');

  // Inner Image Viewport Box
  const boxX = x + (cardWidth - boxW) / 2;
  const boxY = y + 3;
  doc.setFillColor(245, 247, 250);
  doc.setDrawColor(226, 232, 240);
  doc.setLineWidth(0.2);
  doc.rect(boxX, boxY, boxW, boxH, 'FD');

  // Render Image inside Viewport with Aspect Ratio Preservation
  if (photo.imgData?.base64) {
    try {
      const boxAspect = boxW / boxH;
      const imgAspect = photo.imgData.aspect || 4 / 3;

      let renderW = boxW;
      let renderH = boxH;
      if (imgAspect > boxAspect) {
        // Image is wider than box -> fit width, shrink height
        renderW = boxW;
        renderH = boxW / imgAspect;
      } else {
        // Image is taller than box -> fit height, shrink width
        renderH = boxH;
        renderW = boxH * imgAspect;
      }

      const renderX = boxX + (boxW - renderW) / 2;
      const renderY = boxY + (boxH - renderH) / 2;

      doc.addImage(photo.imgData.base64, 'JPEG', renderX, renderY, renderW, renderH, undefined, 'FAST');
    } catch (err) {
      renderImageFallback(doc, boxX, boxY, boxW, boxH, mutedTextColor);
    }
  } else {
    renderImageFallback(doc, boxX, boxY, boxW, boxH, mutedTextColor);
  }

  // Metadata Area below image
  let metaY = boxY + boxH + 4;

  // 1. Photo Index & Activity Tag Badge
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(37, 99, 235); // Brand Blue #2563EB
  const tagText = `Photo #${photo.index}: ${photo.activityTag || 'General Progress'}`;
  const splitTag = doc.splitTextToSize(tagText, cardWidth - 8);
  doc.text(splitTag[0] || '', x + 4, metaY);

  // 2. Caption
  metaY += 4.2;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...darkTextColor);
  const captionText = photo.caption || photo.name || 'Verified Site Photo';
  const splitCaption = doc.splitTextToSize(captionText, cardWidth - 8);
  doc.text(splitCaption[0] || '', x + 4, metaY);

  // 3. Location, Date & Filename subline
  metaY += 4.2;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(...mutedTextColor);
  const locStr = photo.locationTag ? `Grid: ${photo.locationTag}` : '';
  const dateStr = photo.uploadedAt ? new Date(photo.uploadedAt).toLocaleDateString() : '';
  const fileStr = photo.name && !photo.name.startsWith('data:') ? photo.name : '';
  const subLine = [locStr, dateStr, fileStr].filter(Boolean).join('  ·  ') || 'Site Evidence Verified';
  const splitSub = doc.splitTextToSize(subLine, cardWidth - 8);
  doc.text(splitSub[0] || '', x + 4, metaY);
}

/**
 * Fallback display if an image cannot be previewed or failed loading
 */
function renderImageFallback(doc, boxX, boxY, boxW, boxH, mutedTextColor) {
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.setTextColor(...mutedTextColor);
  doc.text('[ Photo Evidence Attached ]', boxX + boxW / 2, boxY + boxH / 2 - 1, { align: 'center' });
  doc.setFontSize(6.5);
  doc.text('Preview unavailable in PDF export', boxX + boxW / 2, boxY + boxH / 2 + 3.5, { align: 'center' });
}
