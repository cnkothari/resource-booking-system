import { Router } from 'express';
import { validate } from '../middlewares/validate';
import { asyncHandler } from '../utils/asyncHandler';
import { parsePagination } from '../utils/pagination';
import { toBookingResponse } from '../utils/booking';
import { idParamSchema } from '../validators/common.validator';
import { bookingBodySchema, bookingListQuerySchema } from '../validators/booking.validator';
import { BookingTag } from '../repositories/booking.repository';
import * as bookingService from '../services/booking.service';

export const bookingRouter = Router();

bookingRouter.get(
  '/',
  validate(bookingListQuerySchema, 'query'),
  asyncHandler(async (req, res) => {
    const now = new Date();
    const params = parsePagination(req.query);
    const filters = {
      tag: req.query.tag as BookingTag | undefined,
      resourceId: typeof req.query.resourceId === 'string' ? req.query.resourceId : undefined,
      userId: typeof req.query.userId === 'string' ? req.query.userId : undefined,
    };
    const result = await bookingService.listBookings(params, filters);
    res.json({
      success: true,
      data: result.data.map((b) => toBookingResponse(b, now)),
      pagination: result.pagination,
    });
  }),
);

bookingRouter.get(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const booking = await bookingService.getBookingById(req.params.id);
    res.json({ success: true, data: toBookingResponse(booking, new Date()) });
  }),
);

bookingRouter.post(
  '/',
  validate(bookingBodySchema),
  asyncHandler(async (req, res) => {
    const booking = await bookingService.createBooking(req.body);
    res.status(201).json({ success: true, data: toBookingResponse(booking, new Date()) });
  }),
);

bookingRouter.put(
  '/:id',
  validate(idParamSchema, 'params'),
  validate(bookingBodySchema),
  asyncHandler(async (req, res) => {
    const booking = await bookingService.updateBooking(req.params.id, req.body);
    res.json({ success: true, data: toBookingResponse(booking, new Date()) });
  }),
);

// Cancel is a partial state change, not a full replace -> PATCH on a sub-resource.
bookingRouter.patch(
  '/:id/cancel',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    const booking = await bookingService.cancelBooking(req.params.id);
    res.json({ success: true, data: toBookingResponse(booking, new Date()) });
  }),
);

bookingRouter.delete(
  '/:id',
  validate(idParamSchema, 'params'),
  asyncHandler(async (req, res) => {
    await bookingService.deleteBooking(req.params.id);
    res.json({ success: true, message: 'Booking deleted' });
  }),
);
