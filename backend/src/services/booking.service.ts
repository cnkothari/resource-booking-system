import { Booking, BOOKING_STATUS } from '../entities/Booking';
import * as bookingRepo from '../repositories/booking.repository';
import { BookingListFilters } from '../repositories/booking.repository';
import { badRequest, conflict, notFound } from '../utils/AppError';
import {
  MAX_BOOKING_HOURS,
  MAX_BOOKING_MS,
  MIN_BOOKING_MINUTES,
  MIN_BOOKING_MS,
} from '../utils/booking';
import { buildPaginatedResult, PaginatedResult, PaginationParams } from '../utils/pagination';
import { getResourceById } from './resource.service';
import { ensureUserExists } from './user.service';

export interface BookingInput {
  title?: string | null;
  resourceId: string;
  userId: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
}

/**
 * Apply the booking time-window rules. Throws AppError(400) on the first failure
 * with a clear, user-facing message.
 */
const validateBookingWindow = (start: Date, end: Date, now: Date): void => {
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw badRequest('Start and end times must be valid dates');
  }
  if (end.getTime() <= start.getTime()) {
    throw badRequest('End time must be after start time');
  }
  if (start.getTime() < now.getTime()) {
    throw badRequest('Bookings cannot be made for past dates/times');
  }

  const duration = end.getTime() - start.getTime();
  if (duration < MIN_BOOKING_MS) {
    throw badRequest(`Bookings must be at least ${MIN_BOOKING_MINUTES} minutes long`);
  }
  if (duration > MAX_BOOKING_MS) {
    throw badRequest(`Bookings cannot be longer than ${MAX_BOOKING_HOURS} hours`);
  }
};

const assertNoOverlap = async (
  resourceId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string,
): Promise<void> => {
  const overlapping = await bookingRepo.findOverlappingBookings(
    resourceId,
    start,
    end,
    excludeBookingId,
  );
  if (overlapping.length > 0) {
    throw conflict('This resource is already booked for an overlapping time period');
  }
};

export const listBookings = async (
  params: PaginationParams,
  filters: BookingListFilters,
): Promise<PaginatedResult<Booking>> => {
  const [data, total] = await bookingRepo.findBookingsPaginated(params, filters, new Date());
  return buildPaginatedResult(data, total, params);
};

export const getBookingById = async (id: string): Promise<Booking> => {
  const booking = await bookingRepo.findBookingById(id);
  if (!booking) throw notFound('Booking not found');
  return booking;
};

export const createBooking = async (input: BookingInput): Promise<Booking> => {
  const now = new Date();
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  await ensureUserExists(input.userId);
  const resource = await getResourceById(input.resourceId);
  if (!resource.isActive) {
    throw badRequest('This resource is inactive and cannot be booked');
  }

  validateBookingWindow(start, end, now);
  await assertNoOverlap(input.resourceId, start, end);

  const created = await bookingRepo.insertBooking({
    title: input.title ?? null,
    resourceId: input.resourceId,
    userId: input.userId,
    startTime: start,
    endTime: end,
    status: BOOKING_STATUS.ACTIVE,
  });

  return getBookingById(created.id);
};

export const updateBooking = async (
  id: string,
  input: BookingInput,
): Promise<Booking> => {
  const booking = await getBookingById(id);
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw badRequest('A cancelled booking cannot be edited');
  }

  const now = new Date();
  const start = new Date(input.startTime);
  const end = new Date(input.endTime);

  await ensureUserExists(input.userId);
  const resource = await getResourceById(input.resourceId);
  if (!resource.isActive) {
    throw badRequest('This resource is inactive and cannot be booked');
  }

  validateBookingWindow(start, end, now);
  await assertNoOverlap(input.resourceId, start, end, id);

  booking.title = input.title ?? null;
  booking.resourceId = input.resourceId;
  booking.userId = input.userId;
  booking.startTime = start;
  booking.endTime = end;

  await bookingRepo.updateBooking(booking);
  return getBookingById(id);
};

/** Cancel a booking — frees the slot for future reservations. */
export const cancelBooking = async (id: string): Promise<Booking> => {
  const booking = await getBookingById(id);
  if (booking.status === BOOKING_STATUS.CANCELLED) {
    throw badRequest('Booking is already cancelled');
  }

  booking.status = BOOKING_STATUS.CANCELLED;
  booking.cancelledAt = new Date();

  await bookingRepo.updateBooking(booking);
  return getBookingById(id);
};

export const deleteBooking = async (id: string): Promise<void> => {
  const booking = await getBookingById(id);
  await bookingRepo.softDeleteBooking(booking);
};
