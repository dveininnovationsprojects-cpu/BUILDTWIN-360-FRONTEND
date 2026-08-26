import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastViewport } from '@/design-system/components/Toast/Toast';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const closeMobileSidebar = () => {
    if (window.matchMedia('(max-width: 767px)').matches) setSidebarOpen(false);
  };

  return (
    <div className="flex h-screen bg-surface-subtle">
      <Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen((open) => !open)} onNavigate={closeMobileSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar onMenuToggle={() => setSidebarOpen((open) => !open)} />
        <main className="relative flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-brand-50/70 to-transparent" />
          <Outlet />
        </main>
      </div>
      <ToastViewport />
    </div>
  );
}
