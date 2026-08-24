import { Outlet } from 'react-router-dom';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-900 px-4">
      <div className="w-full max-w-sm rounded-lg bg-surface-base p-8 shadow-popover">
        <div className="mb-6 flex flex-col items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded bg-brand-500 font-bold text-white">B</div>
          <h1 className="text-xl font-semibold text-brand-900">BuildTwin 360</h1>
          <p className="text-sm text-ink-500">Construction Progress Intelligence & Site Control</p>
        </div>
        <Outlet />
      </div>
    </div>
  );
}
