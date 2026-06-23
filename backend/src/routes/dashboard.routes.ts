import { Router } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import * as dashboardService from '../services/dashboard.service';

export const dashboardRouter = Router();

dashboardRouter.get(
  '/summary',
  asyncHandler(async (_req, res) => {
    const summary = await dashboardService.getDashboardSummary();
    res.json({ success: true, data: summary });
  }),
);
