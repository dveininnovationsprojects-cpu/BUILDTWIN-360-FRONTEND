import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/design-system/components/Avatar/Avatar';
import { Dropdown } from '@/design-system/components/Dropdown/Dropdown';
import { useAuthStore } from '@/context/authStore';

export function Topbar({ onMenuToggle }: { onMenuToggle: () => void }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  return (
    <header className="relative flex min-h-16 items-center justify-between border-b border-surface-border bg-surface-base px-4 shadow-[0_1px_0_rgba(15,42,74,0.03)] sm:px-6">
      <div className="flex min-w-0 items-center gap-3 text-ink-500">
        <button type="button" aria-label="Open module menu" title="Show modules" onClick={onMenuToggle} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-200 md:hidden">
          <Menu className="h-5 w-5" />
        </button>
        <Search className="h-4 w-4" />
        <input
          placeholder="Search projects, activities, DPRs..."
          aria-label="Search projects, activities, and DPRs"
          className="w-40 bg-transparent text-sm outline-none placeholder:text-ink-300 sm:w-72"
        />
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <button
          type="button"
          aria-label="Open notifications"
          title="Notifications"
          onClick={() => navigate('/notifications')}
          className="relative flex h-10 w-10 items-center justify-center rounded-full text-ink-500 transition-colors hover:bg-brand-50 hover:text-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-200"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-base bg-status-danger px-0.5 text-[10px] font-bold leading-none text-white">
            3
          </span>
        </button>

        <Dropdown
          trigger={
            <button
              type="button"
              aria-label={user ? `Open profile menu for ${user.name}` : 'Open profile menu'}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-subtle focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <Avatar name={user?.name ?? 'Guest'} className="bg-brand-600 text-white" />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-4 text-ink-900">{user?.name ?? 'Guest'}</span>
                <span className="block text-[11px] leading-4 text-ink-500">{user ? 'System admin' : 'Local access'}</span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </button>
          }
          items={user
            ? [
                { label: user.email, onSelect: () => undefined },
                { label: 'Log out', onSelect: logout, destructive: true },
              ]
            : [{ label: 'Sign in', onSelect: () => navigate('/login') }]}
        />
      </div>
    </header>
  );
}
