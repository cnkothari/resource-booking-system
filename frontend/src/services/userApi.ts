import { api } from './api';
import {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  ListQuery,
  User,
  UserPayload,
} from '../types';

export const fetchUsersRequest = async (query: ListQuery): Promise<ApiListResponse<User>> => {
  const { data } = await api.get<ApiListResponse<User>>('/users', { params: query });
  return data;
};

export const fetchUserRequest = async (id: string): Promise<User> => {
  const { data } = await api.get<ApiItemResponse<User>>(`/users/${id}`);
  return data.data;
};

export const createUserRequest = async (payload: UserPayload): Promise<User> => {
  const { data } = await api.post<ApiItemResponse<User>>('/users', payload);
  return data.data;
};

export const updateUserRequest = async (id: string, payload: UserPayload): Promise<User> => {
  const { data } = await api.put<ApiItemResponse<User>>(`/users/${id}`, payload);
  return data.data;
};

export const deleteUserRequest = async (id: string): Promise<ApiMessageResponse> => {
  const { data } = await api.delete<ApiMessageResponse>(`/users/${id}`);
  return data;
};
