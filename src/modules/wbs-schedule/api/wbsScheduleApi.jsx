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
    wbsCode: item.wbsCode || item.code || item.workPackageCode || '1.0',
    name: item.name || item.title || item.workPackageName || 'Unnamed Activity',
    discipline: (item.discipline || item.tradeDiscipline || 'civil').toLowerCase(),
    status: (item.status || 'planned').toLowerCase().replace('_', '-'),
    startDate: item.startDate || item.plannedStartDate || '',
    endDate: item.endDate || item.plannedEndDate || '',
    duration: item.duration || (item.plannedDurationDays ? Number(item.plannedDurationDays) : 30),
    description: item.description || '',
  };
}

export const wbsScheduleApi = {
  list: async (params = {}) => {
    try {
      const response = await apiClient.get('/projects/1/work-packages', { params }).catch(() => null);
      if (response && response.data) {
        const raw = response.data;
        const items = Array.isArray(raw) ? raw : raw?.content ?? [];
        if (items.length > 0) {
          return items.map(normalizeActivity);
        }
      }
    } catch {
      // ignore
    }

    try {
      const res = await apiClient.get('/activities', { params }).catch(() => null);
      if (res && res.data) {
        const raw = res.data;
        const items = Array.isArray(raw) ? raw : raw?.content ?? [];
        if (items.length > 0) {
          return items.map(normalizeActivity);
        }
      }
    } catch {
      // ignore
    }

    return getStoredActivities();
  },

  getById: async (id) => {
    const list = await wbsScheduleApi.list();
    return list.find((a) => String(a.id) === String(id)) || null;
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post('/projects/1/work-packages', {
        code: payload.wbsCode,
        name: payload.name,
        tradeDiscipline: (payload.discipline || 'CIVIL').toUpperCase(),
        status: (payload.status || 'PLANNED').toUpperCase().replace('-', '_'),
        plannedStartDate: payload.startDate,
        plannedEndDate: payload.endDate,
        description: payload.description,
      }).catch(() => null);

      if (response && response.data) {
        return normalizeActivity(response.data);
      }
    } catch {
      // ignore
    }

    const current = getStoredActivities();
    const newActivity = {
      id: String(Date.now()),
      ...payload,
    };
    const updated = [newActivity, ...current];
    saveStoredActivities(updated);
    return newActivity;
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/work-packages/${id}`, {
        name: payload.name,
        tradeDiscipline: (payload.discipline || 'CIVIL').toUpperCase(),
        plannedStartDate: payload.startDate,
        plannedEndDate: payload.endDate,
        description: payload.description,
      }).catch(() => null);

      if (response && response.data) {
        return normalizeActivity(response.data);
      }
    } catch {
      // ignore
    }

    const current = getStoredActivities();
    const index = current.findIndex((a) => String(a.id) === String(id));
    if (index >= 0) {
      current[index] = { ...current[index], ...payload };
      saveStoredActivities(current);
      return current[index];
    }
    return payload;
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/work-packages/${id}`).catch(() => null);
    } catch {
      // ignore
    }

    const current = getStoredActivities();
    const filtered = current.filter((a) => String(a.id) !== String(id));
    saveStoredActivities(filtered);
    return true;
  },
};
