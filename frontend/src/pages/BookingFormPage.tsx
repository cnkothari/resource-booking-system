import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearCurrentBooking,
  createBooking,
  fetchBooking,
  resetBookingsMutation,
  updateBooking,
} from '../features/bookings/bookingsSlice';
import { fetchResources } from '../features/resources/resourcesSlice';
import { BookingPayload } from '../types';
import { inputDateTimeToIso, toInputDateTime } from '../utils/format';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const MIN_MS = 30 * 60 * 1000;
const MAX_MS = 8 * 60 * 60 * 1000;

const schema = yup.object({
  title: yup
    .string()
    .trim()
    .max(160, 'Title is too long')
    .nullable()
    .transform((value: string) => value || null),
  resourceId: yup.string().required('Please select a resource'),
  userId: yup.string().required('Please select a user'),
  startTime: yup
    .string()
    .required('Start time is required')
    .test('not-past', 'Start time cannot be in the past', (value) =>
      value ? new Date(value).getTime() >= Date.now() - 60_000 : true,
    ),
  endTime: yup
    .string()
    .required('End time is required')
    .test('after-start', 'End time must be after start time', function (value) {
      const { startTime } = this.parent as { startTime?: string };
      if (!value || !startTime) return true;
      return new Date(value).getTime() > new Date(startTime).getTime();
    })
    .test('min-duration', 'Booking must be at least 30 minutes long', function (value) {
      const { startTime } = this.parent as { startTime?: string };
      if (!value || !startTime) return true;
      return new Date(value).getTime() - new Date(startTime).getTime() >= MIN_MS;
    })
    .test('max-duration', 'Booking cannot be longer than 8 hours', function (value) {
      const { startTime } = this.parent as { startTime?: string };
      if (!value || !startTime) return true;
      return new Date(value).getTime() - new Date(startTime).getTime() <= MAX_MS;
    }),
});

type FormValues = yup.InferType<typeof schema>;

const BookingFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const resources = useAppSelector((state) => state.resources.items);
  const { availableUsers, selectedUserId } = useAppSelector((state) => state.currentUser);
  const { current, currentStatus, mutationStatus, mutationError } = useAppSelector(
    (state) => state.bookings,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      title: null,
      resourceId: searchParams.get('resourceId') ?? '',
      userId: selectedUserId ?? '',
      startTime: '',
      endTime: '',
    },
  });

  // Load the resource dropdown options and (in edit mode) the booking itself.
  useEffect(() => {
    dispatch(resetBookingsMutation());
    void dispatch(fetchResources({ page: 1, limit: 100 }));
    if (isEdit && id) void dispatch(fetchBooking(id));
    return () => {
      dispatch(clearCurrentBooking());
    };
  }, [dispatch, id, isEdit]);

  // Default the user select to the currently "acting as" user for new bookings.
  useEffect(() => {
    if (!isEdit && selectedUserId) {
      reset((prev) => ({ ...prev, userId: prev.userId || selectedUserId }));
    }
  }, [isEdit, selectedUserId, reset]);

  useEffect(() => {
    if (isEdit && current) {
      reset({
        title: current.title,
        resourceId: current.resourceId,
        userId: current.userId,
        startTime: toInputDateTime(current.startTime),
        endTime: toInputDateTime(current.endTime),
      });
    }
  }, [current, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: BookingPayload = {
      title: values.title ?? null,
      resourceId: values.resourceId,
      userId: values.userId,
      startTime: inputDateTimeToIso(values.startTime),
      endTime: inputDateTimeToIso(values.endTime),
    };

    const result =
      isEdit && id
        ? await dispatch(updateBooking({ id, payload }))
        : await dispatch(createBooking(payload));

    if (createBooking.fulfilled.match(result) || updateBooking.fulfilled.match(result)) {
      navigate('/bookings');
    }
  };

  if (isEdit && currentStatus === 'loading') {
    return <Spinner label="Loading booking…" />;
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit booking' : 'New booking'} />

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-2xl space-y-4">
        {mutationStatus === 'failed' && mutationError && <ErrorMessage message={mutationError} />}

        <div>
          <label className="label" htmlFor="resourceId">
            Resource
          </label>
          <select id="resourceId" className="input" {...register('resourceId')}>
            <option value="">Select a resource…</option>
            {resources.map((resource) => (
              <option key={resource.id} value={resource.id} disabled={!resource.isActive}>
                {resource.name}
                {resource.resourceType ? ` — ${resource.resourceType.name}` : ''}
                {resource.isActive ? '' : ' (inactive)'}
              </option>
            ))}
          </select>
          {errors.resourceId && <p className="field-error">{errors.resourceId.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="userId">
            Booked for (user)
          </label>
          <select id="userId" className="input" {...register('userId')}>
            <option value="">Select a user…</option>
            {availableUsers.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
          {errors.userId && <p className="field-error">{errors.userId.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="title">
            Title / purpose (optional)
          </label>
          <input id="title" className="input" {...register('title')} />
          {errors.title && <p className="field-error">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="startTime">
              Start
            </label>
            <input
              id="startTime"
              type="datetime-local"
              className="input"
              {...register('startTime')}
            />
            {errors.startTime && <p className="field-error">{errors.startTime.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="endTime">
              End
            </label>
            <input id="endTime" type="datetime-local" className="input" {...register('endTime')} />
            {errors.endTime && <p className="field-error">{errors.endTime.message}</p>}
          </div>
        </div>

        <p className="text-xs text-slate-500">
          Rules: minimum 30 minutes, maximum 8 hours, no past dates, and no overlap with an
          existing booking for the same resource.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => navigate('/bookings')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutationStatus === 'loading'}>
            {mutationStatus === 'loading' ? 'Saving…' : isEdit ? 'Save changes' : 'Create booking'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BookingFormPage;
