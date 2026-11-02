import { apiClient } from '@/lib/apiClient';
import { SAMPLE_DPR_PHOTOS } from '../utils/dprSamplePhotos';

const LOCAL_DPR_KEY = 'buildtwin.dpr.local';

const FALLBACK_DPRS = [
  {
    id: 'dpr-001',
    reportCode: 'DPR-PADUR-AG-01-20260825-DAY',
    reportDate: '2026-08-25',
    siteName: 'Ashok Grandeur - Padur, Chennai',
    activity: 'Slab concreting',
    quantities: [{ workDescription: 'Concrete placement', completedQuantity: 12.5, unit: 'm3' }],
    qtyCompleted: '12.5 m3',
    remarks: 'Concreting completed as planned. Cube samples taken for 7-day and 28-day curing test.',
    submittedBy: 'Site Engineer',
    status: 'APPROVED',
    weatherCondition: 'SUNNY',
    shift: 'DAY_SHIFT',
    totalManpowerCount: 14,
    totalEquipmentCount: 2,
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
    reportCode: 'DPR-PADUR-AG-01-20260824-DAY',
    reportDate: '2026-08-24',
    siteName: 'Ashok Grandeur - Padur, Chennai',
    activity: 'Column reinforcement',
    quantities: [{ workDescription: 'Column reinforcement', completedQuantity: 100, unit: '%' }],
    qtyCompleted: '100%',
    remarks: 'Inspection cleared before shuttering. Spacing and cover blocks verified by QA.',
    submittedBy: 'Site Engineer',
    status: 'APPROVED',
    weatherCondition: 'CLEAR',
    shift: 'DAY_SHIFT',
    totalManpowerCount: 10,
    totalEquipmentCount: 1,
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
];

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

function formatQuantities(quantities = []) {
  const complete = quantities.filter((item) => Number.isFinite(Number(item.completedQuantity)) && item.unit);
  if (!complete.length) return '-';
  return complete.map((item) => `${item.completedQuantity} ${item.unit}`).join(', ');
}

// Map backend DailyProgressReportResponse to the shape consumed by frontend cards/modals
export function normaliseBackendDpr(dpr) {
  if (!dpr) return null;

  const quantities = Array.isArray(dpr.activityItems) && dpr.activityItems.length > 0
    ? dpr.activityItems.map((item) => ({
        id: item.id,
        workDescription: item.activityName || item.activityCode || 'WBS Activity',
        activityId: item.activityId,
        activityCode: item.activityCode,
        completedQuantity: item.quantityToday,
        unit: item.uom || 'units',
        locationReference: item.locationReference,
        remarks: item.remarks,
        isBlocker: item.isBlocker,
        blockerCategory: item.blockerCategory,
        blockerReason: item.blockerReason,
        blockerSeverity: item.blockerSeverity,
        impactHours: item.impactHours,
        blockerStatus: item.blockerStatus,
      }))
    : Array.isArray(dpr.quantities)
    ? dpr.quantities
    : [];

  const photos = Array.isArray(dpr.photoAttachments) && dpr.photoAttachments.length > 0
    ? dpr.photoAttachments.map((a) => ({
        id: a.id || `photo-${Math.random()}`,
        name: a.caption || 'Site Photo',
        size: a.fileSizeBytes || 0,
        previewUrl: a.photoUrl || a.previewUrl || SAMPLE_DPR_PHOTOS.slabConcrete,
        dataUrl: a.photoUrl || a.dataUrl || SAMPLE_DPR_PHOTOS.slabConcrete,
        photoUrl: a.photoUrl,
        activityTag: a.activityTag || 'General Progress',
        caption: a.caption || '',
        locationTag: a.locationTag || '',
        uploadedAt: a.takenAt || a.uploadedAt,
      }))
    : Array.isArray(dpr.photos)
    ? dpr.photos
    : [];

  const primaryActivity =
    dpr.activity ||
    (dpr.activityItems && dpr.activityItems.length > 0
      ? dpr.activityItems.map((a) => a.activityName).filter(Boolean).join(', ')
      : dpr.generalNotes || 'Site Work Shift');

  return {
    ...dpr,
    id: dpr.id,
    reportCode: dpr.reportCode || `DPR-${dpr.id}`,
    reportDate: dpr.reportDate || '',
    siteName: dpr.projectName || dpr.siteName || 'Ashok Grandeur - Padur, Chennai',
    submittedBy: dpr.submittedBy || dpr.siteEngineer || 'Site Engineer',
    approvedBy: dpr.approvedBy || null,
    activity: primaryActivity,
    quantities,
    photos,
    qtyCompleted: dpr.qtyCompleted || formatQuantities(quantities),
    remarks: dpr.generalNotes || dpr.remarks || '',
    status: dpr.status || 'DRAFT',
    weatherCondition: dpr.weatherCondition || 'SUNNY',
    temperatureCelsius: dpr.temperatureCelsius,
    shift: dpr.shift || 'DAY_SHIFT',
    totalManpowerCount: dpr.totalManpowerCount ?? (dpr.laborItems?.reduce((sum, l) => sum + (l.headcount || 0), 0) || 0),
    totalEquipmentCount: dpr.totalEquipmentCount ?? (dpr.equipmentItems?.length || 0),
    totalBlockersCount: dpr.totalBlockersCount ?? 0,
    openBlockersCount: dpr.openBlockersCount ?? 0,
    activityItems: dpr.activityItems || [],
    laborItems: dpr.laborItems || [],
    equipmentItems: dpr.equipmentItems || [],
    materialItems: dpr.materialItems || [],
    photoAttachments: dpr.photoAttachments || [],
  };
}

export const progressDprApi = {
  // =========================================================================
  // 1. Daily Progress Report (DPR) Endpoints
  // =========================================================================

  async list(projectId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/dpr`, { params });
      const rawList = res.data?.data ?? res.data ?? [];
      const backendDprs = (Array.isArray(rawList) ? rawList : []).map(normaliseBackendDpr);

      // Merge with stored local items so uploaded photos and draft quantities are preserved
      const local = getStoredDprs().map(normaliseBackendDpr);
      if (backendDprs.length > 0) {
        return backendDprs.map((bd) => {
          const matchingLocal = local.find((ld) => String(ld.id) === String(bd.id));
          if (!matchingLocal) return bd;
          return {
            ...bd,
            activity: bd.activity || matchingLocal.activity,
            photos: bd.photos && bd.photos.length > 0 ? bd.photos : matchingLocal.photos || [],
            quantities: bd.quantities && bd.quantities.length > 0 ? bd.quantities : matchingLocal.quantities || [],
          };
        });
      }
      return local;
    } catch (_err) {
      // Fallback to local storage
      return getStoredDprs().map(normaliseBackendDpr);
    }
  },

  async getSummary(projectId = 1) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/dpr/summary`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  async getById(id) {
    try {
      const res = await apiClient.get(`/dpr/${id}`);
      const dpr = normaliseBackendDpr(res.data?.data ?? res.data);
      const local = getStoredDprs().map(normaliseBackendDpr);
      const matchingLocal = local.find((ld) => String(ld.id) === String(id));
      if (matchingLocal && dpr) {
        dpr.photos = dpr.photos?.length ? dpr.photos : matchingLocal.photos || [];
        dpr.quantities = dpr.quantities?.length ? dpr.quantities : matchingLocal.quantities || [];
      }
      return dpr;
    } catch (_err) {
      const stored = getStoredDprs().map(normaliseBackendDpr);
      return stored.find((d) => String(d.id) === String(id)) || stored[0];
    }
  },

  async create(payload, projectId = 1) {
    try {
      // Format payload for backend CreateDprRequest
      const photoAttachments = (payload.photos || [])
        .map((p) => ({
          photoUrl: p.dataUrl || p.previewUrl || p.photoUrl || p.url,
          caption: p.caption || p.name || 'Site Photo',
          category: 'PROGRESS',
          activityTag: p.activityTag || 'General Progress',
          locationTag: p.locationTag || '',
          fileSizeBytes: p.size || 0,
        }))
        .filter((p) => Boolean(p.photoUrl));

      const body = {
        reportDate: payload.reportDate || new Date().toISOString().slice(0, 10),
        shift:
          payload.shift === 'NIGHT' || payload.shift === 'NIGHT_SHIFT'
            ? 'NIGHT_SHIFT'
            : payload.shift === 'DOUBLE' || payload.shift === 'DOUBLE_SHIFT'
            ? 'DOUBLE_SHIFT'
            : 'DAY_SHIFT',
        weatherCondition: payload.weatherCondition || 'SUNNY',
        temperatureCelsius: payload.temperatureCelsius ? Number(payload.temperatureCelsius) : 30.0,
        generalNotes: payload.remarks || payload.generalNotes || payload.activity || '',
        safetyObservations: payload.safetyNotes || payload.safetyObservations || 'Normal safety compliance maintained.',
        siteHindrances: payload.siteHindrances || payload.siteHindrance || payload.siteHindranceNotes || null,
        photoAttachments,
      };

      const res = await apiClient.post(`/projects/${projectId}/dpr`, body);
      let created = normaliseBackendDpr(res.data?.data ?? res.data);

      // If requested status was SUBMITTED, transition from DRAFT to SUBMITTED
      if (payload.status === 'SUBMITTED' && created?.id) {
        try {
          const subRes = await apiClient.post(`/dpr/${created.id}/submit`, {
            submissionRemarks: payload.remarks || 'Initial shift submittal',
          });
          created = normaliseBackendDpr(subRes.data?.data ?? subRes.data);
        } catch (_subErr) {
          console.warn('Failed to submit created DPR:', _subErr);
        }
      }

      // Preserve photos and custom quantities in returned object
      created = {
        ...created,
        activity: payload.activity || created.activity,
        quantities: payload.quantities?.length ? payload.quantities : created.quantities || [],
        photos: payload.photos?.length ? payload.photos : created.photos || [],
      };

      // Also cache in local storage
      const local = getStoredDprs();
      saveStoredDprs([created, ...local.filter((d) => String(d.id) !== String(created.id))]);
      return created;
    } catch (_err) {
      // Local fallback
      const created = normaliseBackendDpr({
        id: `dpr-${Date.now()}`,
        reportCode: `DPR-LOCAL-${Date.now()}`,
        ...payload,
      });
      const local = getStoredDprs();
      saveStoredDprs([created, ...local]);
      return created;
    }
  },

  async update(id, payload) {
    try {
      const isMock = typeof id === 'string' && id.startsWith('dpr-');
      if (isMock) {
        const local = getStoredDprs();
        const existing = local.find((d) => String(d.id) === String(id));
        const updated = normaliseBackendDpr({
          ...(existing || {}),
          ...payload,
          id,
          quantities: payload.quantities?.length ? payload.quantities : existing?.quantities || [],
          photos: payload.photos?.length ? payload.photos : existing?.photos || [],
        });
        saveStoredDprs([updated, ...local.filter((d) => String(d.id) !== String(id))]);
        return updated;
      }

      // Check current report status from backend if possible
      let currentDpr = null;
      try {
        const currentRes = await apiClient.get(`/dpr/${id}`);
        currentDpr = currentRes.data?.data ?? currentRes.data;
      } catch (_e) {
        // ignore
      }

      // If approved, update local representation gracefully because backend baseline is locked
      if (currentDpr && currentDpr.status === 'APPROVED') {
        const local = getStoredDprs();
        const existing = local.find((d) => String(d.id) === String(id));
        const updated = normaliseBackendDpr({
          ...(existing || {}),
          ...currentDpr,
          ...payload,
          id,
          quantities: payload.quantities?.length ? payload.quantities : existing?.quantities || [],
          photos: payload.photos?.length ? payload.photos : existing?.photos || [],
        });
        saveStoredDprs([updated, ...local.filter((d) => String(d.id) !== String(id))]);
        return updated;
      }

      // If submitted, withdraw first so update succeeds per backend state machine
      if (currentDpr && currentDpr.status === 'SUBMITTED') {
        try {
          await apiClient.post(`/dpr/${id}/withdraw`, { withdrawalReason: 'Updating report details' });
        } catch (_wErr) {
          // ignore
        }
      }

      // Format payload for backend UpdateDprRequest
      const body = {
        shift:
          payload.shift === 'NIGHT' || payload.shift === 'NIGHT_SHIFT'
            ? 'NIGHT_SHIFT'
            : payload.shift === 'DOUBLE' || payload.shift === 'DOUBLE_SHIFT'
            ? 'DOUBLE_SHIFT'
            : 'DAY_SHIFT',
        weatherCondition: payload.weatherCondition || 'SUNNY',
        temperatureCelsius: payload.temperatureCelsius ? Number(payload.temperatureCelsius) : 30.0,
        generalNotes: payload.remarks || payload.generalNotes || payload.activity || '',
        safetyObservations: payload.safetyNotes || payload.safetyObservations || '',
        siteHindrances: payload.siteHindrances || payload.siteHindrance || payload.siteHindranceNotes || null,
      };

      const res = await apiClient.put(`/dpr/${id}`, body);
      let updated = normaliseBackendDpr(res.data?.data ?? res.data);

      // If photos were modified, sync with backend photo endpoints
      if (payload.photos && Array.isArray(payload.photos)) {
        const existingBackendPhotos = currentDpr?.photoAttachments || [];
        const existingPhotoIds = new Set(existingBackendPhotos.map((a) => String(a.id)));

        // 1. Attach new photos (photos that do not already have a backend ID)
        for (const photo of payload.photos) {
          if (photo.id && existingPhotoIds.has(String(photo.id))) {
            continue; // Already persisted in backend
          }
          const photoUrl = photo.dataUrl || photo.previewUrl || photo.photoUrl || photo.url;
          if (photoUrl && typeof photoUrl === 'string' && photoUrl.length > 10) {
            try {
              await apiClient.post(`/dpr/${id}/photos`, {
                photoUrl,
                caption: photo.caption || photo.activityTag || 'Site photo',
                category: 'PROGRESS',
                activityTag: photo.activityTag || 'General Progress',
                locationTag: photo.locationTag || '',
                fileSizeBytes: photo.size || 0,
              });
            } catch {
              // ignore attachment error; photo is cached in frontend state
            }
          }
        }

        // 2. Remove deleted photos from backend
        const remainingPhotoIds = new Set(payload.photos.map((p) => String(p.id)));
        for (const att of existingBackendPhotos) {
          if (!remainingPhotoIds.has(String(att.id))) {
            try {
              await apiClient.delete(`/dpr/${id}/photos/${att.id}`);
            } catch {
              // ignore deletion error
            }
          }
        }
      }

      // If user selected to submit, submit it
      if (payload.status === 'SUBMITTED') {
        try {
          const subRes = await apiClient.post(`/dpr/${id}/submit`, {
            submissionRemarks: payload.remarks || 'Updated and submitted for review',
          });
          updated = normaliseBackendDpr(subRes.data?.data ?? subRes.data);
        } catch (_subErr) {
          console.warn('Failed to re-submit DPR:', _subErr);
        }
      }

      // Preserve photos and quantities
      updated = {
        ...updated,
        activity: payload.activity || updated.activity,
        quantities: payload.quantities?.length ? payload.quantities : updated.quantities || [],
        photos: payload.photos?.length ? payload.photos : updated.photos || [],
      };

      // Sync local cache
      const local = getStoredDprs();
      saveStoredDprs([updated, ...local.filter((d) => String(d.id) !== String(id))]);
      return updated;
    } catch (_err) {
      console.warn('Backend update failed, falling back to local sync:', _err);
      const local = getStoredDprs();
      const existing = local.find((d) => String(d.id) === String(id));
      const updated = normaliseBackendDpr({
        ...(existing || {}),
        ...payload,
        id,
        quantities: payload.quantities?.length ? payload.quantities : existing?.quantities || [],
        photos: payload.photos?.length ? payload.photos : existing?.photos || [],
      });
      saveStoredDprs([updated, ...local.filter((d) => String(d.id) !== String(id))]);
      return updated;
    }
  },

  async delete(id) {
    try {
      await apiClient.delete(`/dpr/${id}`);
    } catch (_err) {
      // ignore
    }
    const local = getStoredDprs().filter((d) => String(d.id) !== String(id));
    saveStoredDprs(local);
    return true;
  },

  async submitDpr(dprId, submissionNotes = '') {
    const res = await apiClient.post(`/dpr/${dprId}/submit`, { submissionRemarks: submissionNotes });
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async approveDpr(dprId, approvalNotes = '') {
    const res = await apiClient.post(`/dpr/${dprId}/approve`, { approvalRemarks: approvalNotes });
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async rejectDpr(dprId, rejectionReason = '') {
    const res = await apiClient.post(`/dpr/${dprId}/reject`, { rejectionReason });
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async withdrawDpr(dprId, withdrawalReason = '') {
    const res = await apiClient.post(`/dpr/${dprId}/withdraw`, { withdrawalReason });
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async addActivityItem(dprId, payload) {
    const res = await apiClient.post(`/dpr/${dprId}/activities`, payload);
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async addLaborItem(dprId, payload) {
    const res = await apiClient.post(`/dpr/${dprId}/labor`, payload);
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async addEquipmentItem(dprId, payload) {
    const res = await apiClient.post(`/dpr/${dprId}/equipment`, payload);
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  async addPhotoAttachment(dprId, payload) {
    const res = await apiClient.post(`/dpr/${dprId}/photos`, payload);
    return normaliseBackendDpr(res.data?.data ?? res.data);
  },

  // =========================================================================
  // 2. Progress History & Production Journal Endpoints
  // =========================================================================

  /**
   * Retrieves enterprise project-wide progress history register & summary KPIs
   * Endpoint: GET /api/v1/projects/{projectId}/progress-history
   */
  async getProjectProgressHistory(projectId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/progress-history`, { params });
      return res.data?.data ?? res.data;
    } catch (_err) {
      console.warn('Failed to fetch backend progress history, returning empty fallback', _err);
      return {
        projectId,
        projectName: 'Project',
        projectCode: 'PRJ',
        totalEntries: 0,
        totalQuantityLogged: 0,
        uniqueActivitiesCount: 0,
        totalManpowerLogged: 0,
        totalBlockersEncountered: 0,
        earliestLogDate: null,
        latestLogDate: null,
        items: {
          content: [],
          pageNumber: 0,
          pageSize: 15,
          totalElements: 0,
          totalPages: 0,
          first: true,
          last: true,
        },
      };
    }
  },

  /**
   * Retrieves complete chronological progress journal for a specific activity
   * Endpoint: GET /api/v1/activities/{activityId}/progress-history
   */
  async getActivityProgressHistory(activityId, params = {}) {
    const res = await apiClient.get(`/activities/${activityId}/progress-history`, { params });
    return res.data?.data ?? res.data;
  },

  /**
   * Retrieves deep velocity analytics and S-Curve progression data
   * Endpoint: GET /api/v1/activities/{activityId}/progress-history/analytics
   */
  async getActivityProgressAnalytics(activityId) {
    const res = await apiClient.get(`/activities/${activityId}/progress-history/analytics`);
    return res.data?.data ?? res.data;
  },

  /**
   * Get single progress history log entry by ID
   * Endpoint: GET /api/v1/progress-history/{id}
   */
  async getProgressHistoryItemById(id) {
    const res = await apiClient.get(`/progress-history/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Direct site progress logging via Progress History API
   * Endpoint: POST /api/v1/activities/{activityId}/progress-history
   */
  async logProgress(activityId, payload) {
    const res = await apiClient.post(`/activities/${activityId}/progress-history`, payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Update an existing progress history log entry
   * Endpoint: PUT /api/v1/progress-history/{id}
   */
  async updateProgressLog(id, payload) {
    const res = await apiClient.put(`/progress-history/${id}`, payload);
    return res.data?.data ?? res.data;
  },

  /**
   * Delete a progress history log entry (recalculates cumulative metrics)
   * Endpoint: DELETE /api/v1/progress-history/{id}
   */
  async deleteProgressLog(id) {
    const res = await apiClient.delete(`/progress-history/${id}`);
    return res.data?.data ?? res.data;
  },

  /**
   * Fetch WBS activities for project to enable logging against them
   */
  async getWbsActivities(projectId = 1) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/wbs-activities`);
      const raw = res.data?.data ?? res.data ?? [];
      return Array.isArray(raw) ? raw : raw?.content ?? [];
    } catch (_err) {
      return [];
    }
  },

  // =========================================================================
  // 3. Blocker & Site Hindrance Operations
  // =========================================================================

  async getProjectBlockers(projectId = 1, params = {}) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/dpr/blockers`, { params });
      return res.data?.data ?? res.data ?? [];
    } catch (_err) {
      return [];
    }
  },

  async getProjectBlockerSummary(projectId = 1) {
    try {
      const res = await apiClient.get(`/projects/${projectId}/dpr/blockers/summary`);
      return res.data?.data ?? res.data;
    } catch (_err) {
      return null;
    }
  },

  async resolveBlocker(dprId, itemId, payload) {
    const res = await apiClient.post(`/dpr/${dprId}/activities/${itemId}/resolve-blocker`, payload);
    return res.data?.data ?? res.data;
  },
};
