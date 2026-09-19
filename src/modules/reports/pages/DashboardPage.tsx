import { useState } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LabelList,
  ComposedChart,
} from 'recharts';
import { useAuthStore } from '@/context/authStore';
import { ROLES, type Role } from '@/constants/roles';
import { ROLE_DASHBOARDS_DATA } from '../components/RoleDashboardsData';

// 10 Completely Unique Color Themes for each of the 10 domain role dashboards
const ROLE_THEMES: Record<Role, {
  donut: string[];
  workload: { completed: string; remaining: string; overdue: string };
  primary: string;
  secondary: string;
  composedBar: string;
  composedLine: string;
  badgeBg: string;
  tabActive: string;
}> = {
  [ROLES.DIRECTOR]: {
    donut: ['#8b5cf6', '#a855f7', '#c084fc', '#d8b4fe', '#e9d5ff'],
    workload: { completed: '#8b5cf6', remaining: '#c084fc', overdue: '#e9d5ff' },
    primary: '#8b5cf6',
    secondary: '#38bdf8',
    composedBar: '#6366f1',
    composedLine: '#4f46e5',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    tabActive: 'bg-purple-600 text-white',
  },
  [ROLES.PROJECT_MANAGER]: {
    donut: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    workload: { completed: '#10b981', remaining: '#34d399', overdue: '#6ee7b7' },
    primary: '#10b981',
    secondary: '#06b6d4',
    composedBar: '#0d9488',
    composedLine: '#047857',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    tabActive: 'bg-emerald-600 text-white',
  },
  [ROLES.SITE_ENGINEER]: {
    donut: ['#f59e0b', '#fbbf24', '#fcd34d', '#fef08a', '#ffedd5'],
    workload: { completed: '#ea580c', remaining: '#f97316', overdue: '#fb923c' },
    primary: '#f59e0b',
    secondary: '#ea580c',
    composedBar: '#d97706',
    composedLine: '#b45309',
    badgeBg: 'bg-amber-50 text-amber-800 border-amber-200',
    tabActive: 'bg-amber-600 text-white',
  },
  [ROLES.SITE_SUPERVISOR]: {
    donut: ['#e11d48', '#f43f5e', '#fb7185', '#fda4af', '#fecdd3'],
    workload: { completed: '#e11d48', remaining: '#f43f5e', overdue: '#fb7185' },
    primary: '#e11d48',
    secondary: '#f43f5e',
    composedBar: '#be123c',
    composedLine: '#9f1239',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    tabActive: 'bg-rose-600 text-white',
  },
  [ROLES.PROCUREMENT_STORE]: {
    donut: ['#2563eb', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'],
    workload: { completed: '#1d4ed8', remaining: '#3b82f6', overdue: '#60a5fa' },
    primary: '#2563eb',
    secondary: '#3b82f6',
    composedBar: '#1e40af',
    composedLine: '#1e3a8a',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    tabActive: 'bg-blue-600 text-white',
  },
  [ROLES.COST_COORDINATOR]: {
    donut: ['#b45309', '#d97706', '#f59e0b', '#fbbf24', '#fef3c7'],
    workload: { completed: '#b45309', remaining: '#d97706', overdue: '#f59e0b' },
    primary: '#d97706',
    secondary: '#b45309',
    composedBar: '#78350f',
    composedLine: '#451a03',
    badgeBg: 'bg-amber-100 text-amber-900 border-amber-300',
    tabActive: 'bg-amber-700 text-white',
  },
  [ROLES.QUALITY_ENGINEER]: {
    donut: ['#d946ef', '#ec4899', '#f472b6', '#fbcfe8', '#fce7f3'],
    workload: { completed: '#c026d3', remaining: '#d946ef', overdue: '#f472b6' },
    primary: '#d946ef',
    secondary: '#ec4899',
    composedBar: '#a21caf',
    composedLine: '#86198f',
    badgeBg: 'bg-fuchsia-50 text-fuchsia-700 border-fuchsia-200',
    tabActive: 'bg-fuchsia-600 text-white',
  },
  [ROLES.DATA_ANALYST]: {
    donut: ['#06b6d4', '#14b8a6', '#2dd4bf', '#5eead4', '#ccfbf1'],
    workload: { completed: '#0e7490', remaining: '#06b6d4', overdue: '#67e8f9' },
    primary: '#06b6d4',
    secondary: '#14b8a6',
    composedBar: '#155e75',
    composedLine: '#164e63',
    badgeBg: 'bg-cyan-50 text-cyan-700 border-cyan-200',
    tabActive: 'bg-cyan-600 text-white',
  },
  [ROLES.SYSTEM_ADMIN]: {
    donut: ['#334155', '#475569', '#64748b', '#94a3b8', '#cbd5e1'],
    workload: { completed: '#1e293b', remaining: '#475569', overdue: '#94a3b8' },
    primary: '#475569',
    secondary: '#64748b',
    composedBar: '#0f172a',
    composedLine: '#020617',
    badgeBg: 'bg-slate-100 text-slate-800 border-slate-300',
    tabActive: 'bg-slate-800 text-white',
  },
  [ROLES.AUDITOR]: {
    donut: ['#10b981', '#34d399', '#6ee7b7', '#a7f3d0', '#d1fae5'],
    workload: { completed: '#10b981', remaining: '#34d399', overdue: '#a7f3d0' },
    primary: '#10b981',
    secondary: '#34d399',
    composedBar: '#34d399',
    composedLine: '#059669',
    badgeBg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    tabActive: 'bg-emerald-500 text-white',
  },
};

// Full 10 Role Dynamic Data Specifications matching template layout (Clean without $ symbols)
const ROLE_DATA_SPEC: Record<Role, {
  completionRate: string;
  eac: string;
  utilBudget: string;
  spent: string;
  total: string;
  costBreakdown: {
    donut: Array<{ name: string; value: number }>;
    table: Array<{ category: string; amount: string; color: string }>;
  };
  workload: Array<{ project: string; completed: number; remaining: number; overdue: number }>;
  budgetVariance: Array<{ project: string; actualBudget: number; plannedBudget: number }>;
  resources: Array<{ project: string; plannedResources: number; actualResources: number }>;
}> = {
  [ROLES.DIRECTOR]: {
    completionRate: '64.5%',
    eac: '12.8M',
    utilBudget: '78.7%',
    spent: '9.8M',
    total: '12.5M',
    costBreakdown: {
      donut: [
        { name: 'Civil Works', value: 34.2 },
        { name: 'MEP Services', value: 24.8 },
        { name: 'Finishing & Joinery', value: 18.5 },
        { name: 'Structural Steel', value: 12.5 },
        { name: 'Infrastructure', value: 10.0 },
      ],
      table: [
        { category: 'Civil Works', amount: '4.27M', color: 'bg-purple-50 text-slate-800' },
        { category: 'MEP Services', amount: '3.10M', color: 'bg-purple-100/70 text-slate-800' },
        { category: 'Finishing & Joinery', amount: '2.31M', color: 'bg-purple-200/70 text-slate-800' },
        { category: 'Structural Steel', amount: '1.56M', color: 'bg-purple-300/80 text-slate-900' },
        { category: 'Infrastructure', amount: '1.25M', color: 'bg-purple-600 text-white font-bold' },
      ],
    },
    workload: [
      { project: 'Padur Res.', completed: 210, remaining: 90, overdue: 10 },
      { project: 'OMR Comm.', completed: 180, remaining: 120, overdue: 25 },
      { project: 'ECR Villa', completed: 260, remaining: 35, overdue: 0 },
      { project: 'DT Office', completed: 240, remaining: 50, overdue: 0 },
      { project: 'Airport Ext', completed: 150, remaining: 80, overdue: 45 },
    ],
    budgetVariance: [
      { project: 'Padur Res.', actualBudget: 1250, plannedBudget: 1200 },
      { project: 'OMR Comm.', actualBudget: 980, plannedBudget: 980 },
      { project: 'ECR Villa', actualBudget: 850, plannedBudget: 890 },
      { project: 'DT Office', actualBudget: 1100, plannedBudget: 1050 },
      { project: 'Airport Ext', actualBudget: 1450, plannedBudget: 1200 },
    ],
    resources: [
      { project: 'Padur Res.', plannedResources: 320, actualResources: 345 },
      { project: 'OMR Comm.', plannedResources: 280, actualResources: 290 },
      { project: 'ECR Villa', plannedResources: 180, actualResources: 175 },
      { project: 'DT Office', plannedResources: 250, actualResources: 260 },
      { project: 'Airport Ext', plannedResources: 310, actualResources: 360 },
    ],
  },

  [ROLES.PROJECT_MANAGER]: {
    completionRate: '70.1%',
    eac: '4.2M',
    utilBudget: '65.2%',
    spent: '4.3M',
    total: '6.5M',
    costBreakdown: {
      donut: [
        { name: 'Material', value: 21.13 },
        { name: 'Equipment', value: 20.86 },
        { name: 'Labor', value: 20.63 },
        { name: 'Subcontractors', value: 19.81 },
        { name: 'Foreign Labor', value: 17.57 },
      ],
      table: [
        { category: 'Material', amount: '162K', color: 'bg-emerald-50 text-slate-800' },
        { category: 'Equipment', amount: '160K', color: 'bg-emerald-100/70 text-slate-800' },
        { category: 'Labor', amount: '158K', color: 'bg-emerald-200/70 text-slate-800' },
        { category: 'Subcontractors', amount: '152K', color: 'bg-emerald-300/80 text-slate-900' },
        { category: 'Foreign Labor', amount: '135K', color: 'bg-emerald-600 text-white font-bold' },
      ],
    },
    workload: [
      { project: 'SchoolReno', completed: 220, remaining: 85, overdue: 35 },
      { project: 'WaterLine', completed: 200, remaining: 75, overdue: 30 },
      { project: 'Skyline', completed: 200, remaining: 60, overdue: 0 },
      { project: 'HillVillas', completed: 195, remaining: 55, overdue: 0 },
      { project: 'AirportExt', completed: 190, remaining: 55, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'WaterLine', actualBudget: 638, plannedBudget: 638 },
      { project: 'Riverside', actualBudget: 426, plannedBudget: 548 },
      { project: 'CoastHwy', actualBudget: 521, plannedBudget: 579 },
      { project: 'MallConst', actualBudget: 598, plannedBudget: 558 },
      { project: 'DT_Office', actualBudget: 447, plannedBudget: 496 },
    ],
    resources: [
      { project: 'CoastHwy', plannedResources: 215, actualResources: 270 },
      { project: 'MallConst', plannedResources: 210, actualResources: 255 },
      { project: 'SchoolReno', plannedResources: 285, actualResources: 335 },
      { project: 'Skyline', plannedResources: 160, actualResources: 260 },
      { project: 'WaterLine', plannedResources: 265, actualResources: 305 },
    ],
  },

  [ROLES.SITE_ENGINEER]: {
    completionRate: '70.0%',
    eac: '1.5M',
    utilBudget: '68.0%',
    spent: '1.02M',
    total: '1.5M',
    costBreakdown: {
      donut: [
        { name: 'M30 Concrete', value: 30.0 },
        { name: 'Steel Rebar', value: 25.0 },
        { name: 'Formwork', value: 20.0 },
        { name: 'Masonry Work', value: 15.0 },
        { name: 'Curing & Misc', value: 10.0 },
      ],
      table: [
        { category: 'M30 Concrete', amount: '45K', color: 'bg-amber-50 text-slate-800' },
        { category: 'Steel Rebar', amount: '38K', color: 'bg-amber-100/70 text-slate-800' },
        { category: 'Formwork', amount: '28K', color: 'bg-amber-200/70 text-slate-800' },
        { category: 'Masonry Work', amount: '22K', color: 'bg-amber-300/80 text-slate-900' },
        { category: 'Curing & Misc', amount: '12K', color: 'bg-amber-600 text-white font-bold' },
      ],
    },
    workload: [
      { project: 'GF Slab', completed: 250, remaining: 50, overdue: 0 },
      { project: 'Columns', completed: 280, remaining: 20, overdue: 0 },
      { project: 'Beams', completed: 180, remaining: 60, overdue: 10 },
      { project: 'Masonry', completed: 120, remaining: 140, overdue: 20 },
      { project: 'Plastering', completed: 50, remaining: 210, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'GF Slab', actualBudget: 340, plannedBudget: 320 },
      { project: 'Columns', actualBudget: 280, plannedBudget: 280 },
      { project: 'Beams', actualBudget: 220, plannedBudget: 240 },
      { project: 'Masonry', actualBudget: 180, plannedBudget: 190 },
      { project: 'Plastering', actualBudget: 90, plannedBudget: 100 },
    ],
    resources: [
      { project: 'Concrete', plannedResources: 180, actualResources: 195 },
      { project: 'BarBenders', plannedResources: 160, actualResources: 160 },
      { project: 'Masons', plannedResources: 140, actualResources: 150 },
      { project: 'Helpers', plannedResources: 210, actualResources: 230 },
      { project: 'Carpenters', plannedResources: 120, actualResources: 110 },
    ],
  },

  [ROLES.SITE_SUPERVISOR]: {
    completionRate: '62.0%',
    eac: '800K',
    utilBudget: '60.0%',
    spent: '480K',
    total: '800K',
    costBreakdown: {
      donut: [
        { name: 'Gang A (Concrete)', value: 31.25 },
        { name: 'Gang B (Steel)', value: 29.17 },
        { name: 'Gang C (Masonry)', value: 25.0 },
        { name: 'Gang D (Helpers)', value: 14.58 },
      ],
      table: [
        { category: 'Gang A (Concrete)', amount: '150K', color: 'bg-rose-50 text-slate-800' },
        { category: 'Gang B (Steel)', amount: '140K', color: 'bg-rose-100/70 text-slate-800' },
        { category: 'Gang C (Masonry)', amount: '120K', color: 'bg-rose-200/70 text-slate-800' },
        { category: 'Gang D (Helpers)', amount: '70K', color: 'bg-rose-300/80 text-slate-900' },
      ],
    },
    workload: [
      { project: 'Zone 1 Pour', completed: 210, remaining: 40, overdue: 0 },
      { project: 'Zone 2 Rebar', completed: 190, remaining: 60, overdue: 10 },
      { project: 'Zone 3 Mesh', completed: 150, remaining: 90, overdue: 0 },
      { project: 'Zone 4 Form', completed: 130, remaining: 110, overdue: 15 },
    ],
    budgetVariance: [
      { project: 'Zone 1', actualBudget: 160, plannedBudget: 150 },
      { project: 'Zone 2', actualBudget: 140, plannedBudget: 140 },
      { project: 'Zone 3', actualBudget: 120, plannedBudget: 130 },
      { project: 'Zone 4', actualBudget: 90, plannedBudget: 85 },
    ],
    resources: [
      { project: 'Masons', plannedResources: 140, actualResources: 140 },
      { project: 'BarBenders', plannedResources: 160, actualResources: 160 },
      { project: 'Helpers', plannedResources: 120, actualResources: 125 },
      { project: 'Operators', plannedResources: 80, actualResources: 80 },
    ],
  },

  [ROLES.PROCUREMENT_STORE]: {
    completionRate: '80.0%',
    eac: '2.4M',
    utilBudget: '74.0%',
    spent: '1.77M',
    total: '2.4M',
    costBreakdown: {
      donut: [
        { name: '12mm Steel', value: 32.8 },
        { name: 'RMC Concrete', value: 24.8 },
        { name: 'OPC Cement', value: 23.4 },
        { name: 'Aggregates', value: 15.3 },
        { name: 'Binding Wire', value: 3.7 },
      ],
      table: [
        { category: '12mm Steel', amount: '450K', color: 'bg-blue-50 text-slate-800' },
        { category: 'RMC Concrete', amount: '340K', color: 'bg-blue-100/70 text-slate-800' },
        { category: 'OPC Cement', amount: '320K', color: 'bg-blue-200/70 text-slate-800' },
        { category: 'Aggregates', amount: '210K', color: 'bg-blue-300/80 text-slate-900' },
        { category: 'Binding Wire', amount: '45K', color: 'bg-blue-600 text-white font-bold' },
      ],
    },
    workload: [
      { project: 'PO #401 Steel', completed: 280, remaining: 20, overdue: 0 },
      { project: 'PO #402 RMC', completed: 240, remaining: 50, overdue: 0 },
      { project: 'PO #403 Cement', completed: 210, remaining: 40, overdue: 10 },
      { project: 'PO #404 Sand', completed: 180, remaining: 60, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'PO #401', actualBudget: 460, plannedBudget: 450 },
      { project: 'PO #402', actualBudget: 340, plannedBudget: 350 },
      { project: 'PO #403', actualBudget: 330, plannedBudget: 320 },
      { project: 'PO #404', actualBudget: 210, plannedBudget: 210 },
    ],
    resources: [
      { project: 'Trucks', plannedResources: 180, actualResources: 190 },
      { project: 'StoreStaff', plannedResources: 90, actualResources: 90 },
      { project: 'Forklifts', plannedResources: 110, actualResources: 110 },
    ],
  },

  [ROLES.COST_COORDINATOR]: {
    completionRate: '68.0%',
    eac: '5.0Cr',
    utilBudget: '96.0%',
    spent: '4.8Cr',
    total: '5.0Cr',
    costBreakdown: {
      donut: [
        { name: 'Concrete Head', value: 55.5 },
        { name: 'Steel Head', value: 23.8 },
        { name: 'Formwork Head', value: 12.7 },
        { name: 'Waterproofing', value: 8.0 },
      ],
      table: [
        { category: 'Concrete Head', amount: '3.50L', color: 'bg-amber-50 text-slate-800' },
        { category: 'Steel Head', amount: '1.50L', color: 'bg-amber-100/70 text-slate-800' },
        { category: 'Formwork Head', amount: '80K', color: 'bg-amber-200/70 text-slate-800' },
        { category: 'Waterproofing', amount: '50K', color: 'bg-amber-300/80 text-slate-900' },
      ],
    },
    workload: [
      { project: 'RA Bill #01', completed: 290, remaining: 10, overdue: 0 },
      { project: 'RA Bill #02', completed: 210, remaining: 80, overdue: 0 },
      { project: 'RA Bill #03', completed: 140, remaining: 120, overdue: 25 },
    ],
    budgetVariance: [
      { project: 'RA Bill #01', actualBudget: 350, plannedBudget: 350 },
      { project: 'RA Bill #02', actualBudget: 210, plannedBudget: 195 },
      { project: 'RA Bill #03', actualBudget: 140, plannedBudget: 150 },
    ],
    resources: [
      { project: 'QS Surveyors', plannedResources: 120, actualResources: 120 },
      { project: 'CostAuditors', plannedResources: 80, actualResources: 85 },
    ],
  },

  [ROLES.QUALITY_ENGINEER]: {
    completionRate: '85.0%',
    eac: '1.2M',
    utilBudget: '82.0%',
    spent: '980K',
    total: '1.2M',
    costBreakdown: {
      donut: [
        { name: 'NDT Testing', value: 35.7 },
        { name: 'Cube Testing', value: 28.5 },
        { name: 'Lab Clearance', value: 23.8 },
        { name: 'Rebar Cover', value: 12.0 },
      ],
      table: [
        { category: 'NDT Testing', amount: '25K', color: 'bg-fuchsia-50 text-slate-800' },
        { category: 'Lab Clearance', amount: '20K', color: 'bg-fuchsia-100/70 text-slate-800' },
        { category: 'Cube Testing', amount: '15K', color: 'bg-fuchsia-200/70 text-slate-800' },
        { category: 'Rebar Cover', amount: '10K', color: 'bg-fuchsia-300/80 text-slate-900' },
      ],
    },
    workload: [
      { project: 'PrePour Check', completed: 270, remaining: 30, overdue: 0 },
      { project: 'Rebar Inspection', completed: 250, remaining: 40, overdue: 0 },
      { project: 'Honeycombing', completed: 180, remaining: 60, overdue: 20 },
    ],
    budgetVariance: [
      { project: 'PrePour', actualBudget: 180, plannedBudget: 180 },
      { project: 'Rebar', actualBudget: 150, plannedBudget: 150 },
      { project: 'Honeycombing', actualBudget: 90, plannedBudget: 80 },
    ],
    resources: [
      { project: 'Inspectors', plannedResources: 140, actualResources: 140 },
      { project: 'LabTechs', plannedResources: 90, actualResources: 90 },
    ],
  },

  [ROLES.DATA_ANALYST]: {
    completionRate: '78.7%',
    eac: '4.2M',
    utilBudget: '64.5%',
    spent: '2.7M',
    total: '4.2M',
    costBreakdown: {
      donut: [
        { name: 'DPR Data Pipelines', value: 35.0 },
        { name: 'Cumulative Aggregation', value: 35.0 },
        { name: 'Site Evidence Analytics', value: 30.0 },
      ],
      table: [
        { category: 'Daily Progress Report (DPR) Analytics Data Pipelines', amount: '100% Validated', color: 'bg-cyan-50 text-slate-800 font-semibold' },
        { category: 'Cumulative Progress & Achieved Rate Aggregation', amount: '68.5% Aggregated', color: 'bg-cyan-100/70 text-slate-800 font-semibold' },
        { category: 'Site Progress Evidence Analytics', amount: '100% Verified', color: 'bg-cyan-200/70 text-slate-800 font-semibold' },
      ],
    },
    workload: [
      { project: 'DPR Pipelines', completed: 290, remaining: 10, overdue: 0 },
      { project: 'Rate Aggregation', completed: 280, remaining: 20, overdue: 0 },
      { project: 'Evidence Analytics', completed: 250, remaining: 50, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'DPR Pipelines', actualBudget: 500, plannedBudget: 500 },
      { project: 'Rate Aggregation', actualBudget: 480, plannedBudget: 480 },
    ],
    resources: [
      { project: 'DataPipelines', plannedResources: 200, actualResources: 200 },
      { project: 'BatchRuns', plannedResources: 150, actualResources: 150 },
    ],
  },

  [ROLES.SYSTEM_ADMIN]: {
    completionRate: '99.9%',
    eac: '500K',
    utilBudget: '45.0%',
    spent: '225K',
    total: '500K',
    costBreakdown: {
      donut: [
        { name: 'Database Cluster', value: 40.0 },
        { name: 'API Server', value: 30.0 },
        { name: 'Batch Worker', value: 20.0 },
        { name: 'Security Audit', value: 10.0 },
      ],
      table: [
        { category: 'Database Cluster', amount: '< 15 ms', color: 'bg-slate-100 text-slate-800' },
        { category: 'API Server', amount: '99.9% Up', color: 'bg-slate-200/70 text-slate-800' },
        { category: 'Batch Worker', amount: 'Passed', color: 'bg-slate-300/70 text-slate-800' },
        { category: 'Security Audit', amount: '0 Violations', color: 'bg-slate-700 text-white font-bold' },
      ],
    },
    workload: [
      { project: 'DB Sync', completed: 300, remaining: 0, overdue: 0 },
      { project: 'Auth Sync', completed: 300, remaining: 0, overdue: 0 },
      { project: 'Audit Batch', completed: 295, remaining: 5, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'Cloud DB', actualBudget: 120, plannedBudget: 120 },
      { project: 'App Server', actualBudget: 105, plannedBudget: 105 },
    ],
    resources: [
      { project: 'CPU Cores', plannedResources: 160, actualResources: 140 },
      { project: 'RAM GB', plannedResources: 250, actualResources: 220 },
    ],
  },

  [ROLES.AUDITOR]: {
    completionRate: '98.5%',
    eac: '4.2M',
    utilBudget: '100.0%',
    spent: '4.2M',
    total: '4.2M',
    costBreakdown: {
      donut: [
        { name: 'DPR Data Pipelines', value: 35.0 },
        { name: 'Cumulative Aggregation', value: 35.0 },
        { name: 'Site Evidence Analytics', value: 30.0 },
      ],
      table: [
        { category: 'Daily Progress Report (DPR) Analytics Data Pipelines', amount: '100% Verified', color: 'bg-emerald-50 text-slate-800 font-semibold' },
        { category: 'Cumulative Progress & Achieved Rate Aggregation', amount: '100% Verified', color: 'bg-emerald-100/70 text-slate-800 font-semibold' },
        { category: 'Site Progress Evidence Analytics', amount: '100% Verified', color: 'bg-emerald-200/70 text-slate-800 font-semibold' },
      ],
    },
    workload: [
      { project: 'DPR Trail', completed: 300, remaining: 0, overdue: 0 },
      { project: 'Rate Aggregation', completed: 295, remaining: 5, overdue: 0 },
      { project: 'Evidence Analytics', completed: 290, remaining: 10, overdue: 0 },
    ],
    budgetVariance: [
      { project: 'DPR Audit', actualBudget: 200, plannedBudget: 200 },
      { project: 'Rate Audit', actualBudget: 180, plannedBudget: 180 },
    ],
    resources: [
      { project: 'Auditors', plannedResources: 100, actualResources: 100 },
      { project: 'Reviewers', plannedResources: 80, actualResources: 80 },
    ],
  },
};

// Custom Label for Pie Chart Slices matching screenshot
const renderCustomizedPieLabel = ({ cx, cy, midAngle, outerRadius, percent }: any) => {
  const RADIAN = Math.PI / 180;
  const radius = outerRadius + 12;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text
      x={x}
      y={y}
      fill="#475569"
      textAnchor={x > cx ? 'start' : 'end'}
      dominantBaseline="central"
      fontSize={9}
      fontWeight={700}
    >
      {`${(percent * 100).toFixed(1)}%`}
    </text>
  );
};

// Dynamic Filter Transformer function
function getFilteredData(baseSpec: any, baseKpis: any[], filter: string) {
  if (filter === 'All') {
    return { roleSpec: baseSpec, kpis: baseKpis };
  }

  if (filter === 'In Progress') {
    return {
      roleSpec: {
        ...baseSpec,
        completionRate: '68.5%',
        utilBudget: '62.4%',
        workload: baseSpec.workload.map((item: any) => ({
          ...item,
          completed: Math.round(item.completed * 0.6),
          remaining: item.remaining + 25,
          overdue: 0,
        })),
        budgetVariance: baseSpec.budgetVariance.map((b: any) => ({
          ...b,
          actualBudget: Math.round(b.plannedBudget * 0.96),
        })),
      },
      kpis: baseKpis.map((kpi: any) => ({
        ...kpi,
        subtext: kpi.subtext ? `${kpi.subtext} • Active` : 'In Progress Focus',
      })),
    };
  }

  if (filter === 'Pending') {
    return {
      roleSpec: {
        ...baseSpec,
        completionRate: '34.2%',
        utilBudget: '38.1%',
        spent: '1.2M',
        workload: baseSpec.workload.map((item: any) => ({
          ...item,
          completed: 0,
          remaining: item.remaining,
          overdue: item.overdue > 0 ? item.overdue : 35,
        })),
        budgetVariance: baseSpec.budgetVariance.map((b: any) => ({
          ...b,
          actualBudget: Math.round(b.plannedBudget * 1.15),
        })),
        resources: baseSpec.resources.map((r: any) => ({
          ...r,
          actualResources: Math.round(r.plannedResources * 0.8),
        })),
      },
      kpis: baseKpis.map((kpi: any) => ({
        ...kpi,
        subtext: 'Pending Action / Overdue',
        tone: 'danger',
      })),
    };
  }

  if (filter === 'Completed') {
    return {
      roleSpec: {
        ...baseSpec,
        completionRate: '100%',
        utilBudget: '100%',
        spent: baseSpec.total,
        workload: baseSpec.workload.map((item: any) => ({
          ...item,
          completed: item.completed + item.remaining + item.overdue,
          remaining: 0,
          overdue: 0,
        })),
        budgetVariance: baseSpec.budgetVariance.map((b: any) => ({
          ...b,
          actualBudget: b.plannedBudget,
        })),
        resources: baseSpec.resources.map((r: any) => ({
          ...r,
          actualResources: r.plannedResources,
        })),
      },
      kpis: baseKpis.map((kpi: any) => ({
        ...kpi,
        value: kpi.value.includes('%') ? '100%' : kpi.value,
        subtext: 'Completed & Verified',
        tone: 'success',
      })),
    };
  }

  return { roleSpec: baseSpec, kpis: baseKpis };
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const [statusFilter, setStatusFilter] = useState('All');
  
  // Dynamic role automatically derived from logged-in user context
  const userRole = (user?.roles?.[0] ?? ROLES.DIRECTOR) as Role;

  const rawConfig = ROLE_DASHBOARDS_DATA[userRole] ?? ROLE_DASHBOARDS_DATA[ROLES.DIRECTOR];
  const rawRoleSpec = ROLE_DATA_SPEC[userRole] ?? ROLE_DATA_SPEC[ROLES.DIRECTOR];
  const theme = ROLE_THEMES[userRole] ?? ROLE_THEMES[ROLES.DIRECTOR];

  const { roleSpec, kpis } = getFilteredData(rawRoleSpec, rawConfig.kpis, statusFilter);

  // Top 4 KPI Cards across top row matching template structure
  const top4Kpis = [
    { label: 'Project Completion Rate', value: roleSpec.completionRate, subtext: 'Overall Progress' },
    { label: 'Expected Final Cost', value: roleSpec.eac, subtext: 'Estimated Total' },
    { label: kpis[0]?.label ?? 'Project Health Index', value: (kpis[0]?.value ?? '78.7 / 100').replace(/\$/g, ''), subtext: kpis[0]?.subtext ?? 'Health Score' },
    { label: 'Utilized Budget', value: roleSpec.utilBudget, subtext: `Spent: ${roleSpec.spent} / Total: ${roleSpec.total}` },
  ];

  // Role-specific chart variation configuration per role
  const isAreaRole = [ROLES.DIRECTOR, ROLES.SYSTEM_ADMIN, ROLES.PROCUREMENT_STORE, ROLES.DATA_ANALYST].includes(userRole);
  const isPieRole = [ROLES.PROJECT_MANAGER, ROLES.COST_COORDINATOR, ROLES.QUALITY_ENGINEER].includes(userRole);

  return (
    /* Fits 100% inside AppShell main container without triggering window scrollbar */
    <div className="-mx-4 -my-4 sm:-mx-6 sm:-my-6 h-[calc(100vh-3.75rem)] p-2 md:p-3 bg-[#e5e7eb] flex flex-col box-border overflow-hidden">
      {/* Outer Bordered Template Frame (Matching Image Border & Single Screen Fit) */}
      <div className="h-full w-full max-w-[1650px] mx-auto bg-white rounded-2xl p-2.5 md:p-3 border border-slate-300 shadow-xl flex flex-col gap-2 overflow-hidden">
        
        {/* Template Header Bar with Interactive Status Filters */}
        <div className="h-8 flex-shrink-0 flex items-center justify-between pb-1 gap-2 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <h1 className="text-base md:text-lg font-bold text-slate-900 tracking-tight">
              Construction Project Monitoring Dashboard
            </h1>
            <span className={`hidden sm:inline-block text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${theme.badgeBg}`}>
              Role: {rawConfig.title}
            </span>
          </div>

          {/* Interactive Filter Pills: All | In Progress | Pending | Completed */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
            {['All', 'In Progress', 'Pending', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-2.5 py-0.5 rounded-md text-[11px] font-bold transition-all ${
                  statusFilter === tab
                    ? `${theme.tabActive} shadow-xs`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* TOP ROW: 4 KPI Summary Cards Side-by-Side Across Top */}
        <div className="grid grid-cols-4 gap-2.5 flex-shrink-0">
          {top4Kpis.map((kpi, idx) => (
            <div
              key={idx}
              className="bg-slate-50/90 p-2 rounded-xl border border-slate-200/90 flex flex-col items-center justify-center text-center h-16 hover:bg-white hover:shadow-xs transition-all space-y-0.5"
            >
              <span className="text-[11px] font-bold text-slate-600 line-clamp-1">{kpi.label}</span>
              <span className="text-xl font-black text-slate-900 tracking-tight">{kpi.value}</span>
            </div>
          ))}
        </div>

        {/* MAIN BODY: 6 ROLE-SPECIFIC CHART CARDS IN A 3-COLUMN x 2-ROW GRID */}
        <div className="flex-1 min-h-0 grid grid-cols-3 grid-rows-2 gap-2.5 overflow-hidden">
          
          {/* Card 1 (Top Left): Role-Specific Main Trend (Area Chart vs Spline Line Chart) */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">
              {isAreaRole ? 'Portfolio Cumulative Trend' : 'Budget Variance - Top 5 Projects'}
            </h3>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                {isAreaRole ? (
                  <AreaChart data={roleSpec.budgetVariance} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`areaColorActual-${userRole}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.primary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.primary} stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id={`areaColorPlanned-${userRole}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={theme.secondary} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={theme.secondary} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="project" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                    <Area type="monotone" dataKey="actualBudget" stroke={theme.primary} fillOpacity={1} fill={`url(#areaColorActual-${userRole})`} name="Actual Budget" />
                    <Area type="monotone" dataKey="plannedBudget" stroke={theme.secondary} fillOpacity={1} fill={`url(#areaColorPlanned-${userRole})`} name="Planned Budget" />
                  </AreaChart>
                ) : (
                  <LineChart data={roleSpec.budgetVariance} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="project" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                    <Line type="monotone" dataKey="plannedBudget" name="Planned Budget" stroke={theme.secondary} strokeWidth={2.5} dot={{ r: 3.5, fill: theme.secondary }} />
                    <Line type="monotone" dataKey="actualBudget" name="Actual Budget" stroke={theme.primary} strokeWidth={2.5} dot={{ r: 3.5, fill: theme.primary }} />
                  </LineChart>
                )}
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 font-bold pt-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 rounded-xs" style={{ backgroundColor: theme.primary }} /> ~ Actual Budget</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5 rounded-xs" style={{ backgroundColor: theme.secondary }} /> ~ Planned Budget</span>
            </div>
          </div>

          {/* Card 2 (Top Middle): Role-Specific Distribution Chart (Donut vs Solid Pie) */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">
              {isPieRole ? 'Category Distribution Pie' : 'Cost Breakdown Donut'}
            </h3>
            <div className="flex-1 min-h-0 w-full relative flex items-center justify-center py-0.5">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={roleSpec.costBreakdown.donut}
                    cx="50%"
                    cy="50%"
                    innerRadius={isPieRole ? 0 : 28}
                    outerRadius={42}
                    paddingAngle={2}
                    dataKey="value"
                    label={renderCustomizedPieLabel}
                    labelLine={false}
                  >
                    {roleSpec.costBreakdown.donut.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={theme.donut[index % theme.donut.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} formatter={(v: any) => [`${v}%`, '']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 3 (Top Right): Monthly Performance Bar Chart */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">Monthly Performance Target</h3>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roleSpec.budgetVariance} margin={{ top: 5, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="project" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="actualBudget" fill={theme.secondary} radius={[3, 3, 0, 0]} name="Actual Budget" />
                  <Bar dataKey="plannedBudget" fill={theme.primary} radius={[3, 3, 0, 0]} name="Planned Budget" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Card 4 (Bottom Left): Workload Stacked Bar Chart */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">Workload - Top 5 Projects</h3>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={roleSpec.workload}
                  margin={{ top: 5, right: 10, left: 5, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <YAxis dataKey="project" type="category" tick={{ fontSize: 9, fill: '#334155', fontWeight: 600 }} axisLine={false} tickLine={false} width={65} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="completed" stackId="a" fill={theme.workload.completed}>
                    <LabelList dataKey="completed" position="center" fill="#ffffff" fontSize={9} fontWeight={700} />
                  </Bar>
                  <Bar dataKey="remaining" stackId="a" fill={theme.workload.remaining}>
                    <LabelList dataKey="remaining" position="center" fill="#0f172a" fontSize={8} fontWeight={700} />
                  </Bar>
                  <Bar dataKey="overdue" stackId="a" fill={theme.workload.overdue}>
                    <LabelList dataKey="overdue" position="center" fill="#0f172a" fontSize={8} fontWeight={700} />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 font-bold pt-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.workload.completed }} /> Completed</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.workload.remaining }} /> Remaining</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.workload.overdue }} /> OverDue</span>
            </div>
          </div>

          {/* Card 5 (Bottom Middle): Cost Breakdown Shaded Table */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">Cost Breakdown Summary Table</h3>
            <div className="flex-1 min-h-0 border border-slate-200 rounded-lg overflow-hidden text-[10px] my-auto">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-100">
                  {roleSpec.costBreakdown.table.map((row, idx) => (
                    <tr key={idx} className={`${row.color} transition-colors`}>
                      <td className="px-2.5 py-1.5 font-semibold">{row.category}</td>
                      <td className="px-2.5 py-1.5 font-mono font-bold text-right">{row.amount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Card 6 (Bottom Right): Actual vs Planned Resources Composed Chart */}
          <div className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/90 flex flex-col justify-between overflow-hidden">
            <h3 className="text-[11px] font-bold text-slate-900">Actual vs. Planned Resources</h3>
            <div className="flex-1 min-h-0 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={roleSpec.resources} margin={{ top: 8, right: 10, left: -22, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="project" tick={{ fontSize: 9, fill: '#475569', fontWeight: 600 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '6px', color: '#fff', fontSize: '11px' }} />
                  <Bar dataKey="plannedResources" fill={theme.composedBar} radius={[3, 3, 0, 0]} barSize={16} name="Planned Resources" />
                  <Line type="monotone" dataKey="actualResources" stroke={theme.composedLine} strokeWidth={2.5} dot={{ r: 3.5, fill: theme.composedLine }} name="Actual Resources" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
            <div className="flex items-center justify-center gap-3 text-[9px] text-slate-600 font-bold pt-1">
              <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-xs" style={{ backgroundColor: theme.composedBar }} /> Planned Resources</span>
              <span className="flex items-center gap-1"><span className="w-2.5 h-0.5" style={{ backgroundColor: theme.composedLine }} /> ~ Actual Resources</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
