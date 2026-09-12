import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import {
  ShieldCheck,
  ShieldX,
  Search,
  Building2,
  MapPin,
  Layers,
  Grid,
  SquareStack,
} from 'lucide-react';
import { Button, Input } from '@/design-system';
import { hierarchyApi } from '../api/projectsApi';

const INITIAL_PARAMS = {
  projectId: '',
  siteId: '',
  buildingId: '',
  floorId: '',
  zoneId: '',
};

function ValidatedField({ icon: Icon, iconColor, label, id, name }) {
  if (!id && !name) return null;
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className={`h-4 w-4 shrink-0 ${iconColor}`} />
      <span className="text-ink-500">{label}:</span>
      <span className="font-medium text-ink-900">
        {name || '—'} <span className="text-xs text-ink-400">(ID: {id})</span>
      </span>
    </div>
  );
}

export function HierarchyValidatorTool() {
  const [params, setParams] = useState(INITIAL_PARAMS);
  const [result, setResult] = useState(null);

  const validateMutation = useMutation({
    mutationFn: (p) => {
      const clean = {};
      if (p.projectId) clean.projectId = Number(p.projectId);
      if (p.siteId) clean.siteId = Number(p.siteId);
      if (p.buildingId) clean.buildingId = Number(p.buildingId);
      if (p.floorId) clean.floorId = Number(p.floorId);
      if (p.zoneId) clean.zoneId = Number(p.zoneId);
      return hierarchyApi.validate(clean);
    },
    onSuccess: (data) => setResult(data),
    onError: (err) =>
      setResult({
        valid: false,
        message: err.message || 'Validation request failed.',
        errors: [err.message || 'Network error.'],
      }),
  });

  const handleChange = (field) => (e) =>
    setParams((p) => ({ ...p, [field]: e.target.value }));

  const handleValidate = () => {
    const hasAny = Object.values(params).some((v) => v.trim() !== '');
    if (!hasAny) return;
    validateMutation.mutate(params);
  };

  const handleReset = () => {
    setParams(INITIAL_PARAMS);
    setResult(null);
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Input panel */}
      <div className="bg-white/30 border border-surface-border rounded-xl p-5 flex flex-col gap-4">
        <div>
          <h3 className="text-sm font-semibold text-brand-900">Hierarchy Lineage Validation</h3>
          <p className="text-xs text-ink-500 mt-0.5">
            Enter the IDs you want to verify. Leave any field blank to skip that level.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Project ID</label>
            <div className="flex items-center gap-2 border border-surface-border rounded-lg px-3 py-2 bg-white/60">
              <SquareStack className="h-3.5 w-3.5 text-brand-500 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 1"
                value={params.projectId}
                onChange={handleChange('projectId')}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Site ID</label>
            <div className="flex items-center gap-2 border border-surface-border rounded-lg px-3 py-2 bg-white/60">
              <MapPin className="h-3.5 w-3.5 text-amber-500 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 101"
                value={params.siteId}
                onChange={handleChange('siteId')}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Building ID</label>
            <div className="flex items-center gap-2 border border-surface-border rounded-lg px-3 py-2 bg-white/60">
              <Building2 className="h-3.5 w-3.5 text-blue-500 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 201"
                value={params.buildingId}
                onChange={handleChange('buildingId')}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Floor ID</label>
            <div className="flex items-center gap-2 border border-surface-border rounded-lg px-3 py-2 bg-white/60">
              <Layers className="h-3.5 w-3.5 text-violet-500 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 301"
                value={params.floorId}
                onChange={handleChange('floorId')}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium text-ink-600">Zone ID</label>
            <div className="flex items-center gap-2 border border-surface-border rounded-lg px-3 py-2 bg-white/60">
              <Grid className="h-3.5 w-3.5 text-teal-500 shrink-0" />
              <input
                type="number"
                placeholder="e.g. 401"
                value={params.zoneId}
                onChange={handleChange('zoneId')}
                className="w-full bg-transparent text-sm text-ink-900 outline-none placeholder:text-ink-300"
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 pt-1">
          <Button
            onClick={handleValidate}
            isLoading={validateMutation.isPending}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Validate Hierarchy
          </Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
        </div>
      </div>

      {/* Result panel */}
      {result && (
        <div
          className={`rounded-xl border p-5 flex flex-col gap-4 transition-all ${
            result.valid
              ? 'border-emerald-200 bg-emerald-50/60'
              : 'border-red-200 bg-red-50/60'
          }`}
        >
          <div className="flex items-center gap-3">
            {result.valid ? (
              <ShieldCheck className="h-7 w-7 text-emerald-600 shrink-0" />
            ) : (
              <ShieldX className="h-7 w-7 text-red-500 shrink-0" />
            )}
            <div>
              <p className={`text-sm font-semibold ${result.valid ? 'text-emerald-800' : 'text-red-700'}`}>
                {result.valid ? 'Hierarchy Valid ✓' : 'Hierarchy Invalid ✗'}
              </p>
              <p className="text-xs text-ink-600 mt-0.5">{result.message}</p>
            </div>
          </div>

          {/* Verified lineage display */}
          {result.valid && (
            <div className="flex flex-col gap-2 border-t border-emerald-200 pt-3">
              <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">
                Verified Lineage Path
              </p>
              <ValidatedField icon={SquareStack} iconColor="text-brand-500" label="Project" id={result.projectId} name={result.projectName} />
              <ValidatedField icon={MapPin} iconColor="text-amber-500" label="Site" id={result.siteId} name={result.siteName} />
              <ValidatedField icon={Building2} iconColor="text-blue-500" label="Building" id={result.buildingId} name={result.buildingName} />
              <ValidatedField icon={Layers} iconColor="text-violet-500" label="Floor" id={result.floorId} name={result.floorName} />
              <ValidatedField icon={Grid} iconColor="text-teal-500" label="Zone" id={result.zoneId} name={result.zoneName} />
            </div>
          )}

          {/* Errors */}
          {!result.valid && result.errors && result.errors.length > 0 && (
            <div className="flex flex-col gap-1.5 border-t border-red-200 pt-3">
              <p className="text-xs font-semibold text-red-700 uppercase tracking-wide">Validation Errors</p>
              {result.errors.map((err, i) => (
                <div key={i} className="flex items-start gap-2 text-sm text-red-700">
                  <span className="mt-0.5 shrink-0">•</span>
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
