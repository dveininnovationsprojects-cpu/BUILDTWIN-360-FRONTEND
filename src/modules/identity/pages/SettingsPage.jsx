import { useState } from 'react';
import { Button, Card, CardHeader, CardTitle, Checkbox } from '@/design-system';
import { useToastStore } from '@/design-system/components/Toast/Toast';

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

  function toggle(key) {
    setPrefs((p) => ({ ...p, [key]: !p[key] }));
  }

  function onSave() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    pushToast('Settings saved.', 'success');
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-heading">Settings</h1>
        <p className="page-subheading">Manage your notification preferences.</p>
      </div>

      <Card className="max-w-xl">
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
    </div>
  );
}
