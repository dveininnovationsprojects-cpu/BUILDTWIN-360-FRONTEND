import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, Checkbox } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';
import { ROLES } from '@/constants/roles';
import { useHasRole } from '@/context/authStore';
import { THEMES, useTheme } from '@/context/themeStore';
import { UserManagementPanel } from '../components/UserManagementPanel';

const STORAGE_KEY = 'buildtwin360-notification-prefs';

const DEFAULT_PREFS = {
  overdueActivities: true,
  lowStockAlerts: true,
  pendingApprovals: true,
  weeklySummaryEmail: false,
};

function loadPrefs() {
  try {
    return { ...DEFAULT_PREFS, ...JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') };
  } catch {
    return DEFAULT_PREFS;
  }
}

// Local notification preferences (FR-120..123 alert types) — no backend
// endpoint for this yet, so preferences are kept per-browser.
export function SettingsPage() {
  const pushToast = useToastStore((s) => s.push);
  const [prefs, setPrefs] = useState(loadPrefs);
  const canManageUsers = useHasRole(ROLES.DIRECTOR, ROLES.SYSTEM_ADMIN);
  const { themeId, setThemeId } = useTheme();
  const [pendingThemeId, setPendingThemeId] = useState(themeId);

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function onSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    pushToast('Settings saved.', 'success');
  }

  function applyTheme() {
    setThemeId(pendingThemeId);
    pushToast('Theme applied.', 'success');
  }

  function restoreDefaultTheme() {
    setPendingThemeId('navy');
    setThemeId('navy');
    pushToast('Default navy theme restored.', 'success');
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-heading">Settings</h1>
      </div>

      <div className="grid w-full max-w-5xl grid-cols-1 items-stretch gap-4 lg:grid-cols-2">
        <Card className="liquid-glass w-full rounded-2xl">
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>

          <div className="flex flex-col gap-3">
            <Checkbox
              id="overdueActivities"
              label="Overdue activity alerts"
              checked={prefs.overdueActivities}
              onChange={() => toggle('overdueActivities')}
            />
            <Checkbox
              id="lowStockAlerts"
              label="Low stock alerts"
              checked={prefs.lowStockAlerts}
              onChange={() => toggle('lowStockAlerts')}
            />
            <Checkbox
              id="pendingApprovals"
              label="Pending approval reminders"
              checked={prefs.pendingApprovals}
              onChange={() => toggle('pendingApprovals')}
            />
            <Checkbox
              id="weeklySummaryEmail"
              label="Weekly summary email"
              checked={prefs.weeklySummaryEmail}
              onChange={() => toggle('weeklySummaryEmail')}
            />
          </div>

          <Button onClick={onSave} className="mt-5 self-start">
            Save settings
          </Button>
        </Card>

        <Card className="liquid-glass w-full rounded-2xl">
          <CardHeader>
            <CardTitle>Theme Picker</CardTitle>
          </CardHeader>
          <div className="mx-auto grid w-full max-w-[21rem] grid-cols-2 gap-x-3 gap-y-4 rounded-[50%] bg-white/20 p-5 sm:grid-cols-5 sm:gap-x-2 sm:gap-y-5 sm:rounded-full">
            {THEMES.map((theme) => (
              <button
                key={theme.id}
                type="button"
                aria-label={`Use ${theme.label} theme`}
                aria-pressed={pendingThemeId === theme.id}
                onClick={() => setPendingThemeId(theme.id)}
                className="group flex flex-col items-center gap-2 rounded-lg p-1 text-xs font-medium text-ink-500 transition-all hover:text-brand-900 focus:outline-none focus:ring-2 focus:ring-brand-400"
              >
                <span
                  className={`h-11 w-11 rounded-full shadow-inner shadow-black/20 transition-transform group-hover:scale-110 ${pendingThemeId === theme.id ? 'ring-2 ring-brand-500 ring-offset-2' : ''}`}
                  style={{ background: theme.gradient }}
                />
                {theme.label}
              </button>
            ))}
          </div>
          <div className="mt-5 flex justify-center gap-3">
            <Button type="button" variant="outline" onClick={restoreDefaultTheme}>
              Default
            </Button>
            <Button type="button" onClick={applyTheme} disabled={pendingThemeId === themeId}>
              Apply
            </Button>
          </div>
        </Card>
      </div>

      {canManageUsers && <UserManagementPanel />}
    </div>
  );
}
