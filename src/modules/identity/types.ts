import type { Role } from '@/constants/roles';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    roles: Role[];
    projectIds: string[];
  };
}

// FR-002: administrators create/activate/deactivate/reset user accounts.
export interface AppUser {
  id: string;
  name: string;
  email: string;
  mobile?: string;
  roles: Role[];
  status: 'ACTIVE' | 'INACTIVE';
}
