export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiListResponse<T> {
  success: boolean;
  data: T[];
  pagination: PaginationMeta;
}

export interface ApiItemResponse<T> {
  success: boolean;
  data: T;
}

export interface ApiMessageResponse {
  success: boolean;
  message: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  department: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceType {
  id: string;
  name: string;
  description: string | null;
}

export interface Resource {
  id: string;
  name: string;
  description: string | null;
  location: string | null;
  capacity: number | null;
  isActive: boolean;
  resourceTypeId: string;
  resourceType?: ResourceType;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = 'active' | 'cancelled';
export type BookingTag = 'past' | 'upcoming' | 'cancelled';

export interface Booking {
  id: string;
  title: string | null;
  startTime: string;
  endTime: string;
  status: BookingStatus;
  tag: BookingTag;
  cancelledAt: string | null;
  resourceId: string;
  userId: string;
  resource?: {
    id: string;
    name: string;
    location: string | null;
    resourceType?: { id: string; name: string };
  };
  user?: { id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface DashboardSummary {
  totalResources: number;
  totalUsers: number;
  activeUpcomingBookings: number;
  cancelledBookings: number;
  pastBookings: number;
  totalBookings: number;
}

export interface ListQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface UserPayload {
  name: string;
  email: string;
  department?: string | null;
}

export interface ResourcePayload {
  name: string;
  description?: string | null;
  location?: string | null;
  capacity?: number | null;
  isActive?: boolean;
  resourceTypeId: string;
}

export interface BookingPayload {
  title?: string | null;
  resourceId: string;
  userId: string;
  startTime: string;
  endTime: string;
}

export type RequestStatus = 'idle' | 'loading' | 'succeeded' | 'failed';
