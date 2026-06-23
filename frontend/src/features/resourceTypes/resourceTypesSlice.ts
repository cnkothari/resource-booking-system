import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { RequestStatus, ResourceType } from '../../types';
import { fetchResourceTypesRequest } from '../../services/resourceTypeApi';
import { extractErrorMessage } from '../../services/api';

interface ResourceTypesState {
  items: ResourceType[];
  status: RequestStatus;
  error: string | null;
}

const initialState: ResourceTypesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchResourceTypes = createAsyncThunk(
  'resourceTypes/fetchResourceTypes',
  async (_, { rejectWithValue }) => {
    try {
      return await fetchResourceTypesRequest();
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const resourceTypesSlice = createSlice({
  name: 'resourceTypes',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchResourceTypes.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchResourceTypes.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload;
      })
      .addCase(fetchResourceTypes.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load resource types';
      });
  },
});

export default resourceTypesSlice.reducer;
