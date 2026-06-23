import { ResourceType } from '../entities/ResourceType';
import * as resourceTypeRepo from '../repositories/resourceType.repository';
import { badRequest } from '../utils/AppError';

export const listResourceTypes = (): Promise<ResourceType[]> =>
  resourceTypeRepo.findAllResourceTypes();

export const ensureResourceTypeExists = async (id: string): Promise<ResourceType> => {
  const resourceType = await resourceTypeRepo.findResourceTypeById(id);
  if (!resourceType) throw badRequest('Selected resource type does not exist');
  return resourceType;
};
