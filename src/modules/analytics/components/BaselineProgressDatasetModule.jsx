import { useState } from 'react';
import { StatusPill, Button } from '@/design-system';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { Lock, FileCheck, AlertTriangle, CheckCircle2, History, GitBranch, Calendar } from 'lucide-react';

export function BaselineProgressDatasetModule() {
  const [selectedBaselineRev, setSelectedBaselineRev] = useState('v1.2');

  // Interactive Baseline vs Actual S-Curve Dataset
  const sCurveData = [
    { week: 'Wk 1 (Jul 01)', PV: 5, EV: 5, AC: 4.8 },
    { week: 'Wk 2 (Jul 08)', PV: 12, EV: 11, AC: 11.5 },
    { week: 'Wk 3 (Jul 15)', PV: 20, EV: 18, AC: 19.2 },
    { week: 'Wk 4 (Jul 22)', PV: 30, EV: 26, AC: 28.0 },
    { week: 'Wk 5 (Jul 29)', PV: 42, EV: 38, AC: 40.5 },
    { week: 'Wk 6 (Aug 05)', PV: 55, EV: 49, AC: 52.0 },
    { week: 'Wk 7 (Aug 12)', PV: 68, EV: 61, AC: 64.5 },
    { week: 'Wk 8 (Aug 19)', PV: 80, EV: 72, AC: 76.0 },
    { week: 'Wk 9 (Aug 26)', PV: 90, EV: null, AC: null },
    { week: 'Wk 10 (Sep 02)', PV: 100, EV: null, AC: null }
  ];

  const revisionLogs = [
    {
      rev: 'v1.2',
      date: '2026-07-01',
      approvedBy: 'Project Director & Client Representative',
      reason: 'Approved Variation Order VO-004 (Addition of Swimming Pool Structure)',
      bac: '₹ 5,00,00,000',
      status: 'CURRENT_FREEZED'
    },
    {
      rev: 'v1.1',
      date: '2026-05-15',
      approvedBy: 'Project Manager',
      reason: 'Monsoon Work Schedule Adjustment (Padur Site)',
      bac: '₹ 4,75,00,000',
      status: 'SUPERSEDED'
    },
    {
      rev: 'v1.0',
      date: '2026-03-01',
      approvedBy: 'Executive Committee',
      reason: 'Initial Target Baseline Schedule Release',
      bac: '₹ 4,75,00,000',
      status: 'SUPERSEDED'
    }
  ];

  return (
    <div className="flex flex-col gap-5 bg-white p-5 rounded-xl border border-surface-border shadow-sm">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-surface-border pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-brand-100 text-brand-900 px-2 py-0.5 text-xs font-bold font-mono">MODULE 07</span>
            <h2 className="text-xl font-bold text-brand-950">Baseline Progress Dataset Structure & Validation</h2>
          </div>
          <p className="text-xs text-ink-600 mt-1">
            Target baseline schedule structure, locked change control revisions, variation order tracking, and PV vs EV S-Curve validation.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 bg-slate-900 text-amber-300 font-mono text-xs px-3 py-1 rounded-lg font-bold border border-slate-800">
            <Lock className="h-3.5 w-3.5" /> BASELINE LOCKED (v1.2)
          </span>
        </div>
      </div>

      {/* Baseline Dataset Overview Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Active Baseline Revision</div>
          <div className="text-xl font-bold text-brand-950 font-mono mt-0.5">Revision v1.2</div>
          <div className="text-[10px] text-emerald-600 mt-1 flex items-center gap-1 font-medium">
            <CheckCircle2 className="h-3 w-3" /> Formally Approved & Signed
          </div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Budget At Completion (BAC)</div>
          <div className="text-xl font-bold text-slate-900 font-mono mt-0.5">₹ 5,00,00,000</div>
          <div className="text-[10px] text-ink-500 mt-1">Target Financial Baseline</div>
        </div>

        <div className="rounded-lg bg-surface-subtle p-3 border border-surface-border">
          <div className="text-[11px] font-semibold text-ink-500 uppercase tracking-wider">Planned Finish Date</div>
          <div className="text-xl font-bold text-slate-800 font-mono mt-0.5">Sep 02, 2026</div>
          <div className="text-[10px] text-ink-500 mt-1">10 Weeks Target Timeline</div>
        </div>

        <div className="rounded-lg bg-amber-50 p-3 border border-amber-200">
          <div className="text-[11px] font-semibold text-amber-800 uppercase tracking-wider">Schedule Variance (EV - PV)</div>
          <div className="text-xl font-bold text-amber-950 font-mono mt-0.5">-8.0% Behind PV</div>
          <div className="text-[10px] text-amber-700 mt-1">Requires Acceleration Plan</div>
        </div>
      </div>

      {/* S-Curve Chart Section */}
      <div className="rounded-lg border border-surface-border bg-slate-50 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-brand-950 flex items-center gap-2">
              <GitBranch className="h-4 w-4 text-brand-600" /> S-Curve Baseline Progress vs Earned Value vs Actual Cost
            </h3>
            <p className="text-xs text-ink-600">Visual comparison of Planned Value (PV), Earned Value (EV), and Actual Cost (AC).</p>
          </div>
        </div>

        <div className="h-64 w-full bg-white p-3 rounded-lg border border-slate-200">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={sCurveData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="week" tick={{ fontSize: 10 }} />
              <YAxis unit="%" tick={{ fontSize: 10 }} domain={[0, 100]} />
              <Tooltip formatter={(val) => `${val}%`} />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Line type="monotone" dataKey="PV" name="Planned Value (PV Baseline)" stroke="#0f172a" strokeWidth={2.5} dot={{ r: 3 }} />
              <Line type="monotone" dataKey="EV" name="Earned Value (EV Actual)" stroke="#059669" strokeWidth={2.5} dot={{ r: 4 }} />
              <Line type="monotone" dataKey="AC" name="Actual Cost (AC Spend)" stroke="#d97706" strokeWidth={2} strokeDasharray="5 5" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Baseline Change Control Log */}
      <div className="space-y-2">
        <h4 className="font-bold text-xs text-ink-900 flex items-center gap-1.5">
          <History className="h-4 w-4 text-brand-600" /> Baseline Freeze & Change Control Log
        </h4>

        <div className="overflow-x-auto rounded-lg border border-surface-border">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-surface-border bg-surface-subtle text-ink-700 font-semibold">
              <tr>
                <th className="px-3.5 py-2.5">Revision</th>
                <th className="px-3.5 py-2.5">Approved Date</th>
                <th className="px-3.5 py-2.5">Approved By</th>
                <th className="px-3.5 py-2.5">Target BAC</th>
                <th className="px-3.5 py-2.5">Revision Rationale</th>
                <th className="px-3.5 py-2.5 text-right">Lock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-border bg-white">
              {revisionLogs.map((log) => (
                <tr key={log.rev} className="hover:bg-surface-subtle/50 transition-colors">
                  <td className="px-3.5 py-3 font-mono font-bold text-brand-900">{log.rev}</td>
                  <td className="px-3.5 py-3 font-mono text-ink-700">{log.date}</td>
                  <td className="px-3.5 py-3 font-medium text-ink-900">{log.approvedBy}</td>
                  <td className="px-3.5 py-3 font-mono font-bold text-slate-800">{log.bac}</td>
                  <td className="px-3.5 py-3 text-ink-600 text-[11px] max-w-xs">{log.reason}</td>
                  <td className="px-3.5 py-3 text-right">
                    <span
                      className={`rounded px-2 py-0.5 text-[10px] font-bold ${
                        log.status === 'CURRENT_FREEZED'
                          ? 'bg-slate-900 text-amber-300 border border-slate-800'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
