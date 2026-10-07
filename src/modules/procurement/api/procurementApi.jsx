import { apiClient } from '@/lib/apiClient';

const LOCAL_STORAGE_GRN_KEY = 'buildtwin_local_grns';

const MOCK_PROCUREMENT = [
  {
    id: 1,
    poNumber: 'PO-2026-001',
    supplier: 'UltraTech Cement Distributors',
    supplierId: 1,
    projectId: 1,
    materialId: 1,
    materialName: 'Coromandel OPC Cement 50kg',
    amount: 190000.0,
    deliveryDate: '2026-08-28',
    status: 'DELIVERED',
    orderedQty: 500,
  },
  {
    id: 2,
    poNumber: 'PO-2026-002',
    supplier: 'TATA Tiscon Rebar Suppliers',
    supplierId: 2,
    projectId: 1,
    materialId: 2,
    materialName: 'TMT Steel Bars 12mm Fe500',
    amount: 310000.0,
    deliveryDate: '2026-09-02',
    status: 'IN_TRANSIT',
    orderedQty: 5,
  },
  {
    id: 3,
    poNumber: 'PO-2026-003',
    supplier: 'Chennai Ready-Mix Concrete Co.',
    supplierId: 3,
    projectId: 1,
    materialId: 3,
    materialName: 'River Sand M-Sand Grade 1',
    amount: 85000.0,
    deliveryDate: '2026-08-30',
    status: 'PENDING',
    orderedQty: 100,
  },
];

const MOCK_GRNS = [
  {
    id: 101,
    grnNumber: 'GRN-2026-001',
    poId: 1,
    poNumber: 'PO-2026-001',
    projectId: 1,
    siteId: 1,
    materialId: 1,
    materialName: 'Coromandel OPC Cement 50kg',
    receivedQty: 500,
    acceptedQty: 485,
    rejectedQty: 15,
    rejectionReason: '15 bags torn and damaged due to heavy rain in transit',
    receivedBy: 'Ramesh Storekeeper',
    deliveryEvidenceUrl: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-08-28T14:30:00Z',
    status: 'PARTIALLY_ACCEPTED',
  },
  {
    id: 102,
    grnNumber: 'GRN-2026-002',
    poId: 2,
    poNumber: 'PO-2026-002',
    projectId: 1,
    siteId: 1,
    materialId: 2,
    materialName: 'TMT Steel Bars 12mm Fe500',
    receivedQty: 5,
    acceptedQty: 5,
    rejectedQty: 0,
    rejectionReason: null,
    receivedBy: 'Suresh Quality Inspector',
    deliveryEvidenceUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb18086f6?auto=format&fit=crop&w=800&q=80',
    createdAt: '2026-09-02T11:15:00Z',
    status: 'FULLY_ACCEPTED',
  },
];

const MOCK_MATERIALS = [
  { id: 1, materialCode: 'MAT-CEM-001', name: 'Coromandel OPC Cement 50kg', category: 'CEMENT', unit: 'BAGS', currentStock: 485, standardRate: 380 },
  { id: 2, materialCode: 'MAT-STL-012', name: 'TMT Steel Bars 12mm Fe500', category: 'STEEL', unit: 'TONNES', currentStock: 5, standardRate: 62000 },
  { id: 3, materialCode: 'MAT-SND-001', name: 'River Sand M-Sand Grade 1', category: 'AGGREGATES', unit: 'TONNES', currentStock: 120, standardRate: 850 },
  { id: 4, materialCode: 'MAT-BRK-001', name: 'Wire-cut Red Bricks Standard', category: 'MASONRY', unit: 'NOS', currentStock: 8500, standardRate: 11 },
];

function getStoredLocalGrns() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_GRN_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalGrn(grn) {
  try {
    const existing = getStoredLocalGrns();
    const updated = [grn, ...existing.filter((item) => item.id !== grn.id)];
    localStorage.setItem(LOCAL_STORAGE_GRN_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to cache GRN in localStorage:', e);
  }
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object') {
    if (Array.isArray(data.data)) return data.data;
    if (Array.isArray(data.content)) return data.content;
    if (Array.isArray(data.items)) return data.items;
  }
  return [];
}

function extractSingle(data) {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    if (data.data !== undefined && typeof data.data === 'object' && !Array.isArray(data.data)) {
      return data.data;
    }
  }
  return data;
}

export const procurementApi = {
  // --- Purchase Orders (FR-052) ---
  list: async (params = {}) => {
    const projId = params.projectId || 1;
    try {
      const res = await apiClient.get(`/procurement/purchase-orders/project/${projId}`, {
        params: params.projectId ? undefined : params,
      });
      const data = extractList(res.data);
      if (data.length > 0) {
        return data;
      }
      return Array.isArray(res.data) && res.data.length === 0 ? [] : (data.length > 0 ? data : MOCK_PROCUREMENT);
    } catch {
      return MOCK_PROCUREMENT;
    }
  },

  getById: async (id) => {
    try {
      const res = await apiClient.get(`/procurement/purchase-orders/${id}`);
      return extractSingle(res.data);
    } catch {
      return MOCK_PROCUREMENT.find((p) => String(p.id) === String(id)) || MOCK_PROCUREMENT[0];
    }
  },

  create: async (payload) => {
    try {
      const res = await apiClient.post('/procurement/purchase-orders', payload);
      return extractSingle(res.data);
    } catch {
      return { id: Date.now(), ...payload };
    }
  },

  update: async (id, payload) => {
    try {
      const res = await apiClient.put(`/procurement/purchase-orders/${id}`, payload);
      return extractSingle(res.data);
    } catch {
      return { id, ...payload };
    }
  },

  deletePurchaseOrder: async (id) => {
    try {
      const res = await apiClient.delete(`/procurement/purchase-orders/${id}`);
      return extractSingle(res.data);
    } catch {
      return { success: true };
    }
  },

  // --- Goods Receipt Notes (GRN - FR-053) ---
  /**
   * Records a Goods Receipt Note (GRN).
   * Backend endpoint: POST /api/v1/procurement/grn
   * Backend logic automatically creates a StockTransactionType.RECEIPT entry in the stock ledger
   * and increments material.currentStock by acceptedQty.
   */
  createGrn: async (payload) => {
    const body = {
      poId: Number(payload.poId),
      materialId: Number(payload.materialId),
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      grnNumber: payload.grnNumber || `GRN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      receivedQty: Number(payload.receivedQty),
      acceptedQty: Number(payload.acceptedQty),
      rejectedQty: Number(payload.rejectedQty || 0),
      rejectionReason: payload.rejectionReason || null,
      receivedBy: payload.receivedBy || null,
      deliveryEvidenceUrl: payload.deliveryEvidenceUrl || null,
    };

    try {
      const res = await apiClient.post('/procurement/grn', body);
      const created = extractSingle(res.data);
      saveLocalGrn(created);
      return created;
    } catch (err) {
      // Offline / fallback handling
      const fallback = {
        id: Date.now(),
        ...body,
        createdAt: new Date().toISOString(),
        status:
          body.rejectedQty === 0
            ? 'FULLY_ACCEPTED'
            : body.acceptedQty > 0
            ? 'PARTIALLY_ACCEPTED'
            : 'REJECTED',
      };
      saveLocalGrn(fallback);
      return fallback;
    }
  },

  /**
   * Fetches all GRNs for a project.
   * Pulls from backend GRN by PO endpoints and merges with any local cache.
   */
  listGrns: async (projectId = 1) => {
    const local = getStoredLocalGrns();
    try {
      // 1. Fetch project purchase orders
      const pos = await procurementApi.list({ projectId });
      // 2. Fetch GRNs for each PO
      const grnPromises = (pos || []).map(async (po) => {
        try {
          const res = await apiClient.get(`/procurement/grn/po/${po.id}`);
          const data = extractList(res.data);
          if (data.length > 0) {
            return data.map((g) => ({
              ...g,
              poNumber: po.poNumber,
              supplier: po.supplier,
            }));
          }
          return [];
        } catch {
          return [];
        }
      });

      const grnArrays = await Promise.all(grnPromises);
      const backendGrns = grnArrays.flat();

      if (backendGrns.length > 0) {
        // Merge with local records
        const ids = new Set(backendGrns.map((g) => g.id));
        const extraLocal = local.filter((l) => !ids.has(l.id));
        return [...extraLocal, ...backendGrns];
      }

      // If no backend GRNs found, combine MOCK_GRNS and local GRNs
      const mockIds = new Set(MOCK_GRNS.map((g) => g.id));
      const extraLocal = local.filter((l) => !mockIds.has(l.id));
      return [...extraLocal, ...MOCK_GRNS];
    } catch {
      const mockIds = new Set(MOCK_GRNS.map((g) => g.id));
      const extraLocal = local.filter((l) => !mockIds.has(l.id));
      return [...extraLocal, ...MOCK_GRNS];
    }
  },

  getGrnById: async (id) => {
    try {
      const res = await apiClient.get(`/procurement/grn/${id}`);
      return extractSingle(res.data);
    } catch {
      const all = [...getStoredLocalGrns(), ...MOCK_GRNS];
      return all.find((g) => String(g.id) === String(id)) || MOCK_GRNS[0];
    }
  },

  getGrnsByPo: async (poId) => {
    try {
      const res = await apiClient.get(`/procurement/grn/po/${poId}`);
      return extractList(res.data);
    } catch {
      const all = [...getStoredLocalGrns(), ...MOCK_GRNS];
      return all.filter((g) => String(g.poId) === String(poId));
    }
  },

  deleteGrn: async (id) => {
    try {
      const res = await apiClient.delete(`/procurement/grn/${id}`);
      return extractSingle(res.data);
    } catch {
      const existing = getStoredLocalGrns();
      localStorage.setItem(LOCAL_STORAGE_GRN_KEY, JSON.stringify(existing.filter((g) => g.id !== id)));
      return { success: true };
    }
  },

  // --- Material Master for Picker ---
  listMaterials: async () => {
    try {
      const res = await apiClient.get('/materials');
      const list = extractList(res.data);
      if (list.length > 0) {
        return list;
      }
      return MOCK_MATERIALS;
    } catch {
      return MOCK_MATERIALS;
    }
  },

  // --- Material Requests & Projected Shortages (FR-051, FR-056) ---
  getMaterialRequests: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/procurement/requests/project/${projectId}`);
      return extractList(res.data);
    } catch {
      return [];
    }
  },

  getProjectedShortages: async (projectId = 1) => {
    try {
      const res = await apiClient.get(`/procurement/requests/project/${projectId}/projected-shortage`);
      return extractList(res.data);
    } catch {
      return [];
    }
  },
};
