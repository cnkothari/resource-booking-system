import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { idParamSchema } from '../validators/common.validator';
import { resourceBodySchema, resourceListQuerySchema } from '../validators/resource.validator';
import * as resourceService from '../services/resource.service';

export const resourceRouter = Router();

resourceRouter.get(
  '/',
  validate(resourceListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const params = parsePagination(req.query);
    const resourceTypeId =
      typeof req.query.resourceTypeId === 'string' ? req.query.resourceTypeId : undefined;
    const result = await resourceService.listResources(params, resourceTypeId);
    res.json({ success: true, ...result });
  }),
);

resourceRouter.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const resource = await resourceService.getResourceById(req.params.id);
    res.json({ success: true, data: resource });
  }),
);

resourceRouter.post(
  '/',
  validate(resourceBodySchema),
  asyncHandler(async (req, res) => {
    const resource = await resourceService.createResource(req.body);
    res.status(201).json({ success: true, data: resource });
  }),
);

resourceRouter.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(resourceBodySchema),
  asyncHandler(async (req, res) => {
    const resource = await resourceService.updateResource(req.params.id, req.body);
    res.json({ success: true, data: resource });
  }),
);

resourceRouter.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    await resourceService.deleteResource(req.params.id);
    res.json({ success: true, message: 'Resource deleted' });
  }),
);
