import { describe, it, expect } from 'vitest';
import { ROLES } from './roles';

describe('ROLES', () => {
  it('exposes the standard stakeholder roles', () => {
    expect(ROLES.DIRECTOR).toBe('DIRECTOR');
    expect(ROLES.PROJECT_MANAGER).toBe('PROJECT_MANAGER');
    expect(ROLES.ADMIN).toBe('ADMIN');
  });

  it('keeps backward-compatible aliases', () => {
    expect(ROLES.COST_COORDINATOR).toBe(ROLES.QUANTITY_COST_COORDINATOR);
    expect(ROLES.SYSTEM_ADMIN).toBe(ROLES.ADMIN);
  });
});
