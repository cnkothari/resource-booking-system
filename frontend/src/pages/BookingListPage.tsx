import { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  cancelBooking,
  deleteBooking,
  fetchBookings,
  resetBookingsMutation,
} from '../features/bookings/bookingsSlice';
import { Booking, BookingTag } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { bookingTagStyles, formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const PAGE_LIMIT = 10;

type DialogAction = 'cancel' | 'delete';

const BookingListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const { items, pagination, status, error, mutationStatus, mutationError } = useAppSelector(
    (state) => state.bookings,
  );

  const initialTag = (searchParams.get('tag') as BookingTag | null) ?? '';
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [tag, setTag] = useState<BookingTag | ''>(initialTag);
  const [dialog, setDialog] = useState<{ action: DialogAction; booking: Booking } | null>(null);
  const debouncedSearch = useDebounce(search);

  const reload = () =>
    dispatch(
      fetchBookings({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        tag: tag || undefined,
      }),
    );

  useEffect(() => {
    void dispatch(
      fetchBookings({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        tag: tag || undefined,
      }),
    );
  }, [dispatch, page, debouncedSearch, tag]);

  const handleConfirm = async () => {
    if (!dialog) return;
    const action =
      dialog.action === 'cancel'
        ? await dispatch(cancelBooking(dialog.booking.id))
        : await dispatch(deleteBooking(dialog.booking.id));

    const ok =
      cancelBooking.fulfilled.match(action) || deleteBooking.fulfilled.match(action);
    if (ok) {
      setDialog(null);
      dispatch(resetBookingsMutation());
      void reload();
    }
  };

  return (
    <div>
      <PageHeader
        title="Bookings"
        subtitle="All resource reservations"
        actions={
          <Link to="/bookings/new" className="btn-primary">
            + New booking
          </Link>
        }
      />

      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by resource, user, title…"
        />
        <select
          className="input w-full sm:w-52"
          value={tag}
          onChange={(e) => {
            setTag(e.target.value as BookingTag | '');
            setPage(1);
          }}
        >
          <option value="">All bookings</option>
          <option value="upcoming">Upcoming / Active</option>
          <option value="past">Past</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {status === 'loading' && <Spinner label="Loading bookings…" />}
        {status === 'failed' && (
          <div className="p-4">
            <ErrorMessage message={error ?? 'Failed to load bookings'} onRetry={() => reload()} />
          </div>
        )}

        {status === 'succeeded' && items.length === 0 && (
          <EmptyState
            title="No bookings found"
            description="Try a different filter or create a new booking."
          />
        )}

        {status === 'succeeded' && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Resource</th>
                    <th className="px-4 py-3">Booked for</th>
                    <th className="px-4 py-3">When</th>
                    <th className="px-4 py-3">Tag</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((booking) => (
                    <tr key={booking.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3">
                        <Link
                          to={`/bookings/${booking.id}`}
                          className="font-medium text-slate-800 hover:text-brand-600"
                        >
                          {booking.resource?.name ?? 'Resource'}
                        </Link>
                        {booking.title && (
                          <p className="text-xs text-slate-500">{booking.title}</p>
                        )}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{booking.user?.name ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">
                        <div>{formatDateTime(booking.startTime)}</div>
                        <div className="text-xs text-slate-400">
                          → {formatDateTime(booking.endTime)}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <Badge className={bookingTagStyles[booking.tag].className}>
                          {bookingTagStyles[booking.tag].label}
                        </Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap justify-end gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1"
                            onClick={() => navigate(`/bookings/${booking.id}`)}
                          >
                            View
                          </button>
                          {booking.status === 'active' && (
                            <>
                              <button
                                type="button"
                                className="btn-secondary px-3 py-1"
                                onClick={() => navigate(`/bookings/${booking.id}/edit`)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="btn-secondary px-3 py-1 text-amber-700"
                                onClick={() => {
                                  dispatch(resetBookingsMutation());
                                  setDialog({ action: 'cancel', booking });
                                }}
                              >
                                Cancel
                              </button>
                            </>
                          )}
                          <button
                            type="button"
                            className="btn-danger px-3 py-1"
                            onClick={() => {
                              dispatch(resetBookingsMutation());
                              setDialog({ action: 'delete', booking });
                            }}
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog?.action === 'cancel' ? 'Cancel booking' : 'Delete booking'}
        message={
          dialog?.action === 'cancel'
            ? 'Cancelling this booking will free the resource for that time period. Continue?'
            : 'This will soft-delete the booking. Continue?'
        }
        confirmLabel={dialog?.action === 'cancel' ? 'Cancel booking' : 'Delete'}
        loading={mutationStatus === 'loading'}
        error={mutationError}
        onConfirm={handleConfirm}
        onClose={() => {
          setDialog(null);
          dispatch(resetBookingsMutation());
        }}
      />
    </div>
  );
};

export default BookingListPage;
