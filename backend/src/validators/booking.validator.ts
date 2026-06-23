import Joi from 'joi';
import { paginationQueryKeys } from './common.validator';

export const bookingBodySchema = Joi.object({
  title: Joi.string().trim().max(160).allow('', null),
  resourceId: Joi.string().uuid().required(),
  userId: Joi.string().uuid().required(),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required().messages({
    'date.greater': 'End time must be after start time',
  }),
});

export const bookingListQuerySchema = Joi.object({
  ...paginationQueryKeys,
  tag: Joi.string().valid('past', 'upcoming', 'cancelled'),
  resourceId: Joi.string().uuid(),
  userId: Joi.string().uuid(),
});
