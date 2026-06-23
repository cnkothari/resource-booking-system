import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  clearCurrentResource,
  createResource,
  fetchResource,
  resetResourcesMutation,
  updateResource,
} from '../features/resources/resourcesSlice';
import { ResourcePayload } from '../types';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';

const schema = yup.object({
  name: yup.string().trim().required('Name is required').min(2, 'Name is too short').max(120),
  resourceTypeId: yup.string().required('Resource type is required'),
  description: yup
    .string()
    .trim()
    .max(500, 'Description is too long')
    .nullable()
    .transform((value: string) => value || null),
  location: yup
    .string()
    .trim()
    .max(160, 'Location is too long')
    .nullable()
    .transform((value: string) => value || null),
  capacity: yup
    .number()
    .transform((value, original) => (original === '' || original == null ? null : value))
    .nullable()
    .typeError('Capacity must be a number')
    .integer('Capacity must be a whole number')
    .min(1, 'Capacity must be at least 1'),
  isActive: yup.boolean().default(true),
});

type FormValues = yup.InferType<typeof schema>;

const ResourceFormPage = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resourceTypes = useAppSelector((state) => state.resourceTypes.items);
  const { current, currentStatus, mutationStatus, mutationError } = useAppSelector(
    (state) => state.resources,
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      name: '',
      resourceTypeId: '',
      description: null,
      location: null,
      capacity: null,
      isActive: true,
    },
  });

  useEffect(() => {
    dispatch(resetResourcesMutation());
    if (isEdit && id) void dispatch(fetchResource(id));
    return () => {
      dispatch(clearCurrentResource());
    };
  }, [dispatch, id, isEdit]);

  useEffect(() => {
    if (isEdit && current) {
      reset({
        name: current.name,
        resourceTypeId: current.resourceTypeId,
        description: current.description,
        location: current.location,
        capacity: current.capacity,
        isActive: current.isActive,
      });
    }
  }, [current, isEdit, reset]);

  const onSubmit = async (values: FormValues) => {
    const payload: ResourcePayload = {
      name: values.name,
      resourceTypeId: values.resourceTypeId,
      description: values.description ?? null,
      location: values.location ?? null,
      capacity: values.capacity ?? null,
      isActive: values.isActive,
    };

    const result =
      isEdit && id
        ? await dispatch(updateResource({ id, payload }))
        : await dispatch(createResource(payload));

    if (createResource.fulfilled.match(result) || updateResource.fulfilled.match(result)) {
      navigate('/resources');
    }
  };

  if (isEdit && currentStatus === 'loading') {
    return <Spinner label="Loading resource…" />;
  }

  return (
    <div>
      <PageHeader title={isEdit ? 'Edit resource' : 'Add resource'} />

      <form onSubmit={handleSubmit(onSubmit)} className="card max-w-2xl space-y-4">
        {mutationStatus === 'failed' && mutationError && <ErrorMessage message={mutationError} />}

        <div>
          <label className="label" htmlFor="name">
            Name
          </label>
          <input id="name" className="input" {...register('name')} />
          {errors.name && <p className="field-error">{errors.name.message}</p>}
        </div>

        <div>
          <label className="label" htmlFor="resourceTypeId">
            Resource type
          </label>
          <select id="resourceTypeId" className="input" {...register('resourceTypeId')}>
            <option value="">Select a type…</option>
            {resourceTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
          {errors.resourceTypeId && <p className="field-error">{errors.resourceTypeId.message}</p>}
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="location">
              Location
            </label>
            <input id="location" className="input" {...register('location')} />
            {errors.location && <p className="field-error">{errors.location.message}</p>}
          </div>
          <div>
            <label className="label" htmlFor="capacity">
              Capacity
            </label>
            <input id="capacity" type="number" min={1} className="input" {...register('capacity')} />
            {errors.capacity && <p className="field-error">{errors.capacity.message}</p>}
          </div>
        </div>

        <div>
          <label className="label" htmlFor="description">
            Description
          </label>
          <textarea id="description" rows={3} className="input" {...register('description')} />
          {errors.description && <p className="field-error">{errors.description.message}</p>}
        </div>

        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" {...register('isActive')} className="h-4 w-4" />
          Active (available for booking)
        </label>

        <div className="flex justify-end gap-2 pt-2">
          <button type="button" className="btn-secondary" onClick={() => navigate('/resources')}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={mutationStatus === 'loading'}>
            {mutationStatus === 'loading' ? 'Saving…' : isEdit ? 'Save changes' : 'Create resource'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ResourceFormPage;
