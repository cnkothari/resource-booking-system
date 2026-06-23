import Joi from 'joi';
import { paginationQueryKeys } from './common.validator';

export const resourceBodySchema = Joi.object({
  name: Joi.string().trim().min(2).max(120).required(),
  description: Joi.string().trim().max(500).allow('', null),
  location: Joi.string().trim().max(160).allow('', null),
  capacity: Joi.number().integer().min(1).max(100000).allow(null),
  isActive: Joi.boolean().default(true),
  resourceTypeId: Joi.string().uuid().required(),
});

export const resourceListQuerySchema = Joi.object({
  ...paginationQueryKeys,
  resourceTypeId: Joi.string().uuid(),
});
