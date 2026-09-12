import { apiClient } from '@/lib/apiClient';
import { normalizeRole, toBackendRole } from '@/constants/roles';

/**
 * Enterprise Identity & Access Management API Service
 * Directly interfaces with Spring Boot REST Backend:
 * - AuthController (/api/v1/auth)
 * - UserController (/api/v1/users)
 */
export const identityApi = {
  /**
   * Fetch paginated list of users with optional search and status filtering
   * GET /api/v1/users
   */
  listUsers: async ({ search = '', status = '', page = 0, size = 50, sortBy = 'id', sortDir = 'asc' } = {}) => {
    const params = new URLSearchParams();
    if (search) params.append('search', search.trim());
    if (status && status !== 'ALL') params.append('status', status.toUpperCase());
    params.append('page', String(page));
    params.append('size', String(size));
    params.append('sortBy', sortBy);
    params.append('sortDir', sortDir);

    const res = await apiClient.get(`/users?${params.toString()}`);
    const data = res.data?.data ?? res.data;

    const rawUsers = Array.isArray(data) ? data : data?.content ?? [];
    return rawUsers.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.username ?? 'User',
      email: user.email,
      roles: (user.roles ?? []).map((r) => normalizeRole(typeof r === 'object' ? r.name : r)),
      status: String(user.status ?? 'ACTIVE').toUpperCase(),
      createdAt: user.createdAt,
      lastLoginAt: user.lastLoginAt,
      projectRoles: user.projectRoles ?? [],
    }));
  },

  /**
   * Fetch pending user registrations awaiting Admin/Director approval
   * GET /api/v1/users/pending-approvals
   */
  getPendingApprovals: async (page = 0, size = 50) => {
    const res = await apiClient.get(`/users/pending-approvals?page=${page}&size=${size}`);
    const data = res.data?.data ?? res.data;
    const rawUsers = Array.isArray(data) ? data : data?.content ?? [];

    return rawUsers.map((user) => ({
      id: user.id,
      username: user.username,
      name: user.username ?? 'User',
      email: user.email,
      roles: (user.roles ?? []).map((r) => normalizeRole(typeof r === 'object' ? r.name : r)),
      status: String(user.status ?? 'PENDING_APPROVAL').toUpperCase(),
      createdAt: user.createdAt,
    }));
  },

  /**
   * Approve a pending user registration
   * POST /api/v1/users/{id}/approve
   */
  approveUser: async (id, payload = {}) => {
    const body = {};
    if (payload.roles && payload.roles.length > 0) {
      body.roles = payload.roles.map(toBackendRole);
    }
    if (payload.assignedProjectId) {
      body.assignedProjectId = payload.assignedProjectId;
    }

    const res = await apiClient.post(`/users/${id}/approve`, body);
    return res.data?.data ?? res.data;
  },

  /**
   * Reject a pending user registration
   * POST /api/v1/users/{id}/reject
   */
  rejectUser: async (id, reason = 'Registration rejected by administrator') => {
    const res = await apiClient.post(`/users/${id}/reject`, {
      reason: reason || 'Registration rejected by administrator',
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Create a new user profile with pre-assigned roles (Admin / Director)
   * POST /api/v1/users
   */
  createUser: async (payload) => {
    const username =
      payload.username ||
      payload.email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '_');

    const selectedRoles = (payload.roles && payload.roles.length > 0)
      ? payload.roles.map(toBackendRole)
      : [toBackendRole(payload.role || 'SITE_ENGINEER')];

    const res = await apiClient.post('/users', {
      username: username.trim(),
      email: payload.email.trim().toLowerCase(),
      password: payload.password,
      status: payload.status || 'ACTIVE',
      roles: selectedRoles,
    });

    return res.data?.data ?? res.data;
  },

  /**
   * Update user status (ACTIVE, INACTIVE, SUSPENDED)
   * PATCH /api/v1/users/{id}/status
   */
  setUserStatus: async (id, status) => {
    const res = await apiClient.patch(`/users/${id}/status`, {
      status: String(status).toUpperCase(),
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Reset user password administratively
   * POST /api/v1/users/{id}/reset-password
   */
  resetPassword: async (id, newPassword) => {
    const res = await apiClient.post(`/users/${id}/reset-password`, {
      newPassword,
    });
    return res.data?.data ?? res.data;
  },

  /**
   * Delete user account permanently
   * DELETE /api/v1/users/{id}
   */
  deleteUser: async (id) => {
    const res = await apiClient.delete(`/users/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Retrieve all master roles from backend
   * GET /api/v1/auth/roles
   */
  getAllRoles: async () => {
    const res = await apiClient.get('/auth/roles');
    return res.data?.data ?? res.data;
  },
};
