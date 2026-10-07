import { apiClient } from '@/lib/apiClient';

export const TRADE_OPTIONS = [
  { value: 'MASON', label: 'Masonry & Concrete (Mason)' },
  { value: 'STEEL_FIXER', label: 'Steel Fixing & Reinforcement' },
  { value: 'BAR_BENDER', label: 'Bar Bending & Rebar' },
  { value: 'CARPENTER', label: 'Formwork / Carpentry' },
  { value: 'ELECTRICIAN', label: 'Electrical & MEP' },
  { value: 'PLUMBER', label: 'Plumbing & Drainage' },
  { value: 'PAINTER', label: 'Painting & Finishing' },
  { value: 'WELDER', label: 'Welding & Structural Steel' },
  { value: 'TILE_LAYERING', label: 'Tile & Marble Laying' },
  { value: 'HELPER', label: 'General Site Helpers' },
  { value: 'FOREMAN', label: 'Site Foreman / Supervisor' },
  { value: 'RIGGER', label: 'Rigger & Heavy Lifting' },
  { value: 'OTHER', label: 'Other Specialist Trades' },
];

export const CONTRACTOR_TYPE_OPTIONS = [
  { value: 'MAIN_CONTRACTOR', label: 'Main Contractor / Agency' },
  { value: 'SUBCONTRACTOR', label: 'Specialized Subcontractor' },
];

export const SITE_OPTIONS = [
  { value: 1, label: 'Tower A (Stilt + 18 Floors)' },
  { value: 2, label: 'Tower B (Stilt + 18 Floors)' },
  { value: 3, label: 'Clubhouse & Podium Amenities' },
];

export const MOCK_CONTRACTORS = [
  {
    id: 1,
    contractorCode: 'CTR-001',
    companyName: 'Sri Lakshmi Masonry Works',
    name: 'R. Shanmugam',
    contactPerson: 'R. Shanmugam',
    tradeSpecialization: 'MASON',
    contactNumber: '+91 98410 12345',
    phone: '+91 98410 12345',
    email: 'shanmugam@lakshmimasonry.com',
    address: 'Tower A, Foundation Zone 1, Chennai',
    activeSites: 'Tower A, Foundation Zone 1',
    contractorType: 'MAIN_CONTRACTOR',
    status: 'ACTIVE',
    deployedWorkers: 38,
  },
  {
    id: 2,
    contractorCode: 'CTR-002',
    companyName: 'Venkateswara Steel Bending Co.',
    name: 'K. Balaji',
    contactPerson: 'K. Balaji',
    tradeSpecialization: 'STEEL_FIXER',
    contactNumber: '+91 97100 23456',
    phone: '+91 97100 23456',
    email: 'balaji@venkateswarasteel.com',
    address: 'Tower B, Podium Deck, Chennai',
    activeSites: 'Tower B, Podium Deck',
    contractorType: 'MAIN_CONTRACTOR',
    status: 'ACTIVE',
    deployedWorkers: 26,
  },
  {
    id: 3,
    contractorCode: 'CTR-003',
    companyName: 'Star Carpentry & Shuttering',
    name: 'Mohammed Ali',
    contactPerson: 'Mohammed Ali',
    tradeSpecialization: 'CARPENTER',
    contactNumber: '+91 94440 34567',
    phone: '+91 94440 34567',
    email: 'ali@starshuttering.com',
    address: 'Tower A Floor 4, Tower C, Chennai',
    activeSites: 'Tower A Floor 4, Tower C',
    contractorType: 'MAIN_CONTRACTOR',
    status: 'ACTIVE',
    deployedWorkers: 32,
  },
  {
    id: 4,
    contractorCode: 'CTR-004',
    companyName: 'Apex MEP & Electrical Solutions',
    name: 'S. Kumar',
    contactPerson: 'S. Kumar',
    tradeSpecialization: 'ELECTRICIAN',
    contactNumber: '+91 99400 45678',
    phone: '+91 99400 45678',
    email: 'kumar@apex-mep.com',
    address: 'Basement DB & Conduits, Chennai',
    activeSites: 'Basement DB & Conduits',
    contractorType: 'MAIN_CONTRACTOR',
    status: 'ACTIVE',
    deployedWorkers: 24,
  },
  {
    id: 5,
    contractorCode: 'CTR-005',
    companyName: 'Precision Plumbing Networks',
    name: 'D. Suresh',
    contactPerson: 'D. Suresh',
    tradeSpecialization: 'PLUMBER',
    contactNumber: '+91 98840 56789',
    phone: '+91 98840 56789',
    email: 'suresh@precisionplumbing.in',
    address: 'External Drainage & Risers, Chennai',
    activeSites: 'External Drainage & Risers',
    contractorType: 'MAIN_CONTRACTOR',
    status: 'ACTIVE',
    deployedWorkers: 18,
  },
];

export const MOCK_LABOUR = [
  {
    id: '1',
    date: '2026-09-21',
    recordDate: '2026-09-21',
    projectId: 1,
    siteId: 1,
    contractor: 'Sri Lakshmi Masonry Works',
    contractorId: 1,
    contractorCode: 'CTR-001',
    trade: 'MASON',
    tradeCategory: 'MASON',
    headcount: 38,
    headcountSummary: '38 Workers (Masonry)',
    standardHours: 8,
    overtimeHours: 2.5,
    siteLocation: 'Tower A (Stilt + 18 Floors)',
    supervisor: 'S. Rajesh (Site Engineer)',
    status: 'VERIFIED',
    remarks: 'Brick masonry and block framing on grid 4-12 completed ahead of time.',
  },
  {
    id: '2',
    date: '2026-09-21',
    recordDate: '2026-09-21',
    projectId: 1,
    siteId: 2,
    contractor: 'Venkateswara Steel Bending Co.',
    contractorId: 2,
    contractorCode: 'CTR-002',
    trade: 'STEEL_FIXER',
    tradeCategory: 'STEEL_FIXER',
    headcount: 26,
    headcountSummary: '26 Workers (Steel Fixing)',
    standardHours: 8,
    overtimeHours: 1.5,
    siteLocation: 'Tower B (Stilt + 18 Floors)',
    supervisor: 'M. Anand (Site Supervisor)',
    status: 'VERIFIED',
    remarks: 'Fe500D rebar cutting & tying for core wall C1-C6 in progress.',
  },
  {
    id: '3',
    date: '2026-09-21',
    recordDate: '2026-09-21',
    projectId: 1,
    siteId: 1,
    contractor: 'Star Carpentry & Shuttering',
    contractorId: 3,
    contractorCode: 'CTR-003',
    trade: 'CARPENTER',
    tradeCategory: 'CARPENTER',
    headcount: 32,
    headcountSummary: '32 Workers (Carpentry)',
    standardHours: 8,
    overtimeHours: 3.0,
    siteLocation: 'Tower A (Stilt + 18 Floors)',
    supervisor: 'S. Rajesh (Site Engineer)',
    status: 'VERIFIED',
    remarks: 'Aluminium formwork setup for slab beam framing completed.',
  },
  {
    id: '4',
    date: '2026-09-20',
    recordDate: '2026-09-20',
    projectId: 1,
    siteId: 1,
    contractor: 'Apex MEP & Electrical Solutions',
    contractorId: 4,
    contractorCode: 'CTR-004',
    trade: 'ELECTRICIAN',
    tradeCategory: 'ELECTRICIAN',
    headcount: 24,
    headcountSummary: '24 Workers (Electrical)',
    standardHours: 8,
    overtimeHours: 0,
    siteLocation: 'Tower A (Stilt + 18 Floors)',
    supervisor: 'K. Vignesh (MEP Incharge)',
    status: 'APPROVED',
    remarks: 'Conduit laying and wire drawing through ceiling sleeves.',
  },
  {
    id: '5',
    date: '2026-09-20',
    recordDate: '2026-09-20',
    projectId: 1,
    siteId: 1,
    contractor: 'Precision Plumbing Networks',
    contractorId: 5,
    contractorCode: 'CTR-005',
    trade: 'PLUMBER',
    tradeCategory: 'PLUMBER',
    headcount: 18,
    headcountSummary: '18 Workers (Plumbing)',
    standardHours: 8,
    overtimeHours: 1.0,
    siteLocation: 'Tower A (Stilt + 18 Floors)',
    supervisor: 'K. Vignesh (MEP Incharge)',
    status: 'APPROVED',
    remarks: 'HDPE drainage soil pipe coupling and water pressure testing.',
  },
];

const LOCAL_LABOUR_KEY = 'buildtwin.labour-contractors.local';
const LOCAL_CONTRACTORS_KEY = 'buildtwin.contractors.local';

function getLocalLabour() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_LABOUR_KEY) || '[]');
    return Array.isArray(stored) && stored.length > 0 ? stored : MOCK_LABOUR;
  } catch {
    return MOCK_LABOUR;
  }
}

function saveLocalLabour(records) {
  try {
    localStorage.setItem(LOCAL_LABOUR_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

function getLocalContractors() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_CONTRACTORS_KEY) || '[]');
    return Array.isArray(stored) && stored.length > 0 ? stored : MOCK_CONTRACTORS;
  } catch {
    return MOCK_CONTRACTORS;
  }
}

function saveLocalContractors(records) {
  try {
    localStorage.setItem(LOCAL_CONTRACTORS_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

export function toContractorRecord(row) {
  if (!row) return null;
  return {
    ...row,
    id: row.id,
    contractorCode: row.contractorCode || `CTR-${row.id}`,
    name: row.name || row.contactPerson || '—',
    contactPerson: row.name || row.contactPerson || '—',
    companyName: row.companyName || row.name || 'Contractor Agency',
    tradeSpecialization: row.tradeSpecialization || 'OTHER',
    contactNumber: row.contactNumber || row.phone || '—',
    phone: row.contactNumber || row.phone || '—',
    email: row.email || '',
    address: row.address || row.activeSites || 'Ashok Grandeur Site',
    activeSites: row.address || row.activeSites || 'Ashok Grandeur Site',
    contractorType: row.contractorType || 'MAIN_CONTRACTOR',
    status: row.status || 'ACTIVE',
    deployedWorkers: Number(row.deployedWorkers) || 15,
  };
}

export function toLabourRecord(row) {
  if (!row) return null;
  const rawHeadcount = typeof row.headcount === 'number' ? row.headcount : parseInt(row.headcount || '0', 10);
  const headcount = isNaN(rawHeadcount) ? 0 : rawHeadcount;
  const contractorName = row.contractor?.companyName || row.contractor?.name || (typeof row.contractor === 'string' ? row.contractor : '—');
  const contractorId = row.contractor?.id || row.contractorId || 1;
  const siteId = row.siteId || 1;
  const siteLabel = siteId === 2 ? 'Tower B (Stilt + 18 Floors)' : (siteId === 3 ? 'Clubhouse & Podium' : 'Tower A (Stilt + 18 Floors)');

  return {
    ...row,
    id: String(row.id || `lbr-${Date.now()}`),
    date: row.recordDate || row.date || new Date().toISOString().slice(0, 10),
    recordDate: row.recordDate || row.date || new Date().toISOString().slice(0, 10),
    projectId: Number(row.projectId) || 1,
    siteId,
    siteLocation: row.siteLocation || siteLabel,
    contractor: contractorName,
    contractorId,
    contractorCode: row.contractor?.contractorCode || '',
    trade: row.tradeCategory || row.trade || 'MASON',
    tradeCategory: row.tradeCategory || row.trade || 'MASON',
    headcount,
    headcountSummary: row.headcountSummary || `${headcount} Workers`,
    standardHours: Number(row.standardHours ?? 8),
    overtimeHours: Number(row.overtimeHours ?? 0),
    supervisor: row.supervisor || 'Site Engineer',
    status: row.status || 'VERIFIED',
    remarks: row.remarks || '',
    allocations: Array.isArray(row.allocations) ? row.allocations : [],
  };
}

export const labourContractorsApi = {
  // -------------------------------------------------------------
  // CONTRACTOR MASTER CRUD (FR-040)
  // -------------------------------------------------------------
  listContractors: async () => {
    try {
      const res = await apiClient.get('/contractors');
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(toContractorRecord);
        saveLocalContractors(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Could not fetch contractors from backend, using local fallback:', err);
    }
    return getLocalContractors().map(toContractorRecord);
  },

  getContractorById: async (id) => {
    try {
      const res = await apiClient.get(`/contractors/${id}`);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) return toContractorRecord(data);
    } catch {
      // fallback
    }
    const current = getLocalContractors();
    return toContractorRecord(current.find((c) => String(c.id) === String(id)) || current[0]);
  },

  createContractor: async (payload) => {
    const backendDto = {
      contractorCode: payload.contractorCode || `CTR-00${Date.now().toString().slice(-3)}`,
      name: payload.name || payload.contactPerson || payload.companyName,
      companyName: payload.companyName,
      tradeSpecialization: payload.tradeSpecialization || 'OTHER',
      contactNumber: payload.contactNumber || payload.phone || '+91 98000 00000',
      email: payload.email || `${payload.companyName?.toLowerCase().replace(/[^a-z0-9]/g, '') || 'contractor'}@buildtwin.in`,
      address: payload.address || payload.activeSites || 'Ashok Grandeur Site, Padur',
      contractorType: payload.contractorType || 'MAIN_CONTRACTOR',
      parentContractorId: payload.parentContractorId ? Number(payload.parentContractorId) : null,
      status: payload.status || 'ACTIVE',
    };

    let createdRecord = null;
    try {
      const res = await apiClient.post('/contractors', backendDto);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) {
        createdRecord = toContractorRecord({
          ...data,
          deployedWorkers: Number(payload.deployedWorkers) || 15,
          activeSites: backendDto.address,
        });
      }
    } catch (err) {
      console.warn('Backend create contractor failed, saving locally:', err);
    }

    if (!createdRecord) {
      createdRecord = toContractorRecord({
        ...backendDto,
        id: Date.now(),
        deployedWorkers: Number(payload.deployedWorkers) || 15,
        activeSites: backendDto.address,
      });
    }

    const current = getLocalContractors();
    saveLocalContractors([createdRecord, ...current.filter((c) => String(c.id) !== String(createdRecord.id))]);
    return createdRecord;
  },

  updateContractor: async (id, payload) => {
    const backendDto = {
      contractorCode: payload.contractorCode,
      name: payload.name || payload.contactPerson || payload.companyName,
      companyName: payload.companyName,
      tradeSpecialization: payload.tradeSpecialization,
      contactNumber: payload.contactNumber || payload.phone,
      email: payload.email,
      address: payload.address || payload.activeSites,
      contractorType: payload.contractorType || 'MAIN_CONTRACTOR',
      parentContractorId: payload.parentContractorId ? Number(payload.parentContractorId) : null,
      status: payload.status || 'ACTIVE',
    };

    let updatedRecord = null;
    try {
      const res = await apiClient.put(`/contractors/${id}`, backendDto);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) {
        updatedRecord = toContractorRecord({
          ...data,
          deployedWorkers: Number(payload.deployedWorkers) || 15,
          activeSites: backendDto.address,
        });
      }
    } catch (err) {
      console.warn('Backend update contractor failed, updating locally:', err);
    }

    if (!updatedRecord) {
      updatedRecord = toContractorRecord({ ...payload, id });
    }

    const current = getLocalContractors();
    const idx = current.findIndex((c) => String(c.id) === String(id));
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...updatedRecord };
      saveLocalContractors(current);
    }
    return updatedRecord;
  },

  deleteContractor: async (id) => {
    try {
      await apiClient.delete(`/contractors/${id}`);
    } catch (err) {
      console.warn('Backend delete contractor failed, updating locally:', err);
    }

    const current = getLocalContractors();
    const updated = current.map((c) => (String(c.id) === String(id) ? { ...c, status: 'INACTIVE' } : c));
    saveLocalContractors(updated);
    return true;
  },

  getContractorPerformance: async (id) => {
    try {
      const res = await apiClient.get(`/contractors/${id}/performance`);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) return data;
    } catch {
      // fallback
    }
    return null;
  },

  // -------------------------------------------------------------
  // DAILY LABOUR MANAGEMENT CRUD (FR-041)
  // -------------------------------------------------------------
  list: async (params = {}) => {
    try {
      const projId = params.projectId || 1;
      const res = await apiClient.get(`/labour/daily/project/${projId}`, {
        params: params.projectId ? undefined : params,
      });
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(toLabourRecord);
        saveLocalLabour(formatted);
        return formatted;
      }
    } catch {
      // try unparameterized
    }

    try {
      const res = await apiClient.get('/labour/daily');
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (Array.isArray(data) && data.length > 0) {
        const formatted = data.map(toLabourRecord);
        saveLocalLabour(formatted);
        return formatted;
      }
    } catch (err) {
      console.warn('Could not fetch daily labour from backend, using local fallback:', err);
    }

    return getLocalLabour().map(toLabourRecord);
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/labour/daily/${id}`);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) return toLabourRecord(data);
    } catch {
      // fallback
    }
    const current = getLocalLabour();
    return toLabourRecord(current.find((r) => String(r.id) === String(id)) || current[0]);
  },

  create: async (payload) => {
    const rawHeadcount = typeof payload.headcount === 'number' ? payload.headcount : parseInt(payload.headcount || '0', 10);
    const headcount = isNaN(rawHeadcount) ? 1 : rawHeadcount;
    const recordDate = payload.date || payload.recordDate || new Date().toISOString().slice(0, 10);

    const backendDto = {
      recordDate,
      projectId: Number(payload.projectId) || 1,
      siteId: payload.siteId ? Number(payload.siteId) : 1,
      contractorId: Number(payload.contractorId) || 1,
      tradeCategory: (payload.tradeCategory || 'MASON').toUpperCase(),
      headcount,
      standardHours: Number(payload.standardHours ?? 8),
      overtimeHours: Number(payload.overtimeHours ?? 0),
      remarks: payload.remarks || '',
      allocations: Array.isArray(payload.allocations) ? payload.allocations : [],
    };

    let createdRecord = null;
    try {
      const res = await apiClient.post('/labour/daily', backendDto);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) {
        createdRecord = toLabourRecord(data);
      }
    } catch (err) {
      console.warn('Backend create daily labour failed, saving locally:', err);
    }

    if (!createdRecord) {
      createdRecord = toLabourRecord({
        ...payload,
        ...backendDto,
        id: `lbr-${Date.now()}`,
        contractor: payload.contractor || 'Contractor Firm',
      });
    }

    const current = getLocalLabour();
    saveLocalLabour([createdRecord, ...current.filter((r) => String(r.id) !== String(createdRecord.id))]);
    return createdRecord;
  },

  update: async (id, payload) => {
    const rawHeadcount = typeof payload.headcount === 'number' ? payload.headcount : parseInt(payload.headcount || '0', 10);
    const headcount = isNaN(rawHeadcount) ? 1 : rawHeadcount;
    const recordDate = payload.date || payload.recordDate || new Date().toISOString().slice(0, 10);

    const backendDto = {
      recordDate,
      projectId: Number(payload.projectId) || 1,
      siteId: payload.siteId ? Number(payload.siteId) : 1,
      contractorId: Number(payload.contractorId) || 1,
      tradeCategory: (payload.tradeCategory || 'MASON').toUpperCase(),
      headcount,
      standardHours: Number(payload.standardHours ?? 8),
      overtimeHours: Number(payload.overtimeHours ?? 0),
      remarks: payload.remarks || '',
      allocations: Array.isArray(payload.allocations) ? payload.allocations : [],
    };

    let updatedRecord = null;
    try {
      const res = await apiClient.put(`/labour/daily/${id}`, backendDto);
      const data = res.data?.data !== undefined ? res.data.data : res.data;
      if (data) {
        updatedRecord = toLabourRecord(data);
      }
    } catch (err) {
      console.warn('Backend update daily labour failed, updating locally:', err);
    }

    if (!updatedRecord) {
      updatedRecord = toLabourRecord({ ...payload, ...backendDto, id });
    }

    const current = getLocalLabour();
    const idx = current.findIndex((r) => String(r.id) === String(id));
    if (idx >= 0) {
      current[idx] = { ...current[idx], ...updatedRecord };
      saveLocalLabour(current);
    }
    return updatedRecord;
  },

  delete: async (id) => {
    try {
      await apiClient.delete(`/labour/daily/${id}`);
    } catch (err) {
      console.warn('Backend delete daily labour failed, removing locally:', err);
    }

    const current = getLocalLabour();
    const filtered = current.filter((r) => String(r.id) !== String(id));
    saveLocalLabour(filtered);
    return true;
  },
};
