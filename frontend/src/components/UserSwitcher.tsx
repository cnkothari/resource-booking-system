import { useAppDispatch, useAppSelector } from '../app/hooks';
import { setSelectedUser } from '../features/currentUser/currentUserSlice';

/**
 * "Acting as" selector. This app has no authentication (per requirements), so the
 * current user is chosen here and attached to any bookings that get created.
 */
const UserSwitcher = () => {
  const dispatch = useAppDispatch();
  const { availableUsers, selectedUserId } = useAppSelector((state) => state.currentUser);

  return (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-slate-500 sm:inline">Acting as</span>
      <select
        className="input w-48 py-1.5"
        value={selectedUserId ?? ''}
        onChange={(e) => dispatch(setSelectedUser(e.target.value))}
        disabled={availableUsers.length === 0}
      >
        {availableUsers.length === 0 && <option value="">No users</option>}
        {availableUsers.map((user) => (
          <option key={user.id} value={user.id}>
            {user.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default UserSwitcher;
