import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { PaginationMeta, RequestStatus, Resource, ResourcePayload } from '../../types';
import {
  createResourceRequest,
  deleteResourceRequest,
  fetchResourceRequest,
  fetchResourcesRequest,
  updateResourceRequest,
} from '../../services/resourceApi';
import { extractErrorMessage } from '../../services/api';

interface ResourceListQuery {
  page?: number;
  limit?: number;
  search?: string;
  resourceTypeId?: string;
}

interface ResourcesState {
  items: Resource[];
  pagination: PaginationMeta;
  status: RequestStatus;
  error: string | null;
  current: Resource | null;
  currentStatus: RequestStatus;
  currentError: string | null;
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: ResourcesState = {
  items: [],
  pagination: { page: 1, limit: 10, total: 0, totalPages: 1 },
  status: 'idle',
  error: null,
  current: null,
  currentStatus: 'idle',
  currentError: null,
  mutationStatus: 'idle',
  mutationError: null,
};

export const fetchResources = createAsyncThunk(
  'resources/fetchResources',
  async (query: ResourceListQuery, { rejectWithValue }) => {
    try {
      return await fetchResourcesRequest(query);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const fetchResource = createAsyncThunk(
  'resources/fetchResource',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchResourceRequest(id);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createResource = createAsyncThunk(
  'resources/createResource',
  async (payload: ResourcePayload, { rejectWithValue }) => {
    try {
      return await createResourceRequest(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateResource = createAsyncThunk(
  'resources/updateResource',
  async (args: { id: string; payload: ResourcePayload }, { rejectWithValue }) => {
    try {
      return await updateResourceRequest(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteResource = createAsyncThunk(
  'resources/deleteResource',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteResourceRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const resourcesSlice = createSlice({
  name: 'resources',
  initialState,
  reducers: {
    resetResourcesMutation(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
    clearCurrentResource(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchResources.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchResources.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchResources.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load resources';
      });

    builder
      .addCase(fetchResource.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
        state.current = null;
      })
      .addCase(fetchResource.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchResource.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = (action.payload as string) ?? 'Failed to load resource';
      });

    builder
      .addMatcher(
        (action) =>
          [
            createResource.pending.type,
            updateResource.pending.type,
            deleteResource.pending.type,
          ].includes(action.type),
        (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        },
      )
      .addMatcher(
        (action) =>
          [
            createResource.fulfilled.type,
            updateResource.fulfilled.type,
            deleteResource.fulfilled.type,
          ].includes(action.type),
        (state) => {
          state.mutationStatus = 'succeeded';
        },
      )
      .addMatcher(
        (action) =>
          [
            createResource.rejected.type,
            updateResource.rejected.type,
            deleteResource.rejected.type,
          ].includes(action.type),
        (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError =
            ((action as { payload?: string }).payload as string) ?? 'Operation failed';
        },
      );
  },
});

export const { resetResourcesMutation, clearCurrentResource } = resourcesSlice.actions;
export default resourcesSlice.reducer;
