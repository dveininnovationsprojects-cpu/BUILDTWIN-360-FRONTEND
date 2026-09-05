import { useState, useMemo } from 'react';
import { StatusPill, Button, Modal, Input } from '@/design-system';
import { Database, FileCode, Play, Download, CheckCircle2, Table as TableIcon, RefreshCw, Key, Layers } from 'lucide-react';

export function SyntheticTestDatasetModule() {
  const [selectedSchema, setSelectedSchema] = useState('activities');
  const [activePreset, setActivePreset] = useState('STANDARD');
  const [recordCount, setRecordCount] = useState(10);
  const [showJsonModal, setShowJsonModal] = useState(false);

  // Core Data Schemas
  const schemas = [
    {
      id: 'activities',
      name: 'WBS Activities Schema',
      table: 'activities',
      description: 'Defines planned baseline schedule, weightage, BOQ quantities, and CPM dates.',
      fields: [
        { name: 'id', type: 'UUID', pk: true, fk: false, nullable: false, desc: 'Primary key' },
        { name: 'project_id', type: 'UUID', pk: false, fk: true, nullable: false, desc: 'FK -> projects.id' },
        { name: 'wbs_code', type: 'VARCHAR(50)', pk: false, fk: false, nullable: false, desc: 'WBS hierarchy path (e.g. PRJ-01.T1.F2.ACT-04)' },
        { name: 'activity_name', type: 'VARCHAR(255)', pk: false, fk: false, nullable: false, desc: 'Descriptive title of work activity' },
        { name: 'weightage', type: 'NUMERIC(5,4)', pk: false, fk: false, nullable: false, desc: 'Normalized progress weightage (Sum=1.00)' },
        { name: 'planned_qty', type: 'NUMERIC(12,2)', pk: false, fk: false, nullable: false, desc: 'BOQ planned unit quantity' },
        { name: 'uom', type: 'VARCHAR(20)', pk: false, fk: false, nullable: false, desc: 'Unit of measure (m³, MT, SqM, Nos)' },
        { name: 'planned_start_date', type: 'DATE', pk: false, fk: false, nullable: false, desc: 'Baseline start date' },
        { name: 'planned_end_date', type: 'DATE', pk: false, fk: false, nullable: false, desc: 'Baseline end date' }
      ]
    },
    {
      id: 'dpr_progress',
      name: 'Daily Progress Reports Schema',
      table: 'dpr_activity_progress',
      description: 'Daily transactional progress submissions logged by site engineers.',
      fields: [
        { name: 'id', type: 'UUID', pk: true, fk: false, nullable: false, desc: 'Primary key' },
        { name: 'dpr_header_id', type: 'UUID', pk: false, fk: true, nullable: false, desc: 'FK -> dpr_headers.id' },
        { name: 'activity_id', type: 'UUID', pk: false, fk: true, nullable: false, desc: 'FK -> activities.id' },
        { name: 'qty_today', type: 'NUMERIC(12,2)', pk: false, fk: false, nullable: false, desc: 'Measured physical quantity completed today' },
        { name: 'cumulative_qty', type: 'NUMERIC(12,2)', pk: false, fk: false, nullable: false, desc: 'Running approved total quantity' },
        { name: 'verification_status', type: 'VARCHAR(30)', pk: false, fk: false, nullable: false, desc: 'DRAFT | SUBMITTED | APPROVED | REJECTED' },
        { name: 'log_date', type: 'DATE', pk: false, fk: false, nullable: false, desc: 'Date of site execution' }
      ]
    },
    {
      id: 'cost_transactions',
      name: 'Cost Transactions & Actuals Schema',
      table: 'cost_transactions',
      description: 'Financial actuals, vendor invoices, purchase order commitments, and labor payouts.',
      fields: [
        { name: 'id', type: 'UUID', pk: true, fk: false, nullable: false, desc: 'Primary key' },
        { name: 'project_id', type: 'UUID', pk: false, fk: true, nullable: false, desc: 'FK -> projects.id' },
        { name: 'cost_code', type: 'VARCHAR(50)', pk: false, fk: false, nullable: false, desc: 'Cost Breakdown Structure code' },
        { name: 'transaction_type', type: 'VARCHAR(30)', pk: false, fk: false, nullable: false, desc: 'PO_COMMITMENT | INVOICE | LABOUR_PAYOUT' },
        { name: 'amount', type: 'NUMERIC(14,2)', pk: false, fk: false, nullable: false, desc: 'Financial transaction value in INR' },
        { name: 'posting_date', type: 'DATE', pk: false, fk: false, nullable: false, desc: 'Accounting posting date' }
      ]
    },
    {
      id: 'stock_ledger',
      name: 'Material Stock Ledger Schema',
      table: 'stock_ledger',
      description: 'Material store receipts (GRN) and daily site issues.',
      fields: [
        { name: 'id', type: 'UUID', pk: true, fk: false, nullable: false, desc: 'Primary key' },
        { name: 'material_id', type: 'UUID', pk: false, fk: true, nullable: false, desc: 'FK -> materials.id' },
        { name: 'txn_type', type: 'VARCHAR(20)', pk: false, fk: false, nullable: false, desc: 'RECEIPT | ISSUE | TRANSFER | SCRAP' },
        { name: 'qty', type: 'NUMERIC(12,2)', pk: false, fk: false, nullable: false, desc: 'Quantity transacted' },
        { name: 'store_location', type: 'VARCHAR(100)', pk: false, fk: false, nullable: false, desc: 'Padur Central Store / Site Yard' },
        { name: 'txn_timestamp', type: 'TIMESTAMP', pk: false, fk: false, nullable: false, desc: 'Time of store transaction' }
      ]
    }
  ];

  // Synthetic Test Generator Presets
  const presets = [
    { id: 'STANDARD', name: 'Standard Nominal Project Run', desc: 'On-schedule activities with 100% data integrity.' },
    { id: 'DELAYED', name: 'Monsoon Rain Delay & Slippage', desc: 'Schedules slipped by 14 days, low productivity.' },
    { id: 'MATERIAL_SHORTAGE', name: 'Cement & Rebar Supply Bottleneck', desc: 'Zero stock issues logged for critical path activities.' },
    { id: 'ANOMALY_TEST', name: 'Edge Case & Data Quality Anomaly', desc: 'Contains negative quantities and missing FK records for test validation.' }
  ];

  const currentSchemaObj = useMemo(() => {
    return schemas.find((s) => s.id === selectedSchema) || schemas[0];
  }, [selectedSchema]);

  // Generate Synthetic Test Dataset based on preset & count
  const syntheticRecords = useMemo(() => {
    const records = [];
    const isAnomaly = activePreset === 'ANOMALY_TEST';
    const isDelayed = activePreset === 'DELAYED';

    for (let i = 1; i <= recordCount; i++) {
      if (selectedSchema === 'activities') {
        records.push({
          id: `act-uuid-00${i}`,
          project_id: 'prj-padur-001',
          wbs_code: `PRJ-01.T1.F${Math.ceil(i / 2)}.ACT-0${i}`,
          activity_name: i % 2 === 0 ? `Slab Concreting Floor ${i / 2}` : `Column Rebar Fixing Floor ${Math.ceil(i / 2)}`,
          weightage: (0.10).toFixed(4),
          planned_qty: i * 500,
          uom: i % 2 === 0 ? 'm³' : 'MT',
          planned_start_date: isDelayed ? '2026-08-01' : '2026-08-15',
          planned_end_date: isDelayed ? '2026-09-30' : '2026-09-10'
        });
      } else if (selectedSchema === 'dpr_progress') {
        records.push({
          id: `dpr-uuid-00${i}`,
          dpr_header_id: `hdr-00${i}`,
          activity_id: `act-uuid-00${Math.ceil(i / 2)}`,
          qty_today: isAnomaly && i === 3 ? -15.0 : i * 25.5,
          cumulative_qty: i * 150.0,
          verification_status: isAnomaly && i === 5 ? 'REJECTED' : 'APPROVED',
          log_date: `2026-08-${i < 10 ? '0' + i : i}`
        });
      } else if (selectedSchema === 'cost_transactions') {
        records.push({
          id: `cst-uuid-00${i}`,
          project_id: 'prj-padur-001',
          cost_code: `CBS-0${i}`,
          transaction_type: i % 3 === 0 ? 'PO_COMMITMENT' : i % 2 === 0 ? 'INVOICE' : 'LABOUR_PAYOUT',
          amount: i * 45000,
          posting_date: `2026-08-${i < 10 ? '0' + i : i}`
        });
      } else {
        records.push({
          id: `stk-uuid-00${i}`,
          material_id: i % 2 === 0 ? 'mat-cement-53' : 'mat-rebar-12mm',
          txn_type: i % 3 === 0 ? 'RECEIPT' : 'ISSUE',
          qty: i * 120,
          store_location: 'Padur Central Store Yard',
          txn_timestamp: `2026-08-${i < 10 ? '0' + i : i} 10:30:00`
        });
      }
    }
    return records;
  }, [selectedSchema, activePreset, recordCount]);

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 03</span>
            <h2 className="text-xl font-bold text-brand-950">Synthetic Test Dataset & Data Schema Design</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Data schema specifications, field types, constraint definitions, and synthetic data generation for pipeline stress-testing.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setShowJsonModal(true)} className="text-xs gap-1.5">
            <FileCode className="h-3.5 w-3.5 text-brand-600" /> Export Synthetic JSON
          </Button>
        </div>
      </div>

      {/* Schema Selector Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-surface-border pb-2">
        {schemas.map((s) => (
          <button
            key={s.id}
            onClick={() => setSelectedSchema(s.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedSchema === s.id
                ? 'bg-brand-900 text-white shadow-sm'
                : 'bg-surface-subtle text-ink-700 hover:bg-slate-200 border border-surface-border'
            }`}
          >
            <Database className="h-3.5 w-3.5" />
            {s.name}
          </button>
        ))}
      </div>

      {/* Schema Description & Field Definition Table */}
      <div className="rounded-lg border border-surface-border bg-slate-50 p-4 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-slate-200 pb-2">
          <div>
            <div className="font-mono text-xs font-bold text-brand-700">TABLE: {currentSchemaObj.table}</div>
            <p className="text-xs text-ink-700">{currentSchemaObj.description}</p>
          </div>
          <span className="text-[11px] font-mono bg-white px-2 me-1 py-1 rounded border border-slate-200 text-slate-800">
            {currentSchemaObj.fields.length} Columns Defined
          </span>
        </div>

        <div className="overflow-x-auto rounded border border-slate-200 bg-white">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface-subtle text-ink-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="px-3 py-2">Column Name</th>
                <th className="px-3 py-2">Data Type</th>
                <th className="px-3 py-2">Key Constraint</th>
                <th className="px-3 py-2">Nullable</th>
                <th className="px-3 py-2">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {currentSchemaObj.fields.map((f) => (
                <tr key={f.name} className="hover:bg-slate-50">
                  <td className="px-3 py-2 font-mono font-bold text-brand-900">{f.name}</td>
                  <td className="px-3 py-2 font-mono text-[11px] text-emerald-700">{f.type}</td>
                  <td className="px-3 py-2">
                    {f.pk ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
                        <Key className="h-3 w-3" /> PK
                      </span>
                    ) : f.fk ? (
                      <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded border border-indigo-200">
                        <Layers className="h-3 w-3" /> FK
                      </span>
                    ) : (
                      <span className="text-ink-400">-</span>
                    )}
                  </td>
                  <td className="px-3 py-2">
                    {f.nullable ? (
                      <span className="text-amber-600 font-semibold text-[11px]">YES</span>
                    ) : (
                      <span className="text-slate-500 text-[11px]">NOT NULL</span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-ink-600 text-[11px]">{f.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Synthetic Dataset Generator Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-surface-subtle p-3 rounded-lg border border-surface-border">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-semibold text-ink-700">Test Scenario Preset:</span>
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => setActivePreset(p.id)}
              className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all ${
                activePreset === p.id
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-ink-700 hover:bg-slate-100 border border-surface-border'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-ink-700">Rows:</span>
          <Input
            type="number"
            min={5}
            max={50}
            value={recordCount}
            onChange={(e) => setRecordCount(Number(e.target.value))}
            className="w-16 bg-white text-xs py-1"
          />
        </div>
      </div>

      {/* Generated Synthetic Data Table */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-ink-900 text-xs flex items-center gap-1.5">
            <TableIcon className="h-4 w-4 text-brand-600" /> Generated Synthetic Test Data ({syntheticRecords.length} Rows)
          </h4>
          <span className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Validated Against Schema Rules
          </span>
        </div>

        <div className="overflow-x-auto rounded-lg border border-surface-border">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-900 text-slate-200 border-b border-slate-800">
              <tr>
                {Object.keys(syntheticRecords[0] || {}).map((col) => (
                  <th key={col} className="px-3 py-2 text-[11px] font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-white text-[11px]">
              {syntheticRecords.map((rec, idx) => (
                <tr key={idx} className="hover:bg-slate-50">
                  {Object.entries(rec).map(([col, val]) => (
                    <td key={col} className="px-3 py-2 text-slate-800 whitespace-nowrap">
                      {typeof val === 'number' && val < 0 ? (
                        <span className="text-rose-600 font-bold bg-rose-50 px-1 rounded border border-rose-200">
                          {val} (ANOMALY)
                        </span>
                      ) : (
                        String(val)
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* JSON Viewer Modal */}
      {showJsonModal && (
        <Modal open={showJsonModal} onClose={() => setShowJsonModal(false)} title="Synthetic Dataset JSON Payload" size="lg">
          <div className="flex flex-col gap-3">
            <p className="text-xs text-ink-600">
              Copy or download this synthetic dataset JSON payload for pipeline seeding and integration testing.
            </p>
            <pre className="rounded bg-slate-950 p-3 text-emerald-300 font-mono text-[11px] max-h-96 overflow-y-auto">
              {JSON.stringify(syntheticRecords, null, 2)}
            </pre>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowJsonModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
