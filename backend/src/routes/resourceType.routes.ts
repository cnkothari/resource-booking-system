import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as resourceTypeService from '../services/resourceType.service';

export const resourceTypeRouter = Router();

resourceTypeRouter.get(
  '/',
  asyncHandler(async (_req, res) => {
    const resourceTypes = await resourceTypeService.listResourceTypes();
    res.json({ success: true, data: resourceTypes });
  }),
);
