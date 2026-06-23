import { getBookingCounts } from '../repositories/booking.repository';
import { countResources } from '../repositories/resource.repository';
import { countUsers } from '../repositories/user.repository';

export interface DashboardSummary {
  totalResources: number;
  totalUsers: number;
  activeUpcomingBookings: number;
  cancelledBookings: number;
  pastBookings: number;
  totalBookings: number;
}

export const getDashboardSummary = async (): Promise<DashboardSummary> => {
  const now = new Date();
  const [totalResources, totalUsers, counts] = await Promise.all([
    countResources(),
    countUsers(),
    getBookingCounts(now),
  ]);

  return {
    totalResources,
    totalUsers,
    activeUpcomingBookings: counts.activeUpcoming,
    cancelledBookings: counts.cancelled,
    pastBookings: counts.past,
    totalBookings: counts.total,
  };
};
