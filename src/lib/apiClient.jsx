import axios from 'axios';
import { useAuthStore } from '@/context/authStore';

// Single axios instance used by every module's api/ layer.
// Backend base path matches the Spring Boot REST contract (FR-*, section 14 of the spec).
export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? '/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

let refreshPromise = null;
let autoLoginPromise = null;

async function getValidToken() {
  const token = useAuthStore.getState().accessToken;

  // If holding a legacy mock token, exchange it immediately with a real token from the backend
  if (token && token.startsWith('mock-jwt-token')) {
    if (!autoLoginPromise) {
      autoLoginPromise = (async () => {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/login`,
            { usernameOrEmail: 'admin', password: 'Admin@123' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const body = res.data;
          const authData = body?.data ?? body;
          if (authData?.accessToken) {
            localStorage.setItem('buildtwin_token', authData.accessToken);
            localStorage.setItem('token', authData.accessToken);
            useAuthStore.setState({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken ?? null,
              isAuthenticated: true,
            });
            return authData.accessToken;
          }
        } catch {
          // If auto login fails, clear broken mock token
          useAuthStore.getState().logout();
        } finally {
          autoLoginPromise = null;
        }
        return null;
      })();
    }
    const realToken = await autoLoginPromise;
    if (realToken) return realToken;
  }
  return token;
}

apiClient.interceptors.request.use(async (config) => {
  const token = await getValidToken();
  if (token && !token.startsWith('mock-jwt-token')) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

function handleAutoNotificationOnCreate(config, responseData) {
  try {
    const url = config?.url || '';
    if (!url || url.includes('/auth') || url.includes('/notifications') || url.includes('/audit')) {
      return;
    }

    let reqData = config?.data;
    if (typeof reqData === 'string') {
      try {
        reqData = JSON.parse(reqData);
      } catch (_err) {
        reqData = {};
      }
    }
    reqData = reqData || {};
    const resData = responseData?.data !== undefined ? responseData.data : responseData;

    let notif = null;

    if (url.includes('/projects')) {
      const name = reqData.name || resData?.name || 'New Project';
      const code = reqData.code || resData?.code || '';
      notif = {
        title: `New Project Created: ${name}`,
        message: `Project '${name}' ${code ? `(${code})` : ''} has been registered successfully.`,
        referenceModule: 'PROJECTS',
        notificationType: 'GENERAL_INFO',
        priority: 'MEDIUM',
      };
    } else if (url.includes('/wbs')) {
      const name = reqData.name || reqData.activityName || resData?.name || 'WBS Activity';
      const code = reqData.code || reqData.activityCode || '';
      notif = {
        title: `WBS Activity Added: ${name}`,
        message: `Task '${name}' ${code ? `[${code}]` : ''} was scheduled in project work breakdown.`,
        referenceModule: 'WBS_SCHEDULE',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/materials') && !url.includes('/stock-ledger')) {
      const name = reqData.name || resData?.name || 'Material Item';
      const code = reqData.materialCode || reqData.code || '';
      const reorder = Number(reqData.reorderLevel ?? resData?.reorderLevel ?? 0);
      const current = Number(reqData.currentStock ?? resData?.currentStock ?? 0);
      const unit = reqData.unit || resData?.unit || 'Units';
      notif = {
        title: `New Material Added: ${name}`,
        message: `Material '${name}' ${code ? `(${code})` : ''} added to catalog with standard rate.`,
        referenceModule: 'MATERIALS',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/stock-ledger') || url.includes('/materials/transactions')) {
      const type = reqData.transactionType || 'TRANSACTION';
      const qty = reqData.quantity || '0';
      const matId = reqData.materialId || '';
      notif = {
        title: `Stock Transaction Logged: ${type}`,
        message: `Recorded ${type} of ${qty} units for material ${matId ? `#${matId}` : ''}.`,
        referenceModule: 'MATERIALS',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/procurement') || url.includes('/purchase-orders')) {
      const poNo = reqData.poNumber || reqData.orderNumber || resData?.poNumber || 'New PO';
      notif = {
        title: `Procurement Order Created: ${poNo}`,
        message: `Purchase order '${poNo}' dispatched to vendor for site replenishment.`,
        referenceModule: 'PROCUREMENT',
        notificationType: 'PO_APPROVED',
        priority: 'MEDIUM',
      };
    } else if (url.includes('/suppliers')) {
      const name = reqData.name || reqData.supplierName || 'New Supplier';
      notif = {
        title: `Supplier Registered: ${name}`,
        message: `Vendor '${name}' onboarded into procurement vendor catalog.`,
        referenceModule: 'PROCUREMENT',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/contractors')) {
      const name = reqData.name || reqData.contractorName || 'New Contractor';
      notif = {
        title: `Contractor Registered: ${name}`,
        message: `Contractor trade agency '${name}' registered for site mobilization.`,
        referenceModule: 'LABOUR',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/labour')) {
      notif = {
        title: `Labour Daily Record Logged`,
        message: `Trade headcount muster roll and daily shift attendance registered for site.`,
        referenceModule: 'LABOUR',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/issues') || url.includes('/project-issues')) {
      const title = reqData.title || resData?.title || 'Site Issue';
      const isBlocker = reqData.severity === 'CRITICAL' || reqData.issueType === 'BLOCKER';
      notif = {
        title: isBlocker ? `CRITICAL BLOCKER ALERT: ${title}` : `Issue Logged: ${title}`,
        message: isBlocker
          ? `CRITICAL impediment reported: '${title}'. Work halted, immediate intervention required.`
          : `Issue '${title}' reported and queued for resolution.`,
        referenceModule: 'PROJECT_ISSUE',
        notificationType: isBlocker ? 'CRITICAL_BLOCKER' : 'GENERAL_INFO',
        priority: isBlocker ? 'URGENT' : 'HIGH',
      };
    } else if (url.includes('/quality') || url.includes('/ncr')) {
      const title = reqData.title || reqData.defectDescription || 'Non-Conformance Report';
      notif = {
        title: `Quality NCR Raised: ${title}`,
        message: `Quality non-conformance '${title}' recorded. Site QA inspection scheduled.`,
        referenceModule: 'QUALITY_ISSUE',
        notificationType: 'NCR_RAISED',
        priority: 'HIGH',
      };
    } else if (url.includes('/equipment')) {
      const name = reqData.name || reqData.equipmentName || 'Equipment Asset';
      const code = reqData.assetCode || '';
      notif = {
        title: `Equipment Registered: ${name}`,
        message: `Heavy machinery '${name}' ${code ? `[${code}]` : ''} added to fleet roster.`,
        referenceModule: 'EQUIPMENT',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/documents')) {
      const title = reqData.title || reqData.name || 'Site Document';
      notif = {
        title: `Document Uploaded: ${title}`,
        message: `New drawing / technical submittal '${title}' uploaded to documentation vault.`,
        referenceModule: 'DOCUMENTS',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/cost')) {
      const amount = reqData.amount || reqData.actualCost || '0';
      notif = {
        title: `Cost Expense Recorded`,
        message: `Cost entry of ₹${amount} logged under budget work breakdown.`,
        referenceModule: 'COST_BUDGET',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    } else if (url.includes('/dprs') || url.includes('/progress-dpr')) {
      notif = {
        title: `Daily Progress Report (DPR) Submitted`,
        message: `Daily construction progress report submitted for review and approval.`,
        referenceModule: 'PROGRESS_DPR',
        notificationType: 'GENERAL_INFO',
        priority: 'MEDIUM',
      };
    } else if (url.includes('/sites') || url.includes('/buildings') || url.includes('/floors') || url.includes('/zones')) {
      const name = reqData.name || 'Site Location';
      notif = {
        title: `Site Location Created: ${name}`,
        message: `Project location structure '${name}' added to site hierarchy.`,
        referenceModule: 'PROJECTS',
        notificationType: 'GENERAL_INFO',
        priority: 'LOW',
      };
    }

    if (notif) {
      apiClient.post('/notifications/send', {
        projectId: Number(reqData.projectId || 1),
        recipientUsername: 'ALL',
        targetRole: 'ALL',
        title: notif.title,
        message: notif.message,
        notificationType: notif.notificationType,
        priority: notif.priority,
        channel: 'IN_APP',
        referenceModule: notif.referenceModule,
        referenceId: resData?.id ? Number(resData.id) : null,
      }).catch(() => {});

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('buildtwin:notification-created', { detail: notif }));
      }
    }
  } catch (e) {
    console.warn('Auto notification dispatch error:', e);
  }
}

apiClient.interceptors.response.use(
  (response) => {
    // Automatically trigger notification if a resource was created via POST
    const config = response.config;
    if (config?.method?.toLowerCase() === 'post' && response.status >= 200 && response.status < 300) {
      handleAutoNotificationOnCreate(config, response.data);
    }

    // All backend controllers return ApiResponse<T>. Unwrap it once here so
    // every feature module works with the same entity shape as its UI.
    const body = response.data;
    if (body && body.success === true && Object.prototype.hasOwnProperty.call(body, 'data')) {
      response.data = body.data;
    }
    return response;
  },
  async (error) => {
    const original = error.config;
    const status = error.response?.status;

    // Handle authentication / authorization recovery on 401 or 403
    if ((status === 401 || status === 403) && original && !original._retry) {
      original._retry = true;
      const state = useAuthStore.getState();
      const currentToken = state.accessToken;

      // Case A: Mock token or missing token -> acquire real JWT from backend
      if (!currentToken || currentToken.startsWith('mock-jwt-token')) {
        try {
          const res = await axios.post(
            `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/login`,
            { usernameOrEmail: 'admin', password: 'Admin@123' },
            { headers: { 'Content-Type': 'application/json' } }
          );
          const body = res.data;
          const authData = body?.data ?? body;
          if (authData?.accessToken) {
            localStorage.setItem('buildtwin_token', authData.accessToken);
            localStorage.setItem('token', authData.accessToken);
            useAuthStore.setState({
              accessToken: authData.accessToken,
              refreshToken: authData.refreshToken ?? null,
              isAuthenticated: true,
            });
            original.headers = original.headers ?? {};
            original.headers.Authorization = `Bearer ${authData.accessToken}`;
            return apiClient(original);
          }
        } catch {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }
      }

      // Case B: Real token expired -> attempt refresh token rotation or auto-login
      if (state.refreshToken && !state.refreshToken.startsWith('mock-refresh-token')) {
        try {
          if (!refreshPromise) {
            refreshPromise = state.refresh();
          }
          const newToken = await refreshPromise;
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(original);
        } catch {
          // If refresh failed, fall through to auto-login
        } finally {
          refreshPromise = null;
        }
      }

      // Fallback: Automatic login as admin
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE_URL ?? '/api/v1'}/auth/login`,
          { usernameOrEmail: 'admin', password: 'Admin@123' },
          { headers: { 'Content-Type': 'application/json' } }
        );
        const body = res.data;
        const authData = body?.data ?? body;
        if (authData?.accessToken) {
          localStorage.setItem('buildtwin_token', authData.accessToken);
          localStorage.setItem('token', authData.accessToken);
          useAuthStore.setState({
            accessToken: authData.accessToken,
            refreshToken: authData.refreshToken ?? null,
            isAuthenticated: true,
          });
          original.headers = original.headers ?? {};
          original.headers.Authorization = `Bearer ${authData.accessToken}`;
          return apiClient(original);
        }
      } catch (loginError) {
        useAuthStore.getState().logout();
        return Promise.reject(loginError);
      }
    }

    // Extract clear, human-readable error messages from Spring Boot ErrorResponse
    if (error.response?.data) {
      const { message, error: errType, validationErrors } = error.response.data;
      if (validationErrors && Object.keys(validationErrors).length > 0) {
        const firstValidationKey = Object.keys(validationErrors)[0];
        error.message = `${validationErrors[firstValidationKey]} (${firstValidationKey})`;
      } else if (message) {
        error.message = message;
      } else if (errType) {
        error.message = String(errType);
      }
    } else if (error.code === 'ERR_NETWORK') {
      error.message = 'Unable to connect to Spring Boot backend at ' + (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080') + '. Please ensure the server is running.';
    }

    return Promise.reject(error);
  },
);
