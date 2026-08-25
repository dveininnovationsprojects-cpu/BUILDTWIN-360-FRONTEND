import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { cn } from '@/design-system/utils/cn';
import { NAV_ITEMS } from '@/constants/navigation';
import { useAuthStore, useHasRole } from '@/context/authStore';

export function Sidebar({
  isOpen,
  onToggle,
  onNavigate,
}: {
  isOpen: boolean;
  onToggle: () => void;
  onNavigate: () => void;
}) {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onToggle}
        className={cn('fixed inset-0 z-40 bg-brand-950/45 transition-opacity md:hidden', isOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
      />
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-hidden bg-brand-950 text-brand-100 shadow-2xl transition-[width,transform] duration-300 ease-out md:relative md:z-auto md:shadow-none',
          isOpen ? 'translate-x-0' : '-translate-x-full md:w-20 md:translate-x-0',
        )}
      >
        <div className={cn('border-b border-white/10 px-4 py-5', !isOpen && 'md:px-3')}>
          <div className={cn('flex items-center gap-3', !isOpen && 'md:justify-center')}>
            <button type="button" aria-label={isOpen ? 'Collapse module menu' : 'Expand module menu'} title={isOpen ? 'Collapse menu' : 'Show modules'} onClick={onToggle} className={cn('flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 border-brand-300 text-brand-200 transition-all duration-200 hover:border-white hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-300', !isOpen && 'md:order-2')}>
              {isOpen ? <><X className="h-5 w-5 md:hidden" /><Menu className="hidden h-5 w-5 md:block" /></> : <Menu className="h-5 w-5" />}
            </button>
            <div className={cn('min-w-0 transition-opacity duration-200', !isOpen && 'md:hidden')}>
              <span className="block text-[15px] font-bold tracking-wide text-white">BuildTwin 360</span>
              <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-brand-300">Site intelligence</span>
            </div>
          </div>
        </div>

        <nav className="scrollbar-hidden flex-1 space-y-1 overflow-x-hidden overflow-y-auto px-3 py-5">
          {NAV_ITEMS.map((item) => (
            <NavItemLink key={item.key} item={item} isOpen={isOpen} onNavigate={onNavigate} />
          ))}
        </nav>

        {user && isOpen && (
          <div className="border-t border-white/10 px-4 py-4 text-xs text-brand-300">
            Signed in as <span className="font-medium text-brand-100">{user.name}</span>
          </div>
        )}
      </aside>
    </>
  );
}

function NavItemLink({ item, isOpen, onNavigate }: { item: (typeof NAV_ITEMS)[number]; isOpen: boolean; onNavigate: () => void }) {
  const hasRole = useHasRole(...(item.roles ?? []));
  const visible = item.roles ? hasRole : true;
  if (!visible) return null;
  const Icon = item.icon;
  return (
    <NavLink
      to={item.to}
      onClick={onNavigate}
      className={({ isActive }) =>
        cn(
          'flex items-center gap-3 rounded-lg border border-transparent px-3 py-2.5 text-sm font-medium transition-colors',
          !isOpen && 'md:justify-center md:px-2',
          isActive ? 'border-white/10 bg-white/10 text-white shadow-sm' : 'text-brand-200 hover:bg-white/5 hover:text-white',
        )
      }
    >
      <Icon className="h-4 w-4" />
      <span className={cn('truncate transition-opacity duration-200', !isOpen && 'md:hidden')}>{item.label}</span>
    </NavLink>
  );
}
