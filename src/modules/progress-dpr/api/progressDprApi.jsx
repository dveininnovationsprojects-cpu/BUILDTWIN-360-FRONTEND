import { apiClient } from '@/lib/apiClient';
import { SAMPLE_DPR_PHOTOS } from '../utils/dprSamplePhotos';

const FALLBACK_DPRS = [
  {
    id: 'dpr-001',
    reportDate: '2026-08-25',
    siteName: 'PRJ-001 Padur Residence',
    activity: 'Slab concreting',
    quantities: [{ workDescription: 'Concrete placement', completedQuantity: 12.5, unit: 'm3' }],
    qtyCompleted: '12.5 m3',
    remarks: 'Concreting completed as planned. Cube samples taken for 7-day and 28-day curing test.',
    submittedBy: 'Site Engineer',
    status: 'APPROVED',
    photos: [
      {
        id: 'photo-001',
        name: 'slab_pour_grid_b4.jpg',
        size: 3.4 * 1024 * 1024,
        type: 'image/jpeg',
        previewUrl: SAMPLE_DPR_PHOTOS.slabConcrete,
        dataUrl: SAMPLE_DPR_PHOTOS.slabConcrete,
        activityTag: 'Concrete placement',
        caption: 'Level 03 Slab Pouring in progress - Grid B4',
        locationTag: 'Level 03',
        uploadedAt: '2026-08-25T11:45:00Z',
      },
      {
        id: 'photo-002',
        name: 'surface_finishing.jpg',
        size: 2.8 * 1024 * 1024,
        type: 'image/jpeg',
        previewUrl: SAMPLE_DPR_PHOTOS.slabFinish,
        dataUrl: SAMPLE_DPR_PHOTOS.slabFinish,
        activityTag: 'Concrete placement',
        caption: 'Surface power trowel finishing completed',
        locationTag: 'Level 03 - East Wing',
        uploadedAt: '2026-08-25T15:30:00Z',
      },
    ],
  },
  {
    id: 'dpr-002',
    reportDate: '2026-08-24',
    siteName: 'PRJ-001 Padur Residence',
    activity: 'Column reinforcement',
    quantities: [{ workDescription: 'Column reinforcement', completedQuantity: 100, unit: '%' }],
    qtyCompleted: '100%',
    remarks: 'Inspection cleared before shuttering. Spacing and cover blocks verified by QA.',
    submittedBy: 'Site Engineer',
    status: 'APPROVED',
    photos: [
      {
        id: 'photo-003',
        name: 'column_c12_rebar.jpg',
        size: 4.1 * 1024 * 1024,
        type: 'image/jpeg',
        previewUrl: SAMPLE_DPR_PHOTOS.columnRebar,
        dataUrl: SAMPLE_DPR_PHOTOS.columnRebar,
        activityTag: 'Column reinforcement',
        caption: 'Column C12 vertical rebar & tie spacing check',
        locationTag: 'Grid C-12',
        uploadedAt: '2026-08-24T14:10:00Z',
      },
    ],
  },
  {
    id: 'dpr-003',
    reportDate: '2026-08-25',
    siteName: 'PRJ-002 OMR Commercial',
    activity: 'Footing excavation',
    quantities: [{ workDescription: 'Excavation', completedQuantity: 45, unit: 'm3' }],
    qtyCompleted: '45 m3',
    remarks: 'Dewatering pump operated in the afternoon. Soil strata matches geotechnical report.',
    submittedBy: 'Site Supervisor',
    status: 'SUBMITTED',
    photos: [
      {
        id: 'photo-004',
        name: 'footing_excavation_pit4.jpg',
        size: 5.2 * 1024 * 1024,
        type: 'image/jpeg',
        previewUrl: SAMPLE_DPR_PHOTOS.excavation,
        dataUrl: SAMPLE_DPR_PHOTOS.excavation,
        activityTag: 'Excavation',
        caption: 'Footing Pit #04 excavated to 2.8m depth',
        locationTag: 'Basement Pit 4',
        uploadedAt: '2026-08-25T16:20:00Z',
      },
    ],
  },
];

const LOCAL_DPR_KEY = 'buildtwin.dpr.local';

function getStoredDprs() {
  try {
    const stored = JSON.parse(localStorage.getItem(LOCAL_DPR_KEY) || '[]');
    return Array.isArray(stored) && stored.length > 0 ? stored : FALLBACK_DPRS;
  } catch {
    return FALLBACK_DPRS;
  }
}

function saveStoredDprs(records) {
  try {
    localStorage.setItem(LOCAL_DPR_KEY, JSON.stringify(records));
  } catch {
    // ignore
  }
}

let localDprs = getStoredDprs();

function formatQuantities(quantities = []) {
  const complete = quantities.filter((item) => Number.isFinite(Number(item.completedQuantity)) && item.unit);
  if (!complete.length) return '-';
  return complete.map((item) => `${item.completedQuantity} ${item.unit}`).join(', ');
}

function normaliseDpr(dpr) {
  const quantities = dpr.quantities ?? dpr.quantityEntries ?? [];
  const photos = Array.isArray(dpr.photos)
    ? dpr.photos
    : Array.isArray(dpr.attachments)
    ? dpr.attachments.map((a) => ({
        id: a.id || `photo-${Math.random()}`,
        name: a.name || 'Photo',
        size: a.size || 0,
        previewUrl: a.url || a.dataUrl,
        dataUrl: a.dataUrl || a.url,
        activityTag: a.activityTag || a.tag || 'General Progress',
        caption: a.caption || '',
        locationTag: a.locationTag || '',
        uploadedAt: a.uploadedAt || a.date,
      }))
    : [];

  return {
    ...dpr,
    reportDate: dpr.reportDate ?? dpr.date ?? '',
    siteName: dpr.siteName ?? dpr.project ?? '',
    submittedBy: dpr.submittedBy ?? dpr.createdBy ?? '-',
    quantities,
    photos,
    qtyCompleted: dpr.qtyCompleted ?? formatQuantities(quantities),
    remarks: dpr.remarks ?? '',
    status: dpr.status || 'SUBMITTED',
  };
}

// Client-side DPR API with in-memory & local state supporting update, delete, up to 100MB photo uploads and activity tagging.
export const progressDprApi = {
  async list(_params) {
    localDprs = getStoredDprs();
    return localDprs.map(normaliseDpr);
  },

  async getById(id) {
    localDprs = getStoredDprs();
    return normaliseDpr(localDprs.find((dpr) => String(dpr.id) === String(id)) ?? localDprs[0]);
  },

  async create(payload) {
    const created = normaliseDpr({ id: `dpr-${Date.now()}`, ...payload });
    localDprs = [created, ...localDprs];
    saveStoredDprs(localDprs);
    return created;
  },

  async update(id, payload) {
    localDprs = getStoredDprs();
    const existing = localDprs.find((dpr) => String(dpr.id) === String(id));
    const updated = normaliseDpr({ ...(existing || {}), ...payload, id });
    localDprs = localDprs.map((dpr) => (String(dpr.id) === String(id) ? updated : dpr));
    saveStoredDprs(localDprs);
    return updated;
  },

  async delete(id) {
    localDprs = getStoredDprs();
    localDprs = localDprs.filter((dpr) => String(dpr.id) !== String(id));
    saveStoredDprs(localDprs);
    return true;
  },
};
