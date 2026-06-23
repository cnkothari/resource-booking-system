import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import {
  createUser,
  deleteUser,
  fetchUsers,
  resetUsersMutation,
  updateUser,
} from '../features/users/usersSlice';
import { fetchAvailableUsers } from '../features/currentUser/currentUserSlice';
import { User, UserPayload } from '../types';
import { useDebounce } from '../hooks/useDebounce';
import { formatDate } from '../utils/format';
import PageHeader from '../components/PageHeader';
import SearchInput from '../components/SearchInput';
import Spinner from '../components/Spinner';
import ErrorMessage from '../components/ErrorMessage';
import EmptyState from '../components/EmptyState';
import Pagination from '../components/Pagination';
import ConfirmDialog from '../components/ConfirmDialog';
import UserFormModal from '../features/users/UserFormModal';

const PAGE_LIMIT = 10;

const UserListPage = () => {
  const dispatch = useAppDispatch();
  const { items, pagination, status, error, mutationStatus, mutationError } = useAppSelector(
    (state) => state.users,
  );

  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<User | null>(null);
  const [toDelete, setToDelete] = useState<User | null>(null);
  const debouncedSearch = useDebounce(search);

  const reload = () => dispatch(fetchUsers({ page, limit: PAGE_LIMIT, search: debouncedSearch }));

  useEffect(() => {
    void dispatch(fetchUsers({ page, limit: PAGE_LIMIT, search: debouncedSearch }));
  }, [dispatch, page, debouncedSearch]);

  const openAdd = () => {
    dispatch(resetUsersMutation());
    setEditing(null);
    setFormOpen(true);
  };

  const openEdit = (user: User) => {
    dispatch(resetUsersMutation());
    setEditing(user);
    setFormOpen(true);
  };

  const handleSubmit = async (payload: UserPayload) => {
    const result = editing
      ? await dispatch(updateUser({ id: editing.id, payload }))
      : await dispatch(createUser(payload));

    if (createUser.fulfilled.match(result) || updateUser.fulfilled.match(result)) {
      setFormOpen(false);
      setEditing(null);
      dispatch(resetUsersMutation());
      void reload();
      // Keep the header "acting as" switcher in sync.
      void dispatch(fetchAvailableUsers());
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    const result = await dispatch(deleteUser(toDelete.id));
    if (deleteUser.fulfilled.match(result)) {
      setToDelete(null);
      dispatch(resetUsersMutation());
      void reload();
      void dispatch(fetchAvailableUsers());
    }
  };

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage employees who can book resources"
        actions={
          <button type="button" className="btn-primary" onClick={openAdd}>
            + Add user
          </button>
        }
      />

      <div className="mb-4">
        <SearchInput
          value={search}
          onChange={(value) => {
            setSearch(value);
            setPage(1);
          }}
          placeholder="Search by name, email, department…"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
        {status === 'loading' && <Spinner label="Loading users…" />}
        {status === 'failed' && (
          <div className="p-4">
            <ErrorMessage message={error ?? 'Failed to load users'} onRetry={() => reload()} />
          </div>
        )}

        {status === 'succeeded' && items.length === 0 && (
          <EmptyState title="No users found" description="Add a user to get started." />
        )}

        {status === 'succeeded' && items.length > 0 && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-sm">
                <thead className="bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Name</th>
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Department</th>
                    <th className="px-4 py-3">Joined</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-medium text-slate-800">{user.name}</td>
                      <td className="px-4 py-3 text-slate-600">{user.email}</td>
                      <td className="px-4 py-3 text-slate-600">{user.department ?? '—'}</td>
                      <td className="px-4 py-3 text-slate-600">{formatDate(user.createdAt)}</td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            className="btn-secondary px-3 py-1"
                            onClick={() => openEdit(user)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="btn-danger px-3 py-1"
                            onClick={() => {
                              dispatch(resetUsersMutation());
                              setToDelete(user);
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

      <UserFormModal
        open={formOpen}
        user={editing}
        loading={mutationStatus === 'loading'}
        error={mutationError}
        onClose={() => {
          setFormOpen(false);
          setEditing(null);
          dispatch(resetUsersMutation());
        }}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title="Delete user"
        message={`Are you sure you want to delete "${toDelete?.name}"? This performs a soft delete.`}
        confirmLabel="Delete"
        loading={mutationStatus === 'loading'}
        error={mutationError}
        onConfirm={confirmDelete}
        onClose={() => {
          setToDelete(null);
          dispatch(resetUsersMutation());
        }}
      />
    </div>
  );
};

export default UserListPage;
