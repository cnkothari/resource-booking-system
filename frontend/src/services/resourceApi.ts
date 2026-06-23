import { api } from './api';
import {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  ListQuery,
  Resource,
  ResourcePayload,
} from '../types';

interface ResourceListQuery extends ListQuery {
  resourceTypeId?: string;
}

export const fetchResourcesRequest = async (
  query: ResourceListQuery,
): Promise<ApiListResponse<Resource>> => {
  const { data } = await api.get<ApiListResponse<Resource>>('/resources', { params: query });
  return data;
};

export const fetchResourceRequest = async (id: string): Promise<Resource> => {
  const { data } = await api.get<ApiItemResponse<Resource>>(`/resources/${id}`);
  return data.data;
};

export const createResourceRequest = async (payload: ResourcePayload): Promise<Resource> => {
  const { data } = await api.post<ApiItemResponse<Resource>>('/resources', payload);
  return data.data;
};

export const updateResourceRequest = async (
  id: string,
  payload: ResourcePayload,
): Promise<Resource> => {
  const { data } = await api.put<ApiItemResponse<Resource>>(`/resources/${id}`, payload);
  return data.data;
};

export const deleteResourceRequest = async (id: string): Promise<ApiMessageResponse> => {
  const { data } = await api.delete<ApiMessageResponse>(`/resources/${id}`);
  return data;
};
