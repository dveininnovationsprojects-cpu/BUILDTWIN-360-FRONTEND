import {
  LayoutDashboard,
  Building2,
  ListTree,
  ClipboardList,
  HardHat,
  Boxes,
  Truck,
  Wallet,
  ShieldCheck,
  AlertTriangle,
  Wrench,
  FolderOpen,
  Bell,
  LineChart,
  FileBarChart,
  History,
} from 'lucide-react';
import { ROLES } from './roles';

// One nav entry per backend domain module (spec section 12.2), so frontend
// module boundaries stay 1:1 with the API/service boundaries.
export const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboards', to: '/dashboard', icon: LayoutDashboard },
  { key: 'projects', label: 'Projects', to: '/projects', icon: Building2 },
  { key: 'wbs-schedule', label: 'WBS & Schedule', to: '/wbs-schedule', icon: ListTree },
  { key: 'progress-dpr', label: 'Daily Progress (DPR)', to: '/dpr', icon: ClipboardList },
  { key: 'labour-contractors', label: 'Labour & Contractors', to: '/labour', icon: HardHat },
  { key: 'materials-inventory', label: 'Materials & Inventory', to: '/materials', icon: Boxes },
  { key: 'procurement', label: 'Procurement & Suppliers', to: '/procurement', icon: Truck },
  {
    key: 'cost-control',
    label: 'Cost & Budget',
    to: '/cost',
    icon: Wallet,
    roles: [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.COST_COORDINATOR],
  },
  { key: 'quality', label: 'Quality & NCR', to: '/quality', icon: ShieldCheck },
  { key: 'issues-risks', label: 'Issues & Risks', to: '/issues', icon: AlertTriangle },
  { key: 'equipment', label: 'Equipment', to: '/equipment', icon: Wrench },
  { key: 'documents', label: 'Documents', to: '/documents', icon: FolderOpen },
  { key: 'notifications', label: 'Notifications', to: '/notifications', icon: Bell },
  {
    key: 'analytics',
    label: 'Construction Intelligence',
    to: '/analytics',
    icon: LineChart,
    roles: [ROLES.DIRECTOR, ROLES.PROJECT_MANAGER, ROLES.DATA_ANALYST],
  },
  { key: 'reports', label: 'Reports', to: '/reports', icon: FileBarChart },
  {
    key: 'audit',
    label: 'Audit Log',
    to: '/audit',
    icon: History,
    roles: [ROLES.SYSTEM_ADMIN, ROLES.AUDITOR, ROLES.DIRECTOR],
  },
];
