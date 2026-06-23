import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  deleteResource,
  fetchResources,
  resetResourcesMutation,
} from '../features/resources/resourcesSlice';
import { Resource } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import Badge from '../components/Badge';
import ConfirmDialog from '../components/ConfirmDialog';

const PAGE_LIMIT = 10;

const ResourceListPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items, pagination, status, error, mutationStatus, mutationError } = useAppSelector(
    (state) => state.resources,
  );
  const resourceTypes = useAppSelector((state) => state.resourceTypes.items);

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [typeFilter, setTypeFilter] = useState('');
  const [toDelete, setToDelete] = useState<Resource | null>(null);
  const debouncedSearch = useDebounce(search);

  useEffect(() => {
    void dispatch(
      fetchResources({
        page,
        limit: PAGE_LIMIT,
        search: debouncedSearch,
        resourceTypeId: typeFilter || undefined,
      }),
    );
  }, [dispatch, page, debouncedSearch, typeFilter]);

  const confirmDelete = async () => {
    if (!toDelete) return;
    const result = await dispatch(deleteResource(toDelete.id));
    if (deleteResource.fulfilled.match(result)) {
      setToDelete(null);
      dispatch(resetResourcesMutation());
      void dispatch(
        fetchResources({
          page,
          limit: PAGE_LIMIT,
          search: debouncedSearch,
          resourceTypeId: typeFilter || undefined,
        }),
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Resources"
        subtitle="Browse and manage company resources"
        actions={
          <Link to="/resources/new" className="btn-primary">
            + Add resource
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
          placeholder="Search by name, location…"
        />
        <select
          className="input w-full sm:w-56"
          value={typeFilter}
          onChange={(e) => {
            setTypeFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All resource types</option>
          {resourceTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {status === 'loading' && <Spinner label="Loading resources…" />}
        {status === 'failed' && (
          <div className="p-4">
            <ErrorMessage
              message={error ?? 'Failed to load resources'}
              onRetry={() =>
                dispatch(
                  fetchResources({ page, limit: PAGE_LIMIT, search: debouncedSearch }),
                )
              }
            />
          </div>
        )}

        {status === 'succeeded' && items.length === 0 && (
          <EmptyState
            title="No resources found"
            description="Try adjusting your search or add a new resource."
          />
        )}

        {status === 'succeeded' && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3">Location</th>
                    <th className="px-4 py-3">Capacity</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((resource) => (
                    <tr key={resource.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">
                        <Link to={`/resources/${resource.id}`} className="hover:text-brand-600">
                          {resource.name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {resource.resourceType?.name ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{resource.location ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{resource.capacity ?? '—'}</td>
                      <td className="px-4 py-3">
                        {resource.isActive ? (
                          <Badge className="bg-emerald-100 text-emerald-700">Active</Badge>
                        ) : (
                          <Badge className="bg-slate-200 text-slate-600">Inactive</Badge>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1"
                            onClick={() => navigate(`/resources/${resource.id}/edit`)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-3 py-1"
                            onClick={() => {
                              dispatch(resetResourcesMutation());
                              setToDelete(resource);
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
        open={Boolean(toDelete)}
        title="Delete resource"
        message={`Are you sure you want to delete "${toDelete?.name}"? This action performs a soft delete.`}
        confirmLabel="Delete"
        loading={mutationStatus === 'loading'}
        error={mutationError}
        onConfirm={confirmDelete}
        onClose={() => {
          setToDelete(null);
          dispatch(resetResourcesMutation());
        }}
      />
    </div>
  );
};

export default ResourceListPage;
