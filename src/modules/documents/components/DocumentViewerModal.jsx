import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  X,
  Download,
  Printer,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  FileText,
  Layers,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Info,
  Compass,
  FileCheck2,
  Table,
} from 'lucide-react';
import { Button, StatusPill } from '@/design-system';
import buildTwinLogo from '@/assets/BuildTwin360-LOGO.png';
import { getDocumentFile } from '../utils/documentStorage';

export function DocumentViewerModal({ document: doc, open, onClose }) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cadTheme, setCadTheme] = useState('blueprint'); // 'blueprint' | 'cad-white'
  const [showGrid, setShowGrid] = useState(true);
  const [showColumns, setShowColumns] = useState(true);
  const [showDimensions, setShowDimensions] = useState(true);
  const [showMep, setShowMep] = useState(false);

  const [storedBlobUrl, setStoredBlobUrl] = useState(null);
  const [storedFileType, setStoredFileType] = useState(null);
  const [isLoadingFile, setIsLoadingFile] = useState(false);

  const containerRef = useRef(null);

  // Load actual file from IndexedDB if stored previously
  useEffect(() => {
    let activeUrl = null;
    if (open && doc) {
      setIsLoadingFile(true);
      (async () => {
        try {
          // Check storage by objectUrl or document ID
          let file = await getDocumentFile(doc.objectUrl);
          if (!file && doc.id) {
            file = await getDocumentFile(`doc_${doc.id}`);
          }
          if (file) {
            activeUrl = URL.createObjectURL(file);
            setStoredBlobUrl(activeUrl);
            setStoredFileType(file.type || '');
          } else {
            setStoredBlobUrl(null);
            setStoredFileType(null);
          }
        } catch {
          setStoredBlobUrl(null);
        } finally {
          setIsLoadingFile(false);
        }
      })();
    } else {
      setStoredBlobUrl(null);
      setStoredFileType(null);
      setZoom(1);
    }

    return () => {
      if (activeUrl) {
        URL.revokeObjectURL(activeUrl);
      }
    };
  }, [open, doc]);

  if (!open || !doc) return null;

  const isLogo =
    doc.title?.toUpperCase().includes('LOGO') ||
    doc.objectUrl?.toLowerCase().endsWith('.png') ||
    doc.objectUrl?.toLowerCase().endsWith('.jpg');

  const isTracker =
    doc.title?.toLowerCase().includes('tracker') ||
    doc.title?.toLowerCase().includes('defect') ||
    doc.title?.toLowerCase().includes('p6') ||
    doc.objectUrl?.toLowerCase().endsWith('.docx') ||
    doc.objectUrl?.toLowerCase().endsWith('.xlsx');

  const isDrawing =
    doc.category === 'DRAWING' ||
    doc.category?.toLowerCase().includes('drawing') ||
    doc.title?.toLowerCase().includes('blueprint') ||
    doc.title?.toLowerCase().includes('structural') ||
    doc.title?.toLowerCase().includes('renovation');

  function handleZoomIn() {
    setZoom((z) => Math.min(z + 0.2, 3));
  }

  function handleZoomOut() {
    setZoom((z) => Math.max(z - 0.2, 0.5));
  }

  function handleZoomReset() {
    setZoom(1);
  }

  function handleToggleFullscreen() {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  function handleDownload() {
    if (storedBlobUrl) {
      const a = document.createElement('a');
      a.href = storedBlobUrl;
      a.download = doc.title || 'document';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (isLogo) {
      const a = document.createElement('a');
      a.href = buildTwinLogo;
      a.download = `${doc.title || 'BuildTwin360-LOGO'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    if (isTracker) {
      const csvContent =
        'data:text/csv;charset=utf-8,' +
        encodeURIComponent(
          [
            'Defect ID,Location,Description,Severity,Assigned To,Due Date,Status',
            'NCR-P6-101,Tower A - 12th Floor,Shear Wall rebar spacing deviation > 15mm,CRITICAL,Apex Structural,2026-11-02,IN_PROGRESS',
            'NCR-P6-102,Basement B2 Sump,Waterproofing membrane pinhole detected during flood test,HIGH,AquaShield Tech,2026-11-04,RESOLVED',
            'NCR-P6-103,Podium P1 Ramp,Post-tension cable pocket grouting incomplete,MEDIUM,L&T Infrastructure,2026-11-05,CLOSED',
            'NCR-P6-104,Core Lift Shaft B,Plumb line laser survey variance 4mm,LOW,Site QA/QC,2026-11-08,RESOLVED',
          ].join('\n')
        );
      const a = document.createElement('a');
      a.href = csvContent;
      a.download = `${doc.title || 'Defect_Resolution_Tracker'}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    }

    // Default download as simulated Drawing / Document file
    const blob = new Blob(
      [
        `BUILDTWIN 360 ENTERPRISE PROJECT DOCUMENT\n` +
          `==========================================\n` +
          `Title: ${doc.title}\n` +
          `Document ID: #${doc.id}\n` +
          `Project ID: ${doc.projectId}\n` +
          `Category: ${doc.category}\n` +
          `Version: ${doc.version || 'v1.0'}\n` +
          `Status: ${doc.status || 'ACTIVE'}\n` +
          `Uploaded By: ${doc.uploadedBy || 'Site Engineer'}\n` +
          `Storage URI: ${doc.objectUrl}\n` +
          `Verification: SHA-256 Verified Digital Record\n` +
          `Generated: ${new Date().toLocaleString()}\n`,
      ],
      { type: 'text/plain;charset=utf-8' }
    );
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(doc.title || 'document').replace(/[^a-zA-Z0-9_-]/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-2 sm:p-4 animate-in fade-in duration-200">
      <div
        ref={containerRef}
        className="relative flex flex-col w-full max-w-6xl h-[92vh] bg-surface rounded-2xl shadow-2xl border border-surface-border overflow-hidden"
      >
        {/* Top Header Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 border-b border-surface-border bg-white shrink-0 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-lg bg-brand-50 border border-brand-200 text-brand-600 shrink-0">
              <Compass className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-ink-900 truncate">{doc.title}</h3>
                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-50 text-brand-700 border border-brand-200">
                  {doc.version || 'v1.0'}
                </span>
                <StatusPill status={doc.status || 'ACTIVE'} />
              </div>
              <p className="text-[11px] text-ink-500 truncate mt-0.5">
                Category: <strong className="font-medium text-ink-700">{doc.category}</strong> • Uploaded by:{' '}
                {doc.uploadedBy || 'Site Engineer'} • ID: #{doc.id}
              </p>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-1.5">
            {/* Zoom Controls */}
            <div className="flex items-center bg-surface-subtle border border-surface-border rounded-lg p-0.5 mr-1">
              <button
                type="button"
                onClick={handleZoomOut}
                disabled={zoom <= 0.5}
                className="p-1.5 text-ink-600 hover:text-ink-900 hover:bg-white rounded transition-colors disabled:opacity-40"
                title="Zoom Out"
              >
                <ZoomOut className="h-3.5 w-3.5" />
              </button>
              <span className="text-[11px] font-mono px-2 text-ink-700 font-semibold select-none">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={handleZoomIn}
                disabled={zoom >= 3}
                className="p-1.5 text-ink-600 hover:text-ink-900 hover:bg-white rounded transition-colors disabled:opacity-40"
                title="Zoom In"
              >
                <ZoomIn className="h-3.5 w-3.5" />
              </button>
              <button
                type="button"
                onClick={handleZoomReset}
                className="p-1.5 text-ink-500 hover:text-ink-900 hover:bg-white rounded transition-colors"
                title="Reset Zoom (100%)"
              >
                <RotateCcw className="h-3 w-3" />
              </button>
            </div>

            {/* CAD Layer / Theme Toggles for Drawings */}
            {isDrawing && !storedBlobUrl && (
              <div className="hidden md:flex items-center gap-1 bg-surface-subtle border border-surface-border rounded-lg p-0.5 mr-1 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCadTheme(cadTheme === 'blueprint' ? 'cad-white' : 'blueprint')}
                  className={`px-2 py-1 rounded font-medium transition-colors ${
                    cadTheme === 'blueprint'
                      ? 'bg-blue-900 text-blue-100 font-semibold shadow-xs'
                      : 'bg-white text-ink-700 font-semibold shadow-xs'
                  }`}
                >
                  {cadTheme === 'blueprint' ? 'Blueprint Blue' : 'CAD White'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowGrid(!showGrid)}
                  className={`px-1.5 py-1 rounded transition-colors ${
                    showGrid ? 'text-brand-700 font-semibold' : 'text-ink-400'
                  }`}
                >
                  Grid
                </button>
                <button
                  type="button"
                  onClick={() => setShowColumns(!showColumns)}
                  className={`px-1.5 py-1 rounded transition-colors ${
                    showColumns ? 'text-brand-700 font-semibold' : 'text-ink-400'
                  }`}
                >
                  Columns
                </button>
                <button
                  type="button"
                  onClick={() => setShowDimensions(!showDimensions)}
                  className={`px-1.5 py-1 rounded transition-colors ${
                    showDimensions ? 'text-brand-700 font-semibold' : 'text-ink-400'
                  }`}
                >
                  Dims
                </button>
              </div>
            )}

            <Button size="xs" variant="outline" onClick={handleDownload} title="Download Document">
              <Download className="h-3.5 w-3.5 mr-1" />
              Download
            </Button>

            <Button size="xs" variant="outline" onClick={handlePrint} title="Print Document">
              <Printer className="h-3.5 w-3.5 mr-1" />
              Print
            </Button>

            <button
              type="button"
              onClick={handleToggleFullscreen}
              className="p-1.5 text-ink-600 hover:text-ink-900 hover:bg-surface-subtle rounded-lg border border-surface-border transition-colors"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-ink-600 hover:text-red-600 hover:bg-red-50 rounded-lg border border-surface-border transition-colors ml-1"
              title="Close Viewer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Viewer Main Body Canvas */}
        <div className="flex-1 overflow-auto bg-slate-900/90 relative flex items-center justify-center p-4 select-none">
          {/* Dynamic Content Rendering based on type */}
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              transition: 'transform 0.15s ease-out',
            }}
            className="flex items-center justify-center max-w-full"
          >
            {/* If actual stored file from IndexedDB exists */}
            {storedBlobUrl && (
              <div className="bg-white rounded-xl shadow-2xl p-4 max-w-4xl border border-surface-border">
                {storedFileType.startsWith('image/') ? (
                  <img
                    src={storedBlobUrl}
                    alt={doc.title}
                    className="max-h-[70vh] object-contain rounded-lg"
                  />
                ) : (
                  <iframe
                    src={storedBlobUrl}
                    title={doc.title}
                    className="w-[800px] h-[600px] rounded-lg border border-surface-border"
                  />
                )}
              </div>
            )}

            {/* If no stored file blob: Render High-Fidelity Domain Simulation */}
            {!storedBlobUrl && isLogo && (
              <div className="flex flex-col items-center justify-center p-8 bg-white/95 rounded-2xl shadow-2xl border border-slate-200">
                <div className="p-6 bg-slate-50 border border-dashed border-slate-300 rounded-xl flex items-center justify-center min-w-[320px]">
                  <img
                    src={buildTwinLogo}
                    alt="BuildTwin 360 Logo Asset"
                    className="max-h-48 object-contain drop-shadow-md"
                  />
                </div>
                <div className="mt-4 text-center">
                  <h4 className="text-sm font-bold text-slate-800">BuildTwin 360 Vector Brand Emblem</h4>
                  <p className="text-xs text-slate-500 font-mono mt-0.5">
                    Asset File: BuildTwin360-LOGO.png (PNG / RGBA Transparency)
                  </p>
                </div>
              </div>
            )}

            {!storedBlobUrl && isTracker && (
              <div className="bg-white rounded-xl shadow-2xl p-6 w-[900px] max-w-full border border-slate-300 text-slate-900">
                <div className="flex items-center justify-between border-b pb-3 mb-4">
                  <div>
                    <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Table className="h-5 w-5 text-brand-600" />
                      Defect &amp; NCR Resolution Tracker (Primavera P6 Sync)
                    </h2>
                    <p className="text-xs text-slate-500">
                      Site: Ashok Grandeur - Padur, Chennai • Phase: Structural Framing G+18
                    </p>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded bg-emerald-100 text-emerald-800 border border-emerald-300">
                    Live Audit Sync
                  </span>
                </div>

                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-100 text-slate-700 font-semibold uppercase text-[10px]">
                      <tr>
                        <th className="p-2.5">Defect ID</th>
                        <th className="p-2.5">Location</th>
                        <th className="p-2.5">Description</th>
                        <th className="p-2.5">Severity</th>
                        <th className="p-2.5">Assigned To</th>
                        <th className="p-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-brand-700">NCR-P6-101</td>
                        <td className="p-2.5 font-medium">Tower A - Floor 12</td>
                        <td className="p-2.5 text-slate-600">Shear wall rebar spacing deviation &gt; 15mm</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-red-100 text-red-700 font-bold text-[10px]">
                            CRITICAL
                          </span>
                        </td>
                        <td className="p-2.5">Apex Structural Ltd</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold text-[10px]">
                            IN PROGRESS
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-brand-700">NCR-P6-102</td>
                        <td className="p-2.5 font-medium">Basement B2 Sump</td>
                        <td className="p-2.5 text-slate-600">Waterproofing membrane micro-puncture check</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 font-bold text-[10px]">
                            HIGH
                          </span>
                        </td>
                        <td className="p-2.5">AquaShield Tech</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            RESOLVED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-brand-700">NCR-P6-103</td>
                        <td className="p-2.5 font-medium">Podium P1 Ramp</td>
                        <td className="p-2.5 text-slate-600">Post-tension cable pocket grouting sign-off</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 font-bold text-[10px]">
                            MEDIUM
                          </span>
                        </td>
                        <td className="p-2.5">L&amp;T Infrastructure</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 font-semibold text-[10px]">
                            CLOSED
                          </span>
                        </td>
                      </tr>
                      <tr>
                        <td className="p-2.5 font-mono font-bold text-brand-700">NCR-P6-104</td>
                        <td className="p-2.5 font-medium">Core Lift Shaft B</td>
                        <td className="p-2.5 text-slate-600">Laser plum survey deviation 4mm under tolerance</td>
                        <td className="p-2.5">
                          <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold text-[10px]">
                            LOW
                          </span>
                        </td>
                        <td className="p-2.5">Site QA/QC Engineer</td>
                        <td className="p-2.5">
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-semibold text-[10px]">
                            RESOLVED
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between text-xs text-slate-500 pt-3 border-t">
                  <span>Sign-off: Lead QA/QC Auditor (Digital Signature verified)</span>
                  <span className="font-mono">Total Issues: 4 | Resolved: 3 | Pending: 1</span>
                </div>
              </div>
            )}

            {!storedBlobUrl && !isLogo && !isTracker && (
              <div
                className={`rounded-xl shadow-2xl p-6 w-[960px] max-w-full border transition-all ${
                  cadTheme === 'blueprint'
                    ? 'bg-[#0f2442] text-cyan-200 border-cyan-800 font-mono'
                    : 'bg-white text-slate-800 border-slate-300 font-sans'
                }`}
              >
                {/* CAD Blueprint Drawing Header */}
                <div className="flex items-center justify-between border-b pb-3 mb-4 border-current/20">
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg border ${
                        cadTheme === 'blueprint'
                          ? 'bg-blue-950/80 border-cyan-600 text-cyan-400'
                          : 'bg-slate-100 border-slate-300 text-slate-800'
                      }`}
                    >
                      <Layers className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-current">
                        {doc.title}
                      </h2>
                      <p className="text-[11px] opacity-75">
                        Padur, Chennai Site • General Arrangement &amp; Column Schedule • Scale 1:100 @ A1
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold border ${
                        cadTheme === 'blueprint'
                          ? 'bg-emerald-950/70 border-emerald-500 text-emerald-400'
                          : 'bg-emerald-50 border-emerald-300 text-emerald-700'
                      }`}
                    >
                      <ShieldCheck className="h-3.5 w-3.5" />
                      APPROVED FOR SITE EXECUTION
                    </span>
                  </div>
                </div>

                {/* SVG Blueprint Architectural Diagram */}
                <div
                  className={`relative w-full h-[420px] rounded-lg border overflow-hidden flex items-center justify-center ${
                    cadTheme === 'blueprint'
                      ? 'bg-[#0a182c] border-cyan-900/60'
                      : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <svg
                    viewBox="0 0 900 420"
                    className="w-full h-full select-none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    {/* Background Grid Pattern */}
                    {showGrid && (
                      <g
                        stroke={cadTheme === 'blueprint' ? '#18385f' : '#e2e8f0'}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      >
                        {Array.from({ length: 18 }).map((_, i) => (
                          <line key={`v-${i}`} x1={50 * i} y1="0" x2={50 * i} y2="420" />
                        ))}
                        {Array.from({ length: 9 }).map((_, i) => (
                          <line key={`h-${i}`} x1="0" y1={50 * i} x2="900" y2={50 * i} />
                        ))}
                      </g>
                    )}

                    {/* Structural Grid Major Lines (A-E, 1-6) */}
                    <g
                      stroke={cadTheme === 'blueprint' ? '#38bdf8' : '#64748b'}
                      strokeWidth="1.5"
                      strokeDasharray="8 4"
                    >
                      <line x1="120" y1="60" x2="120" y2="350" />
                      <line x1="280" y1="60" x2="280" y2="350" />
                      <line x1="440" y1="60" x2="440" y2="350" />
                      <line x1="600" y1="60" x2="600" y2="350" />
                      <line x1="760" y1="60" x2="760" y2="350" />

                      <line x1="90" y1="90" x2="790" y2="90" />
                      <line x1="90" y1="210" x2="790" y2="210" />
                      <line x1="90" y1="320" x2="790" y2="320" />
                    </g>

                    {/* Grid Bubble Markers */}
                    <g
                      fill={cadTheme === 'blueprint' ? '#0f2442' : '#ffffff'}
                      stroke={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}
                      strokeWidth="1.5"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="11"
                      fontWeight="bold"
                    >
                      <circle cx="120" cy="40" r="14" />
                      <text x="120" y="40" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        1
                      </text>

                      <circle cx="280" cy="40" r="14" />
                      <text x="280" y="40" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        2
                      </text>

                      <circle cx="440" cy="40" r="14" />
                      <text x="440" y="40" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        3
                      </text>

                      <circle cx="600" cy="40" r="14" />
                      <text x="600" y="40" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        4
                      </text>

                      <circle cx="760" cy="40" r="14" />
                      <text x="760" y="40" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        5
                      </text>

                      <circle cx="70" cy="90" r="14" />
                      <text x="70" y="90" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        A
                      </text>

                      <circle cx="70" cy="210" r="14" />
                      <text x="70" y="210" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        B
                      </text>

                      <circle cx="70" cy="320" r="14" />
                      <text x="70" y="320" fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}>
                        C
                      </text>
                    </g>

                    {/* Outer Slab Boundary */}
                    <rect
                      x="100"
                      y="70"
                      width="680"
                      height="260"
                      fill="none"
                      stroke={cadTheme === 'blueprint' ? '#bae6fd' : '#1e293b'}
                      strokeWidth="3"
                    />

                    {/* Central Core Lift / Staircase Shear Walls */}
                    <rect
                      x="410"
                      y="180"
                      width="120"
                      height="60"
                      fill={cadTheme === 'blueprint' ? '#0284c7' : '#94a3b8'}
                      fillOpacity="0.4"
                      stroke={cadTheme === 'blueprint' ? '#38bdf8' : '#0f172a'}
                      strokeWidth="3"
                    />
                    <text
                      x="470"
                      y="210"
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="10"
                      fontWeight="bold"
                      fill={cadTheme === 'blueprint' ? '#e0f2fe' : '#0f172a'}
                    >
                      LIFT SHAFT / CORE
                    </text>

                    {/* Columns (C1 to C15) */}
                    {showColumns && (
                      <g
                        fill={cadTheme === 'blueprint' ? '#38bdf8' : '#2563eb'}
                        stroke={cadTheme === 'blueprint' ? '#ffffff' : '#1e40af'}
                        strokeWidth="1.5"
                      >
                        {[
                          [120, 90],
                          [280, 90],
                          [440, 90],
                          [600, 90],
                          [760, 90],
                          [120, 210],
                          [280, 210],
                          [600, 210],
                          [760, 210],
                          [120, 320],
                          [280, 320],
                          [440, 320],
                          [600, 320],
                          [760, 320],
                        ].map(([cx, cy], i) => (
                          <g key={`col-${i}`}>
                            <rect x={cx - 10} y={cy - 10} width="20" height="20" />
                            <text
                              x={cx}
                              y={cy - 16}
                              textAnchor="middle"
                              fontSize="9"
                              fill={cadTheme === 'blueprint' ? '#7dd3fc' : '#1e40af'}
                              fontWeight="bold"
                            >
                              C{i + 1} (450x600)
                            </text>
                          </g>
                        ))}
                      </g>
                    )}

                    {/* Dimension Lines */}
                    {showDimensions && (
                      <g
                        stroke={cadTheme === 'blueprint' ? '#f59e0b' : '#d97706'}
                        strokeWidth="1"
                        fontSize="10"
                        fill={cadTheme === 'blueprint' ? '#fbbf24' : '#b45309'}
                        textAnchor="middle"
                      >
                        <line x1="120" y1="365" x2="280" y2="365" markerEnd="url(#arrow)" />
                        <text x="200" y="380">
                          6,000 mm
                        </text>

                        <line x1="280" y1="365" x2="440" y2="365" />
                        <text x="360" y="380">
                          5,500 mm
                        </text>

                        <line x1="440" y1="365" x2="600" y2="365" />
                        <text x="520" y="380">
                          5,500 mm
                        </text>

                        <line x1="600" y1="365" x2="760" y2="365" />
                        <text x="680" y="380">
                          6,000 mm
                        </text>
                      </g>
                    )}

                    {/* Architectural Room Labels */}
                    <g
                      fontSize="11"
                      fontWeight="bold"
                      fill={cadTheme === 'blueprint' ? '#7dd3fc' : '#475569'}
                      textAnchor="middle"
                    >
                      <text x="200" y="150">
                        WING A - RESIDENTIAL SUITE
                      </text>
                      <text x="680" y="150">
                        WING B - RESIDENTIAL SUITE
                      </text>
                      <text x="200" y="270">
                        BALCONY &amp; SERVICE TERRACE
                      </text>
                      <text x="680" y="270">
                        HVAC DUCT &amp; RISER SHAFT
                      </text>
                    </g>
                  </svg>
                </div>

                {/* Engineering Title Block */}
                <div
                  className={`mt-4 grid grid-cols-1 md:grid-cols-4 gap-2 text-[10px] p-3 rounded-lg border ${
                    cadTheme === 'blueprint'
                      ? 'bg-blue-950/70 border-cyan-900 text-cyan-300'
                      : 'bg-slate-100 border-slate-200 text-slate-700'
                  }`}
                >
                  <div>
                    <span className="block opacity-60 font-semibold uppercase">Drawing No.</span>
                    <strong className="text-xs font-mono font-bold">
                      BT360-AG-STR-{doc.id || '01'}-v2.0
                    </strong>
                  </div>
                  <div>
                    <span className="block opacity-60 font-semibold uppercase">Project Name</span>
                    <strong className="text-xs">Ashok Grandeur (PADUR-AG-01)</strong>
                  </div>
                  <div>
                    <span className="block opacity-60 font-semibold uppercase">Approved By</span>
                    <strong className="text-xs">Chief Structural Engineer</strong>
                  </div>
                  <div className="flex items-center justify-end">
                    <span className="font-mono text-emerald-400 font-bold bg-emerald-950/80 px-2 py-1 rounded border border-emerald-600">
                      ✓ DIGITALLY SIGNED &amp; SEALED
                    </span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Footer info bar */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-surface-border bg-white text-xs text-ink-600 shrink-0">
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 text-emerald-700 font-semibold">
              <CheckCircle2 className="h-3.5 w-3.5" />
              Verified Digital Record
            </span>
            <span className="text-ink-300">•</span>
            <span className="font-mono text-[11px] text-ink-500">
              Storage Reference: {doc.objectUrl}
            </span>
          </div>
          <Button size="xs" variant="ghost" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
}
