import { Resource } from '../entities/Resource';
import * as resourceRepo from '../repositories/resource.repository';
import { hasActiveBookingForResource } from '../repositories/booking.repository';
import { conflict, notFound } from '../utils/AppError';
import { buildPaginatedResult, PaginatedResult, PaginationParams } from '../utils/pagination';
import { ensureResourceTypeExists } from './resourceType.service';

export interface ResourceInput {
  name: string;
  description?: string | null;
  location?: string | null;
  capacity?: number | null;
  isActive?: boolean;
  resourceTypeId: string;
}

export const listResources = async (
  params: PaginationParams,
  resourceTypeId?: string,
): Promise<PaginatedResult<Resource>> => {
  const [data, total] = await resourceRepo.findResourcesPaginated(params, resourceTypeId);
  return buildPaginatedResult(data, total, params);
};

export const getResourceById = async (id: string): Promise<Resource> => {
  const resource = await resourceRepo.findResourceById(id);
  if (!resource) throw notFound('Resource not found');
  return resource;
};

export const createResource = async (input: ResourceInput): Promise<Resource> => {
  await ensureResourceTypeExists(input.resourceTypeId);

  const created = await resourceRepo.insertResource({
    name: input.name,
    description: input.description ?? null,
    location: input.location ?? null,
    capacity: input.capacity ?? null,
    isActive: input.isActive ?? true,
    resourceTypeId: input.resourceTypeId,
  });

  return getResourceById(created.id);
};

export const updateResource = async (
  id: string,
  input: ResourceInput,
): Promise<Resource> => {
  const resource = await getResourceById(id);
  await ensureResourceTypeExists(input.resourceTypeId);

  resource.name = input.name;
  resource.description = input.description ?? null;
  resource.location = input.location ?? null;
  resource.capacity = input.capacity ?? null;
  resource.isActive = input.isActive ?? resource.isActive;
  resource.resourceTypeId = input.resourceTypeId;

  await resourceRepo.updateResource(resource);
  return getResourceById(id);
};

export const deleteResource = async (id: string): Promise<void> => {
  const resource = await getResourceById(id);

  // Restrict deletion while the resource has current/future (non-cancelled) bookings.
  const blocked = await hasActiveBookingForResource(id, new Date());
  if (blocked) {
    throw conflict(
      'Cannot delete a resource that has active or upcoming bookings. Cancel those bookings first.',
    );
  }

  await resourceRepo.softDeleteResource(resource);
};
