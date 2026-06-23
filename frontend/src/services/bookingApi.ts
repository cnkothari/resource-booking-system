import { api } from './api';
import {
  ApiItemResponse,
  ApiListResponse,
  ApiMessageResponse,
  Booking,
  BookingPayload,
  BookingTag,
  ListQuery,
} from '../types';

export interface BookingListQuery extends ListQuery {
  tag?: BookingTag;
  resourceId?: string;
  userId?: string;
}

export const fetchBookingsRequest = async (
  query: BookingListQuery,
): Promise<ApiListResponse<Booking>> => {
  const { data } = await api.get<ApiListResponse<Booking>>('/bookings', { params: query });
  return data;
};

export const fetchBookingRequest = async (id: string): Promise<Booking> => {
  const { data } = await api.get<ApiItemResponse<Booking>>(`/bookings/${id}`);
  return data.data;
};

export const createBookingRequest = async (payload: BookingPayload): Promise<Booking> => {
  const { data } = await api.post<ApiItemResponse<Booking>>('/bookings', payload);
  return data.data;
};

export const updateBookingRequest = async (
  id: string,
  payload: BookingPayload,
): Promise<Booking> => {
  const { data } = await api.put<ApiItemResponse<Booking>>(`/bookings/${id}`, payload);
  return data.data;
};

export const cancelBookingRequest = async (id: string): Promise<Booking> => {
  const { data } = await api.patch<ApiItemResponse<Booking>>(`/bookings/${id}/cancel`);
  return data.data;
};

export const deleteBookingRequest = async (id: string): Promise<ApiMessageResponse> => {
  const { data } = await api.delete<ApiMessageResponse>(`/bookings/${id}`);
  return data;
};
