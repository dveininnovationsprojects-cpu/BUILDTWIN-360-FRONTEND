import { useState } from 'react';
import { Bell, Search, ChevronDown, Menu } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Avatar } from '@/design-system/components/Avatar/Avatar';
import { Dropdown } from '@/design-system/components/Dropdown/Dropdown';
import { Button } from '@/design-system/components/Button/Button';
import { Modal } from '@/design-system/components/Modal/Modal';
import { ROLE_LABELS, useAuthStore } from '@/context/authStore';

export function Topbar({ onMenuToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);

  function confirmLogout() {
    setLogoutConfirmOpen(false);
    logout();
  }

  return (
    <header className="relative flex min-h-16 items-center justify-between border-b border-surface-border bg-surface-base px-4 shadow-[0_1px_0_rgba(15,42,74,0.03)] sm:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-3 text-ink-500">
        <button
          type="button"
          aria-label="Open module menu"
          title="Show modules"
          onClick={onMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-full max-w-3xl items-center gap-2 rounded-xl border border-white/80 bg-white/55 px-3 shadow-[0_4px_16px_rgba(15,42,74,0.06),inset_0_1px_0_rgba(255,255,255,0.8)] backdrop-blur-md transition-colors focus-within:border-brand-300 focus-within:bg-white/75">
          <Search className="h-4 w-4 shrink-0 text-ink-400" />
          <input
            placeholder="Search projects, activities, DPRs..."
            aria-label="Search projects, activities, and DPRs"
            className="min-w-0 flex-1 bg-transparent text-xs text-ink-700 outline-none placeholder:text-ink-300 sm:text-sm"
          />
        </div>
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
              <Avatar name={user?.name ?? 'Guest'} src={user?.avatar} className="bg-brand-600 text-white" />
              <span className="hidden text-left sm:block">
                <span className="block text-xs font-semibold leading-4 text-ink-900">{user?.name ?? 'Guest'}</span>
                <span className="block text-[11px] leading-4 text-ink-500">
                  {user ? ROLE_LABELS[user.roles[0]] : 'Local access'}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-ink-400" />
            </button>
          }
          items={
            user
              ? [
                  { label: user.email, onSelect: () => undefined },
                  { label: 'Profile', onSelect: () => navigate('/profile') },
                  { label: 'Settings', onSelect: () => navigate('/settings') },
                  { label: 'Log out', onSelect: () => setLogoutConfirmOpen(true), destructive: true },
                ]
              : [{ label: 'Sign in', onSelect: () => navigate('/login') }]
          }
        />
      </div>

      <Modal
        open={isLogoutConfirmOpen}
        onClose={() => setLogoutConfirmOpen(false)}
        title="Log out"
        size="sm"
        footer={
          <>
            <Button variant="outline" onClick={() => setLogoutConfirmOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={confirmLogout}>
              Log out
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink-700">Are you sure you want to sign out of BuildTwin 360?</p>
      </Modal>
    </header>
  );
}
