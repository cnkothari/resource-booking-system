import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ListQuery, PaginationMeta, RequestStatus, User, UserPayload } from '../../types';
import {
  createUserRequest,
  deleteUserRequest,
  fetchUsersRequest,
  updateUserRequest,
} from '../../services/userApi';
import { extractErrorMessage } from '../../services/api';

interface UsersState {
  items: User[];
  pagination: PaginationMeta;
  status: RequestStatus;
  error: string | null;
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: UsersState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
  mutationStatus: 'idle',
  mutationError: null,
};

export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (query: ListQuery, { rejectWithValue }) => {
    try {
      return await fetchUsersRequest(query);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (payload: UserPayload, { rejectWithValue }) => {
    try {
      return await createUserRequest(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async (args: { id: string; payload: UserPayload }, { rejectWithValue }) => {
    try {
      return await updateUserRequest(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteUserRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const usersSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    resetUsersMutation(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load users';
      });

    // Shared mutation lifecycle for create / update / delete.
    builder
      .addMatcher(
        (action) =>
          [createUser.pending.type, updateUser.pending.type, deleteUser.pending.type].includes(
            action.type,
          ),
        (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        },
      )
      .addMatcher(
        (action) =>
          [
            createUser.fulfilled.type,
            updateUser.fulfilled.type,
            deleteUser.fulfilled.type,
          ].includes(action.type),
        (state) => {
          state.mutationStatus = 'succeeded';
        },
      )
      .addMatcher(
        (action) =>
          [
            createUser.rejected.type,
            updateUser.rejected.type,
            deleteUser.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError =
            ((action as { payload?: string }).payload as string) ?? 'Operation failed';
        },
      );
  },
});

export const { resetUsersMutation } = usersSlice.actions;
export default usersSlice.reducer;
