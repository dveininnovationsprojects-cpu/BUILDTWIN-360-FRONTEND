import { UserManagementPanel } from '../components/UserManagementPanel';

// Director / Management and System Administrator only (FR-002: create,
// activate, deactivate and reset user accounts). Same panel is embedded in
// Settings — see SettingsPage.
export function UsersPage() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="page-heading">Users & Access</h1>
        <p className="page-subheading">Manage accounts, roles and project-level permissions.</p>
      </div>
      <UserManagementPanel />
    </div>
  );
}
