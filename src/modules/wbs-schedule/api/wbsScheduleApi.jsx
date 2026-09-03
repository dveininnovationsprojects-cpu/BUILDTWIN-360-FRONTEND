import { apiClient } from '@/lib/apiClient';

// Demo/Mock data for WBS Schedule
const DEMO_ACTIVITIES = [
  {
    id: '1',
    wbsCode: '1.0',
    name: 'Site Preparation',
    discipline: 'civil',
    status: 'completed',
    startDate: '2024-01-01',
    endDate: '2024-01-15',
    duration: 15,
    description: 'Site clearing, leveling and preparation',
  },
  {
    id: '2',
    wbsCode: '1.1',
    name: 'Foundation Work',
    discipline: 'structural',
    status: 'in-progress',
    startDate: '2024-01-16',
    endDate: '2024-02-28',
    duration: 44,
    description: 'Foundation design and construction',
  },
  {
    id: '3',
    wbsCode: '1.2',
    name: 'Structural Steel',
    discipline: 'structural',
    status: 'planned',
    startDate: '2024-03-01',
    endDate: '2024-04-30',
    duration: 61,
    description: 'Structural steel work and installation',
  },
  {
    id: '4',
    wbsCode: '1.3',
    name: 'Electrical Rough-in',
    discipline: 'electrical',
    status: 'planned',
    startDate: '2024-04-15',
    endDate: '2024-05-15',
    duration: 31,
    description: 'Electrical conduit and wiring installation',
  },
  {
    id: '5',
    wbsCode: '1.4',
    name: 'Plumbing Rough-in',
    discipline: 'plumbing',
    status: 'planned',
    startDate: '2024-04-20',
    endDate: '2024-05-20',
    duration: 31,
    description: 'Plumbing pipes and fixtures installation',
  },
];

// Maps to /activities (spec section 14 - API Requirements).
export const wbsScheduleApi = {
  list: async (params) => {
    try {
      const response = await apiClient.get('/activities', { params });
      return response.data ?? [];
    } catch (error) {
      // Fallback to demo data when API fails (local demo mode)
      console.warn('Failed to load activities from API, using demo data', error);
      return DEMO_ACTIVITIES;
    }
  },

  getById: async (id) => {
    try {
      const response = await apiClient.get(`/activities/${id}`);
      return response.data;
    } catch (error) {
      // Fallback to demo data
      return DEMO_ACTIVITIES.find((activity) => activity.id === id);
    }
  },

  create: async (payload) => {
    try {
      const response = await apiClient.post('/activities', payload);
      return response.data;
    } catch (error) {
      // In demo mode, add to local demo data
      const newActivity = {
        id: String(DEMO_ACTIVITIES.length + 1),
        ...payload,
      };
      DEMO_ACTIVITIES.push(newActivity);
      return newActivity;
    }
  },

  update: async (id, payload) => {
    try {
      const response = await apiClient.put(`/activities/${id}`, payload);
      return response.data;
    } catch (error) {
      // Update in demo data
      const index = DEMO_ACTIVITIES.findIndex((a) => a.id === id);
      if (index >= 0) {
        DEMO_ACTIVITIES[index] = { ...DEMO_ACTIVITIES[index], ...payload };
        return DEMO_ACTIVITIES[index];
      }
      throw error;
    }
  },
};
