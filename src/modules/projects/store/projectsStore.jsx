import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const SEED_PROJECTS = [
  {
    id: 1,
    code: 'PADUR-AG-01',
    name: 'Ashok Grandeur',
    projectType: 'RESIDENTIAL',
    clientName: 'Ashok Builders & Developers',
    location: 'Padur, OMR, Chennai',
    status: 'ACTIVE',
    plannedStartDate: '2026-09-01',
    plannedEndDate: '2028-06-30',
    actualStartDate: '2026-09-05',
    estimatedBudget: 45000000,
    currency: 'INR',
    totalBuiltUpAreaSqFt: 350000,
    description: '18-storey residential development in Padur, Chennai with 220 luxury units.',
  },
  {
    id: 2,
    code: 'OMR-TC-02',
    name: 'OMR Tech Park Block A',
    projectType: 'COMMERCIAL',
    clientName: 'OMR Realty Infra',
    location: 'Sholinganallur, Chennai',
    status: 'ACTIVE',
    plannedStartDate: '2026-07-01',
    plannedEndDate: '2027-12-31',
    actualStartDate: '2026-07-15',
    estimatedBudget: 85000000,
    currency: 'INR',
    totalBuiltUpAreaSqFt: 520000,
    description: 'Commercial IT block with 12 office levels and 2 basements.',
  },
];

const SEED_SITES = [
  {
    id: 101,
    projectId: 1,
    projectName: 'Ashok Grandeur',
    code: 'PADUR-TWR-A',
    name: 'Tower A (Stilt + 18 Floors)',
    siteType: 'BUILDING_TOWER',
    location: 'North Zone, Ashok Grandeur Campus, Padur',
    status: 'ACTIVE',
    latitude: 12.7932,
    longitude: 80.2241,
    areaSqFt: 85000,
    siteIncharge: 'Suresh Kumar',
  },
  {
    id: 102,
    projectId: 1,
    projectName: 'Ashok Grandeur',
    code: 'PADUR-TWR-B',
    name: 'Tower B (Stilt + 18 Floors)',
    siteType: 'BUILDING_TOWER',
    location: 'South Zone, Ashok Grandeur Campus, Padur',
    status: 'ACTIVE',
    latitude: 12.7935,
    longitude: 80.2245,
    areaSqFt: 85000,
    siteIncharge: 'Rajesh V',
  },
];

const SEED_BUILDINGS = [
  {
    id: 201,
    siteId: 101,
    siteName: 'Tower A (Stilt + 18 Floors)',
    projectId: 1,
    projectName: 'Ashok Grandeur',
    code: 'BLD-TWR-A',
    name: 'Tower A - Residential',
    buildingType: 'RESIDENTIAL_TOWER',
    totalFloors: 18,
    totalBuiltUpAreaSqFt: 180000,
    status: 'UNDER_CONSTRUCTION',
    description: 'Main residential block with 18 floors and 2 parking levels.',
    floorsCount: 19,
  },
];

const SEED_FLOORS = [
  {
    id: 301,
    buildingId: 201,
    buildingName: 'Tower A - Residential',
    siteId: 101,
    projectId: 1,
    floorNumber: 0,
    floorName: 'Stilt Parking Level',
    floorType: 'STILT',
    builtUpAreaSqFt: 10000,
    status: 'COMPLETED',
    zonesCount: 2,
  },
  {
    id: 302,
    buildingId: 201,
    buildingName: 'Tower A - Residential',
    siteId: 101,
    projectId: 1,
    floorNumber: 1,
    floorName: 'First Typical Floor',
    floorType: 'TYPICAL',
    builtUpAreaSqFt: 9500,
    status: 'IN_PROGRESS',
    zonesCount: 4,
  },
];

const SEED_ZONES = [
  {
    id: 401,
    floorId: 302,
    floorName: 'First Typical Floor',
    buildingId: 201,
    siteId: 101,
    projectId: 1,
    code: 'ZN-FL1-A',
    name: 'Zone A (Flats 101-102)',
    zoneType: 'RESIDENTIAL_UNIT',
    areaSqFt: 4500,
    status: 'IN_PROGRESS',
  },
  {
    id: 402,
    floorId: 302,
    floorName: 'First Typical Floor',
    buildingId: 201,
    siteId: 101,
    projectId: 1,
    code: 'ZN-FL1-B',
    name: 'Zone B (Flats 103-104)',
    zoneType: 'RESIDENTIAL_UNIT',
    areaSqFt: 4500,
    status: 'PLANNED',
  },
];

function normalizeCode(code) {
  return (code || '').trim().toUpperCase();
}

export const useProjectsStore = create()(
  persist(
    (set, get) => ({
      demoProjects: SEED_PROJECTS,
      demoSites: SEED_SITES,
      demoBuildings: SEED_BUILDINGS,
      demoFloors: SEED_FLOORS,
      demoZones: SEED_ZONES,

      // Metrics
      getDemoMetrics: () => {
        const projects = get().demoProjects;
        const totalEstimatedBudget = projects.reduce((acc, p) => acc + (Number(p.estimatedBudget) || 0), 0);
        return {
          totalProjects: projects.length,
          activeProjects: projects.filter((p) => p.status === 'ACTIVE').length,
          plannedProjects: projects.filter((p) => p.status === 'PLANNED').length,
          onHoldProjects: projects.filter((p) => p.status === 'ON_HOLD').length,
          completedProjects: projects.filter((p) => p.status === 'COMPLETED').length,
          totalEstimatedBudget,
          totalSites: get().demoSites.length,
        };
      },

      // Projects CRUD
      listDemoProjects: (params = {}) => {
        let list = [...get().demoProjects];
        if (params.search) {
          const s = params.search.toLowerCase();
          list = list.filter(
            (p) =>
              p.name?.toLowerCase().includes(s) ||
              p.code?.toLowerCase().includes(s) ||
              p.location?.toLowerCase().includes(s),
          );
        }
        if (params.status && params.status !== 'ALL') {
          list = list.filter((p) => p.status === params.status);
        }
        if (params.projectType && params.projectType !== 'ALL') {
          list = list.filter((p) => p.projectType === params.projectType);
        }
        return list;
      },

      getDemoProject: (id) => {
        const p = get().demoProjects.find((x) => String(x.id) === String(id));
        if (!p) return null;
        const sites = get().demoSites.filter((s) => String(s.projectId) === String(id));
        return {
          ...p,
          sites,
          teamMembers: [
            { id: 1, username: 'karthik_pm', fullName: 'Karthik Raja', role: 'PROJECT_MANAGER' },
            { id: 2, username: 'suresh_se', fullName: 'Suresh Kumar', role: 'SITE_ENGINEER' },
          ],
        };
      },

      createDemoProject: (payload) => {
        const code = normalizeCode(payload.code);
        if (get().demoProjects.some((p) => p.code === code)) {
          throw new Error(`A project with code '${code}' already exists.`);
        }
        const newProj = {
          ...payload,
          id: Date.now(),
          code,
          status: payload.status || 'PLANNED',
          createdAt: new Date().toISOString(),
        };
        set((s) => ({ demoProjects: [newProj, ...s.demoProjects] }));
        return newProj;
      },

      updateDemoProject: (id, payload) => {
        const current = get().demoProjects.find((p) => String(p.id) === String(id));
        if (!current) throw new Error('Project not found.');
        const code = normalizeCode(payload.code || current.code);
        if (get().demoProjects.some((p) => String(p.id) !== String(id) && p.code === code)) {
          throw new Error(`Project code '${code}' is in use by another project.`);
        }
        const updated = { ...current, ...payload, code };
        set((s) => ({
          demoProjects: s.demoProjects.map((p) => (String(p.id) === String(id) ? updated : p)),
        }));
        return updated;
      },

      updateDemoProjectStatus: (id, status) => {
        const current = get().demoProjects.find((p) => String(p.id) === String(id));
        if (!current) throw new Error('Project not found.');
        const updated = { ...current, status };
        set((s) => ({
          demoProjects: s.demoProjects.map((p) => (String(p.id) === String(id) ? updated : p)),
        }));
        return updated;
      },

      deleteDemoProject: (id) => {
        set((s) => ({
          demoProjects: s.demoProjects.filter((p) => String(p.id) !== String(id)),
          demoSites: s.demoSites.filter((site) => String(site.projectId) !== String(id)),
        }));
      },

      // Sites CRUD
      listDemoSites: (projectId) => {
        return get().demoSites.filter((s) => String(s.projectId) === String(projectId));
      },

      getDemoSite: (id) => {
        return get().demoSites.find((s) => String(s.id) === String(id));
      },

      createDemoSite: (projectId, payload) => {
        const proj = get().demoProjects.find((p) => String(p.id) === String(projectId));
        const newSite = {
          ...payload,
          id: Date.now(),
          projectId: Number(projectId),
          projectName: proj?.name || 'Project',
          code: normalizeCode(payload.code),
          status: payload.status || 'ACTIVE',
        };
        set((s) => ({ demoSites: [...s.demoSites, newSite] }));
        return newSite;
      },

      updateDemoSite: (id, payload) => {
        const current = get().demoSites.find((s) => String(s.id) === String(id));
        if (!current) throw new Error('Site not found.');
        const updated = { ...current, ...payload, code: normalizeCode(payload.code || current.code) };
        set((s) => ({
          demoSites: s.demoSites.map((site) => (String(site.id) === String(id) ? updated : site)),
        }));
        return updated;
      },

      updateDemoSiteStatus: (id, status) => {
        const current = get().demoSites.find((s) => String(s.id) === String(id));
        if (!current) throw new Error('Site not found.');
        const updated = { ...current, status };
        set((s) => ({
          demoSites: s.demoSites.map((site) => (String(site.id) === String(id) ? updated : site)),
        }));
        return updated;
      },

      deleteDemoSite: (id) => {
        set((s) => ({
          demoSites: s.demoSites.filter((site) => String(site.id) !== String(id)),
          demoBuildings: s.demoBuildings.filter((b) => String(b.siteId) !== String(id)),
        }));
      },

      // Buildings CRUD
      listDemoBuildings: (siteId) => {
        return get().demoBuildings.filter((b) => String(b.siteId) === String(siteId));
      },

      getDemoBuilding: (id) => {
        return get().demoBuildings.find((b) => String(b.id) === String(id));
      },

      createDemoBuilding: (siteId, payload) => {
        const site = get().demoSites.find((s) => String(s.id) === String(siteId));
        const newBld = {
          ...payload,
          id: Date.now(),
          siteId: Number(siteId),
          siteName: site?.name || 'Site',
          projectId: site?.projectId,
          projectName: site?.projectName,
          code: normalizeCode(payload.code),
          status: payload.status || 'UNDER_CONSTRUCTION',
        };
        set((s) => ({ demoBuildings: [...s.demoBuildings, newBld] }));
        return newBld;
      },

      updateDemoBuilding: (id, payload) => {
        const current = get().demoBuildings.find((b) => String(b.id) === String(id));
        if (!current) throw new Error('Building not found.');
        const updated = { ...current, ...payload, code: normalizeCode(payload.code || current.code) };
        set((s) => ({
          demoBuildings: s.demoBuildings.map((b) => (String(b.id) === String(id) ? updated : b)),
        }));
        return updated;
      },

      updateDemoBuildingStatus: (id, status) => {
        const current = get().demoBuildings.find((b) => String(b.id) === String(id));
        if (!current) throw new Error('Building not found.');
        const updated = { ...current, status };
        set((s) => ({
          demoBuildings: s.demoBuildings.map((b) => (String(b.id) === String(id) ? updated : b)),
        }));
        return updated;
      },

      deleteDemoBuilding: (id) => {
        set((s) => ({
          demoBuildings: s.demoBuildings.filter((b) => String(b.id) !== String(id)),
          demoFloors: s.demoFloors.filter((f) => String(f.buildingId) !== String(id)),
        }));
      },

      // Floors CRUD
      listDemoFloors: (buildingId) => {
        return get()
          .demoFloors.filter((f) => String(f.buildingId) === String(buildingId))
          .sort((a, b) => a.floorNumber - b.floorNumber);
      },

      getDemoFloor: (id) => {
        return get().demoFloors.find((f) => String(f.id) === String(id));
      },

      createDemoFloor: (buildingId, payload) => {
        const bld = get().demoBuildings.find((b) => String(b.id) === String(buildingId));
        const newFloor = {
          ...payload,
          id: Date.now(),
          buildingId: Number(buildingId),
          buildingName: bld?.name || 'Building',
          siteId: bld?.siteId,
          projectId: bld?.projectId,
          status: payload.status || 'IN_PROGRESS',
        };
        set((s) => ({ demoFloors: [...s.demoFloors, newFloor] }));
        return newFloor;
      },

      updateDemoFloor: (id, payload) => {
        const current = get().demoFloors.find((f) => String(f.id) === String(id));
        if (!current) throw new Error('Floor not found.');
        const updated = { ...current, ...payload };
        set((s) => ({
          demoFloors: s.demoFloors.map((f) => (String(f.id) === String(id) ? updated : f)),
        }));
        return updated;
      },

      updateDemoFloorStatus: (id, status) => {
        const current = get().demoFloors.find((f) => String(f.id) === String(id));
        if (!current) throw new Error('Floor not found.');
        const updated = { ...current, status };
        set((s) => ({
          demoFloors: s.demoFloors.map((f) => (String(f.id) === String(id) ? updated : f)),
        }));
        return updated;
      },

      deleteDemoFloor: (id) => {
        set((s) => ({
          demoFloors: s.demoFloors.filter((f) => String(f.id) !== String(id)),
          demoZones: s.demoZones.filter((z) => String(z.floorId) !== String(id)),
        }));
      },

      // Zones CRUD
      listDemoZones: (floorId) => {
        return get().demoZones.filter((z) => String(z.floorId) === String(floorId));
      },

      getDemoZone: (id) => {
        return get().demoZones.find((z) => String(z.id) === String(id));
      },

      createDemoZone: (floorId, payload) => {
        const floor = get().demoFloors.find((f) => String(f.id) === String(floorId));
        const newZone = {
          ...payload,
          id: Date.now(),
          floorId: Number(floorId),
          floorName: floor?.floorName || 'Floor',
          buildingId: floor?.buildingId,
          siteId: floor?.siteId,
          projectId: floor?.projectId,
          code: normalizeCode(payload.code),
          status: payload.status || 'IN_PROGRESS',
        };
        set((s) => ({ demoZones: [...s.demoZones, newZone] }));
        return newZone;
      },

      updateDemoZone: (id, payload) => {
        const current = get().demoZones.find((z) => String(z.id) === String(id));
        if (!current) throw new Error('Zone not found.');
        const updated = { ...current, ...payload, code: normalizeCode(payload.code || current.code) };
        set((s) => ({
          demoZones: s.demoZones.map((z) => (String(z.id) === String(id) ? updated : z)),
        }));
        return updated;
      },

      updateDemoZoneStatus: (id, status) => {
        const current = get().demoZones.find((z) => String(z.id) === String(id));
        if (!current) throw new Error('Zone not found.');
        const updated = { ...current, status };
        set((s) => ({
          demoZones: s.demoZones.map((z) => (String(z.id) === String(id) ? updated : z)),
        }));
        return updated;
      },

      deleteDemoZone: (id) => {
        set((s) => ({
          demoZones: s.demoZones.filter((z) => String(z.id) !== String(id)),
        }));
      },

      // Hierarchy Tree Generator
      getDemoHierarchyTree: (projectId) => {
        const proj = get().demoProjects.find((p) => String(p.id) === String(projectId));
        if (!proj) return null;

        const sites = get().demoSites.filter((s) => String(s.projectId) === String(projectId));
        const siteNodes = sites.map((site) => {
          const buildings = get().demoBuildings.filter((b) => String(b.siteId) === String(site.id));
          const buildingNodes = buildings.map((bld) => {
            const floors = get()
              .demoFloors.filter((f) => String(f.buildingId) === String(bld.id))
              .sort((a, b) => a.floorNumber - b.floorNumber);
            const floorNodes = floors.map((flr) => {
              const zones = get().demoZones.filter((z) => String(z.floorId) === String(flr.id));
              return {
                id: flr.id,
                floorNumber: flr.floorNumber,
                floorName: flr.floorName,
                floorType: flr.floorType,
                status: flr.status,
                zones: zones.map((z) => ({
                  id: z.id,
                  code: z.code,
                  name: z.name,
                  zoneType: z.zoneType,
                  areaSqFt: z.areaSqFt,
                  status: z.status,
                })),
              };
            });
            return {
              id: bld.id,
              name: bld.name,
              code: bld.code,
              buildingType: bld.buildingType,
              totalFloors: bld.totalFloors,
              status: bld.status,
              floors: floorNodes,
            };
          });
          return {
            id: site.id,
            name: site.name,
            code: site.code,
            siteType: site.siteType,
            status: site.status,
            latitude: site.latitude,
            longitude: site.longitude,
            buildings: buildingNodes,
          };
        });

        return {
          id: proj.id,
          name: proj.name,
          code: proj.code,
          type: 'PROJECT',
          status: proj.status,
          sites: siteNodes,
        };
      },

      // Hierarchy Lineage Validation
      validateDemoHierarchy: (projectId, siteId, buildingId, floorId, zoneId) => {
        const errors = [];
        let pName, sName, bName, fName, zName;

        if (projectId) {
          const p = get().demoProjects.find((x) => String(x.id) === String(projectId));
          if (!p) errors.push(`Project ID ${projectId} does not exist`);
          else pName = p.name;
        }

        if (siteId) {
          const s = get().demoSites.find((x) => String(x.id) === String(siteId));
          if (!s) errors.push(`Site ID ${siteId} does not exist`);
          else {
            sName = s.name;
            if (projectId && String(s.projectId) !== String(projectId)) {
              errors.push(`Site '${s.name}' does not belong to Project ID ${projectId}`);
            }
          }
        }

        if (buildingId) {
          const b = get().demoBuildings.find((x) => String(x.id) === String(buildingId));
          if (!b) errors.push(`Building ID ${buildingId} does not exist`);
          else {
            bName = b.name;
            if (siteId && String(b.siteId) !== String(siteId)) {
              errors.push(`Building '${b.name}' does not belong to Site ID ${siteId}`);
            }
          }
        }

        if (floorId) {
          const f = get().demoFloors.find((x) => String(x.id) === String(floorId));
          if (!f) errors.push(`Floor ID ${floorId} does not exist`);
          else {
            fName = f.floorName;
            if (buildingId && String(f.buildingId) !== String(buildingId)) {
              errors.push(`Floor '${f.floorName}' does not belong to Building ID ${buildingId}`);
            }
          }
        }

        if (zoneId) {
          const z = get().demoZones.find((x) => String(x.id) === String(zoneId));
          if (!z) errors.push(`Zone ID ${zoneId} does not exist`);
          else {
            zName = z.name;
            if (floorId && String(z.floorId) !== String(floorId)) {
              errors.push(`Zone '${z.name}' does not belong to Floor ID ${floorId}`);
            }
          }
        }

        const valid = errors.length === 0;
        return {
          valid,
          message: valid
            ? 'Physical hierarchy path is valid and intact'
            : 'Hierarchy validation failed with mismatches',
          projectId,
          projectName: pName,
          siteId,
          siteName: sName,
          buildingId,
          buildingName: bName,
          floorId,
          floorName: fName,
          zoneId,
          zoneName: zName,
          errors,
        };
      },
    }),
    { name: 'buildtwin360-projects-hierarchy' },
  ),
);
