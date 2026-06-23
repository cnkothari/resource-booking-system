import Joi from 'joi';

export const idParamSchema = Joi.object({
  id: Joi.string().uuid().required(),
});

/** Base pagination + search query params shared by all list endpoints. */
export const paginationQueryKeys = {
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  search: Joi.string().allow('').max(120).default(''),
};
