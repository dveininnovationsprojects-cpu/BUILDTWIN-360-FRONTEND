import { Bell, Search, ChevronDown } from 'lucide-react';
import { Avatar } from '@/design-system/components/Avatar/Avatar';
import { Dropdown } from '@/design-system/components/Dropdown/Dropdown';
import { useAuthStore } from '@/context/authStore';

export function Topbar() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface-base px-6">
      <div className="flex items-center gap-2 text-ink-500">
        <Search className="h-4 w-4" />
        <input
          placeholder="Search projects, activities, DPRs..."
          className="w-72 bg-transparent text-sm outline-none placeholder:text-ink-300"
        />
      </div>

      <div className="flex items-center gap-4">
        <button className="relative text-ink-500 hover:text-brand-600">
          <Bell className="h-5 w-5" />
          <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-status-danger text-[10px] text-white">
            3
          </span>
        </button>

        {user && (
          <Dropdown
            trigger={
              <div className="flex items-center gap-2 cursor-pointer">
                <Avatar name={user.name} />
                <ChevronDown className="h-4 w-4 text-ink-400" />
              </div>
            }
            items={[
              { label: 'Profile', onSelect: () => {} },
              { label: 'Log out', onSelect: logout, destructive: true },
            ]}
          />
        )}
      </div>
    </header>
  );
}
