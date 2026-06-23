import { AppDataSource } from '../config/data-source';
import { Resource } from '../entities/Resource';
import { PaginationParams } from '../utils/pagination';

const repo = () => AppDataSource.getRepository(Resource);

export const findResourcesPaginated = (
  params: PaginationParams,
  resourceTypeId?: string,
): Promise<[Resource[], number]> => {
  const qb = repo()
    .createQueryBuilder('resource')
    .leftJoinAndSelect('resource.resourceType', 'resourceType')
    .orderBy('resource.createdAt', 'DESC')
    .skip(params.skip)
    .take(params.limit);

  if (params.search) {
    qb.andWhere(
      '(resource.name ILIKE :search OR resource.location ILIKE :search OR resource.description ILIKE :search)',
      { search: `%${params.search}%` },
    );
  }

  if (resourceTypeId) {
    qb.andWhere('resource.resourceTypeId = :resourceTypeId', { resourceTypeId });
  }

  return qb.getManyAndCount();
};

export const findResourceById = (id: string): Promise<Resource | null> =>
  repo().findOne({ where: { id }, relations: { resourceType: true } });

export const insertResource = (data: Partial<Resource>): Promise<Resource> =>
  repo().save(repo().create(data));

export const updateResource = (resource: Resource): Promise<Resource> =>
  repo().save(resource);

export const softDeleteResource = async (resource: Resource): Promise<void> => {
  await repo().softRemove(resource);
};

export const countResources = (): Promise<number> => repo().count();
