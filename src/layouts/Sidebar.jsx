import { NavLink } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import buildTwinLogo from '@/assets/BuildTwin360-LOGO.png';
import { cn } from '@/design-system/utils/cn';
import { NAV_ITEMS } from '@/constants/navigation';
import { useHasRole } from '@/context/authStore';
import { useTheme } from '@/context/themeStore';

export function Sidebar({ isOpen, onToggle, onNavigate }) {
  const { theme } = useTheme();

  return (
    <>
      <div aria-hidden="true" onClick={onToggle} className={cn('fixed inset-0 z-40 bg-brand-950/45 transition-opacity md:hidden', isOpen ? 'opacity-100' : 'pointer-events-none opacity-0')} />
      <aside
        style={{ background: `linear-gradient(145deg, rgba(255,255,255,0.16), rgba(255,255,255,0.02)), ${theme.gradient}` }}
        className={cn('liquid-glass-sidebar fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col overflow-hidden text-brand-100 shadow-2xl transition-[width,transform] duration-300 ease-out md:relative md:z-auto md:shadow-none', isOpen ? 'translate-x-0' : '-translate-x-full md:w-20 md:translate-x-0')}
      >
        <div className={cn('border-b border-white/10 px-4 pt-4 pb-2', !isOpen && 'md:px-3')}>
          <div className={cn('flex flex-col items-center gap-3', !isOpen && 'md:gap-4')}>
            <div className={cn('flex w-full items-center gap-3', !isOpen && 'md:justify-center')}>
              <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-lg shadow-black/20 ring-2 ring-brand-300/70">
                <img src={buildTwinLogo} alt="BuildTwin 360 logo" className="h-full w-full scale-[1.4] object-contain" />
              </div>
              <div className={cn('min-w-0 transition-opacity duration-200', !isOpen && 'md:hidden')}>
                <span className="block text-[15px] font-bold tracking-wide text-white">BuildTwin 360</span>
                <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-brand-300">Site intelligence</span>
              </div>
            </div>
            <button
              type="button"
              aria-label={isOpen ? 'Collapse module menu' : 'Expand module menu'}
              title={isOpen ? 'Collapse menu' : 'Show modules'}
              onClick={onToggle}
              style={{ backgroundColor: theme.vars.brand800 }}
              className={cn('liquid-glass-button flex h-9 w-full items-center justify-center gap-2 rounded-lg text-brand-200 transition-colors hover:bg-brand-800 hover:text-white focus:outline-none focus:ring-2 focus:ring-brand-300', !isOpen && 'md:h-10 md:w-10 md:rounded-full md:bg-transparent')}
            >
              {isOpen ? <X className="h-4 w-4 md:hidden" /> : <Menu className="h-4 w-4" />}
              <Menu className={cn('hidden h-4 w-4', isOpen && 'md:block')} />
              <span className={cn('text-xs font-semibold uppercase tracking-[0.16em]', !isOpen && 'md:hidden')}>Menu</span>
            </button>
          </div>
        </div>
        <nav className="scrollbar-hidden flex-1 space-y-0 overflow-x-hidden overflow-y-auto px-3 py-0">
          {NAV_ITEMS.map((item) => <NavItemLink key={item.key} item={item} isOpen={isOpen} onNavigate={onNavigate} />)}
        </nav>
      </aside>
    </>
  );
}

function NavItemLink({ item, isOpen, onNavigate }) {
  const hasRole = useHasRole(...(item.roles ?? []));
  const visible = item.roles ? hasRole : true;
  if (!visible) return null;
  const Icon = item.icon;

  return (
    <NavLink to={item.to} onClick={onNavigate} className={({ isActive }) => cn('flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-sm font-medium transition-colors', !isOpen && 'md:justify-center md:px-2', isActive ? 'border-white/10 bg-white/10 text-white shadow-sm' : 'text-brand-200 hover:bg-white/5 hover:text-white')}>
      <Icon className="h-4 w-4" />
      <span className={cn('truncate transition-opacity duration-200', !isOpen && 'md:hidden')}>{item.label}</span>
    </NavLink>
  );
}
