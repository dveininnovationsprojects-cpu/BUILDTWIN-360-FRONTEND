import { apiClient } from '@/lib/apiClient';

const LOCAL_SUPPLIERS = [
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
  },
];

function extractList(data) {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.data)) return data.data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  return [];
}

function extractSingle(data) {
  return data?.data && typeof data.data === 'object' && !Array.isArray(data.data) ? data.data : data;
}

function isNetworkError(error) {
  return !error?.response || error?.code === 'ERR_NETWORK' || [404, 503].includes(error?.response?.status);
}

export const supplierApi = {
  async list() {
    try {
      const response = await apiClient.get('/suppliers');
      return extractList(response.data).map((supplier) => ({ ...supplier, status: supplier.status || 'ACTIVE' }));
    } catch (error) {
      if (isNetworkError(error)) return LOCAL_SUPPLIERS;
      throw error;
    }
  },

  async create(payload) {
    try {
      const response = await apiClient.post('/suppliers', payload);
      return extractSingle(response.data);
    } catch (error) {
      if (isNetworkError(error)) return { id: Date.now(), ...payload, createdAt: new Date().toISOString() };
      throw error;
    }
  },

  async update(id, payload) {
    try {
      const response = await apiClient.put(`/suppliers/${id}`, payload);
      return extractSingle(response.data);
    } catch (error) {
      if (isNetworkError(error)) return { id, ...payload, updatedAt: new Date().toISOString() };
      throw error;
    }
  },
};
