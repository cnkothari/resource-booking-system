import { Booking, BOOKING_STATUS } from '../entities/Booking';

// Booking duration rules (requirements).
export const MIN_BOOKING_MINUTES = 30;
export const MAX_BOOKING_HOURS = 8;
export const MIN_BOOKING_MS = MIN_BOOKING_MINUTES * 60 * 1000;
export const MAX_BOOKING_MS = MAX_BOOKING_HOURS * 60 * 60 * 1000;

export type DisplayBookingTag = 'past' | 'upcoming' | 'cancelled';

/**
 * Derive the display tag shown in the UI. "cancelled" is a stored state;
 * "past" vs "upcoming" (which covers currently-active) is derived from the clock.
 */
export const deriveBookingTag = (booking: Booking, now: Date): DisplayBookingTag => {
  if (booking.status === BOOKING_STATUS.CANCELLED) return 'cancelled';
  return booking.endTime.getTime() < now.getTime() ? 'past' : 'upcoming';
};

/**
 * Shape a Booking entity (with relations) into an API response object, adding
 * the derived tag. Returns a plain object — no entity internals leak out.
 */
export const toBookingResponse = (booking: Booking, now: Date) => ({
  id: booking.id,
  title: booking.title,
  startTime: booking.startTime,
  endTime: booking.endTime,
  status: booking.status,
  tag: deriveBookingTag(booking, now),
  cancelledAt: booking.cancelledAt,
  resourceId: booking.resourceId,
  userId: booking.userId,
  resource: booking.resource
    ? {
        id: booking.resource.id,
        name: booking.resource.name,
        location: booking.resource.location,
        resourceType: booking.resource.resourceType
          ? { id: booking.resource.resourceType.id, name: booking.resource.resourceType.name }
          : undefined,
      }
    : undefined,
  user: booking.user
    ? { id: booking.user.id, name: booking.user.name, email: booking.user.email }
    : undefined,
  createdAt: booking.createdAt,
  updatedAt: booking.updatedAt,
});
