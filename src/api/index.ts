// src/api/index.ts
export * from './client';
export * from './types';
export * from './procurementApi';
export * from './costApi';
export * from './qualityApi';
export * from './notificationApi';
export * from './reportApi';

import { procurementApi } from './procurementApi';
import { costApi } from './costApi';
import { qualityApi } from './qualityApi';
import { notificationApi } from './notificationApi';
import { reportApi } from './reportApi';

export const api = {
  procurement: procurementApi,
  cost: costApi,
  quality: qualityApi,
  notifications: notificationApi,
  reports: reportApi,
};

export default api;
