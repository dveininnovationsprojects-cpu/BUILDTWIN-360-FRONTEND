import { apiClient } from '@/lib/apiClient';

// ─── Material Unit Enum (matches backend MaterialUnit exactly) ──────────────
export const MATERIAL_UNITS = [
  { value: 'BAGS', label: 'Bags' },
  { value: 'TONNES', label: 'Tonnes' },
  { value: 'KG', label: 'KG' },
  { value: 'SQFT', label: 'Sqft' },
  { value: 'CU_M', label: 'm³' },
  { value: 'METERS', label: 'Meters' },
  { value: 'UNITS', label: 'Units' },
  { value: 'LITERS', label: 'Liters' },
  { value: 'NUMBERS', label: 'Numbers' },
  { value: 'BRICKS', label: 'Bricks' },
];

export const UNIT_LABEL_MAP = Object.fromEntries(MATERIAL_UNITS.map((u) => [u.value, u.label]));

// ─── Stock Transaction Types (matches backend enum exactly) ─────────────────
export const STOCK_TRANSACTION_TYPES = [
  { value: 'RECEIPT', label: 'Receipt (Inward)' },
  { value: 'ISSUE', label: 'Issue (To Site)' },
  { value: 'CONSUMPTION', label: 'Consumption (On-site)' },
  { value: 'WASTAGE', label: 'Wastage' },
  { value: 'RETURN', label: 'Return (To Store)' },
  { value: 'ADJUSTMENT', label: 'Stock Adjustment' },
];

// ─── Local Fallback Data (used when backend is unavailable) ─────────────────
let localMaterials = [
  {
    id: 1,
    materialCode: 'MAT-CEM-43',
    name: 'OPC 43 Grade Cement',
    category: 'CEMENT',
    unit: 'BAGS',
    standardRate: 380.00,
    reorderLevel: 100,
    currentStock: 120,
    description: 'OPC 43 Grade cement - 50kg bags',
    createdAt: '2026-08-01T10:00:00',
    updatedAt: '2026-08-25T14:00:00',
  },
  {
    id: 2,
    materialCode: 'MAT-STE-12',
    name: 'Fe500D TMT Rebar 12mm',
    category: 'STEEL',
    unit: 'TONNES',
    standardRate: 72000.00,
    reorderLevel: 2,
    currentStock: 8.5,
    description: 'IS 1786 Fe500D grade TMT Rebar 12mm dia',
    createdAt: '2026-08-02T10:00:00',
    updatedAt: '2026-08-24T16:00:00',
  },
  {
    id: 3,
    materialCode: 'MAT-CON-M25',
    name: 'Ready-Mix Concrete M25',
    category: 'CONCRETE',
    unit: 'CU_M',
    standardRate: 5200.00,
    reorderLevel: 10,
    currentStock: 45.0,
    description: 'M25 grade ready-mix concrete - on-demand supply',
    createdAt: '2026-08-03T10:00:00',
    updatedAt: '2026-08-23T12:00:00',
  },
  {
    id: 4,
    materialCode: 'MAT-AGG-20MM',
    name: 'Blue Metal Aggregate 20mm',
    category: 'AGGREGATE',
    unit: 'TONNES',
    standardRate: 1800.00,
    reorderLevel: 5,
    currentStock: 3.2,
    description: '20mm crushed blue metal aggregate',
    createdAt: '2026-08-04T10:00:00',
    updatedAt: '2026-08-22T10:00:00',
  },
  {
    id: 5,
    materialCode: 'MAT-BRK-RED',
    name: 'Country Red Bricks (FPS)',
    category: 'BRICKS',
    unit: 'BRICKS',
    standardRate: 9.5,
    reorderLevel: 5000,
    currentStock: 8500,
    description: 'IS 1077 compliant country-fired red bricks',
    createdAt: '2026-08-05T10:00:00',
    updatedAt: '2026-08-21T08:00:00',
  },
];

let localLedger = [];
let localLedgerIdCounter = 1;

let localSuppliers = [
  {
    id: 1,
    supplierCode: 'SUP-1001',
    name: 'Coromandel Building Supplies',
    contactPerson: 'Srinivasan R',
    phone: '+919444012345',
    email: 'sales@coromandelsupplies.com',
    gstin: '33AAAAA0000A1Z5',
    address: 'OMR Road, Sholinganallur, Chennai',
    status: 'ACTIVE',
    createdAt: '2026-07-01T10:00:00',
  },
  {
    id: 2,
    supplierCode: 'SUP-1002',
    name: 'UltraTech Cement Ltd',
    contactPerson: 'Rajesh Nair',
    phone: '+919876543210',
    email: 'sales@ultratech.com',
    gstin: '27AAAAA0001A1Z5',
    address: 'Anna Salai, Chennai',
    status: 'ACTIVE',
    createdAt: '2026-07-05T10:00:00',
  },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function isNetworkError(err) {
  return !err?.response || err?.code === 'ERR_NETWORK' || err?.response?.status === 503 || err?.response?.status === 404;
}

function getStatus(mat) {
  const stock = Number(mat.currentStock ?? 0);
  const reorder = Number(mat.reorderLevel ?? 0);
  if (stock === 0) return 'OUT_OF_STOCK';
  if (reorder > 0 && stock <= reorder) return 'LOW_STOCK';
  return 'HEALTHY';
}

function normaliseMaterial(m) {
  return {
    ...m,
    id: m.id,
    materialCode: m.materialCode || m.code || '',
    code: m.materialCode || m.code || '',
    name: m.name || '',
    category: m.category || '',
    unit: m.unit || 'UNITS',
    unitLabel: UNIT_LABEL_MAP[m.unit] || m.unit || '',
    standardRate: Number(m.standardRate ?? 0),
    reorderLevel: Number(m.reorderLevel ?? 0),
    currentStock: Number(m.currentStock ?? 0),
    description: m.description || '',
    status: getStatus(m),
    stockBalance: `${Number(m.currentStock ?? 0)} ${UNIT_LABEL_MAP[m.unit] || m.unit || ''}`,
    createdAt: m.createdAt || null,
    updatedAt: m.updatedAt || null,
  };
}

function normaliseLedger(entry) {
  return {
    ...entry,
    id: entry.id,
    materialId: entry.material?.id ?? entry.materialId,
    materialName: entry.material?.name ?? entry.materialName ?? 'Unknown',
    materialCode: entry.material?.materialCode ?? entry.materialCode ?? '',
    transactionType: entry.transactionType,
    quantity: Number(entry.quantity ?? 0),
    unitPrice: Number(entry.unitPrice ?? 0),
    projectId: entry.projectId,
    zone: entry.zone || '',
    referenceId: entry.referenceId || '',
    remarks: entry.remarks || '',
    timestamp: entry.timestamp || entry.createdAt || new Date().toISOString(),
  };
}

function normaliseSupplier(s) {
  return { ...s, id: s.id, status: s.status || 'ACTIVE' };
}

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

// ─── Materials Catalog API ────────────────────────────────────────────────────
export const materialsInventoryApi = {
  /** GET /api/v1/materials — fetch all materials in catalog */
  async list(params) {
    try {
      const res = await apiClient.get('/materials', { params });
      const records = extractList(res.data);
      return records.map(normaliseMaterial);
    } catch (err) {
      if (isNetworkError(err)) return localMaterials.map(normaliseMaterial);
      throw err;
    }
  },

  /** GET /api/v1/materials/:id — fetch by ID */
  async getById(id) {
    if (!id || isNaN(Number(id)) || Number(id) > 1000000000) {
      const found = localMaterials.find((m) => String(m.id) === String(id));
      return found ? normaliseMaterial(found) : null;
    }
    try {
      const res = await apiClient.get(`/materials/${id}`);
      return normaliseMaterial(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const found = localMaterials.find((m) => String(m.id) === String(id));
        return found ? normaliseMaterial(found) : null;
      }
      throw err;
    }
  },

  /** GET /api/v1/materials/code/:materialCode — fetch by SKU code */
  async getByCode(materialCode) {
    if (!materialCode) return null;
    try {
      const res = await apiClient.get(`/materials/code/${encodeURIComponent(materialCode)}`);
      return normaliseMaterial(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const found = localMaterials.find(
          (m) => m.materialCode?.toUpperCase() === String(materialCode).toUpperCase()
        );
        return found ? normaliseMaterial(found) : null;
      }
      throw err;
    }
  },

  /** GET /api/v1/materials/category/:category — filter materials by category */
  async getByCategory(category) {
    if (!category) return this.list();
    try {
      const res = await apiClient.get(`/materials/category/${encodeURIComponent(category)}`);
      return extractList(res.data).map(normaliseMaterial);
    } catch (err) {
      if (isNetworkError(err)) {
        return localMaterials
          .filter((m) => m.category?.toUpperCase() === String(category).toUpperCase())
          .map(normaliseMaterial);
      }
      throw err;
    }
  },

  /** GET /api/v1/materials/low-stock — fetch low-stock materials */
  async getLowStock() {
    try {
      const res = await apiClient.get('/materials/low-stock');
      return extractList(res.data).map(normaliseMaterial);
    } catch (err) {
      if (isNetworkError(err)) {
        return localMaterials
          .filter((m) => Number(m.currentStock) <= Number(m.reorderLevel ?? 0))
          .map(normaliseMaterial);
      }
      throw err;
    }
  },

  /** GET /api/v1/materials/reorder-alerts — fetch reorder threshold alerts */
  async getReorderAlerts() {
    try {
      const res = await apiClient.get('/materials/reorder-alerts');
      return extractList(res.data).map(normaliseMaterial);
    } catch (err) {
      if (isNetworkError(err)) {
        return localMaterials
          .filter((m) => Number(m.currentStock) <= Number(m.reorderLevel ?? 0))
          .map(normaliseMaterial);
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/materials — create a new material catalog item.
   * Backend payload: { materialCode, name, category, unit (enum), standardRate, reorderLevel, description }
   */
  async create(payload) {
    const body = {
      materialCode: payload.materialCode || payload.code,
      name: payload.name,
      category: payload.category,
      unit: payload.unit,
      standardRate: Number(payload.standardRate),
      reorderLevel: payload.reorderLevel ? Number(payload.reorderLevel) : null,
      description: payload.description || null,
    };
    try {
      const res = await apiClient.post('/materials', body);
      return normaliseMaterial(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const newMat = {
          id: Date.now(),
          materialCode: body.materialCode,
          name: body.name,
          category: body.category,
          unit: body.unit,
          standardRate: body.standardRate,
          reorderLevel: body.reorderLevel ?? 0,
          currentStock: 0,
          description: body.description ?? '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        localMaterials = [newMat, ...localMaterials];
        return normaliseMaterial(newMat);
      }
      throw err;
    }
  },

  /**
   * PUT /api/v1/materials/:id — update material catalog entry.
   * Backend payload: { name, category, unit, standardRate, reorderLevel, description }
   */
  async update(id, payload) {
    const body = {
      name: payload.name,
      category: payload.category,
      unit: payload.unit,
      standardRate: payload.standardRate ? Number(payload.standardRate) : undefined,
      reorderLevel: payload.reorderLevel ? Number(payload.reorderLevel) : undefined,
      description: payload.description || null,
    };
    try {
      const res = await apiClient.put(`/materials/${id}`, body);
      return normaliseMaterial(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        localMaterials = localMaterials.map((m) =>
          String(m.id) === String(id) ? { ...m, ...body, updatedAt: new Date().toISOString() } : m
        );
        const updated = localMaterials.find((m) => String(m.id) === String(id));
        return updated ? normaliseMaterial(updated) : null;
      }
      throw err;
    }
  },

  /** DELETE /api/v1/materials/:id */
  async delete(id) {
    try {
      await apiClient.delete(`/materials/${id}`);
      return true;
    } catch (err) {
      if (isNetworkError(err)) {
        localMaterials = localMaterials.filter((m) => String(m.id) !== String(id));
        return true;
      }
      throw err;
    }
  },
};

// ─── Stock Ledger API (Immutable Audit Trail) ─────────────────────────────────
export const stockLedgerApi = {
  /**
   * POST /api/v1/stock-ledger/transaction
   * Records any stock transaction (RECEIPT, ISSUE, CONSUMPTION, WASTAGE, RETURN, ADJUSTMENT)
   */
  async recordTransaction(payload) {
    const body = {
      materialId: Number(payload.materialId),
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      activityId: payload.activityId ? Number(payload.activityId) : null,
      zone: payload.zone || null,
      contractorId: payload.contractorId ? Number(payload.contractorId) : null,
      transactionType: payload.transactionType,
      quantity: Number(payload.quantity),
      unitPrice: payload.unitPrice ? Number(payload.unitPrice) : null,
      referenceId: payload.referenceId || null,
      remarks: payload.remarks || null,
    };
    try {
      const res = await apiClient.post('/stock-ledger/transaction', body);
      return normaliseLedger(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const mat = localMaterials.find((m) => String(m.id) === String(body.materialId));
        if (mat) {
          const qty = Number(body.quantity);
          const type = body.transactionType;
          if (['ISSUE', 'CONSUMPTION', 'WASTAGE'].includes(type)) {
            mat.currentStock = Math.max(0, Number(mat.currentStock) - qty);
          } else if (['RECEIPT', 'RETURN'].includes(type)) {
            mat.currentStock = Number(mat.currentStock) + qty;
          } else if (type === 'ADJUSTMENT') {
            mat.currentStock = qty;
          }
          mat.updatedAt = new Date().toISOString();
        }
        const entry = {
          id: localLedgerIdCounter++,
          ...body,
          material: mat ? { id: mat.id, name: mat.name, materialCode: mat.materialCode } : null,
          timestamp: new Date().toISOString(),
        };
        localLedger = [entry, ...localLedger];
        return normaliseLedger(entry);
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/stock-ledger/issue
   * Issues material from store to specific WBS Activity, Zone, or Contractor
   */
  async issue(payload) {
    const body = {
      materialId: Number(payload.materialId),
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      activityId: payload.activityId ? Number(payload.activityId) : null,
      zone: payload.zone || null,
      contractorId: payload.contractorId ? Number(payload.contractorId) : null,
      transactionType: 'ISSUE',
      quantity: Number(payload.quantity),
      unitPrice: payload.unitPrice ? Number(payload.unitPrice) : null,
      referenceId: payload.referenceId || null,
      remarks: payload.remarks || null,
    };
    try {
      const res = await apiClient.post('/stock-ledger/issue', body);
      return normaliseLedger(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        return this.recordTransaction(body);
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/stock-ledger/consumption
   * Records actual material consumption on site work against WBS activity and Zone
   */
  async recordConsumption(payload) {
    const body = {
      materialId: Number(payload.materialId),
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      activityId: payload.activityId ? Number(payload.activityId) : null,
      zone: payload.zone || null,
      contractorId: payload.contractorId ? Number(payload.contractorId) : null,
      transactionType: 'CONSUMPTION',
      quantity: Number(payload.quantity),
      unitPrice: payload.unitPrice ? Number(payload.unitPrice) : null,
      referenceId: payload.referenceId || null,
      remarks: payload.remarks || null,
    };
    try {
      const res = await apiClient.post('/stock-ledger/consumption', body);
      return normaliseLedger(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        return this.recordTransaction(body);
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/stock-ledger/wastage
   * Tracks material wastage on site and updates stock balance transactionally
   */
  async recordWastage(payload) {
    const body = {
      materialId: Number(payload.materialId),
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      activityId: payload.activityId ? Number(payload.activityId) : null,
      zone: payload.zone || null,
      contractorId: payload.contractorId ? Number(payload.contractorId) : null,
      transactionType: 'WASTAGE',
      quantity: Number(payload.quantity),
      unitPrice: payload.unitPrice ? Number(payload.unitPrice) : null,
      referenceId: payload.referenceId || null,
      remarks: payload.remarks || null,
    };
    try {
      const res = await apiClient.post('/stock-ledger/wastage', body);
      return normaliseLedger(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        return this.recordTransaction(body);
      }
      throw err;
    }
  },

  /**
   * POST /api/v1/stock-ledger/reconcile
   * Compares system stock vs physical stock count, computes variance, and logs stock adjustment
   * Payload: { projectId, siteId, materialId, physicalQty, auditedBy, remarks }
   * Returns: { materialId, materialCode, materialName, systemStock, physicalStock, variance, adjustmentTransactionId, auditedBy, reconciledAt }
   */
  async reconcile(payload) {
    const body = {
      projectId: Number(payload.projectId || 1),
      siteId: payload.siteId ? Number(payload.siteId) : null,
      materialId: Number(payload.materialId),
      physicalQty: Number(payload.physicalQty),
      auditedBy: payload.auditedBy || 'Auditor',
      remarks: payload.remarks || null,
    };
    try {
      const res = await apiClient.post('/stock-ledger/reconcile', body);
      return res.data;
    } catch (err) {
      if (isNetworkError(err)) {
        const mat = localMaterials.find((m) => String(m.id) === String(body.materialId));
        const prevStock = Number(mat?.currentStock ?? 0);
        const physical = Number(body.physicalQty);
        const variance = physical - prevStock;
        if (mat) {
          mat.currentStock = physical;
          mat.updatedAt = new Date().toISOString();
        }
        const adjEntry = {
          id: localLedgerIdCounter++,
          projectId: body.projectId,
          siteId: body.siteId,
          materialId: body.materialId,
          transactionType: 'ADJUSTMENT',
          quantity: Math.abs(variance),
          unitPrice: mat?.standardRate || null,
          referenceId: `AUDIT-${Date.now().toString().slice(-4)}`,
          remarks: body.remarks || `Physical audit variance: ${variance >= 0 ? '+' : ''}${variance}`,
          material: mat ? { id: mat.id, name: mat.name, materialCode: mat.materialCode } : null,
          timestamp: new Date().toISOString(),
        };
        localLedger = [adjEntry, ...localLedger];
        return {
          materialId: body.materialId,
          materialCode: mat?.materialCode || '',
          materialName: mat?.name || 'Material',
          systemStock: prevStock,
          physicalStock: physical,
          variance,
          adjustmentTransactionId: adjEntry.id,
          auditedBy: body.auditedBy,
          reconciledAt: new Date().toISOString(),
        };
      }
      throw err;
    }
  },

  /** GET /api/v1/stock-ledger/material/:materialId */
  async getLedgerByMaterial(materialId) {
    if (!materialId || isNaN(Number(materialId)) || Number(materialId) > 1000000000) {
      return localLedger.filter((e) => String(e.materialId) === String(materialId)).map(normaliseLedger);
    }
    try {
      const res = await apiClient.get(`/stock-ledger/material/${materialId}`);
      return extractList(res.data).map(normaliseLedger);
    } catch (err) {
      if (isNetworkError(err)) {
        return localLedger.filter((e) => String(e.materialId) === String(materialId)).map(normaliseLedger);
      }
      throw err;
    }
  },

  /** GET /api/v1/stock-ledger/project/:projectId */
  async getLedgerByProject(projectId) {
    try {
      const res = await apiClient.get(`/stock-ledger/project/${projectId}`);
      return extractList(res.data).map(normaliseLedger);
    } catch (err) {
      if (isNetworkError(err)) {
        return localLedger.filter((e) => String(e.projectId) === String(projectId)).map(normaliseLedger);
      }
      throw err;
    }
  },

  /** GET /api/v1/stock-ledger/activity/:activityId */
  async getLedgerByActivity(activityId) {
    try {
      const res = await apiClient.get(`/stock-ledger/activity/${activityId}`);
      return extractList(res.data).map(normaliseLedger);
    } catch (err) {
      if (isNetworkError(err)) {
        return localLedger.filter((e) => String(e.activityId) === String(activityId)).map(normaliseLedger);
      }
      throw err;
    }
  },
};

// ─── Suppliers API ────────────────────────────────────────────────────────────
export const suppliersApi = {
  /** GET /api/v1/suppliers */
  async list(params) {
    try {
      const res = await apiClient.get('/suppliers', { params });
      return extractList(res.data).map(normaliseSupplier);
    } catch (err) {
      if (isNetworkError(err)) return localSuppliers.map(normaliseSupplier);
      throw err;
    }
  },

  /**
   * POST /api/v1/suppliers
   * Backend payload: { supplierCode, name, contactPerson, phone, email, gstin, address, status }
   */
  async create(payload) {
    try {
      const res = await apiClient.post('/suppliers', payload);
      return normaliseSupplier(res.data);
    } catch (err) {
      if (isNetworkError(err)) {
        const newSup = { id: Date.now(), ...payload, createdAt: new Date().toISOString() };
        localSuppliers = [newSup, ...localSuppliers];
        return normaliseSupplier(newSup);
      }
      throw err;
    }
  },
};
