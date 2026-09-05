import { Outlet } from 'react-router-dom';
import { ToastViewport } from '@/design-system/components/Toast/Toast';
import buildTwinLogo from '@/assets/BuildTwin360-LOGO.png';

export function AuthLayout() {
  return (
    <>
      <div className="auth-scene relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-8 sm:px-6">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_82%_18%,rgba(125,211,252,0.22),transparent_28%),linear-gradient(180deg,rgba(2,6,23,0.04),rgba(2,6,23,0.3))]" />
        <div className="relative z-10 w-full max-w-md">
          <div className="auth-glass rounded-2xl p-6 sm:p-8">
            <div className="mb-6 flex flex-col items-center gap-2 text-center">
              <div className="flex h-16 w-16 items-center justify-center overflow-hidden rounded-full bg-white p-1 shadow-lg shadow-blue-950/20">
                <img src={buildTwinLogo} alt="BuildTwin 360 logo" className="h-full w-full scale-[1.4] object-contain" />
              </div>
              <h1 className="text-xl font-semibold text-brand-900">BuildTwin 360</h1>
              <p className="text-sm text-ink-700">Construction Progress Intelligence &amp; Site Control</p>
            </div>
            <Outlet />
          </div>
        </div>
      </div>
      <ToastViewport />
    </>
  );
}
