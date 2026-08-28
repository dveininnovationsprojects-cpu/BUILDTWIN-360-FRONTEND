import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SEED_PROJECTS = [
  {
    id: 'demo-project-1',
    code: 'PRJ-001',
    name: 'Padur Independent Residence',
    type: 'RESIDENTIAL',
    client: 'Private Client',
    location: 'Padur, Chennai',
    status: 'ACTIVE',
    startDate: '2026-01-15',
    endDate: '',
    description: '',
  },
];

function normalizeCode(code) {
  return code.trim().toUpperCase();
}

// Local/demo-mode backing for the Projects module (FR-010..014) — used by
// projectsApi as a fallback when no backend is reachable, the same way
// identityApi falls back to authStore's demoAccounts, so Projects stays
// usable in local/demo mode instead of surfacing a raw
// "Request failed with status code 500".
export const useProjectsStore = create()(
  persist(
    (set, get) => ({
      demoProjects: SEED_PROJECTS,

      listDemoProjects: () => get().demoProjects,

      getDemoProject: (id) => get().demoProjects.find((p) => p.id === id),

      createDemoProject: (payload) => {
        const code = normalizeCode(payload.code);
        if (get().demoProjects.some((p) => p.code === code)) {
          throw new Error('A project with this code already exists.');
        }
        const project = { ...payload, code, id: crypto.randomUUID() };
        set((state) => ({ demoProjects: [...state.demoProjects, project] }));
        return project;
      },

      updateDemoProject: (id, payload) => {
        if (!get().demoProjects.some((p) => p.id === id)) throw new Error('Project not found.');
        const code = normalizeCode(payload.code);
        if (get().demoProjects.some((p) => p.id !== id && p.code === code)) {
          throw new Error('A project with this code already exists.');
        }
        set((state) => ({
          demoProjects: state.demoProjects.map((p) => (p.id === id ? { ...p, ...payload, code } : p)),
        }));
        return get().demoProjects.find((p) => p.id === id);
      },
    }),
    { name: 'buildtwin360-projects' },
  ),
);
