import { apiClient } from '@/lib/apiClient';

const MOCK_LABOUR = [
  { id: 'lbr-001', date: '2026-08-25', contractor: 'Sri Lakshmi Masonry Works', trade: 'Masonry & Concrete', headcount: '14 Workers (10 Masons, 4 Helpers)' },
  { id: 'lbr-002', date: '2026-08-25', contractor: 'Venkateswara Steel Bending Co.', trade: 'Rebar & Steel Bending', headcount: '8 Fitters' },
  { id: 'lbr-003', date: '2026-08-24', contractor: 'Star Carpentry & Shuttering', trade: 'Formwork / Carpentry', headcount: '12 Carpenters' },
];

const LOCAL_LABOUR_KEY = 'buildtwin.labour-contractors.local';
let inMemoryLabour = [];

function getLocalLabour() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_LABOUR_KEY) || '[]');
    return Array.isArray(stored) ? stored : inMemoryLabour;
  } catch {
    return inMemoryLabour;
  }
}

function saveLocalLabour(records) {
  inMemoryLabour = records;
  try {
    localStorage.setItem(LOCAL_LABOUR_KEY, JSON.stringify(records));
  } catch {
    // Keep the records in memory when browser storage is unavailable.
  }
}

function toListRecord(record) {
  return {
    ...record,
    id: record.id || `lbr-${Date.now()}`,
    date: record.date || record.recordDate,
    contractor: record.contractor?.name || record.contractor?.companyName || record.contractor || '—',
    trade: record.trade || record.tradeCategory || '—',
    headcount: record.headcount ?? '—',
  };
}

// Maps to /labour/daily (spec section 14 - API Requirements).
export const labourContractorsApi = {
  list: (params = {}) => {
    const projId = params.projectId || 1;
    return apiClient.get(`/labour/daily/project/${projId}`, { params: params.projectId ? undefined : params })
      .then((r) => [...getLocalLabour(), ...(Array.isArray(r.data) ? r.data.map(toListRecord) : [])])
      .catch(() => [...getLocalLabour(), ...MOCK_LABOUR]);
  },
  getById: (id) => apiClient.get(`/labour/daily/${id}`).then((r) => r.data).catch(() => getLocalLabour().find((record) => record.id === id) || MOCK_LABOUR[0]),
  create: (payload) =>
    apiClient.post('/labour/daily', payload).then((r) => toListRecord(r.data)).catch(() => {
      const record = toListRecord({ ...payload, id: `lbr-${Date.now()}` });
      saveLocalLabour([...getLocalLabour(), record]);
      return record;
    }),
  update: (id, payload) =>
    apiClient.put(`/labour/daily/${id}`, payload).then((r) => r.data).catch(() => ({ id, ...payload })),
};

