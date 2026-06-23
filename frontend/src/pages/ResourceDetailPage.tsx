import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { clearCurrentResource, fetchResource } from '../features/resources/resourcesSlice';
import PageHeader from '../components/PageHeader';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import Badge from '../components/Badge';

const DetailRow = ({ label, value }: { label: string; value: React.ReactNode }) => (
  <div className="flex flex-col gap-1 border-b border-slate-100 py-3 sm:flex-row sm:items-center">
    <dt className="w-48 shrink-0 text-sm font-medium text-slate-500">{label}</dt>
    <dd className="text-sm text-slate-800">{value}</dd>
  </div>
);

const ResourceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { current, currentStatus, currentError } = useAppSelector((state) => state.resources);

  useEffect(() => {
    if (id) void dispatch(fetchResource(id));
    return () => {
      dispatch(clearCurrentResource());
    };
  }, [dispatch, id]);

  return (
    <div>
      <PageHeader
        title="Resource details"
        actions={
          <>
            <Link to="/resources" className="btn-secondary">
              Back
            </Link>
            {current && (
              <>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate(`/resources/${current.id}/edit`)}
                >
                  Edit
                </button>
                <Link to={`/bookings/new?resourceId=${current.id}`} className="btn-primary">
                  Book this resource
                </Link>
              </>
            )}
          </>
        }
      />

      {currentStatus === 'loading' && <Spinner label="Loading resource…" />}
      {currentStatus === 'failed' && (
        <ErrorMessage
          message={currentError ?? 'Failed to load resource'}
          onRetry={() => id && dispatch(fetchResource(id))}
        />
      )}

      {current && currentStatus === 'succeeded' && (
        <div className="card">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-slate-800">{current.name}</h2>
            {current.isActive ? (
              <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
            ) : (
              <Badge className="bg-slate-200 text-slate-600">Inactive</Badge>
            )}
          </div>
          <dl>
            <DetailRow label="Resource type" value={current.resourceType?.name ?? '—'} />
            <DetailRow label="Description" value={current.description || '—'} />
            <DetailRow label="Location" value={current.location || '—'} />
            <DetailRow label="Capacity" value={current.capacity ?? '—'} />
            <DetailRow
              label="Created"
              value={new Date(current.createdAt).toLocaleString()}
            />
          </dl>
        </div>
      )}
    </div>
  );
};

export default ResourceDetailPage;
