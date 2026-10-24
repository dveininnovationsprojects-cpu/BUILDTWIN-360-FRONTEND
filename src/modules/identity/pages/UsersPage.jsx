import { UserManagementPanel } from '../components/UserManagementPanel';

// Director / Management and System Administrator only (FR-002: create,
// activate, deactivate and reset user accounts). Same panel is embedded in
// Settings — see SettingsPage.
export function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <ModulePageHeading>Users &amp; Access</ModulePageHeading>
      </div>
      <UserManagementPanel />
    </div>
  );
}
import { ModulePageHeading } from '@/design-system/components/ModulePageHeading/ModulePageHeading';
