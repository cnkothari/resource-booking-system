import { configureStore } from '@reduxjs/toolkit';
import currentUserReducer from '../features/currentUser/currentUserSlice';
import usersReducer from '../features/users/usersSlice';
import resourcesReducer from '../features/resources/resourcesSlice';
import resourceTypesReducer from '../features/resourceTypes/resourceTypesSlice';
import bookingsReducer from '../features/bookings/bookingsSlice';
import dashboardReducer from '../features/dashboard/dashboardSlice';

export const store = configureStore({
  reducer: {
    currentUser: currentUserReducer,
    users: usersReducer,
    resources: resourcesReducer,
    resourceTypes: resourceTypesReducer,
    bookings: bookingsReducer,
    dashboard: dashboardReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
