// One-time scaffold generator: creates a consistent pages/api/types/routes skeleton
// for every backend-aligned module (spec section 12.2). Safe to delete after review —
// it only writes into src/modules/<key>/ and does not touch the identity module.
import fs from 'node:fs';
import path from 'node:path';

const modules = [
  {
    key: 'projects',
    label: 'Projects',
    entity: 'Project',
    path: 'projects',
    description: 'Project & site master — code, type, client, buildings/floors/zones (FR-010..014).',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Name' },
      { key: 'type', header: 'Type' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/projects',
  },
  {
    key: 'wbs-schedule',
    label: 'WBS & Schedule',
    entity: 'Activity',
    path: 'wbs-schedule',
    description: 'WBS hierarchy, baseline schedule, dependencies and 7/14-day look-ahead (FR-020..025).',
    columns: [
      { key: 'wbsCode', header: 'WBS Code' },
      { key: 'name', header: 'Activity' },
      { key: 'discipline', header: 'Discipline' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/activities',
  },
  {
    key: 'progress-dpr',
    label: 'Daily Progress (DPR)',
    entity: 'DprHeader',
    path: 'dpr',
    description: 'Daily Progress Report: draft/submit/approve, quantities, photos, remarks (FR-030..035).',
    columns: [
      { key: 'reportDate', header: 'Date' },
      { key: 'siteName', header: 'Site' },
      { key: 'submittedBy', header: 'Submitted By' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/dpr',
  },
  {
    key: 'labour-contractors',
    label: 'Labour & Contractors',
    entity: 'LabourDaily',
    path: 'labour',
    description: 'Contractor master, daily headcount/allocation and productivity analytics (FR-040..045).',
    columns: [
      { key: 'date', header: 'Date' },
      { key: 'contractor', header: 'Contractor' },
      { key: 'trade', header: 'Trade' },
      { key: 'headcount', header: 'Headcount' },
    ],
    endpoint: '/labour/daily',
  },
  {
    key: 'materials-inventory',
    label: 'Materials & Inventory',
    entity: 'Material',
    path: 'materials',
    description: 'Material master, requests, GRN, stock ledger, issue/consumption, low-stock alerts (FR-050..057).',
    columns: [
      { key: 'code', header: 'Code' },
      { key: 'name', header: 'Material' },
      { key: 'currentStock', header: 'Current Stock' },
      { key: 'reorderLevel', header: 'Reorder Level' },
    ],
    endpoint: '/materials',
  },
  {
    key: 'procurement',
    label: 'Procurement & Suppliers',
    entity: 'PurchaseOrder',
    path: 'procurement',
    description: 'Supplier profile, PO tracking, delivery status and supplier performance (FR-060..063).',
    columns: [
      { key: 'poNumber', header: 'PO Number' },
      { key: 'supplier', header: 'Supplier' },
      { key: 'deliveryDate', header: 'Delivery Date' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/purchase-orders',
  },
  {
    key: 'cost-control',
    label: 'Cost & Budget',
    entity: 'Budget',
    path: 'cost',
    description: 'Cost heads, budget revisions, committed/actual cost, PV/EV/AC/SPI/CPI (FR-070..075).',
    columns: [
      { key: 'costCode', header: 'Cost Code' },
      { key: 'baselineAmount', header: 'Baseline' },
      { key: 'actualAmount', header: 'Actual' },
      { key: 'variance', header: 'Variance' },
    ],
    endpoint: '/budgets',
  },
  {
    key: 'quality',
    label: 'Quality & NCR',
    entity: 'QualityIssue',
    path: 'quality',
    description: 'Inspection checklists, NCR/snag workflow, evidence and closure (FR-080..084).',
    columns: [
      { key: 'category', header: 'Category' },
      { key: 'severity', header: 'Severity', status: true },
      { key: 'responsible', header: 'Responsible' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/quality-issues',
  },
  {
    key: 'issues-risks',
    label: 'Issues & Risks',
    entity: 'Issue',
    path: 'issues',
    description: 'Issue/blocker tracking, escalation and project risk register (FR-090..093).',
    columns: [
      { key: 'title', header: 'Issue' },
      { key: 'priority', header: 'Priority', status: true },
      { key: 'owner', header: 'Owner' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/issues',
  },
  {
    key: 'equipment',
    label: 'Equipment',
    entity: 'Equipment',
    path: 'equipment',
    description: 'Equipment/asset register, site allocation, downtime and usage hours (FR-100..102).',
    columns: [
      { key: 'assetCode', header: 'Asset Code' },
      { key: 'type', header: 'Type' },
      { key: 'site', header: 'Allocated Site' },
      { key: 'status', header: 'Status', status: true },
    ],
    endpoint: '/equipment',
  },
  {
    key: 'documents',
    label: 'Documents',
    entity: 'Document',
    path: 'documents',
    description: 'Document/photo repository by project/category/version with search (FR-110..114).',
    columns: [
      { key: 'name', header: 'Document' },
      { key: 'category', header: 'Category' },
      { key: 'uploadedBy', header: 'Uploaded By' },
      { key: 'version', header: 'Version' },
    ],
    endpoint: '/documents',
  },
  {
    key: 'notifications',
    label: 'Notifications',
    entity: 'Notification',
    path: 'notifications',
    description: 'In-app alerts for overdue activities, low stock, pending approvals (FR-120..123).',
    columns: [
      { key: 'message', header: 'Message' },
      { key: 'severity', header: 'Severity', status: true },
      { key: 'createdAt', header: 'Raised' },
      { key: 'readStatus', header: 'Status', status: true },
    ],
    endpoint: '/notifications',
  },
  {
    key: 'analytics',
    label: 'Construction Intelligence',
    entity: 'ProjectHealth',
    path: 'analytics',
    description: 'Delay-risk, forecast completion and project health index (section 11).',
    columns: [
      { key: 'project', header: 'Project' },
      { key: 'healthIndex', header: 'Health Index' },
      { key: 'delayRisk', header: 'Delay Risk' },
      { key: 'forecastCompletion', header: 'Forecast Completion' },
    ],
    endpoint: '/analytics/project-health',
  },
  {
    key: 'reports',
    label: 'Reports',
    entity: 'Report',
    path: 'reports',
    description: 'Executive/project/site dashboards and scheduled/exportable reports (FR-130..135).',
    columns: [
      { key: 'name', header: 'Report' },
      { key: 'period', header: 'Period' },
      { key: 'generatedAt', header: 'Generated' },
      { key: 'format', header: 'Format' },
    ],
    endpoint: '/reports',
  },
  {
    key: 'audit',
    label: 'Audit Log',
    entity: 'AuditLog',
    path: 'audit',
    description: 'Read-only history of create/update/approve actions (FR-005).',
    columns: [
      { key: 'user', header: 'User' },
      { key: 'action', header: 'Action' },
      { key: 'entityType', header: 'Entity' },
      { key: 'timestamp', header: 'Timestamp' },
    ],
    endpoint: '/audit-logs',
  },
];

const root = path.resolve(import.meta.dirname, '..', 'src', 'modules');

function pascal(s) {
  return s.replace(/(^|-)([a-z])/g, (_, __, c) => c.toUpperCase());
}
function camel(s) {
  const p = pascal(s);
  return p[0].toLowerCase() + p.slice(1);
}

for (const mod of modules) {
  const dir = path.join(root, mod.key);
  fs.mkdirSync(path.join(dir, 'pages'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'components'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'api'), { recursive: true });

  const Entity = mod.entity;
  const moduleCamel = camel(mod.key);
  const PageName = `${pascal(mod.key)}ListPage`;

  // api/<module>Api.jsx
  fs.writeFileSync(
    path.join(dir, 'api', `${moduleCamel}Api.jsx`),
    `import { apiClient } from '@/lib/apiClient';\n\n` +
      `// Maps to ${mod.endpoint} (spec section 14 - API Requirements).\n` +
      `export const ${moduleCamel}Api = {\n` +
      `  list: (params) =>\n` +
      `    apiClient.get('${mod.endpoint}', { params }).then((r) => r.data),\n` +
      `  getById: (id) => apiClient.get(\`${mod.endpoint}/\${id}\`).then((r) => r.data),\n` +
      `  create: (payload) =>\n` +
      `    apiClient.post('${mod.endpoint}', payload).then((r) => r.data),\n` +
      `  update: (id, payload) =>\n` +
      `    apiClient.put(\`${mod.endpoint}/\${id}\`, payload).then((r) => r.data),\n` +
      `};\n`,
  );

  // pages/<Module>ListPage.jsx
  const columnsCode = mod.columns
    .map((c) =>
      c.status
        ? `    { key: '${c.key}', header: '${c.header}', render: (row) => <StatusPill status={row.${c.key}} /> },`
        : `    { key: '${c.key}', header: '${c.header}' },`,
    )
    .join('\n');

  fs.writeFileSync(
    path.join(dir, 'pages', `${PageName}.jsx`),
    `import { useQuery } from '@tanstack/react-query';\n` +
      `import { Table, StatusPill, Button } from '@/design-system';\n` +
      `import { ${moduleCamel}Api } from '../api/${moduleCamel}Api';\n` +
      `\n` +
      `// ${mod.description}\n` +
      `export function ${PageName}() {\n` +
      `  const { data, isLoading } = useQuery({ queryKey: ['${mod.key}'], queryFn: () => ${moduleCamel}Api.list() });\n\n` +
      `  const columns = [\n${columnsCode}\n  ];\n\n` +
      `  return (\n` +
      `    <div className="flex flex-col gap-4">\n` +
      `      <div className="flex items-center justify-between">\n` +
      `        <div>\n` +
      `          <h1 className="page-heading">${mod.label}</h1>\n` +
      `          <p className="page-subheading">${mod.description}</p>\n` +
      `        </div>\n` +
      `        <Button size="sm">Add New</Button>\n` +
      `      </div>\n` +
      `      <Table columns={columns} data={data ?? []} rowKey={(row) => row.id} isLoading={isLoading} />\n` +
      `    </div>\n` +
      `  );\n` +
      `}\n`,
  );

  // routes.jsx
  fs.writeFileSync(
    path.join(dir, 'routes.jsx'),
    `` +
      `import { ${PageName} } from './pages/${PageName}';\n\n` +
      `export const ${moduleCamel}Routes = [\n` +
      `  { path: '${mod.path}', element: <${PageName} /> },\n` +
      `];\n`,
  );
}

console.log(`Generated ${modules.length} modules.`);
