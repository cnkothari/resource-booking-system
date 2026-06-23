import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { DashboardSummary, RequestStatus } from '../../types';
import { fetchDashboardSummaryRequest } from '../../services/dashboardApi';
import { extractErrorMessage } from '../../services/api';

interface DashboardState {
  summary: DashboardSummary | null;
  status: RequestStatus;
  error: string | null;
}

const initialState: DashboardState = {
  summary: null,
  status: 'idle',
  error: null,
};

export const fetchDashboardSummary = createAsyncThunk(
  'dashboard/fetchSummary',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchDashboardSummaryRequest();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDashboardSummary.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchDashboardSummary.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.summary = action.payload;
      })
      .addCase(fetchDashboardSummary.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load dashboard';
      });
  },
});

export default dashboardSlice.reducer;
