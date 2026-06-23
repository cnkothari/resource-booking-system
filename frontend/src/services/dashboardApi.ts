import { api } from './api';
import { ApiItemResponse, DashboardSummary } from '../types';

export const fetchDashboardSummaryRequest = async (): Promise<DashboardSummary> => {
  const { data } = await api.get<ApiItemResponse<DashboardSummary>>('/dashboard/summary');
  return data.data;
};
