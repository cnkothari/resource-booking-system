import { api } from './api';
import { ApiListResponse, ResourceType } from '../types';

export const fetchResourceTypesRequest = async (): Promise<ResourceType[]> => {
  const { data } = await api.get<ApiListResponse<ResourceType>>('/resource-types');
  return data.data;
};
