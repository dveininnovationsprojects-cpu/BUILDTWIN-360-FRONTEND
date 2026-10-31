// src/hooks/useProcurement.ts
import { useState, useEffect, useCallback } from 'react';
import { procurementService } from '../services/procurementService';
import { MaterialRequest, PurchaseOrder, Grn, ProjectedShortageDto } from '../types/procurement';

export function useProcurement(projectId: number) {
  const [requests, setRequests] = useState<MaterialRequest[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [grns, setGrns] = useState<Grn[]>([]);
  const [shortages, setShortages] = useState<ProjectedShortageDto[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    setError(null);
    try {
      const [reqData, poData, grnData, shortageData] = await Promise.all([
        procurementService.getMaterialRequestsByProject(projectId).catch(() => []),
        procurementService.getAllPurchaseOrders(projectId).catch(() => []),
        procurementService.getGrnsByProject(projectId).catch(() => []),
        procurementService.getProjectedShortages(projectId).catch(() => []),
      ]);
      setRequests(Array.isArray(reqData) ? reqData : []);
      setPurchaseOrders(Array.isArray(poData) ? poData : []);
      setGrns(Array.isArray(grnData) ? grnData : []);
      setShortages(Array.isArray(shortageData) ? shortageData : []);
    } catch (err: any) {
      setError(err.message || 'Failed to load procurement data');
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Actions
  const approveMaterialRequest = async (id: number, approvedBy: string, rejectionReason?: string) => {
    await procurementService.updateMaterialRequestApproval(id, {
      status: 'APPROVED',
      approvedBy: approvedBy || 'Project Manager',
      rejectionReason,
    });
    await fetchAll();
  };

  const rejectMaterialRequest = async (id: number, approvedBy: string, rejectionReason: string) => {
    await procurementService.updateMaterialRequestApproval(id, {
      status: 'REJECTED',
      approvedBy: approvedBy || 'Project Manager',
      rejectionReason,
    });
    await fetchAll();
  };

  const createPO = async (poData: Partial<PurchaseOrder>) => {
    await procurementService.createPurchaseOrder(poData);
    await fetchAll();
  };

  const recordGrn = async (grnData: Partial<Grn>) => {
    await procurementService.createGrn(grnData);
    await fetchAll();
  };

  return {
    requests,
    purchaseOrders,
    grns,
    shortages,
    loading,
    error,
    refresh: fetchAll,
    approveMaterialRequest,
    rejectMaterialRequest,
    createPO,
    recordGrn,
  };
}
