import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { RequestStatus, User } from '../../types';
import { fetchUsersRequest } from '../../services/userApi';
import { extractErrorMessage } from '../../services/api';

const STORAGE_KEY = 'rbs.selectedUserId';

interface CurrentUserState {
  selectedUserId: string | null;
  availableUsers: User[];
  status: RequestStatus;
  error: string | null;
}

const initialState: CurrentUserState = {
  selectedUserId: localStorage.getItem(STORAGE_KEY),
  availableUsers: [],
  status: 'idle',
  error: null,
};

// Loads users for the header "acting as" switcher (no auth in this app).
export const fetchAvailableUsers = createAsyncThunk(
  'currentUser/fetchAvailableUsers',
  async (_, { rejectWithValue }) => {
    try {
      const response = await fetchUsersRequest({ page: 1, limit: 100 });
      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const currentUserSlice = createSlice({
  name: 'currentUser',
  initialState,
  reducers: {
    setSelectedUser(state, action: PayloadAction<string>) {
      state.selectedUserId = action.payload;
      localStorage.setItem(STORAGE_KEY, action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.availableUsers = action.payload;
        const stillValid =
          state.selectedUserId &&
          action.payload.some((u) => u.id === state.selectedUserId);
        if (!stillValid) {
          state.selectedUserId = action.payload[0]?.id ?? null;
          if (state.selectedUserId) {
            localStorage.setItem(STORAGE_KEY, state.selectedUserId);
          } else {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load users';
      });
  },
});

export const { setSelectedUser } = currentUserSlice.actions;
export default currentUserSlice.reducer;
