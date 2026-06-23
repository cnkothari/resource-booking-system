import { Router } from 'express';
import { userRouter } from './user.routes';
import { resourceRouter } from './resource.routes';
import { resourceTypeRouter } from './resourceType.routes';
import { bookingRouter } from './booking.routes';
import { dashboardRouter } from './dashboard.routes';

export const apiRouter = Router();

apiRouter.get('/health', (_req, res) => {
  res.json({ success: true, status: 'ok' });
});

apiRouter.use('/users', userRouter);
apiRouter.use('/resource-types', resourceTypeRouter);
apiRouter.use('/resources', resourceRouter);
apiRouter.use('/bookings', bookingRouter);
apiRouter.use('/dashboard', dashboardRouter);
