import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastViewport } from '@/design-system/components/Toast/Toast';
import { ErrorBoundary } from '@/design-system/components/ErrorBoundary/ErrorBoundary';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(() => window.matchMedia('(min-width: 768px)').matches);

  const closeMobileSidebar = () => {
    if (window.matchMedia('(max-width: 767px)').matches) {
      setSidebarOpen(false);
    }
  };

  return (
    <div className="flex h-screen bg-surface-subtle">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((open) => !open)}
        onNavigate={closeMobileSidebar}
      />
      <div className="flex flex-1 flex-col overflow-hidden bg-surface-subtle">
        <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="flex-1 overflow-y-auto bg-surface-subtle p-4 sm:p-6">
          <ErrorBoundary>
            <Outlet />
          </ErrorBoundary>
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
