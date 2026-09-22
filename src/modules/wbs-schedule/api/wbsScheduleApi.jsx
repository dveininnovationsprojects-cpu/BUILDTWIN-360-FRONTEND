import { apiClient } from '@/lib/apiClient';

const STORAGE_KEY = 'buildtwin_wbs_activities';

const DEFAULT_ACTIVITIES = [
  {
    id: '1',
    wbsCode: '1.0',
    name: 'Site Preparation & Ground Excavation',
    discipline: 'civil',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    duration: 15,
    description: 'Site clearing, leveling, shoring and bulk excavation',
  },
  {
    id: '2',
    wbsCode: '1.1',
    name: 'Foundation & Footing Work',
    discipline: 'structural',
    status: 'in-progress',
    startDate: '2024-01-16',
    endDate: '2024-02-28',
    duration: 44,
    description: 'Raft foundation design, rebar binding and concrete pouring',
  },
  {
    id: '3',
    wbsCode: '1.2',
    name: 'RCC Column & Beam Framing',
    discipline: 'structural',
    status: 'planned',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    duration: 61,
    description: 'Structural steel and RCC column erection with formwork',
  },
  {
    id: '4',
    wbsCode: '1.3',
    name: 'Electrical Conduit & Wiring Rough-in',
    discipline: 'electrical',
    status: 'planned',
    startDate: '2024-04-15',
    endDate: '2024-05-15',
    duration: 31,
    description: 'Electrical conduit laying, DB box placement and cable trays',
  },
  {
    id: '5',
    wbsCode: '1.4',
    name: 'Plumbing & Drainage Network',
    discipline: 'plumbing',
    status: 'planned',
    startDate: '2024-04-20',
    endDate: '2024-05-20',
    duration: 31,
    description: 'Piping network, wastewater risers and plumbing fixtures',
  },
  {
    id: '6',
    wbsCode: '1.5',
    name: 'HVAC Ducting & Ventilation Lines',
    discipline: 'hvac',
    status: 'planned',
    startDate: '2024-05-01',
    endDate: '2024-06-15',
    duration: 45,
    description: 'Primary air handling ducting and chiller line installation',
  },
];

function getStoredActivities() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch {
    // ignore
  }
  return DEFAULT_ACTIVITIES;
}

function saveStoredActivities(activities) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(activities));
  } catch {
    // ignore
  }
}

function normalizeActivity(item) {
  if (!item) return null;
  return {
    id: String(item.id || item.workPackageId || Date.now()),
    wbsCode: item.code || item.wbsCode || item.workPackageCode || '1.0',
    name: item.name || item.title || item.workPackageName || 'Unnamed Activity',
    discipline: (item.discipline || item.tradeDiscipline || 'civil').toLowerCase(),
    status: (item.status || 'planned').toLowerCase().replace('_', '-'),
    startDate: item.plannedStartDate || item.startDate || '',
    endDate: item.plannedEndDate || item.endDate || '',
    duration: item.duration || (item.plannedDurationDays ? Number(item.plannedDurationDays) : 30),
    description: item.description || '',
  };
}

export const wbsScheduleApi = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get('/projects/1/work-packages', {
        params: { size: 100, ...params }
      });
      if (response && response.data) {
        const payload = response.data.data !== undefined ? response.data.data : response.data;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        if (Array.isArray(items)) {
          return items.map(normalizeActivity);
        }
      }
    } catch (err) {
      console.warn('Backend /projects/1/work-packages list fetch failed, fallback to local:', err);
    }

    try {
      const res = await apiClient.get('/activities', { params });
      if (res && res.data) {
        const payload = res.data.data !== undefined ? res.data.data : res.data;
        const items = Array.isArray(payload) ? payload : (payload?.content || []);
        if (Array.isArray(items) && items.length > 0) {
          return items.map(normalizeActivity);
        }
      }
    } catch {
      // ignore
    }

    return getStoredActivities();
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/work-packages/${id}`);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeActivity(item);
      }
    } catch {
      // ignore
    }
    const list = await wbsScheduleApi.list();
    return list.find((a) => String(a.id) === String(id)) || null;
  },

  create: async (payload) => {
    let normalizedDiscipline = (payload.discipline || 'CIVIL').toUpperCase();
    if (normalizedDiscipline === 'GENERAL') normalizedDiscipline = 'CIVIL';
    if (normalizedDiscipline === 'MECHANICAL') normalizedDiscipline = 'MEP';

    let normalizedStatus = (payload.status || 'PLANNED').toUpperCase().replace('-', '_');
    if (!['PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(normalizedStatus)) {
      normalizedStatus = 'PLANNED';
    }

    const requestBody = {
      code: String(payload.wbsCode || '').trim(),
      name: String(payload.name || '').trim(),
      discipline: normalizedDiscipline,
      status: normalizedStatus,
      plannedStartDate: payload.startDate || null,
      plannedEndDate: payload.endDate || null,
      description: payload.description || '',
    };

    try {
      const response = await apiClient.post('/projects/1/work-packages', requestBody);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeActivity(item);
      }
    } catch (err) {
      console.error('API create work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to create work package on server';
      throw new Error(msg);
    }
  },

  update: async (id, payload) => {
    let normalizedDiscipline = (payload.discipline || 'CIVIL').toUpperCase();
    if (normalizedDiscipline === 'GENERAL') normalizedDiscipline = 'CIVIL';
    if (normalizedDiscipline === 'MECHANICAL') normalizedDiscipline = 'MEP';

    let normalizedStatus = (payload.status || 'PLANNED').toUpperCase().replace('-', '_');
    if (!['PLANNED', 'IN_PROGRESS', 'ON_HOLD', 'COMPLETED', 'CANCELLED'].includes(normalizedStatus)) {
      normalizedStatus = 'PLANNED';
    }

    const requestBody = {
      code: String(payload.wbsCode || payload.code || '1.0').trim(),
      name: String(payload.name || '').trim(),
      discipline: normalizedDiscipline,
      status: normalizedStatus,
      plannedStartDate: payload.startDate || null,
      plannedEndDate: payload.endDate || null,
      description: payload.description || '',
    };

    try {
      const response = await apiClient.put(`/work-packages/${id}`, requestBody);
      if (response && response.data) {
        const item = response.data.data !== undefined ? response.data.data : response.data;
        return normalizeActivity(item);
      }
    } catch (err) {
      console.error('API update work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to update work package on server';
      throw new Error(msg);
    }
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/work-packages/${id}`);
      return true;
    } catch (err) {
      console.error('API delete work package failed:', err);
      const msg = err.response?.data?.message || err.message || 'Failed to delete work package on server';
      throw new Error(msg);
    }
  },
};
