import { ILike } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { PaginationParams } from '../utils/pagination';

const repo = () => AppDataSource.getRepository(User);

export const findUsersPaginated = async (
  params: PaginationParams,
): Promise<[User[], number]> => {
  const where = params.search
    ? [
        { name: ILike(`%${params.search}%`) },
        { email: ILike(`%${params.search}%`) },
        { department: ILike(`%${params.search}%`) },
      ]
    : {};

  return repo().findAndCount({
    where,
    order: { createdAt: 'DESC' },
    skip: params.skip,
    take: params.limit,
  });
};

export const findUserById = (id: string): Promise<User | null> =>
  repo().findOne({ where: { id } });

export const findUserByEmail = (email: string): Promise<User | null> =>
  repo().findOne({ where: { email } });

export const insertUser = (data: Partial<User>): Promise<User> =>
  repo().save(repo().create(data));

export const updateUser = (user: User): Promise<User> => repo().save(user);

export const softDeleteUser = async (user: User): Promise<void> => {
  await repo().softRemove(user);
};

export const countUsers = (): Promise<number> => repo().count();
