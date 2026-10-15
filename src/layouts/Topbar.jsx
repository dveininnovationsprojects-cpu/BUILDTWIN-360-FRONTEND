import { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, Search, ChevronDown, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '@/design-system/components/Avatar/Avatar';
import { Dropdown } from '@/design-system/components/Dropdown/Dropdown';
import { Button } from '@/design-system/components/Button/Button';
import { Modal } from '@/design-system/components/Modal/Modal';
import { ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { NAV_ITEMS } from '@/constants/navigation';
import { normalizeRole } from '@/constants/roles';

export function Topbar({ onMenuToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return sessionStorage.getItem('buildtwin-search-query') ?? '';
    } catch {
      return '';
    }
  });

  const searchContainerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync search query to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('buildtwin-search-query', searchQuery);
    } catch {
      // Searching still works when browser storage is unavailable.
    }
  }, [searchQuery]);

  // Collapse dropdown on page navigation
  useEffect(() => {
    setDropdownOpen(false);
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  }, [location.pathname]);

  // Click outside listener to collapse search bar
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownOpen(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Keyboard shortcut listener (/ or Ctrl+K / Cmd+K to open search, Escape to close)
  useEffect(() => {
    function handleKeyDown(event) {
      const isInput = ['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName);

      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 80);
      } else if (event.key === '/' && !isInput) {
        event.preventDefault();
        setIsSearchExpanded(true);
        setTimeout(() => inputRef.current?.focus(), 80);
      } else if (event.key === 'Escape' && isSearchExpanded) {
        setIsSearchExpanded(false);
        setDropdownOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded]);

  const searchResults = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();
    if (!normalizedQuery) return [];

    return NAV_ITEMS.filter((item) => {
      const userRoles = (user?.roles ?? []).map(normalizeRole);
      const canAccess = !item.roles || item.roles.some((role) => userRoles.includes(normalizeRole(role)));
      return canAccess && `${item.label} ${item.key}`.toLowerCase().includes(normalizedQuery);
    }).slice(0, 8);
  }, [searchQuery, user]);

  function openSearchResult(path) {
    setDropdownOpen(false);
    setIsSearchExpanded(false);
    navigate(path);
  }

  function handleSearchKeyDown(event) {
    if (event.key === 'Enter' && searchResults[0]) {
      event.preventDefault();
      openSearchResult(searchResults[0].to);
    }
  }

  function toggleSearch() {
    if (isSearchExpanded) {
      if (searchQuery.trim()) {
        setSearchQuery('');
      }
      setIsSearchExpanded(false);
      setDropdownOpen(false);
    } else {
      setIsSearchExpanded(true);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }

  function confirmLogout() {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="relative flex min-h-16 items-center justify-between bg-surface-subtle px-4 shadow-[0_1px_0_rgba(15,42,74,0.03)] sm:px-6">
      {/* Left Area: Mobile Menu Trigger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Open module menu"
          title="Show modules"
          onClick={onMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-brand-700 transition-colors hover:bg-brand-50 focus:outline-none focus:ring-2 focus:ring-brand-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Area: Expandable Search Bar + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Expandable Search Bar Component */}
        <div ref={searchContainerRef} className="relative flex items-center">
          <div
            className={`relative flex h-10 items-center overflow-hidden rounded-full border transition-all duration-300 ease-out ${
              isSearchExpanded
                ? 'w-64 sm:w-80 md:w-96 border-brand-300 bg-white shadow-[0_4px_18px_rgba(15,42,74,0.08)] ring-2 ring-brand-100/80'
                : 'w-10 border-transparent bg-transparent hover:bg-brand-50'
            }`}
          >
            <button
              type="button"
              aria-label="Search"
              title={isSearchExpanded ? 'Search' : 'Search projects, activities, DPRs... (Press / or Ctrl+K)'}
              onClick={toggleSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-500 transition-colors hover:text-brand-600 focus:outline-none"
            >
              <Search className="h-4 w-4 shrink-0 transition-transform duration-200 hover:scale-110" />
            </button>

            {/* Input is visible when expanded */}
            <input
              ref={inputRef}
              value={searchQuery}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => {
                setIsSearchExpanded(true);
                setDropdownOpen(Boolean(searchQuery.trim()));
              }}
              onKeyDown={handleSearchKeyDown}
              placeholder="Search projects, activities, DPRs..."
              aria-label="Search projects, activities, and DPRs"
              tabIndex={isSearchExpanded ? 0 : -1}
              className={`min-w-0 flex-1 bg-transparent text-xs text-ink-800 outline-none placeholder:text-ink-400 sm:text-sm transition-opacity duration-200 ${
                isSearchExpanded ? 'opacity-100 pr-2' : 'pointer-events-none opacity-0'
              }`}
            />

            {/* Close / Clear Button */}
            {isSearchExpanded && (
              <button
                type="button"
                aria-label="Close search"
                title="Close search (Esc)"
                onClick={toggleSearch}
                className="mr-2 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-ink-400 transition-colors hover:bg-surface-subtle hover:text-ink-700 focus:outline-none"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Search Results Dropdown */}
          {isSearchExpanded && isDropdownOpen && searchQuery.trim() && (
            <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 md:w-96 overflow-hidden rounded-xl border border-surface-border bg-white shadow-xl animate-fadeIn">
              <div className="flex items-center justify-between border-b border-surface-border bg-surface-subtle px-3.5 py-2 text-[11px] font-bold uppercase tracking-wider text-ink-400">
                <span>Quick Results</span>
                <span className="font-mono text-[10px] text-ink-400">{searchResults.length} found</span>
              </div>
              <div className="max-h-72 overflow-y-auto py-1">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => {
                    const ItemIcon = item.icon;
                    return (
                      <button
                        key={item.key}
                        type="button"
                        onClick={() => openSearchResult(item.to)}
                        className="group flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-ink-700 transition-colors hover:bg-brand-50 hover:text-brand-900"
                      >
                        {ItemIcon && <ItemIcon className="h-4 w-4 shrink-0 text-ink-400 transition-colors group-hover:text-brand-600" />}
                        <span className="font-medium text-ink-800 transition-colors group-hover:text-brand-900">{item.label}</span>
                      </button>
                    );
                  })
                ) : (
                  <p className="px-4 py-4 text-center text-xs text-ink-500">
                    No matching content found for "<span className="font-semibold text-brand-900">{searchQuery}</span>".
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Notifications Icon Button */}
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

        {/* User Profile Dropdown */}
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
                  {user ? (ROLE_LABELS[normalizeRole(user.roles?.[0])] || user.roles?.[0] || 'User') : 'Local access'}
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

      {/* Logout Confirmation Modal */}
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
