import { Brackets } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Booking, BOOKING_STATUS } from '../entities/Booking';
import { PaginationParams } from '../utils/pagination';

const repo = () => AppDataSource.getRepository(Booking);

export type BookingTag = 'past' | 'upcoming' | 'cancelled';

export interface BookingListFilters {
  resourceId?: string;
  userId?: string;
  tag?: BookingTag;
}

const applyTagFilter = (
  qb: ReturnType<ReturnType<typeof repo>['createQueryBuilder']>,
  tag: BookingTag,
  now: Date,
): void => {
  if (tag === 'cancelled') {
    qb.andWhere('booking.status = :cancelled', { cancelled: BOOKING_STATUS.CANCELLED });
  } else if (tag === 'past') {
    qb.andWhere('booking.status = :active', { active: BOOKING_STATUS.ACTIVE });
    qb.andWhere('booking.endTime < :now', { now });
  } else if (tag === 'upcoming') {
    qb.andWhere('booking.status = :active', { active: BOOKING_STATUS.ACTIVE });
    qb.andWhere('booking.endTime >= :now', { now });
  }
};

export const findBookingsPaginated = (
  params: PaginationParams,
  filters: BookingListFilters,
  now: Date,
): Promise<[Booking[], number]> => {
  const qb = repo()
    .createQueryBuilder('booking')
    .leftJoinAndSelect('booking.resource', 'resource')
    .leftJoinAndSelect('booking.user', 'user')
    .orderBy('booking.startTime', 'DESC')
    .skip(params.skip)
    .take(params.limit);

  if (params.search) {
    qb.andWhere(
      new Brackets((w) => {
        w.where('booking.title ILIKE :search', { search: `%${params.search}%` })
          .orWhere('resource.name ILIKE :search', { search: `%${params.search}%` })
          .orWhere('user.name ILIKE :search', { search: `%${params.search}%` });
      }),
    );
  }

  if (filters.resourceId) {
    qb.andWhere('booking.resourceId = :resourceId', { resourceId: filters.resourceId });
  }
  if (filters.userId) {
    qb.andWhere('booking.userId = :userId', { userId: filters.userId });
  }
  if (filters.tag) {
    applyTagFilter(qb, filters.tag, now);
  }

  return qb.getManyAndCount();
};

export const findBookingById = (id: string): Promise<Booking | null> =>
  repo().findOne({
    where: { id },
    relations: { resource: { resourceType: true }, user: true },
  });

export const insertBooking = (data: Partial<Booking>): Promise<Booking> =>
  repo().save(repo().create(data));

export const updateBooking = (booking: Booking): Promise<Booking> =>
  repo().save(booking);

export const softDeleteBooking = async (booking: Booking): Promise<void> => {
  await repo().softRemove(booking);
};

/**
 * Active bookings on a resource whose time window overlaps [start, end).
 * Two ranges overlap when existing.start < new.end AND existing.end > new.start.
 * Cancelled (and soft-deleted) bookings are ignored, freeing the slot.
 */
export const findOverlappingBookings = (
  resourceId: string,
  start: Date,
  end: Date,
  excludeBookingId?: string,
): Promise<Booking[]> => {
  const qb = repo()
    .createQueryBuilder('booking')
    .where('booking.resourceId = :resourceId', { resourceId })
    .andWhere('booking.status = :active', { active: BOOKING_STATUS.ACTIVE })
    .andWhere('booking.startTime < :end', { end })
    .andWhere('booking.endTime > :start', { start });

  if (excludeBookingId) {
    qb.andWhere('booking.id != :excludeBookingId', { excludeBookingId });
  }

  return qb.getMany();
};

/** Whether a resource has any non-cancelled booking that has not yet ended. */
export const hasActiveBookingForResource = async (
  resourceId: string,
  now: Date,
): Promise<boolean> => {
  const count = await repo()
    .createQueryBuilder('booking')
    .where('booking.resourceId = :resourceId', { resourceId })
    .andWhere('booking.status = :active', { active: BOOKING_STATUS.ACTIVE })
    .andWhere('booking.endTime >= :now', { now })
    .getCount();
  return count > 0;
};

export interface BookingCounts {
  total: number;
  activeUpcoming: number;
  cancelled: number;
  past: number;
}

export const getBookingCounts = async (now: Date): Promise<BookingCounts> => {
  const [total, activeUpcoming, cancelled, past] = await Promise.all([
    repo().count(),
    repo()
      .createQueryBuilder('booking')
      .where('booking.status = :active', { active: BOOKING_STATUS.ACTIVE })
      .andWhere('booking.endTime >= :now', { now })
      .getCount(),
    repo()
      .createQueryBuilder('booking')
      .where('booking.status = :cancelled', { cancelled: BOOKING_STATUS.CANCELLED })
      .getCount(),
    repo()
      .createQueryBuilder('booking')
      .where('booking.status = :active', { active: BOOKING_STATUS.ACTIVE })
      .andWhere('booking.endTime < :now', { now })
      .getCount(),
  ]);

  return { total, activeUpcoming, cancelled, past };
};
