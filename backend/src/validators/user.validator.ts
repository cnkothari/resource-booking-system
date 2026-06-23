import Joi from 'joi';
import { paginationQueryKeys } from './common.validator';

export const userBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  email: Joi.string().trim().lowercase().email().max(160).required(),
  department: Joi.string().trim().max(120).allow('', null),
});

export const userListQuerySchema = Joi.object({
  ...paginationQueryKeys,
});
