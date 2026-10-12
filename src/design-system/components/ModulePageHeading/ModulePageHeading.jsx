import {
  AlertTriangle,
  BarChart3,
  Bell,
  Building2,
  ClipboardList,
  FileBarChart,
  FolderOpen,
  HardHat,
  History,
  ListTree,
  Package,
  ShieldCheck,
  Truck,
  UserCircle,
  UserRound,
  Wallet,
  Wrench,
  Settings,
} from 'lucide-react';

const MODULE_ICONS = {
  'Audit Trail & Logs': History,
  'Construction Projects': Building2,
  'WBS & Construction Scheduling': ListTree,
  'Daily Progress Report (DPR)': ClipboardList,
  'Labour & Contractors': HardHat,
  'Materials & Inventory Control': Package,
  'Procurement & Suppliers': Truck,
  'Cost Control & Budget': Wallet,
  'Quality & Inspections (NCR)': ShieldCheck,
  'Issues & Risks': AlertTriangle,
  'Equipment & Machinery': Wrench,
  'Documents & Drawings': FolderOpen,
  'Notifications & Alerts': Bell,
  'Executive Analytics': BarChart3,
  'Reports & Exports': FileBarChart,
  'Users & Access': UserRound,
  Settings,
  'My Profile': UserCircle,
};

export function ModulePageHeading({ children, title }) {
  const label = title || children;
  const Icon = MODULE_ICONS[label] || Building2;

  return (
    <h1 className="page-heading flex items-center gap-2">
      <Icon className="h-6 w-6 shrink-0 text-brand-600" aria-hidden="true" />
      {children || title}
    </h1>
  );
}
