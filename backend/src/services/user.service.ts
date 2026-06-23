import { User } from '../entities/User';
import * as userRepo from '../repositories/user.repository';
import { badRequest, conflict, notFound } from '../utils/AppError';
import { buildPaginatedResult, PaginatedResult, PaginationParams } from '../utils/pagination';

export interface UserInput {
  name: string;
  email: string;
  department?: string | null;
}

export const listUsers = async (
  params: PaginationParams,
): Promise<PaginatedResult<User>> => {
  const [data, total] = await userRepo.findUsersPaginated(params);
  return buildPaginatedResult(data, total, params);
};

export const getUserById = async (id: string): Promise<User> => {
  const user = await userRepo.findUserById(id);
  if (!user) throw notFound('User not found');
  return user;
};

export const createUser = async (input: UserInput): Promise<User> => {
  const existing = await userRepo.findUserByEmail(input.email);
  if (existing) throw conflict('A user with this email already exists');

  return userRepo.insertUser({
    name: input.name,
    email: input.email,
    department: input.department ?? null,
  });
};

export const updateUser = async (id: string, input: UserInput): Promise<User> => {
  const user = await getUserById(id);

  if (input.email !== user.email) {
    const existing = await userRepo.findUserByEmail(input.email);
    if (existing && existing.id !== id) {
      throw conflict('A user with this email already exists');
    }
  }

  user.name = input.name;
  user.email = input.email;
  user.department = input.department ?? null;

  return userRepo.updateUser(user);
};

export const deleteUser = async (id: string): Promise<void> => {
  const user = await getUserById(id);
  await userRepo.softDeleteUser(user);
};

export const ensureUserExists = async (id: string): Promise<User> => {
  const user = await userRepo.findUserById(id);
  if (!user) throw badRequest('Selected user does not exist');
  return user;
};
