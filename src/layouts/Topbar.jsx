import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  Search,
  ChevronDown,
  Menu,
  X,
  CheckCheck,
  Check,
  RefreshCw,
  AlertTriangle,
  Flame,
  Package,
  ShieldAlert,
  ArrowRight,
  ExternalLink,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Avatar } from '@/design-system/components/Avatar/Avatar';
import { Dropdown } from '@/design-system/components/Dropdown/Dropdown';
import { Button } from '@/design-system/components/Button/Button';
import { Modal } from '@/design-system/components/Modal/Modal';
import { ROLE_LABELS, useAuthStore } from '@/context/authStore';
import { NAV_ITEMS } from '@/constants/navigation';
import { normalizeRole } from '@/constants/roles';
import { useNotifications } from '@/hooks/useNotifications';

function formatRelativeTime(dateStr) {
  if (!dateStr) return '';
  try {
    const now = new Date();
    const date = new Date(dateStr);
    const diffSec = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHour = Math.floor(diffMin / 60);
    if (diffHour < 24) return `${diffHour}h ago`;
    const diffDay = Math.floor(diffHour / 24);
    if (diffDay < 7) return `${diffDay}d ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  } catch {
    return '';
  }
}

export function Topbar({ onMenuToggle }) {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const {
    notifications = [],
    unreadCount = 0,
    urgentCount = 0,
    loading: isNotifsLoading,
    markRead,
    markAllRead,
    refresh: refreshNotifications,
  } = useNotifications();

  const [isLogoutConfirmOpen, setLogoutConfirmOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifFilter, setNotifFilter] = useState('ALL'); // 'ALL' | 'UNREAD'

  const [backendStatus, setBackendStatus] = useState({
    checked: false,
    online: false,
    details: 'Checking Spring Boot connection...',
  });

  useEffect(() => {
    let isMounted = true;
    async function checkHealth() {
      try {
        let res = null;
        try {
          res = await fetch('/api/v1/health', { method: 'GET' });
        } catch {
          try {
            res = await fetch('/swagger-ui.html', { method: 'GET' });
          } catch {
            res = await fetch('/v3/api-docs', { method: 'GET' });
          }
        }

        if (isMounted) {
          if (res && res.ok) {
            setBackendStatus({ online: true, checked: true, details: 'Spring Boot 3.0 Connected (PostgreSQL :8080)' });
          } else {
            setBackendStatus({ online: false, checked: true, details: `Backend status: ${res?.status ?? 'unavailable'}` });
          }
        }
      } catch {
        if (isMounted) {
          setBackendStatus({ online: false, checked: true, details: 'Spring Boot Backend Offline on :8080' });
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 15000);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const [searchQuery, setSearchQuery] = useState(() => {
    try {
      return sessionStorage.getItem('buildtwin-search-query') ?? '';
    } catch {
      return '';
    }
  });

  const searchContainerRef = useRef(null);
  const notificationsRef = useRef(null);
  const inputRef = useRef(null);

  // Sync search query to session storage
  useEffect(() => {
    try {
      sessionStorage.setItem('buildtwin-search-query', searchQuery);
    } catch {
      // Searching still works when browser storage is unavailable.
    }
  }, [searchQuery]);

  // Collapse dropdowns on page navigation
  useEffect(() => {
    setDropdownOpen(false);
    setIsNotificationsOpen(false);
    if (!searchQuery.trim()) {
      setIsSearchExpanded(false);
    }
  }, [location.pathname, searchQuery]);

  // Click outside listener for search bar and notifications dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setDropdownOpen(false);
        if (!searchQuery.trim()) {
          setIsSearchExpanded(false);
        }
      }
      if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
        setIsNotificationsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [searchQuery]);

  // Keyboard shortcut listener
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
      } else if (event.key === 'Escape') {
        if (isSearchExpanded) {
          setIsSearchExpanded(false);
          setDropdownOpen(false);
          inputRef.current?.blur();
        }
        if (isNotificationsOpen) {
          setIsNotificationsOpen(false);
        }
      }
    }
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isSearchExpanded, isNotificationsOpen]);

  const searchResults = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return [];
    return NAV_ITEMS.filter((item) => {
      const matchesLabel = item.label.toLowerCase().includes(q);
      const matchesKey = item.key.toLowerCase().includes(q);
      return matchesLabel || matchesKey;
    });
  }, [searchQuery]);

  const toggleSearch = () => {
    setIsSearchExpanded((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => inputRef.current?.focus(), 80);
      } else {
        setSearchQuery('');
        setDropdownOpen(false);
      }
      return next;
    });
  };

  const openSearchResult = (to) => {
    navigate(to);
    setIsSearchExpanded(false);
    setDropdownOpen(false);
    setSearchQuery('');
  };

  const handleSearchKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (searchResults.length > 0) {
        openSearchResult(searchResults[0].to);
      }
    }
  };

  const confirmLogout = () => {
    setLogoutConfirmOpen(false);
    logout();
    navigate('/login');
  };

  // Filtered list for notification popover
  const displayedNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    if (notifFilter === 'UNREAD') {
      return notifications.filter((n) => n.status === 'UNREAD');
    }
    return notifications;
  }, [notifications, notifFilter]);

  const handleNotificationClick = (item) => {
    if (item.status === 'UNREAD') {
      markRead(item.id);
    }
    setIsNotificationsOpen(false);
    if (item.referenceModule) {
      const moduleMap = {
        COST_BUDGET: '/cost',
        EVM_ANALYTICS: '/cost',
        MATERIALS: '/materials',
        PROCUREMENT: '/procurement',
        QUALITY: '/quality',
        QUALITY_ISSUE: '/issues',
        WBS_SCHEDULE: '/wbs-schedule',
        DPR: '/dpr',
        EQUIPMENT: '/equipment',
        DOCUMENTS: '/documents',
      };
      const dest = moduleMap[item.referenceModule];
      if (dest) {
        navigate(dest);
        return;
      }
    }
    navigate('/notifications');
  };

  return (
    <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-surface-subtle px-4 sm:px-6 z-30">
      {/* Left: Mobile hamburger */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          aria-label="Toggle navigation menu"
          title="Show modules"
          onClick={onMenuToggle}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-ink-700 transition-colors hover:bg-surface-muted hover:text-ink-900 focus:outline-none focus:ring-2 focus:ring-brand-200 md:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
      </div>

      {/* Right Area: Search + Live Status + Notifications + Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Expandable Search Bar Component */}
        <div ref={searchContainerRef} className="relative flex items-center">
          <div
            className={`relative flex h-10 items-center overflow-hidden rounded-full border transition-all duration-300 ease-out ${
              isSearchExpanded
                ? 'w-52 sm:w-80 md:w-96 max-w-[calc(100vw-7rem)] border-surface-border bg-white shadow-sm ring-2 ring-brand-100/80'
                : 'w-10 border-transparent bg-transparent hover:bg-surface-muted text-ink-500 hover:text-ink-700'
            }`}
          >
            <button
              type="button"
              aria-label="Search"
              title={isSearchExpanded ? 'Search' : 'Search modules, activities, projects... (Press / or Ctrl+K)'}
              onClick={toggleSearch}
              className="flex h-10 w-10 shrink-0 items-center justify-center text-ink-500 transition-colors hover:text-brand-600 focus:outline-none"
            >
              <Search className="h-4 w-4 shrink-0 transition-transform duration-200 hover:scale-110" />
            </button>

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
              placeholder="Search modules, activities, projects..."
              aria-label="Search modules, activities, and projects"
              tabIndex={isSearchExpanded ? 0 : -1}
              className={`min-w-0 flex-1 bg-transparent text-xs text-ink-800 outline-none placeholder:text-ink-400 sm:text-sm transition-opacity duration-200 ${
                isSearchExpanded ? 'opacity-100 pr-2' : 'pointer-events-none opacity-0'
              }`}
            />

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
            <div className="absolute right-0 top-12 z-50 w-72 sm:w-80 md:w-96 max-w-[calc(100vw-2rem)] overflow-hidden rounded-xl border border-surface-border bg-white shadow-xl animate-fadeIn">
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
                    No matching modules found for "<span className="font-semibold text-brand-900">{searchQuery}</span>".
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Status Indicator Badge */}
        <div
          title={backendStatus.details}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${
            backendStatus.online
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
              : 'bg-rose-50 text-rose-700 border-rose-200'
          }`}
        >
          <span className="relative flex h-2 w-2">
            {backendStatus.online && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            )}
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                backendStatus.online ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </span>
          <span className="text-xs font-medium tracking-wide">
            {backendStatus.online ? 'Live' : 'Offline'}
          </span>
        </div>

        {/* Top Notifications Icon with Interactive Dropdown */}
        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            aria-label="Notifications"
            title={unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'Notifications'}
            onClick={() => setIsNotificationsOpen((prev) => !prev)}
            className={`relative flex h-10 w-10 items-center justify-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 ${
              isNotificationsOpen
                ? 'bg-surface-muted text-brand-700 ring-1 ring-surface-border'
                : 'text-ink-600 hover:bg-surface-muted hover:text-ink-900'
            }`}
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span
                className={`absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full border-2 border-surface-subtle px-0.5 text-[10px] font-bold leading-none text-white shadow-sm ${
                  urgentCount > 0 ? 'bg-status-danger animate-pulse' : 'bg-brand-600'
                }`}
              >
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Popover */}
          {isNotificationsOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 sm:w-96 max-w-[calc(100vw-1.5rem)] rounded-2xl border border-surface-border bg-white shadow-2xl overflow-hidden animate-fadeIn">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-surface-border bg-surface-subtle/80 px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-ink-900">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-bold text-brand-700">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {unreadCount > 0 && (
                    <button
                      type="button"
                      title="Mark all as read"
                      onClick={() => markAllRead()}
                      className="flex items-center gap-1 text-[11px] font-medium text-brand-600 hover:text-brand-800 px-2 py-1 rounded-md hover:bg-white transition-colors"
                    >
                      <CheckCheck className="h-3.5 w-3.5" />
                      <span>Read all</span>
                    </button>
                  )}
                  <button
                    type="button"
                    title="Refresh alerts"
                    onClick={() => refreshNotifications()}
                    className="p-1 rounded-md text-ink-400 hover:text-ink-700 hover:bg-white transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${isNotifsLoading ? 'animate-spin' : ''}`} />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex border-b border-surface-border bg-white px-3 pt-2 text-xs">
                <button
                  type="button"
                  onClick={() => setNotifFilter('ALL')}
                  className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                    notifFilter === 'ALL'
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  All ({notifications.length})
                </button>
                <button
                  type="button"
                  onClick={() => setNotifFilter('UNREAD')}
                  className={`pb-2 px-3 font-semibold border-b-2 transition-colors ${
                    notifFilter === 'UNREAD'
                      ? 'border-brand-600 text-brand-700'
                      : 'border-transparent text-ink-500 hover:text-ink-800'
                  }`}
                >
                  Unread ({unreadCount})
                </button>
              </div>

              {/* Notification Items List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-surface-border">
                {displayedNotifications.length > 0 ? (
                  displayedNotifications.slice(0, 15).map((item) => {
                    const isUnread = item.status === 'UNREAD';
                    const isUrgent = item.priority === 'URGENT';
                    const isHigh = item.priority === 'HIGH';

                    return (
                      <div
                        key={item.id}
                        onClick={() => handleNotificationClick(item)}
                        className={`group relative flex items-start gap-3 p-3.5 cursor-pointer transition-colors hover:bg-brand-50/60 ${
                          isUnread ? 'bg-blue-50/20' : 'bg-white'
                        }`}
                      >
                        {/* Priority indicator icon */}
                        <div
                          className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg ${
                            isUrgent
                              ? 'bg-rose-100 text-rose-600'
                              : isHigh
                              ? 'bg-amber-100 text-amber-700'
                              : 'bg-brand-50 text-brand-600'
                          }`}
                        >
                          {isUrgent ? (
                            <Flame className="h-4 w-4" />
                          ) : isHigh ? (
                            <AlertTriangle className="h-4 w-4" />
                          ) : item.notificationType === 'LOW_STOCK' ? (
                            <Package className="h-4 w-4" />
                          ) : item.notificationType === 'NCR_RAISED' ? (
                            <ShieldAlert className="h-4 w-4" />
                          ) : (
                            <Bell className="h-4 w-4" />
                          )}
                        </div>

                        {/* Text Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <h4
                              className={`text-xs truncate ${
                                isUnread ? 'font-bold text-ink-900' : 'font-medium text-ink-800'
                              }`}
                            >
                              {item.title}
                            </h4>
                            <span className="shrink-0 text-[10px] text-ink-400">
                              {formatRelativeTime(item.createdAt)}
                            </span>
                          </div>

                          <p className="text-[11px] text-ink-600 line-clamp-2 leading-relaxed">
                            {item.message}
                          </p>

                          <div className="flex items-center gap-2 mt-1.5">
                            <span
                              className={`rounded px-1.5 py-0.2 text-[9px] font-bold uppercase tracking-wider ${
                                isUrgent
                                  ? 'bg-rose-100 text-rose-700'
                                  : isHigh
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-surface-subtle text-ink-600'
                              }`}
                            >
                              {item.priority}
                            </span>
                            {item.referenceModule && (
                              <span className="text-[10px] text-brand-600 font-medium">
                                #{item.referenceModule}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Unread Action Button */}
                        {isUnread && (
                          <button
                            type="button"
                            title="Mark as read"
                            onClick={(e) => {
                              e.stopPropagation();
                              markRead(item.id);
                            }}
                            className="shrink-0 self-center p-1 rounded text-brand-600 hover:bg-brand-100 hover:text-brand-900 transition-colors"
                          >
                            <Check className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 px-4 text-center">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-brand-600 mb-2">
                      <Bell className="h-6 w-6" />
                    </div>
                    <p className="text-xs font-semibold text-ink-800">
                      {notifFilter === 'UNREAD' ? 'No unread notifications' : 'No notifications found'}
                    </p>
                    <p className="text-[11px] text-ink-500 mt-0.5">
                      You are all caught up with site intelligence alerts.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer: View All Full Page Link */}
              <div className="border-t border-surface-border bg-surface-subtle p-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsNotificationsOpen(false);
                    navigate('/notifications');
                  }}
                  className="flex w-full items-center justify-center gap-1.5 py-1.5 text-xs font-semibold text-brand-700 hover:text-brand-900 transition-colors rounded-lg hover:bg-white"
                >
                  <span>Open Full Notifications Hub</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Dropdown */}
        <Dropdown
          trigger={
            <button
              type="button"
              aria-label={user ? `Open profile menu for ${user.name}` : 'Open profile menu'}
              className="flex items-center gap-2 rounded-full py-1 pl-1 pr-2 transition-colors hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-brand-200"
            >
              <Avatar name={user?.name ?? 'Guest'} src={user?.avatar} className="bg-brand-600 text-white font-semibold" />
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
