import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { Booking, BookingPayload, PaginationMeta, RequestStatus } from '../../types';
import {
  BookingListQuery,
  cancelBookingRequest,
  createBookingRequest,
  deleteBookingRequest,
  fetchBookingRequest,
  fetchBookingsRequest,
  updateBookingRequest,
} from '../../services/bookingApi';
import { extractErrorMessage } from '../../services/api';

interface BookingsState {
  items: Booking[];
  pagination: PaginationMeta;
  status: RequestStatus;
  error: string | null;
  current: Booking | null;
  currentStatus: RequestStatus;
  currentError: string | null;
  mutationStatus: RequestStatus;
  mutationError: string | null;
}

const initialState: BookingsState = {
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

export const fetchBookings = createAsyncThunk(
  'bookings/fetchBookings',
  async (query: BookingListQuery, { rejectWithValue }) => {
    try {
      return await fetchBookingsRequest(query);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const fetchBooking = createAsyncThunk(
  'bookings/fetchBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      return await fetchBookingRequest(id);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createBooking = createAsyncThunk(
  'bookings/createBooking',
  async (payload: BookingPayload, { rejectWithValue }) => {
    try {
      return await createBookingRequest(payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateBooking = createAsyncThunk(
  'bookings/updateBooking',
  async (args: { id: string; payload: BookingPayload }, { rejectWithValue }) => {
    try {
      return await updateBookingRequest(args.id, args.payload);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const cancelBooking = createAsyncThunk(
  'bookings/cancelBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      return await cancelBookingRequest(id);
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const deleteBooking = createAsyncThunk(
  'bookings/deleteBooking',
  async (id: string, { rejectWithValue }) => {
    try {
      await deleteBookingRequest(id);
      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const PENDING = [
  createBooking.pending.type,
  updateBooking.pending.type,
  cancelBooking.pending.type,
  deleteBooking.pending.type,
];
const FULFILLED = [
  createBooking.fulfilled.type,
  updateBooking.fulfilled.type,
  cancelBooking.fulfilled.type,
  deleteBooking.fulfilled.type,
];
const REJECTED = [
  createBooking.rejected.type,
  updateBooking.rejected.type,
  cancelBooking.rejected.type,
  deleteBooking.rejected.type,
];

const bookingsSlice = createSlice({
  name: 'bookings',
  initialState,
  reducers: {
    resetBookingsMutation(state) {
      state.mutationStatus = 'idle';
      state.mutationError = null;
    },
    clearCurrentBooking(state) {
      state.current = null;
      state.currentStatus = 'idle';
      state.currentError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBookings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchBookings.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.items = action.payload.data;
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchBookings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = (action.payload as string) ?? 'Failed to load bookings';
      });

    builder
      .addCase(fetchBooking.pending, (state) => {
        state.currentStatus = 'loading';
        state.currentError = null;
        state.current = null;
      })
      .addCase(fetchBooking.fulfilled, (state, action) => {
        state.currentStatus = 'succeeded';
        state.current = action.payload;
      })
      .addCase(fetchBooking.rejected, (state, action) => {
        state.currentStatus = 'failed';
        state.currentError = (action.payload as string) ?? 'Failed to load booking';
      });

    builder
      .addMatcher(
        (action) => PENDING.includes(action.type),
        (state) => {
          state.mutationStatus = 'loading';
          state.mutationError = null;
        },
      )
      .addMatcher(
        (action) => FULFILLED.includes(action.type),
        (state) => {
          state.mutationStatus = 'succeeded';
        },
      )
      .addMatcher(
        (action) => REJECTED.includes(action.type),
        (state, action) => {
          state.mutationStatus = 'failed';
          state.mutationError =
            ((action as { payload?: string }).payload as string) ?? 'Operation failed';
        },
      );
  },
});

export const { resetBookingsMutation, clearCurrentBooking } = bookingsSlice.actions;
export default bookingsSlice.reducer;
