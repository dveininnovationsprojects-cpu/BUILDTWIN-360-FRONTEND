import { NavLink } from 'react-router-dom';
import { cn } from '@/design-system/utils/cn';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuthStore, useHasRole } from '@/context/authStore';

export function Sidebar() {
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="flex w-64 shrink-0 flex-col bg-brand-900 text-brand-100">
      <div className="flex items-center gap-2 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded bg-brand-500 font-bold text-white">B</div>
        <span className="text-lg font-semibold text-white">BuildTwin 360</span>
      </div>

      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3">
        {NAV_ITEMS.map((item) => (
          <NavItemLink key={item.key} item={item} />
        ))}
      </nav>

      {user && (
        <div className="border-t border-brand-800 px-4 py-3 text-xs text-brand-300">
          Signed in as <span className="font-medium text-brand-100">{user.name}</span>
        </div>
      )}
    </aside>
  );
}

function NavItemLink({ item }: { item: (typeof NAV_ITEMS)[number] }) {
  const visible = item.roles ? useHasRole(...item.roles) : true;
  if (!visible) return null;
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
          isActive ? 'bg-brand-800 text-white' : 'text-brand-200 hover:bg-brand-800/60 hover:text-white',
        )
      }
    >
      <Icon className="h-4 w-4" />
      {item.label}
    </NavLink>
  );
}
