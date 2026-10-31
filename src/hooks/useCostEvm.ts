// src/hooks/useCostEvm.ts
import { useState, useEffect, useCallback } from 'react';
import { costService } from '../services/costService';
import {
  Budget,
  EvmMetricsDto,
  EvmForecastDto,
  BudgetVarianceReportDto,
  BudgetOverrunReportDto,
  ProcurementExpenditureTrailDto,
} from '../types/cost';

export function useCostEvm(projectId: number) {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [evmMetrics, setEvmMetrics] = useState<EvmMetricsDto | null>(null);
  const [forecast, setForecast] = useState<EvmForecastDto | null>(null);
  const [varianceReport, setVarianceReport] = useState<BudgetVarianceReportDto | null>(null);
  const [overruns, setOverruns] = useState<BudgetOverrunReportDto | null>(null);
  const [liabilityTrail, setLiabilityTrail] = useState<ProcurementExpenditureTrailDto | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [syncing, setSyncing] = useState<boolean>(false);

  const fetchCostData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [budgetData, metricsData, forecastData, varianceData, overrunData, trailData] =
        await Promise.all([
          costService.getBudgetsByProject(projectId).catch(() => []),
          costService.getEvmMetrics(projectId).catch(() => null),
          costService.getEvmForecast(projectId).catch(() => null),
          costService.getBudgetVarianceReport(projectId).catch(() => null),
          costService.getBudgetOverruns(projectId).catch(() => null),
          costService.getProcurementExpenditureTrail(projectId).catch(() => null),
        ]);
      setBudgets(Array.isArray(budgetData) ? budgetData : []);
      setEvmMetrics(metricsData);
      setForecast(forecastData);
      setVarianceReport(varianceData);
      setOverruns(overrunData);
      setLiabilityTrail(trailData);
    } catch (err: any) {
      console.error('Error fetching cost EVM data:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    fetchCostData();
  }, [fetchCostData]);

  // Synchronize stock consumption & labour muster into Cost Actual Ledger
  const triggerCostSync = async () => {
    setSyncing(true);
    try {
      await costService.syncActualCosts(projectId);
      await fetchCostData();
    } finally {
      setSyncing(false);
    }
  };

  return {
    budgets,
    evmMetrics,
    forecast,
    varianceReport,
    overruns,
    liabilityTrail,
    loading,
    syncing,
    triggerCostSync,
    refresh: fetchCostData,
  };
}
