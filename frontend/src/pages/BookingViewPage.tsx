import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  cancelBooking,
  clearCurrentBooking,
  deleteBooking,
  fetchBooking,
  resetBookingsMutation,
} from '../features/bookings/bookingsSlice';
import { bookingTagStyles, formatDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:items-center">
    <dt className="w-48 shrink-0 text-sm font-medium text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

const BookingViewPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, currentStatus, currentError, mutationStatus, mutationError } = useAppSelector(
    (state) => state.bookings,
  );
  const [dialog, setDialog] = useState<'cancel' | 'delete' | null>(null);

  useEffect(() => {
    if (id) void dispatch(fetchBooking(id));
    return () => {
      dispatch(clearCurrentBooking());
    };
  }, [dispatch, id]);

  const handleConfirm = async () => {
    if (!current || !dialog) return;
    const action =
      dialog === 'cancel'
        ? await dispatch(cancelBooking(current.id))
        : await dispatch(deleteBooking(current.id));

    if (dialog === 'cancel' && cancelBooking.fulfilled.match(action)) {
      setDialog(null);
      dispatch(resetBookingsMutation());
    } else if (dialog === 'delete' && deleteBooking.fulfilled.match(action)) {
      navigate('/bookings');
    }
  };

  return (
    <div>
      <PageHeader
        title="Booking details"
        actions={
          <>
            <Link to="/bookings" className="btn-secondary">
              Back
            </Link>
            {current && current.status === 'active' && (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/bookings/${current.id}/edit`)}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn-secondary text-amber-700"
                  onClick={() => {
                    dispatch(resetBookingsMutation());
                    setDialog('cancel');
                  }}
                >
                  Cancel booking
                </button>
              </>
            )}
          </>
        }
      />

      {currentStatus === 'loading' && <Spinner label="Loading booking…" />}
      {currentStatus === 'failed' && (
        <ErrorMessage
          message={currentError ?? 'Failed to load booking'}
          onRetry={() => id && dispatch(fetchBooking(id))}
        />
      )}

      {current && currentStatus === 'succeeded' && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">
              {current.title || current.resource?.name || 'Booking'}
            </h2>
            <Badge className={bookingTagStyles[current.tag].className}>
              {bookingTagStyles[current.tag].label}
            </Badge>
          </div>
          <dl>
            <DetailRow
              label="Resource"
              value={
                current.resource ? (
                  <Link
                    to={`/resources/${current.resource.id}`}
                    className="text-brand-600 hover:underline"
                  >
                    {current.resource.name}
                  </Link>
                ) : (
                  '—'
                )
              }
            />
            <DetailRow
              label="Resource type"
              value={current.resource?.resourceType?.name ?? '—'}
            />
            <DetailRow
              label="Booked for"
              value={
                current.user
                  ? `${current.user.name} (${current.user.email})`
                  : '—'
              }
            />
            <DetailRow label="Start" value={formatDateTime(current.startTime)} />
            <DetailRow label="End" value={formatDateTime(current.endTime)} />
            <DetailRow label="Status" value={current.status} />
            {current.cancelledAt && (
              <DetailRow label="Cancelled at" value={formatDateTime(current.cancelledAt)} />
            )}
          </dl>
        </div>
      )}

      <ConfirmDialog
        open={Boolean(dialog)}
        title={dialog === 'cancel' ? 'Cancel booking' : 'Delete booking'}
        message={
          dialog === 'cancel'
            ? 'Cancelling this booking will free the resource for that time period. Continue?'
            : 'This will soft-delete the booking. Continue?'
        }
        confirmLabel={dialog === 'cancel' ? 'Cancel booking' : 'Delete'}
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

export default BookingViewPage;
