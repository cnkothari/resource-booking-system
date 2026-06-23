import { AppDataSource } from '../config/data-source';
import { ResourceType } from '../entities/ResourceType';

const repo = () => AppDataSource.getRepository(ResourceType);

export const findAllResourceTypes = (): Promise<ResourceType[]> =>
  repo().find({ order: { name: 'ASC' } });

export const findResourceTypeById = (id: string): Promise<ResourceType | null> =>
  repo().findOne({ where: { id } });

export const findResourceTypeByName = (name: string): Promise<ResourceType | null> =>
  repo().findOne({ where: { name } });

export const insertResourceType = (data: Partial<ResourceType>): Promise<ResourceType> =>
  repo().save(repo().create(data));
